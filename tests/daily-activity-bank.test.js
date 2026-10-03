const assert=require('node:assert/strict');
require('../daily-activity-bank.js');
const bank=global.FocusDailyActivities;
const expected={
 decimals:['compare','order','representation','application','increase','tax'],
 fractions:['sharing','recipe','compare-context','scale'],
 equations:['calculation','complete','error-detection','reasoning'],
 data:['visual','compare','reasoning','table','trend'],
 units:['calculation','application','estimate','time','capacity'],
 geometry:['visual','application','error-detection','estimate']
};
for(const [activity,formats] of Object.entries(expected)){
 for(const formatFamily of formats){
  const requestedLevel={increase:3,tax:3,sharing:1,'compare-context':1,recipe:2,scale:3,visual:1,table:1,compare:2,trend:2,reasoning:3,application:2,time:2,capacity:2,'error-detection':3,estimate:1,order:2,representation:1,calculation:1,complete:2}[formatFamily]||2;
  for(let i=0;i<80;i++){
   const q=bank[activity](requestedLevel,{formatFamily});
   assert.ok(q.text&&q.formatId&&q.answer!==undefined,`${activity}/${formatFamily} is complete`);
   assert.ok(q.templateId&&q.difficulty&&Array.isArray(q.prerequisites)&&q.hints.length>=2&&q.explanation,'template metadata is complete');
   if(q.choices){assert.equal(new Set(q.choices).size,q.choices.length,'choices are unique');assert.equal(q.choices.filter(v=>v===String(q.answer)).length,1,`${activity}/${formatFamily} has exactly one declared answer`);}
   if(q.type==='compound-choice')assert.ok(q.justificationChoices.includes(q.justificationAnswer),'justification has one verifiable answer');
   if(q.html)assert.match(q.html,/role="img"|<ol|<table/,'visual content is accessible or structured');
  }
 }
}
console.log('daily-activity-bank: all formats generated valid self-correcting activities');
