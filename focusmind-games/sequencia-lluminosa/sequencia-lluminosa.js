(() => {
  const intro = document.getElementById('sequenciaIntro');
  const stage = document.getElementById('sequenciaStage');
  const status = document.getElementById('sequenciaStatus');
  const replay = document.getElementById('sequenciaReplay');
  const pads = [...document.querySelectorAll('.sequencia-lluminosa__pad')];
  const totalRounds = 10;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  let sequence, round, index, correct, responseAt, responseTime;
  let acceptingInput = false;

  function setInput(enabled) {
    acceptingInput = enabled;
    for (const pad of pads) pad.setAttribute('aria-disabled', String(!enabled));
  }

  function randomPad() {
    return Math.floor(Math.random() * pads.length);
  }

  async function showSequence() {
    setInput(false);
    index = 0;
    status.textContent = `Ronda ${round} de ${totalRounds}. Mira la seqüència.`;
    await wait(600);
    for (const position of sequence) {
      pads[position].classList.add('is-on');
      await wait(470);
      pads[position].classList.remove('is-on');
      await wait(200);
    }
    status.textContent = `Ara tu: casella 1 de ${sequence.length}.`;
    responseAt = performance.now();
    setInput(true);
  }

  function finish(won) {
    const wrong = won ? 0 : 1;
    const completed = won ? totalRounds : round - 1;
    const score = correct * 10;
    status.textContent = `${won ? 'Has completat totes les rondes!' : 'Final de partida.'} Rondes superades: ${completed}/${totalRounds}. Punts: ${score}.`;
    replay.hidden = false;
    replay.focus();
    window.saveFocusMindResult?.({
      gameName: 'Seqüència lluminosa',
      cognitiveArea: 'Memòria',
      score,
      correct,
      wrong,
      accuracy: Math.round(correct / (correct + wrong) * 100),
      averageReactionTime: Math.round(responseTime / (correct + wrong)),
    });
  }

  async function choosePad(position) {
    if (!acceptingInput) return;
    setInput(false);
    responseTime += performance.now() - responseAt;
    const pad = pads[position];
    const matches = position === sequence[index];
    const feedback = matches ? 'is-on' : 'is-wrong';
    pad.classList.add(feedback);
    await wait(200);
    pad.classList.remove(feedback);
    if (!matches) {
      finish(false);
      return;
    }

    correct++;
    index++;
    if (index < sequence.length) {
      status.textContent = `Ara tu: casella ${index + 1} de ${sequence.length}.`;
      responseAt = performance.now();
      setInput(true);
    } else if (round === totalRounds) {
      finish(true);
    } else {
      round++;
      sequence.push(randomPad());
      showSequence();
    }
  }

  function startGame() {
    intro.hidden = true;
    stage.hidden = false;
    replay.hidden = true;
    sequence = [randomPad(), randomPad()];
    round = 1;
    correct = 0;
    responseTime = 0;
    showSequence();
    status.focus();
  }

  document.getElementById('sequenciaStart').addEventListener('click', startGame);
  replay.addEventListener('click', startGame);
  pads.forEach((pad, position) => pad.addEventListener('click', () => choosePad(position)));
})();
