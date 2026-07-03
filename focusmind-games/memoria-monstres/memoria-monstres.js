const feedbackOptions = [
  "Torna-ho a provar amb calma.",
  "Observa abans de respondre.",
  "Bona estratègia, revisa el detall.",
  "Respira i prova el següent."
];

const colors = [
  { name: "blau", value: "#55a6df" },
  { name: "lila", value: "#a08de8" },
  { name: "verd menta", value: "#6ecfba" },
  { name: "corall", value: "#ff8f86" },
  { name: "groc suau", value: "#f4d58d" },
  { name: "turquesa", value: "#5cc7c7" }
];
const sizes = [
  { name: "petit", width: 74, height: 82 },
  { name: "mitjà", width: 88, height: 98 },
  { name: "gran", width: 104, height: 116 }
];
const shapes = ["round", "square", "tall"];
const patterns = ["llis", "spotted", "striped"];
const names = ["Niu", "Momo", "Tuki", "Lala", "Biru", "Nona", "Pipo", "Kora", "Sami", "Duna"];

const config = {
  1: { rounds: 6, monsters: 2, observeMs: 3200, points: 12, questionAttrs: 1 },
  2: { rounds: 7, monsters: 3, observeMs: 3800, points: 16, questionAttrs: 2 },
  3: { rounds: 8, monsters: 4, observeMs: 4500, points: 20, questionAttrs: 2 }
};

const state = {
  level: 1, points: 0, correct: 0, attempts: 0, round: 0,
  monsters: [], answer: null, timeout: null, acceptingInput: false
};

const startScreen = document.getElementById("start-screen");
const playScreen = document.getElementById("play-screen");
const endScreen = document.getElementById("end-screen");
const stage = document.getElementById("monster-stage");
const questionPanel = document.getElementById("question-panel");
const questionText = document.getElementById("question-text");
const choices = document.getElementById("choices");
const feedback = document.getElementById("feedback");
const phaseLabel = document.getElementById("phase-label");
const statLevel = document.getElementById("stat-level");
const statPoints = document.getElementById("stat-points");
const statRound = document.getElementById("stat-round");
const statAccuracy = document.getElementById("stat-accuracy");

document.querySelectorAll(".level-option").forEach((button) => {
  button.addEventListener("click", () => {
    state.level = Number(button.dataset.level);
    document.querySelectorAll(".level-option").forEach((option) => {
      const selected = option === button;
      option.classList.toggle("selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
  });
});

document.getElementById("start-button").addEventListener("click", startGame);
document.getElementById("restart-button").addEventListener("click", startGame);

function startGame() {
  clearTimeout(state.timeout);
  state.points = 0; state.correct = 0; state.attempts = 0; state.round = 0;
  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  playScreen.classList.remove("hidden");
  nextRound();
}

function nextRound() {
  if (state.round >= config[state.level].rounds) return finishGame();
  state.round += 1;
  state.acceptingInput = false;
  questionPanel.classList.add("hidden");
  stage.classList.remove("hidden");
  phaseLabel.textContent = "Observa els monstres";
  state.monsters = createMonsterSet(config[state.level].monsters);
  renderMonsters(state.monsters);
  updateStats();
  setFeedback("Observa color, ulls, banyes, mida i patró.");
  state.timeout = setTimeout(showQuestion, config[state.level].observeMs);
}

function createMonsterSet(count) {
  const used = new Set();
  const monsters = [];
  let guard = 0;
  while (monsters.length < count && guard < 500) {
    guard += 1;
    const monster = {
      name: names[(state.round + monsters.length + Math.floor(Math.random() * names.length)) % names.length],
      color: pick(colors),
      eyes: 1 + Math.floor(Math.random() * 4),
      horns: Math.floor(Math.random() * 4),
      size: pick(sizes),
      shape: pick(shapes),
      pattern: pick(patterns)
    };
    const id = `${monster.color.name}-${monster.eyes}-${monster.horns}-${monster.size.name}-${monster.shape}-${monster.pattern}`;
    if (!used.has(id)) {
      used.add(id);
      monsters.push(monster);
    }
  }
  return monsters;
}

function renderMonsters(monsters) {
  stage.innerHTML = "";
  monsters.forEach((monster) => {
    const card = document.createElement("article");
    card.className = "monster-card";
    card.appendChild(drawMonster(monster));
    const label = document.createElement("div");
    label.className = "monster-name";
    label.textContent = monster.name;
    card.appendChild(label);
    stage.appendChild(card);
  });
}

function drawMonster(monster) {
  const element = document.createElement("div");
  element.className = `monster ${monster.shape} ${monster.pattern}`;
  element.style.setProperty("--monster-color", monster.color.value);
  element.style.setProperty("--monster-width", `${monster.size.width}px`);
  element.style.setProperty("--monster-height", `${monster.size.height}px`);
  ["left", "center", "right"].slice(0, monster.horns).forEach((position) => {
    const horn = document.createElement("span");
    horn.className = `horn ${position}`;
    element.appendChild(horn);
  });
  const eyeRow = document.createElement("div");
  eyeRow.className = "eye-row";
  for (let i = 0; i < monster.eyes; i++) {
    const eye = document.createElement("span");
    eye.className = "eye";
    eyeRow.appendChild(eye);
  }
  const mouth = document.createElement("span");
  mouth.className = "mouth";
  const leftArm = document.createElement("span");
  leftArm.className = "arm left";
  const rightArm = document.createElement("span");
  rightArm.className = "arm right";
  const leftFoot = document.createElement("span");
  leftFoot.className = "foot left";
  const rightFoot = document.createElement("span");
  rightFoot.className = "foot right";
  element.appendChild(leftArm);
  element.appendChild(rightArm);
  element.appendChild(eyeRow);
  element.appendChild(mouth);
  element.appendChild(leftFoot);
  element.appendChild(rightFoot);
  return element;
}

function showQuestion() {
  stage.classList.add("hidden");
  questionPanel.classList.remove("hidden");
  phaseLabel.textContent = "Recorda el monstre";
  const target = pick(state.monsters);
  const attrs = chooseQuestionAttributes(target);
  state.answer = target;
  questionText.textContent = `Quin monstre tenia ${attrs.join(" i ")}?`;
  renderChoices(target);
  state.acceptingInput = true;
  setFeedback("Tria amb calma.");
}

function chooseQuestionAttributes(monster) {
  const options = [
    `${monster.eyes} ${monster.eyes === 1 ? "ull" : "ulls"}`,
    `color ${monster.color.name}`,
    `${monster.horns} ${monster.horns === 1 ? "banya" : "banyes"}`,
    `mida ${monster.size.name}`,
    `patró ${monster.pattern === "llis" ? "llis" : monster.pattern === "spotted" ? "amb punts" : "amb ratlles"}`
  ];
  return shuffle(options).slice(0, config[state.level].questionAttrs);
}

function renderChoices(target) {
  choices.innerHTML = "";
  const options = shuffle([...state.monsters]);
  options.forEach((monster) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.type = "button";
    button.textContent = `${monster.name}: ${monster.color.name}, ${monster.eyes} ulls, ${monster.horns} banyes, ${monster.size.name}`;
    button.addEventListener("click", () => answer(monster === target));
    choices.appendChild(button);
  });
}

function answer(ok) {
  if (!state.acceptingInput) return;
  state.acceptingInput = false;
  state.attempts += 1;
  if (ok) {
    state.correct += 1;
    state.points += config[state.level].points;
    setFeedback("Ben recordat. Has recuperat el detall.");
  } else {
    setFeedback(feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]);
  }
  updateStats();
  state.timeout = setTimeout(nextRound, ok ? 760 : 1100);
}

function finishGame() {
  clearTimeout(state.timeout);
  playScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");
  document.getElementById("end-accuracy").textContent = `${getAccuracy()}%`;
  document.getElementById("end-points").textContent = state.points;
  document.getElementById("end-rounds").textContent = state.round;
}

function updateStats() {
  statLevel.textContent = state.level;
  statPoints.textContent = state.points;
  statRound.textContent = `${state.round}/${config[state.level].rounds}`;
  statAccuracy.textContent = `${getAccuracy()}%`;
}
function getAccuracy() { return state.attempts ? Math.round((state.correct / state.attempts) * 100) : 100; }
function pick(items) { return items[Math.floor(Math.random() * items.length)]; }
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function setFeedback(message) { feedback.textContent = message; }
