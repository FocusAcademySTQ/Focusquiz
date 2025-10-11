/* ===================== UTILS ===================== */

function showModal(contentHTML){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.innerHTML = `<div class="modal-inner panel card" role="dialog" aria-modal="true">${contentHTML}</div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeModal(); });
}

function closeModal(){
  const m = document.querySelector('.modal');
  if(m) m.remove();
  printableEditorState = null;
}

const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));
const rng = (a,b)=> Math.floor(Math.random()*(b-a+1))+a;
const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];
const clamp = (x,a,b)=> Math.max(a, Math.min(b,x));
const gcd = (a,b)=>{ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b] } return a||1 };
const simplifyFrac = (n,d)=>{ const g=gcd(n,d); return [n/g, d/g] };
const escapeHTML = (str = '') => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const MAX_RESULTS_PER_USER = 250;
const LEGACY_RESULT_KEYS = [
  'focus-results',
  'focus-results-v1',
  'focusResults',
  'focus-academy-results',
  'focus-math-results'
];

const PRINTABLE_STORAGE_KEYS = [
  'focus-printable-sets-v1',
  'focus-printable-sets',
  'focus-printables',
  'focusPrintables'
];
let activePrintableStorageKey = PRINTABLE_STORAGE_KEYS[0];

function sanitizeResultEntry(entry = {}, fallbackName = 'Anònim') {
  const safeNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const safeString = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    return String(value);
  };

  const wrongs = Array.isArray(entry.wrongs) ? entry.wrongs : [];
  const cleanedWrongs = wrongs.map((w = {}) => {
    const expected = 'answer' in w ? w.answer : null;
    return {
      text: safeString(w.text),
      user: safeString(w.user),
      correct: safeString(expected !== null ? fmtAns(expected) : ''),
      answer: expected,
      expected
    };
  });

  return {
    at: safeString(entry.at, new Date().toISOString()),
    name: safeString(entry.name, fallbackName),
    module: safeString(entry.module, 'desconegut'),
    level: safeNumber(entry.level, 0),
    levelLabel: safeString(entry.levelLabel, ''),
    count: safeNumber(entry.count, 0),
    correct: safeNumber(entry.correct, 0),
    time_limit: safeNumber(entry.time_limit, 0),
    time_spent: safeNumber(entry.time_spent, 0),
    score: safeNumber(entry.score, 0),
    wrongs: cleanedWrongs
  };
}

function isQuotaError(err){
  return !!err && (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.code === 22 ||
    err.code === 1014
  );
}

const store = {
  get k() { return 'focus-math-results-v1'; },

  currentUser() {
    return localStorage.getItem('lastStudent') || null;
  },

  defaultUser() {
    return this.currentUser() || 'Anònim';
  },

  load() {
    try {
      const raw = JSON.parse(localStorage.getItem(this.k) || '{}');
      if (Array.isArray(raw)) {
        const user = this.defaultUser();
        const migrated = { [user]: raw };
        localStorage.setItem(this.k, JSON.stringify(migrated));
        return migrated;
      }
      if (!raw || typeof raw !== 'object') return {};
      return raw;
    } catch {
      return {};
    }
  },

  loadWithLegacy() {
    const data = this.load();
    if (Object.keys(data).length) return data;

    const merged = {};
    LEGACY_RESULT_KEYS.forEach((key) => {
      try {
        const legacyRaw = localStorage.getItem(key);
        if (!legacyRaw) return;
        const parsed = JSON.parse(legacyRaw);
        const entries = Array.isArray(parsed) ? parsed : [];
        if (!entries.length) return;
        const user = this.defaultUser();
        merged[user] = (merged[user] || []).concat(entries.map(e => sanitizeResultEntry(e, user)));
        localStorage.removeItem(key);
      } catch {
        // ignore legacy errors and move on
      }
    });

    if (Object.keys(merged).length) {
      localStorage.setItem(this.k, JSON.stringify(merged));
    }
    return Object.keys(merged).length ? merged : data;
  },

  all(options = {}) {
    const data = this.loadWithLegacy();
    const scope = options.scope || 'current';

    const sortDesc = (entries) => entries.slice().sort((a, b) => {
      const timeB = new Date(b.at).getTime() || 0;
      const timeA = new Date(a.at).getTime() || 0;
      return timeB - timeA;
    });

    if (scope === 'all') {
      const merged = Object.values(data)
        .reduce((acc, entries) => acc.concat(entries || []), []);
      return sortDesc(merged);
    }

    const targetUser = options.user !== undefined ? options.user : this.currentUser();
    if (targetUser && Array.isArray(data[targetUser])) {
      return sortDesc(data[targetUser]);
    }

    const fallbackUser = 'Anònim';
    if (!targetUser && Array.isArray(data[fallbackUser])) {
      return sortDesc(data[fallbackUser]);
    }

    const firstAvailable = Object.values(data).find(Array.isArray);
    return firstAvailable ? sortDesc(firstAvailable) : [];
  },

  save(entry) {
    const current = this.currentUser();
    const user = current && current.trim() ? current.trim() : 'Anònim';
    const data = this.loadWithLegacy();
    if (!Array.isArray(data[user])) data[user] = [];
    const bucket = data[user];

    if (bucket.length >= MAX_RESULTS_PER_USER) {
      bucket.splice(0, bucket.length - (MAX_RESULTS_PER_USER - 1));
    }

    const sanitized = sanitizeResultEntry({ ...entry, name: user }, user);
    bucket.push(sanitized);

    const persist = () => localStorage.setItem(this.k, JSON.stringify(data));

    try {
      persist();
      return;
    } catch (err) {
      if (!isQuotaError(err)) throw err;
    }

    const pruneOldest = () => {
      let oldestUser = null;
      let oldestIndex = -1;
      let oldestTime = Infinity;
      for (const [name, entries] of Object.entries(data)) {
        if (!Array.isArray(entries) || !entries.length) continue;
        entries.forEach((item, idx) => {
          const stamp = new Date(item && item.at ? item.at : 0).getTime();
          const time = Number.isFinite(stamp) ? stamp : 0;
          if (time < oldestTime) {
            oldestTime = time;
            oldestUser = name;
            oldestIndex = idx;
          }
        });
      }
      if (oldestUser === null || oldestIndex < 0) return false;
      const target = data[oldestUser];
      if (Array.isArray(target)) {
        target.splice(oldestIndex, 1);
        if (!target.length) delete data[oldestUser];
      }
      return true;
    };

    let trimmed = false;
    while (pruneOldest()) {
      trimmed = true;
      try {
        persist();
        if (trimmed) {
          console.warn("S'ha alliberat espai eliminant resultats antics per poder guardar els nous.");
        }
        return;
      } catch (err) {
        if (!isQuotaError(err)) throw err;
      }
    }

    throw new Error('No hi ha espai suficient a localStorage per guardar més resultats.');
  },

  clear() {
    const user = this.defaultUser();
    const data = this.loadWithLegacy();
    if (user in data) delete data[user];
    const remaining = Object.keys(data).length;
    if (!remaining) localStorage.removeItem(this.k);
    else localStorage.setItem(this.k, JSON.stringify(data));
  }
};

const fmtTime = (sec)=>{
  const m = Math.floor(sec/60), s = sec%60;
  return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

/* ===================== APP STATE ===================== */

const MODULES = [];
// Registre de mòduls externs (p.ex. llengua) i refresc de la Home
window.addModules = function(mods){
  if(!Array.isArray(mods)) return;
  mods.forEach(m => MODULES.push(m));
  if (document.readyState !== 'loading') {
    try { buildHome(); } catch {}
  } else {
    document.addEventListener('DOMContentLoaded', ()=>{ try { buildHome(); } catch {} });
  }
};

// Si altres scripts han registrat mòduls abans que addModules existís, afegeix-los ara.
['_PENDING_MATH_MODULES_', '_PENDING_CAT_MODULES_', '_PENDING_GEO_MODULES_', '_PENDING_CHEM_MODULES_']
  .forEach((key)=>{
    const pending = window[key];
    if(Array.isArray(pending)){
      window.addModules(pending);
      delete window[key];
    }
  });

let pendingModule = null; // mòdul seleccionat per configurar
const DEFAULTS = { count: 10, time: 0, level: 1 };
let session = null;
let timerHandle = null;
let printableEditorState = null;

/* ===================== VIEWS ===================== */

function showView(name){
  ['home','config','quiz','results','about'].forEach(v=> $('#view-'+v).classList.toggle('hidden', v!==name));
  $$('.nav-btn[data-view]').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.view === name);
  });
  if(name==='results') renderResults();
}

function buildHome(){
  const grid = $('#moduleGrid'); 
  grid.innerHTML = '';

  // Helper per pintar seccions per categories
  function renderSection(title, cat){
    const mods = MODULES.filter(m=>m.category===cat);
    if(!mods.length) return;
    const section = document.createElement('div');
    section.innerHTML = `<div class="section-title">${title}</div>`;
    const subgrid = document.createElement('div');
    subgrid.className = 'grid';
    mods.forEach(m=>{
      const el = document.createElement('div');
      el.className='option';
      const badge = m.badge ? `<span class="option-badge">${m.badge}</span>` : '';
      el.innerHTML = `
        ${badge}
        <h3>${m.name}</h3>
        <p>${m.desc}</p>`;
      el.onclick = ()=> openConfig(m.id);
      subgrid.appendChild(el);
    });
    section.appendChild(subgrid);
    grid.appendChild(section);
  }

  // Seccions
  renderSection('Mòduls de matemàtiques','math');
  renderSection('Mòduls de llengua catalana','cat');
  renderSection('Mòduls de ciències (en manteniment, no utilitzar)','sci');
  renderSection('Mòduls de llengua anglesa','ang');
  renderSection('Mòduls de geografia','geo');
  renderSection('Mòduls de repàs','rep');

  // filtre resultats
  const fm = $('#filter-module');
  fm.innerHTML = `<option value="">Tots</option>` + MODULES.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');

  // nivells 1..4
  const sl = $('#cfg-level');
  sl.innerHTML = Array.from({length:4},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
  sl.value = DEFAULTS.level;
}

function openConfig(moduleId){
  pendingModule = MODULES.find(m=>m.id===moduleId) || MODULES[0];
  $('#cfg-title').textContent = `Configura: ${pendingModule.name}`;
  $('#cfg-desc').textContent = pendingModule.desc;

  // valors per defecte
  $('#cfg-count').value = DEFAULTS.count;
  $('#cfg-time').value = DEFAULTS.time;
  const levelSelect = $('#cfg-level');
  const levelWrap = $('#cfg-level-wrap');
  const usesLevels = pendingModule?.usesLevels !== false;
  if (levelSelect) {
    levelSelect.value = String(usesLevels ? DEFAULTS.level : 4);
    levelSelect.disabled = !usesLevels;
    levelSelect.tabIndex = usesLevels ? 0 : -1;
  }
  if (levelWrap) {
    levelWrap.classList.toggle('hidden', !usesLevels);
  }

  // Opcions específiques
  const box = document.createElement('div');
  box.className = 'card';
  const wrap = document.createElement('div');

  if(pendingModule.id === 'arith'){
    wrap.innerHTML = `
      <div class="section-title">Opcions d'aritmètica</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Operacions">
          <label class="toggle"><input class="check" type="checkbox" id="op-plus" checked> Sumes</label>
          <label class="toggle"><input class="check" type="checkbox" id="op-minus" checked> Restes</label>
          <label class="toggle"><input class="check" type="checkbox" id="op-times" checked> Multiplicacions</label>
          <label class="toggle"><input class="check" type="checkbox" id="op-div" checked> Divisions</label>
        </div>
      </div>
      <div class="controls">
        <label class="toggle"><input class="check" type="checkbox" id="allow-neg"> Permetre negatius</label>
        <label class="toggle"><input class="check" type="checkbox" id="tri-numbers"> Operar amb 3 números</label>
      </div>
    `;
  } else if(pendingModule.id === 'frac'){
    wrap.innerHTML = `
      <div class="section-title">Opcions de fraccions</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes de fraccions">
          <label class="toggle"><input class="check" type="radio" name="frac-sub" value="identify" checked> Identificar (imatge → fracció)</label>
          <label class="toggle"><input class="check" type="radio" name="frac-sub" value="arith"> Aritmètica</label>
          <label class="toggle"><input class="check" type="radio" name="frac-sub" value="simplify"> Simplificar</label>
        </div>
      </div>
      <div class="controls">
        <label class="toggle"><input class="check" type="checkbox" id="frac-mixed-grids" checked> Formes i grills variats</label>
        <label class="toggle"><input class="check" type="checkbox" id="frac-force-simplest"> Obliga forma més simple</label>
      </div>
    `;
  } else if(pendingModule.id === 'geom'){
    wrap.innerHTML = `
      <div class="section-title">Àrees, perímetres i volums</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Abast">
          <label class="toggle"><input class="check" type="radio" name="geom-scope" value="area" checked> Àrea</label>
          <label class="toggle"><input class="check" type="radio" name="geom-scope" value="perim"> Perímetre</label>
          <label class="toggle"><input class="check" type="radio" name="geom-scope" value="both"> Àrea + Perímetre</label>
          <label class="toggle"><input class="check" type="radio" name="geom-scope" value="vol"> Volum</label>
        </div>
      </div>
      <div class="controls">
        <div class="group" role="group" aria-label="Figures">
          <label class="toggle"><input class="check" type="checkbox" id="g-rect" checked> Rectangles/quadrats</label>
          <label class="toggle"><input class="check" type="checkbox" id="g-tri" checked> Triangles</label>
          <label class="toggle"><input class="check" type="checkbox" id="g-circ" checked> Cercles</label>
          <label class="toggle"><input class="check" type="checkbox" id="g-poly"> Polígons regulars</label>
          <label class="toggle"><input class="check" type="checkbox" id="g-grid"> Graella</label>
          <label class="toggle"><input class="check" type="checkbox" id="g-comp"> Figures compostes</label>
          <label class="toggle"><input class="check" type="checkbox" id="g-cube"> Cub/Cuboid</label>
          <label class="toggle"><input class="check" type="checkbox" id="g-cylinder"> Cilindre</label>
        </div>
      </div>
      <div class="controls">
        <label class="field chip">Unitats
          <select id="geom-units"><option>cm</option><option>m</option></select>
        </label>
        <label class="field chip">Arrodoniment
          <select id="geom-round"><option value="0">sense</option><option value="1">1</option><option value="2" selected>2</option><option value="3">3</option></select>
        </label>
        <label class="field chip">Mode cercles
          <select id="geom-circle-mode"><option value="numeric" selected>Numèric</option><option value="pi-exacte">Exacte amb π</option></select>
        </label>
      </div>
      <div class="controls">
        <label class="toggle"><input class="check" type="checkbox" id="geom-require-units"> Exigir unitats a la resposta</label>
      </div>
    `;
  } else if(pendingModule.id === 'stats'){
    wrap.innerHTML = `
      <div class="section-title">Estadística bàsica</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes d'estadística">
          <label class="toggle"><input class="check" type="radio" name="stats-sub" value="mmm" checked> Mitjana, mediana, moda</label>
          <label class="toggle"><input class="check" type="radio" name="stats-sub" value="range-dev"> Rang i desviació</label>
          <label class="toggle"><input class="check" type="radio" name="stats-sub" value="graphs"> Representació gràfica</label>
        </div>
      </div>
      <div class="controls">
        <label class="field chip">Decimals resultat
          <select id="stats-round"><option value="0">0</option><option value="1">1</option><option value="2" selected>2</option></select>
        </label>
      </div>
    `;
  } else if(pendingModule.id === 'units'){
    wrap.innerHTML = `
      <div class="section-title">Unitats i conversions</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes de conversions">
          <label class="toggle"><input class="check" type="radio" name="units-sub" value="length" checked> Longitud</label>
          <label class="toggle"><input class="check" type="radio" name="units-sub" value="mass"> Massa</label>
          <label class="toggle"><input class="check" type="radio" name="units-sub" value="volume"> Volum</label>
          <label class="toggle"><input class="check" type="radio" name="units-sub" value="area"> Superfície</label>
          <label class="toggle"><input class="check" type="radio" name="units-sub" value="time"> Temps</label>
        </div>
      </div>
      <div class="controls">
        <label class="field chip">Decimals resultat
          <select id="units-round"><option value="0">0</option><option value="1">1</option><option value="2" selected>2</option></select>
        </label>
        <span class="subtitle">Escriu <b>només el nombre</b> (la unitat ja surt a l'enunciat).</span>
      </div>
    `;
  } else if(pendingModule.id === 'eq'){
    wrap.innerHTML = `
<div class="section-title">Equacions · Format</div>
<div class="controls">
  <div class="group" role="group" aria-label="Format de les equacions">
    <label class="toggle"><input class="check" type="radio" name="eq-format" value="normal" checked> Normals</label>
    <label class="toggle"><input class="check" type="radio" name="eq-format" value="frac"> Amb fraccions</label>
    <label class="toggle"><input class="check" type="radio" name="eq-format" value="par"> Amb parèntesis</label>
    <label class="toggle"><input class="check" type="radio" name="eq-format" value="sys"> Sistemes d'equacions</label>
  </div>
</div>

<div class="section-title">Grau de les equacions</div>
<div class="controls">
  <div class="group" role="group" aria-label="Grau de les equacions">
    <label class="toggle"><input class="check" type="radio" name="eq-degree" value="1" checked> 1r grau</label>
    <label class="toggle"><input class="check" type="radio" name="eq-degree" value="2"> 2n grau</label>
    <label class="toggle"><input class="check" type="radio" name="eq-degree" value="mixed"> Barrejats</label>
  </div>
</div>

<div class="section-title">Opcions</div>
<div class="controls">
  <label class="field chip">Coeficients (rang)
    <select id="eq-range">
      <option value="small" selected>petits (−9…9)</option>
      <option value="med">mitjans (−20…20)</option>
      <option value="big">grans (−60…60)</option>
    </select>
  </label>
  <label class="toggle"><input class="check" type="checkbox" id="eq-int-sol" checked> Força solucions enteres</label>
  <label class="toggle"><input class="check" type="checkbox" id="eq-incomplete"> Inclou incompletes (només 2n grau)</label>
  <label class="toggle"><input class="check" type="checkbox" id="eq-hints"> Mostrar pistes</label>
</div>

<div class="subtitle">Format de resposta: <b>x=3</b> o <b>3</b>; per sistemes <b>(2, -1)</b> o <b>2,-1</b>; fraccions <b>3/4</b> o decimals.</div>
`;
  } else if(pendingModule.id === 'func'){
    wrap.innerHTML = `
<div class="section-title">Estudi de funcions</div>
<div class="controls">
  <div class="group" role="group" aria-label="Tipus de funcions">
    <label class="toggle"><input class="check" type="checkbox" id="f-lin" checked> Lineals</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-quad" checked> Quadràtiques</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-poly" checked> Polinòmiques</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-rac" checked> Racionals</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-rad" checked> Radicals</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-exp" checked> Exponencials</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-log" checked> Logarítmiques</label>
  </div>
</div>
<div class="controls">
  <div class="group" role="group" aria-label="Aspectes a estudiar">
    <label class="toggle"><input class="check" type="checkbox" id="f-type" checked> Identificar tipus</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-domain"> Domini i recorregut</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-intercepts"> Punts de tall</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-symmetry"> Simetria</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-limits"> Límits</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-extrema"> Extrems relatius</label>
    <label class="toggle"><input class="check" type="checkbox" id="f-monotony"> Monotonia</label>
  </div>
</div>
<div class="controls">
  <label class="field chip">Dificultat
    <select id="func-diff">
      <option value="1" selected>Bàsic</option>
      <option value="2">Intermedi</option>
      <option value="3">Avançat</option>
      <option value="4">Expert</option>
    </select>
  </label>
</div>
`;
  } else {
    wrap.innerHTML = `<div class="section-title">Opcions específiques</div>
      <p class="subtitle">Aquest mòdul no té opcions específiques addicionals (de moment).</p>`;
  }

   box.appendChild(wrap);
  const holder = $('#cfg-specific');
  holder.innerHTML = '';

  // 🔌 Permet que un mòdul extern defineixi la seva UI de configuració
  if (pendingModule.config && typeof pendingModule.config.render === 'function') {
    const custom = document.createElement('div');
    custom.className = 'card';
    custom.appendChild(pendingModule.config.render());
    holder.appendChild(custom);
  } else {
    holder.appendChild(box);
  }

  const printBtn = $('#btnPrintSet');
  if (printBtn) {
    const isMath = pendingModule?.category === 'math';
    printBtn.classList.toggle('hidden', !isMath);
    printBtn.disabled = !isMath;
    printBtn.tabIndex = isMath ? 0 : -1;
    if (isMath) {
      printBtn.title = `Descarrega una fitxa en PDF de ${pendingModule.name}`;
    }
  }

  showView('config');
}

function collectConfigValues(){
  if(!pendingModule) return null;
  const count = parseInt($('#cfg-count').value||DEFAULTS.count);
  const time = parseInt($('#cfg-time').value||0);
  const levelSelect = $('#cfg-level');
  const usesLevels = pendingModule?.usesLevels !== false;
  const rawLevel = parseInt(levelSelect?.value || (usesLevels ? DEFAULTS.level : 4));
  const level = usesLevels ? clamp(rawLevel, 1, 4) : clamp(rawLevel || 4, 1, 4);
  const options = {};

  if(pendingModule.id==='arith'){
    const ops = [];
    if($('#op-plus').checked) ops.push('+');
    if($('#op-minus').checked) ops.push('-');
    if($('#op-times').checked) ops.push('×');
    if($('#op-div').checked) ops.push('÷');
    if(!ops.length){ alert('Selecciona almenys una operació.'); return null; }
    options.ops = ops;
    options.allowNeg = !!$('#allow-neg').checked;
    options.tri = !!$('#tri-numbers').checked;
  } else if(pendingModule.id==='frac'){
    const sub = document.querySelector('input[name="frac-sub"]:checked')?.value || 'identify';
    options.sub = sub;
    options.mixedGrids = !!$('#frac-mixed-grids')?.checked;
    options.forceSimplest = !!$('#frac-force-simplest')?.checked;
  } else if(pendingModule.id==='geom'){
    options.scope = document.querySelector('input[name="geom-scope"]:checked')?.value || 'area';
    options.fig = {
      rect: !!$('#g-rect')?.checked,
      tri: !!$('#g-tri')?.checked,
      circ: !!$('#g-circ')?.checked,
      poly: !!$('#g-poly')?.checked,
      grid: !!$('#g-grid')?.checked,
      comp: !!$('#g-comp')?.checked,
      cube: !!$('#g-cube')?.checked,
      cylinder: !!$('#g-cylinder')?.checked,
    };
    options.units = $('#geom-units').value || 'cm';
    options.round = parseInt($('#geom-round').value||'2');
    options.circleMode = $('#geom-circle-mode').value || 'numeric';
    options.requireUnits = !!$('#geom-require-units')?.checked;
  } else if(pendingModule.id==='stats'){
    options.sub = document.querySelector('input[name="stats-sub"]:checked')?.value || 'mmm';
    options.round = parseInt($('#stats-round').value || '2');
  } else if(pendingModule.id==='units'){
    options.sub = document.querySelector('input[name="units-sub"]:checked')?.value || 'length';
    options.round = parseInt($('#units-round').value || '2');
  } else if(pendingModule.id==='eq'){
    options.format = document.querySelector('input[name="eq-format"]:checked')?.value || 'normal';
    options.degree = document.querySelector('input[name="eq-degree"]:checked')?.value || '1';
    options.range = ($('#eq-range').value || 'small');
    options.forceInt = !!$('#eq-int-sol')?.checked;
    options.allowIncomplete = !!$('#eq-incomplete')?.checked;
    options.hints = !!$('#eq-hints')?.checked;
  } else if(pendingModule.id==='func'){
    options.types = {
      lin: !!$('#f-lin')?.checked,
      quad: !!$('#f-quad')?.checked,
      poly: !!$('#f-poly')?.checked,
      rac: !!$('#f-rac')?.checked,
      rad: !!$('#f-rad')?.checked,
      exp: !!$('#f-exp')?.checked,
      log: !!$('#f-log')?.checked
    };
    options.aspects = {
      type: !!$('#f-type')?.checked,
      domain: !!$('#f-domain')?.checked,
      intercepts: !!$('#f-intercepts')?.checked,
      symmetry: !!$('#f-symmetry')?.checked,
      limits: !!$('#f-limits')?.checked,
      extrema: !!$('#f-extrema')?.checked,
      monotony: !!$('#f-monotony')?.checked
    };
    options.difficulty = parseInt($('#func-diff').value || '1');
  }

  if (pendingModule && pendingModule.config && typeof pendingModule.config.collect === 'function') {
    const ext = pendingModule.config.collect();
    if (ext && typeof ext === 'object') Object.assign(options, ext);
  }

  return { count, time, level, options };
}

function startFromConfig(){
  const cfg = collectConfigValues();
  if(!cfg) return;
  startQuiz(pendingModule.id, cfg);
}

function downloadActivitiesFromConfig(){
  const cfg = collectConfigValues();
  if(!cfg) return;
  if(!pendingModule || pendingModule.category !== 'math'){
    alert('Aquest mòdul no admet fitxes imprimibles.');
    return;
  }
  openPrintableEditor(pendingModule, cfg);
}

/* ===================== QUIZ ENGINE ===================== */

function startQuiz(moduleId, cfg){
  const module = MODULES.find(m=>m.id===moduleId) || MODULES[0];
  const count = clamp(parseInt(cfg.count)||10, 1, 200);
  const time = clamp(parseInt(cfg.time)||0, 0, 180);
  const usesLevels = module?.usesLevels !== false;
  const rawLevel = parseInt(cfg.level);
  const genLevel = usesLevels ? clamp(rawLevel||1, 1, 4) : clamp(rawLevel||4, 1, 4);
  const levelLabel = usesLevels ? `Nivell ${genLevel}` : (module?.levelLabel || 'Mode lliure');
  const storedLevel = usesLevels ? genLevel : 0;

  session = {
    module: moduleId,
    count, time, level: storedLevel,
    idx: 0,
    correct: 0,
    wrongs: [],
    startedAt: Date.now(),
    secondsLeft: time>0 ? time*60 : 0,
    questions: [],
    options: cfg.options || {},
    levelLabel
  };

  for(let i=0;i<count;i++) session.questions.push(module.gen(genLevel, session.options));

  $('#qModule').textContent = module.name;
  $('#qLevel').textContent = session.levelLabel;
  $('#feedback').innerHTML='';
  $('#answer').value='';
  updateProgress();
  showView('quiz');
  renderQuestion();
  stopTimer();
  if(time>0) startTimer(); else $('#timer').textContent='Sense límit';
  $('#answer').focus();
}

// Nova: començar amb preguntes existents (repàs d'errors)
function startQuizFromExisting(moduleId, options, questions, meta={}){
  const module = MODULES.find(m=>m.id===moduleId) || MODULES[0];
  const normalized = Array.isArray(questions) ? questions.map(q => ({
    type: q.type,
    text: q.text,
    title: q.title,
    html: q.html,
    answer: q.answer,
    meta: q.meta,
    numeric: q.numeric,
    piCoef: q.piCoef,
    sol: q.sol,
    sols: q.sols
  })) : [];
  const opts = options ? JSON.parse(JSON.stringify(options)) : {};
  const level = meta.level !== undefined ? meta.level : 0;
  const timeLimit = meta.time ? Math.max(0, parseInt(meta.time)) : 0;

  session = {
    module: moduleId,
    count: normalized.length,
    time: timeLimit,
    level,
    idx: 0,
    correct: 0,
    wrongs: [],
    startedAt: Date.now(),
    secondsLeft: timeLimit>0 ? timeLimit*60 : 0,
    questions: normalized,
    options: opts,
    levelLabel: meta.levelLabel || (level>0 ? `Nivell ${level}` : 'Personalitzat')
  };

  const moduleName = module?.name || moduleId;
  const label = meta.label === undefined ? "Repàs d'errors" : meta.label;
  const title = meta.title || (label ? `${moduleName} (${label})` : moduleName);
  $('#qModule').textContent = title;
  $('#qLevel').textContent = session.levelLabel;
  $('#feedback').innerHTML='';
  $('#answer').value='';
  updateProgress();
  showView('quiz');
  renderQuestion();
  stopTimer();
  if(timeLimit>0){
    startTimer();
  } else {
    $('#timer').textContent='Sense límit';
  }
  $('#answer').focus();
}

function renderQuestion(){
  const q = session.questions[session.idx];
  $('#qMeta').textContent = `Pregunta ${session.idx+1} de ${session.count}`;
  $('#qText').innerHTML = q.title || q.text;
  $('#qMedia').innerHTML = q.html ? `<div class="fade-in">${q.html}</div>` : '';
  $('#answer').value = '';
  $('#feedback').innerHTML = '';
  const rightCol = $('#rightCol');
  const keypad = $('#keypad');
  if (keypad) keypad.innerHTML = ''; // neteja sempre

  const mod = MODULES.find(m => m.id === session.module);
  const quizEl = document.querySelector('.quiz');

  const toggleRightCol = (show) => {
    if (rightCol) {
      rightCol.classList.toggle('hidden', !show);
    }
    if (quizEl) {
      quizEl.classList.toggle('no-right', !show);
    }
  };
  toggleRightCol(true);

  if (mod?.category === 'cat') {
    // 🔹 Català → sense teclat numèric; amaguem la columna si no cal
    quizEl.classList.remove('sci-mode');
    $('#answer').type = 'text';
    $('#answer').removeAttribute('inputmode');

    const hasOptions = Array.isArray(q.options) && q.options.length;

    if (hasOptions) {
      $('#answer').style.display = 'none';
      const optionsHtml = q.options.map(opt => `
        <button class="option" onclick="$('#answer').value='${opt}'; checkAnswer()">${opt}</button>
      `).join('');
      if (keypad) keypad.innerHTML = `<div class="options">${optionsHtml}</div>`;
      toggleRightCol(true);
    } else {
      $('#answer').style.display = 'block';
      toggleRightCol(false);
    }

  } else if (mod?.category === 'geo') {
    // 🔹 Geografia → textual o banderes
    quizEl.classList.remove('sci-mode');
    $('#answer').type = 'text';
    $('#answer').removeAttribute('inputmode');

    const hasOptions = Array.isArray(q.options) && q.options.length;

    if (hasOptions) {
      $('#answer').style.display = 'none';
      const optionsHtml = q.options.map(opt => `
        <button class="option" onclick="$('#answer').value='${opt}'; checkAnswer()">${opt}</button>
      `).join('');
      if (keypad) keypad.innerHTML = `<div class="options">${optionsHtml}</div>`;
      toggleRightCol(true);
    } else {
      $('#answer').style.display = 'block';
      toggleRightCol(false);
    }

  } else if (mod?.category === 'sci') {
    // 🔹 Química → sense columna dreta
    quizEl.classList.add('sci-mode');
    $('#answer').type = 'text';
    $('#answer').removeAttribute('inputmode');
    $('#answer').style.display = q.options ? 'none' : 'block';
    toggleRightCol(false);

    if (q.options && Array.isArray(q.options)) {
      const optionsHtml = q.options.map(opt => `
        <button class="option" onclick="$('#answer').value='${opt}'; checkAnswer()">${opt}</button>
      `).join('');
      $('#qMedia').innerHTML += `<div class="options">${optionsHtml}</div>`;
    }

  } else {
    // 🔹 Matemàtiques → teclat numèric a la dreta
    quizEl.classList.remove('sci-mode');
    $('#answer').style.display = 'block';
    $('#answer').type = 'text';
    $('#answer').setAttribute('inputmode','decimal');
    toggleRightCol(true);
    renderKeypad();
  }
}

function renderKeypad(){
  $('#keypad').innerHTML = `
    <h3 class="title" style="margin-top:0">Teclat numèric</h3>
    <div class="board">
      <button onclick="typeKey('7')">7</button>
      <button onclick="typeKey('8')">8</button>
      <button onclick="typeKey('9')">9</button>
      <button onclick="typeKey('4')">4</button>
      <button onclick="typeKey('5')">5</button>
      <button onclick="typeKey('6')">6</button>
      <button onclick="typeKey('1')">1</button>
      <button onclick="typeKey('2')">2</button>
      <button onclick="typeKey('3')">3</button>
      <button onclick="typeKey('0')">0</button>
      <button onclick="typeKey('-')">±</button>
      <button onclick="typeKey('del')">⌫</button>
    </div>
    <div style="margin-top:10px; display:flex; gap:10px; align-items:center">
      <span class="kbd">↵</span> <span class="subtitle">comprova</span>
      <span class="kbd">→</span> <span class="subtitle">omet</span>
    </div>
  `;
}


function updateProgress(){
  const pct = (session.idx / session.count) * 100;
  $('#bar').style.width = pct + '%';
}

function startTimer(){
  $('#timer').textContent = fmtTime(session.secondsLeft);
  timerHandle = setInterval(()=>{
    session.secondsLeft--;
    $('#timer').textContent = fmtTime(Math.max(0, session.secondsLeft));
    if(session.secondsLeft<=0){
      stopTimer();
      finishQuiz(true);
    }
  }, 1000);
}

function stopTimer(){ if(timerHandle) clearInterval(timerHandle); timerHandle=null; }

/* ===================== CHECK ANSWER ===================== */

function roundTo(x, d){ const k = Math.pow(10,d); return Math.round(x*k)/k; }
function equalsTol(a,b,eps=1e-6){ return Math.abs(a-b) <= eps; }

function parsePiAnswer(raw){
  const s = String(raw).trim().toLowerCase().replace(/\s+/g,'');
  const replaced = s.replace('×','*').replace(/\*/g,'');
  if(replaced.includes('π')) return parseFloat(replaced.replace('π',''));
  if(replaced.includes('pi')) return parseFloat(replaced.replace('pi',''));
  return NaN;
}

function splitUnits(raw){
  const s = String(raw).trim().replace(',', '.');
  const m = s.match(/^(-?\d+(?:\.\d+)?)(.*)$/);
  if(!m) return {num: NaN, units: ''};
  return { num: parseFloat(m[1]), units: m[2].trim() };
}

function normalizeUnits(u){
  if(!u) return '';
  return u.replace(/²/g,'^2').replace(/³/g,'^3').replace(/\s+/g,'').toLowerCase();
}

function normFrac(n, d){
  if(d===0) return [NaN, 0];
  if(d<0){ n = -n; d = -d; }
  const g = gcd(n, d);
  return [n/g, d/g];
}

function parseFrac(str){
  const s = String(str).trim().replace(',', '.');
  if(/^-?\d+\/-?\d+$/.test(s)){
    const [ns, ds] = s.split('/');
    return normFrac(parseInt(ns,10), parseInt(ds,10));
  }
  if(/^-?\d+(\.\d+)?$/.test(s)){
    const num = parseFloat(s);
    const k = (s.split('.')[1]||'').length;
    const den = Math.pow(10, k);
    return normFrac(Math.round(num*den), den);
  }
  return [NaN, 0];
}

/* ===== Helpers per a les equacions ===== */

function rngRangeKey(key){
  if(key==='small') return [-9, 9];
  if(key==='med')   return [-20, 20];
  return [-60, 60];
}

function parseNumberOrFrac(s){
  const v = parseFloat(String(s).replace(',', '.'));
  if(!Number.isNaN(v)) return v;
  const [n,d] = parseFrac(s);
  if(Number.isFinite(n) && Number.isFinite(d) && d!==0) return n/d;
  return NaN;
}

function parsePair(raw){
  const s = String(raw).trim()
    .replace(/\s+/g,'')
    .replace(/[()]/g,'')
    .replace(/x=/gi,'').replace(/y=/gi,'')
    .replace(/;/g,',');
  const parts = s.split(',');
  if(parts.length!==2) return [NaN, NaN];
  return [parseNumberOrFrac(parts[0]), parseNumberOrFrac(parts[1])];
}

function rootsFromRaw(raw){
  const s = String(raw).trim()
    .replace(/\s+/g,'')
    .replace(/[()]/g,'')
    .replace(/x1=|x2=|x=|r1=|r2=/gi,'')
    .replace(/;/g,',');
  const parts = s.split(',');
  if(parts.length===1){
    const v = parseNumberOrFrac(parts[0]);
    return [v];
  }
  return parts.map(parseNumberOrFrac);
}

function normalizeChemFormula(str) {
  if (!str) return '';
  const subMap = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉' };
  return str.trim()
    .replace(/\s+/g, '')
    .replace(/(\d)/g, d => subMap[d] || d)
    .toUpperCase();
}


function checkAnswer(){
  if(!session || session.done){ flashFeedback('Prova finalitzada. Torna a Inici.'); return }
  if(session.idx >= session.questions.length){
    finishQuiz(false);
    return;
  }
  const q = session.questions[session.idx];
  const raw = $('#answer').value.trim();
  if(raw==='') { flashFeedback('Escriu una resposta o prem Omet.', 'warn'); return; }

  let ok = false;

  // Fraccions
  if(q.type && q.type.startsWith('frac-')){
    const u = parseFrac(raw.replace(',', '.'));
    const a = parseFrac(q.answer);
    if(!Number.isFinite(u[0]) || !Number.isFinite(u[1]) || u[1]===0){
      ok = false;
    } else {
      ok = (u[0]*a[1] === a[0]*u[1]);
      if(ok && session.options && session.options.forceSimplest){
        const g = gcd(u[0], u[1]);
        if(g !== 1) ok = false;
      }
    }
  }

  // Geometria numèrica
  else if(q.type === 'geom-num'){
    const { requireUnits=false, units='cm', pow=0, round=2 } = q.meta || {};
    const tol = Math.pow(10, -(round+1));
    if(requireUnits){
      const {num, units: uIn} = splitUnits(raw);
      const norm = normalizeUnits(uIn);
      const expected = pow===2 ? `${units}^2` : (pow===3 ? `${units}^3` : `${units}`);
      ok = Number.isFinite(num) && equalsTol(num, q.numeric, tol) && norm===expected;
    } else {
      const num = parseFloat(raw.replace(',', '.'));
      ok = Number.isFinite(num) && equalsTol(num, q.numeric, tol);
    }
  }

  // Cercles exactes amb π
  else if(q.type === 'geom-pi'){
    const kUser = parsePiAnswer(raw);
    ok = Number.isFinite(kUser) && equalsTol(kUser, q.piCoef, 1e-9);
  }

  // Estadística numèrica
  else if(q.type && q.type.startsWith('stats-num')){
    const num = parseFloat(raw.replace(',', '.'));
    const tol = Math.pow(10, -((q.meta?.round||2)+1));
    ok = Number.isFinite(num) && equalsTol(num, q.numeric, tol);
  }

  // Estadística etiqueta (categoria)
  else if(q.type === 'stats-cat'){
    ok = raw.trim().toLowerCase() === String(q.answer).trim().toLowerCase();
  }

  // Conversions unitats
  else if(q.type && q.type.startsWith('units-')){
    const num = parseFloat(raw.replace(',', '.'));
    const tol = Math.pow(10, -((q.meta?.round||2)+1));
    ok = Number.isFinite(num) && equalsTol(num, q.numeric, tol);
  }

  // Equacions: primer grau
  else if(q.type === 'eq-lin'){
    const u = parseNumberOrFrac(raw);
    ok = Number.isFinite(u) && equalsTol(u, q.sol, 1e-6);
  }

  // Equacions: segon grau (dues arrels, ordre indiferent)
  else if(q.type === 'eq-quad'){
    const us = rootsFromRaw(raw).filter(Number.isFinite);
    if(us.length>=2){
      const [u1,u2] = us;
      const [a1,a2] = q.sols;
      ok = (equalsTol(u1,a1,1e-6) && equalsTol(u2,a2,1e-6)) ||
           (equalsTol(u1,a2,1e-6) && equalsTol(u2,a1,1e-6));
    } else {
      ok = false;
    }
  }

  // Sistemes 2x2: resposta com (x,y); també casos especials
  else if(q.type === 'eq-sys'){
    const [ux, uy] = parsePair(raw);
    ok = Number.isFinite(ux) && Number.isFinite(uy) &&
         equalsTol(ux, q.sol.x, 1e-6) && equalsTol(uy, q.sol.y, 1e-6);
    if(!ok && q.meta?.special){
      const s = raw.trim().toLowerCase();
      if(q.meta.special==='none') ok = /cap|sense|no\s*te|no\s*hi\s*ha/.test(s);
      if(q.meta.special==='inf')  ok = /infinit(es)?|inf/.test(s);
    }
  }

  // Equacions amb fraccions
  else if(q.type === 'eq-frac'){
    const u = parseNumberOrFrac(raw);
    ok = Number.isFinite(u) && equalsTol(u, q.sol, 1e-6);
  }

  // Equacions amb parèntesis
  else if(q.type === 'eq-par'){
    const u = parseNumberOrFrac(raw);
    ok = Number.isFinite(u) && equalsTol(u, q.sol, 1e-6);
  }

  // Funcions
  else if(q.type && q.type.startsWith('func-')){
    const userAnswer = raw.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/á/gi, 'a').replace(/é/gi, 'e').replace(/í/gi, 'i').replace(/ó/gi, 'o').replace(/ú/gi, 'u')
      .replace(/à/gi, 'a').replace(/è/gi, 'e').replace(/ì/gi, 'i').replace(/ò/gi, 'o').replace(/ù/gi, 'u')
      .trim();

    const correctAnswer = String(q.answer).toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/á/gi, 'a').replace(/é/gi, 'e').replace(/í/gi, 'i').replace(/ó/gi, 'o').replace(/ú/gi, 'u')
      .replace(/à/gi, 'a').replace(/è/gi, 'e').replace(/ì/gi, 'i').replace(/ò/gi, 'o').replace(/ù/gi, 'u')
      .trim();

    ok = userAnswer === correctAnswer;

    if (!ok && q.meta && q.meta.numeric) {
      const num = parseFloat(raw.replace(',', '.'));
      ok = Number.isFinite(num) && equalsTol(num, q.meta.numeric, 1e-6);
    }
  }

  // General
  else {
    if(typeof q.answer === 'number'){
      const num = Number(raw.replace(',', '.'));
      ok = Number.isFinite(num) && Math.abs(num - q.answer) < 1e-9;
    } else {
      ok = raw.replace(/\s+/g,'').toLowerCase() === String(q.answer).replace(/\s+/g,'').toLowerCase();
    }
  }

  if(ok){
  session.correct++;
  feedback(true, `Correcte!`);
}else{
  session.wrongs.push({ ...q, user: raw });
  feedback(false, `Incorrecte. Resposta correcta: <b>${fmtAns(q.answer)}</b>`);
}

// 🧠 Registra resultat de cada pregunta
saveResult(session.module, q.text, ok);

  session.idx++;
  updateProgress();
  if(session.idx>=session.count){ finishQuiz(false) }
  else renderQuestion();
}

function skip(){
  if(!session || session.done){ flashFeedback('Prova finalitzada. Torna a Inici.'); return }
  if(session.idx >= session.questions.length){
    finishQuiz(false);
    return;
  }
  const q = session.questions[session.idx];
  session.wrongs.push({ ...q, user: '— (omet)' });
  session.idx++;
  updateProgress();
  if(session.idx>=session.count){ finishQuiz(false) }
  else renderQuestion();
}

function feedback(isOk, msg){
  $('#feedback').innerHTML = `<div class="feedback ${isOk? '':'bad'}">${msg}</div>`;
}

function flashFeedback(msg, type='warn'){
  const color = type==='warn'? 'var(--warn)':'#fecaca';
  const bg = type==='warn'? '#fffbeb':'#fff1f2';
  $('#feedback').innerHTML = `<div class="feedback" style="background:${bg};border-color:${color};color:#78350f">${msg}</div>`;
}

function fmtAns(a){
  if(typeof a==='number') return (Number.isInteger(a)? a : a.toFixed(3));
  if(/^-?\d+\/\d+$/.test(String(a))) return String(a);
  if(Array.isArray(a)) return a.join(', ');
  if(typeof a==='object' && a && 'x' in a && 'y' in a) return `(${a.x}, ${a.y})`;
  return a;
}

function finishQuiz(timeUp){
  if(!session || session.done){ return; }
  session.done = true;
  stopTimer();
  const elapsed = Math.floor((Date.now() - session.startedAt)/1000);
  const totalQuestions = session.questions && session.questions.length ? session.questions.length : session.count;
  if(totalQuestions && totalQuestions !== session.count){
    session.count = totalQuestions;
  }
  const score = totalQuestions ? Math.round((session.correct / totalQuestions) * 100) : 0;
  const name = localStorage.getItem('lastStudent') || 'Anònim';
  const moduleObj = MODULES.find(m=>m.id===session.module);
  const moduleName = moduleObj?.name || session.module;
  const levelLabel = session.levelLabel || (session.level > 0 ? `Nivell ${session.level}` : 'Personalitzat');

  const entry = {
    at: new Date().toISOString(),
    name,
    module: session.module,
    level: session.level,
    levelLabel,
    count: totalQuestions,
    correct: session.correct,
    time_limit: session.time,
    time_spent: elapsed,
    score,
    wrongs: session.wrongs
  };

  try {
    store.save(entry);
  } catch (err) {
    console.error('No s\'ha pogut guardar el resultat al magatzem local.', err);
    alert('No s\'ha pogut guardar aquest examen perquè no hi ha espai lliure. Esborra alguns intents antics i torna-ho a provar.');
  }

  try {
    renderResults();
  } catch (err) {
    console.error('No s\'han pogut refrescar els resultats guardats.', err);
  }
  try {
    if (typeof showRecommendation === 'function') {
      showRecommendation('#recommendationText');
    }
  } catch (err) {
    console.error('No s\'ha pogut actualitzar la recomanació del tutor.', err);
  }

  const wrongsBtn = session.wrongs.length ? `<button onclick="redoWrongs()">Refés només els errors</button>` : '';
  const html = `
<h3 style="margin-top:0">${timeUp? 'Temps exhaurit ⏱️':'Prova finalitzada 🎉'}</h3>
<p class="subtitle">${name} · ${moduleName} · ${levelLabel}</p>
<div class="row" style="align-items:flex-end; gap:16px">
  <div>
    <div class="section-title">Resultat</div>
    <div style="font-size:2.2rem; font-weight:900">${score}%</div>
    <div class="subtitle">${session.correct}/${session.count} correctes · Temps: ${fmtTime(elapsed)}</div>
    <div class="controls" style="margin-top:10px; flex-wrap:wrap">
      ${wrongsBtn}
      <button onclick="openConfig('${session.module}')">Configura i torna-ho a fer</button>
      <button class="btn-secondary" onclick="showView('results')">Veure resultats</button>
      <button class="btn-ghost" onclick="closeModal()">Tanca</button>
    </div>
  </div>
  <div style="flex:1"></div>
</div>
<div class="section-title">Errors i correccions</div>
${session.wrongs.length? renderWrongs(session.wrongs): '<div class="chip">Cap error 🎯</div>'}
`;
  showModal(html);
}

function redoWrongs(){
  if(!session || !session.wrongs || !session.wrongs.length){
    flashFeedback('No hi ha errors per repassar.', 'warn'); return;
  }
  const qs = session.wrongs.map(w=>({type:w.type, text:w.text, title:w.title, html:w.html, answer:w.answer, meta:w.meta, numeric:w.numeric, piCoef:w.piCoef, sol:w.sol, sols:w.sols}));
  closeModal();
  const meta = {
    label: "Repàs d'errors",
    level: session.level,
    levelLabel: session.level > 0 ? `Nivell ${session.level}` : 'Repàs personalitzat'
  };
  startQuizFromExisting(session.module, session.options, qs, meta);
}

function renderWrongs(wr){
  return `<table><thead><tr><th>#</th><th>Pregunta</th><th>La teva</th><th>Correcta</th></tr></thead><tbody>`+
  wr.map((w,i)=>`<tr><td>${i+1}</td><td>${w.text}</td><td>${w.user}</td><td>${fmtAns(w.answer)}</td></tr>`).join('')+
  `</tbody></table>`;
}

/* ===================== FITXES IMPRIMIBLES ===================== */

function cloneQuestionData(q){
  if(!q || typeof q !== 'object'){
    return {
      type: '',
      text: '',
      title: '',
      html: '',
      answer: null,
      meta: null,
      numeric: null,
      piCoef: null,
      sol: null,
      sols: null
    };
  }
  return {
    type: q.type,
    text: q.text,
    title: q.title,
    html: q.html,
    answer: q.answer,
    meta: q.meta,
    numeric: q.numeric,
    piCoef: q.piCoef,
    sol: q.sol,
    sols: q.sols
  };
}

function printableLineCount(q){
  if(!q || !q.type) return 2;
  if(q.type?.startsWith('eq')) return 4;
  if(q.type?.startsWith('geom')) return 4;
  if(q.type?.startsWith('frac')) return 3;
  if(q.type?.startsWith('stats')) return 3;
  if(q.type?.startsWith('func')) return 3;
  return 2;
}

function printableAnswer(q){
  if(q.answer !== undefined && q.answer !== null) return fmtAns(q.answer);
  if(Array.isArray(q.sols) && q.sols.length) return q.sols.map(fmtAns).join(', ');
  if(q.sol !== undefined && q.sol !== null) return fmtAns(q.sol);
  if(q.numeric !== undefined && q.numeric !== null){
    const num = q.numeric;
    if(typeof num === 'number'){
      return Number.isInteger(num) ? String(num) : num.toLocaleString('ca-ES', { maximumFractionDigits: 4 });
    }
    if(Array.isArray(num)) return num.join(', ');
    return String(num);
  }
  return '—';
}

function formatPrintableOptions(moduleId, options){
  if(!options || !Object.keys(options).length) return 'Opcions per defecte';
  switch(moduleId){
    case 'arith': {
      const map = { '+':'suma', '-':'resta', '×':'multiplicació', '÷':'divisió' };
      const ops = Array.isArray(options.ops) && options.ops.length ? options.ops.map(op => map[op] || op) : ['totes'];
      const parts = [`Operacions: ${ops.join(', ')}`];
      if(options.allowNeg) parts.push('Permet negatius');
      if(options.tri) parts.push('Operacions amb 3 nombres');
      return parts.join(' · ');
    }
    case 'frac': {
      const mode = { identify: 'Identificar', arith: 'Aritmètica', simplify: 'Simplificar' }[options.sub] || 'Barreja';
      const parts = [`Subtema: ${mode}`];
      if(options.mixedGrids === false) parts.push('Grills uniformes');
      if(options.forceSimplest) parts.push('Exigeix forma simplificada');
      return parts.join(' · ');
    }
    case 'geom': {
      const scopes = { area: 'Àrea', perim: 'Perímetre', both: 'Àrea + perímetre', vol: 'Volum' };
      const figuresMap = {
        rect: 'Rectangles/quadrats',
        tri: 'Triangles',
        circ: 'Cercles',
        poly: 'Polígons regulars',
        grid: 'Graella',
        comp: 'Figures compostes',
        cube: 'Cubs/prismes',
        cylinder: 'Cilindres'
      };
      const active = Object.entries(options.fig || {}).filter(([,v])=>v).map(([k])=>figuresMap[k]).filter(Boolean);
      const parts = [`Abast: ${scopes[options.scope] || 'General'}`];
      if(active.length) parts.push(`Figures: ${active.join(', ')}`);
      parts.push(`Unitats: ${options.units || 'cm'}`);
      parts.push(`Decimals: ${options.round ?? 2}`);
      parts.push(options.circleMode === 'pi-exacte' ? 'Mode cercles: exacte amb π' : 'Mode cercles: resultat numèric');
      if(options.requireUnits) parts.push('Cal escriure la unitat');
      return parts.join(' · ');
    }
    case 'stats': {
      const map = { mmm: 'Mitjana/mediana/moda', 'range-dev': 'Rang i desviació', graphs: 'Gràfics' };
      return `Subtema: ${map[options.sub] || 'General'} · Decimals: ${options.round ?? 2}`;
    }
    case 'units': {
      const map = { length:'Longitud', mass:'Massa', volume:'Volum', area:'Superfície', time:'Temps' };
      return `Conversió: ${map[options.sub] || 'General'} · Decimals: ${options.round ?? 2}`;
    }
    case 'eq': {
      const formatMap = { normal:'Equacions normals', frac:'Amb fraccions', par:'Amb parèntesis', sys:'Sistemes' };
      const degreeMap = { '1':'1r grau', '2':'2n grau', mixed:'Barrejats' };
      const rangeMap = { small:'Coeficients petits (−9…9)', med:'Coeficients mitjans (−20…20)', big:'Coeficients grans (−60…60)' };
      const parts = [formatMap[options.format] || 'Formats variats'];
      parts.push(degreeMap[options.degree] || 'Graus variats');
      parts.push(rangeMap[options.range] || 'Rang estàndard');
      if(options.forceInt) parts.push('Solucions enteres');
      if(options.allowIncomplete) parts.push('Inclou equacions incompletes');
      if(options.hints) parts.push('Mostra pistes');
      return parts.join(' · ');
    }
    case 'func': {
      const typeMap = { lin:'Lineals', quad:'Quadràtiques', poly:'Polinòmiques', rac:'Racionals', rad:'Radicals', exp:'Exponencials', log:'Logarítmiques' };
      const aspectMap = { type:'Tipus', domain:'Domini/recorregut', intercepts:'Punts de tall', symmetry:'Simetria', limits:'Límits', extrema:'Extrems', monotony:'Monotonia' };
      const types = Object.entries(options.types || {}).filter(([,v])=>v).map(([k])=>typeMap[k]).filter(Boolean);
      const aspects = Object.entries(options.aspects || {}).filter(([,v])=>v).map(([k])=>aspectMap[k]).filter(Boolean);
      const diffMap = { 1:'Bàsic', 2:'Intermedi', 3:'Avançat', 4:'Expert' };
      const parts = [];
      if(types.length) parts.push(`Tipus: ${types.join(', ')}`);
      if(aspects.length) parts.push(`Aspectes: ${aspects.join(', ')}`);
      parts.push(`Dificultat: ${diffMap[options.difficulty] || 'Personalitzada'}`);
      return parts.join(' · ');
    }
    default: {
      return Object.entries(options).map(([k,v]) => {
        if(v && typeof v === 'object') return `${k}: ${JSON.stringify(v)}`;
        return `${k}: ${v}`;
      }).join(' · ');
    }
  }
}

function openPrintableEditor(module, cfg){
  const level = clamp(parseInt(cfg.level)||1, 1, 4);
  const count = clamp(parseInt(cfg.count)||10, 1, 200);
  const timeLimit = clamp(parseInt(cfg.time)||0, 0, 180);
  const baseOptions = cfg.options ? JSON.parse(JSON.stringify(cfg.options)) : {};

  const state = {
    module,
    level,
    levelLabel: level > 0 ? `Nivell ${level}` : 'Personalitzat',
    timeLimit,
    options: baseOptions,
    includeAnswers: true,
    questions: [],
    generatedAt: new Date().toISOString()
  };

  for(let i=0;i<count;i++){
    state.questions.push(printableEditorGenerateQuestion(state));
  }

  const html = `
    <div class="print-editor" role="document">
      <div class="print-editor-header">
        <div>
          <h3 class="title" style="margin:0">${module.name} · Fitxa en PDF</h3>
          <p class="subtitle" style="margin:6px 0 0">Has generat <strong>${state.questions.length}</strong> preguntes. Revisa les operacions, edita qualsevol enunciat o resposta, o regenera-les abans de descarregar el PDF.</p>
        </div>
        <button type="button" class="btn-ghost" data-action="close">Tanca</button>
      </div>
      <div class="print-editor-toolbar">
        <button type="button" class="btn-secondary" data-action="regen-all">↻ Regenera totes</button>
        <label class="toggle"><input type="checkbox" id="printEditorIncludeAnswers" checked> Inclou solucions al final</label>
      </div>
      <div id="printEditorList" class="print-editor-list"></div>
      <div class="print-editor-footer">
        <button type="button" class="btn-secondary" data-action="close">Cancel·la</button>
        <button type="button" class="btn" data-action="download">Descarrega PDF</button>
      </div>
    </div>`;

  showModal(html);
  printableEditorState = state;
  const modal = document.querySelector('.modal .print-editor');
  if(!modal) return;

  const regenAll = modal.querySelector('[data-action="regen-all"]');
  if(regenAll) regenAll.addEventListener('click', regenerateAllPrintableEditorQuestions);
  modal.querySelectorAll('[data-action="close"]').forEach(btn=> btn.addEventListener('click', closePrintableEditor));
  const downloadBtn = modal.querySelector('[data-action="download"]');
  if(downloadBtn) downloadBtn.addEventListener('click', downloadEditorSheet);

  renderPrintableEditorList();
}

function printableEditorGenerateQuestion(state = printableEditorState){
  if(!state) return { raw:{}, prompt:'', answerText:'', html:'' };
  const module = state.module;
  const level = state.level;
  const opts = state.options ? JSON.parse(JSON.stringify(state.options)) : {};
  let raw = null;
  let attempts = 0;
  while(attempts < 4){
    try {
      raw = cloneQuestionData(module.gen(level, opts));
    } catch {
      raw = cloneQuestionData(null);
    }
    const hasContent = raw.text || raw.title || raw.html;
    if(hasContent) break;
    attempts++;
  }
  if(!raw) raw = cloneQuestionData(null);
  const defaultAnswer = printableAnswer(raw);
  return {
    raw,
    prompt: raw.title || raw.text || '',
    answerText: defaultAnswer === '—' ? '' : defaultAnswer,
    html: raw.html || ''
  };
}

function renderPrintableEditorList(){
  if(!printableEditorState) return;
  const list = document.querySelector('#printEditorList');
  if(!list) return;
  list.innerHTML = '';
  printableEditorState.questions.forEach((entry, idx)=>{
    list.appendChild(createPrintableEditorItem(entry, idx));
  });
}

function createPrintableEditorItem(entry, idx){
  const item = document.createElement('div');
  item.className = 'print-editor-item';
  item.dataset.index = String(idx);
  item.innerHTML = `
    <div class="print-editor-head">
      <span class="print-editor-label">Pregunta ${idx+1}</span>
      <button type="button" class="btn-secondary print-editor-regen">↻ Regenera</button>
    </div>
    <textarea class="input print-editor-text" rows="2"></textarea>
    ${entry.html ? `<div class="print-editor-preview">${entry.html}</div>` : ''}
    <label class="chip print-editor-answer-label">Resposta
      <input type="text" class="input print-editor-answer" />
    </label>
  `;

  const textarea = item.querySelector('.print-editor-text');
  if(textarea){
    textarea.value = entry.prompt || '';
    textarea.addEventListener('input', ev => { entry.prompt = ev.target.value; });
  }

  const answerInput = item.querySelector('.print-editor-answer');
  if(answerInput){
    answerInput.value = entry.answerText || '';
    answerInput.addEventListener('input', ev => { entry.answerText = ev.target.value; });
  }

  const regenBtn = item.querySelector('.print-editor-regen');
  if(regenBtn){
    regenBtn.addEventListener('click', () => regeneratePrintableEditorQuestion(idx));
  }

  return item;
}

function regeneratePrintableEditorQuestion(idx){
  if(!printableEditorState) return;
  const entry = printableEditorGenerateQuestion();
  printableEditorState.questions[idx] = entry;
  const list = document.querySelector('#printEditorList');
  if(!list) return;
  const current = list.querySelector(`.print-editor-item[data-index="${idx}"]`);
  if(current){
    const replacement = createPrintableEditorItem(entry, idx);
    current.replaceWith(replacement);
  }
}

function regenerateAllPrintableEditorQuestions(){
  if(!printableEditorState) return;
  printableEditorState.questions = printableEditorState.questions.map(() => printableEditorGenerateQuestion());
  renderPrintableEditorList();
}

async function downloadEditorSheet(){
  if(!printableEditorState) return;
  const modal = document.querySelector('.modal .print-editor');
  if(modal){
    const include = modal.querySelector('#printEditorIncludeAnswers');
    printableEditorState.includeAnswers = include ? include.checked : true;
  }

  const downloadBtn = modal ? modal.querySelector('[data-action="download"]') : null;
  let previousLabel = '';
  if(downloadBtn){
    previousLabel = downloadBtn.textContent;
    downloadBtn.textContent = 'Preparant PDF…';
    downloadBtn.disabled = true;
    downloadBtn.classList.add('is-loading');
  }

  const entries = printableEditorState.questions.map((entry, idx)=>{
    const prompt = (entry.prompt || '').trim() || `Pregunta ${idx+1}`;
    const fallback = printableAnswer(entry.raw || {});
    const trimmedAnswer = (entry.answerText || '').trim();
    const answer = trimmedAnswer || (fallback !== '—' ? fallback : '');
    return {
      prompt,
      answer,
      html: entry.html || '',
      raw: entry.raw || {}
    };
  });

  try {
    const pdfBytes = await buildPrintablePdf(printableEditorState, entries, printableEditorState.includeAnswers);
    if(!pdfBytes || (pdfBytes.length !== undefined && pdfBytes.length === 0)){
      throw new Error('empty-pdf');
    }

    const buffer = pdfBytes instanceof Uint8Array
      ? pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength)
      : pdfBytes;
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const moduleName = printableEditorState.module?.name || printableEditorState.module?.id || 'focusquiz';
    const safeName = moduleName.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '') || 'fitxa';
    const blobUrl = URL.createObjectURL(blob);

    const downloadFile = (url) => {
      const link = document.createElement('a');
      link.href = url;
      link.rel = 'noopener';
      link.style.position = 'fixed';
      link.style.left = '-9999px';
      link.download = `${safeName}-focusquiz.pdf`;
      document.body.appendChild(link);
      const trigger = () => {
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        setTimeout(() => {
          URL.revokeObjectURL(url);
          link.remove();
        }, 2000);
      };
      if('requestAnimationFrame' in window){
        requestAnimationFrame(trigger);
      } else {
        setTimeout(trigger, 0);
      }
    };

    if(window.navigator && typeof window.navigator.msSaveOrOpenBlob === 'function'){
      window.navigator.msSaveOrOpenBlob(blob, `${safeName}-focusquiz.pdf`);
      URL.revokeObjectURL(blobUrl);
      return;
    }

    downloadFile(blobUrl);
  } catch(err){
    console.error('Error generant el PDF imprimible', err);
    alert('No s\'ha pogut preparar el PDF. Torna-ho a intentar.');
  } finally {
    if(downloadBtn){
      downloadBtn.disabled = false;
      downloadBtn.classList.remove('is-loading');
      if(previousLabel) downloadBtn.textContent = previousLabel;
    }
  }
}

async function buildPrintablePdf(state, entries, includeAnswers){
  const moduleName = state.module?.name || state.module?.id || 'Fitxa Focus Academy';
  const levelLabel = state.levelLabel || (state.level ? `Nivell ${state.level}` : 'Personalitzat');
  const timeLabel = state.timeLimit ? `${state.timeLimit} min` : 'sense límit';
  const generatedAt = state.generatedAt ? new Date(state.generatedAt).toLocaleString('ca-ES', { dateStyle:'short', timeStyle:'short' }) : new Date().toLocaleString('ca-ES', { dateStyle:'short', timeStyle:'short' });
  const optionSummary = formatPrintableOptions(state.module?.id || state.module?.module || state.module, state.options);

  const processedEntries = await Promise.all(entries.map(async entry => {
    const visuals = await extractPrintableVisuals(entry.html);
    return {
      ...entry,
      media: visuals.media,
      mediaNotes: visuals.textNotes
    };
  }));

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 48;
  const PX_TO_PT = 72 / 96;

  const palette = {
    pageBg: '#f7f7fb',
    pageTop: '#eaf2ff',
    pageHighlight: '#eafaf5',
    headerAccent: '#7aa2ff',
    headerGlow: '#bfd3ff',
    cardBase: '#ffffff',
    cardBorder: '#dbeafe',
    text: '#0f172a',
    muted: '#475569',
    label: '#64748b',
    line: '#cbd5f5',
    note: '#475569',
    answersBg: '#eef2ff',
    answersBorder: '#c7d2fe',
    answersAccent: '#1e3a8a',
    answersText: '#0f172a',
    accent: '#7aa2ff'
  };

  const accentRamp = [
    { bar: '#8fb5ff', wash: '#edf2ff' },
    { bar: '#c7b5ff', wash: '#f4edff' },
    { bar: '#7fe7c9', wash: '#e6fcf2' },
    { bar: '#ffc9a9', wash: '#fff3ea' },
    { bar: '#ffb3c1', wash: '#ffe8ef' },
    { bar: '#ffe08a', wash: '#fff8db' }
  ];

  function normalizeHex(value, fallback = '000000'){
    if(typeof value === 'string'){
      const trimmed = value.trim().replace(/^#/, '');
      if(/^[0-9a-f]{6}$/i.test(trimmed)) return trimmed.toLowerCase();
      if(/^[0-9a-f]{3}$/i.test(trimmed)) return trimmed.split('').map(ch => ch + ch).join('').toLowerCase();
    }
    if(typeof fallback === 'string'){
      const fb = fallback.trim().replace(/^#/, '');
      if(/^[0-9a-f]{6}$/i.test(fb)) return fb.toLowerCase();
      if(/^[0-9a-f]{3}$/i.test(fb)) return fb.split('').map(ch => ch + ch).join('').toLowerCase();
    }
    return '000000';
  }

  function parseColor(hex, fallback = '#000000'){
    const norm = normalizeHex(hex, fallback);
    const r = parseInt(norm.slice(0, 2), 16) / 255;
    const g = parseInt(norm.slice(2, 4), 16) / 255;
    const b = parseInt(norm.slice(4, 6), 16) / 255;
    return {
      r: Math.round(r * 1000) / 1000,
      g: Math.round(g * 1000) / 1000,
      b: Math.round(b * 1000) / 1000
    };
  }

  function colorStr(hex, fallback = '#000000'){
    const { r, g, b } = parseColor(hex, fallback);
    return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
  }

  function mixColor(hexA, hexB, weight = 0.5){
    const t = clamp(typeof weight === 'number' ? weight : 0.5, 0, 1);
    const a = parseColor(hexA);
    const b = parseColor(hexB, hexA);
    return {
      r: Math.round(((a.r * (1 - t)) + (b.r * t)) * 1000) / 1000,
      g: Math.round(((a.g * (1 - t)) + (b.g * t)) * 1000) / 1000,
      b: Math.round(((a.b * (1 - t)) + (b.b * t)) * 1000) / 1000
    };
  }

  function colorTuple(rgb){
    if(!rgb || typeof rgb !== 'object') return colorStr('#000000');
    const r = Number(rgb.r ?? 0);
    const g = Number(rgb.g ?? 0);
    const b = Number(rgb.b ?? 0);
    return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
  }

  const pages = [];
  let currentPage = null;
  let cursorY = 0;

  function fillRect(color, x, y, w, h){
    if(!currentPage) return;
    const colorValue = typeof color === 'string' ? colorStr(color) : colorTuple(color);
    currentPage.commands.push(`q ${colorValue} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f Q`);
  }

  function strokeRect(color, width, x, y, w, h){
    if(!currentPage) return;
    const colorValue = typeof color === 'string' ? colorStr(color) : colorTuple(color);
    currentPage.commands.push(`q ${width.toFixed(2)} w ${colorValue} RG ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S Q`);
  }

  function drawImage(media, x, y, w, h){
    if(!currentPage || !media || !media.resourceName || !media.objectId) return;
    if(!currentPage.xObjects) currentPage.xObjects = {};
    currentPage.xObjects[media.resourceName] = media.objectId;
    currentPage.commands.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /${media.resourceName} Do Q`);
  }

  function newPage(){
    currentPage = { commands: [], xObjects: {} };
    pages.push(currentPage);
    cursorY = pageHeight - margin;
    fillRect(palette.pageBg, 0, 0, pageWidth, pageHeight);
    fillRect(palette.pageTop, 0, pageHeight - 190, pageWidth, 190);
    fillRect(palette.pageHighlight, -40, pageHeight - 140, 220, 140);
    fillRect(mixColor(palette.headerAccent, '#ffffff', 0.65), pageWidth - 200, pageHeight - 150, 200, 150);
    currentPage.commands.push('0.5 w');
  }

  function ensurePageSpace(height){
    if(cursorY - height < margin){
      newPage();
    }
  }

  function escapePdfText(str){
    return String(str)
      .replace(/\\/g, '\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  function wrapText(text, size, indent, indentRight = 0){
    const paragraphs = String(text || '').split(/\n+/);
    const maxWidth = pageWidth - margin * 2 - indent - indentRight;
    const charWidth = size * 0.55;
    const lines = [];
    paragraphs.forEach((para, idx)=>{
      const words = para.trim().split(/\s+/).filter(Boolean);
      let current = '';
      if(idx > 0) lines.push('');
      words.forEach(word => {
        const candidate = current ? `${current} ${word}` : word;
        if(candidate.length * charWidth <= maxWidth){
          current = candidate;
        } else {
          if(current) lines.push(current);
          if(word.length * charWidth > maxWidth){
            let chunk = '';
            word.split('').forEach(ch => {
              const test = chunk + ch;
              if(test.length * charWidth > maxWidth && chunk){
                lines.push(chunk);
                chunk = ch;
              } else {
                chunk = test;
              }
            });
            current = chunk;
          } else {
            current = word;
          }
        }
      });
      if(current) lines.push(current);
    });
    return lines;
  }

  function addText(text, size = 12, opts = {}){
    if(text === null || text === undefined) return;
    if(!currentPage) newPage();
    const indent = opts.indent || 0;
    const indentRight = opts.indentRight || 0;
    const bold = !!opts.bold;
    const after = opts.after ?? 6;
    const lineHeight = size * (opts.lineHeight || 1.35);
    const lines = Array.isArray(opts.lines) ? opts.lines : wrapText(text, size, indent, indentRight);
    const blockHeight = lineHeight * lines.length + after;
    ensurePageSpace(blockHeight);
    const { r, g, b } = parseColor(opts.color || palette.text);
    currentPage.commands.push(`${r} ${g} ${b} rg`);
    lines.forEach(line => {
      cursorY -= lineHeight;
      const font = bold ? 'F2' : 'F1';
      const x = margin + indent;
      currentPage.commands.push(`BT /${font} ${size.toFixed(2)} Tf 1 0 0 1 ${x.toFixed(2)} ${cursorY.toFixed(2)} Tm (${escapePdfText(line)}) Tj ET`);
    });
    cursorY -= after;
  }

  function addAnswerLines(count, opts = {}){
    if(!currentPage) newPage();
    const indent = opts.indent || 18;
    const indentRight = opts.indentRight || 0;
    const lineGap = opts.lineGap ?? 10;
    const lineHeight = opts.lineHeight ?? 12;
    const stroke = typeof opts.color === 'string' ? colorStr(opts.color) : colorTuple(opts.color || parseColor(palette.line));
    for(let i=0;i<count;i++){
      ensurePageSpace(lineHeight + lineGap);
      cursorY -= lineHeight;
      const x1 = margin + indent;
      const x2 = pageWidth - margin - indentRight;
      currentPage.commands.push(`q ${stroke} RG ${x1.toFixed(2)} ${cursorY.toFixed(2)} m ${x2.toFixed(2)} ${cursorY.toFixed(2)} l S Q`);
      cursorY -= lineGap;
    }
  }

  function addHeaderCard(entriesWithContent){
    const infoLines = [
      `• Nivell: ${levelLabel}`,
      `• Temps: ${timeLabel}`,
      `• Preguntes: ${entriesWithContent.length}`
    ];
    if(optionSummary && optionSummary !== 'Opcions per defecte'){
      infoLines.push(`• Configuració: ${optionSummary}`);
    }
    infoLines.push(`• Generat: ${generatedAt}`);

    const topPad = 34;
    const bottomPad = 24;
    const titleSize = 18;
    const titleLineHeight = titleSize * 1.2;
    const titleAfter = 6;
    const subtitleSize = 12;
    const subtitleLineHeight = subtitleSize * 1.4;
    const subtitleAfter = 10;
    const metaSize = 11;
    const metaLineHeight = metaSize * 1.45;
    const metaBlock = infoLines.length * metaLineHeight;
    const cardHeight = topPad + titleLineHeight + titleAfter + subtitleLineHeight + subtitleAfter + metaBlock + bottomPad;

    ensurePageSpace(cardHeight + 12);
    const top = cursorY;
    const bottom = top - cardHeight;
    const left = margin;
    const width = pageWidth - margin * 2;

    fillRect(palette.cardBase, left, bottom, width, cardHeight);
    strokeRect(palette.cardBorder, 0.8, left, bottom, width, cardHeight);
    fillRect(mixColor(palette.headerAccent, '#ffffff', 0.55), left, bottom + cardHeight - 8, width, 8);
    fillRect(mixColor(palette.headerGlow, '#ffffff', 0.3), left + width - 160, bottom + cardHeight - 60, 140, 60);

    cursorY = top - topPad;
    addText(moduleName, titleSize, { bold: true, indent: 26, indentRight: 26, lineHeight: 1.2, after: titleAfter });
    addText('Fitxa en PDF personalitzada', subtitleSize, { indent: 26, indentRight: 26, color: palette.muted, lineHeight: 1.4, after: subtitleAfter });
    addText(infoLines.join('\n'), metaSize, { indent: 26, indentRight: 26, color: palette.label, lineHeight: 1.45, after: 0 });
    cursorY -= bottomPad;
  }

  function addQuestionCard(entry, idx){
    const accent = accentRamp[idx % accentRamp.length];
    const accentWidth = 6;
    const textIndent = accentWidth + 22;
    const rightPad = 26;
    const topPad = 24;
    const bottomPad = 18;
    const labelSize = 10;
    const labelLineHeight = labelSize * 1.45;
    const labelAfter = 4;
    const questionSize = 12;
    const questionLineHeight = questionSize * 1.45;
    const media = Array.isArray(entry.media) ? entry.media.filter(m => m && m.bytes && m.bytes.length) : [];
    const hasMedia = media.length > 0;
    const mediaNotesText = Array.isArray(entry.mediaNotes) && entry.mediaNotes.length ? entry.mediaNotes.join('\n') : '';
    const hasNotes = !!mediaNotesText;
    const noteSize = 11;
    const noteLineHeight = noteSize * 1.35;
    const noteLines = hasNotes ? wrapText(mediaNotesText, noteSize, textIndent + 4, rightPad + 6) : [];
    const noteAfter = hasNotes ? 8 : 0;
    const questionAfter = hasMedia || hasNotes ? 6 : 10;
    const answerCount = Math.max(2, printableLineCount(entry.raw));
    const answerUnit = (12 + 10);
    const mediaGap = 10;
    const mediaTopGap = hasMedia ? 12 : 0;

    const promptText = entry.prompt || `Pregunta ${idx + 1}`;
    const labelLines = wrapText(`Pregunta ${idx + 1}`, labelSize, textIndent, rightPad);
    const questionLines = wrapText(promptText, questionSize, textIndent, rightPad);

    const availableWidth = pageWidth - margin * 2 - textIndent - rightPad;
    let mediaBlockHeight = 0;
    media.forEach(m => {
      const widthPt = m.widthPt || (Math.max(1, Math.round(m.pixelWidth || m.widthPx || 1)) * PX_TO_PT);
      const heightPt = m.heightPt || (Math.max(1, Math.round(m.pixelHeight || m.heightPx || 1)) * PX_TO_PT);
      const scale = widthPt > availableWidth ? availableWidth / widthPt : 1;
      m.layoutWidth = widthPt * scale;
      m.layoutHeight = heightPt * scale;
      m.layoutX = margin + textIndent + (availableWidth - m.layoutWidth) / 2;
      mediaBlockHeight += m.layoutHeight;
    });
    if(hasMedia && media.length > 1) mediaBlockHeight += mediaGap * (media.length - 1);
    if(hasMedia) mediaBlockHeight += mediaTopGap;

    const notesHeight = hasNotes ? (noteLines.length * noteLineHeight) + noteAfter : 0;
    const cardHeight = topPad + (labelLines.length * labelLineHeight) + labelAfter + (questionLines.length * questionLineHeight) + questionAfter + mediaBlockHeight + notesHeight + (answerCount * answerUnit) + bottomPad;

    ensurePageSpace(cardHeight + 10);
    const top = cursorY;
    const bottom = top - cardHeight;
    const left = margin;
    const width = pageWidth - margin * 2;

    fillRect(accent.wash, left, bottom, width, cardHeight);
    strokeRect(mixColor(accent.bar, '#ffffff', 0.35), 0.8, left, bottom, width, cardHeight);
    fillRect(accent.bar, left, bottom, accentWidth, cardHeight);

    cursorY = top - topPad;
    addText(`Pregunta ${idx + 1}`, labelSize, { indent: textIndent, indentRight: rightPad, color: palette.label, lineHeight: 1.45, after: labelAfter, lines: labelLines });
    addText(promptText, questionSize, { indent: textIndent, indentRight: rightPad, color: palette.text, lineHeight: 1.45, after: questionAfter, lines: questionLines, bold: true });

    if(hasMedia){
      cursorY -= mediaTopGap;
      media.forEach((m, mediaIdx) => {
        const drawHeight = m.layoutHeight || 0;
        const drawWidth = m.layoutWidth || 0;
        const drawX = m.layoutX ?? (margin + textIndent);
        const bottomY = cursorY - drawHeight;
        drawImage(m, drawX, bottomY, drawWidth, drawHeight);
        cursorY -= drawHeight;
        if(mediaIdx !== media.length - 1){
          cursorY -= mediaGap;
        }
      });
    }

    if(hasNotes){
      addText(mediaNotesText, noteSize, { indent: textIndent + 4, indentRight: rightPad, color: palette.note, lineHeight: 1.35, after: noteAfter, lines: noteLines });
    }

    addAnswerLines(answerCount, { indent: textIndent, indentRight: rightPad, lineHeight: 12, lineGap: 10, color: mixColor(accent.bar, '#000000', 0.2) });
    cursorY -= bottomPad;
  }

  function addAnswersSection(entriesWithContent){
    const topPad = 24;
    const bottomPad = 20;
    const headerSize = 13;
    const headerLineHeight = headerSize * 1.3;
    const headerAfter = 8;
    const rowSize = 11;
    const rowLineHeight = rowSize * 1.4;
    const rowAfter = 4;
    const totalHeight = topPad + headerLineHeight + headerAfter + (entriesWithContent.length * (rowLineHeight + rowAfter)) + bottomPad;

    ensurePageSpace(totalHeight + 10);
    const top = cursorY;
    const bottom = top - totalHeight;
    const left = margin;
    const width = pageWidth - margin * 2;

    fillRect(palette.answersBg, left, bottom, width, totalHeight);
    strokeRect(palette.answersBorder, 0.8, left, bottom, width, totalHeight);
    fillRect(mixColor(palette.accent, '#ffffff', 0.5), left, bottom + totalHeight - 6, width, 6);

    cursorY = top - topPad;
    addText('Solucions', headerSize, { bold: true, indent: 22, indentRight: 22, color: palette.answersAccent, lineHeight: 1.3, after: headerAfter });
    entriesWithContent.forEach((entry, idx) => {
      let answerValue = entry.answer;
      if(answerValue === undefined || answerValue === null){
        answerValue = '—';
      } else if(typeof answerValue === 'number'){
        answerValue = Number.isFinite(answerValue) ? String(answerValue) : '—';
      } else {
        const trimmed = String(answerValue).trim();
        answerValue = trimmed ? trimmed : '—';
      }
      addText(`${idx + 1}. ${answerValue}`, rowSize, { indent: 32, indentRight: 22, color: palette.answersText, lineHeight: 1.4, after: rowAfter });
    });
    cursorY -= bottomPad;
  }

  newPage();
  addHeaderCard(processedEntries);

  processedEntries.forEach((entry, idx) => {
    addQuestionCard(entry, idx);
    if(idx !== processedEntries.length - 1){
      cursorY -= 6;
    }
  });

  if(includeAnswers){
    addAnswersSection(processedEntries);
  }

  const objects = [];
  function addObject(body = ''){
    const id = objects.length + 1;
    objects.push({ body });
    return id;
  }
  function setObject(id, body){
    objects[id - 1].body = body;
  }

  const catalogId = addObject();
  const pagesId = addObject();
  const fontRegularId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBoldId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  let imageCounter = 0;
  processedEntries.forEach(entry => {
    (entry.media || []).forEach(media => {
      if(!media.bytes || !media.bytes.length) return;
      if(media.objectId) return;
      imageCounter += 1;
      media.resourceName = `Im${imageCounter}`;
      const widthPx = Math.max(1, Math.round(media.pixelWidth || media.widthPx || 1));
      const heightPx = Math.max(1, Math.round(media.pixelHeight || media.heightPx || 1));
      const dict = `<< /Type /XObject /Subtype /Image /Width ${widthPx} /Height ${heightPx} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode >>`;
      media.objectId = addObject({ stream: true, dict, bytes: media.bytes });
    });
  });

  const pageObjectIds = [];
  const encoder = new TextEncoder();

  pages.forEach(page => {
    const stream = page.commands.join('\n');
    const length = encoder.encode(stream).length;
    const contentId = addObject(`<< /Length ${length} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject();
    pageObjectIds.push(pageId);
    const xObjectEntries = Object.entries(page.xObjects || {});
    const xObjectDict = xObjectEntries.length ? ` /XObject << ${xObjectEntries.map(([name, id]) => `/${name} ${id} 0 R`).join(' ')} >>` : '';
    setObject(pageId, `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >>${xObjectDict} >> >>`);
  });

  setObject(pagesId, `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`);
  setObject(catalogId, `<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  const parts = [];
  const offsets = [0];
  let offset = 0;

  function push(str){
    const chunk = encoder.encode(str);
    parts.push(chunk);
    offset += chunk.length;
  }

  function pushBinary(data){
    const chunk = data instanceof Uint8Array ? data : new Uint8Array(data);
    parts.push(chunk);
    offset += chunk.length;
  }

  push('%PDF-1.4\n');

  objects.forEach((obj, idx) => {
    offsets[idx + 1] = offset;
    push(`${idx + 1} 0 obj\n`);
    if(obj.body && typeof obj.body === 'object' && obj.body.stream){
      const bytes = obj.body.bytes instanceof Uint8Array ? obj.body.bytes : new Uint8Array(obj.body.bytes || []);
      let dict = obj.body.dict || '<< >>';
      if(/\/Length\b/.test(dict)){
        dict = dict.replace(/\/Length\s+\d+/, `/Length ${bytes.length}`);
      } else {
        dict = dict.replace('>>', ` /Length ${bytes.length} >>`);
      }
      push(`${dict}\nstream\n`);
      pushBinary(bytes);
      push('\nendstream\n');
    } else {
      push(`${obj.body}\n`);
    }
    push('endobj\n');
  });

  const xrefOffset = offset;
  push(`xref\n0 ${objects.length + 1}\n`);
  push('0000000000 65535 f \n');
  for(let i=1;i<=objects.length;i++){
    push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  push(`trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  let totalLength = 0;
  parts.forEach(chunk => { totalLength += chunk.length; });
  const pdfBytes = new Uint8Array(totalLength);
  let position = 0;
  parts.forEach(chunk => {
    pdfBytes.set(chunk, position);
    position += chunk.length;
  });
  return pdfBytes;
}

async function extractPrintableVisuals(html){
  const result = { media: [], textNotes: [] };
  if(!html) return result;

  const scratch = document.createElement('div');
  scratch.innerHTML = html;
  const svgNodes = Array.from(scratch.querySelectorAll('svg'));

  for(const svg of svgNodes){
    try {
      const serialized = serializeSvgForPdf(svg);
      const rendered = await rasterizeSvgForPdf(serialized);
      if(rendered && rendered.bytes && rendered.bytes.length){
        result.media.push(rendered);
      }
    } catch(err){
      console.warn('No s\'ha pogut convertir un SVG de la fitxa', err);
    }
    svg.remove();
  }

  const text = scratch.innerText.split(/\n+/)
    .map(line => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  result.textNotes = text;
  return result;
}

function serializeSvgForPdf(svg){
  const clone = svg.cloneNode(true);
  if(!clone.getAttribute('xmlns')){
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  if(!clone.getAttribute('xmlns:xlink')){
    clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }
  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

function dataUrlToUint8Array(dataUrl){
  const base64 = String(dataUrl).split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++){
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function rasterizeSvgForPdf(svgMarkup){
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = 'async';
    const loadPromise = new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (err) => reject(err || new Error('Error carregant SVG'));
    });
    img.src = url;
    await loadPromise;
    if(typeof img.decode === 'function'){
      try { await img.decode(); } catch {}
    }
    const naturalWidth = Math.max(1, Math.round(img.naturalWidth || img.width || 600));
    const naturalHeight = Math.max(1, Math.round(img.naturalHeight || img.height || 400));
    const canvas = document.createElement('canvas');
    const scale = Math.max(1, Math.min(3, 1200 / Math.max(naturalWidth, naturalHeight)));
    canvas.width = Math.max(1, Math.round(naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const bytes = dataUrlToUint8Array(dataUrl);
    return {
      bytes,
      pixelWidth: canvas.width,
      pixelHeight: canvas.height,
      widthPt: canvas.width * (72 / 96),
      heightPt: canvas.height * (72 / 96)
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
function closePrintableEditor(){
  closeModal();
}

/* ===================== GENERADORS ===================== */
// Els generadors de Matemàtiques s'han traslladat a math.js.

// FocusDay
function genFocusDay(level, opts={}){
  // 🔹 Triem un mòdul a l’atzar (excepte focusday)
  const candidates = MODULES.filter(m => m.id !== 'focusday' && typeof m.gen === 'function');
  const mod = choice(candidates);

  // 🔹 Generem una pregunta amb el seu generador
  const q = mod.gen(level, opts);

  // 🔹 Li afegim una etiqueta per saber de quin mòdul ve
  q.text = `[${mod.name}] ${q.text}`;
  return q;
}

addModules([
  {
    id: 'focusday',
    name: 'FocusDay',
    desc: 'Una pregunta de cada mòdul, diferent cada cop.',
    gen: genFocusDay,
    category: 'rep'
  }
]);


/* ===================== RESULTS ===================== */

// ==== HELPERS D'ANÀLISI I GRÀFICS ====
function avg(a){ return a.length ? a.reduce((s,x)=>s+x,0)/a.length : 0; }
function by(arr, key){
  return arr.reduce((m,x)=>{ const k = x[key]; (m[k]=m[k]||[]).push(x); return m; }, {});
}
function fmtPct(x){ return Math.round(x); }

// Gràfic de barres simple per a comparar mòduls o valors agregats
function barChartSVG(values, labels){
  const w = 360, h = 200, p = 28;
  const max = Math.max(...values, 0);
  const barWidth = values.length ? (w - p * 2) / values.length : 0;

  const bars = values.map((val, idx) => {
    const height = max ? (val / max) * (h - p * 2) : 0;
    const x = p + idx * barWidth;
    const y = h - p - height;
    return `
      <g>
        <rect x="${(x + 6).toFixed(2)}" y="${y.toFixed(2)}" width="${Math.max(barWidth - 12, 0).toFixed(2)}" height="${height.toFixed(2)}" fill="#93c5fd" stroke="#64748b">
          <animate attributeName="height" from="0" to="${height.toFixed(2)}" dur=".4s" fill="freeze"/>
          <animate attributeName="y" from="${(h - p).toFixed(2)}" to="${y.toFixed(2)}" dur=".4s" fill="freeze"/>
        </rect>
        <text x="${(x + barWidth / 2).toFixed(2)}" y="${h - 6}" text-anchor="middle" class="svg-label">${labels[idx] ?? ''}</text>
      </g>`;
  }).join('');

  return `
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Gràfic de barres">
      <rect x="0" y="0" width="${w}" height="${h}" rx="16" ry="16" fill="#f8fafc"/>
      ${bars}
    </svg>`;
}
if (typeof window !== 'undefined') {
  window.barChartSVG = barChartSVG;
}

// Gràfic de línies simple (puntuació vs temps)
function lineChartSVG(values, labels){
  const w=360, h=200, p=28;
  const max = Math.max(100, ...values);
  const min = 0;
  const n = values.length || 1;
  const dx = (w - 2*p) / Math.max(1, n-1);
  const mapX = i => p + i*dx;
  const mapY = v => h - p - ((v-min)/(max-min))*(h-2*p);
  let path = '';
  values.forEach((v,i)=>{ const x=mapX(i), y=mapY(v); path += (i?` L ${x} ${y}`:`M ${x} ${y}`); });
  const dots = values.map((v,i)=>`<circle cx="${mapX(i)}" cy="${mapY(v)}" r="3" fill="#0f172a"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}">
    <rect x="0" y="0" width="${w}" height="${h}" rx="16" ry="16" fill="#f8fafc"/>
    <path d="${path}" fill="none" stroke="#93c5fd" stroke-width="3"/>
    ${dots}
    ${labels.map((lb,i)=>`<text class="svg-label" x="${mapX(i)}" y="${h-6}" text-anchor="middle">${lb}</text>`).join('')}
  </svg>`;
}

// Scatter (Temps en minuts vs Puntuació %)
function scatterSVG(points){
  const w=360, h=200, p=28;
  const maxX = Math.max(1, ...points.map(p=>p.x));
  const maxY = 100;
  const mapX = v => p + (v/maxX)*(w-2*p);
  const mapY = v => h - p - (v/maxY)*(h-2*p);
  const dots = points.map(pt=>`<circle cx="${mapX(pt.x)}" cy="${mapY(pt.y)}" r="4" fill="#a7f3d0" stroke="#64748b"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}">
    <rect x="0" y="0" width="${w}" height="${h}" rx="16" ry="16" fill="#f8fafc"/>
    ${dots}
    <text class="svg-label" x="${p}" y="${p+4}">Temps (min)</text>
    <text class="svg-label" x="${w-p-40}" y="${p+4}">Punts (%)</text>
  </svg>`;
}

// ==== RENDER PRINCIPAL DE RESULTATS + PERFIL ====
function loadPrintableSets(){
  let entries = [];
  let chosenKey = PRINTABLE_STORAGE_KEYS[0];

  for (const key of PRINTABLE_STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        entries = parsed;
        chosenKey = key;
        break;
      }

      if (parsed && typeof parsed === 'object') {
        const values = Object.values(parsed).filter(Array.isArray);
        if (values.length) {
          entries = [].concat(...values);
          chosenKey = key;
          break;
        }
      }
    } catch (err) {
      console.warn('No s\'ha pogut llegir la llista de fitxes guardades.', err);
      chosenKey = key;
      entries = [];
      break;
    }
  }

  activePrintableStorageKey = chosenKey;
  return Array.isArray(entries) ? entries : [];
}

function normalizePrintableEntry(entry = {}) {
  const safeString = (value, fallback = '') => {
    if (value === null || value === undefined) return fallback;
    return String(value);
  };
  const safeNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const rawStamp = entry.generatedAt || entry.createdAt || entry.created || entry.date || entry.at || entry.timestamp || entry.time || '';
  const stamp = rawStamp ? new Date(rawStamp) : null;
  const stampValue = stamp && Number.isFinite(stamp.getTime()) ? stamp.getTime() : 0;
  const stampLabel = stampValue
    ? new Date(stampValue).toLocaleString('ca-ES', { dateStyle: 'short', timeStyle: 'short' })
    : 'Data desconeguda';

  const moduleLabel = safeString(entry.moduleName || entry.moduleLabel || entry.module || entry.moduleId || 'Fitxa Focus Academy');
  const levelLabel = safeString(entry.levelLabel || entry.levelName || (entry.level ? `Nivell ${entry.level}` : ''), '');
  const count = safeNumber(entry.count ?? entry.questions ?? entry.questionCount ?? entry.totalQuestions, 0);
  const student = safeString(entry.student || entry.name || entry.user || '', '');
  const notes = safeString(entry.notes || entry.note || entry.comment || '', '');
  const status = safeString(entry.status || entry.state || '', '');

  return {
    moduleLabel,
    levelLabel,
    count,
    student,
    notes,
    status,
    stampValue,
    stampLabel
  };
}

function clearPrintableSets(){
  try {
    if (activePrintableStorageKey) {
      localStorage.removeItem(activePrintableStorageKey);
    }
  } catch (err) {
    console.warn('No s\'ha pogut esborrar la llista de fitxes guardades.', err);
  }
  renderPrintableSets();
}

function renderPrintableSets(){
  const list = document.querySelector('#printablesList');
  const clearBtn = document.querySelector('#btnClearPrintables');
  if (!list) return;

  let entries = [];
  try {
    entries = loadPrintableSets();
  } catch (err) {
    console.warn('No s\'han pogut carregar les fitxes guardades.', err);
    entries = [];
  }

  if (!entries.length) {
    list.innerHTML = '<div class="chip">Encara no hi ha fitxes guardades.</div>';
    if (clearBtn) {
      clearBtn.disabled = true;
      clearBtn.onclick = null;
    }
    return;
  }

  const normalized = entries
    .map(normalizePrintableEntry)
    .sort((a, b) => (b.stampValue || 0) - (a.stampValue || 0));

  const markup = normalized.map(entry => {
    const tags = [];
    if (entry.levelLabel) tags.push(`<span class="chip">${escapeHTML(entry.levelLabel)}</span>`);
    if (entry.count) tags.push(`<span class="chip">${entry.count} preguntes</span>`);
    if (entry.student) tags.push(`<span class="chip">Alumne: ${escapeHTML(entry.student)}</span>`);
    if (entry.status) tags.push(`<span class="chip">${escapeHTML(entry.status)}</span>`);

    const notesBlock = entry.notes
      ? `<div class="printable-item-notes">${escapeHTML(entry.notes)}</div>`
      : '';

    return `
      <div class="printable-item">
        <div class="printable-item-head">
          <div class="printable-item-title">${escapeHTML(entry.moduleLabel)}</div>
          <div class="printable-item-meta">${escapeHTML(entry.stampLabel)}</div>
        </div>
        ${tags.length ? `<div class="printable-item-tags">${tags.join('')}</div>` : ''}
        ${notesBlock}
      </div>
    `;
  }).join('');

  list.innerHTML = markup;
  if (clearBtn) {
    clearBtn.disabled = false;
    clearBtn.onclick = () => {
      if (confirm('Vols esborrar totes les fitxes guardades?')) {
        clearPrintableSets();
      }
    };
  }
}

function renderResults(){
  renderPrintableSets();
  const data = store.all();
  const modSelect = $('#filter-module');
  const nameInput = $('#filter-student');
  const modFilter = modSelect ? modSelect.value : '';
  const nameFilter = (nameInput && nameInput.value ? nameInput.value : '').toLowerCase();
  const tableWrap = $('#resultsTable');
  if(!tableWrap) return;

  const filtered = data.filter(r =>
    (!modFilter || r.module===modFilter) &&
    (!nameFilter || (r.name||'').toLowerCase().includes(nameFilter))
  );

  // Taula
  if(!filtered.length){
    tableWrap.innerHTML = '<div class="chip">No hi ha dades per a aquesta sessió.</div>';
    renderAnalytics([], nameFilter); // neteja i mostra hint si cal
    return;
  }
  const rows = filtered.map((r,i)=>{
    const m = MODULES.find(m=>m.id===r.module)?.name || r.module;
    const d = new Date(r.at);
    const levelCell = r.levelLabel || (r.level > 0 ? `Nivell ${r.level}` : 'Mode lliure');
    return `<tr>
      <td>${i+1}</td>
      <td>${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
      <td>${r.name||''}</td>
      <td>${m}</td>
      <td>${levelCell}</td>
      <td>${r.correct}/${r.count}</td>
      <td>${r.score}%</td>
      <td>${fmtTime(r.time_spent)}</td>
    </tr>`;
  }).join('');
  tableWrap.innerHTML = `
<table>
  <thead>
    <tr><th>#</th><th>Data</th><th>Alumne/a</th><th>Mòdul</th><th>Nivell</th><th>Encerts</th><th>Puntuació</th><th>Temps</th></tr>
  </thead>
  <tbody>${rows}</tbody>
</table>`;

  // Perfil + gràfiques
  renderAnalytics(filtered, nameFilter);
}

// ==== PERFIL I GRÀFIQUES ====
function renderAnalytics(filtered, nameFilter){
  const hint = $('#analyticsHint');
  const kpi = $('#kpiWrap');
  const cTrend = $('#chartScoreTrend');
  const cByMod = $('#chartByModule');
  const cScatter = $('#chartTimeVsScore');

  // Mostra pista si no hi ha filtre d'alumne
  const hasName = !!nameFilter;
  if(hint) hint.style.display = hasName ? 'none' : 'inline-flex';

  // Neteja
  if(kpi) kpi.innerHTML = '';
  if(cTrend) cTrend.innerHTML = '';
  if(cByMod) cByMod.innerHTML = '';
  if(cScatter) cScatter.innerHTML = '';

  if(!filtered.length) return;

  // Subconjunt segons alumne (si n'hi ha filtre)
  let set = filtered;
  if(hasName){
    set = filtered.filter(r => (r.name||'').toLowerCase().includes(nameFilter));
    if(!set.length) return; // sense dades per a aquest nom
  }

  // ==== KPIs bàsics ====
  const scores = set.map(r=>r.score);
  const avgScore = avg(scores);
  const best = Math.max(...scores);
  const attempts = set.length;
  const avgTimeMin = avg(set.map(r=>r.time_spent))/60;

  if(kpi){
    kpi.innerHTML = `
      <div class="kpi"><div class="label">Mitjana de puntuació</div><div class="value">${fmtPct(avgScore)}%</div></div>
      <div class="kpi"><div class="label">Millor resultat</div><div class="value">${fmtPct(best)}%</div></div>
      <div class="kpi"><div class="label">Nº intents</div><div class="value">${attempts}</div></div>
      <div class="kpi"><div class="label">Temps mig (min)</div><div class="value">${avgTimeMin.toFixed(1)}</div></div>
    `;
  }

  // ==== Gràfic 1: evolució temporal ====
  const sorted = [...set].sort((a,b)=> new Date(a.at)-new Date(b.at));
  const trendVals = sorted.map(r=>r.score);
  const trendLabs = sorted.map(r=>{
    const d = new Date(r.at);
    return `${d.getDate()}/${d.getMonth()+1}`;
  });
  if(cTrend) cTrend.innerHTML = lineChartSVG(trendVals, trendLabs);

  // ==== Gràfic 2: mitjana per mòdul ====
  const modGroups = by(set, 'module');
  const labels = Object.keys(modGroups).map(id => MODULES.find(m=>m.id===id)?.name || id);
  const vals = Object.values(modGroups).map(arr => Math.round(avg(arr.map(r=>r.score))));
  if(cByMod) cByMod.innerHTML = barChartSVG(vals, labels); // reutilitza el teu barChartSVG existent

  // ==== Gràfic 3: temps vs puntuació ====
  const pts = set.map(r=>({ x: +(r.time_spent/60).toFixed(2), y: r.score }));
  if(cScatter) cScatter.innerHTML = scatterSVG(pts);
}


function exportCSV(){
  const data = store.all({ scope: 'all' });
  if(!data.length){ alert('No hi ha dades per exportar.'); return }
  const header = ['data','alumne','modul','nivell','preguntes','correctes','puntuacio','temps_limit','temps_consumit'];
  const lines = [header.join(',')];
  data.forEach(r=>{
    const levelValue = r.levelLabel || (r.level > 0 ? `Nivell ${r.level}` : 'Mode lliure');
    lines.push([r.at, r.name, r.module, levelValue, r.count, r.correct, r.score, r.time_limit, r.time_spent].join(','))
  })
  const blob = new Blob([lines.join('\n')], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download='focus-academy-math-results.csv'; a.click();
  URL.revokeObjectURL(url);
}

function clearResults(){
  if(confirm('Segur que vols esborrar tots els resultats d\'aquest dispositiu?')){
    store.clear(); renderResults();
  }
}

/* ===================== INPUT ===================== */

function typeKey(k){
  const inp = $('#answer');
  if(k==='del') inp.value = inp.value.slice(0,-1);
  else if(k==='-'){
    if(inp.value.startsWith('-')) inp.value = inp.value.slice(1); else inp.value = '-' + inp.value;
  } else inp.value += k;
  inp.focus();
}

document.addEventListener('keydown', (e)=>{
  if(!$('#view-quiz') || $('#view-quiz').classList.contains('hidden')) return;
  if(e.key==='Enter'){ e.preventDefault(); checkAnswer(); }
  if(e.key==='ArrowRight'){ e.preventDefault(); skip(); }
});

$('#btnCheck').onclick = checkAnswer;
$('#btnSkip').onclick = skip;

/* ===================== INIT ===================== */

let initializedUser = null;

function ensureUser(){
  const user = localStorage.getItem('lastStudent');
  const overlay = document.getElementById('loginOverlay');
  if(!user){
    if(overlay){
      overlay.style.display = 'flex';
      overlay.classList.add('is-active');
      overlay.removeAttribute('hidden');
    }
    return false;
  }
  if(overlay){
    overlay.style.display = 'none';
    overlay.classList.remove('is-active');
    overlay.setAttribute('hidden', '');
  }
  return true;
}

function init(){
  if(!ensureUser()) return; // ✅ comprova sessió abans d’inicialitzar

  const current = localStorage.getItem('lastStudent');
  if(initializedUser === current) return;
  initializedUser = current;

  buildHome();
  showView('home');
  $('#year').textContent = new Date().getFullYear();

  const fm = $('#filter-module');
  const fs = $('#filter-student');
  if(fm) fm.addEventListener('change', renderResults);
  if(fs) fs.addEventListener('input', renderResults);

  // 🔹 Mostra el nom de l’usuari actiu
  const chip = document.querySelector('#activeUser');
  if (chip) {
    const label = chip.querySelector('.label');
    if (label) label.textContent = current || 'Sessió no iniciada';
    chip.classList.toggle('is-empty', !current);
  }

  if (typeof showRecommendation === 'function') {
    showRecommendation('#recommendationText');
  }

  if (typeof renderResults === 'function') {
    renderResults();
  }

}

document.addEventListener('DOMContentLoaded', () => {
  const btnPrint = document.querySelector('#btnPrintSet');
  if (btnPrint) btnPrint.addEventListener('click', downloadActivitiesFromConfig);
  init();
});

document.addEventListener('focusquiz:user-login', init);
document.addEventListener('focusquiz:user-logout', () => {
  initializedUser = null;
  const chip = document.querySelector('#activeUser');
  if (chip) {
    const label = chip.querySelector('.label');
    if (label) label.textContent = 'Sessió no iniciada';
    chip.classList.add('is-empty');
  }
  if (typeof showRecommendation === 'function') {
    showRecommendation('#recommendationText');
  }
  if (typeof renderResults === 'function') {
    renderResults();
  }
  showView('home');
  ensureUser();
});

