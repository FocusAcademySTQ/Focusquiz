const assert=require('node:assert/strict');
const D=require('../daily-session-engine.js');
const fresh=D.createProfile('fresh');
const first=D.planSession(fresh,'2026-11-02T09:00:00Z');
const diagnostic=first.items.filter(i=>i.phase==='diagnostic');
assert.deepEqual(new Set(diagnostic.map(i=>D.CATALOG[i.skillId].area)),new Set(D.AREAS),'first session introduces all four areas');
assert.ok(diagnostic.every(i=>i.difficulty===1),'introductory diagnostic starts at difficulty one');

const isolated=D.createProfile('isolated');
D.recordEvidence(isolated,'geometry.measure',{outcome:'incorrect',assistance:'none',difficulty:2,exerciseType:'visual'},'2026-11-01T09:00:00Z');
const geometry=D.skillProgress(isolated,'geometry.measure');
assert.equal(geometry.evidenceState,'insufficient','one error is insufficient evidence, not an area diagnosis');
assert.equal(D.skillProgress(isolated,'algebra.linear').evidenceState,'pending','unknown skill remains pending');
assert.equal(D.skillProgress(isolated,'data.interpretation').evidences.length,0,'multi-area attribution is not inferred');

const unknown=D.createProfile('unknown');
D.recordEvidence(unknown,'algebra.linear',{outcome:'unknown',assistance:'none',difficulty:1,exerciseType:'diagnostic'},'2026-11-01T09:00:00Z');
assert.equal(D.skillProgress(unknown,'algebra.linear').evidenceState,'insufficient');
assert.equal(D.skillProgress(unknown,'algebra.linear').evidences[0].outcome,'unknown','I do not know is distinct from incorrect');

const levels=D.createProfile('levels');
D.recordEvidence(levels,'data.interpretation',{outcome:'correct',assistance:'none',difficulty:1,exerciseType:'graph',formatId:'bar'},'2026-11-01T09:00:00Z');
D.recordEvidence(levels,'data.interpretation',{outcome:'correct',assistance:'none',difficulty:1,exerciseType:'graph',formatId:'table'},'2026-11-02T09:00:00Z');
assert.equal(D.skillProgress(levels,'data.interpretation').estimatedLevel,2,'repeated autonomous success explores higher difficulty');
const assisted=D.createProfile('assisted');
for(let i=0;i<6;i++)D.recordEvidence(assisted,'data.interpretation',{outcome:'correct',assistance:'hint',difficulty:1,exerciseType:'graph',formatId:'bar'},`2026-11-0${i+1}T09:00:00Z`);
assert.equal(D.skillProgress(assisted,'data.interpretation').status,'learning','assisted successes are not autonomous mastery');

const uneven=D.createProfile('uneven');
for(let i=0;i<3;i++)D.recordEvidence(uneven,'geometry.measure',{outcome:'correct',assistance:'none',difficulty:2,exerciseType:'visual',formatId:`g${i}`},`2026-10-${20+i}T09:00:00Z`);
for(let i=0;i<2;i++)D.recordEvidence(uneven,'calculation.muldiv',{outcome:'incorrect',assistance:'none',difficulty:1,exerciseType:'arith',formatId:'arith'},`2026-10-${20+i}T09:00:00Z`);
const unevenSession=D.planSession(uneven,'2026-11-03T09:00:00Z');
assert.equal(unevenSession.focusSkillId,'calculation.muldiv','difficulty in numbers can drive focus independently of stronger geometry');
assert.ok(unevenSession.items.some(i=>i.phase==='diagnostic'&&D.CATALOG[i.skillId].area==='algebra'),'unknown areas retain exploration opportunities');
console.log('daily-diagnostic: four-area exploration, confidence, unknown and uneven profiles passed');
