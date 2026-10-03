(function(){
  'use strict';
  const $=s=>document.querySelector(s);
  let profile,session,exercise,assistance='none',answered=false;
  const copy={
    'calculation.muldiv':{hints:['Relaciona la divisió amb una multiplicació.','Busca quin nombre multiplicat pel divisor dona el dividend.'],example:'Exemple: 24 ÷ 6 = 4 perquè 6 × 4 = 24.'},
    'fractions.concept':{hints:['Compta primer totes les parts iguals.','El denominador és el total i el numerador són les parts pintades.'],example:'Si 3 de 6 parts són pintades: 3/6 = 1/2.'},
    'fractions.equivalence':{hints:['Observa per quin factor ha canviat un dels nombres.','Multiplica numerador i denominador pel mateix factor.'],example:'2/3 = 8/12 perquè hem multiplicat tots dos nombres per 4.'},
    'fractions.simplification':{hints:['Busca un divisor comú petit.','Divideix numerador i denominador pel mateix nombre fins que no puguis més.'],example:'12/18: dividim tots dos per 6 i obtenim 2/3.'},
    'fractions.operations':{hints:['Identifica primer l’operació.','En suma o resta usa denominador comú; en divisió multiplica per la inversa.'],example:'1/2 + 1/3 = 3/6 + 2/6 = 5/6.'}
  };
  function save(){FocusProfiles.saveProfile(localStorage,profile);}
  function normalize(v){let x=String(v).trim().replace(/,/g,'.').replace(/\s/g,'');if(!x.includes('/'))return x;const [n,d]=x.split('/').map(Number);if(!Number.isFinite(n)||!Number.isFinite(d)||!d)return x;let a=Math.abs(n),b=Math.abs(d);while(b)[a,b]=[b,a%b];const g=a||1;return `${n/g}/${d/g}`;}
  function signature(q){return `${q.type}|${q.text.replace(/<[^>]*>/g,'')}`;}
  function generate(item){
    if(item.exercise)return item.exercise;
    const skill=FocusDaily.CATALOG[item.skillId],gen=FocusMathGenerators[skill.generator.module],recent=new Set(profile.recentSignatures||[]);let next;
    for(let i=0;i<15;i++){next=gen(FocusDaily.skillProgress(profile,item.skillId).level,skill.generator.options);if(!recent.has(signature(next)))break;}
    item.exercise={type:next.type,text:next.text,html:next.html||'',answer:String(next.answer),formatId:next.formatId||next.type,variantId:signature(next)};
    profile.recentSignatures=[...(profile.recentSignatures||[]),item.exercise.variantId].slice(-40);save();return item.exercise;
  }
  function selectProfile(id){if(!FocusProfiles.setActive(localStorage,id))return;profile=FocusProfiles.loadProfile(localStorage,id,FocusDaily.createProfile);$('#activeProfile').textContent=`Alumne: ${profile.name||id}`;$('#profileDialog').hidden=true;showEntry();}
  function showProfiles(){const profiles=FocusProfiles.list(localStorage);$('#profileList').innerHTML=profiles.map(p=>`<button type="button" data-profile="${escapeHtml(p.id)}">${escapeHtml(p.name)}</button>`).join('');$('#profileDialog').hidden=false;$('#profileList').querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>selectProfile(b.dataset.profile));}
  function escapeHtml(v){const d=document.createElement('div');d.textContent=v;return d.innerHTML;}
  function boot(){const id=FocusProfiles.activeId(localStorage);if(!id){showProfiles();return;}selectProfile(id);}
  function showEntry(){session=FocusDaily.planSession(profile);save();if(session.status==='completed')showSummary(true);else{$('#intro').hidden=false;$('#activity').hidden=true;$('#summary').hidden=true;$('#start').textContent=session.items.some(i=>i.completed)?'Reprèn la sessió':'Comença la sessió';}}
  function begin(){session=FocusDaily.planSession(profile);save();if(session.status==='completed')return showSummary(true);$('#intro').hidden=true;$('#summary').hidden=true;$('#activity').hidden=false;renderItem();}
  function renderItem(){while(session.index<session.items.length&&session.items[session.index].completed)session.index++;if(session.index>=session.items.length)return finish();const item=session.items[session.index],skill=FocusDaily.CATALOG[item.skillId];exercise=generate(item);assistance=item.draftAssistance||'none';answered=false;
    $('#phase').textContent={review:'Repàs',focus:'Pràctica',challenge:'Aplicació',diagnostic:'Diagnòstic breu'}[item.phase];$('#step').textContent=`${session.index+1} de ${session.items.length}`;$('#bar').style.width=`${session.index/session.items.length*100}%`;$('#reason').textContent=item.reason;$('#skill').textContent=skill.title;$('#question').innerHTML=`${exercise.html}<div>${exercise.text}</div>`;$('#answerForm').hidden=false;$('#answer').value=item.draftAnswer||'';$('#feedback').textContent='';$('#support').hidden=true;$('#next').hidden=true;
    if(FocusDaily.shouldOfferHelp(session,item.skillId)){assistance='hint';item.draftAssistance='hint';showSupport('Hem detectat diverses dificultats. '+copy[item.skillId].example);}$('#answer').focus();save();}
  function showSupport(text){$('#support').textContent=text;$('#support').hidden=false;}
  $('#hint').onclick=()=>{if(answered)return;const item=session.items[session.index],used=item.hintsUsed||0;item.hintsUsed=Math.min(used+1,copy[item.skillId].hints.length);assistance='hint';item.draftAssistance=assistance;showSupport(copy[item.skillId].hints[Math.min(used,copy[item.skillId].hints.length-1)]);save();};
  $('#solution').onclick=()=>{if(answered)return;const item=session.items[session.index];assistance='solution';item.draftAssistance=assistance;item.solutionViewed=true;showSupport(copy[item.skillId].example);save();};
  $('#answer').oninput=()=>{if(session){session.items[session.index].draftAnswer=$('#answer').value;save();}};
  $('#answerForm').onsubmit=e=>{e.preventDefault();if(answered)return;answered=true;const item=session.items[session.index],value=$('#answer').value,correct=normalize(value)===normalize(exercise.answer);Object.assign(item,{completed:true,correct,assistance,answer:value,answeredAt:new Date().toISOString(),exerciseType:exercise.type});delete item.draftAnswer;delete item.draftAssistance;session.correct+=correct?1:0;session.assisted+=assistance==='none'?0:1;
    if(!item.evidenceRecorded){FocusDaily.recordEvidence(profile,item.skillId,{evidenceId:`${session.id}:${item.id}`,itemId:item.id,sessionId:session.id,exerciseType:exercise.type,correct,assistance,answer:value,selectionReason:item.reason,formatId:exercise.formatId,variantId:exercise.variantId});item.evidenceRecorded=true;}
    $('#feedback').innerHTML=correct?'<strong>Correcte.</strong> Bona feina.':`<strong>Encara no.</strong> La resposta és <b>${exercise.answer}</b>. Repassarem aquesta habilitat sense encadenar errors.`;$('#answerForm').hidden=true;$('#next').hidden=false;save();};
  $('#next').onclick=()=>{session.index++;save();renderItem();};
  function finish(){FocusDaily.finishSession(profile,session);save();showSummary(false);}
  function showSummary(already){session=session||FocusDaily.planSession(profile);$('#intro').hidden=true;$('#activity').hidden=true;$('#summary').hidden=false;$('#summaryTitle').textContent=already&&session.kind==='daily'?'Ja has completat la sessió d’avui':'El teu progrés d’avui';const rows=Object.values(FocusDaily.CATALOG).filter(s=>s.coverage==='available').map(s=>`<li><span>${s.title}</span><b>${({pending:'Pendent d’avaluar',learning:'En aprenentatge',consolidating:'Consolidant',mastered:'Dominada'})[FocusDaily.skillProgress(profile,s.id).status]}</b></li>`).join('');$('#summaryBody').innerHTML=`<p><strong>${session.correct} de ${session.items.length}</strong> respostes correctes; ${session.assisted} amb ajuda. Les respostes amb ajuda no compten com a autònomes.</p><ul class="skill-list">${rows}</ul><p class="note">La pràctica extra aporta evidències, però no substitueix la sessió diària ni compta com un altre dia.</p>`;}
  $('#extraSession').onclick=()=>{session=FocusDaily.planSession(profile,new Date().toISOString(),{kind:'extra'});save();$('#summary').hidden=true;$('#activity').hidden=false;renderItem();};
  $('#start').onclick=begin;$('#switchProfile').onclick=showProfiles;$('#profileForm').onsubmit=e=>{e.preventDefault();const made=FocusProfiles.create(localStorage,$('#profileName').value);if(made)selectProfile(made.id);};
  const covered=Object.values(FocusDaily.CATALOG).filter(s=>s.coverage==='available');$('#coverage').innerHTML=`<div class="coverage"><strong>Cobertura inicial real</strong><p>${covered.map(s=>s.title).join(' · ')}</p><small>Les aplicacions contextualitzades encara estan planificades.</small></div>`;boot();
})();
