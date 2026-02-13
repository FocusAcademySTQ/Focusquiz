(() => {
  const $ = (s) => document.querySelector(s);
  const state = {
    running:false,time:120,timer:null,rope:0,limit:10,
    moduleId:'arith',module:null,cfg:{level:1,options:{}},
    pointsToWin:6,questionsPerPoint:2,q:null,
    teams:{blue:{name:'Equip blau',score:0,raw:0,input:''},red:{name:'Equip vermell',score:0,raw:0,input:''}}
  };

  const els={
    module:$('#moduleSelect'), cfgBox:$('#moduleConfig'), start:$('#startBtn'), level:$('#level'),
    points:$('#pointsToWin'), qpp:$('#questionsPerPoint'),
    blueName:$('#blueName'), redName:$('#redName'), blueLabel:$('#blueLabel'), redLabel:$('#redLabel'),
    blueTitle:$('#blueTitle'), redTitle:$('#redTitle'), blueScore:$('#blueScore'), redScore:$('#redScore'),
    timer:$('#timer'), flag:$('#flag'), qBlue:$('#qBlue'), qRed:$('#qRed'), fBlue:$('#fBlue'), fRed:$('#fRed'),
    inBlue:$('#inBlue'), inRed:$('#inRed'), optsBlue:$('#optsBlue'), optsRed:$('#optsRed'), kpBlue:$('#kpBlue'), kpRed:$('#kpRed')
  };

  function fmt(s){return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
  function norm(v){return String(v??'').trim().toLowerCase().replace(/\s+/g,' ')}
  function upd(){
    els.blueLabel.textContent=`${state.teams.blue.name} · ${state.teams.blue.raw}✔`;
    els.redLabel.textContent=`${state.teams.red.name} · ${state.teams.red.raw}✔`;
    els.blueTitle.textContent=state.teams.blue.name; els.redTitle.textContent=state.teams.red.name;
    els.blueScore.textContent=state.teams.blue.score; els.redScore.textContent=state.teams.red.score;
    els.inBlue.textContent=state.teams.blue.input||'0'; els.inRed.textContent=state.teams.red.input||'0';
    els.timer.textContent=fmt(state.time);
    els.flag.style.left=`${Math.max(5,Math.min(95,50+(state.rope/state.limit)*45))}%`;
  }

  function renderModuleConfig(){
    const m = state.module;
    if (m?.config?.render){
      els.cfgBox.innerHTML='';
      els.cfgBox.appendChild(m.config.render());
      return;
    }
    if (state.moduleId==='arith'){
      els.cfgBox.innerHTML=`<div class="section-title">Opcions d'aritmètica</div>
      <label><input type="checkbox" id="op-plus" checked> Sumes</label>
      <label><input type="checkbox" id="op-minus" checked> Restes</label>
      <label><input type="checkbox" id="op-times" checked> Multiplicacions</label>
      <label><input type="checkbox" id="op-div" checked> Divisions</label>`;return;
    }
    if (state.moduleId==='frac'){
      els.cfgBox.innerHTML=`<div class="section-title">Fraccions</div>
      <label><input type="radio" name="frac-sub" value="identify" checked> Identificar</label>
      <label><input type="radio" name="frac-sub" value="arith"> Aritmètica</label>
      <label><input type="radio" name="frac-sub" value="simplify"> Simplificar</label>`;return;
    }
    els.cfgBox.innerHTML='<div class="subtitle">Aquest mòdul no té opcions específiques addicionals.</div>';
  }

  function collectOptions(){
    if (state.module?.config?.collect) return state.module.config.collect();
    if (state.moduleId==='arith'){
      const ops=[]; if($('#op-plus')?.checked) ops.push('+'); if($('#op-minus')?.checked) ops.push('-'); if($('#op-times')?.checked) ops.push('×'); if($('#op-div')?.checked) ops.push('÷');
      return {ops:ops.length?ops:['+']};
    }
    if (state.moduleId==='frac') return {sub:(document.querySelector('input[name="frac-sub"]:checked')||{}).value||'identify'};
    return {};
  }

  function genQuestion(){
    for(let i=0;i<80;i++){
      const q=state.module.gen(Number(state.cfg.level)||1, state.cfg.options||{});
      if(!q||typeof q.text!=='string') continue;
      return q;
    }
    return {text:'No s\'ha pogut generar pregunta.',answer:''};
  }

  function renderQuestion(){
    const q=state.q; const txt=q?.text||'—';
    els.qBlue.innerHTML=txt; els.qRed.innerHTML=txt;

    const options=Array.isArray(q?.options)&&q.options.length?q.options:null;
    const mkOpts=(team, container)=>{
      container.innerHTML='';
      if(!options) return;
      options.forEach(opt=>{
        const b=document.createElement('button'); b.type='button'; b.textContent=opt;
        b.onclick=()=>submit(team,opt,true); container.appendChild(b);
      });
    };
    mkOpts('blue',els.optsBlue); mkOpts('red',els.optsRed);
    els.kpBlue.style.display=options?'none':'grid'; els.kpRed.style.display=options?'none':'grid';
  }

  function feedback(team,msg,ok){ const el=team==='blue'?els.fBlue:els.fRed; el.textContent=msg; el.style.color=ok?'#196a32':'#b42318'; }

  function submit(team,raw,fromOption=false){
    if(!state.running||!state.q) return;
    const t=state.teams[team];
    const ans = fromOption?raw:(raw ?? t.input);
    const ok = norm(ans)===norm(state.q.answer);
    if(ok){
      t.raw +=1; feedback(team,`Correcte! ${t.raw}/${state.questionsPerPoint} per punt.`,true);
      if(t.raw % state.questionsPerPoint===0){ t.score+=1; state.rope += team==='blue'?-1:1; }
    } else {
      feedback(team,`Incorrecte. Correcta: ${state.q.answer}`,false); state.rope += team==='blue'?0.35:-0.35;
    }
    t.input=''; upd();
    if(t.score>=state.pointsToWin || Math.abs(state.rope)>=state.limit){ end(); return; }
    state.q=genQuestion(); renderQuestion();
  }

  function end(){ state.running=false; clearInterval(state.timer); const msg = state.teams.blue.score===state.teams.red.score?'Empat':(state.teams.blue.score>state.teams.red.score?`Guanya ${state.teams.blue.name}`:`Guanya ${state.teams.red.name}`); alert(`${msg}\nBlau ${state.teams.blue.score} - Vermell ${state.teams.red.score}`); }

  function start(){
    state.moduleId=els.module.value; state.module=getMods().find(m=>m.id===state.moduleId);
    state.cfg={level:Number(els.level.value)||1, options:collectOptions()};
    state.pointsToWin=Math.max(1,Number(els.points.value)||6); state.questionsPerPoint=Math.max(1,Number(els.qpp.value)||2);
    state.teams.blue.name=els.blueName.value.trim()||'Equip blau'; state.teams.red.name=els.redName.value.trim()||'Equip vermell';
    state.time=120; state.rope=0; state.running=true; state.teams.blue.score=state.teams.red.score=0; state.teams.blue.raw=state.teams.red.raw=0; state.teams.blue.input=state.teams.red.input='';
    state.q=genQuestion(); renderQuestion(); feedback('blue','Preparat!',true); feedback('red','Preparat!',true); upd();
    clearInterval(state.timer); state.timer=setInterval(()=>{state.time--;upd(); if(state.time<=0) end();},1000);
  }

  function buildKp(team,wrap){
    ['7','8','9','4','5','6','1','2','3','0'].forEach(n=>{const b=document.createElement('button'); b.textContent=n; b.onclick=()=>{if(!state.running)return;state.teams[team].input=(state.teams[team].input+n).slice(0,20);upd();};wrap.appendChild(b);});
    const c=document.createElement('button'); c.textContent='Esborrar'; c.onclick=()=>{state.teams[team].input='';upd();};
    const s=document.createElement('button'); s.textContent='Enviar'; s.className='send'; s.onclick=()=>submit(team);
    wrap.appendChild(c);wrap.appendChild(s);
  }

  function init(){
    const mods=getMods();
    els.module.innerHTML=mods.map(m=>`<option value="${m.id}">${m.name}</option>`).join('');
    state.moduleId=mods[0]?.id||'arith'; state.module=mods[0]||null; els.module.value=state.moduleId;
    renderModuleConfig();
    els.module.onchange=()=>{state.moduleId=els.module.value; state.module=getMods().find(m=>m.id===state.moduleId); renderModuleConfig();};
    els.start.onclick=start;
    buildKp('blue',els.kpBlue); buildKp('red',els.kpRed); upd();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
