// mod-chem.js
(function(){
  // utilitats locals (evitem dependències excepte choice del main)
  function shuffle(a){ const r=[...a]; for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [r[i],r[j]]=[r[j],r[i]];} return r; }

  // llista bàsica ESO (pots ampliar), amb grup simplificat per a classificar
  const E = [
    {num:1,sym:'H', name:'Hidrogen', group:'no metall'},
    {num:2,sym:'He',name:'Heli', group:'gas noble'},
    {num:3,sym:'Li',name:'Liti', group:'metall alcalí'},
    {num:4,sym:'Be',name:'Beril·li', group:'metall alcalinoterri'},
    {num:5,sym:'B', name:'Bor', group:'no metall'},
    {num:6,sym:'C', name:'Carboni', group:'no metall'},
    {num:7,sym:'N', name:'Nitrogen', group:'no metall'},
    {num:8,sym:'O', name:'Oxigen', group:'no metall'},
    {num:9,sym:'F', name:'Fluor', group:'no metall'},
    {num:10,sym:'Ne',name:'Neó', group:'gas noble'},
    {num:11,sym:'Na',name:'Sodi', group:'metall alcalí'},
    {num:12,sym:'Mg',name:'Magnesi', group:'metall alcalinoterri'},
    {num:13,sym:'Al',name:'Alumini', group:'metall'},
    {num:14,sym:'Si',name:'Silici', group:'no metall'},
    {num:15,sym:'P', name:'Fòsfor', group:'no metall'},
    {num:16,sym:'S', name:'Sofre', group:'no metall'},
    {num:17,sym:'Cl',name:'Clor', group:'no metall'},
    {num:18,sym:'Ar',name:'Argó', group:'gas noble'},
    {num:19,sym:'K', name:'Potassi', group:'metall alcalí'},
    {num:20,sym:'Ca',name:'Calci', group:'metall alcalinoterri'},
    {num:26,sym:'Fe',name:'Ferro', group:'metall'},
    {num:29,sym:'Cu',name:'Coure', group:'metall'},
    {num:30,sym:'Zn',name:'Zinc', group:'metall'},
    {num:47,sym:'Ag',name:'Plata', group:'metall'},
    {num:79,sym:'Au',name:'Or', group:'metall'},
    {num:80,sym:'Hg',name:'Mercuri', group:'metall'},
    {num:82,sym:'Pb',name:'Plom', group:'metall'},
    {num:50,sym:'Sn',name:'Estany', group:'metall'}
  ];

  // —————————————— 1) QUIZ RÀPID (símbol ↔ nom) ——————————————
  function genSpeed(level, opts={}){
    const el = choice(E);
    const dir = opts.dir || (Math.random()<0.5?'sym2name':'name2sym'); // simula "ràpid"
    if(dir==='sym2name'){
      const answers = shuffle([el.name, ...shuffle(E.filter(x=>x!==el).map(x=>x.name)).slice(0,3)]);
      return { type:'chem-speed', text:`Quin element té el símbol <b>${el.sym}</b>?`, options:answers, answer: el.name };
    }else{
      const answers = shuffle([el.sym, ...shuffle(E.filter(x=>x!==el).map(x=>x.sym)).slice(0,3)]);
      return { type:'chem-speed', text:`Quin és el símbol de <b>${el.name}</b>?`, options:answers, answer: el.sym };
    }
  }

  // —————————————— 3) CONSTRUIR COMPOSTOS (MCQ) ——————————————
  const COMPOUNDS = [
    { syms:['Na','Cl'], name:'Clorur de sodi (NaCl)' },
    { syms:['H','O'],   name:'Aigua (H₂O)' },
    { syms:['C','O'],   name:'Diòxid de carboni (CO₂)' },
    { syms:['Fe','O'],  name:'Òxid de ferro(III) (Fe₂O₃)' },
    { syms:['H','Cl'],  name:'Àcid clorhídric (HCl)' },
    { syms:['Ca','O'],  name:'Òxid de calci (CaO)' },
  ];
  function genCompounds(){
    const c = choice(COMPOUNDS);
    const opts = shuffle([c.name, ...shuffle(COMPOUNDS.filter(x=>x!==c).map(x=>x.name)).slice(0,3)]);
    return { type:'chem-comp', text:`Quin compost formen <b>${c.syms.join(' + ')}</b>?`, options:opts, answer:c.name };
  }

  // —————————————— 4) MAPA INTERACTIU (mini-taula SVG) ——————————————
  // fem una taula reduïda (grups 1–2 i 13–18, períodes 1–4) amb ~20 elements d'ESO
  const MINI = [
    // period 1
    {sym:'H',  col:1, row:1}, {sym:'He', col:18,row:1},
    // period 2
    {sym:'Li', col:1, row:2}, {sym:'Be', col:2, row:2}, {sym:'B', col:13,row:2}, {sym:'C', col:14,row:2}, {sym:'N', col:15,row:2}, {sym:'O', col:16,row:2}, {sym:'F', col:17,row:2}, {sym:'Ne',col:18,row:2},
    // period 3
    {sym:'Na', col:1, row:3}, {sym:'Mg', col:2, row:3}, {sym:'Al', col:13,row:3}, {sym:'Si',col:14,row:3}, {sym:'P', col:15,row:3}, {sym:'S', col:16,row:3}, {sym:'Cl',col:17,row:3}, {sym:'Ar',col:18,row:3},
    // period 4 (una mica)
    {sym:'K',  col:1, row:4}, {sym:'Ca',col:2,row:4}
  ];
  // helper global per clicar dins l’SVG
  window.__chemPick = function(sym){ const a=$('#answer'); if(!a) return; a.value = sym; checkAnswer(); };

  function miniTableSVG(targetSym){
    const cellW=34, cellH=34, gap=6, left=10, top=10;
    const cols=18, rows=4;
    function xy(col,row){ const x=left+(col-1)*(cellW+gap); const y=top+(row-1)*(cellH+gap); return {x,y}; }
    const cells = MINI.map(e=>{
      const {x,y} = xy(e.col,e.row);
      const isTarget = e.sym===targetSym;
      return `
        <g>
          <rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="5" ry="5"
            fill="${isTarget?'#fde68a':'#f8fafc'}" stroke="#94a3b8" onclick="__chemPick('${e.sym}')" style="cursor:pointer"/>
          <text x="${x+cellW/2}" y="${y+cellH/2+4}" text-anchor="middle" font-size="12" fill="#111827">${e.sym}</text>
        </g>`;
    }).join('');
    const W=left+(cellW+gap)*cols, H=top+(cellH+gap)*rows;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mini taula periòdica">${cells}</svg>`;
  }

  function genMap(){
    const subset = E.filter(e=>MINI.some(m=>m.sym===e.sym));
    const el = choice(subset);
    return {
      type:'chem-map',
      text:`Clica la casella de l’element <b>${el.name}</b> (${el.sym}) a la mini-taula:`,
      html: miniTableSVG(el.sym),
      answer: el.sym
    };
  }

  // —————————————— 5) CLASSIFICACIÓ RÀPIDA (tria el grup) ——————————————
  const GROUPS = ['metall alcalí','metall alcalinoterri','metall','no metall','gas noble'];
  function genClassify(){
    const el = choice(E);
    const opts = shuffle([el.group, ...shuffle(GROUPS.filter(g=>g!==el.group)).slice(0,3)]);
    return { type:'chem-class', text:`A quin grup pertany <b>${el.name}</b>?`, options:opts, answer: el.group };
  }

  // —————————————— GENERADOR PRINCIPAL ——————————————
  function genChem(level, opts={}){
    const sub = opts.sub || 'speed'; // speed | compounds | map | classify
    if(sub==='compounds') return genCompounds();
    if(sub==='map')       return genMap();
    if(sub==='classify')  return genClassify();

    // default: speed (simbol ↔ nom). Recomanat posar un temps curt al config global.
    const dir = opts.dir || null; // opcional: 'sym2name' o 'name2sym'
    return genSpeed(level, {dir});
  }

  // —————————————— CONFIG UI ——————————————
  const chemConfig = {
    render: ()=>{
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="section-title">Modes de química</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Mode">
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="speed" checked> Quiz ràpid (símbol ↔ nom)</label>
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="compounds"> Construir compostos</label>
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="map"> Mapa interactiu</label>
            <label class="toggle"><input class="check" type="radio" name="chem-sub" value="classify"> Classificació ràpida</label>
          </div>
        </div>
        <div class="controls">
          <div class="group" role="group" aria-label="Direcció (només quiz ràpid)">
            <label class="toggle"><input class="check" type="radio" name="chem-dir" value="auto" checked> Auto</label>
            <label class="toggle"><input class="check" type="radio" name="chem-dir" value="sym2name"> Símbol → Nom</label>
            <label class="toggle"><input class="check" type="radio" name="chem-dir" value="name2sym"> Nom → Símbol</label>
          </div>
        </div>
        <div class="subtitle">Consell: per al “Quiz ràpid”, al panell principal posa un <b>temps curt</b> (p. ex. 1–2 min).</div>
      `;
      return div;
    },
    collect: ()=>{
      const sub = document.querySelector('input[name="chem-sub"]:checked')?.value || 'speed';
      const dirRaw = document.querySelector('input[name="chem-dir"]:checked')?.value || 'auto';
      const dir = (dirRaw==='auto')? null : dirRaw;
      return { sub, dir };
    }
  };

  // —————————————— REGISTRE DEL MÒDUL ——————————————
  window.addModules([{
    id:'chem',
    name:'Química – Jocs taula periòdica',
    desc:'Quiz ràpid, compostos, mapa interactiu i classificació.',
    badge:'⚗️',
    gen: genChem,
    category:'sci',
    config: chemConfig
  }]);
})();
