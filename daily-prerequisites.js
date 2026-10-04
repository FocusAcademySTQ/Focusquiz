(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.FocusDailyPrerequisites=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  // Only dependencies with an exercisable prerequisite already present in the bank.
  const RECHECK_COOLDOWN_DAYS=7;
  const DEPENDENCIES=Object.freeze({
    'add-different-denominator':[{skillId:'fractions.equivalence',formatFamily:'missing-term',reason:'Per sumar parts de mida diferent cal construir fraccions equivalents.'}],
    'subtract-different-denominator':[{skillId:'fractions.equivalence',formatFamily:'missing-term',reason:'Per restar parts de mida diferent cal construir fraccions equivalents.'}],
    'divide-fractions':[{skillId:'calculation.muldiv',formatFamily:'arith',reason:'La divisió de fraccions acaba en una multiplicació que cal executar amb seguretat.'}],
    'equation-parentheses':[{skillId:'calculation.muldiv',formatFamily:'arith',reason:'La distributiva necessita multiplicar correctament cada terme del parèntesi.'}],
    'percentage-decrease':[{skillId:'numbers.decimals',formatFamily:'representation',reason:'Els percentatges depenen de relacionar parts de 100 i decimals.'}],
    'percentage-increase':[{skillId:'numbers.decimals',formatFamily:'representation',reason:'Els percentatges depenen de relacionar parts de 100 i decimals.'}],
    'convert-length':[{skillId:'calculation.muldiv',formatFamily:'arith',reason:'Aplicar una escala d’unitats necessita multiplicar o dividir pel factor correcte.'}],
    'scale-conversion':[{skillId:'calculation.muldiv',formatFamily:'arith',reason:'Interpretar una escala necessita aplicar amb seguretat el factor multiplicatiu.'}],
    'length-multistep':[{skillId:'measurement.units',formatFamily:'calculation',reason:'El problema combina càlcul amb una conversió de longitud.'}]
  });
  function ensure(profile){profile.prerequisiteReviews=Array.isArray(profile.prerequisiteReviews)?profile.prerequisiteReviews:[];profile.pendingPrerequisites=profile.pendingPrerequisites&&typeof profile.pendingPrerequisites==='object'?profile.pendingPrerequisites:{};return profile;}
  function eligible(profile,skillId,procedureId){ensure(profile);const dependency=DEPENDENCIES[procedureId]?.[0];if(!dependency)return null;const evidence=profile.skills?.[skillId]?.evidences||[],key=`${skillId}:${procedureId}`,last=profile.prerequisiteReviews.filter(r=>r.key===key).at(-1);if(last&&!last.resolvedAt)return null;const afterLast=evidence.filter(e=>e.procedureId===procedureId&&(!last?.resolvedAt||new Date(e.at)>new Date(last.resolvedAt))),same=afterLast.slice(-4);if(last?.resolvedAt&&same.length){const elapsed=(new Date(same.at(-1).at)-new Date(last.resolvedAt))/86400000;if(elapsed<RECHECK_COOLDOWN_DAYS)return null;}const repeatedErrors=same.filter(e=>e.outcome==='incorrect'&&e.assistance==='none').length>=2;const assistedDependence=same.filter(e=>e.correct&&e.assistance!=='none').length>=3;if(!repeatedErrors&&!assistedDependence)return null;return {...dependency,key,trigger:repeatedErrors?'repeated-autonomous-errors':'systematic-hint-dependence'};}
  function schedule(profile,session,completedItem,format,now=new Date().toISOString()){
    const procedureId=format?.procedure||completedItem.procedureId||completedItem.exercise?.procedureId;
    const dependency=eligible(profile,completedItem.skillId,procedureId);if(!dependency)return null;
    const candidate=session.items.find((item,index)=>index>session.index&&!item.presented&&!item.completed&&!item.exercise);
    if(!candidate)return null;
    const review={id:`prereq-${session.id}-${completedItem.id}`,key:dependency.key,sessionId:session.id,sourceItemId:completedItem.id,originalSkillId:completedItem.skillId,originalProcedureId:procedureId,originalFormatFamily:completedItem.formatFamily,originalDifficulty:completedItem.difficulty,prerequisiteSkillId:dependency.skillId,trigger:dependency.trigger,reason:dependency.reason,scheduledAt:now};
    profile.prerequisiteReviews.push(review);profile.pendingPrerequisites[review.id]=review;
    Object.assign(candidate,{phase:'prerequisite-check',skillId:dependency.skillId,primarySkillId:completedItem.skillId,formatFamily:dependency.formatFamily,requestedDifficulty:1,difficulty:1,prerequisiteReviewId:review.id,reason:`Comprovació breu: ${dependency.reason}`});
    return review;
  }
  function resolve(profile,session,item,now=new Date().toISOString()){
    ensure(profile);if(item.phase!=='prerequisite-check'||!item.prerequisiteReviewId)return null;
    const review=profile.pendingPrerequisites[item.prerequisiteReviewId];if(!review)return null;
    const passed=item.correct&&item.assistance==='none';Object.assign(review,{resolvedAt:now,result:passed?'passed':'needs-reinforcement',assisted:item.assistance!=='none'});delete profile.pendingPrerequisites[review.id];
    const candidate=session.items.find((future,index)=>index>session.index&&!future.presented&&!future.completed&&!future.exercise);
    if(candidate){if(passed)Object.assign(candidate,{phase:'return-to-procedure',skillId:review.originalSkillId,primarySkillId:review.originalSkillId,formatFamily:review.originalFormatFamily,requestedDifficulty:review.originalDifficulty||1,difficulty:review.originalDifficulty||1,reason:'Tornem al procediment original després de comprovar-ne el prerequisit.',returnsFromPrerequisite:review.id});else Object.assign(candidate,{phase:'prerequisite-reinforcement',skillId:review.prerequisiteSkillId,primarySkillId:review.originalSkillId,formatFamily:item.formatFamily,requestedDifficulty:1,difficulty:1,reason:'Reforç breu del prerequisit abans de reprendre el procediment original.',reinforcesPrerequisite:review.id});}
    return review;
  }
  return {DEPENDENCIES,RECHECK_COOLDOWN_DAYS,ensure,eligible,schedule,resolve};
});
