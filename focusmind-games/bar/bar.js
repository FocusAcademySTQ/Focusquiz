(() => {
  const KEY = 'focusmind-results-v1';
  const items = [
    { id: 'espresso', label: 'Cafè', emoji: '☕' },
    { id: 'latte', label: 'Cafè amb llet', emoji: '🥛' },
    { id: 'croissant', label: 'Croissant', emoji: '🥐' },
    { id: 'juice', label: 'Suc', emoji: '🧃' },
    { id: 'cake', label: 'Pastís', emoji: '🍰' },
    { id: 'tea', label: 'Te', emoji: '🍵' },
    { id: 'sandwich', label: 'Entrepà', emoji: '🥪' },
    { id: 'water', label: 'Aigua', emoji: '💧' }
  ];

  const $ = (selector) => document.querySelector(selector);
  let state;

  function readResults() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  function saveResult(result) {
    const entry = { id: crypto?.randomUUID?.() || String(Date.now()), date: new Date().toISOString(), ...result };
    localStorage.setItem(KEY, JSON.stringify([entry, ...readResults()].slice(0, 200)));
  }

  function sampleOrder(round) {
    const length = Math.min(6, 2 + Math.floor((round - 1) / 2));
    const pool = items.slice(0, Math.min(items.length, 4 + round));
    return Array.from({ length }, () => pool[Math.floor(Math.random() * pool.length)]);
  }

  function startGame() {
    state = { round: 1, maxRounds: 8, score: 0, correct: 0, wrong: 0, tray: [], order: [], startedAt: Date.now(), roundStartedAt: 0, reactionTimes: [] };
    $('#introPanel').hidden = true;
    $('#gamePanel').hidden = false;
    $('#resultModal').hidden = true;
    nextRound();
  }

  function nextRound() {
    if (state.round > state.maxRounds) return finishGame();
    state.order = sampleOrder(state.round);
    state.tray = [];
    state.roundStartedAt = Date.now();
    updateHud();
    renderOrder(false);
    renderTray();
    renderMenu(true);
    $('#statusText').textContent = 'Observa i memoritza la comanda...';
    const memoryTime = Math.max(1000, 2300 - state.round * 130);
    setTimeout(() => {
      renderOrder(true);
      renderMenu(false);
      $('#statusText').textContent = 'Ara prepara la safata de memòria.';
    }, memoryTime);
  }

  function renderOrder(hidden) {
    $('#orderList').innerHTML = state.order.map((item) => `
      <div class="cafe-item ${hidden ? 'cafe-hidden' : ''}">
        <span class="cafe-emoji">${item.emoji}</span>
        <span>${hidden ? 'Recorda-ho' : item.label}</span>
      </div>
    `).join('');
  }

  function renderTray() {
    $('#trayList').innerHTML = state.tray.length ? state.tray.map((item) => `
      <div class="cafe-item"><span class="cafe-emoji">${item.emoji}</span><span>${item.label}</span></div>
    `).join('') : '<div class="cafe-item">Safata buida</div>';
  }

  function renderMenu(disabled) {
    $('#menuGrid').innerHTML = items.map((item) => `
      <button class="cafe-choice" type="button" data-id="${item.id}" ${disabled ? 'disabled' : ''}>
        <span class="cafe-emoji">${item.emoji}</span>
        <span>${item.label}</span>
      </button>
    `).join('');
  }

  function updateHud() {
    const total = state.correct + state.wrong;
    $('#roundText').textContent = `${Math.min(state.round, state.maxRounds)}/${state.maxRounds}`;
    $('#scoreText').textContent = state.score;
    $('#timeText').textContent = `${((Date.now() - state.startedAt) / 1000).toFixed(1)} s`;
    $('#accuracyText').textContent = `${total ? Math.round((state.correct / total) * 100) : 100}%`;
  }

  function sameOrder(a, b) {
    return a.length === b.length && a.every((item, index) => item.id === b[index].id);
  }

  function serve() {
    if (!state.tray.length) return;
    const elapsed = Date.now() - state.roundStartedAt;
    state.reactionTimes.push(elapsed);
    if (sameOrder(state.order, state.tray)) {
      state.correct += state.order.length;
      state.score += 160 + state.order.length * 35 + Math.max(0, 120 - Math.floor(elapsed / 80));
      $('#statusText').textContent = 'Comanda correcta!';
    } else {
      state.wrong += 1;
      state.score = Math.max(0, state.score - 70);
      $('#statusText').textContent = 'Hi havia algun element fora de lloc.';
    }
    state.round += 1;
    updateHud();
    setTimeout(nextRound, 700);
  }

  function finishGame() {
    const total = state.correct + state.wrong;
    const accuracy = total ? Math.round((state.correct / total) * 100) : 100;
    const averageReactionTime = Math.round(state.reactionTimes.reduce((sum, value) => sum + value, 0) / Math.max(1, state.reactionTimes.length));
    saveResult({
      gameName: 'La Barra',
      cognitiveArea: 'Atenció · Memòria · Velocitat',
      score: state.score,
      correct: state.correct,
      wrong: state.wrong,
      accuracy,
      averageReactionTime
    });
    $('#gamePanel').hidden = true;
    $('#resultMessage').textContent = accuracy >= 85 ? 'Gran servei! Has combinat memòria i rapidesa.' : 'Bona pràctica: mira de fixar-te en l’ordre abans de córrer.';
    $('#resultStats').innerHTML = [
      ['Puntuació', state.score],
      ['Encerts', state.correct],
      ['Errors', state.wrong],
      ['Precisió', `${accuracy}%`]
    ].map(([label, value]) => `<div><strong>${label}</strong><span>${value}</span></div>`).join('');
    $('#resultModal').hidden = false;
  }

  $('#startBtn').addEventListener('click', startGame);
  $('#repeatBtn').addEventListener('click', startGame);
  $('#clearBtn').addEventListener('click', () => { state.tray = []; renderTray(); });
  $('#serveBtn').addEventListener('click', serve);
  $('#menuGrid').addEventListener('click', (event) => {
    const button = event.target.closest('[data-id]');
    if (!button || button.disabled || state.tray.length >= state.order.length) return;
    const item = items.find((entry) => entry.id === button.dataset.id);
    state.tray.push(item);
    button.classList.add('is-selected');
    setTimeout(() => button.classList.remove('is-selected'), 180);
    renderTray();
  });

  setInterval(() => { if (state && !$('#gamePanel').hidden) updateHud(); }, 250);
})();
