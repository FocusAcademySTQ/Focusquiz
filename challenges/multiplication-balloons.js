(() => {
  const game = document.getElementById('multiplicationBalloons');
  const feedback = game.querySelector('#balloonsFeedback');
  const stageLabel = game.querySelector('#balloonsStage');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scoreLabel = game.querySelector('#balloonsScore');
  const intro = game.querySelector('#balloonsIntro');
  const round = game.querySelector('#balloonsRound');
  const equation = game.querySelector('#balloonsEquation');
  const choices = [...game.querySelectorAll('.answer-balloon')];
  const hint = game.querySelector('#balloonsHint');
  const hintText = game.querySelector('#balloonsHintText');
  const dots = game.querySelector('#balloonsDots');
  const end = game.querySelector('#balloonsEnd');
  const endTitle = game.querySelector('#balloonsEndTitle');
  const correction = game.querySelector('#balloonsCorrection');
  const easyTables = [1, 2, 5, 10];

  let score = 0;
  let question = null;
  let transition = null;

  const pick = values => values[Math.floor(Math.random() * values.length)];

  function shuffle(values) {
    for (let index = values.length - 1; index > 0; index--) {
      const swap = Math.floor(Math.random() * (index + 1));
      [values[index], values[swap]] = [values[swap], values[index]];
    }
    return values;
  }

  function nextQuestion() {
    const tables = score < 5 ? easyTables : score < 10 ? [...easyTables, 3, 4] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const largestFactor = score < 5 ? 5 : 10;
    const operations = tables.flatMap(table =>
      Array.from({ length: largestFactor }, (_, index) => [index + 1, table])
    );
    const [groups, size] = pick(operations.filter(([a, b]) => a * b !== question?.answer));
    const answer = groups * size;
    question = { groups, size, answer };

    const distractors = [...new Set([answer + size, answer - size, answer + 1, answer - 1, answer + 2, answer + 3])]
      .filter(value => value > 0);
    const values = shuffle([answer, ...shuffle(distractors).slice(0, 3)]);
    choices.forEach((button, index) => {
      button.textContent = values[index];
      button.disabled = false;
      button.classList.remove('is-popping');
    });

    equation.textContent = `${groups} × ${size} = ?`;
    equation.setAttribute('aria-label', `Quant fan ${groups} multiplicat per ${size}?`);
    hint.open = false;
    hintText.textContent = `${groups} ${groups === 1 ? 'grup' : 'grups'} de ${size} ${size === 1 ? 'punt' : 'punts'}. Quants punts hi ha en total?`;
    dots.replaceChildren(...Array.from({ length: groups }, () => {
      const group = document.createElement('span');
      for (let index = 0; index < size; index++) group.appendChild(document.createElement('i'));
      return group;
    }));
    stageLabel.textContent = score < 5 ? 'Taules inicials' : score < 10 ? 'Més taules' : 'Totes les taules';
    equation.focus({ preventScroll: true });
  }

  function start() {
    clearTimeout(transition);
    transition = null;
    score = 0;
    feedback.textContent = '';
    stageLabel.hidden = false;
    scoreLabel.textContent = score;
    question = null;
    intro.hidden = true;
    end.hidden = true;
    round.hidden = false;
    nextQuestion();
  }

  choices.forEach(button => {
    button.addEventListener('click', () => {
      if (!question || transition !== null) return;
      const { groups, size, answer } = question;
      if (Number(button.textContent) === answer) {
        score++;
        scoreLabel.textContent = score;
        feedback.textContent = score === 5 ? 'Molt bé! Ara hi ha més taules.'
          : score === 10 ? 'Genial! Ja jugues amb totes les taules.'
          : 'Encert!';
        if (reducedMotion.matches) {
          nextQuestion();
          return;
        }
        button.classList.add('is-popping');
        choices.forEach(choice => { choice.disabled = true; });
        transition = setTimeout(() => {
          transition = null;
          nextQuestion();
        }, 360);
        return;
      }

      question = null;
      correction.textContent = `Has triat ${button.textContent}. La resposta correcta és ${groups} × ${size} = ${answer}.`;
      endTitle.textContent = `Fi de la partida · ${score} ${score === 1 ? 'encert' : 'encerts'}`;
      round.hidden = true;
      stageLabel.hidden = true;
      end.hidden = false;
      endTitle.focus({ preventScroll: true });
    });
  });

  game.querySelector('#balloonsStart').addEventListener('click', start);
  game.querySelector('#balloonsRestart').addEventListener('click', start);
})();
