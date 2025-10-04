/* =======================================================
Focus Academy · Tutor Virtual Intel·ligent 2.0
Arxiu: tutor.js
======================================================= */

(function(){
const $=(q)=>document.querySelector(q);
const choice=(arr)=>arr[Math.floor(Math.random()*arr.length)];

// 🧾 Guarda resultat de cada pregunta amb hora i dificultat opcional
window.saveResult=function(moduleName,questionText,correct,difficulty=1){
const data=JSON.parse(localStorage.getItem('progress')||'{}');
if(!data[moduleName])data[moduleName]=[];
data[moduleName].push({question:questionText,correct:!!correct,time:Date.now(),difficulty});
localStorage.setItem('progress',JSON.stringify(data));
};

// 📊 Calcula el rendiment per mòdul
window.getPerformance=function(){
const data=JSON.parse(localStorage.getItem('progress')||'{}');
const summary={};
for(const mod in data){
const items=data[mod];if(items.length===0)continue;
const correct=items.filter(x=>x.correct).length;
summary[mod]=Math.round((correct/items.length)*100);
}
return summary;
};

// 📈 Calcula la millora recent (últimes vs primeres preguntes)
window.getTrend=function(module){
const data=JSON.parse(localStorage.getItem('progress')||'{}')[module]||[];
if(data.length<20)return null;
const first=data.slice(0,10),last=data.slice(-10);
const f=first.filter(x=>x.correct).length/first.length*100;
const l=last.filter(x=>x.correct).length/last.length*100;
return Math.round(l-f);
};

// ⏱️ Calcula el temps mitjà de resposta (en segons)
window.getAvgTime=function(module){
const data=JSON.parse(localStorage.getItem('progress')||'{}')[module]||[];
if(data.length===0)return null;
const diffs=[];for(let i=1;i<data.length;i++)diffs.push((data[i].time-data[i-1].time)/1000);
const avg=diffs.reduce((a,b)=>a+b,0)/diffs.length;
return Math.round(avg*10)/10;
};

// 💬 Recomanació intel·ligent
window.recommendNextModule=function(){
const perf=getPerformance(),entries=Object.entries(perf);
if(entries.length===0)return"Encara no hi ha dades per fer recomanacions. Fes algunes pràctiques 💪";
const worst=entries.sort((a,b)=>a[1]-b[1])[0];
const tips=["No et rendeixis, cada error és una oportunitat!","Fantàstic progrés 👏","Continua així i dominaràs aquest tema 💪","Cada pregunta t'apropa a l'objectiu 🚀"];
const trend=getTrend(worst[0]);let trendText="";
if(trend!==null)trendText=trend>0?`Has millorat un +${trend}% d'encerts últimament 👏`:`Has baixat un ${Math.abs(trend)}%, repassa una mica 🔁`;
return `${choice(tips)} Et recomano practicar més <b>${worst[0]}</b> (${worst[1]}% d'encerts). ${trendText}`;
};

// 🪄 Mostra la recomanació dins d'un selector
window.showRecommendation=function(selector){
const el=$(selector);if(!el)return;
el.innerHTML=recommendNextModule();
renderBars();
};

// 🎯 Repàs adaptatiu: retorna preguntes errònies d’un mòdul
window.getWrongQuestions=function(module){
const data=JSON.parse(localStorage.getItem('progress')||'{}')[module]||[];
return data.filter(x=>!x.correct).map(x=>x.question);
};

// 📦 Exporta progrés a fitxer JSON
window.exportProgress=function(){
const blob=new Blob([localStorage.getItem('progress')],{type:'application/json'});
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='focus-progress.json';a.click();
};

// 📥 Importa progrés (fusió amb dades existents)
window.importProgress=function(file){
const reader=new FileReader();
reader.onload=()=>{try{
const newData=JSON.parse(reader.result);
const oldData=JSON.parse(localStorage.getItem('progress')||'{}');
for(const mod in newData){
if(!oldData[mod])oldData[mod]=[];
oldData[mod]=oldData[mod].concat(newData[mod]);
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

// 🌈 Gràfic senzill de barres (Focus Pastel)
window.renderBars=function(){
const perf=getPerformance(),wrap=$('#progressBars');
if(!wrap)return;
wrap.innerHTML='';
const palette=['#8fb5ff','#7fe7c9','#c7b5ff','#ffc9a9','#ffe08a','#ffb3c1'];
let i=0;
for(const [mod,pct]of Object.entries(perf)){
const color=palette[i%palette.length];i++;
const div=document.createElement('div');
div.innerHTML=`<div style="margin:6px 0"><b>${mod}</b> ${pct}%<div style="background:#eee;border-radius:8px;overflow:hidden;height:10px;"><div style="width:${pct}%;background:${color};height:10px;border-radius:8px;"></div></div></div>`;
wrap.appendChild(div);
}
};
})();
