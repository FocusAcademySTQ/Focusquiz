/* ===================== UTILS ===================== */
function showModal(contentHTML){
  closeModal();
  const overlay = document.createElement('div');
  overlay.className = 'modal';
  overlay.innerHTML = `<div class="modal-inner panel card" role="dialog" aria-modal="true">${contentHTML}</div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) closeModal(); });
}
function closeModal(){ const m = document.querySelector('.modal'); if(m) m.remove(); }

const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));
const rng = (a,b)=> Math.floor(Math.random()*(b-a+1))+a;
const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];
const clamp = (x,a,b)=> Math.max(a, Math.min(b,x));

const gcd = (a,b)=>{ a=Math.abs(a); b=Math.abs(b); while(b){ [a,b]=[b,a%b] } return a||1 };
const simplifyFrac = (n,d)=>{ const g=gcd(n,d); return [n/g, d/g] };

const store = {
  get k(){ return 'focus-math-results-v1' },
  all(){ try{ return JSON.parse(localStorage.getItem(this.k)||'[]') }catch{ return [] } },
  save(entry){ const all=this.all(); all.push(entry); localStorage.setItem(this.k, JSON.stringify(all)) },
  clear(){ localStorage.removeItem(this.k) }
};

const fmtTime = (sec)=>{
  const m = Math.floor(sec/60), s = sec%60; return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
}

/* ===================== APP STATE ===================== */
const MODULES = [
  { id:'arith', name:'Aritmètica', desc:'Sumes, restes, multiplicacions i divisions.', badge:'Bàsic', gen: genArith },
  { id:'frac',  name:'Fraccions',  desc:'Identificar (imatge), aritmètica i simplificar.', badge:'Nou', gen: genFractions },
  { id:'perc',  name:'Percentatges', desc:'Calcula percentatges i descomptes.', badge:'Pràctic', gen: genPercent },
  { id:'geom',  name:'Àrees, perímetres i volums', desc:'Figures 2D i cossos 3D.', badge:'Geom', gen: genGeometry },
  { id:'stats', name:'Estadística bàsica', desc:'Mitjana/mediana/moda, rang/desviació i gràfics.', badge:'Dades', gen: genStats },
  { id:'units', name:'Unitats i conversions', desc:'Longitud, massa, volum, superfície i temps.', badge:'Mesures', gen: genUnits },
  { id:'eq',    name:'Equacions', desc:'1r grau, 2n grau, sistemes, fraccions i parèntesis.', badge:'Àlgebra', gen: genEq },
  { id:'func',  name:'Funcions', desc:'Representació, domini, derivades bàsiques i propietats.', badge:'Anàlisi', gen: genFunctions }
];

let pendingModule = null; // mòdul seleccionat per configurar
const DEFAULTS = { count: 10, time: 0, level: 1 };
let session = null;
let timerHandle = null;

/* ===================== VIEWS ===================== */
function showView(name){
  ['home','config','quiz','results','about'].forEach(v=> $('#view-'+v).classList.toggle('hidden', v!==name));
  if(name==='results') renderResults();
}

function buildHome(){
  const grid = $('#moduleGrid'); grid.innerHTML='';
  MODULES.forEach(m=>{
    const el = document.createElement('div');
    el.className='option';
    el.innerHTML = `
      <span class="badge">${m.badge}</span>
      <h3>${m.name}</h3>
      <p>${m.desc}</p>`;
    el.onclick = ()=> openConfig(m.id);
    grid.appendChild(el);
  });

  // filtre resultats
  const fm = $('#filter-module');
  fm.innerHTML = `<option value="">Tots</option>` + MODULES.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');

  // nivells 1..20
  const sl = $('#cfg-level');
  sl.innerHTML = Array.from({length:20},(_,i)=>`<option value="${i+1}">${i+1}</option>`).join('');
  sl.value = DEFAULTS.level;
}

function openConfig(moduleId){
  pendingModule = MODULES.find(m=>m.id===moduleId) || MODULES[0];
  $('#cfg-title').textContent = `Configura: ${pendingModule.name}`;
  $('#cfg-desc').textContent = pendingModule.desc;

  // valors per defecte
  $('#cfg-count').value = DEFAULTS.count;
  $('#cfg-time').value = DEFAULTS.time;
  $('#cfg-level').value = DEFAULTS.level;

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
      <div class="section-title">Equacions · Subtemes</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes d'equacions">
          <label class="toggle"><input class="check" type="radio" name="eq-sub" value="lin" checked> 1) Primer grau (ax + b = 0)</label>
          <label class="toggle"><input class="check" type="radio" name="eq-sub" value="quad"> 2) Segon grau (completes / incompletes)</label>
          <label class="toggle"><input class="check" type="radio" name="eq-sub" value="sys"> 3) Sistemes 2x2</label>
          <label class="toggle"><input class="check" type="radio" name="eq-sub" value="frac"> 4) Amb fraccions</label>
          <label class="toggle"><input class="check" type="radio" name="eq-sub" value="par"> 5) Amb parèntesis</label>
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
        <label class="toggle"><input class="check" type="checkbox" id="eq-incomplete" checked> Inclou incompletes (només 2n grau)</label>
        <label class="toggle"><input class="check" type="checkbox" id="eq-hints"> Mostrar pistes</label>
      </div>

      <div class="subtitle">Format de resposta: <b>x=3</b> o <b>3</b>; per sistemes <b>(2, -1)</b> o <b>2,-1</b>; fraccions <b>3/4</b> o decimals.</div>
    `;
  } else if(pendingModule.id === 'func'){
    wrap.innerHTML = `
      <div class="section-title">Funcions · Subtemes</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes de funcions">
          <label class="toggle"><input class="check" type="radio" name="func-sub" value="domain" checked> Domini i recorregut</label>
          <label class="toggle"><input class="check" type="radio" name="func-sub" value="monotony"> Monotonia i intervals</label>
          <label class="toggle"><input class="check" type="radio" name="func-sub" value="extrema"> Extrems i punts crítics</label>
          <label class="toggle"><input class="check" type="radio" name="func-sub" value="graph"> Funció i gràfica</label>
          <label class="toggle"><input class="check" type="radio" name="func-sub" value="algebra"> Àlgebra de funcions</label>
        </div>
      </div>

      <div class="section-title">Tipus de funcions</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Tipus de funcions">
          <label class="toggle"><input class="check" type="checkbox" id="f-linear" checked> Lineals</label>
          <label class="toggle"><input class="check" type="checkbox" id="f-quadratic" checked> Quadràtiques</label>
          <label class="toggle"><input class="check" type="checkbox" id="f-rational"> Racionals</label>
          <label class="toggle"><input class="check" type="checkbox" id="f-radical"> Arrels quadrades</label>
          <label class="toggle"><input class="check" type="checkbox" id="f-logexp"> Logarítmiques/Exponencials</label>
        </div>
      </div>

      <div class="controls">
        <label class="field chip">Dificultat
          <select id="func-difficulty">
            <option value="low" selected>Baixa</option>
            <option value="high">Alta</option>
          </select>
        </label>
        <label class="field chip">Arrodoniment decimals
          <select id="func-round">
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2" selected>2</option>
          </select>
        </label>
      </div>

      <div class="controls">
        <label class="toggle"><input class="check" type="checkbox" id="func-show-graph" checked> Mostrar gràfica</label>
        <label class="toggle"><input class="check" type="checkbox" id="func-hints"> Mostrar pistes</label>
      </div>

      <div class="subtitle">Format de resposta: intervals com <b>(-∞,2)∪(2,∞)</b>, valors com <b>x=3</b> o <b>f(2)=4</b>, text com <b>creixent</b> o <b>parell</b>.</div>
    `;
  } else {
    wrap.innerHTML = `<div class="section-title">Opcions específiques</div>
      <p class="subtitle">Aquest mòdul no té opcions específiques addicionals (de moment).</p>`;
  }

  box.appendChild(wrap);
  const holder = $('#cfg-specific');
  holder.innerHTML = '';
  holder.appendChild(box);

  showView('config');
}

function startFromConfig(){
  if(!pendingModule) return;
  const count = parseInt($('#cfg-count').value||DEFAULTS.count);
  const time = parseInt($('#cfg-time').value||0);
  const level = parseInt($('#cfg-level').value||1);

  const options = {};
  if(pendingModule.id==='arith'){
    const ops = [];
    if($('#op-plus').checked) ops.push('+');
    if($('#op-minus').checked) ops.push('-');
    if($('#op-times').checked) ops.push('×');
    if($('#op-div').checked) ops.push('÷');
    if(!ops.length){ alert('Selecciona almenys una operació.'); return; }
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
    options.sub = document.querySelector('input[name="eq-sub"]:checked')?.value || 'lin';
    options.range = ($('#eq-range').value || 'small');
    options.forceInt = !!$('#eq-int-sol')?.checked;
    options.allowIncomplete = !!$('#eq-incomplete')?.checked;
    options.hints = !!$('#eq-hints')?.checked;
  } else if(pendingModule.id==='func'){
    options.sub = document.querySelector('input[name="func-sub"]:checked')?.value || 'domain';
    options.funcTypes = {
      linear: !!$('#f-linear')?.checked,
      quadratic: !!$('#f-quadratic')?.checked,
      rational: !!$('#f-rational')?.checked,
      radical: !!$('#f-radical')?.checked,
      logexp: !!$('#f-logexp')?.checked
    };
    options.difficulty = $('#func-difficulty').value || 'low';
    options.round = parseInt($('#func-round').value || '2');
    options.showGraph = !!$('#func-show-graph')?.checked;
    options.hints = !!$('#func-hints')?.checked;
  }

  startQuiz(pendingModule.id, {count, time, level, options});
}

/* ===================== QUIZ ENGINE ===================== */
function startQuiz(moduleId, cfg){
  const module = MODULES.find(m=>m.id===moduleId) || MODULES[0];
  const count = clamp(parseInt(cfg.count)||10, 1, 200);
  const time = clamp(parseInt(cfg.time)||0, 0, 180);
  const level = clamp(parseInt(cfg.level)||1, 1, 20);

  session = {
    module: moduleId,
    count, time, level,
    idx: 0,
    correct: 0,
    wrongs: [],
    startedAt: Date.now(),
    secondsLeft: time>0 ? time*60 : 0,
    questions: [],
    options: cfg.options || {}
  };

  for(let i=0;i<count;i++) session.questions.push(module.gen(level, session.options));

  $('#qModule').textContent = module.name;
  $('#qLevel').textContent = `Nivell ${level}`;
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
function startQuizFromExisting(moduleId, options, questions){
  const module = MODULES.find(m=>m.id===moduleId) || MODULES[0];
  session = {
    module: moduleId,
    count: questions.length,
    time: 0,
    level: 0,
    idx: 0,
    correct: 0,
    wrongs: [],
    startedAt: Date.now(),
    secondsLeft: 0,
    questions: questions.map(q=>({ type:q.type, text:q.text, title:q.title, html:q.html, answer:q.answer, meta:q.meta, numeric:q.numeric, piCoef:q.piCoef, sol:q.sol, sols:q.sols })),
    options: options || {}
  };
  $('#qModule').textContent = module.name + ' (repàs d\'errors)';
  $('#qLevel').textContent = `Personalitzat`;
  $('#feedback').innerHTML='';
  $('#answer').value='';
  updateProgress();
  showView('quiz');
  renderQuestion();
  $('#timer').textContent='Sense límit';
  $('#answer').focus();
}

function renderQuestion(){
  const q = session.questions[session.idx];
  $('#qMeta').textContent = `Pregunta ${session.idx+1} de ${session.count}`;
  $('#qText').innerHTML = q.title || q.text;
  $('#qMedia').innerHTML = q.html ? `<div class="fade-in">${q.html}</div>` : '';
  $('#answer').value='';
  $('#feedback').innerHTML='';
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

/* ===== Helpers per a funcions ===== */
function parseInterval(str) {
  // Parseja intervals com (-∞,2)∪(2,∞)
  const s = String(str).trim().replace(/\s+/g, '');
  const intervals = s.split('∪');
  const result = [];
  
  for (const interval of intervals) {
    const match = interval.match(/[(\[](-?\d+|∞)\s*,\s*(-?\d+|∞)[)\]]/);
    if (match) {
      const leftInclusive = interval[0] === '[';
      const rightInclusive = interval[interval.length - 1] === ']';
      const left = match[1] === '∞' ? Infinity : parseFloat(match[1]);
      const right = match[2] === '∞' ? Infinity : parseFloat(match[2]);
      
      result.push({
        left, right, leftInclusive, rightInclusive
      });
    }
  }
  
  return result;
}

function intervalsEqual(a, b) {
  // Compara dos arrays d'intervals per igualtat
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    const intA = a[i];
    const intB = b[i];
    
    if (intA.left !== intB.left || intA.right !== intB.right ||
        intA.leftInclusive !== intB.leftInclusive || intA.rightInclusive !== intB.rightInclusive) {
      return false;
    }
  }
  
  return true;
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
  // Funcions: intervals
  else if(q.type === 'func-interval'){
    const userIntervals = parseInterval(raw);
    ok = intervalsEqual(userIntervals, q.answer);
  }
  // Funcions: valors numèrics
  else if(q.type === 'func-numeric'){
    const num = parseFloat(raw.replace(',', '.'));
    const tol = Math.pow(10, -((q.meta?.round||2)+1));
    ok = Number.isFinite(num) && equalsTol(num, q.numeric, tol);
  }
  // Funcions: text (creixent, decreixent, etc.)
  else if(q.type === 'func-text'){
    ok = raw.trim().toLowerCase() === String(q.answer).trim().toLowerCase();
  }
  // Funcions: parells de valors
  else if(q.type === 'func-pair'){
    const [ux, uy] = parsePair(raw);
    ok = Number.isFinite(ux) && Number.isFinite(uy) &&
         equalsTol(ux, q.sol.x, 1e-6) && equalsTol(uy, q.sol.y, 1e-6);
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
  $('#feedback').innerHTML = `<div class="feedback" style="background:${bg};border-color:${color};color:#78350f">${msg}</div>`
}
function fmtAns(a){
  if(typeof a==='number') return (Number.isInteger(a)? a : a.toFixed(3));
  if(/^-?\d+\/\d+$/.test(String(a))) return String(a);
  if(Array.isArray(a)) return a.join(', ');
  if(typeof a==='object' && a && 'x' in a && 'y' in a) return `(${a.x}, ${a.y})`;
  if(Array.isArray(a) && a[0] && typeof a[0] === 'object' && 'left' in a[0]) {
    // Format d'intervals
    return a.map(int => {
      const leftBracket = int.leftInclusive ? '[' : '(';
      const rightBracket = int.rightInclusive ? ']' : ')';
      const left = int.left === -Infinity ? '-∞' : int.left;
      const right = int.right === Infinity ? '∞' : int.right;
      return `${leftBracket}${left},${right}${rightBracket}`;
    }).join('∪');
  }
  return a;
}

function finishQuiz(timeUp){
  stopTimer();
  const elapsed = Math.floor((Date.now() - session.startedAt)/1000);
  const score = Math.round((session.correct / session.count) * 100);
  const name = ($('#studentName').value||'Anònim').trim();

  store.save({
    at: new Date().toISOString(),
    name,
    module: session.module,
    level: session.level,
    count: session.count,
    correct: session.correct,
    time_limit: session.time,
    time_spent: elapsed,
    score,
    wrongs: session.wrongs
  });

  session.done = true;

  const wrongsBtn = session.wrongs.length ? `<button onclick="redoWrongs()">Refés només els errors</button>` : '';
  const html = `
    <h3 style="margin-top:0">${timeUp? 'Temps exhaurit ⏱️':'Prova finalitzada 🎉'}</h3>
    <p class="subtitle">${name} · ${MODULES.find(m=>m.id===session.module).name} · Nivell ${session.level}</p>
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
  startQuizFromExisting(session.module, session.options, qs);
}

function renderWrongs(wr){
  return `<table><thead><tr><th>#</th><th>Pregunta</th><th>La teva</th><th>Correcta</th></tr></thead><tbody>`+
    wr.map((w,i)=>`<tr><td>${i+1}</td><td>${w.text}</td><td>${w.user}</td><td>${fmtAns(w.answer)}</td></tr>`).join('')+
    `</tbody></table>`
}

/* ===================== GENERADORS ===================== */
// Helper: mapeig de nivell (1–20) a rangs aritmètics
function levelRange(level){
  const t = clamp(level,1,20);
  const max = Math.round(10 + t*9.5); // 1≈20, 20≈200
  return [-Math.floor(max/3), max];
}

/* ===== Aritmètica ===== */
function genArith(level, opts={}){
  const allowNeg = !!opts.allowNeg;
  const tri = !!opts.tri;
  const ops = (opts.ops && opts.ops.length)? opts.ops : ['+','-','×','÷'];
  const [mn, mx] = levelRange(level);
  const low = allowNeg ? mn : 0;
  const a = rng(low, mx), b = rng(low, mx);
  const op = choice(ops);

  function makeDivisible(xmin, xmax){
    let y = rng(1, 12);
    let x = Math.abs(rng(xmin, xmax));
    const prod = y * rng(1, 12);
    return [prod, y];
  }

  let text, ans;
  if(tri){
    let c = rng(low, mx);
    let expOp1 = op;
    let expOp2 = choice(ops);
    let x=a, y=b, z=c;
    if(expOp1==='÷'){ [x,y] = makeDivisible(low, mx); }
    if(expOp2==='÷'){ [y,z] = makeDivisible(low, mx); }
    text = `${x} ${expOp1} ${y} ${expOp2} ${z} = ?`;
    ans = evalArith(x, expOp1, y);
    ans = evalArith(ans, expOp2, z);
  } else {
    let x=a, y=b, expOp = op;
    if(expOp==='÷'){ [x,y] = makeDivisible(low, mx); }
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
  const cellW = (w - pad*2)/cols, cellH = (h - pad*2)/rows;
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
  <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Parts ombrejades d'una fracció">
    <defs>
      <linearGradient id="fillGrad" x1="0" x2="1">
        <stop offset="0" stop-color="#a7f3d0"/><stop offset="1" stop-color="#7dd3fc"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${w}" height="${h}" fill="#f9fafb" rx="14" ry="14" />
    ${rects}
  </svg>`;
}
function svgBarFraction(segments, filled){
  const w=300, h=80, pad=12;
  const segW = (w - pad*2)/segments, segH = h - pad*2;
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
  <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Barra segmentada per fraccions">
    <defs>
      <linearGradient id="barGrad" x1="0" x2="1">
        <stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#a7f3d0"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${w}" height="${h}" fill="#f9fafb" rx="14" ry="14`;
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
  <svg viewBox="0 0 ${size} ${size}`;
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
  if(sn===n && sd===d){ n = n*2; d = d*2; }
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
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Rectangle">
    <defs>
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
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Triangle">
    <defs>
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
  <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Cercle" style="display:block;margin:auto">
    <defs>
      <radialGradient id="circGrad"><stop offset="0" stop-color="#e9d5ff"/><stop offset="1" stop-color="#93c5fd"/></radialGradient>
    </defs>
    <rect x="0" y="0" width="${size}" height="${size}" fill="#f8fafc" rx="18" ry="18`; // Talla per raons d'espai
}

// Funció per generar una figura de polígon regular
function svgPolyFig(n, c, units){
  return `
  <div style="text-align:center">
    <div class="chip">Polígon regular de ${n} costats</div>
    <div class="subtitle" style="margin-top:6px">costat = ${c} ${units}</div>
  </div>`;
}

// Funció per generar una graella amb mascara d'àrea
function svgGridMask(cols, rows, maskSet){
  const w=340, h=190, pad=12;
  const cellW = (w - pad*2)/cols, cellH = (h - pad*2)/rows;
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
  <svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Graella per àrea">
    <defs>
      <linearGradient id="gmGrad" x1="0" x2="1"><stop offset="0" stop-color="#a7f3d0"/><stop offset="1
