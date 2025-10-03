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

  // —————————————— TAULA PERIÒDICA COMPLETA (amb colors i noms) ——————————————
const PERIODIC = [
  // Període 1
  {num:1, sym:'H',  name:'Hidrogen',     col:1,  row:1, group:'no-metal'},
  {num:2, sym:'He', name:'Heli',         col:18, row:1, group:'gas-noble'},

  // Període 2
  {num:3, sym:'Li', name:'Liti',         col:1,  row:2, group:'alcalí'},
  {num:4, sym:'Be', name:'Beril·li',     col:2,  row:2, group:'alcalinoterri'},
  {num:5, sym:'B',  name:'Bor',          col:13, row:2, group:'metaloide'},
  {num:6, sym:'C',  name:'Carboni',      col:14, row:2, group:'no-metal'},
  {num:7, sym:'N',  name:'Nitrogen',     col:15, row:2, group:'no-metal'},
  {num:8, sym:'O',  name:'Oxigen',       col:16, row:2, group:'no-metal'},
  {num:9, sym:'F',  name:'Fluor',        col:17, row:2, group:'no-metal'},
  {num:10,sym:'Ne', name:'Neó',          col:18, row:2, group:'gas-noble'},

  // Període 3
  {num:11,sym:'Na', name:'Sodi',         col:1,  row:3, group:'alcalí'},
  {num:12,sym:'Mg', name:'Magnesi',      col:2,  row:3, group:'alcalinoterri'},
  {num:13,sym:'Al', name:'Alumini',      col:13, row:3, group:'post-transició'},
  {num:14,sym:'Si', name:'Silici',       col:14, row:3, group:'metaloide'},
  {num:15,sym:'P',  name:'Fòsfor',       col:15, row:3, group:'no-metal'},
  {num:16,sym:'S',  name:'Sofre',        col:16, row:3, group:'no-metal'},
  {num:17,sym:'Cl', name:'Clor',         col:17, row:3, group:'no-metal'},
  {num:18,sym:'Ar', name:'Argó',         col:18, row:3, group:'gas-noble'},

  // Període 4
  {num:19,sym:'K',  name:'Potassi',      col:1,  row:4, group:'alcalí'},
  {num:20,sym:'Ca', name:'Calci',        col:2,  row:4, group:'alcalinoterri'},
  {num:21,sym:'Sc', name:'Escandi',      col:3,  row:4, group:'metall-transició'},
  {num:22,sym:'Ti', name:'Titani',       col:4,  row:4, group:'metall-transició'},
  {num:23,sym:'V',  name:'Vanadi',       col:5,  row:4, group:'metall-transició'},
  {num:24,sym:'Cr', name:'Crom',         col:6,  row:4, group:'metall-transició'},
  {num:25,sym:'Mn', name:'Manganès',     col:7,  row:4, group:'metall-transició'},
  {num:26,sym:'Fe', name:'Ferro',        col:8,  row:4, group:'metall-transició'},
  {num:27,sym:'Co', name:'Cobalt',       col:9,  row:4, group:'metall-transició'},
  {num:28,sym:'Ni', name:'Níquel',       col:10, row:4, group:'metall-transició'},
  {num:29,sym:'Cu', name:'Coure',        col:11, row:4, group:'metall-transició'},
  {num:30,sym:'Zn', name:'Zinc',         col:12, row:4, group:'metall-transició'},
  {num:31,sym:'Ga', name:'Gal·li',       col:13, row:4, group:'post-transició'},
  {num:32,sym:'Ge', name:'Germani',      col:14, row:4, group:'metaloide'},
  {num:33,sym:'As', name:'Arsènic',      col:15, row:4, group:'metaloide'},
  {num:34,sym:'Se', name:'Seleni',       col:16, row:4, group:'no-metal'},
  {num:35,sym:'Br', name:'Brom',         col:17, row:4, group:'no-metal'},
  {num:36,sym:'Kr', name:'Criptó',       col:18, row:4, group:'gas-noble'},

  // Període 5
  {num:37,sym:'Rb', name:'Rubidi',       col:1,  row:5, group:'alcalí'},
  {num:38,sym:'Sr', name:'Estronci',     col:2,  row:5, group:'alcalinoterri'},
  {num:39,sym:'Y',  name:'Itrí',         col:3,  row:5, group:'metall-transició'},
  {num:40,sym:'Zr', name:'Zirconi',      col:4,  row:5, group:'metall-transició'},
  {num:41,sym:'Nb', name:'Niobi',        col:5,  row:5, group:'metall-transició'},
  {num:42,sym:'Mo', name:'Molibdè',      col:6,  row:5, group:'metall-transició'},
  {num:43,sym:'Tc', name:'Tecneci',      col:7,  row:5, group:'metall-transició'},
  {num:44,sym:'Ru', name:'Ruteni',       col:8,  row:5, group:'metall-transició'},
  {num:45,sym:'Rh', name:'Rodi',         col:9,  row:5, group:'metall-transició'},
  {num:46,sym:'Pd', name:'Pal·ladi',     col:10, row:5, group:'metall-transició'},
  {num:47,sym:'Ag', name:'Plata',        col:11, row:5, group:'metall-transició'},
  {num:48,sym:'Cd', name:'Cadmi',        col:12, row:5, group:'metall-transició'},
  {num:49,sym:'In', name:'Indi',         col:13, row:5, group:'post-transició'},
  {num:50,sym:'Sn', name:'Estany',       col:14, row:5, group:'post-transició'},
  {num:51,sym:'Sb', name:'Antimoni',     col:15, row:5, group:'metaloide'},
  {num:52,sym:'Te', name:'Tel·luri',     col:16, row:5, group:'metaloide'},
  {num:53,sym:'I',  name:'Iode',         col:17, row:5, group:'no-metal'},
  {num:54,sym:'Xe', name:'Xenó',         col:18, row:5, group:'gas-noble'},

  // Període 6
  {num:55,sym:'Cs', name:'Cesi',         col:1,  row:6, group:'alcalí'},
  {num:56,sym:'Ba', name:'Bari',         col:2,  row:6, group:'alcalinoterri'},
  {num:57,sym:'La', name:'Lantani',      col:3,  row:9, group:'lantànid'},
  {num:58,sym:'Ce', name:'Ceri',         col:4,  row:9, group:'lantànid'},
  {num:59,sym:'Pr', name:'Praseodimi',   col:5,  row:9, group:'lantànid'},
  {num:60,sym:'Nd', name:'Neodimi',      col:6,  row:9, group:'lantànid'},
  {num:61,sym:'Pm', name:'Prometi',      col:7,  row:9, group:'lantànid'},
  {num:62,sym:'Sm', name:'Samari',       col:8,  row:9, group:'lantànid'},
  {num:63,sym:'Eu', name:'Europi',       col:9,  row:9, group:'lantànid'},
  {num:64,sym:'Gd', name:'Gadolini',     col:10, row:9, group:'lantànid'},
  {num:65,sym:'Tb', name:'Terbi',        col:11, row:9, group:'lantànid'},
  {num:66,sym:'Dy', name:'Disprosi',     col:12, row:9, group:'lantànid'},
  {num:67,sym:'Ho', name:'Holmi',        col:13, row:9, group:'lantànid'},
  {num:68,sym:'Er', name:'Erbi',         col:14, row:9, group:'lantànid'},
  {num:69,sym:'Tm', name:'Tuli',         col:15, row:9, group:'lantànid'},
  {num:70,sym:'Yb', name:'Iterbi',       col:16, row:9, group:'lantànid'},
  {num:71,sym:'Lu', name:'Luteci',       col:17, row:9, group:'lantànid'},
  {num:72,sym:'Hf', name:'Hafni',        col:4,  row:6, group:'metall-transició'},
  {num:73,sym:'Ta', name:'Tàntal',       col:5,  row:6, group:'metall-transició'},
  {num:74,sym:'W',  name:'Tungstè',      col:6,  row:6, group:'metall-transició'},
  {num:75,sym:'Re', name:'Renni',        col:7,  row:6, group:'metall-transició'},
  {num:76,sym:'Os', name:'Osmi',         col:8,  row:6, group:'metall-transició'},
  {num:77,sym:'Ir', name:'Iridi',        col:9,  row:6, group:'metall-transició'},
  {num:78,sym:'Pt', name:'Platí',        col:10, row:6, group:'metall-transició'},
  {num:79,sym:'Au', name:'Or',           col:11, row:6, group:'metall-transició'},
  {num:80,sym:'Hg', name:'Mercuri',      col:12, row:6, group:'metall-transició'},
  {num:81,sym:'Tl', name:'Tal·li',       col:13, row:6, group:'post-transició'},
  {num:82,sym:'Pb', name:'Plom',         col:14, row:6, group:'post-transició'},
  {num:83,sym:'Bi', name:'Bismut',       col:15, row:6, group:'post-transició'},
  {num:84,sym:'Po', name:'Poloni',       col:16, row:6, group:'metaloide'},
  {num:85,sym:'At', name:'Àstat',        col:17, row:6, group:'no-metal'},
  {num:86,sym:'Rn', name:'Radó',         col:18, row:6, group:'gas-noble'},

  // Període 7
  {num:87,sym:'Fr', name:'Franci',       col:1,  row:7, group:'alcalí'},
  {num:88,sym:'Ra', name:'Radi',         col:2,  row:7, group:'alcalinoterri'},
  {num:89,sym:'Ac', name:'Actini',       col:3,  row:10,group:'actínid'},
  {num:90,sym:'Th', name:'Tori',         col:4,  row:10,group:'actínid'},
  {num:91,sym:'Pa', name:'Protactini',   col:5,  row:10,group:'actínid'},
  {num:92,sym:'U',  name:'Urani',        col:6,  row:10,group:'actínid'},
  {num:93,sym:'Np', name:'Neptuni',      col:7,  row:10,group:'actínid'},
  {num:94,sym:'Pu', name:'Plutoni',      col:8,  row:10,group:'actínid'},
  {num:95,sym:'Am', name:'Americi',      col:9,  row:10,group:'actínid'},
  {num:96,sym:'Cm', name:'Curi',         col:10, row:10,group:'actínid'},
  {num:97,sym:'Bk', name:'Berkeli',      col:11, row:10,group:'actínid'},
  {num:98,sym:'Cf', name:'Californi',    col:12, row:10,group:'actínid'},
  {num:99,sym:'Es', name:'Einsteini',    col:13, row:10,group:'actínid'},
  {num:100,sym:'Fm',name:'Fermi',        col:14, row:10,group:'actínid'},
  {num:101,sym:'Md',name:'Mendelvi',     col:15, row:10,group:'actínid'},
  {num:102,sym:'No',name:'Nobeli',       col:16, row:10,group:'actínid'},
  {num:103,sym:'Lr',name:'Lawrenci',     col:17, row:10,group:'actínid'},
  {num:104,sym:'Rf',name:'Rutherfordi',  col:4,  row:7, group:'metall-transició'},
  {num:105,sym:'Db',name:'Dubni',        col:5,  row:7, group:'metall-transició'},
  {num:106,sym:'Sg',name:'Seaborgi',     col:6,  row:7, group:'metall-transició'},
  {num:107,sym:'Bh',name:'Bohri',        col:7,  row:7, group:'metall-transició'},
  {num:108,sym:'Hs',name:'Hassi',        col:8,  row:7, group:'metall-transició'},
  {num:109,sym:'Mt',name:'Meitneri',     col:9,  row:7, group:'metall-transició'},
  {num:110,sym:'Ds',name:'Darmstadti',   col:10, row:7, group:'metall-transició'},
  {num:111,sym:'Rg',name:'Roentgeni',    col:11, row:7, group:'metall-transició'},
  {num:112,sym:'Cn',name:'Coperni',      col:12, row:7, group:'metall-transició'},
  {num:113,sym:'Nh',name:'Nihoni',       col:13, row:7, group:'post-transició'},
  {num:114,sym:'Fl',name:'Flerovi',      col:14, row:7, group:'post-transició'},
  {num:115,sym:'Mc',name:'Moscovi',      col:15, row:7, group:'post-transició'},
  {num:116,sym:'Lv',name:'Livermori',    col:16, row:7, group:'post-transició'},
  {num:117,sym:'Ts',name:'Tenessi',      col:17, row:7, group:'no-metal'},
  {num:118,sym:'Og',name:'Oganessó',     col:18, row:7, group:'gas-noble'}
];

// 🎨 Paleta de colors per grups
const GROUP_COLORS = {
  'alcalí': '#93c5fd',          // blau clar
  'alcalinoterri': '#fca5a5',   // vermell clar
  'metall-transició': '#c4b5fd',// lila
  'post-transició': '#86efac',  // verd clar
  'metaloide': '#fde68a',       // groc
  'no-metal': '#bae6fd',        // blau cel
  'gas-noble': '#f9a8d4',       // rosa
  'lantànid': '#fdba74',        // taronja
  'actínid': '#fcd34d'          // marró groguenc
};

function periodicTableSVG(targetSym){
  const cellW=60, cellH=60, gap=6, left=10, top=10;
  const cols=18, rows=10;
  function xy(col,row){
    return {x:left+(col-1)*(cellW+gap), y:top+(row-1)*(cellH+gap)};
  }

  const cells = PERIODIC.map(e=>{
    const {x,y} = xy(e.col,e.row);
    const color = GROUP_COLORS[e.group] || '#f3f4f6';
    return `
      <g onclick="__chemPick('${e.sym}')" style="cursor:pointer">
        <rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="6" ry="6"
          fill="${color}" stroke="#1e293b"/>
        <text x="${x+cellW/2}" y="${y+20}" text-anchor="middle"
          font-size="16" font-weight="bold" fill="#111">${e.sym}</text>
        <text x="${x+cellW/2}" y="${y+40}" text-anchor="middle"
          font-size="11" fill="#111">${e.name}</text>
      </g>`;
  }).join('');

  const W=left+(cellW+gap)*cols, H=top+(cellH+gap)*rows;
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Taula periòdica">${cells}</svg>`;
}

function genMap(){
  const el = choice(E);
  return {
    type:'chem-map',
    text:`Clica la casella de l’element <b>${el.name}</b> a la taula periòdica:`,
    html: periodicTableSVG(el.sym),
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

    // Funció global per quan es fa clic a la taula periòdica
window.__chemPick = function(sym){
  const a = document.querySelector('#answer');
  if(!a) return;
  a.value = sym;

  // Opció A: l’alumne encara ha de prémer "Comprova"
  // --> amb això ja tens l’input omplert

  // Opció B: que es corregeixi directament al clicar
  const btn = document.querySelector('#btnCheck');
  if(btn) btn.click();
};
})();

// mod-chem-compounds.js
(function(){

  // utilitat per barrejar opcions
  function shuffle(a){ const r=[...a]; for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [r[i],r[j]]=[r[j],r[i]];} return r; }

  // ===============================
  // 1) Valències i ions
  // ===============================
  const VALENCES = [
    { el:"Na", val:"+1" },
    { el:"K",  val:"+1" },
    { el:"Ca", val:"+2" },
    { el:"Mg", val:"+2" },
    { el:"Al", val:"+3" },
    { el:"Cl", val:"-1" },
    { el:"O",  val:"-2" },
    { el:"S",  val:"-2" },
    { el:"N",  val:"-3" },
    { el:"H",  val:"+1" }
  ];
  function genValence(){
    const e = VALENCES[Math.floor(Math.random()*VALENCES.length)];
    const opts = shuffle([e.val, ...shuffle(VALENCES.filter(x=>x!==e).map(x=>x.val)).slice(0,3)]);
    return { 
      type:'chem-valence',
      text:`Quina valència té l’element <b>${e.el}</b>?`,
      options: opts,
      answer: e.val
    };
  }

  // ===============================
  // 2) Fórmules bàsiques
  // ===============================
  const FORMULAS = [
    { name:"Òxid de calci", formula:"CaO" },
    { name:"Aigua", formula:"H₂O" },
    { name:"Diòxid de carboni", formula:"CO₂" },
    { name:"Clorur de sodi", formula:"NaCl" },
    { name:"Amoníac", formula:"NH₃" },
    { name:"Metà", formula:"CH₄" },
    { name:"Àcid clorhídric", formula:"HCl" },
    { name:"Òxid de ferro (III)", formula:"Fe₂O₃" }
  ];
  function genFormulas(){
    const f = FORMULAS[Math.floor(Math.random()*FORMULAS.length)];
    const dir = Math.random()<0.5 ? 'name2formula' : 'formula2name';
    if(dir==='name2formula'){
      return { 
        type:'chem-formula',
        text:`Escriu la fórmula de: <b>${f.name}</b>`,
        answer: f.formula,
        input: "text"
      };
    }else{
      return { 
        type:'chem-formula',
        text:`Quin és el nom de la fórmula <b>${f.formula}</b>?`,
        answer: f.name,
        input: "text"
      };
    }
  }

  // ===============================
  // 3) Compostos moleculars
  // ===============================
  const MOLECULARS = [
    { formula:"CO", name:"Monòxid de carboni" },
    { formula:"CO₂", name:"Diòxid de carboni" },
    { formula:"H₂O", name:"Aigua" },
    { formula:"NH₃", name:"Amoníac" },
    { formula:"CH₄", name:"Metà" },
    { formula:"O₂",  name:"Oxigen" },
    { formula:"N₂",  name:"Nitrogen" }
  ];
  function genMolecular(){
    const m = MOLECULARS[Math.floor(Math.random()*MOLECULARS.length)];
    const opts = shuffle([m.name, ...shuffle(MOLECULARS.filter(x=>x!==m).map(x=>x.name)).slice(0,3)]);
    return { 
      type:'chem-molecular',
      text:`A quin compost correspon la fórmula <b>${m.formula}</b>?`,
      options: opts,
      answer: m.name
    };
  }

  // ===============================
  // Generador principal
  // ===============================
  function genCompounds(level, opts={}){
    const sub = opts.sub || 'valence'; // valence | formulas | molecular
    if(sub==='formulas') return genFormulas();
    if(sub==='molecular') return genMolecular();
    return genValence();
  }

  // ===============================
  // Configuració UI
  // ===============================
  const compoundsConfig = {
    render: ()=>{
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="section-title">Modes de fórmules i compostos</div>
        <div class="controls">
          <label class="toggle"><input class="check" type="radio" name="comp-sub" value="valence" checked> Valències i ions</label>
          <label class="toggle"><input class="check" type="radio" name="comp-sub" value="formulas"> Fórmules bàsiques</label>
          <label class="toggle"><input class="check" type="radio" name="comp-sub" value="molecular"> Compostos moleculars</label>
        </div>
      `;
      return div;
    },
    collect: ()=>{
      const sub = document.querySelector('input[name="comp-sub"]:checked')?.value || 'valence';
      return { sub };
    }
  };

// Registrar els dos mòduls
  window.addModules([{
    id:'chem',
    name:'Taula periòdica',
    desc:'Quiz ràpid, compostos, mapa interactiu i classificació.',
    badge:'⚗️',
    gen: genChem,
    category:'sci',
    config: chemConfig
  },{
    id:'chem-compounds',
    name:'Química – Fórmules i compostos',
    desc:'Valències, fórmules bàsiques i compostos moleculars.',
    badge:'🧪',
    gen: genCompounds,
    category:'sci',
    config: compoundsConfig
  }]);

})();
