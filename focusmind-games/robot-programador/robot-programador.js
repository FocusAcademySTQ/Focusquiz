const feedbackOptions = [
  "Torna-ho a provar amb calma.",
  "Observa el camí abans d'executar.",
  "Bona estratègia, revisa el detall.",
  "Respira i ajusta el programa."
];

const config = {
  1: { size: 5, rounds: 6, blocks: 2, waters: 0, maxCommands: 14, points: 18 },
  2: { size: 6, rounds: 7, blocks: 5, waters: 2, maxCommands: 18, points: 22 },
  3: { size: 7, rounds: 8, blocks: 8, waters: 4, maxCommands: 22, points: 26 }
};

const directions = ["up", "right", "down", "left"];
const deltas = { up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1] };
const labels = { forward: "Avança", right: "Gira dreta", left: "Gira esquerra", jump: "Salta", repeat: "Repeteix l'anterior" };

const state = {
  level: 1, points: 0, attempts: 0, solved: 0, round: 0, running: false,
  size: 5, robot: null, start: null, goal: null, blocks: new Set(), waters: new Set(), program: []
};

const startScreen = document.getElementById("start-screen");
const playScreen = document.getElementById("play-screen");
const endScreen = document.getElementById("end-screen");
const board = document.getElementById("board");
const programList = document.getElementById("program-list");
const feedback = document.getElementById("feedback");
const statLevel = document.getElementById("stat-level");
const statPoints = document.getElementById("stat-points");
const statRound = document.getElementById("stat-round");
const statSteps = document.getElementById("stat-steps");

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

document.querySelectorAll("[data-command]").forEach((button) => button.addEventListener("click", () => addCommand(button.dataset.command)));
document.getElementById("start-button").addEventListener("click", startGame);
document.getElementById("restart-button").addEventListener("click", startGame);
document.getElementById("run-button").addEventListener("click", runProgram);
document.getElementById("undo-button").addEventListener("click", () => { state.program.pop(); renderProgram(); });
document.getElementById("clear-button").addEventListener("click", () => { state.program = []; renderProgram(); });

function startGame() {
  state.points = 0; state.attempts = 0; state.solved = 0; state.round = 0; state.program = [];
  startScreen.classList.add("hidden");
  endScreen.classList.add("hidden");
  playScreen.classList.remove("hidden");
  nextChallenge();
}

function nextChallenge() {
  if (state.round >= config[state.level].rounds) return finishGame();
  state.round += 1;
  state.program = [];
  generateMap();
  renderBoard();
  renderProgram();
  updateStats();
  setFeedback("Programa el robot fins a la meta.");
}

function generateMap() {
  const c = config[state.level];
  state.size = c.size;
  state.blocks = new Set();
  state.waters = new Set();
  const startSide = Math.floor(Math.random() * 4);
  const endSide = (startSide + 2) % 4;
  state.start = edgeCell(startSide);
  state.goal = edgeCell(endSide);
  state.robot = { ...state.start, dir: directions[Math.floor(Math.random() * directions.length)] };
  const protectedCells = pathBetween(state.start, state.goal);
  placeItems(state.blocks, c.blocks, protectedCells);
  placeItems(state.waters, c.waters, protectedCells);
}

function edgeCell(side) {
  const n = state.size - 1;
  const mid = Math.floor(Math.random() * state.size);
  if (side === 0) return { row: 0, col: mid };
  if (side === 1) return { row: mid, col: n };
  if (side === 2) return { row: n, col: mid };
  return { row: mid, col: 0 };
}

function pathBetween(a, b) {
  const cells = new Set([key(a.row, a.col), key(b.row, b.col)]);
  let row = a.row, col = a.col;
  while (row !== b.row) { row += Math.sign(b.row - row); cells.add(key(row, col)); }
  while (col !== b.col) { col += Math.sign(b.col - col); cells.add(key(row, col)); }
  return cells;
}

function placeItems(targetSet, count, protectedCells) {
  let guard = 0;
  while (targetSet.size < count && guard < 300) {
    guard += 1;
    const row = Math.floor(Math.random() * state.size);
    const col = Math.floor(Math.random() * state.size);
    const id = key(row, col);
    if (!protectedCells.has(id) && !state.blocks.has(id) && !state.waters.has(id)) targetSet.add(id);
  }
}

function renderBoard() {
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${state.size}, 1fr)`;
  for (let row = 0; row < state.size; row++) {
    for (let col = 0; col < state.size; col++) {
      const tile = document.createElement("div");
      const id = key(row, col);
      tile.className = "tile path";
      if (state.blocks.has(id)) tile.className = "tile block";
      if (state.waters.has(id)) tile.className = "tile water";
      if (row === state.goal.row && col === state.goal.col) tile.className = "tile goal";
      if (row === state.robot.row && col === state.robot.col) {
        const robot = document.createElement("div");
        robot.className = `robot ${state.robot.dir}`;
        robot.innerHTML = '<span class="robot-eye"></span><span class="robot-core"></span>';
        tile.appendChild(robot);
      }
      board.appendChild(tile);
    }
  }
}

function addCommand(command) {
  if (state.running || state.program.length >= config[state.level].maxCommands) return;
  if (command === "repeat" && state.program.length === 0) {
    setFeedback("Primer afegeix una instrucció per poder repetir-la.");
    return;
  }
  state.program.push(command);
  renderProgram();
  updateStats();
}

function renderProgram() {
  programList.innerHTML = "";
  state.program.forEach((command) => {
    const item = document.createElement("li");
    item.textContent = labels[command];
    programList.appendChild(item);
  });
}

async function runProgram() {
  if (state.running || state.program.length === 0) return;
  state.running = true;
  setControls(false);
  state.attempts += 1;
  const original = { ...state.robot };
  const expanded = expandProgram(state.program);
  let ok = false;
  for (const command of expanded) {
    applyCommand(command);
    renderBoard();
    await wait(260);
    if (isGoal()) { ok = true; break; }
  }
  if (ok) {
    state.solved += 1;
    state.points += Math.max(5, config[state.level].points - Math.max(0, state.program.length - 6));
    setFeedback("Has arribat a la meta. Bona planificació.");
    state.running = false;
    setControls(true);
    updateStats();
    setTimeout(nextChallenge, 800);
  } else {
    state.robot = original;
    renderBoard();
    setFeedback(feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]);
    state.running = false;
    setControls(true);
    updateStats();
  }
}

function expandProgram(program) {
  const expanded = [];
  program.forEach((command) => {
    if (command === "repeat" && expanded.length) expanded.push(expanded[expanded.length - 1]);
    else if (command !== "repeat") expanded.push(command);
  });
  return expanded;
}

function applyCommand(command) {
  if (command === "right" || command === "left") {
    const turn = command === "right" ? 1 : -1;
    state.robot.dir = directions[(directions.indexOf(state.robot.dir) + turn + 4) % 4];
    return;
  }
  const distance = command === "jump" ? 2 : 1;
  const [dr, dc] = deltas[state.robot.dir];
  const next = { row: state.robot.row + dr * distance, col: state.robot.col + dc * distance };
  const middle = { row: state.robot.row + dr, col: state.robot.col + dc };
  if (!inside(next.row, next.col)) return;
  if (command === "forward" && (state.blocks.has(key(next.row, next.col)) || state.waters.has(key(next.row, next.col)))) return;
  if (command === "jump" && state.blocks.has(key(next.row, next.col))) return;
  if (command === "jump" && state.waters.has(key(middle.row, middle.col))) {
    state.robot.row = next.row; state.robot.col = next.col; return;
  }
  if (command === "jump" && !state.blocks.has(key(middle.row, middle.col))) return;
  state.robot.row = next.row; state.robot.col = next.col;
}

function setControls(enabled) {
  document.querySelectorAll("button").forEach((button) => {
    if (!button.classList.contains("level-option")) button.disabled = !enabled;
  });
}

function isGoal() { return state.robot.row === state.goal.row && state.robot.col === state.goal.col; }
function inside(row, col) { return row >= 0 && col >= 0 && row < state.size && col < state.size; }
function key(row, col) { return `${row},${col}`; }
function updateStats() {
  statLevel.textContent = state.level;
  statPoints.textContent = state.points;
  statRound.textContent = `${state.round}/${config[state.level].rounds}`;
  statSteps.textContent = `${state.program.length}/${config[state.level].maxCommands}`;
}
function finishGame() {
  playScreen.classList.add("hidden");
  endScreen.classList.remove("hidden");
  const accuracy = state.attempts ? Math.round((state.solved / state.attempts) * 100) : 0;
  document.getElementById("end-accuracy").textContent = `${accuracy}%`;
  document.getElementById("end-points").textContent = state.points;
  document.getElementById("end-rounds").textContent = state.solved;
}
function setFeedback(message) { feedback.textContent = message; }
function wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
