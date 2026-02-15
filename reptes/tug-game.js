// ===== Lògica del repte: Joc de la corda =====
    (() => {
      const root = document.getElementById('ttmGame');
      if (!root) return;

      const DURATION = 120;
      const LIMIT = 10;
      const LEAD_TO_WIN = 4;

      const state = {
        step: 1,
        operations: new Set(['add', 'sub', 'mul', 'div']),
        difficulty: 'easy',
        moduleId: 'arith',
        moduleMeta: null,
        moduleOptions: {},
        gameMode: 'duel',
        bracketSize: 4,
        tournament: null,
        leadToWin: LEAD_TO_WIN,
        running: false,
        timeLeft: DURATION,
        ropePos: 0,
        timerId: null,
        teams: {
          blue: { name: 'Equip blau', score: 0, input: '', current: null, rawCorrect: 0 },
          red: { name: 'Equip vermell', score: 0, input: '', current: null, rawCorrect: 0 }
        }
      };

      const els = {
        modal: document.getElementById('ttmModal'),
        stepLabel: document.getElementById('ttmStepLabel'),
        steps: Array.from(root.querySelectorAll('.ttm-step')),
        prevStep: document.getElementById('ttmPrevStep'),
        nextStep: document.getElementById('ttmNextStep'),
        setupError: document.getElementById('ttmSetupError'),
        opButtons: Array.from(root.querySelectorAll('[data-op]')),
        moduleSelect: document.getElementById('ttmModuleSelect'),
        moduleConfigFields: document.getElementById('ttmModuleConfigFields'),
        levelButtons: Array.from(root.querySelectorAll('[data-level]')),
        modeButtons: Array.from(root.querySelectorAll('[data-mode]')),
        bracketField: document.getElementById('ttmBracketField'),
        bracketSize: document.getElementById('ttmBracketSize'),
        participantsField: document.getElementById('ttmParticipantsField'),
        participantsInput: document.getElementById('ttmParticipantsInput'),
        teamInputsWrap: root.querySelector('.ttm-team-inputs'),
        blueNameInput: document.getElementById('ttmBlueNameInput'),
        redNameInput: document.getElementById('ttmRedNameInput'),
        blueName: document.getElementById('ttmBlueName'),
        redName: document.getElementById('ttmRedName'),
        bluePanelTitle: document.getElementById('ttmBluePanelTitle'),
        redPanelTitle: document.getElementById('ttmRedPanelTitle'),
        blueScore: document.getElementById('ttmBlueScore'),
        redScore: document.getElementById('ttmRedScore'),
        timer: document.getElementById('ttmTimer'),
        flag: document.getElementById('ttmFlag'),
        bluePullerA: document.getElementById('ttmBluePullerA'),
        bluePullerB: document.getElementById('ttmBluePullerB'),
        redPullerA: document.getElementById('ttmRedPullerA'),
        redPullerB: document.getElementById('ttmRedPullerB'),
        questionBlue: document.getElementById('ttmQuestionBlue'),
        questionRed: document.getElementById('ttmQuestionRed'),
        mediaBlue: document.getElementById('ttmMediaBlue'),
        mediaRed: document.getElementById('ttmMediaRed'),
        inputBlue: document.getElementById('ttmInputBlue'),
        inputRed: document.getElementById('ttmInputRed'),
        keypads: Array.from(root.querySelectorAll('.ttm-keypad')),
        result: document.getElementById('ttmResult'),
        winnerTitle: document.getElementById('ttmWinnerTitle'),
        winnerStats: document.getElementById('ttmWinnerStats'),
        restartBtn: document.getElementById('ttmRestartBtn'),
        exitBtn: document.getElementById('ttmExitBtn')
      };

      const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      const formatTime = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
      const getRegisteredModules = () => (typeof window.getRegisteredModules === 'function' ? window.getRegisteredModules() : []);
      const isIntegerLike = (value) => (typeof value === 'number' ? Number.isFinite(value) && Number.isInteger(value) : /^-?\d+$/.test(String(value || '').trim()));

      function renderModuleConfigFields() {
        if (!els.moduleConfigFields) return;
        const id = state.moduleId;
        const box = els.moduleConfigFields;
        const mod = getRegisteredModules().find((m) => m.id === id) || state.moduleMeta;

        if (id === 'arith') {
          box.innerHTML = `
            <div class="section-title">Opcions d'aritmètica</div>
            <div class="controls">
              <div class="group" role="group" aria-label="Operacions">
                <label class="toggle"><input class="check" type="checkbox" id="ttm-op-plus" checked> Sumes</label>
                <label class="toggle"><input class="check" type="checkbox" id="ttm-op-minus" checked> Restes</label>
                <label class="toggle"><input class="check" type="checkbox" id="ttm-op-times" checked> Multiplicacions</label>
                <label class="toggle"><input class="check" type="checkbox" id="ttm-op-div" checked> Divisions</label>
              </div>
            </div>
          `;
          return;
        }

        if (mod?.config && typeof mod.config.render === 'function') {
          box.innerHTML = '';
          const rendered = mod.config.render();
          if (rendered) {
            box.appendChild(rendered);
            if (id === 'cat-morf') {
              const basicInput = box.querySelector('input[name="cat-morf-sub"][value="basiques"]');
              if (basicInput) {
                const basicLabel = basicInput.closest('label');
                if (basicLabel) basicLabel.remove();
                if (basicInput.checked) {
                  const first = box.querySelector('input[name="cat-morf-sub"]');
                  if (first) first.checked = true;
                }
              }
            }
          }
          return;
        }

        box.innerHTML = `<span class="subtitle">Aquest mòdul no té opcions específiques addicionals en aquest joc.</span>`;
      }

      function readModuleOptions() {
        const id = state.moduleId;
        const options = {};
        const mod = getRegisteredModules().find((m) => m.id === id) || state.moduleMeta;

        if (id === 'arith') {
          if (document.getElementById('ttm-op-plus')?.checked) options.ops = [...(options.ops || []), '+'];
          if (document.getElementById('ttm-op-minus')?.checked) options.ops = [...(options.ops || []), '-'];
          if (document.getElementById('ttm-op-times')?.checked) options.ops = [...(options.ops || []), '×'];
          if (document.getElementById('ttm-op-div')?.checked) options.ops = [...(options.ops || []), '÷'];
          if (!options.ops || !options.ops.length) options.ops = ['+'];
          state.moduleOptions = options;
          return;
        }

        if (mod?.config && typeof mod.config.collect === 'function') {
          const ext = mod.config.collect();
          if (ext && typeof ext === 'object') {
            state.moduleOptions = ext;
            return;
          }
        }

        state.moduleOptions = options;
      }

      function populateModuleOptions() {
        const allowedIds = new Set(['arith', 'cat-morf']);
        const mods = getRegisteredModules().filter((m) => m && m.id && m.name && typeof m.gen === 'function' && allowedIds.has(m.id));
        if (!els.moduleSelect) return;
        els.moduleSelect.innerHTML = mods.length
          ? mods.map((m) => `<option value="${m.id}">${m.name}</option>`).join('')
          : '<option value="arith">Aritmètica</option>';
        if (!mods.some((m) => m.id === state.moduleId)) state.moduleId = mods[0]?.id || 'arith';
        els.moduleSelect.value = state.moduleId;
        state.moduleMeta = mods.find((m) => m.id === state.moduleId) || null;
        toggleOperationButtons();
        renderModuleConfigFields();
      }

      function toggleOperationButtons() {}

      function createQuestion() {
        const level = state.difficulty === 'easy' ? 1 : (state.difficulty === 'medium' ? 2 : 3);
        readModuleOptions();

        if (state.moduleId === 'arith') {
          if (!state.moduleOptions.ops || !state.moduleOptions.ops.length) state.moduleOptions.ops = ['+'];
          const ranges = { easy: [1, 20], medium: [10, 80], hard: [50, 250] };
          const [min, max] = ranges[state.difficulty];
          const opMap = {'+':'add','-':'sub','×':'mul','÷':'div'};
          const localOps = state.moduleOptions.ops.map(o => opMap[o]).filter(Boolean);
          const op = localOps[randomInt(0, localOps.length - 1)] || 'add';
          let a = randomInt(min, max), b = randomInt(min, max);
          if (op === 'add') return { text: `${a} + ${b} = ?`, answer: a + b };
          if (op === 'sub') { return { text: `${a} − ${b} = ?`, answer: a - b }; }
          if (op === 'mul') return { text: `${a} × ${b} = ?`, answer: a * b };
          const divisor = Math.max(1,b); const result = randomInt(min,max); return { text: `${divisor*result} ÷ ${divisor} = ?`, answer: result };
        }

        const mods = getRegisteredModules();
        const mod = mods.find((m) => m.id === state.moduleId && typeof m.gen === 'function') || state.moduleMeta;
        if (!mod) {
          state.moduleId = 'arith';
          if (els.moduleSelect) els.moduleSelect.value = 'arith';
          state.moduleMeta = mods.find((m) => m.id === 'arith') || null;
          toggleOperationButtons();
          return createQuestion();
        }

        for (let attempt = 0; attempt < 40; attempt += 1) {
          const q = mod.gen(level, state.moduleOptions || {});
          if (!q || typeof q.text !== 'string') continue;
          if (isIntegerLike(q.answer)) return { text: q.text, html: q.html || '', answer: Number(q.answer) };
          if (Array.isArray(q.options) && q.options.length) {
            const normalized = q.options.map((opt) => String(opt).trim().toLowerCase());
            const target = String(q.answer ?? '').trim().toLowerCase();
            let index = normalized.findIndex((opt) => opt === target);
            if (index < 0) index = q.options.findIndex((opt) => String(opt).trim() === String(q.answer ?? '').trim());
            if (index >= 0 && index < 9) {
              return { text: q.text, html: q.html || '', rawOptions: q.options.slice(), answer: index + 1 };
            }
          }
        }

        state.moduleId = 'arith';
        if (els.moduleSelect) els.moduleSelect.value = 'arith';
        state.moduleMeta = mods.find((m) => m.id === 'arith') || null;
        toggleOperationButtons();
        return createQuestion();
      }

      function applyGameModeUi() {
        const isChamp = state.gameMode === 'champ';
        els.modeButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.mode === state.gameMode));
        if (els.bracketField) els.bracketField.hidden = !isChamp;
        if (els.participantsField) els.participantsField.hidden = !isChamp;
        if (els.teamInputsWrap) els.teamInputsWrap.style.display = isChamp ? 'none' : 'grid';
      }

      function prepareTournament(players, size) {
        const list = players.slice(0, size);
        state.tournament = { round: 1, current: list, next: [], matchIndex: 0, awaitingNext: false };
        const [a, b] = list;
        state.teams.blue.name = a;
        state.teams.red.name = b;
      }

      function advanceTournament(winnerName) {
        if (!state.tournament) return { done: true };
        const t = state.tournament;
        t.next.push(winnerName);
        const matchesInRound = t.current.length / 2;

        if (t.matchIndex + 1 < matchesInRound) {
          t.matchIndex += 1;
        } else {
          if (t.next.length === 1) {
            return { done: true, champion: t.next[0] };
          }
          t.current = t.next.slice();
          t.next = [];
          t.matchIndex = 0;
          t.round += 1;
        }

        const idx = t.matchIndex * 2;
        state.teams.blue.name = t.current[idx];
        state.teams.red.name = t.current[idx + 1];
        t.awaitingNext = true;
        return { done: false, round: t.round, blue: state.teams.blue.name, red: state.teams.red.name };
      }

      function updateStepUi() {
        els.stepLabel.textContent = `Pas ${state.step} de 3`;
        els.steps.forEach(step => step.classList.toggle('is-active', Number(step.dataset.step) === state.step));
        els.prevStep.disabled = state.step === 1;
        els.nextStep.textContent = state.step === 3 ? (state.gameMode === 'champ' ? 'Començar campionat' : 'Començar joc') : 'Següent';
        applyGameModeUi();
      }


      function recalculateDuelState() {
        const blue = state.teams.blue;
        const red = state.teams.red;
        blue.score = Math.max(0, blue.rawCorrect - red.rawCorrect);
        red.score = Math.max(0, red.rawCorrect - blue.rawCorrect);
        state.ropePos = Math.max(-LIMIT, Math.min(LIMIT, (red.rawCorrect - blue.rawCorrect) * 2.2));
      }

      function updateHud() {
        els.blueName.textContent = `${state.teams.blue.name} · +${state.teams.blue.score}`;
        els.redName.textContent = `${state.teams.red.name} · +${state.teams.red.score}`;
        els.bluePanelTitle.textContent = state.teams.blue.name;
        els.redPanelTitle.textContent = state.teams.red.name;
        els.blueScore.textContent = state.teams.blue.score;
        els.redScore.textContent = state.teams.red.score;
        els.timer.textContent = formatTime(state.timeLeft);
        els.inputBlue.textContent = state.teams.blue.input || '0';
        els.inputRed.textContent = state.teams.red.input || '0';
      }

      function updateRope() {
        const pct = 50 + (state.ropePos / LIMIT) * 45;
        const clamped = Math.min(95, Math.max(5, pct));
        els.flag.style.left = `${clamped}%`;

        const pull = Math.max(0, Math.min(18, Math.abs(state.ropePos) * 1.7));
        const blueTowardMiddle = state.ropePos > 0 ? pull : 0;
        const redTowardMiddle = state.ropePos < 0 ? pull : 0;

        if (els.bluePullerA) els.bluePullerA.style.left = `${6 + blueTowardMiddle}%`;
        if (els.bluePullerB) els.bluePullerB.style.left = `${20 + blueTowardMiddle}%`;
        if (els.redPullerA) els.redPullerA.style.right = `${20 + redTowardMiddle}%`;
        if (els.redPullerB) els.redPullerB.style.right = `${6 + redTowardMiddle}%`;
      }

      function setQuestion(teamKey) {
        state.teams[teamKey].current = createQuestion();
        const questionEl = teamKey === 'blue' ? els.questionBlue : els.questionRed;
        const mediaEl = teamKey === 'blue' ? els.mediaBlue : els.mediaRed;
        const teamPanel = root.querySelector(`.ttm-team[data-team="${teamKey}"]`);
        const current = state.teams[teamKey].current;
        questionEl.innerHTML = current.text;
        if (mediaEl) mediaEl.innerHTML = current.html || '';

        const textLike = /[A-Za-zÀ-ÿ]/.test((current.text || '').replace(/<[^>]*>/g, ''));
        if (teamPanel) teamPanel.classList.toggle('is-text-question', textLike);

        renderTeamControls(teamKey);
      }

      function endGame() {
        if (!state.running) return;
        state.running = false;
        clearInterval(state.timerId);
        const blue = state.teams.blue;
        const red = state.teams.red;
        let winner = null;
        if (blue.score >= state.leadToWin || state.ropePos <= -LIMIT) winner = blue;
        else if (red.score >= state.leadToWin || state.ropePos >= LIMIT) winner = red;
        else if (blue.score > red.score) winner = blue;
        else if (red.score > blue.score) winner = red;

        const used = DURATION - state.timeLeft;
        if (state.gameMode === 'champ' && state.tournament) {
          const winnerName = winner?.name || (blue.rawCorrect >= red.rawCorrect ? blue.name : red.name);
          const progress = advanceTournament(winnerName);
          if (progress.done) {
            els.winnerTitle.textContent = `🏆 Campió/na: ${progress.champion || winnerName}`;
            els.winnerStats.textContent = `Campionat finalitzat · Temps duel: ${formatTime(used)}`;
            els.restartBtn.textContent = 'Nou campionat';
            state.tournament = null;
          } else {
            els.winnerTitle.textContent = `✅ Guanya ${winnerName}`;
            els.winnerStats.textContent = `Següent eliminatòria (Ronda ${progress.round}): ${progress.blue} vs ${progress.red}`;
            els.restartBtn.textContent = 'Següent eliminatòria';
          }
        } else {
          els.restartBtn.textContent = 'Tornar a jugar';
          if (winner) {
            els.winnerTitle.textContent = `🏆 Guanya ${winner.name}!`;
            els.winnerStats.textContent = `Avantatge final: +${winner.score} · Encerts blau ${blue.rawCorrect} / vermell ${red.rawCorrect} · Temps: ${formatTime(used)}`;
          } else {
            els.winnerTitle.textContent = '🤝 Empat!';
            els.winnerStats.textContent = `Blau ${blue.score} · Vermell ${red.score} · Temps: ${formatTime(used)}`;
          }
        }
        els.result.hidden = false;
      }

      function handleAnswer(teamKey) {
        if (!state.running) return;
        const team = state.teams[teamKey];
        const value = Number(team.input || '');
        const ok = Number.isFinite(value) && value === team.current.answer;

        if (ok) team.rawCorrect += 1;

        recalculateDuelState();
        team.input = '';
        setQuestion(teamKey);
        updateHud();
        updateRope();
        if (state.teams.blue.score >= state.leadToWin || state.teams.red.score >= state.leadToWin || Math.abs(state.ropePos) >= LIMIT) endGame();
      }

      function startGame() {
        state.running = true;
        state.timeLeft = DURATION;
        state.ropePos = 0;
        state.teams.blue.score = 0;
        state.teams.red.score = 0;
        state.teams.blue.rawCorrect = 0;
        state.teams.red.rawCorrect = 0;
        state.teams.blue.input = '';
        state.teams.red.input = '';
        recalculateDuelState();
        setQuestion('blue');
        setQuestion('red');
        updateHud();
        updateRope();
        els.modal.hidden = true;
        els.result.hidden = true;

        clearInterval(state.timerId);
        state.timerId = setInterval(() => {
          state.timeLeft -= 1;
          els.timer.textContent = formatTime(Math.max(0, state.timeLeft));
          if (state.timeLeft <= 0) endGame();
        }, 1000);
      }

      function buildKeypad(teamKey, container) {
        ['7','8','9','4','5','6','1','2','3','0'].forEach(n => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ttm-key';
          btn.textContent = n;
          btn.addEventListener('click', () => {
            if (!state.running) return;
            const t = state.teams[teamKey];
            t.input = `${t.input}${n}`.slice(0, 8);
            updateHud();
          });
          container.appendChild(btn);
        });

        const minus = document.createElement('button');
        minus.type = 'button';
        minus.className = 'ttm-key ttm-key--minus';
        minus.textContent = '−';
        minus.addEventListener('click', () => {
          if (!state.running || state.moduleId !== 'arith') return;
          const t = state.teams[teamKey];
          if (!t.input) { t.input = '-'; updateHud(); return; }
          t.input = t.input.startsWith('-') ? t.input.slice(1) : `-${t.input}`;
          updateHud();
        });

        const clear = document.createElement('button');
        clear.type = 'button';
        clear.className = 'ttm-key ttm-key--clear';
        clear.textContent = 'Esborrar';
        clear.addEventListener('click', () => { state.teams[teamKey].input = ''; updateHud(); });

        const send = document.createElement('button');
        send.type = 'button';
        send.className = 'ttm-key ttm-key--send';
        send.textContent = 'Enviar';
        send.addEventListener('click', () => handleAnswer(teamKey));

        container.appendChild(minus);
        container.appendChild(clear);
        container.appendChild(send);
      }

      function renderTeamControls(teamKey) {
        const container = root.querySelector(`.ttm-keypad[data-keypad="${teamKey}"]`);
        const inputEl = teamKey === 'blue' ? els.inputBlue : els.inputRed;
        if (!container) return;

        const current = state.teams[teamKey].current;
        const hasChoices = state.moduleId === 'cat-morf' && Array.isArray(current?.rawOptions) && current.rawOptions.length;

        if (hasChoices) {
          container.classList.add('is-choices');
          container.innerHTML = '';
          current.rawOptions.forEach((label, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ttm-choice-btn';
            btn.textContent = `${index + 1}. ${label}`;
            btn.addEventListener('click', () => {
              if (!state.running) return;
              state.teams[teamKey].input = String(index + 1);
              handleAnswer(teamKey);
            });
            container.appendChild(btn);
          });
          if (inputEl) inputEl.style.display = 'none';
          return;
        }

        container.classList.remove('is-choices');
        if (inputEl) inputEl.style.display = 'block';
        container.innerHTML = '';
        buildKeypad(teamKey, container);
      }

      if (els.moduleSelect) {
        els.moduleSelect.addEventListener('change', () => {
          state.moduleId = els.moduleSelect.value || 'arith';
          state.moduleMeta = getRegisteredModules().find((m) => m.id === state.moduleId) || null;
          toggleOperationButtons();
          renderModuleConfigFields();
        });
      }

      els.modeButtons.forEach((btn) => btn.addEventListener('click', () => {
        state.gameMode = btn.dataset.mode === 'champ' ? 'champ' : 'duel';
        applyGameModeUi();
        updateStepUi();
      }));

      els.bracketSize?.addEventListener('change', () => {
        state.bracketSize = Number(els.bracketSize.value || 4) === 8 ? 8 : 4;
      });

      els.levelButtons.forEach(btn => btn.addEventListener('click', () => {
        state.difficulty = btn.dataset.level;
        els.levelButtons.forEach(b => b.classList.toggle('is-selected', b === btn));
      }));

      els.prevStep.addEventListener('click', () => {
        state.step = Math.max(1, state.step - 1);
        els.setupError.textContent = '';
        updateStepUi();
      });

      els.nextStep.addEventListener('click', () => {
        els.setupError.textContent = '';
        if (state.step < 3) {
          state.step += 1;
          updateStepUi();
          return;
        }

        readModuleOptions();
        if (state.gameMode === 'champ') {
          const size = Number(els.bracketSize?.value || state.bracketSize || 4);
          state.bracketSize = size === 8 ? 8 : 4;
          const lines = (els.participantsInput?.value || '')
            .split('\n')
            .map((v) => v.trim())
            .filter(Boolean);
          if (lines.length < state.bracketSize) {
            els.setupError.textContent = `Calen ${state.bracketSize} participants per al campionat.`;
            return;
          }
          prepareTournament(lines, state.bracketSize);
          startGame();
          return;
        }

        const blue = (els.blueNameInput.value || '').trim() || 'Equip blau';
        const red = (els.redNameInput.value || '').trim() || 'Equip vermell';
        if (blue.toLowerCase() === red.toLowerCase()) {
          els.setupError.textContent = 'Els equips han de tenir noms diferents.';
          return;
        }

        state.teams.blue.name = blue;
        state.teams.red.name = red;
        state.tournament = null;
        startGame();
      });

      els.restartBtn.addEventListener('click', () => {
        if (state.gameMode === 'champ' && state.tournament?.awaitingNext) {
          state.tournament.awaitingNext = false;
          startGame();
          return;
        }
        clearInterval(state.timerId);
        state.step = 1;
        state.running = false;
        state.timeLeft = DURATION;
        state.ropePos = 0;
        state.tournament = null;
        els.modal.hidden = false;
        els.result.hidden = true;
        updateStepUi();
        updateHud();
        updateRope();
      });

      els.exitBtn?.addEventListener('click', () => {
        clearInterval(state.timerId);
        state.running = false;
        state.step = 1;
        state.timeLeft = DURATION;
        state.ropePos = 0;
        state.tournament = null;
        els.result.hidden = true;
        els.modal.hidden = false;
        updateStepUi();
        updateHud();
        updateRope();
        if (typeof showView === 'function') showView('home');
      });

      populateModuleOptions();
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', populateModuleOptions, { once: true });
      else setTimeout(populateModuleOptions, 50);
      updateStepUi();
      updateHud();
      updateRope();
    })();
