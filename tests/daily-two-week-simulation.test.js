const assert=require('node:assert/strict');
let seed=421337;Math.random=()=>((seed=seed*48271%2147483647)-1)/2147483646;
const D=require('../daily-session-engine.js');global.addModules=()=>{};require('../math.js');require('../daily-activity-bank.js');
function generate(item){const skill=D.CATALOG[item.skillId],source=skill.generator.module==='daily'?global.FocusDailyActivities:global.FocusMathGenerators;return source[skill.generator.activity||skill.generator.module](item.difficulty,{...(skill.generator.options||{}),formatFamily:item.formatFamily});}
const available=Object.values(D.CATALOG).filter(s=>s.coverage==='available');
function prepare(kind){
 const p=D.createProfile(kind);
 const master=id=>{for(let i=0;i<6;i++)D.recordEvidence(p,id,{evidenceId:`seed-${id}-${i}`,sessionId:'seed',exerciseType:'seed',formatId:`seed-${i%2}`,correct:true,assistance:'none'},`${i<3?'2026-08-20':'2026-08-22'}T08:00:00.000Z`);};
 if(kind==='intermediate')['calculation.muldiv','fractions.concept','fractions.equivalence'].forEach(master);
 if(kind==='advanced')available.forEach(s=>master(s.id));
 return p;
}
function simulate(kind){
 const p=prepare(kind),skills=new Set(),formats=new Set(),phases={review:0,focus:0,challenge:0,diagnostic:0},days=[];
 for(let day=1;day<=14;day++){
  const at=`2026-09-${String(day).padStart(2,'0')}T08:00:00.000Z`,s=D.planSession(p,at),daySkills=new Set(),dayFormats=new Set();
  for(const item of s.items){
   const skill=D.CATALOG[item.skillId];assert.equal(skill.coverage,'available');
   if(item.phase==='challenge')assert.equal(D.prerequisiteReadiness(p,skill).ready,true,'challenge respects prerequisites');
   const exercise=generate(item),format=D.describeFormat(exercise.formatId,exercise.type).formatKey;skills.add(item.skillId);formats.add(`${item.skillId}:${format}`);daySkills.add(item.skillId);dayFormats.add(format);phases[item.phase]++;
   item.completed=true;item.correct=true;item.assistance='none';
   D.recordEvidence(p,item.skillId,{evidenceId:`${s.id}:${item.id}`,sessionId:s.id,itemId:item.id,exerciseType:'simulation',formatId:exercise.formatId,variantId:`${format}-${day}`,correct:true,assistance:'none'},at);
  }
  s.correct=s.items.length;s.index=s.items.length;D.finishSession(p,s,at);days.push({day:s.day,focus:s.focusSkillId,skills:[...daySkills],formats:[...dayFormats]});
 }
 assert.ok(skills.size>=5,`${kind} reaches multiple skills`);assert.ok(formats.size>=8,`${kind} receives multiple true formats`);assert.ok(phases.review>0,`${kind} keeps spaced review`);
 let streak=1,maxSame=1;for(let i=1;i<days.length;i++){streak=days[i].focus===days[i-1].focus?streak+1:1;maxSame=Math.max(maxSame,streak);}assert.ok(maxSame<=3,'no permanent focus loop');
 return {profile:kind,skillCount:skills.size,formatCount:formats.size,phases,skills:[...skills],formats:[...formats],days};
}
const report=['initial','intermediate','advanced'].map(simulate);
console.log(JSON.stringify(report,null,2));
