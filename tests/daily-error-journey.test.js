const assert=require('node:assert/strict');
const D=require('../daily-session-engine.js');
const p=D.createProfile('error-journey');
const original={id:'original',skillId:'algebra.linear',primarySkillId:'algebra.linear',phase:'focus',formatFamily:'calculation',difficulty:2,exercise:{formatId:'equation-linear',variantId:'equation|3x+2=14'},attempts:[]};
const check={id:'check',skillId:'data.interpretation',primarySkillId:'data.interpretation',phase:'focus',formatFamily:'complete',difficulty:2};
const session={id:'journey',status:'in-progress',index:0,items:[original,check]};
// First wrong answer: retain its diagnostic value before any help.
original.attempts.push({answer:'6',outcome:'incorrect',assistance:'none'});original.firstAnswer='6';original.firstOutcome='incorrect';
D.recordEvidence(p,original.skillId,{evidenceId:'journey:original:first',sessionId:session.id,itemId:original.id,outcome:'incorrect',correct:false,assistance:'none',answer:'6',difficulty:2,formatId:'equation-linear'});
// Hint, second attempt, then full solution: neither assisted action creates autonomous success.
original.hintsUsed=1;original.attempts.push({answer:'5',outcome:'incorrect',assistance:'hint'});original.solutionViewed=true;original.completed=true;original.correct=false;original.outcome='incorrect';original.assistance='solution';
D.recordEvidence(p,original.skillId,{evidenceId:'journey:original:final',sessionId:session.id,itemId:original.id,outcome:'incorrect',correct:false,assistance:'solution',answer:'5',difficulty:2,formatId:'equation-linear'});
D.adaptRemainingItems(p,session,original,'2026-09-01T10:00:00Z');
assert.equal(check.phase,'verification');assert.equal(check.skillId,'algebra.linear');assert.equal(check.formatFamily,'calculation');assert.equal(check.verifiesItemId,'original');assert.equal(check.mustDifferFromVariant,original.exercise.variantId);
assert.equal(D.skillProgress(p,'algebra.linear').levelRun.autonomous,0);assert.equal(D.skillProgress(p,'algebra.linear').levelRun.errors,1,'assisted final result does not duplicate the autonomous error');
// Reload preserves exact attempts/help/solution and the queued check.
const restored=JSON.parse(JSON.stringify({profile:p,session}));assert.equal(restored.session.items[0].firstAnswer,'6');assert.equal(restored.session.items[0].attempts[0].answer,'6');assert.equal(restored.session.items[0].solutionViewed,true);assert.equal(restored.session.items[1].phase,'verification');
// The new variant can provide new autonomous evidence.
check.exercise={formatId:'equation-linear',variantId:'equation|4x+3=19'};assert.notEqual(check.exercise.variantId,check.mustDifferFromVariant);check.completed=true;check.correct=true;check.assistance='none';
D.recordEvidence(p,check.skillId,{evidenceId:'journey:check:final',sessionId:session.id,itemId:check.id,outcome:'correct',correct:true,assistance:'none',answer:'4',difficulty:2,formatId:check.exercise.formatId,variantId:check.exercise.variantId});
assert.equal(D.skillProgress(p,'algebra.linear').levelRun.autonomous,1);assert.equal(D.skillProgress(p,'algebra.linear').estimatedLevel,1,'one check alone cannot promote');
console.log('daily-error-journey: first response, assistance, solution, novel check and reload passed');
