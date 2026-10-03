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
    promoteAfterAutonomous: 3,
    promoteMinFormats: 2,
    demoteAfterErrors: 3,
    demoteSameFormatAfter: 4,
    diagnosticProbeAfterAutonomous: 1,
    reviewDelaysDays: [1, 3, 7, 14]
  });
  const AREAS = Object.freeze(['numbers','algebra','geometry','data']);

  const CATALOG = Object.freeze({
    'calculation.muldiv': {
      id:'calculation.muldiv', area:'numbers', title:'Multiplicació i divisió', description:'Càlcul necessari per treballar amb fraccions.',
      prerequisites:[], generator:{ module:'arithmetic', options:{ ops:['×','÷'],dailyAdaptive:true } }, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['arith'],contexts:[],masteryMinFormats:1}
    },
    'fractions.concept': {
      id:'fractions.concept', area:'numbers', title:'Concepte de fracció', description:'Interpretar una part d’un tot en formats visuals.',
      prerequisites:[], generator:{ module:'fractions', options:{ sub:'identify' } }, coverage:'available', exerciseModel:{levels:[1,2],formats:['grid','bar','pie'],contexts:[],masteryMinFormats:1}
    },
    'fractions.equivalence': {
      id:'fractions.equivalence', area:'numbers', title:'Fraccions equivalents', description:'Completar fraccions multiplicant numerador i denominador pel mateix factor.',
      prerequisites:['calculation.muldiv','fractions.concept'], generator:{ module:'fractions', options:{ sub:'equivalent' } }, coverage:'available', exerciseModel:{levels:[1,2,3],formats:['missing-term'],contexts:[],masteryMinFormats:1}
    },
    'fractions.simplification': {
      id:'fractions.simplification', area:'numbers', title:'Simplificació', description:'Expressar una fracció en forma irreductible.',
      prerequisites:['fractions.equivalence'], generator:{ module:'fractions', options:{ sub:'simplify' } }, coverage:'available', exerciseModel:{levels:[1,2,3],formats:['symbolic'],contexts:[],masteryMinFormats:1}
    },
    'fractions.operations': {
      id:'fractions.operations', area:'numbers', title:'Operacions amb fraccions', description:'Sumar, restar, multiplicar i dividir fraccions.',
      prerequisites:['calculation.muldiv','fractions.equivalence'], generator:{ module:'fractions', options:{ sub:'arith' } }, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['symbolic'],contexts:[],masteryMinFormats:1}
    },
    'fractions.applications': {
      id:'fractions.applications', area:'numbers', title:'Aplicacions de fraccions', description:'Problemes contextualitzats i multi-pas.',
      prerequisites:['fractions.equivalence'], generator:{module:'daily',activity:'fractions'}, coverage:'available', exerciseModel:{levels:[1,2,3],formats:['sharing','recipe','compare-context','scale'],contexts:['sharing','recipe','reading','route'],masteryMinFormats:2}
    },
    'numbers.decimals': {
      id:'numbers.decimals', area:'numbers', title:'Decimals i connexió amb percentatges', description:'Comparar, ordenar i relacionar decimals, fraccions i percentatges.',
      prerequisites:['fractions.equivalence'], generator:{module:'daily',activity:'decimals'}, coverage:'available', exerciseModel:{levels:[1,2,3],formats:['compare','order','representation','application'],contexts:['discount'],masteryMinFormats:2}
    },
    'percentages.meaning': {
      id:'percentages.meaning', area:'numbers', title:'Percentatges', description:'Calcular i interpretar percentatges en situacions quotidianes.',
      prerequisites:['numbers.decimals'], generator:{module:'daily',activity:'decimals'}, coverage:'available', exerciseModel:{levels:[1,2,3],formats:['representation','application','increase','tax','compare'],contexts:['discount','increase','tax'],masteryMinFormats:2}
    },
    'algebra.linear': {
      id:'algebra.linear', area:'algebra', title:'Equacions de primer grau', description:'Resoldre, completar passos i detectar errors en equacions lineals.',
      prerequisites:['calculation.muldiv'], generator:{module:'daily',activity:'equations'}, coverage:'available', exerciseModel:{levels:[1,2,3,4],formats:['calculation','complete','error-detection','reasoning'],contexts:[],masteryMinFormats:2}
    },
    'geometry.measure': {
      id:'geometry.measure', area:'geometry', title:'Àrees i perímetres', description:'Interpretar mesures i calcular àrees i perímetres en figures visuals.',
      prerequisites:['calculation.muldiv'], generator:{module:'daily',activity:'geometry'}, coverage:'available', exerciseModel:{levels:[1,2,3],formats:['visual','application','error-detection','estimate'],contexts:['frame'],masteryMinFormats:2}
    },
    'data.interpretation': {
      id:'data.interpretation', area:'data', title:'Gràfics i dades', description:'Llegir valors, comparar dades i justificar conclusions.',
      prerequisites:[], generator:{module:'daily',activity:'data'}, coverage:'available', exerciseModel:{levels:[1,2,3],formats:['visual','compare','reasoning','table','trend'],contexts:['bar-chart','table','line-chart'],masteryMinFormats:2}
    },
    'measurement.units': {
      id:'measurement.units', area:'numbers', title:'Unitats i conversions', description:'Convertir longituds, interpretar escales i estimar mesures.',
      prerequisites:['calculation.muldiv'], generator:{module:'daily',activity:'units'}, coverage:'available', exerciseModel:{levels:[1,2,3],formats:['calculation','application','estimate','time','capacity'],contexts:['scale','time','capacity','length'],masteryMinFormats:2}
    }
  });

  // A format is cognitive, not cosmetic: changing numbers, names or the drawing shape
  // does not create a new format. The taxonomy is shared by evidence and audits.
  const FORMAT_TAXONOMY = Object.freeze({
    'arith-facts-division':['divide-facts','symbolic','execute',1,'numeric'], 'arith-facts-multiplication':['multiply-facts','symbolic','execute',1,'numeric'],
    'arith-two-digit-division':['written-division','symbolic','execute',1,'numeric'], 'arith-two-digit-multiplication':['written-multiplication','symbolic','execute',1,'numeric'],
    'arith-signed-division':['signed-division','symbolic','execute',1,'numeric'], 'arith-signed-multiplication':['signed-multiplication','symbolic','execute',1,'numeric'], 'arith-two-step':['mixed-calculation','symbolic','execute',2,'numeric'],
    'frac-identify-grid':['fraction-meaning','area-model','interpret',1,'choice'], 'frac-identify-bar':['fraction-meaning','area-model','interpret',1,'choice'], 'frac-identify-pie':['fraction-meaning','area-model','interpret',1,'choice'],
    'equivalent-missing-numerator':['equivalence','symbolic','complete-relation',1,'numeric'], 'equivalent-missing-denominator':['equivalence','symbolic','complete-relation',1,'numeric'],
    'frac-simplify-symbolic':['simplification','symbolic','execute',2,'fraction'], 'frac-arith-+':['add-same-or-different-denominator','symbolic','execute',2,'fraction'], 'frac-arith-−':['subtract-same-or-different-denominator','symbolic','execute',2,'fraction'], 'frac-arith-×':['multiply-fractions','symbolic','execute',2,'fraction'], 'frac-arith-÷':['divide-fractions','symbolic','transform-and-execute',3,'fraction'],
    'fraction-sharing':['fraction-as-quotient','verbal-context','model',1,'choice'], 'fraction-compare-context':['compare-same-denominator','verbal-context','interpret',1,'choice'], 'fraction-recipe':['scale-fraction','verbal-context','apply',2,'fraction'], 'fraction-scale-context':['recover-whole','verbal-context','apply',2,'choice'],
    'decimal-compare':['compare-decimals','symbolic','compare',1,'choice'], 'decimal-order':['order-decimals','number-line','order',2,'choice'], 'decimal-fraction-percent':['convert-representation','symbolic','translate',1,'choice'], 'percent-discount-context':['percentage-decrease','verbal-context','apply',2,'choice'], 'percent-increase-context':['percentage-increase','verbal-context','apply',2,'choice'], 'percent-tax-context':['percentage-increase','verbal-context','apply',2,'choice'],
    'equation-one-step':['solve-one-step','symbolic','execute',1,'numeric'], 'equation-linear':['solve-two-step','symbolic','execute',2,'numeric'], 'equation-complete-step':['solve-two-step','worked-step','complete',1,'numeric'], 'equation-both-sides':['unknown-both-sides','symbolic','execute',3,'numeric'], 'equation-parentheses':['equation-parentheses','symbolic','execute',3,'numeric'], 'equation-error-detection':['solve-two-step','worked-error','diagnose',2,'choice'], 'equation-justify':['solve-two-step','symbolic','justify',1,'choice'],
    'graph-read-value':['read-value','bar-chart','interpret',1,'choice'], 'data-table-total':['aggregate-data','table','calculate',2,'choice'], 'graph-compare':['compare-data','bar-chart','calculate',2,'choice'], 'graph-trend':['identify-trend','line-chart','interpret',2,'choice'], 'graph-read-justify':['justify-conclusion','bar-chart','justify',2,'compound-choice'],
    'units-estimate':['estimate-length','verbal','estimate',1,'choice'], 'units-length-conversion':['convert-length','symbolic','execute',1,'numeric'], 'units-scale-context':['scale-conversion','verbal-context','apply',2,'choice'], 'units-time':['convert-time','symbolic','execute',1,'numeric'], 'units-capacity':['convert-capacity','symbolic','execute',1,'numeric'], 'units-multistep':['length-multistep','verbal-context','apply',2,'numeric'],
    'geometry-visual-area':['rectangle-area','diagram','execute',1,'numeric'], 'geometry-visual-measure':['area-or-perimeter','diagram','select-and-execute',2,'numeric'], 'geometry-context':['rectangle-perimeter','verbal-diagram','apply',2,'choice'], 'geometry-unknown-side':['inverse-area','diagram','inverse',2,'numeric'], 'geometry-error-detection':['area-vs-perimeter','worked-error','diagnose',1,'choice'], 'geometry-estimate':['rectangle-area','diagram','estimate',1,'choice']
  });
  function describeFormat(input, exerciseType=''){
    const exercise=typeof input==='object'&&input?input:null,formatId=exercise?.formatId||input;
    let key=String(formatId||'unspecified');
    if(key.startsWith('frac-identify-'))key=`frac-identify-${key.slice(14)}`;
    const row=[...(FORMAT_TAXONOMY[key]||['unspecified','unspecified','unspecified',1,exerciseType||exercise?.type||'unspecified'])];
    if(/^frac-arith-[+−-]$/.test(key))row[0]=`${key.includes('+')?'add':'subtract'}-${exercise?.denominatorsDifferent?'different':'same'}-denominator`;
    const [procedure,representation,reasoning,steps,responseType]=row;
    // Context is descriptive, but only enters the identity when it changes the
    // mathematical procedure (already represented by `procedure`).
    return {procedure,representation,reasoning,context:key.includes('context')?'contextual':'none',steps,responseType,formatKey:[procedure,representation,reasoning,steps,responseType].join('|')};
  }

  function blankProgress(){ return { status:'pending', evidenceState:'pending', estimatedLevel:1, confidence:0, level:1, targetLevel:4, evidences:[], retention:{days:{},formats:{}}, levelRun:{level:1,autonomous:0,errors:0,unknown:0,autonomousFormats:{},errorFormats:{}}, reviewIndex:0, nextReview:null }; }
  function createProfile(id='local'){ return { version:2, id, name:id, localOnly:true, skills:{}, sessions:[], dailySessions:[], extraSessions:[], activeSession:null, audit:[], recentSignatures:[] }; }
  function skillProgress(profile, id){
    const progress=profile.skills[id] || (profile.skills[id] = blankProgress());
    progress.evidences=progress.evidences||[];
    progress.retention=progress.retention||{days:{},formats:{}};
    if(progress.formatTaxonomyVersion!==1){
      progress.retention.formats={};
      progress.evidences.forEach(e=>{const raw=e.rawFormatId||e.formatId||e.exerciseType,format=describeFormat(raw,e.exerciseType);e.rawFormatId=raw;e.format=format;e.procedureId=e.procedureId||format.procedure;e.formatId=format.formatKey;if(autonomous(e))progress.retention.formats[e.formatId]=(progress.retention.formats[e.formatId]||0)+1;});
      progress.levelRun={level:progress.estimatedLevel||progress.level||1,autonomous:0,errors:0,unknown:0,autonomousFormats:{},errorFormats:{}};
      progress.formatTaxonomyVersion=1;
    }
    if(!Object.keys(progress.retention.days).length&&progress.evidences.length)progress.evidences.filter(autonomous).forEach(e=>{progress.retention.days[dayOf(e.at)]=(progress.retention.days[dayOf(e.at)]||0)+1;if(e.formatId)progress.retention.formats[e.formatId]=(progress.retention.formats[e.formatId]||0)+1;});
    progress.levelRun=progress.levelRun||{level:progress.estimatedLevel||progress.level||1,autonomous:0,errors:0,unknown:0,autonomousFormats:{},errorFormats:{}};
    progress.levelRun.autonomousFormats=progress.levelRun.autonomousFormats||{};progress.levelRun.errorFormats=progress.levelRun.errorFormats||{};
    if(progress.estimatedLevel===undefined)progress.estimatedLevel=progress.level||1;
    if(progress.confidence===undefined)progress.confidence=Math.min(1,progress.evidences.length/6);
    if(!progress.evidenceState)progress.evidenceState=progress.evidences.length?'insufficient':'pending';
    progress.masteryMinFormats=CATALOG[id]?.exerciseModel?.masteryMinFormats||CONFIG.masteryMinFormats;
    return progress;
  }
  function dayOf(value){ return String(value || '').slice(0,10); }
  function daysBetween(a,b){ return Math.floor((new Date(dayOf(b))-new Date(dayOf(a)))/86400000); }
  function autonomous(e){ return e.correct && e.assistance === 'none'; }

  function recalculate(progress, now){
    const attempts = progress.evidences;
    if (!attempts.length) return progress.status = 'pending';
    // Finestra prou ampla per conservar evidències de més d'un dia encara
    // que una sessió concentri diversos exercicis de la mateixa habilitat.
    const recent = attempts.slice(-30);
    const independent = recent.filter(autonomous),incorrect=recent.filter(e=>e.outcome==='incorrect'&&e.assistance==='none');
    const distinctDays = Object.keys(progress.retention?.days||{}).length;
    const distinctFormats = Object.keys(progress.retention?.formats||{}).length;
    const requiredFormats=progress.masteryMinFormats||CONFIG.masteryMinFormats;
    if (independent.length >= CONFIG.masteryAutonomous && distinctDays >= CONFIG.masteryMinDays && distinctFormats >= requiredFormats) progress.status='mastered';
    else if (independent.length >= CONFIG.consolidateAutonomous) progress.status='consolidating';
    else progress.status='learning';
    const informative=recent.filter(e=>e.outcome!=='unknown');
    progress.confidence=Math.min(1,Math.round((informative.length/6)*100)/100);
    if(!attempts.length)progress.evidenceState='pending';
    else if(informative.length<2)progress.evidenceState='insufficient';
    else if(incorrect.length>=2&&incorrect.length>independent.length)progress.evidenceState='difficulty';
    else progress.evidenceState='sufficient';
    progress.level=progress.estimatedLevel;
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
    const outcome=data.outcome||((data.correct)?'correct':'incorrect');
    const format=describeFormat(data.formatId || data.exerciseType,data.exerciseType);
    const evidence={ evidenceId, at:now, sessionId:data.sessionId, exerciseType:data.exerciseType, rawFormatId:data.formatId || data.exerciseType, formatId:data.formatKey || format.formatKey, procedureId:data.procedureId || format.procedure, format,
      variantId:data.variantId || '', outcome, difficulty:data.difficulty||1, correct:outcome==='correct', assistance:data.assistance || 'none',
      answerCorrect:data.answerCorrect === undefined ? !!data.correct : !!data.answerCorrect,
      justificationCorrect:data.justificationCorrect === undefined ? null : !!data.justificationCorrect,
      answer:String(data.answer ?? ''), selectionReason:data.selectionReason || '' };
    progress.evidences.push(evidence);
    if (progress.evidences.length > 100) progress.evidences.splice(0, progress.evidences.length-100);
    if(autonomous(evidence)){
      progress.retention.days[dayOf(evidence.at)]=(progress.retention.days[dayOf(evidence.at)]||0)+1;
      if(evidence.formatId)progress.retention.formats[evidence.formatId]=(progress.retention.formats[evidence.formatId]||0)+1;
    }
    const coverage=CATALOG[skillId]?.exerciseModel?.levels||[1];
    const actualLevel=Number(evidence.difficulty)||progress.estimatedLevel||1;
    if(progress.levelRun.level!==actualLevel)progress.levelRun={level:actualLevel,autonomous:0,errors:0,unknown:0,autonomousFormats:{},errorFormats:{}};
    if(autonomous(evidence)){progress.levelRun.autonomous++;progress.levelRun.errors=Math.max(0,progress.levelRun.errors-1);progress.levelRun.autonomousFormats[evidence.formatId||'default']=true;}
    else if(outcome==='incorrect'&&evidence.assistance==='none'){progress.levelRun.errors++;progress.levelRun.autonomous=Math.max(0,progress.levelRun.autonomous-1);progress.levelRun.errorFormats[evidence.formatId||'default']=true;}
    else if(outcome==='unknown')progress.levelRun.unknown++;
    const currentIndex=Math.max(0,coverage.indexOf(progress.estimatedLevel));
    let changeReason='no-change';
    const promoteFormats=Math.min(CONFIG.promoteMinFormats,progress.masteryMinFormats||1);
    if(progress.levelRun.autonomous>=CONFIG.promoteAfterAutonomous&&Object.keys(progress.levelRun.autonomousFormats).length>=promoteFormats&&currentIndex<coverage.length-1){progress.estimatedLevel=coverage[currentIndex+1];progress.levelRun={level:progress.estimatedLevel,autonomous:0,errors:0,unknown:0,autonomousFormats:{},errorFormats:{}};changeReason='diverse-autonomous-success';}
    else if(progress.levelRun.errors>=CONFIG.demoteAfterErrors&&(Object.keys(progress.levelRun.errorFormats).length>=2||progress.levelRun.errors>=CONFIG.demoteSameFormatAfter)&&currentIndex>0){progress.estimatedLevel=coverage[currentIndex-1];progress.levelRun={level:progress.estimatedLevel,autonomous:0,errors:0,unknown:0,autonomousFormats:{},errorFormats:{}};changeReason='repeated-errors-across-formats';}
    progress.lastLevelChangeReason=changeReason;
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
  function supportedDifficulty(skillId,requested){
    const levels=CATALOG[skillId]?.exerciseModel?.levels||[1];
    const wanted=Number(requested)||levels[0];
    return levels.reduce((best,level)=>level<=wanted?level:best,levels[0]);
  }

  function chooseFocus(profile){
    const available=Object.values(CATALOG).filter(s=>s.coverage==='available');
    const ready=available.filter(s=>skillProgress(profile,s.id).status!=='mastered'&&prerequisiteReadiness(profile,s).ready);
    const recentFocus=(profile.sessions||[]).slice(-3).map(s=>s.focusSkillId);
    const repeated=recentFocus.length===3&&recentFocus.every(id=>id===recentFocus[0])?recentFocus[0]:null;
    const ranked=ready.sort((a,b)=>{
      const pa=skillProgress(profile,a.id),pb=skillProgress(profile,b.id);
      const need=p=>p.evidenceState==='difficulty'?0:p.evidenceState==='insufficient'?1:p.evidenceState==='pending'?2:3;
      const areaCount=area=>available.filter(s=>s.area===area).reduce((n,s)=>n+skillProgress(profile,s.id).evidences.length,0);
      return need(pa)-need(pb)||areaCount(a.area)-areaCount(b.area)||pa.evidences.length-pb.evidences.length;
    });
    const rotated=repeated&&ranked.length>1?ranked.find(s=>s.id!==repeated):ranked[0];
    return rotated || available.find(s=>skillProgress(profile,s.id).status!=='mastered')
      || available[(profile.sessions?.length||0)%available.length];
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
    const introductions={numbers:'fractions.concept',algebra:'algebra.linear',geometry:'geometry.measure',data:'data.interpretation'};
    const unknownSkills=Object.values(CATALOG).filter(s=>s.coverage==='available'&&skillProgress(profile,s.id).evidences.length===0&&prerequisiteReadiness(profile,s).ready);
    const areaEvidence=area=>Object.values(CATALOG).filter(s=>s.area===area).reduce((n,s)=>n+skillProgress(profile,s.id).evidences.length,0);
    unknownSkills.sort((a,b)=>areaEvidence(a.area)-areaEvidence(b.area)||AREAS.indexOf(a.area)-AREAS.indexOf(b.area));
    const progressive=AREAS.filter(area=>areaEvidence(area)===0).map(area=>introductions[area]).slice(0,2);
    for(const skill of unknownSkills){if(progressive.length>=2)break;if(!progressive.some(id=>CATALOG[id].area===skill.area))progressive.push(skill.id);}
    for(const skill of unknownSkills){if(progressive.length>=2)break;if(!progressive.includes(skill.id))progressive.push(skill.id);}
    const explorationSkills=noHistory?AREAS.map(area=>introductions[area]):progressive;
    const due=Object.keys(CATALOG).filter(id=>{ const p=skillProgress(profile,id); return p.nextReview && new Date(p.nextReview)<=new Date(now) && CATALOG[id].coverage==='available'; });
    const reviewCount=noHistory ? 0 : Math.round(CONFIG.sessionSize*CONFIG.mix.review);
    for(let i=0;i<CONFIG.sessionSize;i++){
      let phase, skillId, reason;
      if(i<explorationSkills.length){phase='diagnostic';skillId=explorationSkills[i];reason=`Exploració introductòria de l’àrea ${CATALOG[skillId].area}; una resposta no determina el nivell de l’àrea.`;}
      else if(i<explorationSkills.length+reviewCount && due.length){ phase='review'; skillId=due[(i-explorationSkills.length)%due.length]; reason='Repàs espaiat pendent per comprovar la retenció.'; }
      else if(i<CONFIG.sessionSize-2){ phase='focus'; skillId=focus.id; reason='Pràctica ajustada a les evidències de l’habilitat principal.'; }
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
      const requestedDifficulty=phase==='diagnostic'?1:skillProgress(profile,skillId).estimatedLevel||1;
      const difficulty=supportedDifficulty(skillId,requestedDifficulty);
      items.push({ id:`${Date.now()}-${i}`, phase, skillId, primarySkillId:skillId, reason, formatFamily, requestedDifficulty, difficulty, coverageLimited:difficulty!==requestedDifficulty, estimatedMinutes:phase==='challenge'?2:1, completed:false });
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
    if(!profile.sessions.some(s=>s.id===session.id))profile.sessions.push({id:session.id,day:session.day,kind:session.kind,focusSkillId:session.focusSkillId,startedAt:session.startedAt,completedAt:now,correct:session.correct,total:session.items.length});
    profile.audit.push({at:now,event:'session-completed',sessionId:session.id,kind:session.kind});return true;
  }

  function adaptRemainingItems(profile,session,completedItem,now=new Date().toISOString()){
    if(session.status==='completed')return [];
    const progress=skillProgress(profile,completedItem.skillId),changes=[];
    const levels=CATALOG[completedItem.skillId]?.exerciseModel?.levels||[1];
    let requested=progress.estimatedLevel;
    let reason='pràctica-ajustada';
    if(completedItem.phase==='diagnostic'&&completedItem.outcome==='correct'&&completedItem.assistance==='none'){
      const idx=levels.indexOf(completedItem.difficulty);requested=levels[Math.min(levels.length-1,Math.max(0,idx)+1)];reason='exploració-superior-diagnòstica';
    }else if(completedItem.assistance==='solution'){requested=progress.estimatedLevel;reason='comprovació-després-solució';}
    else if(progress.lastLevelChangeReason?.startsWith('repeated-errors')||completedItem.outcome==='unknown'){requested=progress.estimatedLevel;reason=completedItem.outcome==='unknown'?'suport-després-no-ho-sé':'reforç-després-errors-repetits';}
    session.items.forEach((item,index)=>{
      if(index<=session.index||item.completed||item.presented||item.exercise||item.skillId!==completedItem.skillId)return;
      const actual=supportedDifficulty(item.skillId,requested);
      if(item.difficulty!==actual||item.reason!==reason){changes.push({itemId:item.id,before:item.difficulty,requested,after:actual,reason});item.requestedDifficulty=requested;item.difficulty=actual;item.coverageLimited=actual!==requested;item.reason=reason;item.adaptedAt=now;}
    });
    if(completedItem.assistance==='solution'){
      const check=session.items.find((item,index)=>index>session.index&&!item.presented&&!item.completed&&!item.exercise&&item.skillId===completedItem.skillId);
      if(check){check.phase='verification';check.formatFamily=completedItem.formatFamily||check.formatFamily;check.reason='Comprovació autònoma del mateix procediment amb dades noves.';check.verifiesItemId=completedItem.id;check.mustDifferFromVariant=completedItem.exercise?.variantId||completedItem.variantId||'';changes.push({itemId:check.id,reason:'comprovació-autònoma-després-solució',formatFamily:check.formatFamily});}
    }
    if((progress.lastLevelChangeReason?.startsWith('repeated-errors')||completedItem.outcome==='unknown')&&CATALOG[completedItem.skillId].prerequisites.length){
      const prerequisite=CATALOG[completedItem.skillId].prerequisites.find(id=>skillProgress(profile,id).status!=='mastered');
      const candidate=session.items.find((item,index)=>index>session.index&&!item.presented&&!item.completed&&!item.exercise&&item.phase==='focus');
      if(prerequisite&&candidate){changes.push({itemId:candidate.id,beforeSkill:candidate.skillId,afterSkill:prerequisite,reason:'comprovació-prerequisit'});candidate.skillId=prerequisite;candidate.primarySkillId=prerequisite;candidate.phase='reinforcement';candidate.reason='Comprovació d’un prerequisit després de dificultats repetides.';candidate.requestedDifficulty=skillProgress(profile,prerequisite).estimatedLevel;candidate.difficulty=supportedDifficulty(prerequisite,candidate.requestedDifficulty);candidate.formatFamily=CATALOG[prerequisite].exerciseModel.formats[0];}
    }
    if(changes.length)profile.audit.push({at:now,event:'future-items-adapted',sessionId:session.id,skillId:completedItem.skillId,estimatedLevel:progress.estimatedLevel,confidence:progress.confidence,changes});
    return changes;
  }

  function shouldOfferHelp(session, skillId){
    const completed=session.items.filter(i=>i.completed&&i.skillId===skillId).slice(-CONFIG.helpAfterErrors);
    return completed.length===CONFIG.helpAfterErrors && completed.every(i=>!i.correct);
  }

  return { CONFIG, AREAS, CATALOG, FORMAT_TAXONOMY, describeFormat, createProfile, skillProgress, recordEvidence, recalculate, prerequisiteReadiness, supportedDifficulty, chooseFocus, planSession, adaptRemainingItems, finishSession, archiveStaleSessions, madridDay, shouldOfferHelp, daysBetween };
});
