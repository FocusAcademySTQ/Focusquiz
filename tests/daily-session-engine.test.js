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
{
 const p=D.createProfile('anna');const s=D.planSession(p,'2026-03-28T22:30:00Z');
 assert.equal(s.day,'2026-03-28');assert.equal(s.status,'in-progress');
 s.items[0].completed=true;s.items[0].answer='1/2';s.index=1;
 assert.equal(D.planSession(p,'2026-03-28T22:45:00Z').id,s.id,'same Madrid day resumes exact session');
 assert.equal(D.finishSession(p,s,'2026-03-28T22:50:00Z'),true);
 assert.equal(D.finishSession(p,s,'2026-03-28T22:51:00Z'),false,'completion is idempotent');
 assert.equal(p.sessions.length,1,'completion summary is not duplicated');
 const before=D.skillProgress(p,'fractions.concept').evidences.length;
 D.recordEvidence(p,'fractions.concept',{evidenceId:'stable-attempt',correct:true,sessionId:s.id,exerciseType:'test'});
 D.recordEvidence(p,'fractions.concept',{evidenceId:'stable-attempt',correct:true,sessionId:s.id,exerciseType:'test'});
 assert.equal(D.skillProgress(p,'fractions.concept').evidences.length,before+1,'replayed attempt is idempotent');
 assert.equal(D.planSession(p,'2026-03-28T22:55:00Z').status,'completed','re-entry returns today summary');
 const next=D.planSession(p,'2026-03-29T22:30:00Z');
 assert.notEqual(next.id,s.id);assert.equal(next.day,'2026-03-30','Madrid DST local day creates a new session');
 const extra=D.planSession(p,'2026-03-29T22:31:00Z',{kind:'extra'});
 assert.equal(extra.kind,'extra');assert.equal(p.extraSessions.length,1);assert.equal(p.dailySessions.length,2,'extra stays separate');
}
{
 const p=D.createProfile();const old=D.planSession(p,'2026-10-24T21:00:00Z');old.items[0].completed=true;
 const current=D.planSession(p,'2026-10-25T23:30:00Z');
 assert.equal(old.status,'incomplete');assert.notEqual(current.id,old.id);assert.equal(old.items[0].completed,true,'stale evidence remains archived');
}
console.log('daily-session-engine: all acceptance scenarios passed');
