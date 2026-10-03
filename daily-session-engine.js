(function(root, factory){
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.FocusDaily = api;
})(typeof window !== 'undefined' ? window : globalThis, function(){
  'use strict';

  const CONFIG = Object.freeze({
    sessionSize: 10,
    mix: { review: .3, focus: .5, challenge: .2 },
    helpAfterErrors: 2,
    consolidateAutonomous: 3,
    masteryAutonomous: 5,
    masteryMinDays: 2,
    masteryMinFormats: 1,
    reviewDelaysDays: [1, 3, 7, 14]
  });

  const CATALOG = Object.freeze({
    'calculation.muldiv': {
      id:'calculation.muldiv', title:'Multiplicació i divisió', description:'Càlcul necessari per treballar amb fraccions.',
      prerequisites:[], generator:{ module:'arithmetic', options:{ ops:['×','÷'] } }, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['arith'],contexts:[],masteryMinFormats:1}
    },
    'fractions.concept': {
      id:'fractions.concept', title:'Concepte de fracció', description:'Interpretar una part d’un tot en formats visuals.',
      prerequisites:[], generator:{ module:'fractions', options:{ sub:'identify' } }, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['grid','bar','pie'],contexts:[],masteryMinFormats:1}
    },
    'fractions.equivalence': {
      id:'fractions.equivalence', title:'Fraccions equivalents', description:'Completar fraccions multiplicant numerador i denominador pel mateix factor.',
      prerequisites:['calculation.muldiv','fractions.concept'], generator:{ module:'fractions', options:{ sub:'equivalent' } }, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['missing-term'],contexts:[],masteryMinFormats:1}
    },
    'fractions.simplification': {
      id:'fractions.simplification', title:'Simplificació', description:'Expressar una fracció en forma irreductible.',
      prerequisites:['fractions.equivalence'], generator:{ module:'fractions', options:{ sub:'simplify' } }, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['symbolic'],contexts:[],masteryMinFormats:1}
    },
    'fractions.operations': {
      id:'fractions.operations', title:'Operacions amb fraccions', description:'Sumar, restar, multiplicar i dividir fraccions.',
      prerequisites:['calculation.muldiv','fractions.equivalence'], generator:{ module:'fractions', options:{ sub:'arith' } }, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['symbolic'],contexts:[],masteryMinFormats:1}
    },
    'fractions.applications': {
      id:'fractions.applications', title:'Aplicacions de fraccions', description:'Problemes contextualitzats i multi-pas.',
      prerequisites:['fractions.operations'], generator:null, coverage:'planned'
    },
    'numbers.decimals': {
      id:'numbers.decimals', title:'Decimals i connexió amb percentatges', description:'Comparar, ordenar i relacionar decimals, fraccions i percentatges.',
      prerequisites:['fractions.equivalence'], generator:{module:'daily',activity:'decimals'}, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['compare','order','representation','application'],contexts:['discount'],masteryMinFormats:2}
    },
    'percentages.meaning': {
      id:'percentages.meaning', title:'Percentatges', description:'Calcular i interpretar percentatges en situacions quotidianes.',
      prerequisites:['numbers.decimals'], generator:{module:'daily',activity:'decimals'}, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['representation','application','compare'],contexts:['discount'],masteryMinFormats:2}
    },
    'algebra.linear': {
      id:'algebra.linear', title:'Equacions de primer grau', description:'Resoldre, completar passos i detectar errors en equacions lineals.',
      prerequisites:['calculation.muldiv'], generator:{module:'daily',activity:'equations'}, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['calculation','complete','error-detection','reasoning'],contexts:[],masteryMinFormats:2}
    },
    'geometry.measure': {
      id:'geometry.measure', title:'Àrees i perímetres', description:'Interpretar mesures i calcular àrees i perímetres en figures visuals.',
      prerequisites:['calculation.muldiv'], generator:{module:'daily',activity:'geometry'}, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['visual','application','error-detection','estimate'],contexts:['frame'],masteryMinFormats:2}
    },
    'data.interpretation': {
      id:'data.interpretation', title:'Gràfics i dades', description:'Llegir valors, comparar dades i justificar conclusions.',
      prerequisites:[], generator:{module:'daily',activity:'data'}, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['visual','compare','reasoning'],contexts:['bar-chart'],masteryMinFormats:2}
    },
    'measurement.units': {
      id:'measurement.units', title:'Unitats i conversions', description:'Convertir longituds, interpretar escales i estimar mesures.',
      prerequisites:['calculation.muldiv'], generator:{module:'daily',activity:'units'}, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['calculation','application','estimate'],contexts:['scale'],masteryMinFormats:2}
    }
  });

  function blankProgress(){ return { status:'pending', level:1, targetLevel:4, evidences:[], reviewIndex:0, nextReview:null }; }
  function createProfile(id='local'){ return { version:2, id, name:id, localOnly:true, skills:{}, sessions:[], dailySessions:[], extraSessions:[], activeSession:null, audit:[], recentSignatures:[] }; }
  function skillProgress(profile, id){
    const progress=profile.skills[id] || (profile.skills[id] = blankProgress());
    progress.masteryMinFormats=CATALOG[id]?.exerciseModel?.masteryMinFormats||CONFIG.masteryMinFormats;
    return progress;
  }
  function dayOf(value){ return String(value || '').slice(0,10); }
  function daysBetween(a,b){ return Math.floor((new Date(dayOf(b))-new Date(dayOf(a)))/86400000); }
  function autonomous(e){ return e.correct && e.assistance === 'none'; }

  function recalculate(progress, now){
    const attempts = progress.evidences;
    if (!attempts.length) return progress.status = 'pending';
    const recent = attempts.slice(-8);
    const independent = recent.filter(autonomous);
    const distinctDays = new Set(independent.map(e=>dayOf(e.at))).size;
    const distinctFormats = new Set(independent.map(e=>e.formatId).filter(Boolean)).size;
    const requiredFormats=progress.masteryMinFormats||CONFIG.masteryMinFormats;
    if (independent.length >= CONFIG.masteryAutonomous && distinctDays >= CONFIG.masteryMinDays && distinctFormats >= requiredFormats) progress.status='mastered';
    else if (independent.length >= CONFIG.consolidateAutonomous) progress.status='consolidating';
    else progress.status='learning';
    const last = attempts[attempts.length-1];
    const delay = CONFIG.reviewDelaysDays[Math.min(progress.reviewIndex, CONFIG.reviewDelaysDays.length-1)];
    progress.nextReview = new Date(new Date(last.at || now).getTime()+delay*86400000).toISOString();
    return progress.status;
  }

  function recordEvidence(profile, skillId, data, now=new Date().toISOString()){
    const progress=skillProgress(profile, skillId);
    const evidenceId=data.evidenceId || `${data.sessionId || 'session'}:${data.itemId || progress.evidences.length}`;
    const existing=progress.evidences.find(e=>e.evidenceId===evidenceId);
    if(existing)return existing;
    const evidence={ evidenceId, at:now, sessionId:data.sessionId, exerciseType:data.exerciseType, formatId:data.formatId || data.exerciseType,
      variantId:data.variantId || '', correct:!!data.correct, assistance:data.assistance || 'none',
      answerCorrect:data.answerCorrect === undefined ? !!data.correct : !!data.answerCorrect,
      justificationCorrect:data.justificationCorrect === undefined ? null : !!data.justificationCorrect,
      answer:String(data.answer ?? ''), selectionReason:data.selectionReason || '' };
    progress.evidences.push(evidence);
    if (progress.evidences.length > 100) progress.evidences.splice(0, progress.evidences.length-100);
    if (autonomous(evidence) && progress.nextReview && new Date(now)>=new Date(progress.nextReview)) progress.reviewIndex++;
    if (!evidence.correct) progress.reviewIndex=0;
    recalculate(progress, now);
    return evidence;
  }

  function prerequisiteReadiness(profile, skill){
    if (!skill.prerequisites.length) return { ready:true, support:false, missing:[] };
    const missing=skill.prerequisites.filter(id=>!['consolidating','mastered'].includes(skillProgress(profile,id).status));
    return { ready:missing.length===0, support:missing.length>0, missing };
  }

  function chooseFocus(profile){
    const available=Object.values(CATALOG).filter(s=>s.coverage==='available');
    return available.find(s=>skillProgress(profile,s.id).status!=='mastered' && prerequisiteReadiness(profile,s).ready)
      || available.find(s=>skillProgress(profile,s.id).status!=='mastered') || available[0];
  }

  function madridDay(now=new Date()){
    return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));
  }

  function archiveStaleSessions(profile, day){
    (profile.dailySessions || (profile.dailySessions=[])).forEach(s=>{
      if(s.day!==day&&s.status==='in-progress'){
        s.status='incomplete';s.archivedAt=new Date().toISOString();
        profile.audit.push({at:s.archivedAt,event:'session-archived-incomplete',sessionId:s.id});
      }
    });
    if(profile.activeSession&&profile.activeSession.day&&profile.activeSession.day!==day)profile.activeSession=null;
  }

  function planSession(profile, now=new Date().toISOString(), options={}){
    const day=madridDay(now), kind=options.kind==='extra'?'extra':'daily';
    profile.dailySessions=profile.dailySessions||[];profile.extraSessions=profile.extraSessions||[];profile.recentSignatures=profile.recentSignatures||[];
    archiveStaleSessions(profile,day);
    if(kind==='daily'){
      const existing=profile.dailySessions.find(s=>s.day===day&&['in-progress','completed'].includes(s.status));
      if(existing){profile.activeSession=existing.status==='in-progress'?existing:null;return existing;}
    }
    const focus=chooseFocus(profile);
    const noHistory=Object.values(profile.skills).every(p=>!p.evidences.length);
    const items=[];
    const due=Object.keys(CATALOG).filter(id=>{ const p=skillProgress(profile,id); return p.nextReview && new Date(p.nextReview)<=new Date(now) && CATALOG[id].coverage==='available'; });
    const reviewCount=noHistory ? 0 : Math.round(CONFIG.sessionSize*CONFIG.mix.review);
    for(let i=0;i<CONFIG.sessionSize;i++){
      let phase, skillId, reason;
      if(i<reviewCount && due.length){ phase='review'; skillId=due[i%due.length]; reason='Repàs espaiat pendent per comprovar la retenció.'; }
      else if(i<CONFIG.sessionSize-2){ phase=noHistory && i<3?'diagnostic':'focus'; skillId=focus.id; reason=phase==='diagnostic'?'Diagnòstic breu i progressiu; no pressuposa dificultats.':'Pràctica de l’habilitat principal.'; }
      else {
        phase='challenge';
        const candidates=Object.values(CATALOG).filter(s=>s.coverage==='available'&&s.id!==focus.id&&prerequisiteReadiness(profile,s).ready);
        const next=candidates.length?candidates[(profile.sessions?.length+i)%candidates.length]:null;
        skillId=next?next.id:focus.id;reason=next?'Aplicació o representació variada amb prerequisits adequats.':'Repte variat dins la cobertura disponible.';
      }
      const errors=skillProgress(profile,skillId).evidences.filter(e=>!e.correct).length;
      const formats=(CATALOG[skillId].exerciseModel?.formats||[]).filter(f=>f!=='error-detection'||errors>=2);
      const used=items.map(item=>item.formatFamily).filter(Boolean);
      const formatFamily=formats.find(f=>f!==used[used.length-1]&&!used.slice(-3).includes(f))||formats.find(f=>f!==used[used.length-1])||formats[0]||null;
      items.push({ id:`${Date.now()}-${i}`, phase, skillId, reason, formatFamily, estimatedMinutes:phase==='challenge'?2:1, completed:false });
    }
    const bucket=kind==='daily'?profile.dailySessions:profile.extraSessions;
    const session={ id:`${kind}-${day}-${new Date(now).getTime()}-${bucket.length}`, day, kind, status:'in-progress', startedAt:now, focusSkillId:focus.id, index:0, items, correct:0, assisted:0 };
    bucket.push(session);
    profile.activeSession=session;
    profile.audit.push({at:now,event:'session-planned',sessionId:session.id,kind,focusSkillId:focus.id,reasons:items.map(i=>i.reason)});
    return session;
  }

  function finishSession(profile, session, now=new Date().toISOString()){
    if(session.status==='completed')return false;
    session.status='completed';session.completedAt=now;profile.activeSession=null;
    profile.sessions=profile.sessions||[];
    if(!profile.sessions.some(s=>s.id===session.id))profile.sessions.push({id:session.id,day:session.day,kind:session.kind,startedAt:session.startedAt,completedAt:now,correct:session.correct,total:session.items.length});
    profile.audit.push({at:now,event:'session-completed',sessionId:session.id,kind:session.kind});return true;
  }

  function shouldOfferHelp(session, skillId){
    const completed=session.items.filter(i=>i.completed&&i.skillId===skillId).slice(-CONFIG.helpAfterErrors);
    return completed.length===CONFIG.helpAfterErrors && completed.every(i=>!i.correct);
  }

  return { CONFIG, CATALOG, createProfile, skillProgress, recordEvidence, recalculate, prerequisiteReadiness, chooseFocus, planSession, finishSession, archiveStaleSessions, madridDay, shouldOfferHelp, daysBetween };
});
