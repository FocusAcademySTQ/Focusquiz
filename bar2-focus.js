(function () {
  "use strict";

  const TOTAL_CLIENTS = 8;

  const coffeeTypes = [
    { id: "sol", label: "caf\u00e8 sol" },
    { id: "llet", label: "caf\u00e8 amb llet" },
    { id: "tallat", label: "tallat" },
    { id: "america", label: "americ\u00e0" },
    { id: "descafeinat", label: "descafe\u00efnat" }
  ];

  const extraLabels = {
    sucre: "sucre",
    "sense-sucre": "sense sucre",
    gel: "gel",
    doble: "doble",
    "llet-vegetal": "llet vegetal"
  };

  const clients = ["Noa", "Pau", "Laia", "Biel", "Ona", "Jan", "Aran", "Ivet"];
  const positiveFeedback = [
    "Correcte. Has seguit tota la comanda.",
    "Bona atenci\u00f3 als detalls.",
    "Has recordat b\u00e9 els extres.",
    "Preparaci\u00f3 precisa i ben revisada."
  ];

  const state = {
    mode: "practice",
    level: 1,
    round: 0,
    order: null,
    recipe: null,
    cupPlaced: false,
    prepared: false,
    startedAt: 0,
    roundStartedAt: 0,
    timerId: null,
    memoryTimerId: null,
    timeLeft: null,
    served: 0,
    correct: 0,
    totalTime: 0,
    attentionErrors: 0,
    memoryErrors: 0,
    impulsivityErrors: 0
  };

  let initialized = false;

  const el = {
    hub: document.getElementById("hub-screen"),
    openGame: document.getElementById("open-bar2-focus"),
    app: document.getElementById("bar2-focus"),
    backToHub: document.getElementById("back-to-hub"),
    setupPanel: document.getElementById("setup-panel"),
    gamePanel: document.getElementById("game-panel"),
    resultsPanel: document.getElementById("results-panel"),
    startGame: document.getElementById("start-game"),
    clientLabel: document.getElementById("client-label"),
    timerLabel: document.getElementById("timer-label"),
    customerQueue: document.getElementById("customer-queue"),
    clientAvatar: document.getElementById("client-avatar"),
    orderText: document.getElementById("order-text"),
    progressFill: document.getElementById("progress-fill"),
    cup: document.getElementById("cup"),
    dropZone: document.getElementById("cup-drop-zone"),
    placeCup: document.getElementById("place-cup"),
    coffeeLayer: document.getElementById("coffee-layer"),
    waterLayer: document.getElementById("water-layer"),
    milkLayer: document.getElementById("milk-layer"),
    cupExtras: document.getElementById("cup-extras"),
    summary: document.getElementById("selection-summary"),
    clear: document.getElementById("clear-selection"),
    serve: document.getElementById("serve-coffee"),
    stream: document.getElementById("pour-stream"),
    machineLight: document.getElementById("machine-light"),
    feedback: document.getElementById("feedback-panel"),
    accuracy: document.getElementById("accuracy-label"),
    resultsGrid: document.getElementById("results-grid"),
    finalMessage: document.getElementById("final-message"),
    playAgain: document.getElementById("play-again"),
    returnHome: document.getElementById("return-home")
  };

  function registerModule() {
    const moduleInfo = {
      id: "bar2-focus",
      section: "Minijocs Focus",
      title: "Bar2 Focus",
      subtitle: "Prepara caf\u00e8s i entrena l'atenci\u00f3, la mem\u00f2ria i la precisi\u00f3.",
      icon: "coffee",
      mount: init
    };

    if (typeof window.addModules === "function") {
      window.addModules([moduleInfo]);
    }

    window.FocusQuizBar2Focus = moduleInfo;
  }

  function init() {
    if (initialized) return;
    initialized = true;
    bindEvents();
    clearSelection();
  }

  function bindEvents() {
    el.openGame.addEventListener("click", showGame);
    el.backToHub.addEventListener("click", showHub);
    el.returnHome.addEventListener("click", showHub);
    el.startGame.addEventListener("click", startGame);
    el.clear.addEventListener("click", clearSelection);
    el.placeCup.addEventListener("click", placeCup);
    el.placeCup.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", "cup");
      el.placeCup.classList.add("is-dragging");
    });
    el.placeCup.addEventListener("dragend", () => el.placeCup.classList.remove("is-dragging"));
    el.serve.addEventListener("click", serveCoffee);
    el.playAgain.addEventListener("click", () => {
      el.resultsPanel.classList.add("is-hidden");
      el.setupPanel.classList.remove("is-hidden");
    });

    document.querySelectorAll(".ingredient, .coffee-spout").forEach((tool) => {
      tool.addEventListener("click", () => useTool(tool.dataset.action));
      tool.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", tool.dataset.action);
        tool.classList.add("is-dragging");
      });
      tool.addEventListener("dragend", () => tool.classList.remove("is-dragging"));
    });

    el.dropZone.addEventListener("dragover", (event) => {
      event.preventDefault();
      el.dropZone.classList.add("is-ready");
    });
    el.dropZone.addEventListener("dragleave", () => el.dropZone.classList.remove("is-ready"));
    el.dropZone.addEventListener("drop", (event) => {
      event.preventDefault();
      el.dropZone.classList.remove("is-ready");
      const action = event.dataTransfer.getData("text/plain");
      if (action === "cup") {
        placeCup();
      } else {
        useTool(action);
      }
    });
  }

  function showGame() {
    el.hub.classList.add("is-hidden");
    el.app.classList.remove("is-hidden");
  }

  function showHub() {
    stopTimers();
    el.app.classList.add("is-hidden");
    el.hub.classList.remove("is-hidden");
    el.gamePanel.classList.add("is-hidden");
    el.resultsPanel.classList.add("is-hidden");
    el.setupPanel.classList.remove("is-hidden");
  }

  function startGame() {
    const form = new FormData(document.createElement("form"));
    document.querySelectorAll("input[name='mode'], input[name='level']").forEach((input) => {
      if (input.checked) form.set(input.name, input.value);
    });

    Object.assign(state, {
      mode: form.get("mode") || "practice",
      level: Number(form.get("level") || 1),
      round: 0,
      order: null,
      prepared: false,
      startedAt: Date.now(),
      roundStartedAt: 0,
      served: 0,
      correct: 0,
      totalTime: 0,
      attentionErrors: 0,
      memoryErrors: 0,
      impulsivityErrors: 0
    });

    el.app.classList.toggle("level-4", state.level === 4);
    el.setupPanel.classList.add("is-hidden");
    el.resultsPanel.classList.add("is-hidden");
    el.gamePanel.classList.remove("is-hidden");
    setFeedback("Preparat. Mira la comanda.", "Posa una tassa, afegeix els ingredients i serveix.", false);
    updateAccuracy();
    nextRound();
  }

  function nextRound() {
    stopTimers();

    if (state.round >= TOTAL_CLIENTS) {
      finishGame();
      return;
    }

    state.round += 1;
    state.order = createOrder(state.level, state.round);
    state.roundStartedAt = Date.now();
    clearSelection();
    el.clientLabel.textContent = `${clients[(state.round - 1) % clients.length]} · Client ${state.round} de ${TOTAL_CLIENTS}`;
    el.clientAvatar.dataset.variant = String((state.round - 1) % 4);
    el.orderText.textContent = state.order.text;
    el.orderText.style.visibility = "visible";
    el.progressFill.style.width = `${((state.round - 1) / TOTAL_CLIENTS) * 100}%`;
    renderCustomerQueue();

    if (state.mode === "memory" || state.level === 4) {
      el.timerLabel.textContent = "Memoritza: 4 s";
      state.memoryTimerId = window.setTimeout(() => {
        el.orderText.style.visibility = "hidden";
        el.timerLabel.textContent = "Comanda amagada";
      }, 4000);
    } else if (state.mode === "speed") {
      startSpeedTimer();
    } else {
      el.timerLabel.textContent = "Sense temps";
    }
  }

  function startSpeedTimer() {
    state.timeLeft = Math.max(10, 22 - state.level * 2 - Math.floor(state.round / 2));
    el.timerLabel.textContent = `${state.timeLeft} s`;
    state.timerId = window.setInterval(() => {
      state.timeLeft -= 1;
      el.timerLabel.textContent = `${state.timeLeft} s`;
      if (state.timeLeft <= 0) {
        stopTimers();
        state.impulsivityErrors += 1;
        state.served += 1;
        state.totalTime += Math.round((Date.now() - state.roundStartedAt) / 1000);
        setFeedback("Temps esgotat.", "Has de preparar amb ritme, pero sense saltar passos.", true);
        window.setTimeout(nextRound, 1100);
      }
    }, 1000);
  }

  function createRecipe() {
    return {
      shots: 0,
      decaf: false,
      milk: 0,
      veggieMilk: false,
      water: false,
      sugar: false,
      noSugar: false,
      ice: false
    };
  }

  function useTool(action) {
    if (!state.recipe) return;
    if (!state.cupPlaced) {
      state.impulsivityErrors += 1;
      setFeedback("Primer cal posar una tassa.", "Agafa una tassa neta i posa-la sota la maquina.", true);
      return;
    }

    const addsCoffee = action === "shot" || action === "decaf";

    if (action === "shot") state.recipe.shots = Math.min(2, state.recipe.shots + 1);
    if (action === "decaf") {
      state.recipe.decaf = true;
      state.recipe.shots = Math.max(1, state.recipe.shots);
    }
    if (action === "milk-small") state.recipe.milk = Math.max(state.recipe.milk, 1);
    if (action === "milk-big") state.recipe.milk = 2;
    if (action === "veggie-milk") {
      state.recipe.veggieMilk = true;
      state.recipe.milk = 2;
    }
    if (action === "water") state.recipe.water = true;
    if (action === "sugar") {
      state.recipe.sugar = true;
      state.recipe.noSugar = false;
    }
    if (action === "no-sugar") {
      state.recipe.noSugar = true;
      state.recipe.sugar = false;
    }
    if (action === "ice") state.recipe.ice = true;

    pulseTool(action);
    animateIngredient(action);
    drawCup();
    updateSummary();

    if (state.recipe.shots > 0) {
      state.prepared = true;
      el.serve.disabled = false;
      el.cup.classList.add("prepared");
      el.machineLight.classList.add("is-on");
      if (addsCoffee) {
        el.stream.classList.add("is-pouring");
        window.setTimeout(() => el.stream.classList.remove("is-pouring"), 650);
      }
      setFeedback("Tassa preparada.", "Ja la pots servir si coincideix amb la comanda.", false);
    } else {
      setFeedback("Ingredient afegit.", "Encara falta una carrega de cafe.", false);
    }
  }

  function serveCoffee() {
    if (!state.prepared) {
      state.impulsivityErrors += 1;
      setFeedback("Encara falta cafe.", "Posa una carrega normal o descafeinada abans de servir.", true);
      return;
    }

    stopTimers();
    const result = evaluateSelection();
    const seconds = Math.round((Date.now() - state.roundStartedAt) / 1000);
    state.served += 1;
    state.totalTime += seconds;

    if (result.correct) {
      state.correct += 1;
      setFeedback(randomItem(positiveFeedback), "Client satisfet. Passem al seg\u00fcent.", false);
    } else {
      if (state.mode === "memory" || state.level === 4 || el.orderText.style.visibility === "hidden") {
        state.memoryErrors += 1;
      } else {
        state.attentionErrors += 1;
      }
      setFeedback(result.title, result.detail, true);
    }

    updateAccuracy();
    el.progressFill.style.width = `${(state.round / TOTAL_CLIENTS) * 100}%`;
    window.setTimeout(nextRound, 1400);
  }

  function evaluateSelection() {
    const made = inferMadeDrink();
    const selectedExtras = inferExtras().sort();
    const expectedExtras = [...state.order.extras].sort();

    if (made !== state.order.type) {
      return {
        correct: false,
        title: "La recepta base no coincideix.",
        detail: `La comanda demanava ${getType(state.order.type).label}. Revisa c\u00e0rrega, llet i aigua.`
      };
    }

    const missing = expectedExtras.filter((extra) => !selectedExtras.includes(extra));
    if (missing.length) {
      return {
        correct: false,
        title: `Faltava: ${extraLabels[missing[0]]}.`,
        detail: "Mira els detalls petits de la comanda abans de servir."
      };
    }

    const added = selectedExtras.filter((extra) => !expectedExtras.includes(extra));
    if (added.length) {
      return {
        correct: false,
        title: `Hi has posat ${extraLabels[added[0]]}, pero no tocava.`,
        detail: "La precisio tambe es no afegir ingredients de mes."
      };
    }

    return { correct: true };
  }

  function inferMadeDrink() {
    if (state.recipe.decaf) return "descafeinat";
    if (state.recipe.water && state.recipe.milk === 0) return "america";
    if (state.recipe.milk >= 2) return "llet";
    if (state.recipe.milk === 1) return "tallat";
    return "sol";
  }

  function inferExtras() {
    const selected = [];
    if (state.recipe.shots >= 2) selected.push("doble");
    if (state.recipe.sugar) selected.push("sucre");
    if (state.recipe.noSugar) selected.push("sense-sucre");
    if (state.recipe.ice) selected.push("gel");
    if (state.recipe.veggieMilk) selected.push("llet-vegetal");
    return selected;
  }

  function createOrder(level, round) {
    const typeLimit = level === 1 ? 3 : coffeeTypes.length;
    const type = coffeeTypes[(round + Math.floor(Math.random() * typeLimit)) % typeLimit];
    const wantedExtras = [];

    if (level >= 2) wantedExtras.push(pickExtra(wantedExtras, level));
    if (level >= 3) wantedExtras.push(pickExtra(wantedExtras, level));
    if (level >= 4 && Math.random() > 0.55) wantedExtras.push(pickExtra(wantedExtras, level));

    return {
      type: type.id,
      extras: wantedExtras,
      text: buildOrderText(type, wantedExtras)
    };
  }

  function pickExtra(current, level) {
    const pool = level < 4
      ? ["sucre", "sense-sucre", "gel", "doble"]
      : ["sucre", "sense-sucre", "gel", "doble", "llet-vegetal"];
    const available = pool.filter((extra) => !current.includes(extra) && !conflicts(extra, current));
    return available[Math.floor(Math.random() * available.length)];
  }

  function conflicts(extraId, current) {
    return (extraId === "sucre" && current.includes("sense-sucre")) ||
      (extraId === "sense-sucre" && current.includes("sucre"));
  }

  function buildOrderText(type, wantedExtras) {
    const fragments = wantedExtras.map((extraId) => {
      if (extraId === "sense-sucre") return "sense sucre";
      if (extraId === "llet-vegetal") return "amb llet vegetal";
      return `amb ${extraLabels[extraId]}`;
    });

    const suffix = fragments.length ? ` ${fragments.join(" i ")}` : "";
    return `Vull un ${type.label}${suffix}.`;
  }

  function clearSelection() {
    state.recipe = createRecipe();
    state.cupPlaced = false;
    state.prepared = false;
    el.serve.disabled = true;
    el.cup.classList.remove("prepared");
    el.dropZone.classList.add("no-cup");
    el.placeCup.disabled = false;
    el.placeCup.classList.remove("is-used");
    el.machineLight.classList.remove("is-on");
    el.stream.classList.remove("is-pouring");
    drawCup();
    updateSummary();
  }

  function placeCup() {
    state.cupPlaced = true;
    state.prepared = false;
    el.serve.disabled = false;
    el.dropZone.classList.remove("no-cup");
    el.placeCup.disabled = true;
    el.placeCup.classList.add("is-used");
    setFeedback("Tassa al seu lloc.", "Ara pots afegir cafe, llet, aigua o extres.", false);
    updateSummary();
  }

  function drawCup() {
    const recipe = state.recipe || createRecipe();
    const hasCoffee = recipe.shots > 0;
    const coffeeHeight = hasCoffee ? Math.min(46, 22 + recipe.shots * 12) : 0;
    const waterHeight = recipe.water ? 18 : 0;
    const milkHeight = recipe.milk === 2 ? 34 : recipe.milk === 1 ? 14 : 0;

    el.coffeeLayer.style.height = `${coffeeHeight}%`;
    el.coffeeLayer.classList.toggle("is-decaf", recipe.decaf);
    el.waterLayer.style.height = `${waterHeight}%`;
    el.waterLayer.style.bottom = `${coffeeHeight}%`;
    el.milkLayer.style.height = `${milkHeight}%`;
    el.milkLayer.style.bottom = `${coffeeHeight + waterHeight}%`;
    el.milkLayer.classList.toggle("is-veggie", recipe.veggieMilk);

    el.cupExtras.innerHTML = "";
    if (recipe.sugar) addChip("extra-sugar");
    if (recipe.noSugar) addChip("extra-nosugar");
    if (recipe.ice) addChip("extra-ice");
    if (recipe.shots >= 2) addChip("extra-double");
  }

  function addChip(className) {
    const chip = document.createElement("span");
    chip.className = `extra-chip ${className}`;
    el.cupExtras.appendChild(chip);
  }

  function updateSummary() {
    if (!state.cupPlaced) {
      el.summary.textContent = "posa una tassa sota la maquina";
      return;
    }
    const made = inferMadeDrink();
    const extras = inferExtras().map((id) => extraLabels[id]);
    const base = state.recipe.shots ? getType(made).label : "tassa buida";
    el.summary.textContent = extras.length ? `${base} · ${extras.join(", ")}` : base;
  }

  function pulseTool(action) {
    const tool = document.querySelector(`[data-action="${action}"]`);
    if (!tool) return;
    tool.classList.remove("was-used");
    void tool.offsetWidth;
    tool.classList.add("was-used");
  }

  function animateIngredient(action) {
    const effectMap = {
      shot: "coffee-drop",
      decaf: "coffee-drop",
      "milk-small": "milk-drop",
      "milk-big": "milk-drop",
      "veggie-milk": "milk-drop",
      water: "water-drop",
      sugar: "sugar-drop",
      "no-sugar": "no-sugar-mark",
      ice: "ice-drop"
    };
    const effect = effectMap[action];
    if (!effect) return;
    el.dropZone.classList.remove("coffee-drop", "milk-drop", "water-drop", "sugar-drop", "no-sugar-mark", "ice-drop");
    void el.dropZone.offsetWidth;
    el.dropZone.classList.add(effect);
    window.setTimeout(() => el.dropZone.classList.remove(effect), 700);
  }

  function renderCustomerQueue() {
    const visibleClients = [];
    for (let index = 0; index < 4; index += 1) {
      const roundNumber = state.round + index;
      if (roundNumber > TOTAL_CLIENTS) break;
      visibleClients.push({
        name: clients[(roundNumber - 1) % clients.length],
        roundNumber,
        active: index === 0
      });
    }

    el.customerQueue.innerHTML = visibleClients.map((client) => (
      `<div class="queue-client queue-v${(client.roundNumber - 1) % 4}${client.active ? " is-current" : ""}">
        <span class="mini-face"></span>
        <strong>${client.name}</strong>
        <small>${client.active ? "ara" : client.roundNumber}</small>
      </div>`
    )).join("");
  }

  function finishGame() {
    stopTimers();
    el.gamePanel.classList.add("is-hidden");
    el.resultsPanel.classList.remove("is-hidden");

    const precision = state.served ? Math.round((state.correct / state.served) * 100) : 0;
    const averageTime = state.served ? Math.round(state.totalTime / state.served) : 0;
    const score = Math.max(0, Math.round(
      state.correct * 120 +
      precision * 4 -
      state.attentionErrors * 25 -
      state.memoryErrors * 20 -
      state.impulsivityErrors * 30 -
      Math.max(0, averageTime - 12) * 3
    ));

    const result = {
      joc: "Bar2 Focus",
      mode: modeLabel(state.mode),
      nivell: state.level,
      cafesServits: state.served,
      cafesCorrectes: state.correct,
      precisio: precision,
      tempsMitja: averageTime,
      errorsAtencio: state.attentionErrors,
      errorsMemoria: state.memoryErrors,
      errorsImpulsivitat: state.impulsivityErrors,
      puntuacio: score,
      data: new Date().toISOString(),
      usuariActiu: getActiveUser()
    };

    saveResult(result);
    renderResults(result);
  }

  function renderResults(result) {
    const stats = [
      ["Cafes servits", result.cafesServits],
      ["Cafes correctes", result.cafesCorrectes],
      ["Precisio", `${result.precisio}%`],
      ["Temps mitja", `${result.tempsMitja} s`],
      ["Errors d'atencio", result.errorsAtencio],
      ["Errors de memoria", result.errorsMemoria],
      ["Errors d'impulsivitat", result.errorsImpulsivitat],
      ["Puntuacio", result.puntuacio]
    ];

    el.resultsGrid.innerHTML = stats.map(([label, value]) => (
      `<div class="result-stat"><span>${label}</span><strong>${value}</strong></div>`
    )).join("");

    el.finalMessage.textContent = finalMessage(result);
  }

  function finalMessage(result) {
    if (result.precisio >= 88 && result.errorsMemoria === 0) return "Has mantingut una bona atenci\u00f3 als detalls.";
    if (state.mode === "memory" && result.precisio >= 75) return "Bona mem\u00f2ria de treball.";
    if (result.errorsImpulsivitat > result.errorsAtencio + result.errorsMemoria) return "Has anat r\u00e0pid, per\u00f2 has perdut precisi\u00f3.";
    return "Cal revisar millor abans de servir.";
  }

  function saveResult(result) {
    const existing = readJson("focusquizResults", []);
    existing.push(result);
    localStorage.setItem("focusquizResults", JSON.stringify(existing));

    const cafeOnly = readJson("bar2FocusResults", []);
    cafeOnly.push(result);
    localStorage.setItem("bar2FocusResults", JSON.stringify(cafeOnly));
  }

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function getActiveUser() {
    const keys = ["focusquizActiveUser", "activeUser", "currentUser", "usuariActiu"];
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) return value;
    }
    return null;
  }

  function updateAccuracy() {
    const precision = state.served ? Math.round((state.correct / state.served) * 100) : 100;
    el.accuracy.textContent = `${precision}%`;
  }

  function setFeedback(title, detail, isError) {
    el.feedback.classList.toggle("is-error", isError);
    el.feedback.innerHTML = `<strong>${title}</strong><span>${detail}</span>`;
  }

  function stopTimers() {
    window.clearInterval(state.timerId);
    window.clearTimeout(state.memoryTimerId);
    state.timerId = null;
    state.memoryTimerId = null;
  }

  function getType(id) {
    return coffeeTypes.find((type) => type.id === id);
  }

  function modeLabel(mode) {
    return {
      practice: "Pr\u00e0ctica",
      memory: "Mem\u00f2ria",
      speed: "R\u00e0pid"
    }[mode] || mode;
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  registerModule();
  document.addEventListener("DOMContentLoaded", init);
})();
