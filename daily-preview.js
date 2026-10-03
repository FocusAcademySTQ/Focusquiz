(function(){
  'use strict';
  const definitions={decimals:['compare','order','representation','application','increase','tax'],fractions:['sharing','recipe','compare-context','scale'],equations:['calculation','complete','error-detection','reasoning'],data:['visual','compare','reasoning','table','trend'],units:['calculation','application','estimate','time','capacity'],geometry:['visual','application','error-detection','estimate']};
  const activity=document.querySelector('#previewActivity'),format=document.querySelector('#previewFormat'),level=document.querySelector('#previewLevel');
  Object.keys(definitions).forEach(id=>activity.add(new Option(id,id)));
  function formats(){format.replaceChildren(...definitions[activity.value].map(id=>new Option(id,id)));render();}
  function render(){const q=FocusDailyActivities[activity.value](Number(level.value),{formatFamily:format.value});document.querySelector('#previewMeta').textContent=`${q.templateId||q.formatId} · format ${q.formatId} · dificultat ${q.difficulty||level.value}`;document.querySelector('#previewQuestion').innerHTML=`${q.html||''}<div>${q.text}</div>`;document.querySelector('#previewChoices').innerHTML=(q.choices||[]).map(c=>`<button class="answer-option" type="button">${c}</button>`).join('');document.querySelector('#previewHelp').innerHTML=`${(q.hints||[]).map((h,i)=>`<p><strong>Pista ${i+1}:</strong> ${h}</p>`).join('')}<p><strong>Resposta:</strong> ${q.answer}</p>${q.justificationAnswer?`<p><strong>Justificació:</strong> ${q.justificationAnswer}</p>`:''}<p><strong>Explicació:</strong> ${q.explanation||''}</p>`;}
  activity.onchange=formats;format.onchange=render;level.onchange=render;document.querySelector('#previewNew').onclick=render;formats();
})();
