// mod-chem.js
(function(){
  // utilitats locals (evitem dependències excepte choice del main)
  function shuffle(a){ const r=[...a]; for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [r[i],r[j]]=[r[j],r[i]];} return r; }

  // llista bàsica ESO (pots ampliar), amb grup simplificat per a classificar
  const E = [
  { num:1,  sym:"H",  name:"Hidrogen" },
    { num:2,  sym:"He", name:"Heli" },
    { num:3,  sym:"Li", name:"Liti" },
    { num:4,  sym:"Be", name:"Beril·li" },
    { num:5,  sym:"B",  name:"Bor" },
    { num:6,  sym:"C",  name:"Carboni" },
    { num:7,  sym:"N",  name:"Nitrogen" },
    { num:8,  sym:"O",  name:"Oxigen" },
    { num:9,  sym:"F",  name:"Fluor" },
    { num:10, sym:"Ne", name:"Neó" },
    { num:11, sym:"Na", name:"Sodi" },
    { num:12, sym:"Mg", name:"Magnesi" },
    { num:13, sym:"Al", name:"Alumini" },
    { num:14, sym:"Si", name:"Silici" },
    { num:15, sym:"P",  name:"Fòsfor" },
    { num:16, sym:"S",  name:"Sofre" },
    { num:17, sym:"Cl", name:"Clor" },
    { num:18, sym:"Ar", name:"Argó" },
    { num:19, sym:"K",  name:"Potassi" },
    { num:20, sym:"Ca", name:"Calci" },
    { num:21, sym:"Sc", name:"Escandi" },
    { num:22, sym:"Ti", name:"Titani" },
    { num:23, sym:"V",  name:"Vanadi" },
    { num:24, sym:"Cr", name:"Crom" },
    { num:25, sym:"Mn", name:"Manganès" },
    { num:26, sym:"Fe", name:"Ferro" },
    { num:27, sym:"Co", name:"Cobalt" },
    { num:28, sym:"Ni", name:"Níquel" },
    { num:29, sym:"Cu", name:"Coure" },
    { num:30, sym:"Zn", name:"Zinc" },
    { num:31, sym:"Ga", name:"Gal·li" },
    { num:32, sym:"Ge", name:"Germani" },
    { num:33, sym:"As", name:"Arsènic" },
    { num:34, sym:"Se", name:"Seleni" },
    { num:35, sym:"Br", name:"Brom" },
    { num:36, sym:"Kr", name:"Criptó" },
    { num:37, sym:"Rb", name:"Rubidi" },
    { num:38, sym:"Sr", name:"Estronci" },
    { num:39, sym:"Y",  name:"Itri" },
    { num:40, sym:"Zr", name:"Zirconi" },
    { num:41, sym:"Nb", name:"Niobi" },
    { num:42, sym:"Mo", name:"Molibdè" },
    { num:43, sym:"Tc", name:"Tecneci" },
    { num:44, sym:"Ru", name:"Ruteni" },
    { num:45, sym:"Rh", name:"Rodi" },
    { num:46, sym:"Pd", name:"Pal·ladi" },
    { num:47, sym:"Ag", name:"Plata" },
    { num:48, sym:"Cd", name:"Cadmi" },
    { num:49, sym:"In", name:"Indi" },
    { num:50, sym:"Sn", name:"Estany" },
    { num:51, sym:"Sb", name:"Antimoni" },
    { num:52, sym:"Te", name:"Tel·luri" },
    { num:53, sym:"I",  name:"Iode" },
    { num:54, sym:"Xe", name:"Xenó" },
    { num:55, sym:"Cs", name:"Cesi" },
    { num:56, sym:"Ba", name:"Bari" },
    { num:57, sym:"La", name:"Lantani" },
    { num:58, sym:"Ce", name:"Ceri" },
    { num:59, sym:"Pr", name:"Praseodimi" },
    { num:60, sym:"Nd", name:"Neodimi" },
    { num:61, sym:"Pm", name:"Prometi" },
    { num:62, sym:"Sm", name:"Samari" },
    { num:63, sym:"Eu", name:"Europi" },
    { num:64, sym:"Gd", name:"Gadolini" },
    { num:65, sym:"Tb", name:"Terbi" },
    { num:66, sym:"Dy", name:"Disprosi" },
    { num:67, sym:"Ho", name:"Holmi" },
    { num:68, sym:"Er", name:"Erbi" },
    { num:69, sym:"Tm", name:"Tuli" },
    { num:70, sym:"Yb", name:"Itterbi" },
    { num:71, sym:"Lu", name:"Luteci" },
    { num:72, sym:"Hf", name:"Hafni" },
    { num:73, sym:"Ta", name:"Tàntal" },
    { num:74, sym:"W",  name:"Wolframi" },
    { num:75, sym:"Re", name:"Renni" },
    { num:76, sym:"Os", name:"Osmi" },
    { num:77, sym:"Ir", name:"Iridi" },
    { num:78, sym:"Pt", name:"Plató" },  // També s'accepta "Platí" en català
    { num:79, sym:"Au", name:"Or" },
    { num:80, sym:"Hg", name:"Mercuri" },
    { num:81, sym:"Tl", name:"Tal·li" },
    { num:82, sym:"Pb", name:"Plom" },
    { num:83, sym:"Bi", name:"Bismut" },
    { num:84, sym:"Po", name:"Poloni" },
    { num:85, sym:"At", name:"Àstat" },
    { num:86, sym:"Rn", name:"Radó" },
    { num:87, sym:"Fr", name:"Franci" },
    { num:88, sym:"Ra", name:"Radi" },
    { num:89, sym:"Ac", name:"Actini" },
    { num:90, sym:"Th", name:"Tori" },
    { num:91, sym:"Pa", name:"Protactini" },
    { num:92, sym:"U",  name:"Urani" },
    { num:93, sym:"Np", name:"Neptuni" },
    { num:94, sym:"Pu", name:"Plutoni" },
    { num:95, sym:"Am", name:"Americi" },
    { num:96, sym:"Cm", name:"Curi" },
    { num:97, sym:"Bk", name:"Berqueli" },
    { num:98, sym:"Cf", name:"Californi" },
    { num:99, sym:"Es", name:"Einsteini" },
    { num:100,sym:"Fm", name:"Fermi" },
    { num:101,sym:"Md", name:"Mendelevi" },
    { num:102,sym:"No", name:"Nobeli" },
    { num:103,sym:"Lr", name:"Lawrenci" },
    { num:104,sym:"Rf", name:"Rutherfordi" },
    { num:105,sym:"Db", name:"Dubni" },
    { num:106,sym:"Sg", name:"Seaborgi" },
    { num:107,sym:"Bh", name:"Bohri" },
    { num:108,sym:"Hs", name:"Hassi" },
    { num:109,sym:"Mt", name:"Meitneri" },
    { num:110,sym:"Ds", name:"Darmstadi" },
    { num:111,sym:"Rg", name:"Roentgeni" },
    { num:112,sym:"Cn", name:"Copernici" },
    { num:113,sym:"Nh", name:"Nihoni" },
    { num:114,sym:"Fl", name:"Flerovi" },
    { num:115,sym:"Mc", name:"Moscovi" },
    { num:116,sym:"Lv", name:"Livermori" },
    { num:117,sym:"Ts", name:"Tenessi" },
    { num:118,sym:"Og", name:"Oganessó" }
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
