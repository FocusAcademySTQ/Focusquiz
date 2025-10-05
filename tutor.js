/* =======================================================
Focus Academy · Tutor Virtual Intel·ligent 3.0 (per alumne)
Arxiu: tutor.js
======================================================= */

(function(){
const $=(q)=>document.querySelector(q);
const choice=(arr)=>arr[Math.floor(Math.random()*arr.length)];

// 🔹 Obté el nom de l'alumne actual
function currentStudent(){
  let name = ($('#studentName')?.value || '').trim();
  if(!name){
    name = localStorage.getItem('lastStudent') || '';
    if($('#studentName')) $('#studentName').value = name;
  }
  if(name) localStorage.setItem('lastStudent', name);
  return name;
}

// 🧾 Guarda resultat de cada pregunta amb hora i dificultat opcional
window.saveResult=function(moduleName,questionText,correct,difficulty=1){
  const student=currentStudent();
  if(!student) return; // no guardem si no hi ha nom

  const data=JSON.parse(localStorage.getItem('progress')||'{}');
  if(!data[student]) data[student]={};
  if(!data[student][moduleName]) data[student][moduleName]=[];
  data[student][moduleName].push({question:questionText,correct:!!correct,time:Date.now(),difficulty});
  localStorage.setItem('progress',JSON.stringify(data));
};

// 📊 Calcula el rendiment per alumne i mòdul
window.getPerformance=function(student=null){
  student = student || currentStudent();
  const data=JSON.parse(localStorage.getItem('progress')||'{}');
  if(!student || !data[student]) return null;
  const summary={};
  for(const mod in data[student]){
    const items=data[student][mod]; if(items.length===0) continue;
    const correct=items.filter(x=>x.correct).length;
    summary[mod]=Math.round((correct/items.length)*100);
  }
  return summary;
};

// 📈 Calcula la millora recent (últimes vs primeres preguntes)
window.getTrend=function(module){
  const student=currentStudent();
  const all=JSON.parse(localStorage.getItem('progress')||'{}');
  const data=(all[student]&&all[student][module])?all[student][module]:[];
  if(data.length<20)return null;
  const first=data.slice(0,10),last=data.slice(-10);
  const f=first.filter(x=>x.correct).length/first.length*100;
  const l=last.filter(x=>x.correct).length/last.length*100;
  return Math.round(l-f);
};

// ⏱️ Calcula el temps mitjà de resposta
window.getAvgTime=function(module){
  const student=currentStudent();
  const all=JSON.parse(localStorage.getItem('progress')||'{}');
  const data=(all[student]&&all[student][module])?all[student][module]:[];
  if(data.length===0)return null;
  const diffs=[];for(let i=1;i<data.length;i++)diffs.push((data[i].time-data[i-1].time)/1000);
  const avg=diffs.reduce((a,b)=>a+b,0)/diffs.length;
  return Math.round(avg*10)/10;
};

// 💬 Recomanació personalitzada
window.recommendNextModule=function(){
  const student=currentStudent();
  if(!student) return "Escriu el teu nom per rebre recomanacions personals ✍️";

  const perf=getPerformance(student);
  if(!perf || Object.keys(perf).length===0)
    return `${student}, encara no hi ha dades per fer recomanacions. Fes algunes pràctiques 💪`;

  const entries=Object.entries(perf);
  const worst=entries.sort((a,b)=>a[1]-b[1])[0];
  const tips=[
    "Cada error és una oportunitat 💡",
    "Fantàstic progrés 👏",
    "Continua així i dominaràs aquest tema 💪",
    "Cada pregunta t'apropa a l'objectiu 🚀"
  ];
  const trend=getTrend(worst[0]); let trendText="";
  if(trend!==null)
    trendText=trend>0?`Has millorat un +${trend}% d'encerts últimament 👏`:`Has baixat un ${Math.abs(trend)}%, repassa una mica 🔁`;
  return `${student}, ${choice(tips)} Et recomano practicar més <b>${worst[0]}</b> (${worst[1]}% d'encerts). ${trendText}`;
};

// 🪄 Mostra la recomanació i actualitza gràfic
window.showRecommendation=function(selector){
  const el=$(selector); if(!el)return;
  el.innerHTML=recommendNextModule();
  renderBars();
};

// 🎯 Repàs adaptatiu
window.getWrongQuestions=function(module){
  const student=currentStudent();
  const all=JSON.parse(localStorage.getItem('progress')||'{}');
  const data=(all[student]&&all[student][module])?all[student][module]:[];
  return data.filter(x=>!x.correct).map(x=>x.question);
};

// 📦 Exporta progrés (tots els alumnes)
window.exportProgress=function(){
  const blob=new Blob([localStorage.getItem('progress')],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='focus-progress.json';a.click();
};

// 📥 Importa progrés (fusió)
window.importProgress=function(file){
  const reader=new FileReader();
  reader.onload=()=>{try{
    const newData=JSON.parse(reader.result);
    const oldData=JSON.parse(localStorage.getItem('progress')||'{}');
    for(const student in newData){
      if(!oldData[student]) oldData[student]={};
      for(const mod in newData[student]){
        if(!oldData[student][mod]) oldData[student][mod]=[];
        oldData[student][mod]=oldData[student][mod].concat(newData[student][mod]);
      }
    }
    localStorage.setItem('progress',JSON.stringify(oldData));
    alert("Progrés importat correctament ✅");
  }catch(e){alert("Fitxer invàlid ❌");}};
  reader.readAsText(file);
};

// 🔄 Esborra tot el progrés
window.resetProgress=function(){
  if(confirm("Vols esborrar tot el progrés guardat en aquest dispositiu?")){
    localStorage.removeItem('progress');
    alert('Progrés esborrat.');
  }
};

// 🌈 Gràfic pastel per alumne
window.renderBars=function(){
  const student=currentStudent();
  const perf=getPerformance(student);
  const wrap=$('#progressBars'); if(!wrap)return;
  wrap.innerHTML='';
  if(!perf) return;
  const palette=['#8fb5ff','#7fe7c9','#c7b5ff','#ffc9a9','#ffe08a','#ffb3c1'];
  let i=0;
  for(const [mod,pct]of Object.entries(perf)){
    const color=palette[i%palette.length]; i++;
    const div=document.createElement('div');
    div.innerHTML=`<div style="margin:6px 0"><b>${mod}</b> ${pct}%<div style="background:#eee;border-radius:8px;overflow:hidden;height:10px;"><div style="width:${pct}%;background:${color};height:10px;border-radius:8px;"></div></div></div>`;
    wrap.appendChild(div);
  }
};
  // 🔁 Actualitza el consell quan es canvia el nom
document.addEventListener('DOMContentLoaded', ()=>{
  const input = document.querySelector('#studentName');
  if(input){
    input.addEventListener('change', ()=> showRecommendation('#recommendationText'));
    input.addEventListener('keyup', (e)=> {
      if(e.key==='Enter') showRecommendation('#recommendationText');
    });
  }
});

})();
