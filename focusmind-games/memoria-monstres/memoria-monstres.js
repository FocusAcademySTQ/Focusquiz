(() => {
  const GAME_NAME = 'Memòria de monstres';
  const AREA = 'Memòria visual';
  const board = document.getElementById('MemoriaMonstresBoard');
  const startButton = document.getElementById('MemoriaMonstresStart');
  const status = document.getElementById('MemoriaMonstresStatus');

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

  function renderPlaceholder() {
    if (!board) return;
    board.innerHTML = '<span>Plantilla del joc: substitueix aquest contingut pel teu codi definitiu.</span>';
  }

  function startGame() {
    state.running = true;
    state.round = 1;
    state.score = 0;
    state.correct = 0;
    state.wrong = 0;
    state.startedAt = Date.now();
    state.reactionTimes = [];
    renderPlaceholder();
    if (status) status.textContent = 'Plantilla activa. Substitueix aquest fitxer JS pel teu joc definitiu.';
  }

  startButton?.addEventListener('click', startGame);
  renderPlaceholder();

  window.MemoriaMonstresFocusMind = {
    startGame,
    saveResult,
    state,
  };
})();
