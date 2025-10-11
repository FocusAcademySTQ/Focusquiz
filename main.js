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

  all(options = {}) {
    const data = this.load();
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
    if (!targetUser) return [];

    const entries = Array.isArray(data[targetUser]) ? data[targetUser] : [];
    return sortDesc(entries);
  },

  save(entry) {
    const user = this.defaultUser();
    const data = this.load();
    if (!Array.isArray(data[user])) data[user] = [];
    data[user].push(entry);
    localStorage.setItem(this.k, JSON.stringify(data));
  },

  clear() {
    const user = this.defaultUser();
    const data = this.load();
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

const MODULES = [
  { id:'arith', name:'Aritmètica', desc:'Sumes, restes, multiplicacions i divisions.', gen: genArith, category:'math' },
  { id:'frac',  name:'Fraccions',  desc:'Identificar (imatge), aritmètica i simplificar.', gen: genFractions, category:'math' },
  { id:'perc',  name:'Percentatges', desc:'Calcula percentatges i descomptes.', gen: genPercent, category:'math' },
  { id:'geom',  name:'Àrees, perímetres i volums', desc:'Figures 2D i cossos 3D.', gen: genGeometry, category:'math' },
  { id:'stats', name:'Estadística bàsica', desc:'Mitjana/mediana/moda, rang/desviació i gràfics.', gen: genStats, category:'math' },
  { id:'units', name:'Unitats i conversions', desc:'Longitud, massa, volum, superfície i temps.', gen: genUnits, category:'math' },
  { id:'eq',    name:'Equacions', desc:'1r grau, 2n grau, sistemes, fraccions i parèntesis.', gen: genEq, category:'math' },
  { id:'func',  name:'Estudi de funcions', desc:'Tipus, domini, punts de tall, simetria, límits, extrems i monotonia.', gen: genFunctions, category:'math' },
  { id:'focusday',  name:'FocusDay', desc:'Una pregunta de cada mòdul, diferent cada cop.', gen: genFocusDay, category:'rep' },

];
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
  stopTimer();
  const elapsed = Math.floor((Date.now() - session.startedAt)/1000);
  const score = Math.round((session.correct / session.count) * 100);
  const name = localStorage.getItem('lastStudent') || 'Anònim';
  const moduleObj = MODULES.find(m=>m.id===session.module);
  const moduleName = moduleObj?.name || session.module;
  const levelLabel = session.levelLabel || (session.level > 0 ? `Nivell ${session.level}` : 'Personalitzat');


  store.save({
    at: new Date().toISOString(),
    name,
    module: session.module,
    level: session.level,
    levelLabel,
    count: session.count,
    correct: session.correct,
    time_limit: session.time,
    time_spent: elapsed,
    score,
    wrongs: session.wrongs
  });

  if(session.printableId){
    printableStore.remove(session.printableId);
    renderPrintableSets();
  }

  renderResults();
  if (typeof showRecommendation === 'function') {
    showRecommendation('#recommendationText');
  }

  session.done = true;
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

/* ===== Sistema de nivells 1..4 ===== */

// Rang bàsic per aritmètica (i altres que el facin servir)
function levelRange(level){
  const L = clamp(level,1,4);
  // màxims aproximats de l’operand: 1→20, 2→50, 3→120, 4→200
  const maxes = [0, 20, 50, 120, 200];
  const max = maxes[L];
  return [-Math.floor(max/3), max]; // si allowNeg=false ja es talla a 0..max
}

/* ===== Aritmètica ===== */

function genArith(level, opts={}){
  const allowNeg = !!opts.allowNeg;
  const tri = !!opts.tri;
  const ops = (opts.ops && opts.ops.length)? opts.ops : ['+','-','×','÷'];
  const [mn, mx] = levelRange(level);
  const low = allowNeg ? mn : 0;

  function makeDivisible(xmin, xmax, lvl=1){
    const L = clamp(lvl,1,4);
    const maxDiv = [0,14,20,30,40][L]; // divisor més gran a nivells alts
    const y = rng(2, maxDiv);
    const mult = rng(2, 8 + 4*L);      // fa el dividend més gran
    const prod = y * mult;
    return [prod, y];
  }

  const a = rng(low, mx), b = rng(low, mx);
  const op = choice(ops);

  let text, ans;

  if(tri){
    let c = rng(low, mx);
    let expOp1 = op;
    let expOp2 = choice(ops);
    let x=a, y=b, z=c;
    if(expOp1==='÷'){ [x,y] = makeDivisible(low, mx, level); }
    if(expOp2==='÷'){ [y,z] = makeDivisible(low, mx, level); }
    text = `${x} ${expOp1} ${y} ${expOp2} ${z} = ?`;
    ans = evalArith(x, expOp1, y);
    ans = evalArith(ans, expOp2, z);
  } else {
    let x=a, y=b, expOp = op;
    if(expOp==='÷'){ [x,y] = makeDivisible(low, mx, level); }
    text = `${x} ${expOp} ${y} = ?`;
    ans = evalArith(x, expOp, y);
  }

  return { type:'arith', text, answer: ans };
}

function evalArith(x, op, y){
  switch(op){
    case '+': return x + y;
    case '-': return x - y;
    case '×': return x * y;
    case '÷': return x / y;
  }
  return NaN;
}

/* ===== FRACCIONS ===== */

function addFrac(a,b){ return normFrac(a[0]*b[1] + b[0]*a[1], a[1]*b[1]); }
function subFrac(a,b){ return normFrac(a[0]*b[1] - b[0]*a[1], a[1]*b[1]); }
function mulFrac(a,b){ return normFrac(a[0]*b[0], a[1]*b[1]); }
function divFrac(a,b){ return normFrac(a[0]*b[1], a[1]*b[0]); }

function svgGridFraction(cols, rows, filled){
  const w=300, h=160, pad=10;
  const pad2 = pad*2;
  const cellW = (w - pad2)/cols, cellH = (h - pad2)/rows;
  const total = cols*rows;
  filled = Math.max(0, Math.min(filled, total));
  let rects = '', k=0;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const x = pad + c*cellW;
      const y = pad + r*cellH;
      const isFilled = (k < filled);
      rects += `<rect x="${x}" y="${y}" width="${cellW-2}" height="${cellH-2}" rx="6" ry="6"
        fill="${isFilled? 'url(#fillGrad)':'#ffffff'}" stroke="#cbd5e1" stroke-width="1.2">
        <animate attributeName="opacity" values="0;1" dur=".35s" begin="${0.02*k}s" fill="freeze"/></rect>`;
      k++;
    }
  }
  return `
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Parts ombrejades d'una fracció"><defs>
    <linearGradient id="fillGrad" x1="0" x2="1">
      <stop offset="0" stop-color="#a7f3d0"/><stop offset="1" stop-color="#7dd3fc"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="#f9fafb" rx="14" ry="14" />
  ${rects}
  </svg>`;
}

function svgBarFraction(segments, filled){
  const w=300, h=80, pad=12, pad2=pad*2;
  const segW = (w - pad2)/segments, segH = h - pad2;
  let rects = '';
  for(let i=0;i<segments;i++){
    const x = pad + i*segW;
    const isFilled = i < filled;
    rects += `<rect x="${x}" y="${pad}" width="${segW-4}" height="${segH}" rx="10" ry="10"
      fill="${isFilled? 'url(#barGrad)':'#ffffff'}" stroke="#cbd5e1" stroke-width="1.2">
      <animate attributeName="height" from="0" to="${segH}" dur=".4s" begin="${0.02*i}s" fill="freeze"/>
    </rect>`;
  }
  return `
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Barra segmentada per fraccions"><defs>
    <linearGradient id="barGrad" x1="0" x2="1">
      <stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#a7f3d0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="#f9fafb" rx="14" ry="14" />
  ${rects}
  </svg>`;
}

function svgPieFraction(segments, filled){
  const size=170, pad=8;
  const cx=size/2, cy=size/2, R=size/2 - pad;
  const tau = Math.PI*2;
  function arcPath(cx,cy,r,startAngle,endAngle){
    const x1 = cx + r*Math.cos(startAngle), y1 = cy + r*Math.sin(startAngle);
    const x2 = cx + r*Math.cos(endAngle),   y2 = cy + r*Math.sin(endAngle);
    const large = (endAngle - startAngle) > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  }
  const step = tau/segments;
  let paths = '';
  for(let i=0;i<segments;i++){
    const a0 = -Math.PI/2 + i*step;
    const a1 = a0 + step;
    const isFilled = i < filled;
    paths += `<path d="${arcPath(cx,cy,R,a0,a1)}" fill="${isFilled? 'url(#pieGrad)':'#ffffff'}" stroke="#cbd5e1" stroke-width="1.2">
      <animate attributeName="opacity" from="0" to="1" dur=".35s" begin="${0.02*i}s" fill="freeze"/></path>`;
  }
  return `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Pastís segmentat per fraccions" style="display:block;margin:auto"><defs>
    <linearGradient id="pieGrad" x1="0" x2="1">
      <stop offset="0" stop-color="#93c5fd"/><stop offset="1" stop-color="#a7f3d0"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" fill="#f9fafc" rx="16" ry="16" />
  ${paths}
  </svg>`;
}

function genFracIdentify(level, opts={}){
  const shapes = ['grid','bar','pie'];
  const shape = choice(shapes);
  let total, k, html;
  if(shape==='grid'){
    const presets = (opts.mixedGrids!==false)
      ? [[2,3],[3,4],[2,5],[4,4],[3,5],[5,5],[4,5]]
      : [[3,4]];
    const [cols, rows] = choice(presets);
    total = cols*rows;
    k = rng(1, total-1);
    html = svgGridFraction(cols, rows, k);
  } else if(shape==='bar'){
    total = rng(4, 10);
    k = rng(1, total-1);
    html = svgBarFraction(total, k);
  } else {
    total = rng(5, 12);
    k = rng(1, total-1);
    html = svgPieFraction(total, k);
  }
  const [sn, sd] = normFrac(k, total);
  return { type:'frac-identify', text:`Identifica la fracció representada`, html, answer: `${sn}/${sd}` };
}

function genFracArithmetic(level, opts={}){
  const a = rng(1, 9), b = rng(2, 10);
  const c = rng(1, 9), d = rng(2, 10);
  const A = normFrac(a, b), B = normFrac(c, d);
  const op = choice(['+','−','×','÷']);
  let res;
  if(op==='+') res = addFrac(A,B);
  else if(op==='−') res = subFrac(A,B);
  else if(op==='×') res = mulFrac(A,B);
  else res = divFrac(A,B);
  return { type:'frac-arith', text:`Calcula: ${A[0]}/${A[1]} ${op} ${B[0]}/${B[1]} = ? (fracció)`, answer: `${res[0]}/${res[1]}` };
}

function genFracSimplify(level, opts={}){
  let n = rng(2, 30), d = rng(2, 30); if(n===d) d++;
  const [sn, sd] = normFrac(n, d);
  if(sn===n && sd===d){ // força a tenir simplificació
    const n2 = n+1, d2 = d+2;
    n = n2; d = d2;
  }
  const [fn, fd] = normFrac(n, d);
  return { type:'frac-simplify', text:`Simplifica: ${n}/${d}`, answer: `${fn}/${fd}` };
}

function genFractions(level, opts={}){
  const sub = opts.sub || 'identify';
  if(sub==='identify') return genFracIdentify(level, opts);
  if(sub==='arith')    return genFracArithmetic(level, opts);
  return genFracSimplify(level, opts);
}

/* ====== GEOMETRIA ====== */

const labelText = (x,y,text)=> `<text class="svg-label" x="${x}" y="${y}">${text}</text>`;

function dimLineOutside(x1,y1,x2,y2,text,offset=16, orient='h'){
  if(orient==='h'){
    const yy = Math.max(y1,y2)+offset;
    return `
      <line x1="${x1}" y1="${yy}" x2="${x2}" y2="${yy}" stroke="#64748b" stroke-dasharray="4 3"/>
      ${labelText((x1+x2)/2, yy-4, text)}
    `;
  } else {
    const xx = Math.min(x1,x2)-offset;
    return `
      <line x1="${xx}" y1="${y1}" x2="${xx}" y2="${y2}" stroke="#64748b" stroke-dasharray="4 3"/>
      ${labelText(xx+4, (y1+y2)/2, text)}
    `;
  }
}

function svgRectFig(b,h,units){
  const W=360,H=230,p=14, rx=16;
  const x=90, y=50, w=200, hh=110;
  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rectangle"><defs>
    <linearGradient id="rectGrad" x1="0" x2="1"><stop offset="0" stop-color="#a7f3d0"/><stop offset="1" stop-color="#93c5fd"/></linearGradient>
  </defs>
  <rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" rx="${rx}" ry="${rx}" fill="#f8fafc" />
  <rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="url(#rectGrad)" stroke="#64748b">
    <animate attributeName="opacity" from="0" to="1" dur=".3s" fill="freeze"/>
  </rect>
  ${dimLineOutside(x, y+hh, x+w, y+hh, `base = ${b} ${units}`, 20, 'h')}
  ${dimLineOutside(x, y, x, y+hh, `alçada = ${h} ${units}`, 24, 'v')}
  </svg>`;
}

function svgTriFig(b,h,units){
  const W=360,H=240,p=14, rx=16;
  const A=[80,180], B=[280,180], C=[180,70];
  const Hx=180, Hy=180;
  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Triangle"><defs>
    <linearGradient id="triGrad" x1="0" x2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#a7f3d0"/></linearGradient>
  </defs>
  <rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" rx="${rx}" ry="${rx}" fill="#f8fafc" />
  <polygon points="${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}" fill="url(#triGrad)" stroke="#64748b"/>
  <line x1="${C[0]}" y1="${C[1]}" x2="${Hx}" y2="${Hy}" stroke="#1f2937" stroke-dasharray="3 3"/>
  ${labelText(Hx+6, (C[1]+Hy)/2, `altura = ${h} ${units}`)}
  ${dimLineOutside(A[0], B[1], B[0], B[1], `base = ${b} ${units}`, 18, 'h')}
  </svg>`;
}

function svgCircleFig(labelTextStr){
  const size=220, pad=12, cx=size/2, cy=size/2, R=size/2 - pad - 8;
  return `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Cercle" style="display:block;margin:auto"><defs>
    <radialGradient id="circGrad"><stop offset="0" stop-color="#e9d5ff"/><stop offset="1" stop-color="#93c5fd"/></radialGradient>
  </defs>
  <rect x="0" y="0" width="${size}" height="${size}" fill="#f8fafc" rx="18" ry="18" />
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#circGrad)" stroke="#64748b">
    <animate attributeName="r" from="${R*0.6}" to="${R}" dur=".35s" fill="freeze"/>
  </circle>
  ${labelText(cx, size-10, labelTextStr)}
  </svg>`;
}

function svgPolyFig(n, c, units){
  return `
  <div style="text-align:center"><div class="chip">Polígon regular de ${n} costats</div>
  <div class="subtitle" style="margin-top:6px">costat = ${c} ${units}</div>
  </div>`;
}

function svgGridMask(cols, rows, maskSet){
  const w=340, h=190, pad=12, pad2=pad*2;
  const cellW = (w - pad2)/cols, cellH = (h - pad2)/rows;
  let rects = '';
  let k=0;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const x = pad + c*cellW;
      const y = pad + r*cellH;
      const isFilled = maskSet.has(k);
      rects += `<rect x="${x}" y="${y}" width="${cellW-2}" height="${cellH-2}" rx="6" ry="6"
        fill="${isFilled? 'url(#gmGrad)':'#ffffff'}" stroke="#cbd5e1" stroke-width="1.2"/>`;
      k++;
    }
  }
  return `
    <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Graella per àrea"><defs>
    <linearGradient id="gmGrad" x1="0" x2="1"><stop offset="0" stop-color="#a7f3d0"/><stop offset="1" stop-color="#93c5fd"/></linearGradient>
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="#f8fafc" rx="14" ry="14" />
  ${rects}
  </svg>`;
}

function svgCuboidFig(w,h,l,units){
  const W=380,H=240,p=14;
  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Prisma rectangular"><defs>
    <linearGradient id="cubeA" x1="0" x2="1"><stop offset="0" stop-color="#a7f3d0"/><stop offset="1" stop-color="#93c5fd"/></linearGradient>
    <linearGradient id="cubeB" x1="0" x2="1"><stop offset="0" stop-color="#93c5fd"/><stop offset="1" stop-color="#60a5fa"/></linearGradient>
    <linearGradient id="cubeC" x1="0" x2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#a7f3d0"/></linearGradient>
  </defs>
  <rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" rx="16" ry="16" fill="#f8fafc" />
  <polygon points="90,70 230,70 300,110 160,110" fill="url(#cubeA)" stroke="#64748b"/>
  <polygon points="160,110 300,110 300,190 160,190" fill="url(#cubeB)" stroke="#64748b"/>
  <polygon points="90,70 160,110 160,190 90,150" fill="url(#cubeC)" stroke="#64748b"/>
  ${labelText(185, 58, `amplada = ${w} ${units}`)}
  ${labelText(305, 155, `alçada = ${h} ${units}`)}
  ${labelText(95, 162, `llargada = ${l} ${units}`)}
  </svg>`;
}

function svgCylinderFig(r,h,units){
  const W=380,H=240,p=14;
  return `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cilindre"><defs>
    <linearGradient id="cyl" x1="0" x2="1"><stop offset="0" stop-color="#93c5fd"/><stop offset="1" stop-color="#a7f3d0"/></linearGradient>
  </defs>
  <rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" rx="16" ry="16" fill="#f8fafc" />
  <ellipse cx="190" cy="80" rx="80" ry="20" fill="url(#cyl)" stroke="#64748b"/>
  <rect x="110" y="80" width="160" height="90" fill="url(#cyl)" stroke="#64748b"/>
  <ellipse cx="190" cy="170" rx="80" ry="20" fill="url(#cyl)" stroke="#64748b"/>
  ${labelText(190, 200, `radi = ${r} ${units}, alçada = ${h} ${units}`)}
  </svg>`;
}

function withUnits(val, units, pow, requireUnits){
  const s = String(val);
  if(!requireUnits) return s;
  const su = pow===2 ? `${units}²` : (pow===3 ? `${units}³` : units);
  return `${s} ${su}`;
}
function withUnitsAnswer(val, U, pow, req){ return withUnits(val, U, pow, req); }

function genGeometry(level, opts={}){
  const scope = opts.scope || 'area';
  const U = opts.units || 'cm';
  const wantUnits = !!opts.requireUnits;
  const roundDigits = Number.isInteger(opts.round)? opts.round : 2;
  const circleMode = opts.circleMode || 'numeric';

  // sideMax per nivell 1..4
  const sideMax = [0, 20, 50, 120, 200][clamp(level,1,4)];

  function packNum({text, html, value, pow}){
    const v = roundTo(value, roundDigits);
    return {
      type:'geom-num',
      text, html,
      numeric: v,
      meta:{ requireUnits: wantUnits, units: U, pow, round: roundDigits },
      answer: withUnitsAnswer(v, U, pow, wantUnits)
    };
  }

  function packPi({text, html, coef}){
    return { type:'geom-pi', text, html, piCoef: coef, answer: `${coef}π` };
  }

  const figs2D = [];
  if(!opts.fig || opts.fig.rect) figs2D.push('rect');
  if(!opts.fig || opts.fig.tri) figs2D.push('tri');
  if(!opts.fig || opts.fig.circ) figs2D.push('circ');
  if(opts.fig?.poly) figs2D.push('poly');
  if(opts.fig?.grid) figs2D.push('grid');
  if(opts.fig?.comp) figs2D.push('comp');

  const figs3D = [];
  if(opts.fig?.cube) figs3D.push('cuboid');
  if(opts.fig?.cylinder) figs3D.push('cylinder');

  if(scope==='vol'){
    const f = figs3D.length? choice(figs3D) : choice(['cuboid','cylinder']);
    if(f==='cuboid'){
      const w=rng(2, Math.max(6, Math.floor(sideMax/10)));
      const h=rng(2, Math.max(6, Math.floor(sideMax/10)));
      const l=rng(2, Math.max(6, Math.floor(sideMax/10)));
      return packNum({ text:`Volum del prisma rectangular`, html: svgCuboidFig(w,h,l,U), value: w*h*l, pow: 3 });
    } else {
      const r=rng(2, Math.max(6, Math.floor(sideMax/10)));
      const h=rng(3, Math.max(8, Math.floor(sideMax/8)));
      if(circleMode==='pi-exacte'){
        return packPi({ text:`Volum del cilindre (exacte, en π)`, html: svgCylinderFig(r,h,U), coef: r*r*h });
      } else {
        return packNum({ text:`Volum del cilindre`, html: svgCylinderFig(r,h,U), value: Math.PI*r*r*h, pow: 3 });
      }
    }
  }

  const pick = figs2D.length? choice(figs2D) : choice(['rect','tri','circ']);
  const wantA = (scope==='area' || scope==='both');
  const wantP = (scope==='perim' || scope==='both');

  if(pick==='rect'){
    const b=rng(3, Math.max(4, Math.floor(sideMax/2)));
    const h=rng(3, Math.max(4, Math.floor(sideMax/2)));
    const html = svgRectFig(b,h,U);
    const mode = scope==='both'? choice(['A','P']) : (wantA? 'A':'P');
    if(mode==='A') return packNum({ text:`Àrea del rectangle`, html, value: b*h, pow: 2 });
    return packNum({ text:`Perímetre del rectangle`, html, value: 2*(b+h), pow: 0 });
  }

  if(pick==='tri'){
    const mode = scope==='both'? choice(['A','P']) : (wantA? 'A':'P');
    if(mode==='A'){
      const b=rng(4, Math.max(6, Math.floor(sideMax/2)));
      const h=rng(3, Math.max(5, Math.floor(sideMax/2)));
      const html = svgTriFig(b,h,U);
      return packNum({ text:`Àrea del triangle`, html, value: 0.5*b*h, pow: 2 });
    } else {
      const a=rng(4, Math.max(6, Math.floor(sideMax/2)));
      const b=rng(4, Math.max(6, Math.floor(sideMax/2)));
      const c=rng(Math.abs(a-b)+1, a+b-1);
      const W=360,H=230,p=14;
      const html = `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Triangle (costats)">
        <rect x="${p}" y="${p}" width="${W-2*p}" height="${H-2*p}" rx="16" ry="16" fill="#f8fafc" />
        <polygon points="80,170 280,170 180,70" fill="#a7f3d0" stroke="#64748b"/>
        ${labelText(180, 200, `costats: ${a}, ${b}, ${c} ${U}`)}
      </svg>`;
      return packNum({ text:`Perímetre del triangle`, html, value: a+b+c, pow: 0 });
    }
  }

  if(pick==='circ'){
    const mode = scope==='both'? choice(['A','P']) : (wantA? 'A':'P');
    if(mode==='A'){
      const r=rng(2, Math.max(6, Math.floor(sideMax/10)));
      const html = svgCircleFig(`radi = ${r} ${U}`);
      if(circleMode==='pi-exacte') return { type:'geom-pi', text:`Àrea del cercle (exacta)`, html, piCoef:r*r, answer:`${r*r}π` };
      return packNum({ text:`Àrea del cercle`, html, value: Math.PI*r*r, pow: 2 });
    } else {
      const d=rng(6, Math.max(12, Math.floor(sideMax/6)));
      const html = svgCircleFig(`diàmetre = ${d} ${U}`);
      if(circleMode==='pi-exacte') return { type:'geom-pi', text:`Perímetre del cercle (exacte)`, html, piCoef:d, answer:`${d}π` };
      return packNum({ text:`Perímetre del cercle`, html, value: Math.PI*d, pow: 0 });
    }
  }

  if(pick==='poly'){
    const n = rng(5,8);
    const c = rng(2, Math.max(6, Math.floor(sideMax/10)));
    const P = n*c;
    const a = c/(2*Math.tan(Math.PI/n));
    const html = svgPolyFig(n,c,U);
    const mode = scope==='both'? choice(['A','P']) : (wantA? 'A':'P');
    if(mode==='A') return packNum({ text:`Àrea del polígon regular`, html, value: (P*a/2), pow: 2 });
    return packNum({ text:`Perímetre del polígon regular`, html, value: P, pow: 0 });
  }

  if(pick==='grid'){
    const cols = rng(4, 10), rows = rng(4, 10);
    const total = cols*rows;
    const k = rng(Math.floor(total*0.25), Math.floor(total*0.75));
    const set = new Set(); let i=0; while(set.size<k && i<800){ set.add(rng(0,total-1)); i++; }
    const html = svgGridMask(cols, rows, set);
    return packNum({ text:`Àrea de la figura ombrejada (unitats²)`, html, value: k, pow: 2 });
  }

  // comp – figura composta a graella
  const cols = rng(6, 10), rows = rng(6, 10);
  const mask = new Set();
  function fillRect(x,y,w,h){ for(let r=y;r<y+h;r++){ for(let c=x;c<x+w;c++){ mask.add(r*cols + c); } } }
  const ax = rng(0, Math.floor(cols/2)-1), ay = rng(0, Math.floor(rows/2)-1);
  const aw = rng(2, Math.floor(cols/2)), ah = rng(2, Math.floor(rows/2));
  const bx = rng(Math.floor(cols/2), cols-2), by = rng(Math.floor(rows/2), rows-2);
  const bw = rng(2, Math.min(aw, cols-bx)), bh = rng(2, Math.min(ah, rows-by));
  fillRect(ax, ay, aw, ah); fillRect(bx, by, bw, bh);
  const html = svgGridMask(cols, rows, mask);
  return { type:'geom-num', text:`Àrea de la figura composta (unitats²)`, html, numeric: mask.size, meta:{requireUnits:false, units:'u', pow:2, round:0}, answer: String(mask.size) };
}

/* ===== Percentatges ===== */

function genPercent(level){
  const L = clamp(level,1,4);
  const easy = [5,10,15,20,25,50];
  const mid  = easy.concat([30,40]);
  const hard = mid.concat([12.5,33.33,66.67,75]);
  const xhard= hard.concat([17.5,22.5,80]);

  const poolP = [null, easy, mid, hard, xhard][L];
  const baseMax = [0, 200, 600, 1000, 1500][L];

  const mode = Math.random()<.33? 'of' : (Math.random()<.5? 'is-of' : 'discount');

  if(mode==='of'){
    const p = choice(poolP);
    const n = rng(20, baseMax);
    const ans = +(n * p / 100).toFixed(L>=3? 2 : 0);
    return { type:'percent-of', text:`${p}% de ${n} = ?`, answer: ans };
  } else if(mode==='is-of'){
    const p = choice(poolP);
    const part = rng(10, Math.max(60, Math.floor(baseMax/2)));
    const whole = +(part * 100 / p).toFixed(L>=3? 2 : 0);
    return { type:'percent-is-of', text:`${part} és el ${p}% de ?`, answer: whole };
  } else {
    const n = rng(20, baseMax);
    const off = choice([5,10,12,15,20,25,30,40]);
    const ans = +(n * (1 - off/100)).toFixed(L>=3? 2 : 0);
    return { type:'percent-discount', text:`Descompte del ${off}% sobre ${n} → preu final = ?`, answer: ans };
  }
}

/* ===== Equacions ===== */

function randCoef(rangeKey){
  const [mn, mx] = rngRangeKey(rangeKey);
  let a = rng(mn, mx);
  if(a===0) a = (Math.random()<.5? -1: 1);
  return a;
}

function niceIntIf(v, forceInt){
  if(forceInt) return Math.round(v);
  return v;
}

// 1) Equacions de primer grau
function genEqLinear(level, opts){
  const a = randCoef(opts.range || 'small');
  const sol = niceIntIf(rng(-9,9), !!opts.forceInt);
  const b = -a * sol;
  const text = `${a}·x ${b>=0?'+':'−'} ${Math.abs(b)} = 0`;
  const hint = opts.hints ? `<div class="chip">Pista: mou el terme independent i divideix per a</div>` : '';
  return { type:'eq-lin', text:`Resol: ${text}`, html: opts.hints? `<div class="chip">Pista: mou el terme independent i divideix per a</div>`:'', sol: sol, answer: sol };
}

// 2) Equacions de segon grau
function genEqQuadratic(level, opts){
  const allowIncomplete = !!opts.allowIncomplete;
  const forceInt = !!opts.forceInt;
  const R = opts.range || 'small';

  if(allowIncomplete && Math.random()<0.4){
    if(Math.random()<0.5){
      // ax^2 + c = 0
      const a = randCoef(R), k = rng(1, 9);
      const c = -a * k * k;
      const text = `${a}·x² ${c>=0?'+':'−'} ${Math.abs(c)} = 0`;
      const sols = [ -k, k ].map(v => niceIntIf(v, forceInt));
      const hint = opts.hints ? `<div class="chip">Pista: x² = −c/a</div>` : '';
      return { type:'eq-quad', text:`Resol: ${text}`, html: hint, sols, answer: `${sols[0]}, ${sols[1]}` };
    } else {
      // ax² + bx = 0
      const a = randCoef(R), b = randCoef(R);
      const x2 = -b / a;
      const sols = [ 0, niceIntIf(x2, forceInt) ];
      const text = `${a}·x² ${b>=0?'+':'−'} ${Math.abs(b)}·x = 0`;
      const hint = opts.hints ? `<div class="chip">Pista: factoritza x(ax + b)=0</div>` : '';
      return { type:'eq-quad', text:`Resol: ${text}`, html: hint, sols, answer: `${sols[0]}, ${sols[1]}` };
    }
  } else {
    // Equacions completes
    const r1 = rng(-9,9), r2 = rng(-9,9);
    const sols = [r1, r2].map(v => niceIntIf(v, forceInt));
    const b = -(sols[0] + sols[1]);
    const c = sols[0]*sols[1];
    const text = `x² ${b>=0?'+':'−'} ${Math.abs(b)}·x ${c>=0?'+':'−'} ${Math.abs(c)} = 0`;
    const hint = opts.hints ? `<div class="chip">Pista: fórmula general o factorització</div>` : '';
    return { type:'eq-quad', text:`Resol: ${text}`, html: hint, sols, answer: `${sols[0]}, ${sols[1]}` };
  }
}

// 3) Sistemes d'equacions
function genEqSystem2x2(level, opts){
  const R = opts.range || 'small';
  let x = rng(-6,6), y = rng(-6,6);
  if(opts.forceInt){ x = Math.round(x); y = Math.round(y); }
  const a1 = randCoef(R), b1 = randCoef(R);
  const a2 = randCoef(R), b2 = randCoef(R);
  const c1 = a1*x + b1*y;
  const c2 = a2*x + b2*y;
  const text = `{ ${a1}x ${b1>=0?'+':'−'} ${Math.abs(b1)}y = ${c1} ; ${a2}x ${b2>=0?'+':'−'} ${Math.abs(b2)}y = ${c2} }`;
  const hint = opts.hints ? `<div class="chip">Pista: substitució o reducció</div>` : '';
  return { type:'eq-sys', text:`Resol el sistema: ${text}`, html: hint, sol:{x,y}, answer:`(${x}, ${y})` };
}

// 4) Equacions amb fraccions
function genEqFractions(level, opts){
  const denX = rng(2,9);
  const A = rng(1,8), B = rng(2,9);
  const rhs = rng(1,12);
  const x = (rhs - A/B) * denX;
  const sol = opts.forceInt ? Math.round(x) : x;
  const html = opts.hints? `<div class="chip">Pista: passa termes i redueix a comú denominador</div>` : '';
  return { type:'eq-frac', text:`Resol: ${A}/${B} + x/${denX} = ${rhs}`, html, sol, answer: sol };
}

// 5) Equacions amb parèntesis
function genEqParentheses(level, opts){
  const R = opts.range || 'small';
  const sol = opts.forceInt ? rng(-9,9) : rng(-9,9);
  const a = randCoef(R), b = randCoef(R);
  const c = randCoef(R), d = randCoef(R);
  const rhs = (a - c)*sol + (a*b - c*d);
  const text = `${a}(x ${b>=0?'+':'−'} ${Math.abs(b)}) ${c>=0?'−':'+'} ${Math.abs(c)}(x ${d>=0?'+':'−'} ${Math.abs(d)}) = ${rhs}`;
  const hint = opts.hints? `<div class="chip">Pista: desenvolupa, agrupa termes i resol</div>` : '';
  return { type:'eq-par', text:`Resol: ${text}`, html: hint, sol, answer: sol };
}

// Map defaults segons nivell (1..4)
function genEq(level, opts={}){
  function rangeFromLevel(L){
    return [null,'small','med','med','big'][L];
  }
  const L = clamp(level,1,4);

  if(!opts.range)  opts.range  = rangeFromLevel(L);
  if(opts.forceInt === undefined) opts.forceInt = (L<=3);
  if(opts.hints === undefined)    opts.hints    = (L===1);

  if(!opts.format && !opts.degree){
    if(L===1){ opts.format='normal'; opts.degree='1'; }
    else if(L===2){ opts.format = Math.random()<0.5? 'frac':'par'; opts.degree='1'; }
    else if(L===3){ opts.format='normal'; opts.degree='2'; opts.allowIncomplete = true; }
    else { // L4
      opts.format = Math.random()<0.4? 'sys':'normal';
      opts.degree = (opts.format==='sys')? '1' : '2';
      opts.allowIncomplete = true;
    }
  }

  const format = opts.format || 'normal'; // normal, frac, par, sys
  const degree = opts.degree || '1';      // 1, 2, mixed

  if (format === 'sys') return genEqSystem2x2(level, opts);
  if (format === 'frac') return genEqFractions(level, opts);
  if (format === 'par')  return genEqParentheses(level, opts);

  if (degree === '1') return genEqLinear(level, opts);
  if (degree === '2') return genEqQuadratic(level, opts);
  return Math.random() < 0.7 ? genEqLinear(level, opts) : genEqQuadratic(level, opts);
}

/* ===== Estadística bàsica ===== */

function statsList(level){
  const L = clamp(level,1,4);
  const len = rng(5, 9);
  const maxByL = [0, 20, 50, 100, 150];
  const max = maxByL[L];
  const allowZero = false;
  return Array.from({length:len}, ()=> rng(allowZero?0:1, max));
}

const arrMean = a => a.reduce((s,x)=>s+x,0)/a.length;
function arrMedian(a){
  const b=[...a].sort((x,y)=>x-y);
  const n=b.length;
  return n%2? b[(n-1)/2] : (b[n/2-1]+b[n/2])/2;
}
function arrMode(a){
  const m = new Map(); a.forEach(x=>m.set(x,(m.get(x)||0)+1));
  let best=a[0], cnt=0;
  m.forEach((v,k)=>{ if(v>cnt){cnt=v; best=k;} });
  return best;
}

function barChartSVG(data, labels){
  const w=360,h=200,p=28;
  const max = Math.max(...data);
  const bw = (w - p*2)/data.length;
  const bars = data.map((v,i)=>{
    const barH = max? (v/max)*(h-p*2) : 0;
    const x = p + i*bw, y = h-p - barH;
    return `<g>
      <rect x="${x+6}" y="${y}" width="${bw-12}" height="${barH}" fill="#93c5fd" stroke="#64748b">
        <animate attributeName="height" from="0" to="${barH}" dur=".4s" fill="freeze"/>
        <animate attributeName="y" from="${h-p}" to="${y}" dur=".4s" fill="freeze"/>
      </rect>
      <text x="${x+bw/2}" y="${h-6}" text-anchor="middle" class="svg-label">${labels[i]}</text>
    </g>`;
  }).join('');
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Gràfic de barres">
  <rect x="0" y="0" width="${w}" height="${h}" rx="16" ry="16" fill="#f8fafc"/>
  ${bars}
  </svg>`;
}

function pieChartSVG(values, labels){
  const size=220, pad=8, cx=size/2, cy=size/2, R=size/2-pad;
  const total = values.reduce((s,x)=>s+x,0);
  let ang= -Math.PI/2;
  const segs = values.map((v,i)=>{
    const frac = total? v/total : 0;
    const a0 = ang, a1 = ang + frac*2*Math.PI; ang = a1;
    const large = (a1-a0)>Math.PI?1:0;
    const x1 = cx + R*Math.cos(a0), y1 = cy + R*Math.sin(a0);
    const x2 = cx + R*Math.cos(a1), y2 = cy + R*Math.sin(a1);
    const color = ['#93c5fd','#a7f3d0','#fde68a','#fca5a5','#c4b5fd'][i%5];
    return `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z"
             fill="${color}" stroke="#64748b"><animate attributeName="opacity" from="0" to="1" dur=".35s" fill="freeze"/></path>`;
  }).join('');
  const legend = labels.map((l,i)=>`<tspan x="${size/2}" dy="16">${l}</tspan>`).join('');
  return `<svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Gràfic de sectors" style="display:block;margin:auto">
  <rect x="0" y="0" width="${size}" height="${size}" rx="16" ry="16" fill="#f8fafc"/>
  ${segs}
  <text x="${size/2}" y="${size-8}" text-anchor="middle" class="svg-label">${legend}</text>
  </svg>`;
}

function genStatsMMM(level, opts){
  const arr = statsList(level);
  const round = opts.round ?? 2;
  const mean = roundTo(arrMean(arr), round);
  const med = roundTo(arrMedian(arr), round);
  const mode = arrMode(arr);
  const kind = choice(['mitjana','mediana','moda']);
  const html = barChartSVG(arr, arr.map((_,i)=>String(i+1)));
  let answer, title;
  if(kind==='mitjana'){ answer = mean; title = `Calcula la <b>mitjana</b> de: ${arr.join(', ')}`; }
  else if(kind==='mediana'){ answer = med; title = `Calcula la <b>mediana</b> de: ${arr.join(', ')}`; }
  else { answer = mode; title = `Calcula la <b>moda</b> de: ${arr.join(', ')}`; }
  return { type:'stats-num', text:title, html, numeric: answer, meta:{round}, answer: answer };
}

function genStatsRangeDev(level, opts){
  const arr = statsList(level);
  const round = opts.round ?? 2;
  const min = Math.min(...arr), max = Math.max(...arr);
  const range = max - min;
  const mean = arrMean(arr);
  const mad = roundTo(arr.reduce((s,x)=>s+Math.abs(x-mean),0)/arr.length, round);
  const kind = choice(['rang','desviacio']);
  const html = barChartSVG(arr, arr.map((_,i)=>String(i+1)));
  if(kind==='rang'){
    return { type:'stats-num', text:`Calcula el <b>rang</b> del conjunt: ${arr.join(', ')}`, html, numeric: range, meta:{round:0}, answer: range };
  } else {
    return { type:'stats-num', text:`Calcula la <b>desviació mitjana</b> del conjunt: ${arr.join(', ')}`, html, numeric: mad, meta:{round}, answer: mad };
  }
}

function genStatsGraphs(level, opts){
  const kind = choice(['bar','pie']);
  if(kind==='bar'){
    const cats = ['A','B','C','D'];
    const vals = cats.map(()=> rng(2, 12));
    const idxMax = vals.indexOf(Math.max(...vals));
    const html = barChartSVG(vals, cats);
    return { type:'stats-cat', text:`Al gràfic de barres, <b>quina categoria</b> té el valor més alt? (A/B/C/D)`, html, answer: cats[idxMax] };
  } else {
    const cats = ['X','Y','Z','W'];
    const vals = cats.map(()=> rng(1, 8));
    const idxMax = vals.indexOf(Math.max(...vals));
    const html = pieChartSVG(vals, cats);
    return { type:'stats-cat', text:`Al gràfic de sectors, <b>quina categoria</b> és la més gran? (X/Y/Z/W)`, html, answer: cats[idxMax] };
  }
}

function genStats(level, opts={}){
  const sub = opts.sub || 'mmm';
  if(sub==='mmm') return genStatsMMM(level, opts);
  if(sub==='range-dev') return genStatsRangeDev(level, opts);
  return genStatsGraphs(level, opts);
}

/* ===== Unitats i conversions ===== */

function convQuestion(set, round){
  // set: { from:'km', to:'m', factor:1000 }
  const val = +((Math.random()<.5? rng(1, 50) : (rng(10,500)/10))).toFixed(2);
  const exact = val * set.factor;
  const numeric = roundTo(exact, round);
  const title = `Converteix <b>${val} ${set.from}</b> a <b>${set.to}</b>. Escriu només el número`;
  return { type:`units-${set.group}`, text:title, html: set.icon, numeric, meta:{round}, answer: numeric };
}

const ICON = {
  ruler:`<svg viewBox="0 0 220 80" role="img" aria-label="Regla">
  <rect x="10" y="20" width="200" height="40" rx="8" fill="#a7f3d0" stroke="#64748b"/>
  ${Array.from({length:10},(_,i)=>`<rect x="${28+i*18}" y="20" width="2" height="${i%2?12:18}" fill="#334155"><animate attributeName="height" from="0" to="${i%2?12:18}" dur=".4s" fill="freeze"/></rect>`).join('')}
  </svg>`,
  scale:`<svg viewBox="0 0 220 80" role="img" aria-label="Bàscula">
  <rect x="40" y="15" width="140" height="50" rx="12" fill="#93c5fd" stroke="#64748b"/>
  <circle cx="110" cy="40" r="16" fill="#fff" stroke="#64748b"/>
  <line x1="110" y1="40" x2="125" y2="32" stroke="#ef4444" stroke-width="2">
    <animate attributeName="x2" from="110" to="125" dur=".45s" fill="freeze"/>
    <animate attributeName="y2" from="40" to="32" dur=".45s" fill="freeze"/>
  </line>
  </svg>`,
  clock:`<svg viewBox="0 0 90 90" role="img" aria-label="Rellotge" style="display:block;margin:auto">
  <circle cx="45" cy="45" r="38" fill="#fde68a" stroke="#64748b"/>
  <line x1="45" y1="45" x2="45" y2="20" stroke="#334155" stroke-width="3">
    <animate attributeName="y2" from="45" to="20" dur=".4s" fill="freeze"/>
  </line>
  <line x1="45" y1="45" x2="70" y2="45" stroke="#334155" stroke-width="3">
    <animate attributeName="x2" from="45" to="70" dur=".4s" fill="freeze"/>
  </line>
  </svg>`,
  cube:`<svg viewBox="0 0 110 80" role="img" aria-label="Cub d'aigua" style="display:block;margin:auto">
  <polygon points="20,25 65,15 90,30 45,40" fill="#a7f3d0" stroke="#64748b"/>
  <polygon points="45,40 90,30 90,60 45,70" fill="#93c5fd" stroke="#64748b"/>
  <polygon points="20,25 45,40 45,70 20,55" fill="#7dd3fc" stroke="#64748b"/>
  </svg>`,
  grid:`<svg viewBox="0 0 140 80" role="img" aria-label="Quadrícula" style="display:block;margin:auto">
  <rect x="15" y="10" width="110" height="60" fill="#f8fafc" stroke="#64748b"/>
  ${Array.from({length:3},(_,i)=>`<line x1="${15}" y1="${30+i*20}" x2="${125}" y2="${30+i*20}" stroke="#cbd5e1"/>`).join('')}
  ${Array.from({length:4},(_,i)=>`<line x1="${35+i*22.5}" y1="10" x2="${35+i*22.5}" y2="70" stroke="#cbd5e1"/>`).join('')}
  </svg>`
};

function genUnits(level, opts={}){
  const round = opts.round ?? 2;
  const group = opts.sub || 'length';

  const sets = {
    length: [
      {group:'length', from:'km', to:'m',  factor:1000,  icon:ICON.ruler},
      {group:'length', from:'m',  to:'cm', factor:100,   icon:ICON.ruler},
      {group:'length', from:'cm', to:'mm', factor:10,    icon:ICON.ruler},
      {group:'length', from:'mm', to:'cm', factor:0.1,   icon:ICON.ruler},
      {group:'length', from:'m',  to:'km', factor:0.001, icon:ICON.ruler},
    ],
    mass: [
      {group:'mass', from:'kg', to:'g',  factor:1000,  icon:ICON.scale},
      {group:'mass', from:'g',  to:'kg', factor:0.001, icon:ICON.scale},
      {group:'mass', from:'g',  to:'mg', factor:1000,  icon:ICON.scale},
      {group:'mass', from:'mg', to:'g',  factor:0.001, icon:ICON.scale},
    ],
    volume: [
      {group:'volume', from:'L',  to:'mL', factor:1000,  icon:ICON.cube},
      {group:'volume', from:'mL', to:'L',  factor:0.001, icon:ICON.cube},
    ],
    area: [
      {group:'area', from:'m²',  to:'cm²', factor:10000,  icon:ICON.grid},
      {group:'area', from:'cm²', to:'m²',  factor:0.0001, icon:ICON.grid},
    ],
    time: [
      {group:'time', from:'h',   to:'min', factor:60,   icon:ICON.clock},
      {group:'time', from:'min', to:'s',   factor:60,   icon:ICON.clock},
      {group:'time', from:'h',   to:'s',   factor:3600, icon:ICON.clock},
      {group:'time', from:'min', to:'h',   factor:1/60, icon:ICON.clock},
    ]
  };

  function filterSetsByLevel(sets, group, level){
    const L = clamp(level,1,4);
    const base = sets[group];
    const isAdj = (from,to) => (
      (from==='km' && to==='m') || (from==='m' && to==='cm') || (from==='cm' && to==='mm') ||
      (from==='kg' && to==='g') || (from==='g' && to==='mg') ||
      (from==='L'  && to==='mL') || (from==='mL' && to==='L') ||
      (from==='min'&& to==='s') || (from==='h'  && to==='min')
    );
    return base.filter(s=>{
      if(L===1){
        if(group==='area' || group==='time') return false;
        return isAdj(s.from, s.to);
      }
      if(L===2){
        if(group==='area') return false;
        if(s.from==='h' && s.to==='s') return false;
        if(s.from==='s' && s.to==='h') return false;
        return true;
      }
      if(L===3){
        if(s.from==='h' && s.to==='s') return false;
        if(s.from==='s' && s.to==='h') return false;
        return true;
      }
      return true;
    });
  }

  const pool = filterSetsByLevel(sets, group, level);
  const set = choice(pool.length ? pool : sets[group]);
  return convQuestion(set, round);
}

/* ===== Estudi de Funcions ===== */

function genFunctions(level, opts={}) {
  if(!('difficulty' in opts)) opts.difficulty = clamp(level,1,4);

  const types = opts.types || {
    lin: true, quad: true, poly: true, rac: true, rad: true, exp: true, log: true
  };
  const aspects = opts.aspects || { type: true };
  const difficulty = opts.difficulty || 1;

  const availableTypes = [];
  if (types.lin) availableTypes.push('lin');
  if (types.quad) availableTypes.push('quad');
  if (types.poly) availableTypes.push('poly');
  if (types.rac) availableTypes.push('rac');
  if (types.rad) availableTypes.push('rad');
  if (types.exp) availableTypes.push('exp');
  if (types.log) availableTypes.push('log');
  if (availableTypes.length === 0) availableTypes.push('lin');

  const selectedType = choice(availableTypes);
  const selectedAspect = getRandomAspect(aspects);

  return generateFunctionQuestion(selectedType, selectedAspect, difficulty, level);
}

function getRandomAspect(aspects) {
  const availableAspects = [];
  for (const aspect in aspects) {
    if (aspects[aspect]) availableAspects.push(aspect);
  }
  return availableAspects.length > 0 ? choice(availableAspects) : 'type';
}

function generateFunctionQuestion(type, aspect, difficulty, level) {
  let question = {};
  switch (type) {
    case 'lin':
      question = generateLinearFunction(aspect, difficulty, level);
      break;
    case 'quad':
      question = generateQuadraticFunction(aspect, difficulty, level);
      break;
    case 'poly':
      question = generatePolynomialFunction(aspect, difficulty, level);
      break;
    case 'rac':
      question = generateRationalFunction(aspect, difficulty, level);
      break;
    case 'rad':
      question = generateRadicalFunction(aspect, difficulty, level);
      break;
    case 'exp':
      question = generateExponentialFunction(aspect, difficulty, level);
      break;
    case 'log':
      question = generateLogarithmicFunction(aspect, difficulty, level);
      break;
  }
  return {
    type: `func-${type}-${aspect}`,
    text: question.text,
    html: question.html || '',
    answer: question.answer,
    meta: question.meta || {}
  };
}

function generateLinearFunction(aspect, difficulty, level) {
  let m = rng(-5, 5); if (m === 0) m = 1;
  const n = rng(-10, 10);
  const f = `f(x) = ${m}x ${n >= 0 ? '+' : ''} ${n}`;

  switch (aspect) {
    case 'type':
      return { text: `Quin tipus de funció és ${f}?`, answer: 'lineal' };
    case 'domain':
      return { text: `Quin és el domini de ${f}?`, answer: 'tots els reals' };
    case 'intercepts': {
      const xIntercept = n !== 0 ? `(${-n/m}, 0)` : '(0, 0)';
      return { text: `Quins són els punts de tall amb els eixos de ${f}? (Format: (x,0), (0,y))`, answer: `${xIntercept}, (0, ${n})` };
    }
    case 'symmetry':
      return { text: `Quina simetria té ${f}?`, answer: 'cap simetria' };
    case 'limits': {
      const limitInf = m > 0 ? '-∞' : '∞';
      const limitSup = m > 0 ? '∞' : '-∞';
      return { text: `Calcula els límits de ${f} quan x tendeix a ±∞ (Format: -∞: valor, ∞: valor)`, answer: `-∞: ${limitInf}, ∞: ${limitSup}` };
    }
    case 'extrema':
      return { text: `La funció ${f} té extrems relatius?`, answer: 'no' };
    case 'monotony': {
      const monotony = m > 0 ? 'creixent' : 'decreixent';
      return { text: `Quina és la monotonia de ${f}?`, answer: monotony };
    }
  }
}

function generateQuadraticFunction(aspect, difficulty, level) {
  let a = rng(-3, 3); if (a === 0) a = 1;
  const b = rng(-5, 5);
  const c = rng(-10, 10);
  const f = `f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}`;
  const discriminant = b*b - 4*a*c;

  switch (aspect) {
    case 'type':
      return { text: `Quin tipus de funció és ${f}?`, answer: 'quadràtica' };
    case 'domain':
      return { text: `Quin és el domini de ${f}?`, answer: 'tots els reals' };
    case 'intercepts': {
      let xIntercepts = '';
      if (discriminant > 0) {
        const x1 = (-b + Math.sqrt(discriminant))/(2*a);
        const x2 = (-b - Math.sqrt(discriminant))/(2*a);
        xIntercepts = `(${roundTo(x1, 2)}, 0), (${roundTo(x2, 2)}, 0)`;
      } else if (discriminant === 0) {
        const x = -b/(2*a);
        xIntercepts = `(${roundTo(x, 2)}, 0)`;
      } else {
        xIntercepts = 'cap';
      }
      return { text: `Quins són els punts de tall amb els eixos de ${f}? (Format: (x,0), (0,y))`, answer: `${xIntercepts}, (0, ${c})` };
    }
    case 'symmetry': {
      const vertexX = -b/(2*a);
      return { text: `Quina simetria té ${f}?`, answer: `simètrica respecte x = ${roundTo(vertexX, 2)}` };
    }
    case 'limits': {
      const limitInf = a > 0 ? '∞' : '-∞';
      const limitSup = a > 0 ? '∞' : '-∞';
      return { text: `Calcula els límits de ${f} quan x tendeix a ±∞ (Format: -∞: valor, ∞: valor)`, answer: `-∞: ${limitInf}, ∞: ${limitSup}` };
    }
    case 'extrema': {
      const vertexY = c - b*b/(4*a);
      const extremumType = a > 0 ? 'mínim' : 'màxim';
      return { text: `Quins són els extrems relatius de ${f}? (Format: tipus (x,y))`, answer: `${extremumType} (${roundTo(-b/(2*a), 2)}, ${roundTo(vertexY, 2)})` };
    }
    case 'monotony': {
      const vx = roundTo(-b/(2*a), 2);
      const behavior1 = a > 0 ? 'decreixent' : 'creixent';
      const behavior2 = a > 0 ? 'creixent' : 'decreixent';
      return { text: `Descriu la monotonia de ${f} (Format: (-∞,a): comportament, (a,∞): comportament)`, answer: `(-∞,${vx}): ${behavior1}, (${vx},∞): ${behavior2}` };
    }
  }
}

// Polinòmiques
function generatePolynomialFunction(aspect, difficulty, level) {
  const degree = difficulty === 1 ? 3 : (difficulty === 2 ? 4 : (difficulty>=4?5:5));
  const coefficients = Array.from({length: degree+1}, () => rng(-5, 5));
  coefficients[coefficients.length-1] = coefficients[coefficients.length-1] || 1;
  let f = 'f(x) = ';
  for (let i = coefficients.length-1; i >= 0; i--) {
    if (coefficients[i] !== 0) {
      if (i < coefficients.length-1 && coefficients[i] > 0) f += '+';
      if (i === 0) f += coefficients[i];
      else if (i === 1) f += `${coefficients[i]}x`;
      else f += `${coefficients[i]}x^${i}`;
    }
  }
  return { text: `Identifica el tipus de funció: ${f}`, answer: 'polinòmica' };
}

// Racionals
function generateRationalFunction(aspect, difficulty, level) {
  const numerator = [rng(-5,5), rng(-5,5)];
  const denominator = [rng(-5,5), rng(-5,5)];
  if (denominator[1] === 0) denominator[1] = 1;
  const f = `f(x) = (${numerator[1]}x ${numerator[0] >= 0 ? '+' : ''} ${numerator[0]}) / (${denominator[1]}x ${denominator[0] >= 0 ? '+' : ''} ${denominator[0]})`;
  return { text: `Identifica el tipus de funció: ${f}`, answer: 'racional' };
}

// Radicals
function generateRadicalFunction(aspect, difficulty, level) {
  const a = rng(1, 5);
  const b = rng(-5, 5);
  const c = rng(-5, 5);
  const f = `f(x) = ${a}√(x ${b >= 0 ? '+' : ''} ${b}) ${c >= 0 ? '+' : ''} ${c}`;
  return { text: `Identifica el tipus de funció: ${f}`, answer: 'radical' };
}

// Exponencials
function generateExponentialFunction(aspect, difficulty, level) {
  const a = rng(1, 5);
  const b = rng(2, 5);
  const c = rng(-5, 5);
  const f = `f(x) = ${a}·${b}^x ${c >= 0 ? '+' : ''} ${c}`;
  return { text: `Identifica el tipus de funció: ${f}`, answer: 'exponencial' };
}

// Logarítmiques
function generateLogarithmicFunction(aspect, difficulty, level) {
  const a = rng(1, 5);
  const b = rng(2, 5);
  const c = rng(-5, 5);
  const f = `f(x) = ${a}·log${b}(x) ${c >= 0 ? '+' : ''} ${c}`;
  return { text: `Identifica el tipus de funció: ${f}`, answer: 'logarítmica' };
}

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


/* ===================== RESULTS ===================== */

// ==== HELPERS D'ANÀLISI I GRÀFICS ====
function avg(a){ return a.length ? a.reduce((s,x)=>s+x,0)/a.length : 0; }
function by(arr, key){
  return arr.reduce((m,x)=>{ const k = x[key]; (m[k]=m[k]||[]).push(x); return m; }, {});
}
function fmtPct(x){ return Math.round(x); }

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
    <rect x="0" y="0" width="${w} ${h}" rx="16" ry="16" fill="#f8fafc"/>
    ${dots}
    <text class="svg-label" x="${p}" y="${p+4}">Temps (min)</text>
    <text class="svg-label" x="${w-p-40}" y="${p+4}">Punts (%)</text>
  </svg>`;
}

// ==== RENDER PRINCIPAL DE RESULTATS + PERFIL ====
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
    if(overlay) overlay.style.display = 'flex';
    return false;
  }
  if(overlay) overlay.style.display = 'none';
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

