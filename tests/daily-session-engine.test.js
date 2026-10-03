const assert=require('node:assert/strict');
const D=require('../daily-session-engine.js');
function ev(profile,id,correct,assistance,day,sessionId=day){D.recordEvidence(profile,id,{correct,assistance,sessionId,exerciseType:'test'},`${day}T10:00:00.000Z`);}
{
 const p=D.createProfile(); ev(p,'fractions.concept',false,'none','2026-01-01');ev(p,'fractions.concept',false,'none','2026-01-01');
 const s={items:[{skillId:'fractions.concept',completed:true,correct:false},{skillId:'fractions.concept',completed:true,correct:false}]};
 assert.equal(D.shouldOfferHelp(s,'fractions.concept'),true,'repeated difficulty offers help');
 assert.equal(D.skillProgress(p,'fractions.concept').status,'learning');
}
{
 const p=D.createProfile(); for(let i=0;i<6;i++)ev(p,'fractions.concept',true,i===0?'hint':'none',i<3?'2026-01-01':'2026-01-03');
 assert.equal(D.skillProgress(p,'fractions.concept').status,'mastered','mastery needs autonomous evidence across days');
 const helped=D.createProfile();for(let i=0;i<8;i++)ev(helped,'fractions.concept',true,'hint','2026-01-01');
 assert.equal(D.skillProgress(helped,'fractions.concept').status,'learning','helped successes are not autonomous');
}
{
 const p=D.createProfile();const op=D.CATALOG['fractions.operations'];
 assert.equal(D.prerequisiteReadiness(p,op).support,true,'missing prerequisites allow supported exploration');
 const session=D.planSession(p,'2026-01-01T00:00:00Z'); const resumed=D.planSession(p,'2026-01-01T01:00:00Z');assert.equal(resumed.id,session.id,'interrupted session resumes');
 assert.equal(D.CATALOG['fractions.applications'].coverage,'planned','insufficient content is explicit');
}
console.log('daily-session-engine: all acceptance scenarios passed');
