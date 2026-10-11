const assert=require('node:assert/strict');
require('../daily-session-engine.js');require('../daily-bank-metadata.js');require('../daily-activity-bank.js');
const bank=global.FocusDailyActivities;
const expected={
 decimals:['compare','order','representation','place-value','plausibility','percent-visual','percent-part','percent-rate','percent-total','application','increase','tax'],
 fractions:['sharing','recipe','compare-context','scale'],
 equations:['calculation','complete','next-step','error-detection','parentheses-error','reasoning'],
 data:['visual','table-reading','compare','reasoning','unsupported','table','trend'],
 units:['calculation','application','estimate','choose-unit','factor-error','time','capacity'],
 geometry:['visual','application','formula-selection','data-sufficiency','error-detection','estimate']
};
for(const [activity,formats] of Object.entries(expected)){
 for(const formatFamily of formats){
  const requestedLevel={increase:3,tax:3,'percent-total':3,'percent-part':2,'percent-rate':2,'percent-visual':1,'place-value':1,plausibility:2,sharing:1,'compare-context':1,recipe:2,scale:3,visual:1,table:1,compare:2,trend:2,reasoning:3,application:2,time:2,capacity:2,'error-detection':3,estimate:1,order:2,representation:1,calculation:1,complete:2,'next-step':2,'parentheses-error':4,'table-reading':1,unsupported:3,'choose-unit':1,'factor-error':2,'formula-selection':2,'data-sufficiency':1}[formatFamily]||2;
  for(let i=0;i<80;i++){
   const q=bank[activity](requestedLevel,{formatFamily});
   assert.ok(q.text&&q.formatId&&q.answer!==undefined,`${activity}/${formatFamily} is complete`);
   assert.ok(q.templateId&&q.difficulty&&Array.isArray(q.prerequisites)&&q.hints.length>=2&&q.explanation,'template metadata is complete');
   for(const key of ['skill','procedure','level','representation','reasoningType','stepCount','answerType','formatFamily','diagnosticTags','supportsSimplification','supportsTransfer'])assert.notEqual(q[key],undefined,`${q.formatId} declares ${key}`);
   if(q.choices){assert.equal(new Set(q.choices).size,q.choices.length,'choices are unique');assert.equal(q.choices.filter(v=>v===String(q.answer)).length,1,`${activity}/${formatFamily} has exactly one declared answer`);}
   if(q.type==='compound-choice')assert.ok(q.justificationChoices.includes(q.justificationAnswer),'justification has one verifiable answer');
   if(q.html)assert.match(q.html,/role="img"|<ol|<table/,'visual content is accessible or structured');
  }
 }
}
console.log('daily-activity-bank: all formats generated valid self-correcting activities');
