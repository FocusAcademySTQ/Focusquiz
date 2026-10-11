(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.FocusDailyStagnation=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  // Provisional safeguards: stagnation needs persistence across days and more than
  // one kind of signal. These are detection thresholds, not mastery thresholds.
  const POLICY=Object.freeze({minimumDays:3,minimumAttempts:4,minimumSignals:2,minimumElapsedDays:2,pauseDays:2,lessonCooldownDays:7});
  const TYPES=Object.freeze(['procedural','conceptual','help_dependence','false_fluency','difficulty_overload','undetermined']);
  const STRATEGIES=Object.freeze(['reteach','prerequisite','simplify','change_representation','new_guided_example','temporary_pause','diagnostic_confirmation','fade_help','autonomous_check','return_after_pause']);
  const STRATEGY_ORDER=Object.freeze({
    procedural:['new_guided_example','simplify','reteach','change_representation','temporary_pause'],
    conceptual:['prerequisite','reteach','change_representation','temporary_pause'],
    help_dependence:['fade_help','simplify','autonomous_check','temporary_pause'],
    false_fluency:['change_representation','autonomous_check','diagnostic_confirmation','temporary_pause'],
    difficulty_overload:['simplify','autonomous_check','change_representation','temporary_pause'],
    undetermined:['diagnostic_confirmation','change_representation','temporary_pause']
  });
  const date=v=>new Date(v||0),day=v=>String(v||'').slice(0,10),elapsed=(a,b)=>Math.max(0,Math.floor((date(day(b))-date(day(a)))/86400000));
  const key=(skillId,procedure)=>`${skillId}:${procedure}`;
  function ensure(profile){profile.stagnationStates=profile.stagnationStates&&typeof profile.stagnationStates==='object'&&!Array.isArray(profile.stagnationStates)?profile.stagnationStates:{};return profile.stagnationStates;}
  function decisions(profile,session,procedure){const historical=(profile.sessions||[]).flatMap(s=>s.decisions||[]),current=(session?.items||[]).filter(i=>i.completed&&i.pedagogicalDecision).map(i=>({...i.pedagogicalDecision,correct:i.correct,assistance:i.assistance,completedAt:i.answeredAt}));return [...historical,...current].filter(d=>d.procedure===procedure);}
  function evidence(profile,skillId,procedure){return (profile.skills?.[skillId]?.evidences||[]).filter(e=>e.procedureId===procedure&&!e.exploratory);}
  function summary(profile,session,skillId,procedure,now){
    const all=evidence(profile,skillId,procedure),attempts=all.filter(e=>e.outcome==='incorrect'||e.correct),autonomous=attempts.filter(e=>e.assistance==='none'),errors=autonomous.filter(e=>e.outcome==='incorrect'||e.correct===false),successes=autonomous.filter(e=>e.correct),assisted=attempts.filter(e=>e.assistance&&e.assistance!=='none'),route=decisions(profile,session,procedure),repairs=route.filter(d=>d.reason==='repair_after_error'),lessons=route.filter(d=>d.activityType==='lesson_sequence'||d.reason==='guided_practice'),reviews=(profile.prerequisiteReviews||[]).filter(r=>r.originalSkillId===skillId&&r.originalProcedureId===procedure),days=new Set(attempts.map(e=>day(e.at)).filter(Boolean)),formats=new Set(attempts.map(e=>e.formatId||e.formatKey).filter(Boolean)),representations=new Set(attempts.map(e=>e.format?.representation).filter(Boolean)),difficulties=attempts.map(e=>Number(e.difficulty)||1),firstDifficulty=attempts.find(e=>e.outcome==='incorrect'||(e.assistance&&e.assistance!=='none')),recent=attempts.slice(-4),recentAutonomousSuccesses=recent.filter(e=>e.correct&&e.assistance==='none'),recentErrors=recent.filter(e=>e.outcome==='incorrect'&&e.assistance==='none');
    const successRepresentations=new Set(successes.map(e=>e.format?.representation).filter(Boolean)),errorRepresentations=new Set(errors.map(e=>e.format?.representation).filter(Boolean)),falseFluencyPattern=successes.length>=3&&successRepresentations.size===1&&[...errorRepresentations].some(r=>!successRepresentations.has(r)),firstSignalAt=firstDifficulty?.at||attempts[0]?.at||now,lastPositive=successes.at(-1)?.at||null,signals={repeatedErrors:errors.length>=3,helpDependence:assisted.length>=3,failedRepairs:repairs.slice(-2).length===2&&repairs.slice(-2).every(r=>r.correct!==true||r.assistance!=='none'),falseFluencyPattern,noRecentImprovement:recentAutonomousSuccesses.length===0&&(recentErrors.length>=2||assisted.slice(-3).length>=3)};
    return {attempts,autonomous,errors,successes,assisted,route,repairs,lessons,reviews,days,formats,representations,difficulties,firstSignalAt,lastPositive,recent,recentAutonomousSuccesses,recentErrors,signals,signalCount:Object.values(signals).filter(Boolean).length,elapsedDays:elapsed(firstSignalAt,now)};
  }
  function classify(s){
    const failedPrerequisite=s.reviews.some(r=>r.result==='needs-reinforcement');
    if(failedPrerequisite)return {type:'conceptual',confidence:'high',why:'a compatible prerequisite check needs reinforcement'};
    if(s.assisted.length>=3&&s.successes.length<2)return {type:'help_dependence',confidence:'high',why:'success repeatedly depends on hints or a worked solution'};
    const successRepresentations=new Set(s.successes.map(e=>e.format?.representation).filter(Boolean)),errorRepresentations=new Set(s.errors.map(e=>e.format?.representation).filter(Boolean));
    if(s.successes.length>=3&&successRepresentations.size===1&&[...errorRepresentations].some(r=>!successRepresentations.has(r)))return {type:'false_fluency',confidence:'high',why:'autonomy is confined to one representation and another representation fails'};
    const lowestSuccess=s.successes.length?Math.min(...s.successes.map(e=>Number(e.difficulty)||1)):Infinity,highErrors=s.errors.filter(e=>(Number(e.difficulty)||1)>lowestSuccess);
    if(highErrors.length>=2)return {type:'difficulty_overload',confidence:'high',why:'lower difficulty succeeds but the higher load repeatedly fails'};
    if(s.errors.length>=3&&s.formats.size>=2)return {type:'procedural',confidence:'medium',why:'autonomous execution errors persist across more than one format'};
    return {type:'undetermined',confidence:'low',why:'difficulty persists but available evidence does not identify a reliable cause'};
  }
  function eligible(s){const interventionEvidence=s.repairs.length>=2||s.lessons.length>=1||s.reviews.length>=1||s.assisted.length>=3;return s.days.size>=POLICY.minimumDays&&s.attempts.length>=POLICY.minimumAttempts&&s.elapsedDays>=POLICY.minimumElapsedDays&&s.signalCount>=POLICY.minimumSignals&&interventionEvidence;}
  function resolution(state,s,now){const since=s.successes.filter(e=>date(e.at)>date(state.detectedAt)),recentImmediateErrors=s.recent.slice(-2).some(e=>e.outcome==='incorrect'&&e.assistance==='none');if(since.length>=2&&!recentImmediateErrors&&(new Set(since.map(e=>e.formatId||e.formatKey)).size>=2||new Set(since.map(e=>day(e.at))).size>=2))return {status:'stagnation_resolved',resolvedAt:now};if(since.length>=1)return {status:'still_learning',resolvedAt:null};return {status:'active',resolvedAt:null};}
  function inspect(profile,session,skillId,procedure,now=new Date().toISOString()){
    const states=ensure(profile),id=key(skillId,procedure),s=summary(profile,session,skillId,procedure,now),previous=states[id];
    if(previous?.detectedAt){for(const tried of previous.strategiesTried||[]){if(tried.result!=='pending')continue;const later=s.attempts.filter(e=>date(e.at)>date(tried.at));if(later.some(e=>e.correct&&e.assistance==='none'))tried.result='new_autonomy';else if(later.length)tried.result='no_improvement';}const r=resolution(previous,s,now);Object.assign(previous,r,{lastAutonomousSuccess:s.lastPositive});return {state:previous,summary:s};}
    if(!eligible(s))return {state:null,summary:s};
    const diagnosis=classify(s),state={skillId,procedure,status:'active',reason:diagnosis.type,confidence:diagnosis.confidence,detectedAt:now,trigger:{days:s.days.size,autonomousAttempts:s.autonomous.length,autonomousErrors:s.errors.length,assistedAttempts:s.assisted.length,repairs:s.repairs.length,lessonsReviewed:s.lessons.length,prerequisitesChecked:s.reviews.length,formatsAttempted:s.formats.size,difficultyRange:s.difficulties.length?[Math.min(...s.difficulties),Math.max(...s.difficulties)]:[],elapsedDays:s.elapsedDays,signals:Object.entries(s.signals).filter(([,v])=>v).map(([k])=>k),explanation:diagnosis.why},strategiesTried:[],lastAutonomousSuccess:s.lastPositive,resolvedAt:null};states[id]=state;return {state,summary:s};
  }
  function nextStrategy(state,now=new Date().toISOString()){
    if(!state||state.status==='stagnation_resolved')return null;
    const tried=state.strategiesTried||[],last=tried.at(-1),paused=last?.strategy==='temporary_pause';
    if(paused&&elapsed(last.at,now)<POLICY.pauseDays)return {strategy:'temporary_pause',action:'defer',why:`pause remains active for ${POLICY.pauseDays} days`};
    if(paused)return {strategy:'return_after_pause',action:'autonomous_check',why:'the temporary pause has elapsed; collect fresh autonomous evidence'};
    const order=STRATEGY_ORDER[state.reason]||STRATEGY_ORDER.undetermined;
    const unused=order.find(strategy=>!tried.some(t=>t.strategy===strategy));
    return unused?{strategy:unused,action:unused,why:`next untried intervention for ${state.reason}`}:{strategy:'temporary_pause',action:'defer',why:'available interventions produced no new autonomy; pause before another diagnostic cycle'};
  }
  function recordStrategy(profile,skillId,procedure,strategy,decisionId,at=new Date().toISOString()){
    const state=ensure(profile)[key(skillId,procedure)];if(!state||!STRATEGIES.includes(strategy))return null;
    if(!state.strategiesTried.some(s=>s.decisionId===decisionId))state.strategiesTried.push({strategy,decisionId,at,result:'pending'});return state;
  }
  function metrics(profile,now=new Date().toISOString()){
    const states=Object.values(ensure(profile)),resolved=states.filter(s=>s.status==='stagnation_resolved'),open=states.filter(s=>s.status!=='stagnation_resolved'),counts={};for(const s of states)for(const x of s.strategiesTried||[])counts[x.strategy]=(counts[x.strategy]||0)+1;
    const procedures=states.map(state=>{const all=evidence(profile,state.skillId,state.procedure),before=all.filter(e=>date(e.at)<=date(state.detectedAt)),after=all.filter(e=>date(e.at)>date(state.detectedAt)),firstAutonomy=after.findIndex(e=>e.correct&&e.assistance==='none'),rate=list=>list.length?Math.round(list.filter(e=>e.assistance&&e.assistance!=='none').length/list.length*100):0,autonomy=list=>list.length?Math.round(list.filter(e=>e.correct&&e.assistance==='none').length/list.length*100):0;return {skillId:state.skillId,procedure:state.procedure,status:state.status,type:state.reason,daysToDetection:state.trigger.elapsedDays,repairsBeforeDetection:state.trigger.repairs,strategies:(state.strategiesTried||[]).map(s=>s.strategy),activitiesUntilNewAutonomy:firstAutonomy<0?null:firstAutonomy+1,assistedPercentBefore:rate(before),assistedPercentAfter:rate(after),autonomyPercentBefore:autonomy(before),autonomyPercentAfter:autonomy(after)};});
    const mean=(field,source=procedures)=>source.length?Math.round(source.reduce((n,x)=>n+x[field],0)/source.length):0;return {proceduresDetected:states.length,open:open.length,resolved:resolved.length,resolutionPercent:states.length?Math.round(resolved.length/states.length*100):0,averageOpenDays:open.length?Math.round(open.reduce((n,s)=>n+elapsed(s.detectedAt,now),0)/open.length):0,strategies:counts,assistedPercentBefore:mean('assistedPercentBefore'),assistedPercentAfter:mean('assistedPercentAfter'),autonomyPercentBefore:mean('autonomyPercentBefore'),autonomyPercentAfter:mean('autonomyPercentAfter'),procedures};
  }
  return {POLICY,TYPES,STRATEGIES,STRATEGY_ORDER,ensure,summary,classify,eligible,inspect,nextStrategy,recordStrategy,metrics};
});
