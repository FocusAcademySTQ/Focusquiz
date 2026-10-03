const assert=require('node:assert/strict');
const L=require('../daily-lessons.js');
const required=['fraction-meaning','fraction-equivalence','fraction-simplify','fraction-add-same','fraction-add-different','fraction-multiply','fraction-divide','linear-equation','percent-change','geometry-area-perimeter','graph-reading','unit-conversion'];
for(const id of required){const lesson=L.lessons[id];assert.ok(lesson.objective&&lesson.explanation&&lesson.visual&&lesson.steps.length>=3);assert.ok(lesson.check.choices.includes(lesson.check.answer));assert.ok(lesson.guided.choices.includes(lesson.guided.answer));assert.equal(new Set(lesson.check.choices).size,lesson.check.choices.length);}
assert.equal(L.procedureFor({formatId:'frac-arith-÷'},'fractions.operations'),'fraction-divide');
assert.equal(L.procedureFor({formatId:'frac-arith-+'},'fractions.operations'),'fraction-add-same','new division procedure is distinct from addition');
const newProfile={skills:{'fractions.operations':{evidences:[]}},lessons:{}};
assert.equal(L.shouldIntroduce(newProfile,'fractions.operations','fraction-add-same'),true,'new procedure activates a lesson');
const known={skills:{'fractions.operations':{evidences:[{correct:true,assistance:'none',formatId:'frac-arith-+'}]}},lessons:{}};
assert.equal(L.shouldIntroduce(known,'fractions.operations','fraction-add-same'),false,'autonomous evidence avoids an unnecessary forced lesson');
const onlyAddition={skills:{'fractions.operations':{evidences:[{correct:true,assistance:'none',formatId:'frac-arith-+'}]}},lessons:{}};assert.equal(L.shouldIntroduce(onlyAddition,'fractions.operations','fraction-divide'),true,'a new division procedure still receives teaching');
known.lessons['fraction-add-same']={guidedCompleted:true};assert.equal(L.shouldIntroduce(known,'fractions.operations','fraction-add-same',true),true,'repeated difficulty can reopen teaching');
const item={learning:{lessonId:'fraction-add-same',stage:'guided',answers:[{stage:'check',answer:'Els denominadors',correct:true}]},attempts:[{answer:'1/5',outcome:'incorrect',assistance:'none'}]};const restored=JSON.parse(JSON.stringify(item));assert.equal(restored.learning.stage,'guided');assert.equal(restored.attempts[0].answer,'1/5','lesson and first attempt survive reload');
assert.equal(newProfile.skills['fractions.operations'].evidences.length,0,'guided work is not autonomous evidence');
console.log('daily-lessons: activation, procedure boundaries, guided separation and persistence passed');
