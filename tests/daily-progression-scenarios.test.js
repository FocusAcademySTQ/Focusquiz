const assert=require('node:assert/strict');
const D=require('../daily-session-engine.js');
function profileAt(id,skill,level){const p=D.createProfile(id),s=D.skillProgress(p,skill);s.estimatedLevel=level;s.levelRun={level,autonomous:0,errors:0,unknown:0,autonomousFormats:{},errorFormats:{}};return p;}
function add(p,skill,n,outcome,format,assistance='none',day=1){return D.recordEvidence(p,skill,{evidenceId:`${p.id}-${n}`,sessionId:'simulation',exerciseType:'simulation',formatId:format,outcome,correct:outcome==='correct',assistance,difficulty:D.skillProgress(p,skill).estimatedLevel},`2026-09-${String(day).padStart(2,'0')}T09:00:00Z`);}
// 1. Stable, genuinely varied independent success promotes once after three results.
{const p=profileAt('stable','algebra.linear',1);add(p,'algebra.linear',1,'correct','equation-one-step');add(p,'algebra.linear',2,'correct','equation-complete-step');add(p,'algebra.linear',3,'correct','equation-one-step');assert.equal(D.skillProgress(p,'algebra.linear').estimatedLevel,2);}
// 2. Alternation cancels runs and cannot oscillate.
{const p=profileAt('alternating','data.interpretation',2);for(let i=0;i<8;i++)add(p,'data.interpretation',i,i%2?'incorrect':'correct',i%2?'graph-compare':'graph-trend');assert.equal(D.skillProgress(p,'data.interpretation').estimatedLevel,2);}
// 3. A new representation/error does not erase established performance or demote.
{const p=profileAt('new-format','data.interpretation',2);add(p,'data.interpretation',1,'correct','graph-compare');add(p,'data.interpretation',2,'correct','graph-trend');add(p,'data.interpretation',3,'incorrect','graph-read-justify');assert.equal(D.skillProgress(p,'data.interpretation').estimatedLevel,2);}
// 4. Assisted successes never promote.
{const p=profileAt('assisted','algebra.linear',1);for(let i=0;i<6;i++)add(p,'algebra.linear',i,'correct',i%2?'equation-complete-step':'equation-one-step','hint');assert.equal(D.skillProgress(p,'algebra.linear').estimatedLevel,1);}
// 5. Same-format errors need four, preventing a premature fall after three variants of one task.
{const p=profileAt('same-format-errors','algebra.linear',3);for(let i=0;i<3;i++)add(p,'algebra.linear',i,'incorrect','equation-both-sides');assert.equal(D.skillProgress(p,'algebra.linear').estimatedLevel,3);add(p,'algebra.linear',4,'incorrect','equation-both-sides');assert.equal(D.skillProgress(p,'algebra.linear').estimatedLevel,2);}
// 6. An advanced learner receives an immediate higher probe after one autonomous diagnostic success.
{const p=profileAt('advanced-probe','algebra.linear',1),done={id:'d',skillId:'algebra.linear',phase:'diagnostic',difficulty:1,outcome:'correct',assistance:'none',completed:true,presented:true},future={id:'f',skillId:'algebra.linear',phase:'focus',difficulty:1};const s={id:'s',status:'in-progress',index:0,items:[done,future]};add(p,'algebra.linear',1,'correct','equation-one-step');D.adaptRemainingItems(p,s,done);assert.equal(future.difficulty,2);assert.equal(D.skillProgress(p,'algebra.linear').estimatedLevel,1,'probe is exploration, not promotion');}
// 7. Evidence remains isolated between skills/procedures instead of becoming an area-level judgement.
{const p=profileAt('uneven','fractions.operations',2);add(p,'fractions.operations',1,'correct','frac-arith-+');add(p,'fractions.operations',2,'correct','frac-arith-−');for(let i=0;i<3;i++)add(p,'fractions.applications',10+i,'incorrect','fraction-scale-context');assert.equal(D.skillProgress(p,'fractions.operations').estimatedLevel,2);assert.equal(D.skillProgress(p,'fractions.applications').estimatedLevel,1);}
// Cosmetic variants collapse to the same cognitive identifier; genuinely different reasoning does not.
assert.equal(D.describeFormat('frac-identify-grid').formatKey,D.describeFormat('frac-identify-pie').formatKey);
assert.equal(D.describeFormat('percent-increase-context').formatKey,D.describeFormat('percent-tax-context').formatKey);
assert.notEqual(D.describeFormat('graph-read-value').formatKey,D.describeFormat('graph-trend').formatKey);
assert.notEqual(D.describeFormat({formatId:'frac-arith-+',denominatorsDifferent:false}).formatKey,D.describeFormat({formatId:'frac-arith-+',denominatorsDifferent:true}).formatKey);
console.log('daily-progression-scenarios: seven progression cases and cognitive format identity passed');
