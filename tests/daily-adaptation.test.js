const assert=require('node:assert/strict');
const D=require('../daily-session-engine.js');
global.addModules=()=>{};require('../math.js');require('../daily-activity-bank.js');
function generated(skillId,difficulty,formatFamily){const skill=D.CATALOG[skillId],source=skill.generator.module==='daily'?global.FocusDailyActivities:global.FocusMathGenerators;return source[skill.generator.activity||skill.generator.module](difficulty,{...(skill.generator.options||{}),formatFamily});}
function evidence(p,id,outcome,difficulty,n,assistance='none'){D.recordEvidence(p,id,{evidenceId:`${id}-${n}-${outcome}-${assistance}`,sessionId:'s',exerciseType:'test',formatId:`f${n%2}`,outcome,correct:outcome==='correct',assistance,difficulty},`2026-12-${String(1+n).padStart(2,'0')}T09:00:00Z`);}

const easyEq=generated('algebra.linear',1,'calculation'),hardEq=generated('algebra.linear',3,'reasoning');
assert.equal(easyEq.formatId,'equation-one-step');assert.equal(hardEq.formatId,'equation-both-sides');assert.notEqual(easyEq.text,hardEq.text,'higher algebra changes structure, not only numbers');
const easyGeo=generated('geometry.measure',1,'visual'),hardGeo=generated('geometry.measure',3,'visual');
assert.notEqual(easyGeo.formatId,hardGeo.formatId);assert.equal(hardGeo.formatId,'geometry-unknown-side','higher geometry requires an inverse calculation');
const easyData=generated('data.interpretation',1,'visual'),hardData=generated('data.interpretation',3,'reasoning');
assert.equal(easyData.formatId,'graph-read-value');assert.equal(hardData.type,'compound-choice','higher data work requires a justified conclusion');
assert.match(generated('calculation.muldiv',1,'arith').formatId,/facts/);assert.equal(generated('calculation.muldiv',4,'arith').formatId,'arith-two-step','calculation reaches a structurally multi-step level');
for(let i=0;i<80;i++){const q=generated('fractions.operations',1,'symbolic');assert.equal(q.difficulty,1);assert.doesNotMatch(q.text,/×|÷/,'level-one fractions use same-denominator addition or subtraction');}
let divisionSeen=false;for(let i=0;i<120;i++){const q=generated('fractions.operations',4,'symbolic');assert.equal(q.difficulty,4);if(q.text.includes('÷'))divisionSeen=true;}assert.equal(divisionSeen,true,'level-four fractions include division');

const advancing=D.createProfile('advancing');evidence(advancing,'algebra.linear','correct',1,0);evidence(advancing,'algebra.linear','correct',1,1);
assert.equal(D.skillProgress(advancing,'algebra.linear').estimatedLevel,2);
const future={id:'future',skillId:'algebra.linear',primarySkillId:'algebra.linear',phase:'focus',difficulty:1,requestedDifficulty:1};
const adaptiveSession={id:'adaptive',status:'in-progress',index:0,items:[{id:'done',skillId:'algebra.linear',phase:'focus',difficulty:1,outcome:'correct',assistance:'none',completed:true,presented:true},future]};
D.adaptRemainingItems(advancing,adaptiveSession,adaptiveSession.items[0]);assert.equal(future.difficulty,2,'future unshown item is raised');
const adaptedExercise=generated(future.skillId,future.difficulty,'complete');assert.equal(adaptedExercise.actualDifficulty,2);assert.equal(adaptedExercise.formatId,'equation-complete-step');

const assisted=D.createProfile('assisted');for(let i=0;i<5;i++)evidence(assisted,'algebra.linear','correct',1,i,'hint');assert.equal(D.skillProgress(assisted,'algebra.linear').estimatedLevel,1,'hinted success does not promote');
const errors=D.createProfile('errors');errors.skills['algebra.linear']=D.skillProgress(errors,'algebra.linear');errors.skills['algebra.linear'].estimatedLevel=3;errors.skills['algebra.linear'].levelRun={level:3,autonomous:0,errors:0,unknown:0};evidence(errors,'algebra.linear','incorrect',3,0);assert.equal(D.skillProgress(errors,'algebra.linear').estimatedLevel,3,'one error does not demote');evidence(errors,'algebra.linear','incorrect',3,1);assert.equal(D.skillProgress(errors,'algebra.linear').estimatedLevel,2,'repeated errors demote once');
const reinforceFuture={id:'rf',skillId:'algebra.linear',phase:'focus',difficulty:3},reinforceSession={id:'reinforce',status:'in-progress',index:0,items:[{id:'rd',skillId:'algebra.linear',phase:'focus',difficulty:3,outcome:'incorrect',completed:true,presented:true},reinforceFuture]};D.adaptRemainingItems(errors,reinforceSession,reinforceSession.items[0]);assert.equal(reinforceFuture.skillId,'calculation.muldiv','repeated algebra errors schedule a prerequisite check');assert.ok(reinforceFuture.difficulty<=2,'reinforcement is accessible');

const probe=D.createProfile('probe');evidence(probe,'data.interpretation','correct',1,0);const probeFuture={id:'pf',skillId:'data.interpretation',phase:'focus',difficulty:1};const probeSession={id:'probe',status:'in-progress',index:0,items:[{id:'pd',skillId:'data.interpretation',phase:'diagnostic',difficulty:1,outcome:'correct',assistance:'none',completed:true,presented:true},probeFuture]};D.adaptRemainingItems(probe,probeSession,probeSession.items[0]);assert.equal(probeFuture.difficulty,2,'diagnostic success schedules a higher-level probe before mastery');

const retention=D.createProfile('retention');evidence(retention,'data.interpretation','correct',1,0);evidence(retention,'data.interpretation','correct',1,2);for(let i=0;i<60;i++)D.recordEvidence(retention,'data.interpretation',{evidenceId:`bulk-${i}`,sessionId:'bulk',exerciseType:'test',formatId:'bar',outcome:i%3?'incorrect':'unknown',assistance:'none',difficulty:1},'2026-12-10T09:00:00Z');assert.ok(Object.keys(D.skillProgress(retention,'data.interpretation').retention.days).length>=2,'many same-day attempts preserve cross-day retention');

const requested=4,supported=D.supportedDifficulty('numbers.decimals',requested);assert.equal(supported,3);const fallback=global.FocusDailyActivities.decimals(requested,{formatFamily:'tax'});assert.equal(fallback.actualDifficulty,3);assert.equal(fallback.coverageLimited,true,'unsupported level is explicitly limited');
const unevenGeometry=generated('geometry.measure',3,'visual'),unevenNumbers=generated('fractions.concept',1,'bar');assert.equal(unevenGeometry.actualDifficulty,3);assert.equal(unevenNumbers.difficulty,1,'different skills can generate different real difficulties');
const reloaded=JSON.parse(JSON.stringify(adaptiveSession));assert.equal(reloaded.items[1].difficulty,2);reloaded.items[1].exercise=adaptedExercise;assert.equal(JSON.parse(JSON.stringify(reloaded)).items[1].exercise.text,adaptedExercise.text,'reload preserves adjusted route and generated question');
console.log('daily-adaptation: generated difficulty, hysteresis, retention, fallback and reload passed');
