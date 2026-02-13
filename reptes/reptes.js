(() => {
  const $ = (s) => document.querySelector(s);
  const state = {
    running: false,
    time: 0,
    timer: null,
    rope: 0,
    limit: 10,
    moduleId: 'arith',
    module: null,
    cfg: { level: 1, options: {} },
    pointsToWin: 1,
    questionsPerPoint: 4,
    q: null,
    teams: {
      blue: { name: 'Equip blau', score: 0, raw: 0, input: '' },
      red: { name: 'Equip vermell', score: 0, raw: 0, input: '' }
    }
  };

  const els = {
    module: $('#moduleSelect'), cfgBox: $('#moduleConfig'), start: $('#startBtn'), level: $('#level'),
    blueName: $('#blueName'), redName: $('#redName'),
    blueLabel: $('#blueLabel'), redLabel: $('#redLabel'), blueMini: $('#blueMini'), redMini: $('#redMini'),
    blueScore: $('#blueScore'), redScore: $('#redScore'), timer: $('#timer'),
    qBlue: $('#qBlue'), qRed: $('#qRed'), fBlue: $('#fBlue'), fRed: $('#fRed'),
    optsBlue: $('#optsBlue'), optsRed: $('#optsRed'), kpBlue: $('#kpBlue'), kpRed: $('#kpRed'),
    flag: $('#flag'), rope: $('#rope')
  };

  const fmt = (s) => `${String(Math.floor(Math.max(0, s) / 60)).padStart(2, '0')}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
  const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  const getMods = () => (typeof window.getMods === 'function' ? window.getMods() : []);

  function pulseRope() {
    els.rope.classList.remove('swing');
    void els.rope.offsetWidth;
    els.rope.classList.add('swing');
  }

  function updateHud() {
    els.blueLabel.textContent = state.teams.blue.name;
    els.redLabel.textContent = state.teams.red.name;
    els.blueMini.textContent = `${state.teams.blue.name} · ${state.teams.blue.raw}/4`;
    els.redMini.textContent = `${state.teams.red.name} · ${state.teams.red.raw}/4`;
    els.blueScore.textContent = String(state.teams.blue.score);
    els.redScore.textContent = String(state.teams.red.score);
    els.timer.textContent = fmt(state.time);
    const pct = 50 + (state.rope / state.limit) * 44;
    els.flag.style.left = `${Math.max(6, Math.min(94, pct))}%`;
  }

  function renderModuleConfig() {
    const m = state.module;
    if (m?.config?.render) {
      els.cfgBox.innerHTML = '';
      const title = document.createElement('h3');
      title.textContent = `Configuració del mòdul · ${m.name}`;
      title.style.margin = '0 0 8px';
      els.cfgBox.appendChild(title);
      els.cfgBox.appendChild(m.config.render());
      return;
    }

    if (state.moduleId === 'arith') {
      els.cfgBox.innerHTML = `
        <h3 style="margin:0 0 8px">Configuració del mòdul · Aritmètica</h3>
        <label><input type="checkbox" id="op-plus" checked> Sumes</label>
        <label><input type="checkbox" id="op-minus" checked> Restes</label>
        <label><input type="checkbox" id="op-times" checked> Multiplicacions</label>
        <label><input type="checkbox" id="op-div" checked> Divisions</label>
      `;
      return;
    }

    if (state.moduleId === 'frac') {
      els.cfgBox.innerHTML = `
        <h3 style="margin:0 0 8px">Configuració del mòdul · Fraccions</h3>
        <label><input type="radio" name="frac-sub" value="identify" checked> Identificar</label>
        <label><input type="radio" name="frac-sub" value="arith"> Aritmètica</label>
        <label><input type="radio" name="frac-sub" value="simplify"> Simplificar</label>
      `;
      return;
    }

    els.cfgBox.innerHTML = `<h3 style="margin:0 0 8px">Configuració del mòdul · ${state.module?.name || state.moduleId}</h3><p class="subtitle">Aquest mòdul no té configuració addicional.</p>`;
  }

  function collectOptions() {
    if (state.module?.config?.collect) return state.module.config.collect();

    if (state.moduleId === 'arith') {
      const ops = [];
      if ($('#op-plus')?.checked) ops.push('+');
      if ($('#op-minus')?.checked) ops.push('-');
      if ($('#op-times')?.checked) ops.push('×');
      if ($('#op-div')?.checked) ops.push('÷');
      return { ops: ops.length ? ops : ['+'] };
    }

    if (state.moduleId === 'frac') {
      const sub = (document.querySelector('input[name="frac-sub"]:checked') || {}).value || 'identify';
      return { sub };
    }

    return {};
  }

  function generateQuestion() {
    const mod = state.module;
    if (!mod || typeof mod.gen !== 'function') return { text: 'Mòdul no disponible.', answer: '' };

    for (let i = 0; i < 100; i += 1) {
      const q = mod.gen(Number(state.cfg.level) || 1, state.cfg.options || {});
      if (!q || typeof q.text !== 'string') continue;
      return q;
    }
    return { text: 'No s\'ha pogut generar pregunta.', answer: '' };
  }

  function setFeedback(team, msg, ok) {
    const target = team === 'blue' ? els.fBlue : els.fRed;
    target.textContent = msg;
    target.style.color = ok ? '#1f8a45' : '#be2a33';
  }

  function renderQuestion() {
    const q = state.q;
    els.qBlue.innerHTML = q?.text || '—';
    els.qRed.innerHTML = q?.text || '—';

    const options = Array.isArray(q?.options) && q.options.length ? q.options : null;

    const renderOptions = (team, wrap) => {
      wrap.innerHTML = '';
      if (!options) return;
      options.forEach((opt) => {
        const b = document.createElement('button');
        b.className = 'opt';
        b.type = 'button';
        b.textContent = opt;
        b.addEventListener('click', () => submit(team, opt, true));
        wrap.appendChild(b);
      });
    };

    renderOptions('blue', els.optsBlue);
    renderOptions('red', els.optsRed);
    els.kpBlue.style.display = options ? 'none' : 'grid';
    els.kpRed.style.display = options ? 'none' : 'grid';
  }

  function finish() {
    state.running = false;
    clearInterval(state.timer);
    const msg = state.teams.blue.score > state.teams.red.score
      ? `🏆 Guanya ${state.teams.blue.name}`
      : state.teams.red.score > state.teams.blue.score
        ? `🏆 Guanya ${state.teams.red.name}`
        : '🤝 Empat';
    alert(`${msg}\n${state.teams.blue.name}: ${state.teams.blue.score} · ${state.teams.red.name}: ${state.teams.red.score}`);
  }

  function submit(team, raw = null, fromOption = false) {
    if (!state.running || !state.q) return;
    const t = state.teams[team];
    const given = fromOption ? raw : (raw ?? t.input);
    const ok = norm(given) === norm(state.q.answer);

    if (ok) {
      t.raw += 1;
      setFeedback(team, `✅ Correcte (${t.raw}/4)`, true);
      if (t.raw % state.questionsPerPoint === 0) {
        t.score += 1;
        state.rope += team === 'blue' ? -1 : 1;
        pulseRope();
      }
    } else {
      setFeedback(team, `❌ Incorrecte. Correcta: ${state.q.answer}`, false);
      state.rope += team === 'blue' ? 0.35 : -0.35;
      pulseRope();
    }

    t.input = '';
    updateHud();

    if (t.score >= state.pointsToWin || Math.abs(state.rope) >= state.limit) {
      finish();
      return;
    }

    state.q = generateQuestion();
    renderQuestion();
  }

  function start() {
    state.moduleId = els.module.value;
    state.module = getMods().find((m) => m.id === state.moduleId) || null;
    state.cfg = { level: Number(els.level.value) || 1, options: collectOptions() };

    state.teams.blue.name = els.blueName.value.trim() || 'Equip blau';
    state.teams.red.name = els.redName.value.trim() || 'Equip vermell';
    state.teams.blue.score = 0; state.teams.red.score = 0;
    state.teams.blue.raw = 0; state.teams.red.raw = 0;
    state.teams.blue.input = ''; state.teams.red.input = '';
    state.rope = 0;
    state.time = 0;
    state.running = true;

    setFeedback('blue', 'Preparat/ada!', true);
    setFeedback('red', 'Preparat/ada!', true);
    state.q = generateQuestion();
    renderQuestion();
    updateHud();

    clearInterval(state.timer);
    state.timer = setInterval(() => {
      if (!state.running) return;
      state.time += 1;
      els.timer.textContent = fmt(state.time);
    }, 1000);
  }

  function buildKeypad(team, wrap) {
    ['7','8','9','4','5','6','1','2','3','0'].forEach((n) => {
      const b = document.createElement('button');
      b.className = 'k';
      b.type = 'button';
      b.textContent = n;
      b.addEventListener('click', () => {
        if (!state.running) return;
        state.teams[team].input = `${state.teams[team].input}${n}`.slice(0, 24);
      });
      wrap.appendChild(b);
    });

    const clear = document.createElement('button');
    clear.className = 'k';
    clear.textContent = 'Esborrar';
    clear.type = 'button';
    clear.addEventListener('click', () => {
      state.teams[team].input = '';
      updateHud();
    });

    const send = document.createElement('button');
    send.className = 'k send';
    send.type = 'button';
    send.textContent = 'Enviar';
    send.addEventListener('click', () => submit(team));

    wrap.appendChild(clear);
    wrap.appendChild(send);
  }

  function init() {
    const mods = getMods();
    els.module.innerHTML = mods.map((m) => `<option value="${m.id}">${m.name}</option>`).join('');
    state.moduleId = mods[0]?.id || 'arith';
    state.module = mods[0] || null;
    els.module.value = state.moduleId;

    renderModuleConfig();
    els.module.addEventListener('change', () => {
      state.moduleId = els.module.value;
      state.module = getMods().find((m) => m.id === state.moduleId) || null;
      renderModuleConfig();
    });

    els.start.addEventListener('click', start);
    buildKeypad('blue', els.kpBlue);
    buildKeypad('red', els.kpRed);
    updateHud();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
