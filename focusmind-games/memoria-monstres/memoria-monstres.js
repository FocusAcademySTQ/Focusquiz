const colors = [
  { name: "blau", value: "#55a6df" },
  { name: "lila", value: "#a08de8" },
  { name: "verd menta", value: "#6ecfba" },
  { name: "corall", value: "#ff8f86" },
  { name: "groc suau", value: "#f4d58d" },
  { name: "turquesa", value: "#5cc7c7" }
];
const sizes = [
  { name: "petita", width: 74, height: 82 },
  { name: "mitjana", width: 88, height: 98 },
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
const playArea = phaseLabel.closest(".play-area");
const timer = document.querySelector(".observation-timer");
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
  setPhase("observe", "Observa");
  state.monsters = createMonsterSet(config[state.level].monsters);
  renderMonsters(state.monsters);
  updateStats();
  setFeedback("Recorda el nom i els detalls de cada monstre.");
  phaseLabel.focus();
  const duration = config[state.level].observeMs;
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    timer.getAnimations().forEach(animation => animation.cancel());
    timer.animate([{ transform: "scaleX(1)" }, { transform: "scaleX(0)" }], duration);
  }
  state.timeout = setTimeout(showQuestion, duration);
}

function createMonsterSet(count) {
  const roundNames = shuffle(names);
  return shuffle(colors).slice(0, count).map((color, index) => ({
    name: roundNames[index],
    color,
    eyes: 1 + Math.floor(Math.random() * 4),
    horns: Math.floor(Math.random() * 4),
    size: pick(sizes),
    shape: pick(shapes),
    pattern: pick(patterns)
  }));
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
  element.setAttribute("role", "img");
  element.setAttribute("aria-label", monsterAttributes(monster).join(", "));
  const hornPositions = [[], ["center"], ["left", "right"], ["left", "center", "right"]];
  hornPositions[monster.horns].forEach((position) => {
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
  setPhase("answer", "Respon");
  const target = pick(state.monsters);
  const attrs = chooseQuestionAttributes(target);
  state.answer = target;
  questionText.textContent = `Quin monstre tenia ${attrs.join(" i ")}?`;
  renderChoices(target);
  state.acceptingInput = true;
  setFeedback("Tria el nom del monstre.");
  questionText.focus();
}

function monsterAttributes(monster) {
  return [
    `${monster.eyes} ${monster.eyes === 1 ? "ull" : "ulls"}`,
    `color ${monster.color.name}`,
    `${monster.horns} ${monster.horns === 1 ? "banya" : "banyes"}`,
    `mida ${monster.size.name}`,
    `${monster.pattern === "llis" ? "pell llisa" : monster.pattern === "spotted" ? "punts" : "ratlles"}`,
    `forma ${{ round: "rodona", square: "quadrada", tall: "allargada" }[monster.shape]}`
  ];
}

function chooseQuestionAttributes(monster) {
  const attributes = monsterAttributes(monster);
  const otherAttributes = state.monsters.filter(other => other !== monster).map(monsterAttributes);
  const candidates = config[state.level].questionAttrs === 1
    ? attributes.map(attribute => [attribute])
    : attributes.flatMap((attribute, index) => attributes.slice(index + 1).map(second => [attribute, second]));
  return pick(candidates.filter(clues =>
    otherAttributes.every(other => !clues.every(clue => other.includes(clue)))
  ));
}

function renderChoices(target) {
  choices.innerHTML = "";
  const options = shuffle([...state.monsters]);
  options.forEach((monster) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.type = "button";
    button.textContent = monster.name;
    button.addEventListener("click", () => answer(monster === target, button));
    choices.appendChild(button);
  });
}

function answer(ok, button) {
  if (!state.acceptingInput) return;
  state.acceptingInput = false;
  state.attempts += 1;
  setPhase("review", ok ? "Correcte!" : "Revisa la resposta");
  for (const option of choices.children) {
    option.setAttribute("aria-disabled", "true");
    if (option.textContent === state.answer.name) option.dataset.result = "correct";
  }
  if (!ok) button.dataset.result = "incorrect";
  if (ok) {
    state.correct += 1;
    state.points += config[state.level].points;
    setFeedback("Ben recordat. Has recuperat el detall.");
  } else {
    setFeedback(`La resposta era ${state.answer.name}.`);
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
  document.getElementById("restart-button").focus();
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
function setPhase(phase, label) {
  playArea.dataset.phase = phase;
  phaseLabel.textContent = label;
}
function setFeedback(message) { feedback.textContent = message; }
