(() => {
  const GAME_NAME = 'Seqüència lluminosa';
  const AREA = 'Memòria';
  const board = document.getElementById('sequenciaBoard');
  const startButton = document.getElementById('sequenciaStart');
  const status = document.getElementById('sequenciaStatus');

  const state = {
    running: false,
    round: 0,
    score: 0,
    correct: 0,
    wrong: 0,
    startedAt: 0,
    reactionTimes: [],
  };

  function saveResult() {
    const total = state.correct + state.wrong;
    const accuracy = total ? Math.round((state.correct / total) * 100) : 100;
    const averageReactionTime = state.reactionTimes.length
      ? Math.round(state.reactionTimes.reduce((sum, value) => sum + value, 0) / state.reactionTimes.length)
      : 0;

    if (typeof window.saveFocusMindResult === 'function') {
      window.saveFocusMindResult({
        gameName: GAME_NAME,
        cognitiveArea: AREA,
        score: state.score,
        correct: state.correct,
        wrong: state.wrong,
        accuracy,
        averageReactionTime,
      });
    }
  }

  function renderPads() {
    if (!board) return;
    board.innerHTML = Array.from({ length: 9 }, (_, index) => (
      `<button class="sequencia-lluminosa__pad" type="button" data-pad="${index}" aria-label="Casella ${index + 1}"></button>`
    )).join('');
  }

  function startGame() {
    state.running = true;
    state.round = 1;
    state.score = 0;
    state.correct = 0;
    state.wrong = 0;
    state.startedAt = Date.now();
    state.reactionTimes = [];
    renderPads();
    if (status) status.textContent = 'Plantilla activa. Substitueix aquest fitxer JS pel teu joc definitiu.';
  }

  startButton?.addEventListener('click', startGame);
  renderPads();

  window.SequenciaLluminosaFocusMind = {
    startGame,
    saveResult,
    state,
  };
})();
