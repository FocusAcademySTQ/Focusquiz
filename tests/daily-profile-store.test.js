const assert=require('node:assert/strict');
const Profiles=require('../daily-profile-store.js');
const Daily=require('../daily-session-engine.js');
class MemoryStorage{constructor(seed={}){this.data={...seed};}getItem(k){return this.data[k]??null;}setItem(k,v){this.data[k]=String(v);}removeItem(k){delete this.data[k];}}
const storage=new MemoryStorage({students:JSON.stringify(['Anna','Biel']),lastStudent:'Anna'});
assert.equal(Profiles.activeId(storage),'Anna','legacy active student is recovered');
let anna=Profiles.loadProfile(storage,'Anna',Daily.createProfile);Daily.recordEvidence(anna,'fractions.concept',{correct:true,sessionId:'a',exerciseType:'test'});Profiles.saveProfile(storage,anna);
assert.equal(Profiles.setActive(storage,'Biel'),true);let biel=Profiles.loadProfile(storage,'Biel',Daily.createProfile);
assert.equal(biel.skills['fractions.concept'],undefined,'student progress is isolated');
assert.equal(Profiles.setActive(storage,'Anna'),true);anna=Profiles.loadProfile(storage,Profiles.activeId(storage),Daily.createProfile);
assert.equal(anna.skills['fractions.concept'].evidences.length,1,'selection and progress survive navigation/reload');
const legacyStorage=new MemoryStorage({students:'["Laia"]',lastStudent:'Laia','focusquiz-daily-profile-v1':JSON.stringify({...Daily.createProfile(),skills:{legacy:{status:'learning',evidences:[]}}})});
const migrated=Profiles.loadProfile(legacyStorage,Profiles.activeId(legacyStorage),Daily.createProfile);
assert.equal(migrated.skills.legacy.status,'learning','existing daily profile is migrated without loss');
console.log('daily-profile-store: persistence and isolation scenarios passed');
