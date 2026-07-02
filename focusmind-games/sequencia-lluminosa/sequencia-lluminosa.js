const feedbackOptions = [
  "Torna-ho a provar amb calma.",
  "Observa abans de respondre.",
  "Bona estratègia, revisa el detall.",
  "Respira i prova el següent."
];

const config = {
  1: { size: 3, rounds: 6, speed: 580 },
  2: { size: 3, rounds: 7, speed: 460 },
  3: { size: 4, rounds: 8, speed: 430 }
};

const state = {
  level: 1,
  points: 0,
  correct: 0,
  attempts: 0,
  round: 0,
  sequence: [],
  inputIndex: 0,
  acceptingInput: false
};

const startScreen = document.getElementById("start-screen");
const playScreen = document.getElementById("play-screen");
const endScreen = document.getElementById("end-screen");
const board = document.getElementById("board");
const feedback = document.getElementById("feedback");
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
  state.points = 0;
  state.correct = 0;
  state.attempts = 0;
  state.round = 0;
  state.sequence = [];
  state.inputIndex = 0;
  state.acceptingInput = false;

  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  playScreen.classList.remove("hidden");

  buildBoard();
  updateStats();
  setFeedback("Comencem amb calma.");
  nextRound();
}

function buildBoard() {
  const levelConfig = config[state.level];
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${levelConfig.size}, 1fr)`;

  for (let index = 0; index < levelConfig.size * levelConfig.size; index++) {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.type = "button";
    cell.setAttribute("aria-label", `Casella ${index + 1}`);
    cell.addEventListener("click", () => chooseCell(index));
    board.appendChild(cell);
  }
}

function nextRound() {
  const levelConfig = config[state.level];
  if (state.round >= levelConfig.rounds) {
    finishGame();
    return;
  }

  state.round += 1;
  state.inputIndex = 0;
  state.acceptingInput = false;
  state.sequence.push(Math.floor(Math.random() * board.children.length));

  updateStats();
  setFeedback("Observa la seqüència.");
  showSequence();
}

async function showSequence() {
  const cells = [...board.children];
  await wait(420);

  for (const index of state.sequence) {
    cells[index].classList.add("active");
    await wait(config[state.level].speed);
    cells[index].classList.remove("active");
    await wait(180);
  }

  state.acceptingInput = true;
  setFeedback("Ara repeteix-la amb calma.");
}

function chooseCell(index) {
  if (!state.acceptingInput) return;

  const ok = index === state.sequence[state.inputIndex];
  state.attempts += 1;

  if (!ok) {
    state.acceptingInput = false;
    setFeedback(randomFeedback());
    updateStats();
    setTimeout(nextRound, 900);
    return;
  }

  state.correct += 1;
  state.points += 12;
  board.children[index].classList.add("selected");
  setTimeout(() => board.children[index].classList.remove("selected"), 220);
  state.inputIndex += 1;
  updateStats();

  if (state.inputIndex === state.sequence.length) {
    state.acceptingInput = false;
    setFeedback("Seqüència completada. Respira i seguim.");
    setTimeout(nextRound, 850);
  }
}

function finishGame() {
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

function getAccuracy() {
  if (state.attempts === 0) return 100;
  return Math.round((state.correct / state.attempts) * 100);
}

function setFeedback(message) {
  feedback.textContent = message;
}

function randomFeedback() {
  return feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)];
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
