/* =======================================================
Focus Academy · Tutor Virtual Intel·ligent 3.1 (Login local)
Arxiu: tutor.js
======================================================= */

(function(){
const $=(q)=>document.querySelector(q);
const choice=(a)=>a[Math.floor(Math.random()*a.length)];
const USERS_KEY='focus-users';
const PROG_KEY='progress';
const LAST_KEY='lastStudent';

// ----------------- Usuari / sessió -----------------
function loadUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY)||'[]') }catch{ return [] } }
function saveUsers(list){ localStorage.setItem(USERS_KEY, JSON.stringify(list)); }
function setCurrentUser(name){ localStorage.setItem(LAST_KEY, name); if($('#studentName')) $('#studentName').value = name; }
function getCurrentUser(){ return ($('#studentName')?.value||localStorage.getItem(LAST_KEY)||'').trim(); }
function isLogged(){ return !!getCurrentUser(); }

// Migració de dades antigues (globals) -> crea usuari "importat-YYYYMMDD"
function migrateIfNeeded(){
  try{
    const raw = localStorage.getItem(PROG_KEY);
    if(!raw) return;
    const parsed = JSON.parse(raw);
    // si la clau primerera té array d'objectes amb 'question' assumim format antic per mòdul
    const keys = Object.keys(parsed||{});
    if(keys.length && parsed[keys[0]] && Array.isArray(parsed[keys[0]]) && parsed[keys[0]][0] && parsed[keys[0]][0].question){
      const ts = new Date().toISOString().slice(0,10).replace(/-/g,'');
      const newUser = 'importat_'+ts;
      const newObj = {};
      newObj[newUser] = parsed;
      localStorage.setItem(PROG_KEY, JSON.stringify(newObj));
      const users = loadUsers(); users.push(newUser); saveUsers(users);
      setCurrentUser(newUser);
      alert('S\'ha migrat el progrés existent a un usuari local: '+newUser);
    }
  }catch(e){}
}

// ----------------- Gestió de comptes (crear, esborrar, llistar) -----------------
window.createUser=function(name){
  name = (name||'').trim();
  if(name.length<2){ alert('Nom massa curt.'); return false; }
  const users = loadUsers();
  if(users.includes(name)){ alert('Aquest usuari ja existeix.'); return false; }
  users.push(name); saveUsers(users);
  // assegura estructura progress per a l'usuari
  try{ const prog = JSON.parse(localStorage.getItem(PROG_KEY)||'{}'); if(!prog[name]) prog[name] = {}; localStorage.setItem(PROG_KEY, JSON.stringify(prog)); }catch(e){}
  setCurrentUser(name);
  refreshUserList();
  showRecommendation('#recommendationText');
  closeLoginOverlay();
  return true;
};

window.deleteUser=function(name){
  if(!name) { alert('Selecciona un usuari per esborrar.'); return; }
  if(!confirm(`Esborrar l'usuari "${name}" i totes les seves dades?`)) return;
  const users = loadUsers().filter(u=>u!==name); saveUsers(users);
  try{ const prog = JSON.parse(localStorage.getItem(PROG_KEY)||'{}'); delete prog[name]; localStorage.setItem(PROG_KEY, JSON.stringify(prog)); }catch(e){}
  if(getCurrentUser()===name){ localStorage.removeItem(LAST_KEY); if($('#studentName')) $('#studentName').value=''; }
  refreshUserList();
  alert('Usuari esborrat.');
};

function refreshUserList(){
  const sel = $('#loginUserList');
  if(!sel) return;
  const users = loadUsers();
  sel.innerHTML = '<option value="">— Tria usuari —</option>';
  users.forEach(u=>{ const o = document.createElement('option'); o.value=u; o.textContent=u; sel.appendChild(o); });
}

// ----------------- Migració i inicial (executa a la càrrega) -----------------
document.addEventListener('DOMContentLoaded', ()=>{
  migrateIfNeeded();
  refreshUserList();
  // Si hi ha usuari recordat, ocultem overlay
  const last = localStorage.getItem(LAST_KEY);
  if(last && last.length){
    if($('#loginOverlay')) $('#loginOverlay').style.display='none';
    if($('#studentName')) $('#studentName').value = last;
  } else {
    if($('#loginOverlay')) $('#loginOverlay').style.display='flex';
  }

  // Connectem botons de l'overlay (si existeixen)
  const btnCreate = $('#btnCreateUser'); if(btnCreate) btnCreate.onclick = ()=>{ const v = $('#newUserName').value||''; createUser(v); };
  const btnLoginSelect = $('#btnLoginSelect'); if(btnLoginSelect) btnLoginSelect.onclick = ()=>{ const sel = $('#loginUserList').value; if(sel) { setCurrentUser(sel); closeLoginOverlay(); showRecommendation('#recommendationText'); } else alert('Tria un usuari'); };
  const btnDelete = $('#btnDeleteUser'); if(btnDelete) btnDelete.onclick = ()=>{ const sel = $('#loginUserList').value; deleteUser(sel); };
  const btnExport = $('#btnExport'); if(btnExport) btnExport.onclick = ()=>{ exportProgress(); };
  const btnImport = $('#btnImport'); if(btnImport) btnImport.onclick = ()=>{ $('#importFile').click(); };
  const importFile = $('#importFile'); if(importFile) importFile.onchange = (e)=>{ const f = e.target.files[0]; if(f) importProgress(f); };

  // si l'usuari canvia manualment el camp studentName refresquem
  const input = $('#studentName'); if(input){
    input.addEventListener('change', ()=> { setCurrentUser(input.value.trim()); showRecommendation('#recommendationText'); });
    input.addEventListener('keyup', (e)=> { if(e.key==='Enter'){ setCurrentUser(input.value.trim()); showRecommendation('#recommendationText'); closeLoginOverlay(); } });
  }

  // si venim amb usuari ja establert, render immediat
  if(isLogged()) showRecommendation('#recommendationText');
});

// petites helpers overlay
function closeLoginOverlay(){ if($('#loginOverlay')) $('#loginOverlay').style.display='none'; }
function openLoginOverlay(){ if($('#loginOverlay')) { refreshUserList(); $('#loginOverlay').style.display='flex'; } }

// ----------------- PROGRÉS PER USUARI -----------------
function readAllProgress(){ try{ return JSON.parse(localStorage.getItem(PROG_KEY)||'{}') }catch{ return {} } }
function writeAllProgress(obj){ localStorage.setItem(PROG_KEY, JSON.stringify(obj)); }

// 🧾 Guarda resultat (per usuari)
window.saveResult=function(moduleName,questionText,correct,difficulty=1){
  const student = getCurrentUser();
  if(!student) { openLoginOverlay(); alert('Cal iniciar sessió abans de fer exercicis.'); return; }
  const all = readAllProgress();
  if(!all[student]) all[student] = {};
  if(!all[student][moduleName]) all[student][moduleName] = [];
  all[student][moduleName].push({question:questionText,correct:!!correct,time:Date.now(),difficulty});
  writeAllProgress(all);
};

// 📊 Rendiment per usuari i mòdul
window.getPerformance=function(student){
  student = student || getCurrentUser();
  const all = readAllProgress();
  if(!student || !all[student]) return null;
  const summary = {};
  for(const mod in all[student]){
    const items = all[student][mod]; if(!items || items.length===0) continue;
    const correct = items.filter(x=>x.correct).length;
    summary[mod] = Math.round((correct/items.length)*100);
  }
  return summary;
};

// 📈 Tendència per usuari
window.getTrend=function(module){
  const student = getCurrentUser();
  const all = readAllProgress();
  const data = (all[student]&&all[student][module])?all[student][module]:[];
  if(data.length<20) return null;
  const first=data.slice(0,10), last=data.slice(-10);
  const f = first.filter(x=>x.correct).length/first.length*100;
  const l = last.filter(x=>x.correct).length/last.length*100;
  return Math.round(l-f);
};

// ⏱ Temps mig per usuari
window.getAvgTime=function(module){
  const student = getCurrentUser();
  const all = readAllProgress();
  const data = (all[student]&&all[student][module])?all[student][module]:[];
  if(data.length===0) return null;
  const diffs = []; for(let i=1;i<data.length;i++) diffs.push((data[i].time-data[i-1].time)/1000);
  const avg = diffs.reduce((a,b)=>a+b,0)/diffs.length;
  return Math.round(avg*10)/10;
};

// 💬 Recomanació personalitzada
window.recommendNextModule=function(){
  const student = getCurrentUser();
  if(!student) return "Has d'iniciar sessió per rebre recomanacions ✍️";
  const perf = getPerformance(student);
  if(!perf || Object.keys(perf).length===0) return `${student}, encara no hi ha dades. Fes una pràctica!`;
  const entries = Object.entries(perf);
  const worst = entries.sort((a,b)=>a[1]-b[1])[0];
  const tips = ["Cada error és una oportunitat 💡","Fantàstic progrés 👏","Continua així 💪","Un pas més cap a l'objectiu 🚀"];
  const trend = getTrend(worst[0]); let trendText = "";
  if(trend !== null) trendText = trend>0 ? `Has millorat +${trend}% últimament 👏` : `Has baixat ${Math.abs(trend)}%, repassa una mica 🔁`;
  return `${student}, ${choice(tips)} Et recomano practicar <b>${worst[0]}</b> (${worst[1]}% d'encerts). ${trendText}`;
};

// mostra recomanació i gràfic
window.showRecommendation=function(selector){
  const el = $(selector);
  if(!el) return;
  el.innerHTML = recommendNextModule();
  renderBars();
};

// repàs adaptatiu per usuari
window.getWrongQuestions=function(module){
  const student = getCurrentUser();
  const all = readAllProgress();
  const data = (all[student]&&all[student][module])?all[student][module]:[];
  return data.filter(x=>!x.correct).map(x=>x.question);
};

// export/import global (tots els usuaris)
window.exportProgress=function(){
  const blob = new Blob([localStorage.getItem(PROG_KEY)||'{}'], {type:'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'focus-progress.json'; a.click();
};
window.importProgress=function(file){
  const reader = new FileReader();
  reader.onload = ()=>{ try{
    const newData = JSON.parse(reader.result);
    const old = readAllProgress();
    for(const u in newData){ if(!old[u]) old[u] = {}; for(const m in newData[u]){ if(!old[u][m]) old[u][m] = []; old[u][m] = old[u][m].concat(newData[u][m]); } }
    writeAllProgress(old);
    // actualitza llista d'usuaris
    const users = loadUsers();
    Object.keys(newData).forEach(u=>{ if(!users.includes(u)) users.push(u); });
    saveUsers(users);
    refreshUserList();
    alert('Importació correcte ✅');
  }catch(e){ alert('Fitxer invàlid ❌'); } };
  reader.readAsText(file);
};

// esborra dades d'un usuari concret (opcional)
window.clearUserProgress=function(user){
  if(!user) user = getCurrentUser();
  if(!user) return;
  if(!confirm(`Esborrar progrés de ${user}?`)) return;
  const all = readAllProgress(); delete all[user]; writeAllProgress(all);
  alert('Progrés d\'usuari esborrat.');
};

// 🌈 Render barres per usuari
window.renderBars=function(){
  const student = getCurrentUser();
  const perf = getPerformance(student);
  const wrap = $('#progressBars'); if(!wrap) return;
  wrap.innerHTML = '';
  if(!perf) return;
  const palette = ['#8fb5ff','#7fe7c9','#c7b5ff','#ffc9a9','#ffe08a','#ffb3c1'];
  let i=0;
  for(const [mod,pct] of Object.entries(perf)){
    const color = palette[i%palette.length]; i++;
    const div = document.createElement('div');
    div.innerHTML = `<div style="margin:6px 0"><b>${mod}</b> ${pct}%<div style="background:#eee;border-radius:8px;overflow:hidden;height:10px;"><div style="width:${pct}%;background:${color};height:10px;border-radius:8px;"></div></div></div>`;
    wrap.appendChild(div);
  }
};

})(); 
