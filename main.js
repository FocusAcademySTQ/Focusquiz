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
}

function closeModalAndGoHome(){
  closeModal();
  try {
    showView('home');
  } catch (err) {
    console.error('No s\'ha pogut tornar a l\'inici.', err);
  }
}

function openMapOverlay(title, src){
  const existing = document.querySelector('.map-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = 'map-overlay';
  const safeTitle = escapeHTML(title);
  overlay.innerHTML = `
    <div class="map-overlay__inner" role="dialog" aria-modal="true" aria-label="${safeTitle}">
      <button type="button" class="map-overlay__close" aria-label="Tanca el mapa">✕</button>
      <iframe class="map-overlay__frame" src="${src}" title="${safeTitle}" loading="lazy"></iframe>
    </div>
  `;

  function cleanup(){
    overlay.remove();
    document.removeEventListener('keydown', handleEscape);
  }

  function handleEscape(event){
    if (event.key === 'Escape') cleanup();
  }

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) cleanup();
  });

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.map-overlay__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', cleanup);
    closeBtn.focus?.();
  }

  document.addEventListener('keydown', handleEscape);
}

function openEuropeMap(){
  openMapOverlay("Mapa interactiu dels països d'Europa", 'geo-europe-map.html');
}

function openAmericaMap(){
  openMapOverlay("Mapa interactiu dels països d'Amèrica", 'geo-america-map.html');
}

function openAfricaMap(){
  openMapOverlay("Mapa interactiu dels països d'Àfrica", 'geo-africa-map.html');
}

function openAsiaMap(){
  openMapOverlay("Mapa interactiu dels països d'Àsia", 'geo-asia-map.html');
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
let urlModuleHandled = false;
let pendingUrlQuizConfig = null;
let pendingUrlQuizOverrides = null;
const DEFAULTS = { count: 10, time: 0, level: 1 };
let session = null;
let timerHandle = null;
let pendingPreviewRequested = false;
let previewContext = null;
let previewOverlay = null;
let previewStatusTimer = null;

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
    subgrid.className = 'grid' + (cat==='math' ? ' grid--math' : '');
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

  openModuleFromURL();
}

function parseUrlInt(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) ? num : null;
}

function parseUrlBoolean(value) {
  if (value === null || value === undefined) return false;
  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', 'si', 'sí'].includes(normalized);
}

function decodeQuizOptionsParam(value) {
  if (!value) return null;
  try {
    const padded = value.length % 4 === 0 ? value : value + '='.repeat(4 - (value.length % 4));
    const binary = typeof atob === 'function' ? atob(padded) : '';
    if (!binary) return null;
    let json = '';
    if (typeof TextDecoder !== 'undefined') {
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      json = new TextDecoder().decode(bytes);
    } else {
      json = decodeURIComponent(Array.prototype.map.call(binary, (c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''));
    }
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed;
  } catch (error) {
    console.warn('No s\'ha pogut llegir la configuració de la prova des de l\'URL', error);
    return null;
  }
}

function extractQuizConfigFromParams(params) {
  if (!params) return null;
  const count = parseUrlInt(params.get('count'));
  const time = parseUrlInt(params.get('time'));
  const level = parseUrlInt(params.get('level'));
  const labelRaw = params.get('label');
  const assignmentIdRaw = params.get('assignment');
  const classCodeRaw = params.get('class');
  const classIdRaw = params.get('classId') || params.get('class_id');
  const studentRaw = params.get('student');
  const titleRaw = params.get('title');
  const optionsParam = params.get('opts') || params.get('options');
  const options = optionsParam ? decodeQuizOptionsParam(optionsParam) : null;
  const autostart = parseUrlBoolean(params.get('autostart') ?? params.get('start'));
  const preview = parseUrlBoolean(params.get('preview') ?? params.get('portalPreview'));
  const tags = [];
  const tagParams = params.getAll ? params.getAll('tag') : [];
  tagParams.forEach((tag) => {
    if (tag && typeof tag === 'string' && tag.trim()) tags.push(tag.trim());
  });
  const tagsJoined = params.get('tags');
  if (tagsJoined && typeof tagsJoined === 'string') {
    tagsJoined.split(',').forEach((tag) => {
      if (tag && tag.trim()) tags.push(tag.trim());
    });
  }

  const config = {};
  if (Number.isFinite(count)) config.count = clamp(count, 1, 200);
  if (Number.isFinite(time)) config.time = clamp(time, 0, 180);
  if (Number.isFinite(level)) config.level = clamp(level, 1, 4);
  if (options) config.options = options;
  if (labelRaw && typeof labelRaw === 'string' && labelRaw.trim()) config.label = labelRaw.trim();
  if (assignmentIdRaw && typeof assignmentIdRaw === 'string' && assignmentIdRaw.trim()) {
    config.assignmentId = assignmentIdRaw.trim();
  }
  if (classCodeRaw && typeof classCodeRaw === 'string' && classCodeRaw.trim()) {
    config.classCode = classCodeRaw.trim();
  }
  if (classIdRaw && typeof classIdRaw === 'string' && classIdRaw.trim()) {
    config.classId = classIdRaw.trim();
  }
  if (studentRaw && typeof studentRaw === 'string' && studentRaw.trim()) {
    config.studentName = studentRaw.trim();
  }
  if (titleRaw && typeof titleRaw === 'string' && titleRaw.trim()) {
    config.moduleTitle = titleRaw.trim();
  }
  if (autostart) config.autostart = true;
  if (preview) config.preview = true;
  if (tags.length) {
    config.assignmentTags = Array.from(new Set(tags));
  }

  return Object.keys(config).length ? config : null;
}

function applyUrlQuizConfig(config) {
  if (!config) return;
  pendingPreviewRequested = Boolean(config.preview);
  const countInput = $('#cfg-count');
  if (countInput && Number.isFinite(config.count)) {
    countInput.value = String(clamp(config.count, 1, 200));
  }

  const timeInput = $('#cfg-time');
  if (timeInput && Number.isFinite(config.time)) {
    timeInput.value = String(clamp(config.time, 0, 180));
  }

  const levelSelect = $('#cfg-level');
  if (levelSelect && Number.isFinite(config.level)) {
    levelSelect.value = String(clamp(config.level, 1, 4));
  }

  if (config.autostart) {
    const meta = {};
    if (config.label) meta.label = config.label;
    if (config.assignmentId) meta.assignmentId = config.assignmentId;
    if (config.assignmentTags) meta.assignmentTags = config.assignmentTags;
    setTimeout(() => {
      startFromConfig(meta);
    }, 150);
  }
}

function openModuleFromURL(){
  if (urlModuleHandled) return;
  let searchParams = null;
  let moduleId = null;
  try {
    searchParams = new URLSearchParams(window.location.search);
    moduleId = searchParams.get('module');
  } catch {}

  let hashParams = null;
  if ((!moduleId || !moduleId.trim()) && window.location.hash) {
    try {
      hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      if (!moduleId) moduleId = hashParams.get('module');
    } catch {}
  }

  if (!moduleId) return;
  moduleId = moduleId.trim();
  if (!moduleId) return;

  const target = MODULES.find(m => m.id === moduleId);
  if (!target) return;

  const sourceParams = (searchParams && searchParams.get('module') === moduleId)
    ? searchParams
    : (hashParams && hashParams.get('module') === moduleId)
      ? hashParams
      : searchParams;

  pendingUrlQuizConfig = extractQuizConfigFromParams(sourceParams);
  pendingUrlQuizOverrides = pendingUrlQuizConfig
    ? {
        options: pendingUrlQuizConfig.options || null,
        label: pendingUrlQuizConfig.label || '',
        assignmentId: pendingUrlQuizConfig.assignmentId || '',
        assignmentTags: pendingUrlQuizConfig.assignmentTags || null,
        classCode: pendingUrlQuizConfig.classCode || '',
        classId: pendingUrlQuizConfig.classId || '',
        studentName: pendingUrlQuizConfig.studentName || '',
        moduleTitle: pendingUrlQuizConfig.moduleTitle || '',
        preview: Boolean(pendingUrlQuizConfig.preview),
      }
    : null;

  urlModuleHandled = true;
  openConfig(target.id);

  if (pendingUrlQuizConfig) {
    setTimeout(() => {
      applyUrlQuizConfig(pendingUrlQuizConfig);
    }, 60);
  }
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
  } else if(pendingModule.id === 'geo-europe') {
    wrap.innerHTML = `
      <div class="section-title">Recurs interactiu</div>
      <p class="subtitle">Complementa el qüestionari amb un mapa on pots practicar la localització dels països en directe.</p>
      <div class="controls">
        <a class="btn-secondary" href="geo-europe-map.html" target="_blank" rel="noopener">Obre el mapa interactiu →</a>
      </div>`;
  } else if(pendingModule.id === 'geo-america') {
    wrap.innerHTML = `
      <div class="section-title">Recurs interactiu</div>
      <p class="subtitle">Repassa els països americans amb el mapa interactiu i posa a prova la teva memòria visual.</p>
      <div class="controls">
        <a class="btn-secondary" href="geo-america-map.html" target="_blank" rel="noopener">Obre el mapa interactiu →</a>
      </div>`;
  } else if(pendingModule.id === 'geo-africa') {
    wrap.innerHTML = `
      <div class="section-title">Recurs interactiu</div>
      <p class="subtitle">Explora el continent africà identificant ràpidament els seus països al mapa interactiu.</p>
      <div class="controls">
        <a class="btn-secondary" href="geo-africa-map.html" target="_blank" rel="noopener">Obre el mapa interactiu →</a>
      </div>`;
  } else if(pendingModule.id === 'geo-asia') {
    wrap.innerHTML = `
      <div class="section-title">Recurs interactiu</div>
      <p class="subtitle">Practica la localització dels països asiàtics i millora el teu domini geogràfic visual.</p>
      <div class="controls">
        <a class="btn-secondary" href="geo-asia-map.html" target="_blank" rel="noopener">Obre el mapa interactiu →</a>
      </div>`;
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

function startFromConfig(meta){
  const cfg = collectConfigValues();
  if(!cfg) return;
  if (pendingUrlQuizOverrides && pendingUrlQuizOverrides.options) {
    cfg.options = Object.assign({}, cfg.options || {}, pendingUrlQuizOverrides.options);
  }
  const metaData = (meta && typeof meta === 'object') ? { ...meta } : {};
  if (!metaData.label && pendingUrlQuizOverrides && pendingUrlQuizOverrides.label) {
    metaData.label = pendingUrlQuizOverrides.label;
  }
  if (!metaData.assignmentId && pendingUrlQuizOverrides && pendingUrlQuizOverrides.assignmentId) {
    metaData.assignmentId = pendingUrlQuizOverrides.assignmentId;
  }
  if (!metaData.assignmentTags && pendingUrlQuizOverrides && pendingUrlQuizOverrides.assignmentTags) {
    metaData.assignmentTags = pendingUrlQuizOverrides.assignmentTags;
  }
  if (!metaData.classCode && pendingUrlQuizOverrides && pendingUrlQuizOverrides.classCode) {
    metaData.classCode = pendingUrlQuizOverrides.classCode;
  }
  if (!metaData.classId && pendingUrlQuizOverrides && pendingUrlQuizOverrides.classId) {
    metaData.classId = pendingUrlQuizOverrides.classId;
  }
  if (!metaData.studentName && pendingUrlQuizOverrides && pendingUrlQuizOverrides.studentName) {
    metaData.studentName = pendingUrlQuizOverrides.studentName;
  }
  if (!metaData.moduleTitle && pendingUrlQuizOverrides && pendingUrlQuizOverrides.moduleTitle) {
    metaData.moduleTitle = pendingUrlQuizOverrides.moduleTitle;
  }
  const previewRequested = Boolean((pendingUrlQuizOverrides && pendingUrlQuizOverrides.preview) || pendingPreviewRequested);
  if (previewRequested) {
    pendingPreviewRequested = false;
    if (pendingUrlQuizOverrides) {
      pendingUrlQuizOverrides.preview = false;
    }
    if (pendingModule) {
      startPreviewSession(pendingModule.id, cfg, metaData);
    }
    pendingUrlQuizConfig = null;
    pendingUrlQuizOverrides = null;
    return;
  }
  if (cfg.options?.mode === 'map') {
    if (pendingModule?.id === 'geo-europe') {
      openEuropeMap();
      pendingUrlQuizConfig = null;
      pendingUrlQuizOverrides = null;
      return;
    }
    if (pendingModule?.id === 'geo-america') {
      openAmericaMap();
      pendingUrlQuizConfig = null;
      pendingUrlQuizOverrides = null;
      return;
    }
    if (pendingModule?.id === 'geo-africa') {
      openAfricaMap();
      pendingUrlQuizConfig = null;
      pendingUrlQuizOverrides = null;
      return;
    }
    if (pendingModule?.id === 'geo-asia') {
      openAsiaMap();
      pendingUrlQuizConfig = null;
      pendingUrlQuizOverrides = null;
      return;
    }
  }
  startQuiz(pendingModule.id, cfg, metaData);
  pendingUrlQuizConfig = null;
  pendingUrlQuizOverrides = null;
}

/* ===================== QUIZ ENGINE ===================== */

function startQuiz(moduleId, cfg, meta = {}){
  const module = MODULES.find(m=>m.id===moduleId) || MODULES[0];
  const count = clamp(parseInt(cfg.count)||10, 1, 200);
  const time = clamp(parseInt(cfg.time)||0, 0, 180);
  const usesLevels = module?.usesLevels !== false;
  const rawLevel = parseInt(cfg.level);
  const genLevel = usesLevels ? clamp(rawLevel||1, 1, 4) : clamp(rawLevel||4, 1, 4);
  const levelLabel = usesLevels ? `Nivell ${genLevel}` : (module?.levelLabel || 'Mode lliure');
  const storedLevel = usesLevels ? genLevel : 0;
  const optionsClone = cfg && typeof cfg.options === 'object' ? cloneObject(cfg.options) : {};
  let prebuiltQuestions = null;
  if (Array.isArray(optionsClone.questions) && optionsClone.questions.length) {
    prebuiltQuestions = optionsClone.questions.map(cloneQuizQuestion);
    delete optionsClone.questions;
  }
  const metaData = (meta && typeof meta === 'object') ? meta : {};
  const customLabel = typeof metaData.label === 'string' ? metaData.label.trim() : '';
  const assignmentId = typeof metaData.assignmentId === 'string' ? metaData.assignmentId.trim() : '';
  const assignmentTags = Array.isArray(metaData.assignmentTags)
    ? metaData.assignmentTags.filter((tag) => typeof tag === 'string' && tag.trim()).map((tag) => tag.trim())
    : [];
  const classCode = typeof metaData.classCode === 'string' ? metaData.classCode.trim() : '';
  const classId = typeof metaData.classId === 'string' ? metaData.classId.trim() : '';
  const studentName = typeof metaData.studentName === 'string' ? metaData.studentName.trim() : '';
  const moduleTitle = typeof metaData.moduleTitle === 'string' && metaData.moduleTitle.trim()
    ? metaData.moduleTitle.trim()
    : module?.name || moduleId;
  const quizTitle = customLabel || moduleTitle;

  if (prebuiltQuestions && prebuiltQuestions.length) {
    const metaOverrides = { ...metaData, level: storedLevel, time };
    startQuizFromExisting(moduleId, optionsClone, prebuiltQuestions, metaOverrides);
    return;
  }

  session = {
    module: moduleId,
    count,
    time,
    level: storedLevel,
    idx: 0,
    correct: 0,
    wrongs: [],
    startedAt: Date.now(),
    secondsLeft: time > 0 ? time * 60 : 0,
    questions: [],
    options: optionsClone,
    levelLabel,
    assignmentId: assignmentId || null,
    assignmentLabel: customLabel || null,
    assignmentTitle: quizTitle,
    assignmentTags,
    moduleName: module?.name || moduleId,
    moduleTitle,
    classCode: classCode || null,
    classId: classId || null,
    studentName: studentName || null,
  };

  for(let i=0;i<count;i++) session.questions.push(module.gen(genLevel, session.options));

  $('#qModule').textContent = quizTitle;
  $('#qLevel').textContent = session.levelLabel;
  $('#feedback').innerHTML='';
  $('#answer').value='';
  updateProgress();
  showView('quiz');
  renderQuestion();
  stopTimer();
  if(time>0) startTimer(); else $('#timer').textContent='Sense límit';
  if(moduleId === 'coord'){
    setTimeout(()=> document.getElementById('coordInputX')?.focus(), 0);
  } else {
    $('#answer').focus();
  }
}

// Nova: començar amb preguntes existents (repàs d'errors)
function startQuizFromExisting(moduleId, options, questions, meta={}){
  const module = MODULES.find(m=>m.id===moduleId) || MODULES[0];
  const normalized = Array.isArray(questions)
    ? questions.map((question) => cloneQuizQuestion(question))
    : [];
  const opts = options ? cloneObject(options) : {};
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
  if(moduleId === 'coord'){
    setTimeout(()=> document.getElementById('coordInputX')?.focus(), 0);
  } else {
    $('#answer').focus();
  }
}

function cloneObject(value) {
  if (value === null || value === undefined) return {};
  if (typeof value !== 'object') return {};
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_error) {
    if (Array.isArray(value)) return value.slice();
    return { ...value };
  }
}

function cloneQuizQuestion(question) {
  if (!question || typeof question !== 'object') {
    return { type: 'unknown', text: '', answer: '' };
  }
  try {
    return JSON.parse(JSON.stringify(question));
  } catch (_error) {
    return {
      type: question.type,
      text: question.text,
      title: question.title,
      html: question.html,
      answer: question.answer,
      options: Array.isArray(question.options) ? question.options.slice() : question.options,
      input: question.input,
      meta: question.meta,
      numeric: question.numeric,
      piCoef: question.piCoef,
      sol: question.sol,
      sols: Array.isArray(question.sols) ? question.sols.slice() : question.sols,
    };
  }
}

function startPreviewSession(moduleId, cfg, meta = {}) {
  const module = MODULES.find((m) => m.id === moduleId) || MODULES[0];
  if (!module) return;
  const count = clamp(parseInt(cfg.count) || DEFAULTS.count, 1, 200);
  const time = clamp(parseInt(cfg.time) || 0, 0, 180);
  const usesLevels = module?.usesLevels !== false;
  const rawLevel = parseInt(cfg.level);
  const level = usesLevels ? clamp(rawLevel || DEFAULTS.level, 1, 4) : clamp(rawLevel || 4, 1, 4);
  const baseOptions = cfg.options && typeof cfg.options === 'object' ? cloneObject(cfg.options) : {};
  let questions = [];
  if (Array.isArray(baseOptions.questions) && baseOptions.questions.length) {
    questions = baseOptions.questions.map((question) => cloneQuizQuestion(question));
  }
  if (baseOptions.questions) {
    delete baseOptions.questions;
  }
  if (!questions.length) {
    for (let i = 0; i < count; i += 1) {
      questions.push(generatePreviewQuestion(module, level, baseOptions));
    }
  }
  previewContext = {
    moduleId,
    module,
    moduleName: module?.name || moduleId,
    moduleTitle: meta.moduleTitle || module?.name || moduleId,
    label: meta.label || '',
    count: questions.length,
    time,
    level,
    options: baseOptions,
    questions,
  };
  renderPreviewOverlay();
}

function generatePreviewQuestion(module, level, options) {
  try {
    const opts = options ? cloneObject(options) : {};
    const generated = module.gen(level, opts);
    return cloneQuizQuestion(generated);
  } catch (error) {
    console.error('No s\'ha pogut generar una pregunta de previsualització', error);
    return {
      type: module?.id || 'preview',
      text: 'No s\'ha pogut generar aquesta pregunta.',
      answer: '—',
      options: null,
    };
  }
}

function renderPreviewOverlay() {
  if (!previewContext) return;
  destroyPreviewOverlay();
  previewOverlay = document.createElement('div');
  previewOverlay.className = 'preview-overlay';
  const timeLabel = previewContext.time > 0 ? `${previewContext.time} min` : 'Sense límit';
  const subtitleParts = [
    `${previewContext.count} preguntes`,
    previewContext.moduleName,
  ];
  if (previewContext.level && previewContext.level > 0 && previewContext.module?.usesLevels !== false) {
    subtitleParts.push(`Nivell ${previewContext.level}`);
  }
  subtitleParts.push(timeLabel);
  const subtitle = subtitleParts.join(' · ');
  const safeTitle = escapeHTML(previewContext.label || previewContext.moduleTitle || previewContext.moduleName);
  previewOverlay.innerHTML = `
    <div class="preview-panel panel card" role="dialog" aria-modal="true" aria-label="Previsualització de l'examen">
      <header class="preview-header">
        <div>
          <p class="preview-kicker">Previsualització de l'examen</p>
          <h2>${safeTitle}</h2>
          <p class="preview-subtitle">${escapeHTML(subtitle)}</p>
        </div>
        <div class="preview-actions">
          <button type="button" class="pill" data-preview-action="regenerate">Canvia totes les preguntes</button>
          <button type="button" class="btn-secondary" data-preview-action="save">Desa i torna</button>
          <button type="button" class="btn-ghost" data-preview-action="close">Tanca</button>
        </div>
      </header>
      <div class="preview-status" role="status" aria-live="polite"></div>
      <div class="preview-body" id="previewQuestionList"></div>
    </div>
  `;
  document.body.appendChild(previewOverlay);
  const list = previewOverlay.querySelector('#previewQuestionList');
  if (list) {
    list.addEventListener('click', handlePreviewQuestionClick);
    renderPreviewQuestionList(list);
  }
  const actions = previewOverlay.querySelector('.preview-actions');
  actions?.addEventListener('click', handlePreviewAction);
  previewOverlay.addEventListener('click', handlePreviewOverlayClick);
  document.addEventListener('keydown', handlePreviewKeydown);
  if (previewContext.questions.length) {
    setPreviewStatus(`Mostrant ${previewContext.questions.length} preguntes.`, 2200);
  }
}

function renderPreviewQuestionList(container) {
  if (!container || !previewContext) return;
  container.innerHTML = '';
  previewContext.questions.forEach((question, index) => {
    const card = document.createElement('article');
    card.className = 'preview-question';
    const questionIndex = index + 1;
    const titleHtml = question.title ? `<h3>${question.title}</h3>` : '';
    const textHtml = question.text ? `<div class="preview-question__text">${question.text}</div>` : '';
    const mediaHtml = question.html ? `<div class="preview-question__media">${question.html}</div>` : '';
    let optionsHtml = '';
    if (Array.isArray(question.options) && question.options.length) {
      const optionItems = question.options.map((opt) => `<li>${escapeHTML(String(opt))}</li>`).join('');
      optionsHtml = `<ul class="preview-question__options">${optionItems}</ul>`;
    }
    const answerHtml = escapeHTML(String(fmtAns(question.answer !== undefined ? question.answer : '—')));
    card.innerHTML = `
      <header class="preview-question__header">
        <span class="preview-question__index">Pregunta ${questionIndex}</span>
        <button type="button" class="btn-ghost preview-question__replace" data-preview-index="${index}">Canvia</button>
      </header>
      <div class="preview-question__body">
        ${titleHtml}
        ${textHtml}
        ${mediaHtml}
        ${optionsHtml}
      </div>
      <details class="preview-question__answer">
        <summary>Resposta correcta</summary>
        <p>${answerHtml}</p>
      </details>
    `;
    container.appendChild(card);
  });
}

function handlePreviewAction(event) {
  const button = event.target.closest('[data-preview-action]');
  if (!button) return;
  event.preventDefault();
  const action = button.dataset.previewAction;
  if (action === 'regenerate') {
    regenerateAllPreviewQuestions();
  } else if (action === 'save') {
    sendPreviewSelection();
  } else if (action === 'close') {
    closePreviewWindow();
  }
}

function handlePreviewQuestionClick(event) {
  const button = event.target.closest('[data-preview-index]');
  if (!button) return;
  event.preventDefault();
  const index = Number.parseInt(button.dataset.previewIndex, 10);
  if (!Number.isInteger(index)) return;
  replacePreviewQuestion(index);
}

function handlePreviewOverlayClick(event) {
  if (event.target === previewOverlay) {
    closePreviewWindow();
  }
}

function replacePreviewQuestion(index) {
  if (!previewContext || !previewContext.module) return;
  if (index < 0 || index >= previewContext.questions.length) return;
  previewContext.questions[index] = generatePreviewQuestion(previewContext.module, previewContext.level, previewContext.options);
  previewContext.count = previewContext.questions.length;
  const list = previewOverlay?.querySelector('#previewQuestionList');
  if (list) {
    renderPreviewQuestionList(list);
  }
  setPreviewStatus(`Pregunta ${index + 1} actualitzada.`, 2000);
}

function regenerateAllPreviewQuestions() {
  if (!previewContext || !previewContext.module) return;
  const targetCount = previewContext.questions.length || previewContext.count || DEFAULTS.count;
  const refreshed = [];
  for (let i = 0; i < targetCount; i += 1) {
    refreshed.push(generatePreviewQuestion(previewContext.module, previewContext.level, previewContext.options));
  }
  previewContext.questions = refreshed;
  previewContext.count = refreshed.length;
  const list = previewOverlay?.querySelector('#previewQuestionList');
  if (list) {
    renderPreviewQuestionList(list);
  }
  setPreviewStatus('S\'han regenerat totes les preguntes.', 2200);
}

function setPreviewStatus(message, timeout = 2400) {
  const statusNode = previewOverlay?.querySelector('.preview-status');
  if (!statusNode) return;
  statusNode.textContent = message || '';
  statusNode.classList.toggle('is-visible', Boolean(message));
  if (previewStatusTimer) {
    clearTimeout(previewStatusTimer);
    previewStatusTimer = null;
  }
  if (message && timeout > 0) {
    previewStatusTimer = setTimeout(() => {
      if (statusNode.textContent === message) {
        statusNode.textContent = '';
        statusNode.classList.remove('is-visible');
      }
      previewStatusTimer = null;
    }, timeout);
  }
}

function sendPreviewSelection() {
  if (!previewContext) return;
  const target = window.opener;
  if (!target || target.closed) {
    setPreviewStatus('No s\'ha pogut enviar la previsualització. Obre-la des del gestor.', 3200);
    return;
  }
  const payload = {
    type: 'focusquiz-preview',
    moduleId: previewContext.moduleId,
    options: cloneObject(previewContext.options || {}),
    questions: previewContext.questions.map((question) => cloneQuizQuestion(question)),
  };
  try {
    target.postMessage(payload, window.location.origin || '*');
    setPreviewStatus('Examen guardat. Pots tancar aquesta finestra.', 3200);
  } catch (error) {
    console.error('No s\'ha pogut enviar la previsualització', error);
    setPreviewStatus('Error en guardar la previsualització.', 3200);
  }
}

function handlePreviewKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault();
    closePreviewWindow();
  }
}

function closePreviewWindow() {
  destroyPreviewOverlay();
  try {
    window.close();
  } catch (_error) {
    // ignore close errors
  }
  previewContext = null;
}

function destroyPreviewOverlay() {
  if (previewOverlay) {
    const list = previewOverlay.querySelector('#previewQuestionList');
    if (list) {
      list.removeEventListener('click', handlePreviewQuestionClick);
    }
    const actions = previewOverlay.querySelector('.preview-actions');
    actions?.removeEventListener('click', handlePreviewAction);
    previewOverlay.removeEventListener('click', handlePreviewOverlayClick);
    previewOverlay.remove();
  }
  previewOverlay = null;
  if (previewStatusTimer) {
    clearTimeout(previewStatusTimer);
    previewStatusTimer = null;
  }
  document.removeEventListener('keydown', handlePreviewKeydown);
}

function removeCoordAnswerUI(){
  const wrap = document.getElementById('coordAnswerWrap');
  if(wrap) wrap.remove();
}

function renderCoordAnswerUI(){
  removeCoordAnswerUI();
  const answerRow = document.querySelector('.answer-row');
  const answerInput = document.getElementById('answer');
  if(!answerRow || !answerInput) return;

  const wrap = document.createElement('div');
  wrap.id = 'coordAnswerWrap';
  wrap.className = 'coord-answer';
  wrap.innerHTML = `
    <span class="coord-token">(</span>
    <input id="coordInputX" class="coord-number" inputmode="decimal" autocomplete="off" aria-label="Coordenada X" placeholder="x" />
    <span class="coord-token">,</span>
    <input id="coordInputY" class="coord-number" inputmode="decimal" autocomplete="off" aria-label="Coordenada Y" placeholder="y" />
    <span class="coord-token">)</span>
  `;
  answerRow.insertBefore(wrap, answerInput);
  setTimeout(()=> document.getElementById('coordInputX')?.focus(), 0);
}

function renderQuestion(){
  const q = session.questions[session.idx];
  $('#qMeta').textContent = `Pregunta ${session.idx+1} de ${session.count}`;
  $('#qText').innerHTML = q.title || q.text;
  $('#qMedia').innerHTML = q.html ? `<div class="fade-in">${q.html}</div>` : '';
  $('#answer').value = '';
  $('#answer').removeAttribute('placeholder');
  $('#feedback').innerHTML = '';
  const rightCol = $('#rightCol');
  const keypad = $('#keypad');
  if (keypad) keypad.innerHTML = ''; // neteja sempre

  const mod = MODULES.find(m => m.id === session.module);
  const quizEl = document.querySelector('.quiz');
  quizEl?.classList.remove('coord-mode');
  removeCoordAnswerUI();

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
    $('#answer').type = 'text';
    if(session.module === 'coord'){
      $('#answer').style.display = 'none';
      $('#answer').removeAttribute('inputmode');
      toggleRightCol(false);
      quizEl?.classList.add('coord-mode');
      renderCoordAnswerUI();
    } else if (session.module === 'stats' && q.type === 'stats-cat') {
      $('#answer').style.display = 'block';
      $('#answer').setAttribute('inputmode','text');
      $('#answer').setAttribute('placeholder','Escriu la lletra correcta');
      toggleRightCol(true);
      renderStatsLegend(q);
    } else {
      $('#answer').style.display = 'block';
      $('#answer').setAttribute('inputmode','decimal');
      toggleRightCol(true);
      renderKeypad();
    }
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

function renderStatsLegend(q){
  const container = $('#keypad');
  if(!container) return;
  const meta = q && typeof q === 'object' ? (q.meta || {}) : {};
  const labels = Array.isArray(meta.labels) ? meta.labels : [];
  const colors = Array.isArray(meta.colors) ? meta.colors : [];
  const items = labels.map((label, idx) => {
    const color = colors[idx] || '#cbd5f5';
    const safeLabel = escapeHTML(label);
    return `
      <div class="stats-legend__item">
        <span class="stats-legend__swatch" style="background:${color}"></span>
        <span class="stats-legend__letter">${safeLabel}</span>
      </div>
    `;
  }).join('');
  const info = meta.chartType === 'pie'
    ? 'Introdueix la lletra de la porció més gran del gràfic.'
    : 'Introdueix la lletra de la categoria amb el valor més alt.';
  container.innerHTML = `
    <div class="stats-legend">
      <h3 class="title" style="margin-top:0">Llegenda del gràfic</h3>
      <p class="subtitle">${info}</p>
      <div class="stats-legend__grid">
        ${items || '<div class="chip">Escriu la lletra corresponent.</div>'}
      </div>
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
  if(session.module === 'coord'){
    const xInput = document.getElementById('coordInputX');
    const yInput = document.getElementById('coordInputY');
    if(xInput && yInput){
      const xVal = xInput.value.trim();
      const yVal = yInput.value.trim();
      if(xVal === '' || yVal === ''){
        $('#answer').value = '';
      } else {
        $('#answer').value = `(${xVal},${yVal})`;
      }
    }
  }
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


  const supabaseSync = window?.FocusSupabase;
  if (supabaseSync && typeof supabaseSync.submitResult === 'function') {
    const syncContext = {
      assignmentId: session.assignmentId || null,
      assignmentLabel: session.assignmentLabel || null,
      assignmentTitle: session.assignmentTitle || null,
      module: session.module,
      moduleName: session.moduleName,
      moduleTitle: session.moduleTitle || session.moduleName,
      classCode: session.classCode || null,
      classId: session.classId || null,
      studentName: session.studentName || name,
    };
    if (syncContext.assignmentId && syncContext.classId && syncContext.classCode && syncContext.studentName) {
      Promise.resolve(supabaseSync.submitResult(entry, syncContext))
        .then((result) => {
          if (!result || result.ok) return;
          if (result.reason && ['missing-context', 'disabled'].includes(result.reason)) {
            console.info('FocusSupabase: sincronització no disponible ara mateix (%s).', result.reason);
            return;
          }
          console.warn('FocusSupabase: no s\'ha pogut sincronitzar el resultat amb Supabase.', result);
        })
        .catch((error) => {
          console.error('FocusSupabase: error inesperat en sincronitzar la prova.', error);
        });
    }
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
      <button class="btn-ghost" onclick="closeModalAndGoHome()">Tanca</button>
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
  const qs = session.wrongs.map((wrong) => cloneQuizQuestion(wrong));
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

function setupTheoryDropdown(){
  const dropdown = document.querySelector('.nav-dropdown[data-dropdown]');
  if (!dropdown) return;
  if (dropdown.dataset.controllerBound === 'true') return;

  const toggle = dropdown.querySelector('.nav-dropdown-toggle');
  const menu = dropdown.querySelector('.dropdown-menu');
  if (!toggle || !menu) return;

  dropdown.dataset.controllerBound = 'true';

  const getFirstItem = () => menu.querySelector('a, button, [role="menuitem"], [tabindex="0"]');
  toggle.setAttribute('aria-expanded', dropdown.classList.contains('is-open') ? 'true' : 'false');

  const closeDropdown = () => {
    if (!dropdown.classList.contains('is-open')) return;
    dropdown.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  const openDropdown = () => {
    if (dropdown.classList.contains('is-open')) return;
    dropdown.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const handleDocumentClick = (event) => {
    if (!dropdown.contains(event.target)) {
      closeDropdown();
    }
  };

  const handleDocumentKeydown = (event) => {
    if (event.key === 'Escape') {
      if (dropdown.classList.contains('is-open')) {
        closeDropdown();
        toggle.focus();
      }
    }
  };

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (dropdown.classList.contains('is-open')) {
      closeDropdown();
    } else {
      openDropdown();
      if (event.detail === 0) {
        const first = getFirstItem();
        if (first) first.focus();
      }
    }
  });

  toggle.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      openDropdown();
      const first = getFirstItem();
      if (first) first.focus();
      event.preventDefault();
    } else if (event.key === 'Escape') {
      closeDropdown();
      event.preventDefault();
    }
  });

  menu.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeDropdown();
      toggle.focus();
      event.preventDefault();
    }
  });

  menu.addEventListener('click', (event) => {
    if (event.target.closest('a, button, [role="menuitem"]')) {
      closeDropdown();
    }
  });

  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('keydown', handleDocumentKeydown);
}

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
  setupTheoryDropdown();
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

