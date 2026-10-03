(function(){
  'use strict';
  const STORAGE='focusquiz-daily-profile-v1';
  const $=s=>document.querySelector(s);
  let profile=load(), session, exercise, assistance='none', answered=false, lastSignature='';
  const copy={
    'calculation.muldiv':{hint:'Pensa en la taula de multiplicar relacionada. En una divisió, busca quin nombre multiplicat pel divisor dona el dividend.',example:'Exemple: 24 ÷ 6 = 4 perquè 6 × 4 = 24.'},
    'fractions.concept':{hint:'Compta totes les parts iguals (denominador) i després les pintades (numerador). Simplifica si comparteixen divisor.',example:'Si 3 de 6 parts són pintades: 3/6 = 1/2.'},
    'fractions.equivalence':{hint:'El numerador i el denominador s’han de multiplicar pel mateix nombre.',example:'2/3 = 8/12 perquè hem multiplicat tots dos nombres per 4.'},
    'fractions.simplification':{hint:'Busca un nombre que divideixi exactament el numerador i el denominador.',example:'12/18: dividim tots dos per 6 i obtenim 2/3.'},
    'fractions.operations':{hint:'Per sumar o restar, usa denominador comú. Per multiplicar, opera en línia. Per dividir, multiplica per la inversa.',example:'1/2 + 1/3 = 3/6 + 2/6 = 5/6.'}
  };
  function load(){ try{return Object.assign(FocusDaily.createProfile(),JSON.parse(localStorage.getItem(STORAGE)||'null')||{});}catch(_){return FocusDaily.createProfile();} }
  function save(){ localStorage.setItem(STORAGE,JSON.stringify(profile)); }
  function normalize(v){
    let x=String(v).trim().replace(/,/g,'.').replace(/\s/g,'');
    if(!x.includes('/')) return x;
    const [n,d]=x.split('/').map(Number); if(!Number.isFinite(n)||!Number.isFinite(d)||!d)return x;
    let a=Math.abs(n),b=Math.abs(d); while(b)[a,b]=[b,a%b]; const g=a||1; return `${n/g}/${d/g}`;
  }
  function generate(item){
    const skill=FocusDaily.CATALOG[item.skillId], gen=FocusMathGenerators[skill.generator.module];
    let next; for(let i=0;i<6;i++){next=gen(FocusDaily.skillProgress(profile,item.skillId).level,skill.generator.options); const sig=next.type+next.text; if(sig!==lastSignature){lastSignature=sig;break;}}
    return next;
  }
  function renderCoverage(){ const covered=Object.values(FocusDaily.CATALOG).filter(s=>s.coverage==='available'); $('#coverage').innerHTML=`<div class="coverage"><strong>Cobertura inicial real</strong><p>${covered.map(s=>s.title).join(' · ')}</p><small>Els problemes contextualitzats de fraccions encara estan planificats i no es presenten com a coberts.</small></div>`; }
  function begin(){ session=FocusDaily.planSession(profile); save(); $('#intro').hidden=true;$('#summary').hidden=true;$('#activity').hidden=false; renderItem(); }
  function renderItem(){
    while(session.index<session.items.length&&session.items[session.index].completed)session.index++;
    if(session.index>=session.items.length)return finish();
    const item=session.items[session.index], skill=FocusDaily.CATALOG[item.skillId]; exercise=generate(item); assistance='none';answered=false;
    $('#phase').textContent={review:'Repàs',focus:'Pràctica',challenge:'Aplicació',diagnostic:'Diagnòstic breu'}[item.phase]; $('#step').textContent=`${session.index+1} de ${session.items.length}`; $('#bar').style.width=`${session.index/session.items.length*100}%`;
    $('#reason').textContent=item.reason; $('#skill').textContent=skill.title; $('#question').innerHTML=`${exercise.html||''}<div>${exercise.text}</div>`;
    $('#answerForm').hidden=false; $('#answer').value=''; $('#feedback').textContent='';$('#support').hidden=true;$('#next').hidden=true;
    if(FocusDaily.shouldOfferHelp(session,item.skillId)){ assistance='hint'; showSupport('Hem detectat diverses dificultats. Fem una pausa amb suport: '+copy[item.skillId].example); }
    $('#answer').focus(); save();
  }
  function showSupport(text){$('#support').textContent=text;$('#support').hidden=false;}
  $('#hint').onclick=()=>{if(!answered){assistance=assistance==='solution'?'solution':'hint';showSupport(copy[session.items[session.index].skillId].hint);save();}};
  $('#solution').onclick=()=>{if(!answered){assistance='solution';showSupport(copy[session.items[session.index].skillId].example);save();}};
  $('#answerForm').onsubmit=e=>{e.preventDefault();if(answered)return; answered=true;const item=session.items[session.index], value=$('#answer').value, correct=normalize(value)===normalize(exercise.answer);
    Object.assign(item,{completed:true,correct,assistance,answer:value,exerciseType:exercise.type}); session.correct+=correct?1:0;session.assisted+=assistance==='none'?0:1;
    FocusDaily.recordEvidence(profile,item.skillId,{sessionId:session.id,exerciseType:exercise.type,correct,assistance,answer:value,selectionReason:item.reason});
    $('#feedback').innerHTML=correct?'<strong>Correcte.</strong> Bona feina.':`<strong>Encara no.</strong> La resposta és <b>${exercise.answer}</b>. Repassarem aquesta habilitat sense encadenar errors.`;
    $('#answerForm').hidden=true;$('#next').hidden=false;save(); };
  $('#next').onclick=()=>{session.index++;save();renderItem();};
  function finish(){session.completedAt=new Date().toISOString();profile.sessions.push({id:session.id,startedAt:session.startedAt,completedAt:session.completedAt,correct:session.correct,total:session.items.length});profile.activeSession=null;save();
    const rows=Object.values(FocusDaily.CATALOG).filter(s=>s.coverage==='available').map(s=>`<li><span>${s.title}</span><b>${({pending:'Pendent d’avaluar',learning:'En aprenentatge',consolidating:'Consolidant',mastered:'Dominada'})[FocusDaily.skillProgress(profile,s.id).status]}</b></li>`).join('');
    $('#activity').hidden=true;$('#summary').hidden=false;$('#summaryBody').innerHTML=`<p><strong>${session.correct} de ${session.items.length}</strong> respostes correctes; ${session.assisted} amb ajuda. Les respostes amb pista o solució no compten com a autònomes.</p><ul class="skill-list">${rows}</ul><p class="note">“Dominada” exigeix almenys 5 evidències autònomes en 2 dies diferents. Els repassos futurs comproven la retenció.</p>`; }
  $('#newSession').onclick=()=>{location.href='app.html';}; $('#start').onclick=begin; renderCoverage();
})();
