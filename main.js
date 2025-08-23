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
      <div class="section-title">Equacions · Tipus</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Tipus d'equacions">
          <label class="toggle"><input class="check" type="radio" name="eq-type" value="normal" checked> Equacions normals</label>
          <label class="toggle"><input class="check" type="radio" name="eq-type" value="frac"> Amb fraccions</label>
          <label class="toggle"><input class="check" type="radio" name="eq-type" value="par"> Amb parèntesis</label>
          <label class="toggle"><input class="check" type="radio" name="eq-type" value="sys"> Sistemes d'equacions</label>
        </div>
      </div>

      <div class="section-title">Equacions · Grau</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Grau de les equacions">
          <label class="toggle"><input class="check" type="radio" name="eq-grade" value="1st" checked> 1) Primer grau</label>
          <label class="toggle"><input class="check" type="radio" name="eq-grade" value="2nd"> 2) Segon grau</label>
          <label class="toggle"><input class="check" type="radio" name="eq-grade" value="mixed"> 3) Barrejats (1r i 2n grau)</label>
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
        <label class="toggle"><input class="check" type="checkbox" id="eq-incomplete"> Inclou equacions incompletes (2n grau)</label>
        <label class="toggle"><input class="check" type="checkbox" id="eq-hints"> Mostrar pistes</label>
      </div>

      <div class="subtitle">Format de resposta: 
        <b>x=3</b> o <b>3</b>; 
        per sistemes <b>(2, -1)</b> o <b>2,-1</b>; 
        fraccions <b>3/4</b> o decimals.
      </div>
    `;
  }
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
    // NOVA CONFIGURACIÓ PER A EQUACIONS
    const type = document.querySelector('input[name="eq-type"]:checked')?.value || 'normal';
    const grade = document.querySelector('input[name="eq-grade"]:checked')?.value || '1st';
    
    options.type = type;
    options.grade = grade;
    options.range = ($('#eq-range').value || 'small');
    options.forceInt = !!$('#eq-int-sol')?.checked;
    options.allowIncomplete = !!$('#eq-incomplete')?.checked;
    options.hints = !!$('#eq-hints')?.checked;
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
  <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="Pastís segmentat per fraccions" style="display:block;margin:auto">
    <defs>
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
    <rect x="0" y="0" width="${size}" height="${size}" fill="#f8fafc" rx="18" ry="18" />
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#circGrad)" stroke="#64748b">
      <animate attributeName="r" from="${R*0.6}" to="${R}" dur=".35s" fill="freeze"/>
    </circle>
    ${labelText(cx, size-10, labelTextStr)}
  </svg>`;
}
function svgPolyFig(n, c, units){
  return `
  <div style="text-align:center">
    <div class="chip">Polígon regular de ${n} costats</div>
    <div class="subtitle" style="margin-top:6px">costat = ${c} ${units}</div>
  </div>`;
}
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
      <linearGradient id="gmGrad" x1="0" x2="1"><stop offset="0" stop-color="#a7f3d0"/><stop offset="1" stop-color="#93c5fd"/></linearGradient>
    </defs>
    <rect x="0" y="0" width="${w}" height="${h}" fill="#f8fafc" rx="14" ry="14" />
    ${rects}
  </svg>`;
}
function svgCuboidFig(w,h,l,units){
  const W=380,H=240,p=14;
  return `
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Prisma rectangular">
    <defs>
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
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cilindre">
    <defs>
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
  const sideMax = level<7? 20 : (level<14? 50 : 120);
  const sideMax3D = level<7? 15 : (level<14? 30 : 50); // Dimensions majors per a figures 3D

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

  // CORRECCIÓ: Verificar correctament les opcions de figures
  const figs2D = [];
  if(opts.fig && opts.fig.rect) figs2D.push('rect');
  if(opts.fig && opts.fig.tri) figs2D.push('tri');
  if(opts.fig && opts.fig.circ) figs2D.push('circ');
  if(opts.fig && opts.fig.poly) figs2D.push('poly');
  if(opts.fig && opts.fig.grid) figs2D.push('grid');
  if(opts.fig && opts.fig.comp) figs2D.push('comp');

  const figs3D = [];
  if(opts.fig && opts.fig.cube) figs3D.push('cuboid');
  if(opts.fig && opts.fig.cylinder) figs3D.push('cylinder');

  // Si no hi ha figures seleccionades, afegir les per defecte
  if(figs2D.length === 0 && scope !== 'vol') {
    figs2D.push('rect', 'tri', 'circ'); // Figures per defecte per a 2D
  }
  if(figs3D.length === 0 && scope === 'vol') {
    figs3D.push('cuboid', 'cylinder'); // Figures per defecte per a 3D
  }

  if(scope==='vol'){
    const f = figs3D.length? choice(figs3D) : choice(['cuboid','cylinder']);
    if(f==='cuboid'){
      // Augmentar les dimensions dels cuboides perquè siguin més significatives
      const w=rng(5, Math.max(8, Math.floor(sideMax3D/4)));
      const h=rng(5, Math.max(8, Math.floor(sideMax3D/4)));
      const l=rng(5, Math.max(8, Math.floor(sideMax3D/4)));
      return packNum({ text:`Volum del prisma rectangular`, html: svgCuboidFig(w,h,l,U), value: w*h*l, pow: 3 });
    } else {
      // Augmentar les dimensions dels cilindres
      const r=rng(4, Math.max(8, Math.floor(sideMax3D/8)));
      const h=rng(6, Math.max(12, Math.floor(sideMax3D/6)));
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
  
  // comp – figura composta a graella (millorada)
  if(pick==='comp'){
    const cols = rng(8, 12), rows = rng(8, 12);
    const mask = new Set();
    
    function fillRect(x,y,w,h){ 
      for(let r=y;r<y+h;r++){ 
        for(let c=x;c<x+w;c++){ 
          if(r < rows && c < cols) {
            mask.add(r*cols + c); 
          }
        } 
      } 
    }
    
    // Crear 2-3 rectangles que es sobreposin parcialment
    const numRectangles = rng(2, 3);
    for(let i=0; i<numRectangles; i++){
      const x = rng(0, cols-3);
      const y = rng(0, rows-3);
      const w = rng(2, Math.min(5, cols-x));
      const h = rng(2, Math.min(5, rows-y));
      fillRect(x, y, w, h);
    }
    
    const html = svgGridMask(cols, rows, mask);
    return { 
      type:'geom-num', 
      text:`Àrea de la figura composta (unitats²)`, 
      html, 
      numeric: mask.size, 
      meta:{requireUnits:false, units:'u', pow:2, round:0}, 
      answer: String(mask.size) 
    };
  }
}
/* ===== Percentatges ===== */
function genPercent(level){
  const mode = Math.random()<.33? 'of' : (Math.random()<.5? 'is-of' : 'discount');
  if(mode==='of'){
    const p = [5,10,12.5,15,20,25,30,40,50,60,75][rng(0,10)];
    const n = rng(20, 800);
    const ans = +(n * p / 100).toFixed(2);
    return { type:'percent-of', text:`${p}% de ${n} = ?`, answer: ans };
  } else if(mode==='is-of'){
    const p = [10,12.5,20,25,33.33,40,50,66.67,75,80][rng(0,9)];
    const part = rng(10,600);
    const whole = +(part * 100 / p).toFixed(2);
    return { type:'percent-is-of', text:`${part} és el ${p}% de ?`, answer: whole };
  } else {
    const n = rng(20, 900);
    const off = [5,10,12,15,20,25,30,40][rng(0,7)];
    const ans = +(n * (1 - off/100)).toFixed(2);
    return { type:'percent-discount', text:`Descompte del ${off}% sobre ${n} → preu final = ?`, answer: ans };
  }
}

/* ===== Equacions (NOU MÒDUL) ===== */
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
// 1) Primer grau
function genEqLinear(level, opts){
  const a = randCoef(opts.range || 'small');
  const sol = niceIntIf(rng(-9,9), !!opts.forceInt);
  const b = -a * sol;
  const text = `${a}·x ${b>=0?'+':'−'} ${Math.abs(b)} = 0`;
  const hint = opts.hints ? `<div class="chip">Pista: mou el terme independent i divideix per a</div>` : '';
  return { type:'eq-lin', text:`Resol: ${text}`, html: hint, sol: sol, answer: sol };
}

function genEqQuadratic(level, opts){
  const allowIncomplete = !!opts.allowIncomplete;
  const forceInt = !!opts.forceInt;
  const R = opts.range || 'small';
  if(allowIncomplete && Math.random()<0.4){
    if(Math.random()<0.5){
      const a = randCoef(R), k = rng(1, 9);
      const c = -a * k * k;
      const text = `${a}·x² ${c>=0?'+':'−'} ${Math.abs(c)} = 0`;
      const sols = [ -k, k ].map(v => niceIntIf(v, forceInt));
      const hint = opts.hints ? `<div class="chip">Pista: x² = −c/a</div>` : '';
      return { type:'eq-quad', text:`Resol: ${text}`, html: hint, sols, answer: `${sols[0]}, ${sols[1]}` };
    } else {
      const a = randCoef(R), b = randCoef(R);
      const x2 = -b / a;
      const sols = [ 0, niceIntIf(x2, forceInt) ];
      const text = `${a}·x² ${b>=0?'+':'−'} ${Math.abs(b)}·x = 0`;
      const hint = opts.hints ? `<div class="chip">Pista: factoritza x(ax + b)=0</div>` : '';
      return { type:'eq-quad', text:`Resol: ${text}`, html: hint, sols, answer: `${sols[0]}, ${sols[1]}` };
    }
  } else {
    const r1 = rng(-9,9), r2 = rng(-9,9);
    const sols = [r1, r2].map(v => niceIntIf(v, forceInt));
    const b = -(sols[0] + sols[1]);
    const c = sols[0]*sols[1];
    const text = `x² ${b>=0?'+':'−'} ${Math.abs(b)}·x ${c>=0?'+':'−'} ${Math.abs(c)} = 0`;
    const hint = opts.hints ? `<div class="chip">Pista: fórmula general o factorització</div>` : '';
    return { type:'eq-quad', text:`Resol: ${text}`, html: hint, sols, answer: `${sols[0]}, ${sols[1]}` };
  }
}

function genEqSystem2x2(level, opts){
  const R = opts.range || 'small';
  let x = rng(-6,6), y = rng(-6,6);
  if(opts.forceInt){ x = Math.round(x); y = Math.round(y); }
  const a1 = randCoef(R), b1 = randCoef(R);
  const a2 = randCoef(R), b2 = randCoef(R);
  const c1 = a1*x + b1*y;
  const c2 = a2*x + b2*y;
  if(Math.random()<0.12){
    const k = rng(2,6);
    const aa2 = a1*k, bb2 = b1*k, cc2 = c2 + (Math.random()<.5? 1 : -1);
    const text = `{ ${a1}x ${b1>=0?'+':'−'} ${Math.abs(b1)}y = ${c1} ; ${aa2}x ${bb2>=0?'+':'−'} ${Math.abs(bb2)}y = ${cc2} }`;
    return { type:'eq-sys', text:`Resol el sistema: ${text}`, html: opts.hints? `<div class="chip">Pista: comprova compatibilitat (sense solució)</div>`:'', sol:{x,y}, meta:{special:'none'}, answer:`(${x}, ${y})` };
  }
  if(Math.random()<0.12){
    const k = rng(2,6);
    const text = `{ ${a1}x ${b1>=0?'+':'−'} ${Math.abs(b1)}y = ${c1} ; ${a1*k}x ${b1*k>=0?'+':'−'} ${Math.abs(b1*k)}y = ${c1*k} }`;
    return { type:'eq-sys', text:`Resol el sistema: ${text}`, html: opts.hints? `<div class="chip">Pista: equacions coincidents (infinites solucions)</div>`:'', sol:{x,y}, meta:{special:'inf'}, answer:`(${x}, ${y})` };
  }
  const text = `{ ${a1}x ${b1>=0?'+':'−'} ${Math.abs(b1)}y = ${c1} ; ${a2}x ${b2>=0?'+':'−'} ${Math.abs(b2)}y = ${c2} }`;
  const hint = opts.hints ? `<div class="chip">Pista: substitució o reducció</div>` : '';
  return { type:'eq-sys', text:`Resol el sistema: ${text}`, html: hint, sol:{x,y}, answer:`(${x}, ${y})` };
}

function genEqFractions(level, opts){
  const denX = rng(2,9);
  const A = rng(1,8), B = rng(2,9);
  const rhs = rng(1,12);
  const x = (rhs - A/B) * denX;
  const sol = opts.forceInt ? Math.round(x) : x;
  const html = opts.hints? `<div class="chip">Pista: passa termes i redueix a comú denominador</div>` : '';
  return { type:'eq-frac', text:`Resol: ${A}/${B} + x/${denX} = ${rhs}`, html, sol, answer: sol };
}

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

function genEqQuadraticFractions(level, opts){
  const allowIncomplete = !!opts.allowIncomplete;
  if(allowIncomplete && Math.random() < 0.5) {
    const a = randCoef(opts.range || 'small');
    const k = rng(1, 6);
    const c = -a * k * k;
    const text = `${a}·x² ${c>=0?'+':'−'} ${Math.abs(c)} = 0`;
    const sols = [ -k, k ].map(v => niceIntIf(v, !!opts.forceInt));
    const hint = opts.hints ? `<div class="chip">Pista: x² = −c/a</div>` : '';
    return { type:'eq-quad', text:`Resol: ${text}`, html: hint, sols, answer: `${sols[0]}, ${sols[1]}` };
  } else {
    return genEqQuadratic(level, opts);
  }
}

function genEqQuadraticParentheses(level, opts){
  const r1 = rng(-6,6), r2 = rng(-6,6);
  const sols = [r1, r2].map(v => niceIntIf(v, !!opts.forceInt));
  const text = `(x ${r1>=0?'+':'−'} ${Math.abs(r1)})(x ${r2>=0?'+':'−'} ${Math.abs(r2)}) = 0`;
  const hint = opts.hints ? `<div class="chip">Pista: cada parèntesi pot ser zero</div>` : '';
  return { type:'eq-quad', text:`Resol: ${text}`, html: hint, sols, answer: `${sols[0]}, ${sols[1]}` };
}

function genEq(level, opts={}){
  const type = opts.type || 'normal';
  const grade = opts.grade || '1st';
  let concreteGrade = grade;
  if(grade === 'mixed') {
    concreteGrade = Math.random() < 0.7 ? '1st' : '2nd';
  }
  if(concreteGrade === '1st') {
    if(type === 'normal') return genEqLinear(level, opts);
    if(type === 'frac') return genEqFractions(level, opts);
    if(type === 'par') return genEqParentheses(level, opts);
    if(type === 'sys') return genEqSystem2x2(level, opts);
  } else {
    if(type === 'normal') return genEqQuadratic(level, opts);
    if(type === 'frac') return genEqQuadraticFractions(level, opts);
    if(type === 'par') return genEqQuadraticParentheses(level, opts);
    if(type === 'sys') return genEqSystem2x2(level, opts);
  }
  return genEqLinear(level, opts);
}

function genEq1(level){
  const a = rng(1, 12) * (Math.random()<.25? -1: 1);
  const x = rng(-15, 15);
  const b = rng(-20, 20);
  const c = a*x + b;
  const text = `${a}·x ${b>=0?'+':'−'} ${Math.abs(b)} = ${c}. Troba x`;
  return { type:'eq1', text, answer: x };
}

/* ===== Estadística bàsica ===== */
function statsList(level){
  const len = rng(5, 9);
  const max = level<7? 20 : (level<14? 50 : 100);
  const arr = Array.from({length:len}, ()=> rng(1,max));
  return arr;
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
  const val = +( (Math.random()<.5? rng(1, 50) : (rng(10,500)/10)) ).toFixed(2);
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
      {group:'length', from:'km', to:'m', factor:1000, icon:ICON.ruler},
      {group:'length', from:'m', to:'cm', factor:100, icon:ICON.ruler},
      {group:'length', from:'cm', to:'mm', factor:10, icon:ICON.ruler},
      {group:'length', from:'mm', to:'cm', factor:0.1, icon:ICON.ruler},
      {group:'length', from:'m', to:'km', factor:0.001, icon:ICON.ruler},
    ],
    mass: [
      {group:'mass', from:'kg', to:'g', factor:1000, icon:ICON.scale},
      {group:'mass', from:'g', to:'kg', factor:0.001, icon:ICON.scale},
      {group:'mass', from:'g', to:'mg', factor:1000, icon:ICON.scale},
      {group:'mass', from:'mg', to:'g', factor:0.001, icon:ICON.scale},
    ],
    volume: [
      {group:'volume', from:'L', to:'mL', factor:1000, icon:ICON.cube},
      {group:'volume', from:'mL', to:'L', factor:0.001, icon:ICON.cube},
    ],
    area: [
      {group:'area', from:'m²', to:'cm²', factor:10000, icon:ICON.grid},
      {group:'area', from:'cm²', to:'m²', factor:0.0001, icon:ICON.grid},
    ],
    time: [
      {group:'time', from:'h', to:'min', factor:60, icon:ICON.clock},
      {group:'time', from:'min', to:'s', factor:60, icon:ICON.clock},
      {group:'time', from:'h', to:'s', factor:3600, icon:ICON.clock},
      {group:'time', from:'min', to:'h', factor:1/60, icon:ICON.clock},
    ]
  };

  const pool = sets[group] || sets.length;
  const set = choice(pool);
  return convQuestion(set, round);
}

/* ===================== RESULTS ===================== */
function renderResults(){
  const data = store.all();
  const modFilter = $('#filter-module').value || '';
  const nameFilter = ($('#filter-student').value||'').toLowerCase();
  const filtered = data.filter(r=>
    (!modFilter || r.module===modFilter) && (!nameFilter || (r.name||'').toLowerCase().includes(nameFilter))
  );

  if(!filtered.length){ $('#resultsTable').innerHTML = '<div class="chip">No hi ha dades.</div>'; return }

  const rows = filtered.map((r,i)=>{
    const m = MODULES.find(m=>m.id===r.module)?.name || r.module;
    const d = new Date(r.at);
    return `<tr>
      <td>${i+1}</td>
      <td>${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
      <td>${r.name}</td>
      <td>${m}</td>
      <td>Nivell ${r.level}</td>
      <td>${r.correct}/${r.count}</td>
      <td>${r.score}%</td>
      <td>${fmtTime(r.time_spent)}</td>
    </tr>`
  }).join('');

  $('#resultsTable').innerHTML = `
    <table>
      <thead>
        <tr><th>#</th><th>Data</th><th>Alumne/a</th><th>Mòdul</th><th>Nivell</th><th>Encerts</th><th>Puntuació</th><th>Temps</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function exportCSV(){
  const data = store.all();
  if(!data.length){ alert('No hi ha dades per exportar.'); return }
  const header = ['data','alumne','modul','nivell','preguntes','correctes','puntuacio','temps_limit','temps_consumit'];
  const lines = [header.join(',')];
  data.forEach(r=>{
    lines.push([r.at, r.name, r.module, r.level, r.count, r.correct, r.score, r.time_limit, r.time_spent].join(','))
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
function init(){
  buildHome();
  showView('home');
  $('#year').textContent = new Date().getFullYear();
}
init();
