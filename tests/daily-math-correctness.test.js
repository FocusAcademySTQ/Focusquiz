const assert=require('node:assert/strict');
const Answer=require('../daily-answer.js');
require('../daily-activity-bank.js');
const bank=global.FocusDailyActivities;
for(let i=0;i<250;i++){
  const sharing=bank.fractions(2,{formatFamily:'sharing'}),s=sharing.verification;
  assert.equal(Answer.validate(`${s.numerator*2}/${s.denominator*2}`,sharing).correct,true,'equivalent fractions are accepted');
  const recipe=bank.fractions(2,{formatFamily:'recipe'}),r=recipe.verification;
  assert.equal(Answer.fraction(recipe.answer),r.factor*r.numerator/r.denominator,'recipe scaling is exact');
  const scale=bank.fractions(3,{formatFamily:'scale'}),sc=scale.verification;
  assert.equal(Number(scale.answer),sc.total/sc.part,'route scale solution is exact');
  for(const format of ['increase','tax']){const q=bank.decimals(2,{formatFamily:format}),v=q.verification;assert.equal(Number(q.answer),v.base*(1+v.percent/100),'percentage total is exact');}
  const table=bank.data(2,{formatFamily:'table'}),tv=table.verification;assert.equal(Number(table.answer),tv.values.reduce((a,b)=>a+b,0),'table total matches data');
  const trend=bank.data(2,{formatFamily:'trend'});assert.ok(trend.verification.values.every((v,j,a)=>j===0||v>a[j-1]),'line-chart conclusion matches points');
  for(const format of ['time','capacity']){const q=bank.units(2,{formatFamily:format}),v=q.verification;if(format==='time')assert.equal(Number(q.answer),v.hours*60);else assert.equal(Number(q.answer),v.litres*1000);assert.equal(q.answerSpec.tolerance,0,'conversion tolerance is explicit');}
}
assert.equal(Answer.validate('0,5',{answer:'1/2',answerSpec:{kind:'fraction'}}).correct,false,'decimal is not silently accepted when a fraction is requested');
assert.equal(Answer.validate('2.005',{answer:'2',answerSpec:{kind:'number',tolerance:.01}}).correct,true,'declared numeric tolerance is applied');
assert.equal(Answer.validate('2.02',{answer:'2',answerSpec:{kind:'number',tolerance:.01}}).correct,false,'values outside tolerance are rejected');
console.log('daily-math-correctness: solutions, equivalence, units, charts and tolerances passed');
