// ===== Lògica del repte: Joc de les xapes =====
    (() => {
      const root = document.getElementById('capGame');
      if (!root) return;
      const DURATION = 120;

      const state = {
        step: 1,
        difficulty: 'easy',
        moduleId: 'arith',
        moduleMeta: null,
        moduleOptions: {},
        gameMode: 'duel',
        bracketSize: 4,
        tournament: null,
        running: false,
        timeLeft: DURATION,
        shooter: null,
        timerId: null,
        frameId: null,
        drag: null,
        field: {
          w: 0, h: 0,
          ball: { x: 0, y: 0, vx: 0, vy: 0, r: 17 },
          blue: { x: 0, y: 0, vx: 0, vy: 0, r: 17 },
          red: { x: 0, y: 0, vx: 0, vy: 0, r: 17 }
        },
        teams: {
          blue: { name: 'Equip blau', score: 0, input: '', current: null, rawCorrect: 0 },
          red: { name: 'Equip vermell', score: 0, input: '', current: null, rawCorrect: 0 }
        }
      };

      const els = {
        modal: document.getElementById('capModal'),
        stepLabel: document.getElementById('capStepLabel'),
        steps: Array.from(root.querySelectorAll('.ttm-step')),
        prevStep: document.getElementById('capPrevStep'),
        nextStep: document.getElementById('capNextStep'),
        setupError: document.getElementById('capSetupError'),
        moduleSelect: document.getElementById('capModuleSelect'),
        moduleConfigFields: document.getElementById('capModuleConfigFields'),
        levelButtons: Array.from(root.querySelectorAll('[data-level]')),
        modeButtons: Array.from(root.querySelectorAll('[data-mode]')),
        bracketField: document.getElementById('capBracketField'),
        bracketSize: document.getElementById('capBracketSize'),
        participantsField: document.getElementById('capParticipantsField'),
        participantsInput: document.getElementById('capParticipantsInput'),
        teamInputsWrap: root.querySelector('.ttm-team-inputs'),
        blueNameInput: document.getElementById('capBlueNameInput'),
        redNameInput: document.getElementById('capRedNameInput'),
        blueName: document.getElementById('capBlueName'),
        redName: document.getElementById('capRedName'),
        bluePanelTitle: document.getElementById('capBluePanelTitle'),
        redPanelTitle: document.getElementById('capRedPanelTitle'),
        blueScore: document.getElementById('capBlueScore'),
        redScore: document.getElementById('capRedScore'),
        timer: document.getElementById('capTimer'),
        turnHint: document.getElementById('capTurnHint'),
        field: document.getElementById('capField'),
        ball: document.getElementById('capBall'),
        chipBlue: document.getElementById('capChipBlue'),
        chipRed: document.getElementById('capChipRed'),
        questionBlue: document.getElementById('capQuestionBlue'),
        questionRed: document.getElementById('capQuestionRed'),
        mediaBlue: document.getElementById('capMediaBlue'),
        mediaRed: document.getElementById('capMediaRed'),
        inputBlue: document.getElementById('capInputBlue'),
        inputRed: document.getElementById('capInputRed'),
        result: document.getElementById('capResult'),
        winnerTitle: document.getElementById('capWinnerTitle'),
        winnerStats: document.getElementById('capWinnerStats'),
        restartBtn: document.getElementById('capRestartBtn'),
        exitBtn: document.getElementById('capExitBtn')
      };

      const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
      const formatTime = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
      const getRegisteredModules = () => (typeof window.getRegisteredModules === 'function' ? window.getRegisteredModules() : []);
      const isIntegerLike = (v) => (typeof v === 'number' ? Number.isFinite(v) && Number.isInteger(v) : /^-?\\d+$/.test(String(v || '').trim()));

      function updateStepUi() {
        els.stepLabel.textContent = `Pas ${state.step} de 3`;
        els.steps.forEach((node) => node.classList.toggle('is-active', Number(node.dataset.step) === state.step));
        els.prevStep.disabled = state.step === 1;
        els.nextStep.textContent = state.step === 3 ? 'Comença el joc' : 'Següent';
        applyGameModeUi();
      }
      function applyGameModeUi() {
        els.modeButtons.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.mode === state.gameMode));
        const isChamp = state.gameMode === 'champ';
        if (els.bracketField) els.bracketField.hidden = !isChamp;
        if (els.participantsField) els.participantsField.hidden = !isChamp;
        if (els.teamInputsWrap) els.teamInputsWrap.style.display = isChamp ? 'none' : 'grid';
      }

      function renderModuleConfigFields() {
        const box = els.moduleConfigFields;
        if (!box) return;
        const mod = getRegisteredModules().find((m) => m.id === state.moduleId) || state.moduleMeta;
        if (state.moduleId === 'arith') {
          box.innerHTML = `<div class="section-title">Opcions d'aritmètica</div><div class="controls"><div class="group"><label class="toggle"><input class="check" type="checkbox" id="cap-op-plus" checked> Sumes</label><label class="toggle"><input class="check" type="checkbox" id="cap-op-minus" checked> Restes</label><label class="toggle"><input class="check" type="checkbox" id="cap-op-times" checked> Multiplicacions</label><label class="toggle"><input class="check" type="checkbox" id="cap-op-div" checked> Divisions</label></div></div>`;
          return;
        }
        if (mod?.config && typeof mod.config.render === 'function') {
          box.innerHTML = '';
          const rendered = mod.config.render();
          if (rendered) {
            box.appendChild(rendered);
            const basicInput = box.querySelector('input[name="cat-morf-sub"][value="basiques"]');
            if (basicInput) {
              basicInput.closest('label')?.remove();
              if (basicInput.checked) box.querySelector('input[name="cat-morf-sub"]')?.setAttribute('checked', 'checked');
            }
          }
          return;
        }
        box.innerHTML = '<span class="subtitle">Aquest mòdul no té opcions extra.</span>';
      }

      function readModuleOptions() {
        const options = {};
        if (state.moduleId === 'arith') {
          options.ops = [];
          if (document.getElementById('cap-op-plus')?.checked) options.ops.push('+');
          if (document.getElementById('cap-op-minus')?.checked) options.ops.push('-');
          if (document.getElementById('cap-op-times')?.checked) options.ops.push('×');
          if (document.getElementById('cap-op-div')?.checked) options.ops.push('÷');
          if (!options.ops.length) options.ops.push('+');
        } else if (state.moduleMeta?.config && typeof state.moduleMeta.config.collect === 'function') {
          Object.assign(options, state.moduleMeta.config.collect() || {});
        }
        state.moduleOptions = options;
      }

      function populateModuleOptions() {
        const allowed = new Set(['arith', 'cat-morf']);
        const mods = getRegisteredModules().filter((m) => allowed.has(m.id));
        els.moduleSelect.innerHTML = mods.map((m) => `<option value="${m.id}">${m.name || m.id}</option>`).join('') || '<option value="arith">Aritmètica</option>';
        if (!mods.some((m) => m.id === state.moduleId)) state.moduleId = mods[0]?.id || 'arith';
        els.moduleSelect.value = state.moduleId;
        state.moduleMeta = mods.find((m) => m.id === state.moduleId) || null;
        renderModuleConfigFields();
      }

      function createArithmeticQuestion() {
        const cfg = { easy:[0,20], medium:[-30,60], hard:[-80,140] };
        const [min,max] = cfg[state.difficulty] || cfg.easy;
        const ops = state.moduleOptions.ops?.length ? state.moduleOptions.ops : ['+'];
        const op = ops[randomInt(0, ops.length - 1)];
        const a = randomInt(min, max), b = randomInt(min, max);
        if (op === '+') return { q: `${a} + ${b} = ?`, a: String(a + b) };
        if (op === '-') return { q: `${a} − ${b} = ?`, a: String(a - b) };
        if (op === '×') return { q: `${a} × ${b} = ?`, a: String(a * b) };
        const d = randomInt(1, 12), res = randomInt(-12, 12), n = d * res;
        return { q: `${n} ÷ ${d} = ?`, a: String(res) };
      }

      function createQuestion() {
        if (state.moduleId === 'arith') return { ...createArithmeticQuestion(), rawOptions: null, html: '' };
        const mod = state.moduleMeta || getRegisteredModules().find((m) => m.id === state.moduleId);
        if (mod?.generator) {
          const q = mod.generator(state.moduleOptions || {}, state.difficulty);
          if (q?.q != null && q?.a != null) {
            if (Array.isArray(q.options) && q.options.length) {
              const idx = q.options.findIndex((op) => String(op).trim().toLowerCase() === String(q.a).trim().toLowerCase());
              const html = `<div class="ttm-choice-grid">${q.options.map((label, i) => `<div class="ttm-choice-item"><strong>${i + 1}.</strong> ${label}</div>`).join('')}</div>`;
              return { q: q.q, a: String(idx >= 0 ? idx + 1 : q.a), rawOptions: q.options.slice(), html: q.html || html };
            }
            return { q: q.q, a: String(q.a), rawOptions: null, html: q.html || '' };
          }
        }
        return { q: '2 + 2 = ?', a: '4', rawOptions: null, html: '' };
      }

      function setQuestion(teamKey) {
        const t = state.teams[teamKey];
        t.current = createQuestion();
        t.input = '';
        const questionEl = teamKey === 'blue' ? els.questionBlue : els.questionRed;
        const mediaEl = teamKey === 'blue' ? els.mediaBlue : els.mediaRed;
        const teamPanel = root.querySelector(`.ttm-team[data-team="${teamKey}"]`);
        if (questionEl) questionEl.textContent = t.current.q;
        if (mediaEl) mediaEl.innerHTML = t.current.html || '';
        if (teamPanel) teamPanel.classList.toggle('is-text-question', state.moduleId === 'cat-morf');
        renderTeamControls(teamKey);
      }

      function updateHud() {
        els.blueName.textContent = state.teams.blue.name;
        els.redName.textContent = state.teams.red.name;
        els.bluePanelTitle.textContent = state.teams.blue.name;
        els.redPanelTitle.textContent = state.teams.red.name;
        els.blueScore.textContent = String(state.teams.blue.score);
        els.redScore.textContent = String(state.teams.red.score);
        els.inputBlue.textContent = state.teams.blue.input || '0';
        els.inputRed.textContent = state.teams.red.input || '0';
        els.timer.textContent = formatTime(Math.max(0, state.timeLeft));
      }

      function renderShotState() {
        const canBlue = state.running && state.shooter === 'blue';
        const canRed = state.running && state.shooter === 'red';
        els.chipBlue.classList.toggle('is-active-shot', canBlue);
        els.chipRed.classList.toggle('is-active-shot', canRed);
        if (!state.running) return;
        if (canBlue) els.turnHint.textContent = `${state.teams.blue.name}: arrossega la xapa blava per xutar.`;
        else if (canRed) els.turnHint.textContent = `${state.teams.red.name}: arrossega la xapa vermella per xutar.`;
        else els.turnHint.textContent = 'Encerta una pregunta per fer un tir.';
      }

      function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
      function refreshFieldSize() {
        const rect = els.field.getBoundingClientRect();
        state.field.w = Math.max(320, rect.width || 320);
        state.field.h = Math.max(240, rect.height || 240);
      }
      function resetField() {
        refreshFieldSize();
        const { w, h } = state.field;
        Object.assign(state.field.ball, { x: w / 2, y: h / 2, vx: 0, vy: 0 });
        Object.assign(state.field.blue, { x: w * 0.24, y: h / 2, vx: 0, vy: 0 });
        Object.assign(state.field.red, { x: w * 0.76, y: h / 2, vx: 0, vy: 0 });
        renderField();
      }
      function renderField() {
        const apply = (el, obj) => { if (el) { el.style.left = `${obj.x}px`; el.style.top = `${obj.y}px`; } };
        apply(els.ball, state.field.ball); apply(els.chipBlue, state.field.blue); apply(els.chipRed, state.field.red);
      }

      function bounce(obj) {
        const { w, h } = state.field;
        obj.x = clamp(obj.x, obj.r, w - obj.r);
        obj.y = clamp(obj.y, obj.r, h - obj.r);
        if (obj.x <= obj.r || obj.x >= w - obj.r) obj.vx *= -0.75;
        if (obj.y <= obj.r || obj.y >= h - obj.r) obj.vy *= -0.75;
      }
      function collideChipBall(chip) {
        const ball = state.field.ball;
        const dx = ball.x - chip.x, dy = ball.y - chip.y;
        const dist = Math.hypot(dx, dy) || 0.0001;
        const minDist = ball.r + chip.r;
        if (dist >= minDist) return;
        const nx = dx / dist, ny = dy / dist;
        const overlap = minDist - dist;
        ball.x += nx * overlap; ball.y += ny * overlap;
        const rel = (ball.vx - chip.vx) * nx + (ball.vy - chip.vy) * ny;
        if (rel < 0) {
          const impulse = -rel * 1.1;
          ball.vx += nx * impulse; ball.vy += ny * impulse;
          chip.vx -= nx * impulse * 0.45; chip.vy -= ny * impulse * 0.45;
        }
      }

      function checkGoal() {
        const { ball, h, w } = state.field;
        const top = h * 0.34, bottom = h * 0.66;
        if (ball.y < top || ball.y > bottom) return null;
        if (ball.x - ball.r <= 0) return 'red';
        if (ball.x + ball.r >= w) return 'blue';
        return null;
      }

      function stepPhysics() {
        if (!state.running) return;
        const objs = [state.field.blue, state.field.red, state.field.ball];
        objs.forEach((o) => { o.x += o.vx; o.y += o.vy; o.vx *= 0.985; o.vy *= 0.985; if (Math.abs(o.vx) < 0.02) o.vx = 0; if (Math.abs(o.vy) < 0.02) o.vy = 0; bounce(o); });
        collideChipBall(state.field.blue); collideChipBall(state.field.red);
        const scorer = checkGoal();
        renderField();
        if (scorer) endGame(scorer, 'goal');
      }

      function tick() {
        stepPhysics();
        state.frameId = requestAnimationFrame(tick);
      }

      function parseAnswer(v) { return String(v ?? '').replace(/\s+/g, '').replace(',', '.').toLowerCase(); }
      function handleAnswer(teamKey) {
        if (!state.running) return;
        const t = state.teams[teamKey];
        const expected = parseAnswer(t.current?.a);
        const got = parseAnswer(t.input);
        if (!expected || !got) return;
        if (expected === got || (isIntegerLike(expected) && isIntegerLike(got) && Number(expected) === Number(got))) {
          t.rawCorrect += 1;
          state.shooter = teamKey;
          setQuestion(teamKey);
          renderShotState();
          updateHud();
          return;
        }
        t.input = '';
        setQuestion(teamKey);
        updateHud();
      }

      function pushDigit(teamKey, value) {
        if (!state.running) return;
        state.teams[teamKey].input += String(value);
        updateHud();
      }
      function buildKeypad(teamKey, container) {
        ['7','8','9','4','5','6','1','2','3','0'].forEach((digit) => {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'ttm-key'; b.textContent = digit;
          b.addEventListener('click', () => pushDigit(teamKey, digit)); container.appendChild(b);
        });
        const minus = document.createElement('button'); minus.type='button'; minus.className='ttm-key ttm-key--minus'; minus.textContent='−';
        minus.addEventListener('click',()=>{ if(state.moduleId!=='arith' || !state.running) return; const t=state.teams[teamKey]; t.input = t.input.startsWith('-') ? t.input.slice(1) : `-${t.input}`; updateHud(); });
        const clear = document.createElement('button'); clear.type='button'; clear.className='ttm-key ttm-key--clear'; clear.textContent='Esborrar'; clear.addEventListener('click',()=>{ state.teams[teamKey].input=''; updateHud(); });
        const send = document.createElement('button'); send.type='button'; send.className='ttm-key ttm-key--send'; send.textContent='Enviar'; send.addEventListener('click',()=>handleAnswer(teamKey));
        container.append(minus, clear, send);
      }
      function renderTeamControls(teamKey) {
        const container = root.querySelector(`.ttm-keypad[data-keypad="${teamKey}"]`);
        const inputEl = teamKey === 'blue' ? els.inputBlue : els.inputRed;
        if (!container) return;
        const current = state.teams[teamKey].current;
        const hasChoices = state.moduleId === 'cat-morf' && Array.isArray(current?.rawOptions) && current.rawOptions.length;
        if (hasChoices) {
          container.classList.add('is-choices'); container.innerHTML = '';
          current.rawOptions.forEach((label, i) => {
            const btn = document.createElement('button'); btn.type='button'; btn.className='ttm-choice-btn'; btn.textContent=`${i + 1}. ${label}`;
            btn.addEventListener('click',()=>{ if(!state.running) return; state.teams[teamKey].input=String(i+1); handleAnswer(teamKey); });
            container.appendChild(btn);
          });
          if (inputEl) inputEl.style.display = 'none';
          return;
        }
        container.classList.remove('is-choices'); container.innerHTML=''; if (inputEl) inputEl.style.display='block'; buildKeypad(teamKey, container);
      }

      function prepareTournament(players, size) {
        const pool = players.slice(0, size);
        state.tournament = { round: 1, queue: pool, winners: [], pairIndex: 0, awaitingNext: false };
      }
      function setupMatchNames() {
        if (state.gameMode !== 'champ' || !state.tournament) return true;
        const t = state.tournament;
        if (t.queue.length < 2) return false;
        state.teams.blue.name = t.queue.shift();
        state.teams.red.name = t.queue.shift();
        return true;
      }
      function advanceTournament(winnerName) {
        const t = state.tournament;
        if (!t) return { finished: true, champion: winnerName };
        t.winners.push(winnerName);
        if (t.queue.length >= 2) {
          return { finished: false, next: true };
        }
        if (t.winners.length === 1) return { finished: true, champion: t.winners[0] };
        t.queue = t.winners.slice();
        t.winners = [];
        t.round += 1;
        return { finished: false, next: true };
      }

      function startGame() {
        clearInterval(state.timerId);
        if (!setupMatchNames()) return;
        state.running = true;
        state.timeLeft = DURATION;
        state.shooter = null;
        state.teams.blue.score = 0; state.teams.red.score = 0;
        state.teams.blue.rawCorrect = 0; state.teams.red.rawCorrect = 0;
        els.modal.hidden = true; els.result.hidden = true;
        setQuestion('blue'); setQuestion('red');
        resetField(); updateHud(); renderShotState();
        state.timerId = setInterval(() => {
          if (!state.running) return;
          state.timeLeft -= 1; updateHud();
          if (state.timeLeft <= 0) {
            const winner = state.teams.blue.rawCorrect === state.teams.red.rawCorrect ? null : (state.teams.blue.rawCorrect > state.teams.red.rawCorrect ? 'blue' : 'red');
            endGame(winner, 'time');
          }
        }, 1000);
      }

      function endGame(winnerTeam, reason) {
        if (!state.running) return;
        state.running = false;
        clearInterval(state.timerId);
        state.shooter = null;
        let winnerName = 'Empat';
        if (winnerTeam && state.teams[winnerTeam]) {
          state.teams[winnerTeam].score = 1;
          winnerName = state.teams[winnerTeam].name;
        }
        updateHud(); renderShotState();

        if (state.gameMode === 'champ' && winnerTeam) {
          const progress = advanceTournament(winnerName);
          if (progress.finished) {
            els.winnerTitle.textContent = `Campió/na: ${progress.champion}`;
            els.winnerStats.textContent = `Campionat completat en mode eliminatòries.`;
            els.restartBtn.textContent = 'Nou campionat';
            state.tournament = null;
          } else {
            state.tournament.awaitingNext = true;
            els.winnerTitle.textContent = `Guanya ${winnerName}`;
            els.winnerStats.textContent = 'Preparats per a la següent eliminatòria.';
            els.restartBtn.textContent = 'Següent eliminatòria';
          }
        } else {
          els.winnerTitle.textContent = winnerTeam ? `Gol de ${winnerName}!` : 'Temps esgotat';
          els.winnerStats.textContent = reason === 'goal' ? 'Partida acabada al primer gol.' : 'S ha acabat el temps de joc.';
          els.restartBtn.textContent = 'Tornar a jugar';
        }
        els.result.hidden = false;
      }

      function setupChipDrag(teamKey, chipEl) {
        chipEl.addEventListener('pointerdown', (ev) => {
          if (!state.running || state.shooter !== teamKey) return;
          const chip = state.field[teamKey];
          state.drag = { teamKey, startX: ev.clientX, startY: ev.clientY, chipStartX: chip.x, chipStartY: chip.y };
          chipEl.setPointerCapture(ev.pointerId);
        });
        chipEl.addEventListener('pointermove', (ev) => {
          if (!state.drag || state.drag.teamKey !== teamKey) return;
          const chip = state.field[teamKey];
          const dx = ev.clientX - state.drag.startX, dy = ev.clientY - state.drag.startY;
          chip.x = clamp(state.drag.chipStartX + dx, chip.r, state.field.w - chip.r);
          chip.y = clamp(state.drag.chipStartY + dy, chip.r, state.field.h - chip.r);
          renderField();
        });
        chipEl.addEventListener('pointerup', (ev) => {
          if (!state.drag || state.drag.teamKey !== teamKey) return;
          const chip = state.field[teamKey];
          const dx = ev.clientX - state.drag.startX, dy = ev.clientY - state.drag.startY;
          chip.vx = clamp((state.drag.startX - ev.clientX) * 0.16, -14, 14);
          chip.vy = clamp((state.drag.startY - ev.clientY) * 0.16, -14, 14);
          state.drag = null;
          state.shooter = null;
          renderShotState();
        });
      }

      els.moduleSelect?.addEventListener('change', () => {
        state.moduleId = els.moduleSelect.value || 'arith';
        state.moduleMeta = getRegisteredModules().find((m) => m.id === state.moduleId) || null;
        renderModuleConfigFields();
      });
      els.modeButtons.forEach((btn) => btn.addEventListener('click', () => { state.gameMode = btn.dataset.mode === 'champ' ? 'champ' : 'duel'; applyGameModeUi(); }));
      els.bracketSize?.addEventListener('change', () => { state.bracketSize = Number(els.bracketSize.value || 4) === 8 ? 8 : 4; });
      els.levelButtons.forEach((btn) => btn.addEventListener('click', () => { state.difficulty = btn.dataset.level; els.levelButtons.forEach((b) => b.classList.toggle('is-selected', b === btn)); }));
      els.prevStep.addEventListener('click', () => { state.step = Math.max(1, state.step - 1); els.setupError.textContent = ''; updateStepUi(); });
      els.nextStep.addEventListener('click', () => {
        els.setupError.textContent = '';
        if (state.step < 3) { state.step += 1; updateStepUi(); return; }
        readModuleOptions();
        if (state.gameMode === 'champ') {
          const size = Number(els.bracketSize?.value || 4); state.bracketSize = size === 8 ? 8 : 4;
          const players = (els.participantsInput.value || '').split('\n').map((v) => v.trim()).filter(Boolean);
          if (players.length < state.bracketSize) { els.setupError.textContent = `Calen ${state.bracketSize} participants per al campionat.`; return; }
          prepareTournament(players, state.bracketSize);
          startGame();
          return;
        }
        const blue = (els.blueNameInput.value || '').trim() || 'Equip blau';
        const red = (els.redNameInput.value || '').trim() || 'Equip vermell';
        if (blue.toLowerCase() === red.toLowerCase()) { els.setupError.textContent = 'Els equips han de tenir noms diferents.'; return; }
        state.teams.blue.name = blue; state.teams.red.name = red; state.tournament = null; startGame();
      });
      els.restartBtn.addEventListener('click', () => {
        if (state.gameMode === 'champ' && state.tournament?.awaitingNext) { state.tournament.awaitingNext = false; startGame(); return; }
        state.running = false; clearInterval(state.timerId); state.step = 1; state.timeLeft = DURATION; state.tournament = null;
        els.result.hidden = true; els.modal.hidden = false; updateStepUi(); updateHud(); renderShotState(); resetField();
      });
      els.exitBtn?.addEventListener('click', () => {
        state.running = false; clearInterval(state.timerId); state.step = 1; state.timeLeft = DURATION; state.tournament = null;
        els.result.hidden = true; els.modal.hidden = false; updateStepUi(); updateHud(); renderShotState(); resetField();
        if (typeof showView === 'function') showView('home');
      });

      setupChipDrag('blue', els.chipBlue);
      setupChipDrag('red', els.chipRed);
      window.addEventListener('resize', resetField);

      populateModuleOptions();
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', populateModuleOptions, { once: true });
      else setTimeout(populateModuleOptions, 50);
      state.frameId = requestAnimationFrame(tick);
      updateStepUi(); updateHud(); renderShotState(); resetField();
    })();
