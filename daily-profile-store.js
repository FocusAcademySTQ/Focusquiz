(function(root, factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.FocusProfiles=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const ACTIVE='focusquiz-active-student-id';
  const STUDENTS='students';
  const DATA='focusquiz-daily-profiles-v2';
  const LEGACY='focusquiz-daily-profile-v1';
  const parse=(storage,key,fallback)=>{try{return JSON.parse(storage.getItem(key)||'')||fallback;}catch(_){return fallback;}};
  function list(storage=localStorage){
    const names=parse(storage,STUDENTS,[]).filter(v=>typeof v==='string'&&v.trim()).map(v=>v.trim());
    const data=parse(storage,DATA,{});
    return [...new Set([...names,Object.values(data).map(p=>p&&p.name).filter(Boolean)])].map(name=>({id:name,name}));
  }
  function activeId(storage=localStorage){
    const requested=storage.getItem(ACTIVE)||storage.getItem('lastStudent');
    if(!requested)return null;
    const found=list(storage).find(p=>p.id===requested||p.name===requested);
    if(!found){
      // `lastStudent` és el sistema històric: el conservem i el registrem.
      if(storage.getItem('lastStudent')===requested){create(storage,requested);return requested;}
      storage.removeItem(ACTIVE);return null;
    }
    storage.setItem(ACTIVE,found.id);storage.setItem('lastStudent',found.name);return found.id;
  }
  function setActive(storage=localStorage,id){
    const found=list(storage).find(p=>p.id===id);if(!found)return false;
    storage.setItem(ACTIVE,id);storage.setItem('lastStudent',found.name);return true;
  }
  function create(storage=localStorage,name){
    const clean=String(name||'').trim();if(clean.length<2)return null;
    const students=parse(storage,STUDENTS,[]);if(!students.includes(clean)){students.push(clean);storage.setItem(STUDENTS,JSON.stringify(students));}
    setActive(storage,clean);return {id:clean,name:clean};
  }
  function loadData(storage){return parse(storage,DATA,{});}
  function loadProfile(storage=localStorage,id,createProfile){
    const data=loadData(storage);if(data[id])return data[id];
    let profile;
    const legacy=parse(storage,LEGACY,null);
    if(legacy&&Object.keys(data).length===0){profile=Object.assign(createProfile(id),legacy,{id,name:id});storage.removeItem(LEGACY);}
    else profile=Object.assign(createProfile(id),{id,name:id});
    profile.dailySessions=profile.dailySessions||[];profile.extraSessions=profile.extraSessions||[];profile.recentSignatures=profile.recentSignatures||[];
    if(profile.activeSession&&!profile.activeSession.day){
      profile.activeSession.day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(profile.activeSession.startedAt||Date.now()));
      profile.activeSession.kind='daily';profile.activeSession.status='in-progress';
      if(!profile.dailySessions.some(s=>s.id===profile.activeSession.id))profile.dailySessions.push(profile.activeSession);
    }
    data[id]=profile;storage.setItem(DATA,JSON.stringify(data));return profile;
  }
  function saveProfile(storage=localStorage,profile){const data=loadData(storage);data[profile.id]=profile;storage.setItem(DATA,JSON.stringify(data));}
  return {ACTIVE,DATA,list,activeId,setActive,create,loadProfile,saveProfile};
});
