const assert=require('node:assert/strict');
require('../daily-activity-bank.js');
const bank=global.FocusDailyActivities;
const expected={
 decimals:['compare','order','representation','application'],
 equations:['calculation','complete','error-detection','reasoning'],
 data:['visual','compare','reasoning'],
 units:['calculation','application','estimate'],
 geometry:['visual','application','error-detection','estimate']
};
for(const [activity,formats] of Object.entries(expected)){
 for(const formatFamily of formats){
  for(let i=0;i<80;i++){
   const q=bank[activity](2,{formatFamily});
   assert.ok(q.text&&q.formatId&&q.answer!==undefined,`${activity}/${formatFamily} is complete`);
   if(q.choices)assert.ok(q.choices.includes(String(q.answer)),`${activity}/${formatFamily} contains its correct choice`);
   if(q.type==='compound-choice')assert.ok(q.justificationChoices.includes(q.justificationAnswer),'justification has one verifiable answer');
   if(q.html)assert.match(q.html,/role="img"|<ol/,'visual content is accessible or structured');
  }
 }
}
console.log('daily-activity-bank: all formats generated valid self-correcting activities');
