// mod-chem.js
(function(){
  // utilitats locals (evitem dependències excepte choice del main)
  function shuffle(a){ const r=[...a]; for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [r[i],r[j]]=[r[j],r[i]];} return r; }
  const pick = typeof window.choice === 'function'
    ? window.choice
    : (arr) => arr[Math.floor(Math.random() * arr.length)];

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
    { num:78, sym:"Pt", name:"Platí" },
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
    const el = pick(E);
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
     // Òxids bàsics
  { syms:['Fe','O'],  name:'Òxid de ferro(III)' },
  { syms:['Cu','O'],  name:'Òxid de coure(II)' },
  { syms:['Ca','O'],  name:'Òxid de calci' },
  { syms:['Mg','O'],  name:'Òxid de magnesi' },
  { syms:['Al','O'],  name:'Òxid d’alumini' },

  // Òxids no metàl·lics
  { syms:['C','O'],   name:'Diòxid de carboni' },
  { syms:['N','O'],   name:'Diòxid de nitrogen' },
  { syms:['S','O'],   name:'Triòxid de sofre' },
  { syms:['P','O'],   name:'Pentòxid de difòsfor' },

  // Hidràcids
  { syms:['H','Cl'],  name:'Àcid clorhídric' },
  { syms:['H','S'],   name:'Àcid sulfhídric' },
  { syms:['H','Br'],  name:'Àcid bromhídric' },
  { syms:['H','I'],   name:'Àcid iodhídric' },
  { syms:['H','F'],   name:'Àcid fluorhídric' },

  // Oxiàcids
  { syms:['H','N','O'], name:'Àcid nítric' },
  { syms:['H','S','O'], name:'Àcid sulfúric' },
  { syms:['H','C','O'], name:'Àcid carbònic' },
  { syms:['H','P','O'], name:'Àcid fosfòric' },

  // Hidròxids
  { syms:['Na','O','H'], name:'Hidròxid de sodi' },
  { syms:['K','O','H'],  name:'Hidròxid de potassi' },
  { syms:['Ca','O','H'], name:'Hidròxid de calci' },
  { syms:['Fe','O','H'], name:'Hidròxid de ferro(III)' },
  { syms:['Al','O','H'], name:'Hidròxid d’alumini' },

  // Sals neutres
  { syms:['Na','Cl'], name:'Clorur de sodi' },
  { syms:['K','Br'],  name:'Bromur de potassi' },
  { syms:['Ca','Cl'], name:'Clorur de calci' },
  { syms:['Na','NO₃'], name:'Nitrat de sodi' },
  { syms:['K','NO₃'],  name:'Nitrat de potassi' },
  { syms:['Ca','CO₃'], name:'Carbonat de calci' },
  { syms:['Na₂SO₄'], name:'Sulfat de sodi' },
  { syms:['Cu','SO₄'], name:'Sulfat de coure(II)' },

  // Compostos moleculars senzills
  { syms:['H','O'],   name:'Aigua (H₂O)' },
  { syms:['NH₃'],  name:'Amoníac (NH₃)' },
  { syms:['CH₄'],  name:'Metà (CH₄)' },
  { syms:['C₂H₆O'],  name:'Etanol (C₂H₆O)' },
  { syms:['CO'],      name:'Monòxid de carboni (CO)' },

  // Altres compostos interessants
  { syms:['Na','HCO₃'], name:'Bicarbonat de sodi' },
  { syms:['Ca','SO₄'],  name:'Sulfat de calci' },
  { syms:['Fe₂S₃'], name:'Sulfur de ferro(III)' },
  { syms:['Ag','NO₃'],  name:'Nitrat de plata' },
  { syms:['ZnCl₂'],  name:'Clorur de zinc' },
  { syms:['Na₂CO₃'], name:'Carbonat de sodi' },
  { syms:['KMnO₄'], name:'Permanganat de potassi' },
  { syms:['NH₄Cl'], name:"Clorur d'amoni" },
  { syms:['CuSO₄·5H₂O'], name:'Sulfat de coure(II) pentahidrat' },
  { syms:['Ca₃(PO₄)₂'], name:'Fosfat de calci' },
  { syms:['CH₃COOH'], name:'Àcid acètic' },
  { syms:['C₆H₁₂O₆'], name:'Glucosa' }
];
  function genCompounds(){
    const c = pick(COMPOUNDS);
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

const GROUP_DISPLAY_LABELS = {
  'alcalí': 'metall alcalí',
  'alcalinoterri': 'metall alcalinoterri',
  'metall-transició': 'metall de transició',
  'post-transició': 'metall post-transició',
  'metaloide': 'metaloide',
  'no-metal': 'no metall',
  'gas-noble': 'gas noble',
  'lantànid': 'lantànid',
  'actínid': 'actínid'
};

const GROUP_BY_SYMBOL = PERIODIC.reduce((acc, entry) => {
  acc[entry.sym] = entry.group;
  return acc;
}, {});

E.forEach((el) => {
  const code = GROUP_BY_SYMBOL[el.sym];
  el.groupCode = code;
  el.group = GROUP_DISPLAY_LABELS[code] || 'grup desconegut';
});

const GROUP_OPTIONS = [...new Set(E.map((el) => el.group).filter(Boolean))];

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
  const el = pick(E);
  return {
    type:'chem-map',
    text:`Clica la casella de l’element <b>${el.name}</b> a la taula periòdica:`,
    html: periodicTableSVG(el.sym),
    answer: el.sym
  };
}


  // —————————————— 5) CLASSIFICACIÓ RÀPIDA (tria el grup) ——————————————
  function genClassify(){
    const el = pick(E);
    const answer = el.group || 'grup desconegut';
    const distractors = shuffle(GROUP_OPTIONS.filter((g) => g !== answer)).slice(0, 3);
    const options = shuffle([answer].concat(distractors));
    return { type:'chem-class', text:`A quin grup pertany <b>${el.name}</b>?`, options, answer };
  }

  // —————————————— 6) EQUACIONS I TIPUS DE REACCIONS ——————————————
  const BALANCE_EXERCISES = [
    {
      unbalanced: 'H₂ + O₂ → H₂O',
      answer: '2H₂ + O₂ → 2H₂O',
      options: ['2H₂ + O₂ → 2H₂O', 'H₂ + O₂ → H₂O', 'H₂ + 2O₂ → H₂O₂', '4H₂ + O₂ → 4H₂O']
    },
    {
      unbalanced: 'Fe + O₂ → Fe₂O₃',
      answer: '4Fe + 3O₂ → 2Fe₂O₃',
      options: ['2Fe + O₂ → Fe₂O₃', '4Fe + 3O₂ → 2Fe₂O₃', 'Fe + O₂ → FeO', '3Fe + 2O₂ → Fe₃O₄']
    },
    {
      unbalanced: 'CaCO₃ → CaO + CO₂',
      answer: 'CaCO₃ → CaO + CO₂',
      options: ['CaCO₃ → CaO + CO₂', '2CaCO₃ → 2CaO + CO₂', 'CaCO₃ → Ca + CO₂', 'CaCO₃ → CaO + 2CO₂']
    },
    {
      unbalanced: 'Al + Cl₂ → AlCl₃',
      answer: '2Al + 3Cl₂ → 2AlCl₃',
      options: ['Al + Cl₂ → AlCl₃', '2Al + 3Cl₂ → 2AlCl₃', '2Al + Cl₂ → 2AlCl', '2Al + 2Cl₂ → 2AlCl₂']
    },
    {
      unbalanced: 'CH₄ + O₂ → CO₂ + H₂O',
      answer: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
      options: ['CH₄ + O₂ → CO₂ + H₂O', 'CH₄ + 2O₂ → CO₂ + 2H₂O', '2CH₄ + O₂ → 2CO₂ + H₂O', 'CH₄ + 3O₂ → CO₂ + 3H₂O']
    },
    {
      unbalanced: 'Zn + HCl → ZnCl₂ + H₂',
      answer: 'Zn + 2HCl → ZnCl₂ + H₂',
      options: ['Zn + HCl → ZnCl₂ + H₂', 'Zn + 2HCl → ZnCl₂ + H₂', '2Zn + HCl → 2ZnCl₂ + H₂', 'Zn + 2HCl → ZnCl + H₂']
    }
  ];
  function genBalance(){
    const q = pick(BALANCE_EXERCISES);
    return { type:'chem-rxn-balance', text:`Equilibra l’equació: <b>${q.unbalanced}</b>`, options: shuffle(q.options), answer: q.answer };
  }

  const REACTION_TYPES = [
    { eq:'2H₂ + O₂ → 2H₂O', type:'Síntesi (combinació)' },
    { eq:'CaCO₃ → CaO + CO₂', type:'Descomposició' },
    { eq:'Zn + 2HCl → ZnCl₂ + H₂', type:'Desplaçament simple' },
    { eq:'AgNO₃ + NaCl → AgCl + NaNO₃', type:'Desplaçament doble' },
    { eq:'CH₄ + 2O₂ → CO₂ + 2H₂O', type:'Combustió' },
    { eq:'HCl + NaOH → NaCl + H₂O', type:'Neutralització àcid-base' }
  ];
  const REACTION_TYPE_OPTIONS = Array.from(new Set(REACTION_TYPES.map((r)=>r.type)));
  function genReactionType(){
    const r = pick(REACTION_TYPES);
    const options = shuffle([r.type, ...shuffle(REACTION_TYPE_OPTIONS.filter((t)=>t!==r.type)).slice(0,3)]);
    return { type:'chem-rxn-type', text:`Quin tipus de reacció és <b>${r.eq}</b>?`, options, answer: r.type };
  }

  function genReactions(level, opts={}){
    const sub = opts.sub || 'balance';
    if(sub==='type') return genReactionType();
    return genBalance();
  }

  const reactionsConfig = {
    render: ()=>{
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="section-title">Modes d'equacions i reaccions</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Mode de treball">
            <label class="toggle">
              <input class="check" type="radio" name="rxn-sub" value="balance" checked>
              Equilibrar equacions
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="rxn-sub" value="type">
              Tipus de reacció
            </label>
          </div>
        </div>
        <div class="subtitle">Consell: fes servir les equacions equilibrades com a pista per deduir el tipus de reacció.</div>
      `;
      return div;
    },
    collect: ()=>{
      const sub = document.querySelector('input[name="rxn-sub"]:checked')?.value || 'balance';
      return { sub };
    }
  };

  // —————————————— MATÈRIA I CANVIS ——————————————
  const MATTER_OBJECTS = [
    { name:'aigua', isMatter:true },
    { name:'aire', isMatter:true },
    { name:'fusta', isMatter:true },
    { name:'ferro', isMatter:true },
    { name:'sorra', isMatter:true },
    { name:'llum', isMatter:false },
    { name:'so', isMatter:false },
    { name:'calor', isMatter:false },
    { name:'ombra', isMatter:false },
    { name:'electricitat', isMatter:false },
    { name:'temps', isMatter:false }
  ];
  const MATTER_YES = MATTER_OBJECTS.filter((m)=>m.isMatter);
  const MATTER_NO = MATTER_OBJECTS.filter((m)=>!m.isMatter);

  function genMatterMCQ(){
    const askMatter = Math.random() < 0.5;
    const correctPool = askMatter ? MATTER_YES : MATTER_NO;
    const wrongPool = askMatter ? MATTER_NO : MATTER_YES;
    const correct = pick(correctPool).name;
    const options = shuffle([correct, ...shuffle(wrongPool.map((m)=>m.name)).slice(0,3)]);
    const label = askMatter ? "és matèria" : "NO és matèria";
    return { type:'chem-matter', text:`Quin d'aquests ${label}?`, options, answer: correct };
  }

  function genMatterTF(){
    const m = pick(MATTER_OBJECTS);
    const answer = m.isMatter ? 'Vertader' : 'Fals';
    return { type:'chem-matter-tf', text:`<b>${m.name}</b> és matèria.`, options:['Vertader','Fals'], answer };
  }

  function genMatterBasics(){
    return Math.random() < 0.5 ? genMatterMCQ() : genMatterTF();
  }

  const PROPERTIES_TABLE = [
    { prop:'massa', def:'quantitat de matèria d’un cos' },
    { prop:'volum', def:'espai que ocupa un cos' },
    { prop:'densitat', def:'massa per unitat de volum' },
    { prop:'duresa', def:'resistència a ser ratllat o deformar-se' },
    { prop:'conductivitat elèctrica', def:'capacitat de conduir electricitat' }
  ];
  const DENSITY_EXERCISES = [
    { mass:12, volume:3 },
    { mass:20, volume:4 },
    { mass:15, volume:5 },
    { mass:27, volume:9 },
    { mass:18, volume:6 },
    { mass:24, volume:8 }
  ];

  function genPropertyDef(){
    const p = pick(PROPERTIES_TABLE);
    const options = shuffle([p.def, ...shuffle(PROPERTIES_TABLE.filter((x)=>x!==p).map((x)=>x.def)).slice(0,3)]);
    return { type:'chem-prop', text:`Quina definició correspon a <b>${p.prop}</b>?`, options, answer: p.def };
  }

  function genPropertyName(){
    const p = pick(PROPERTIES_TABLE);
    const options = shuffle([p.prop, ...shuffle(PROPERTIES_TABLE.filter((x)=>x!==p).map((x)=>x.prop)).slice(0,3)]);
    return { type:'chem-prop-name', text:`Quina propietat descriu: <b>${p.def}</b>?`, options, answer: p.prop };
  }

  function genDensity(){
    const d = pick(DENSITY_EXERCISES);
    const density = d.mass / d.volume;
    return {
      type:'chem-density',
      text:`Calcula la densitat si una mostra té massa <b>${d.mass} g</b> i volum <b>${d.volume} cm³</b>. (ρ = m/V)`,
      answer: density
    };
  }

  function genProperties(){
    const roll = Math.random();
    if(roll < 0.4) return genPropertyDef();
    if(roll < 0.8) return genPropertyName();
    return genDensity();
  }

  const STATE_EXAMPLES = [
    { example:'gel', state:'Sòlid' },
    { example:'sal', state:'Sòlid' },
    { example:'aigua', state:'Líquid' },
    { example:'oli', state:'Líquid' },
    { example:'vapor d’aigua', state:'Gas' },
    { example:'oxigen', state:'Gas' }
  ];
  const STATE_FEATURES = [
    { state:'Sòlid', feature:'Té forma i volum definits.' },
    { state:'Líquid', feature:'Té volum definit i forma variable.' },
    { state:'Gas', feature:'No té forma ni volum definits i s’expandeix.' }
  ];

  function genStatesExample(){
    const s = pick(STATE_EXAMPLES);
    const options = shuffle(['Sòlid','Líquid','Gas']);
    return { type:'chem-state', text:`En quin estat es troba <b>${s.example}</b>?`, options, answer: s.state };
  }

  function genStatesFeature(){
    const s = pick(STATE_FEATURES);
    const options = shuffle([s.feature, ...shuffle(STATE_FEATURES.filter((x)=>x!==s).map((x)=>x.feature))]);
    return { type:'chem-state-feature', text:`Quina característica és pròpia de l’estat <b>${s.state}</b>?`, options, answer: s.feature };
  }

  function genStates(){
    return Math.random() < 0.6 ? genStatesExample() : genStatesFeature();
  }

  const STATE_CHANGES = [
    { change:'fusió', def:'pas de sòlid a líquid' },
    { change:'solidificació', def:'pas de líquid a sòlid' },
    { change:'evaporació', def:'pas de líquid a gas' },
    { change:'condensació', def:'pas de gas a líquid' },
    { change:'sublimació', def:'pas de sòlid a gas sense passar per líquid' },
    { change:'deposició', def:'pas de gas a sòlid sense passar per líquid' }
  ];
  const STATE_CHANGE_SITUATIONS = [
    { situation:'El gel es fon al sol.', change:'fusió' },
    { situation:'La roba s’asseca a l’aire.', change:'evaporació' },
    { situation:'El metall fos es refreda i es torna sòlid.', change:'solidificació' },
    { situation:'La boira es forma quan el vapor es refreda.', change:'condensació' },
    { situation:'El gel sec passa directament a gas.', change:'sublimació' },
    { situation:'Apareix gebrada en una nit molt freda.', change:'deposició' }
  ];

  function genStateChangeDef(){
    const c = pick(STATE_CHANGES);
    const options = shuffle([c.change, ...shuffle(STATE_CHANGES.filter((x)=>x!==c).map((x)=>x.change)).slice(0,3)]);
    return { type:'chem-state-change', text:`Com s’anomena el <b>${c.def}</b>?`, options, answer: c.change };
  }

  function genStateChangeSituation(){
    const s = pick(STATE_CHANGE_SITUATIONS);
    const options = shuffle([s.change, ...shuffle(STATE_CHANGES.filter((x)=>x.change!==s.change).map((x)=>x.change)).slice(0,3)]);
    return { type:'chem-state-change-sit', text:`${s.situation} Quin canvi d’estat és?`, options, answer: s.change };
  }

  function genStateChanges(){
    return Math.random() < 0.5 ? genStateChangeDef() : genStateChangeSituation();
  }

  const PHYS_CHEM_EXAMPLES = [
    { desc:'Trencar un got de vidre', type:'Físic' },
    { desc:'Congelar l’aigua', type:'Físic' },
    { desc:'Dissoldre sucre en aigua', type:'Físic' },
    { desc:'Rovellar un clau de ferro', type:'Químic' },
    { desc:'Crema de fusta', type:'Químic' },
    { desc:'Coure un ou', type:'Químic' }
  ];
  const PHYS_CHEM_TF = [
    {
      statement:'Dissoldre sal en aigua és un canvi químic.',
      correct:false,
      reasonTrue:'es formen substàncies noves',
      reasonFalse:'no es formen substàncies noves'
    },
    {
      statement:'La combustió d’una espelma és un canvi químic.',
      correct:true,
      reasonTrue:'es formen substàncies noves',
      reasonFalse:'no es formen substàncies noves'
    },
    {
      statement:'Tallar paper és un canvi físic.',
      correct:true,
      reasonTrue:'no es formen substàncies noves',
      reasonFalse:'es formen substàncies noves'
    }
  ];
  const PHYS_CHEM_JUSTIFY = [
    {
      prompt:'Justifica breument per què <b>la combustió de la fusta</b> és un canvi químic.',
      answer:'es formen substàncies noves'
    },
    {
      prompt:'Justifica breument per què <b>fondre gel</b> és un canvi físic.',
      answer:'no es formen substàncies noves'
    }
  ];

  function genPhysChemClassify(){
    const e = pick(PHYS_CHEM_EXAMPLES);
    return {
      type:'chem-phys-chem',
      text:`Quin tipus de canvi és: <b>${e.desc}</b>?`,
      options:['Físic','Químic'],
      answer: e.type
    };
  }

  function genPhysChemTF(){
    const s = pick(PHYS_CHEM_TF);
    const trueOption = `Vertader: ${s.reasonTrue}.`;
    const falseOption = `Fals: ${s.reasonFalse}.`;
    const answer = s.correct ? trueOption : falseOption;
    return {
      type:'chem-phys-tf',
      text:`${s.statement} Tria V/F i la justificació correcta.`,
      options: shuffle([trueOption, falseOption]),
      answer
    };
  }

  function genPhysChemJustify(){
    const j = pick(PHYS_CHEM_JUSTIFY);
    return {
      type:'chem-phys-justify',
      text: j.prompt,
      answer: j.answer,
      input:'text',
      meta:{ normalize:'simple-text' }
    };
  }

  function genPhysChem(){
    const roll = Math.random();
    if(roll < 0.45) return genPhysChemClassify();
    if(roll < 0.75) return genPhysChemTF();
    return genPhysChemJustify();
  }

  function genMatterChanges(level, opts={}){
    const sub = opts.sub || 'matter';
    if(sub==='properties') return genProperties();
    if(sub==='states') return genStates();
    if(sub==='stateChanges') return genStateChanges();
    if(sub==='physChem') return genPhysChem();
    return genMatterBasics();
  }

  const matterChangesConfig = {
    render: ()=>{
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="section-title">La matèria i els seus canvis</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Submode">
            <label class="toggle">
              <input class="check" type="radio" name="matter-sub" value="matter" checked>
              Què és la matèria?
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="matter-sub" value="properties">
              Propietats i densitat
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="matter-sub" value="states">
              Estats de la matèria
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="matter-sub" value="stateChanges">
              Canvis d’estat
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="matter-sub" value="physChem">
              Canvis físics i químics
            </label>
          </div>
        </div>
        <div class="subtitle">Consell: combina classificacions ràpides amb justificacions curtes per consolidar conceptes.</div>
      `;
      return div;
    },
    collect: ()=>{
      const sub = document.querySelector('input[name="matter-sub"]:checked')?.value || 'matter';
      return { sub };
    }
  };

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
  

  // ========================
  // MÒDUL 2: Fórmules i Compostos
  // ========================

  const VALENCES = [
  // 🔹 Alcalins (grup 1)
  { el:"H",  val:"+1 / -1" },
  { el:"Li", val:"+1" },
  { el:"Na", val:"+1" },
  { el:"K",  val:"+1" },
  { el:"Rb", val:"+1" },
  { el:"Cs", val:"+1" },
  { el:"Fr", val:"+1" },

  // 🔹 Alcalinoterris (grup 2)
  { el:"Be", val:"+2" },
  { el:"Mg", val:"+2" },
  { el:"Ca", val:"+2" },
  { el:"Sr", val:"+2" },
  { el:"Ba", val:"+2" },
  { el:"Ra", val:"+2" },

  // 🔹 Metalls de transició (exemples més comuns)
  { el:"Fe", val:"+2 / +3" },
  { el:"Cu", val:"+1 / +2" },
  { el:"Zn", val:"+2" },
  { el:"Ag", val:"+1" },
  { el:"Hg", val:"+1 / +2" },
  { el:"Pb", val:"+2 / +4" },
  { el:"Sn", val:"+2 / +4" },
  { el:"Cr", val:"+2 / +3 / +6" },
  { el:"Mn", val:"+2 / +4 / +7" },
  { el:"Co", val:"+2 / +3" },
  { el:"Ni", val:"+2 / +3" },
  { el:"Au", val:"+1 / +3" },

  // 🔹 No metalls
  { el:"O",  val:"-2" },
  { el:"S",  val:"-2 / +4 / +6" },
  { el:"N",  val:"-3 / +3 / +5" },
  { el:"P",  val:"-3 / +3 / +5" },
  { el:"C",  val:"+2 / +4" },
  { el:"Cl", val:"-1 / +1 / +3 / +5 / +7" },
  { el:"Br", val:"-1 / +1 / +3 / +5" },
  { el:"I",  val:"-1 / +1 / +3 / +5 / +7" },
  { el:"F",  val:"-1" },

  // 🔹 Altres importants
  { el:"Al", val:"+3" },
  { el:"Si", val:"+4" },
  { el:"B",  val:"+3" },
  { el:"Zn", val:"+2" },
  { el:"Hg", val:"+2" },
  { el:"Ag", val:"+1" }
];

  function genValence(){
    const e = VALENCES[Math.floor(Math.random()*VALENCES.length)];
    const opts = shuffle([e.val, ...shuffle(VALENCES.filter(x=>x!==e).map(x=>x.val)).slice(0,3)]);
    return { type:'chem-valence', text:`Quina valència té <b>${e.el}</b>?`, options: opts, answer: e.val };
  }

  const FORMULAS = [
  // 💧 Substàncies comunes
  { name:"Aigua", formula:"H₂O" },
  { name:"Amoníac", formula:"NH₃" },
  { name:"Metà", formula:"CH₄" },
  { name:"Diòxid de carboni", formula:"CO₂" },
  { name:"Monòxid de carboni", formula:"CO" },
  { name:"Ozò", formula:"O₃" },

  // ⚙️ Òxids metàl·lics
  { name:"Òxid de ferro(III)", formula:"Fe₂O₃" },
  { name:"Òxid de coure(II)", formula:"CuO" },
  { name:"Òxid de calci", formula:"CaO" },
  { name:"Òxid de magnesi", formula:"MgO" },
  { name:"Òxid d’alumini", formula:"Al₂O₃" },
  { name:"Òxid de zinc", formula:"ZnO" },

  // 🌫️ Òxids no metàl·lics
  { name:"Diòxid de sofre", formula:"SO₂" },
  { name:"Triòxid de sofre", formula:"SO₃" },
  { name:"Diòxid de nitrogen", formula:"NO₂" },
  { name:"Pentòxid de difòsfor", formula:"P₂O₅" },
  { name:"Diòxid de silici", formula:"SiO₂" },

  // ⚗️ Àcids hidrácids
  { name:"Àcid clorhídric", formula:"HCl" },
  { name:"Àcid sulfhídric", formula:"H₂S" },
  { name:"Àcid fluorhídric", formula:"HF" },
  { name:"Àcid bromhídric", formula:"HBr" },
  { name:"Àcid iodhídric", formula:"HI" },

  // ⚡ Àcids oxigenats
  { name:"Àcid nítric", formula:"HNO₃" },
  { name:"Àcid sulfurós", formula:"H₂SO₃" },
  { name:"Àcid sulfúric", formula:"H₂SO₄" },
  { name:"Àcid carbònic", formula:"H₂CO₃" },
  { name:"Àcid fosfòric", formula:"H₃PO₄" },
  { name:"Àcid acètic", formula:"CH₃COOH" },

  // 🧪 Hidròxids
  { name:"Hidròxid de sodi", formula:"NaOH" },
  { name:"Hidròxid de potassi", formula:"KOH" },
  { name:"Hidròxid de calci", formula:"Ca(OH)₂" },
  { name:"Hidròxid de ferro(III)", formula:"Fe(OH)₃" },
  { name:"Hidròxid d’alumini", formula:"Al(OH)₃" },

  // 🧱 Sals neutres
  { name:"Clorur de sodi", formula:"NaCl" },
  { name:"Clorur de calci", formula:"CaCl₂" },
  { name:"Sulfat de sodi", formula:"Na₂SO₄" },
  { name:"Sulfat de calci", formula:"CaSO₄" },
  { name:"Sulfat de coure(II)", formula:"CuSO₄" },
  { name:"Nitrat de potassi", formula:"KNO₃" },
  { name:"Carbonat de calci", formula:"CaCO₃" },
  { name:"Bicarbonat de sodi", formula:"NaHCO₃" },
  { name:"Fosfat de sodi", formula:"Na₃PO₄" },
  { name:"Nitrat d’argent", formula:"AgNO₃" },
  { name:"Clorur de ferro(III)", formula:"FeCl₃" },
  { name:"Bromur de potassi", formula:"KBr" },
  { name:"Iodur de sodi", formula:"NaI" }
];

  function genFormulas(){
  const f = FORMULAS[Math.floor(Math.random()*FORMULAS.length)];
  const askFormula = Math.random()<0.5;

  // Retornem l’exercici com abans
  const q = askFormula
    ? { type:'chem-formula', text:`Escriu la fórmula de: <b>${f.name}</b>`, answer:f.formula, input:"text" }
    : { type:'chem-formula', text:`Quin és el nom de la fórmula <b>${f.formula}</b>?`, answer:f.name, input:"text" };

  // ⚗️ Quan es mostri la pregunta (només en aquest submode), afegeix el teclat
  setTimeout(()=>{
    if(q.input==="text") attachChemKeyboard();
  },100);

  return q;
}


  const MOLECULARS = [
  // 🌬️ Gasos i molècules elementals
  { formula:"O₂", name:"Oxigen" },
  { formula:"N₂", name:"Nitrogen" },
  { formula:"H₂", name:"Hidrogen" },
  { formula:"Cl₂", name:"Clor" },
  { formula:"F₂", name:"Fluor" },
  { formula:"Br₂", name:"Brom" },
  { formula:"I₂", name:"Iode" },
  { formula:"O₃", name:"Ozò" },

  // 💧 Compostos senzills
  { formula:"H₂O", name:"Aigua" },
  { formula:"NH₃", name:"Amoníac" },
  { formula:"CO",  name:"Monòxid de carboni" },
  { formula:"CO₂", name:"Diòxid de carboni" },
  { formula:"CH₄", name:"Metà" },
  { formula:"C₂H₆", name:"Età" },
  { formula:"C₂H₄", name:"Eten" },
  { formula:"C₂H₂", name:"Etí" },
  { formula:"NO",  name:"Monòxid de nitrogen" },
  { formula:"NO₂", name:"Diòxid de nitrogen" },
  { formula:"N₂O", name:"Òxid nitrós (gas dels riures)" },
  { formula:"SO₂", name:"Diòxid de sofre" },
  { formula:"SO₃", name:"Triòxid de sofre" },
  { formula:"H₂S", name:"Sulfur d’hidrogen" },

  // ⚗️ Àcids moleculars (covalença)
  { formula:"HF", name:"Àcid fluorhídric" },
  { formula:"HCl", name:"Àcid clorhídric" },
  { formula:"HBr", name:"Àcid bromhídric" },
  { formula:"HI", name:"Àcid iodhídric" },
  { formula:"H₂SO₄", name:"Àcid sulfúric" },
  { formula:"HNO₃", name:"Àcid nítric" },
  { formula:"H₂CO₃", name:"Àcid carbònic" },
  { formula:"H₃PO₄", name:"Àcid fosfòric" },
  { formula:"CH₃COOH", name:"Àcid acètic" },

  // 🍃 Compostos orgànics i derivats
  { formula:"C₂H₅OH", name:"Etanol (alcohol etílic)" },
  { formula:"CH₃OH", name:"Metanol (alcohol metílic)" },
  { formula:"C₆H₁₂O₆", name:"Glucosa" },
  { formula:"C₁₂H₂₂O₁₁", name:"Sacarosa" },
  { formula:"C₆H₆", name:"Benzè" },

  // 💨 Altres compostos d’interès quotidià
  { formula:"H₂O₂", name:"Aigua oxigenada (peròxid d’hidrogen)" },
  { formula:"NH₄Cl", name:"Clorur d’amoni" },
  { formula:"SiO₂", name:"Diòxid de silici (quars)" },
  { formula:"PCl₃", name:"Triclorur de fòsfor" },
  { formula:"SF₆", name:"Hexafluorur de sofre" }
];
  function genMolecular(){
    const m = MOLECULARS[Math.floor(Math.random()*MOLECULARS.length)];
    const opts = shuffle([m.name, ...shuffle(MOLECULARS.filter(x=>x!==m).map(x=>x.name)).slice(0,3)]);
    return { type:'chem-molecular', text:`A quin compost correspon la fórmula <b>${m.formula}</b>?`, options: opts, answer: m.name };
  }

  function normalizeFormula(str){
  if(!str) return '';
  return str
    .toUpperCase()
    .replace(/[₀]/g,'0')
    .replace(/[₁]/g,'1')
    .replace(/[₂]/g,'2')
    .replace(/[₃]/g,'3')
    .replace(/[₄]/g,'4')
    .replace(/[₅]/g,'5')
    .replace(/[₆]/g,'6')
    .replace(/[₇]/g,'7')
    .replace(/[₈]/g,'8')
    .replace(/[₉]/g,'9')
    .replace(/\s+/g,'');
}


  function genCompoundsExtra(level, opts={}){
    const sub = opts.sub || 'valence';
    if(sub==='formulas') return genFormulas();
    if(sub==='molecular') return genMolecular();
    return genValence();
  }

 const compoundsConfig = {
  render: ()=>{
    const div = document.createElement('div');
    div.innerHTML = `
      <div class="section-title">Modes de fórmules i compostos</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Mode de treball">
          <label class="toggle">
            <input class="check" type="radio" name="comp-sub" value="valence" checked>
            Valències i ions
          </label>
          <label class="toggle">
            <input class="check" type="radio" name="comp-sub" value="formulas">
            Fórmules bàsiques
          </label>
          <label class="toggle">
            <input class="check" type="radio" name="comp-sub" value="molecular">
            Compostos moleculars
          </label>
        </div>
      </div>
      <div class="subtitle">Consell: combina aquest mòdul amb exercicis visuals de taula periòdica per reforçar la relació entre símbols i fórmules.</div>
    `;
    return div;
  },
  collect: ()=>{
    const sub = document.querySelector('input[name="comp-sub"]:checked')?.value || 'valence';
    return { sub };
  }
};

  // ========================
  // MÒDUL 3: L’àtom i l’enllaç químic
  // ========================
  const ATOM_PARTS = [
    { part:'protó', charge:'+1' },
    { part:'neutró', charge:'0' },
    { part:'electró', charge:'-1' }
  ];

  const ATOM_NUMBERS = [
    { sym:'H', name:'Hidrogen', Z:1, A:1 },
    { sym:'C', name:'Carboni', Z:6, A:12 },
    { sym:'N', name:'Nitrogen', Z:7, A:14 },
    { sym:'O', name:'Oxigen', Z:8, A:16 },
    { sym:'Na', name:'Sodi', Z:11, A:23 },
    { sym:'Mg', name:'Magnesi', Z:12, A:24 },
    { sym:'Cl', name:'Clor', Z:17, A:35 },
    { sym:'K', name:'Potassi', Z:19, A:39 },
    { sym:'Ca', name:'Calci', Z:20, A:40 }
  ];

  const ISOTOPE_PAIRS = [
    { a:{ sym:'C', Z:6, A:12 }, b:{ sym:'C', Z:6, A:14 }, isotopes:true },
    { a:{ sym:'Cl', Z:17, A:35 }, b:{ sym:'Cl', Z:17, A:37 }, isotopes:true },
    { a:{ sym:'O', Z:8, A:16 }, b:{ sym:'O', Z:8, A:18 }, isotopes:true },
    { a:{ sym:'C', Z:6, A:14 }, b:{ sym:'N', Z:7, A:14 }, isotopes:false },
    { a:{ sym:'Na', Z:11, A:23 }, b:{ sym:'Mg', Z:12, A:24 }, isotopes:false },
    { a:{ sym:'K', Z:19, A:39 }, b:{ sym:'Ca', Z:20, A:40 }, isotopes:false }
  ];

  const WHY_BOND_QUESTIONS = [
  { prompt:'Per què s’uneixen els àtoms?', answer:'Per assolir una configuració electrònica més estable.' },
  { prompt:'Què passa amb l’energia quan es forma un enllaç químic?', answer:'S’allibera energia i el sistema disminueix la seva energia.' },
  { prompt:'Què busquen els àtoms en compartir o transferir electrons?', answer:'Completar la capa de valència.' },
  { prompt:'Quan es forma un enllaç iònic?', answer:'Quan hi ha transferència d’electrons entre un metall i un no metall.' },
  { prompt:'Per què els gasos nobles no solen formar enllaços?', answer:'Perquè ja tenen la capa de valència completa.' },
  { prompt:'Quina relació hi ha entre estabilitat i energia?', answer:'Com més baixa és l’energia del sistema, més estable és.' },
  { prompt:'Què és la capa de valència?', answer:'És l’última capa electrònica d’un àtom.' },
  { prompt:'Què és la regla de l’octet?', answer:'La tendència dels àtoms a tenir vuit electrons a la capa de valència.' },
  { prompt:'Què passa quan un àtom perd electrons?', answer:'Es converteix en un catió amb càrrega positiva.' },
  { prompt:'Què passa quan un àtom guanya electrons?', answer:'Es converteix en un anió amb càrrega negativa.' },
  { prompt:'Quina força manté units els ions en un enllaç iònic?', answer:'L’atracció electrostàtica entre càrregues oposades.' },
  { prompt:'Per què els enllaços iònics formen xarxes cristal·lines?', answer:'Perquè els ions s’ordenen per maximitzar les atraccions i minimitzar les repulsions.' },
  { prompt:'Quan es forma un enllaç covalent?', answer:'Quan dos no metalls comparteixen electrons.' },
  { prompt:'Per què es comparteixen electrons en un enllaç covalent?', answer:'Perquè cap dels àtoms pot perdre o guanyar electrons fàcilment.' },
  { prompt:'Què és una molècula?', answer:'Una agrupació d’àtoms units per enllaços covalents.' },
  { prompt:'Què és un enllaç covalent simple?', answer:'Un enllaç on es comparteix una parella d’electrons.' },
  { prompt:'Què és l’electronegativitat?', answer:'La capacitat d’un àtom per atraure electrons.' },
  { prompt:'Com influeix l’electronegativitat en el tipus d’enllaç?', answer:'Com més gran és la diferència, més iònic és l’enllaç.' },
  { prompt:'Què és un enllaç covalent polar?', answer:'Un enllaç on els electrons es comparteixen de manera desigual.' },
  { prompt:'Per què l’aigua és una molècula polar?', answer:'Per la diferència d’electronegativitat entre l’oxigen i l’hidrogen.' }
];

  const BOND_EXAMPLES = [
  // Enllaç iònic (metall + no metall)
  { formula:'NaCl', type:'Iònic' },
  { formula:'MgO', type:'Iònic' },
  { formula:'CaCl₂', type:'Iònic' },
  { formula:'KBr', type:'Iònic' },
  { formula:'LiF', type:'Iònic' },
  { formula:'Na₂O', type:'Iònic' },
  { formula:'Al₂O₃', type:'Iònic' },
  { formula:'CaO', type:'Iònic' },
  { formula:'Na₂S', type:'Iònic' },
  { formula:'MgCl₂', type:'Iònic' },
  // Enllaç covalent (no metall + no metall)
  { formula:'H₂O', type:'Covalent' },
  { formula:'CO₂', type:'Covalent' },
  { formula:'NH₃', type:'Covalent' },
  { formula:'CH₄', type:'Covalent' },
  { formula:'O₂', type:'Covalent' },
  { formula:'N₂', type:'Covalent' },
  { formula:'HCl', type:'Covalent' },
  { formula:'SO₂', type:'Covalent' },
  { formula:'SO₃', type:'Covalent' },
  { formula:'NO₂', type:'Covalent' }
];

  const BONDING_PROPERTIES = [
  { prop:'Estat a temperatura ambient', ionic:'Sòlid cristal·lí', covalent:'Gas o líquid (alguns sòlids)' },
  { prop:'Solubilitat en aigua', ionic:'Alta (es dissocien en ions)', covalent:'Baixa, excepte alguns compostos polars' },
  { prop:'Punt de fusió i ebullició', ionic:'Alt', covalent:'Baix o moderat' },
  { prop:'Conductivitat elèctrica', ionic:'Condueixen en dissolució o en estat fos', covalent:'No condueixen (en general)' },
  { prop:'Força de l’enllaç', ionic:'Atracció electrostàtica forta', covalent:'Compartició d’electrons' },
  { prop:'Estructura', ionic:'Xarxa tridimensional d’ions', covalent:'Molècules independents' },
  { prop:'Duresa', ionic:'Durs però fràgils', covalent:'Tous (excepte alguns sòlids)' },
  { prop:'Volatilitat', ionic:'Baixa', covalent:'Alta en molts casos' },
  { prop:'Forma de les partícules', ionic:'Ions positius i negatius ordenats', covalent:'Molècules amb forma definida' },
  { prop:'Polaritat', ionic:'Càrregues completes', covalent:'Pot ser polar o apolar' },
  { prop:'Resposta a la calor', ionic:'Resisteixen temperatures elevades', covalent:'Es descomponen o evaporen abans' },
  { prop:'Exemples típics', ionic:'Sals (NaCl, CaCl₂)', covalent:'Aigua, CO₂, gasos' }
];

  function genAtomParts(){
    const mode = Math.random();
    if(mode < 0.5){
      const part = pick(ATOM_PARTS);
      const options = shuffle([part.charge, ...shuffle(ATOM_PARTS.filter((p)=>p!==part).map((p)=>p.charge))]);
      return { type:'chem-atom-part', text:`Quina càrrega té el <b>${part.part}</b>?`, options, answer: part.charge };
    }
    const charge = pick(ATOM_PARTS);
    const options = shuffle([charge.part, ...shuffle(ATOM_PARTS.filter((p)=>p!==charge).map((p)=>p.part))]);
    return { type:'chem-atom-part', text:`Quina part de l’àtom té càrrega <b>${charge.charge}</b>?`, options, answer: charge.part };
  }

  function genAtomicNumbers(){
    const atom = pick(ATOM_NUMBERS);
    const modes = ['Z','A','p','n','e'];
    const mode = pick(modes);
    const values = ATOM_NUMBERS.map((a)=>{
      if(mode==='Z' || mode==='p' || mode==='e') return a.Z;
      if(mode==='A') return a.A;
      return a.A - a.Z;
    });
    const uniqueValues = Array.from(new Set(values));
    const correct = (mode==='Z' || mode==='p' || mode==='e') ? atom.Z : (mode==='A' ? atom.A : atom.A - atom.Z);
    const distractors = shuffle(uniqueValues.filter((v)=>v!==correct)).slice(0,3);
    const options = shuffle([correct, ...distractors]);
    const label = mode==='Z'
      ? 'el nombre atòmic (Z)'
      : mode==='A'
        ? 'el nombre màssic (A)'
        : mode==='p'
          ? 'el nombre de protons'
          : mode==='e'
            ? 'el nombre d’electrons (àtom neutre)'
            : 'el nombre de neutrons';
    return { type:'chem-atom-number', text:`Quin és ${label} de <b>${atom.name} (${atom.sym})</b>?`, options, answer: correct };
  }

  function formatIsotopeAtom(a){
    return `${a.sym}-${a.A}`;
  }

  function genIsotopes(){
    const pair = pick(ISOTOPE_PAIRS);
    const mode = Math.random();
    if(mode < 0.5){
      const answer = pair.isotopes ? 'Vertader' : 'Fals';
      return {
        type:'chem-isotope-tf',
        text:`${formatIsotopeAtom(pair.a)} i ${formatIsotopeAtom(pair.b)} són isòtops.`,
        options:['Vertader','Fals'],
        answer
      };
    }
    const compareZ = Math.random() < 0.5;
    const statement = compareZ
      ? `Comparant ${formatIsotopeAtom(pair.a)} i ${formatIsotopeAtom(pair.b)}, tenen el mateix nombre atòmic (Z).`
      : `Comparant ${formatIsotopeAtom(pair.a)} i ${formatIsotopeAtom(pair.b)}, tenen el mateix nombre màssic (A).`;
    const same = compareZ ? pair.a.Z === pair.b.Z : pair.a.A === pair.b.A;
    return {
      type:'chem-isotope-compare',
      text: statement,
      options:['Vertader','Fals'],
      answer: same ? 'Vertader' : 'Fals'
    };
  }

  function genWhyBond(){
    const q = pick(WHY_BOND_QUESTIONS);
    const otherAnswers = WHY_BOND_QUESTIONS.filter((x)=>x!==q).map((x)=>x.answer);
    const options = shuffle([q.answer, ...shuffle(otherAnswers).slice(0,3)]);
    return { type:'chem-why-bond', text:q.prompt, options, answer:q.answer };
  }

  function genBondClassification(type){
    const items = BOND_EXAMPLES.filter((x)=>x.type===type);
    const chosen = pick(items);
    const options = ['Iònic','Covalent'];
    return { type:`chem-bond-${type.toLowerCase()}`, text:`Quin tipus d’enllaç és <b>${chosen.formula}</b>?`, options, answer: chosen.type };
  }

  function genBondCompare(){
    const p = pick(BONDING_PROPERTIES);
    const correct = `Iònic: ${p.ionic} · Covalent: ${p.covalent}`;
    const others = BONDING_PROPERTIES.filter((x)=>x!==p).map((x)=>`Iònic: ${x.ionic} · Covalent: ${x.covalent}`);
    const options = shuffle([correct, ...shuffle(others).slice(0,3)]);
    return { type:'chem-bond-compare', text:`Completa la taula per a <b>${p.prop}</b>:`, options, answer: correct };
  }

  function genAtomBonding(level, opts={}){
    const sub = opts.sub || 'atom';
    if(sub==='numbers') return genAtomicNumbers();
    if(sub==='isotopes') return genIsotopes();
    if(sub==='whyBond') return genWhyBond();
    if(sub==='ionic') return genBondClassification('Iònic');
    if(sub==='covalent') return genBondClassification('Covalent');
    if(sub==='compare') return genBondCompare();
    return genAtomParts();
  }

  const atomBondingConfig = {
    render: ()=>{
      const div = document.createElement('div');
      div.innerHTML = `
        <div class="section-title">L’àtom i l’enllaç químic</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Submode">
            <label class="toggle">
              <input class="check" type="radio" name="bond-sub" value="atom" checked>
              Parts de l’àtom
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="bond-sub" value="numbers">
              Nombre atòmic i màssic
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="bond-sub" value="isotopes">
              Isòtops (V/F)
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="bond-sub" value="whyBond">
              Per què s’uneixen?
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="bond-sub" value="ionic">
              Enllaç iònic
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="bond-sub" value="covalent">
              Enllaç covalent
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="bond-sub" value="compare">
              Comparació iònic/covalent
            </label>
          </div>
        </div>
        <div class="subtitle">Consell: combina la classificació de substàncies amb el repàs de propietats per consolidar el tema.</div>
      `;
      return div;
    },
    collect: ()=>{
      const sub = document.querySelector('input[name="bond-sub"]:checked')?.value || 'atom';
      return { sub };
    }
  };


  // ========================
  // REGISTRE DELS MÒDULS
  // ========================
  const CHEM_MODULES = [{
    id:'chem',
    name:'Taula periòdica',
    desc:'Quiz ràpid, mapa interactiu, classificació i construcció de compostos.',
     usesLevels: false,
     levelLabel: 'Mode lliure',
    gen: genChem,
    category:'sci',
    config: chemConfig
  },{
    id:'chem-matter',
    name:'La matèria i els seus canvis',
    desc:'Matèria i no-matèria, propietats i densitat, estats, canvis d’estat i canvis físics/químics.',
     usesLevels: false,
     levelLabel: 'Mode lliure',
    gen: genMatterChanges,
    category:'sci',
    config: matterChangesConfig
  },{
    id:'chem-compounds',
    name:'Fórmules i compostos',
    desc:'Valències, fórmules inorgàniques i compostos moleculars amb teclat químic.',
     usesLevels: false,
     levelLabel: 'Mode lliure',
    gen: genCompoundsExtra,
    category:'sci',
    config: compoundsConfig
  },{
    id:'chem-atom-bond',
    name:'L’àtom i l’enllaç químic',
    desc:'Parts de l’àtom, nombres Z/A, isòtops, enllaç químic i comparació de propietats.',
     usesLevels: false,
     levelLabel: 'Mode lliure',
    gen: genAtomBonding,
    category:'sci',
    config: atomBondingConfig
  },{
    id:'chem-reactions',
    name:'Equacions i reaccions',
    desc:'Equilibrat bàsic i classificació de reaccions inorgàniques.',
     usesLevels: false,
     levelLabel: 'Mode lliure',
    gen: genReactions,
    category:'sci',
    config: reactionsConfig
  }];

  if (typeof window.addModules === 'function') {
    window.addModules(CHEM_MODULES);
  } else {
    window._PENDING_CHEM_MODULES_ = CHEM_MODULES;
    window.addEventListener('DOMContentLoaded', () => {
      if (typeof window.addModules === 'function' && window._PENDING_CHEM_MODULES_) {
        window.addModules(window._PENDING_CHEM_MODULES_);
        delete window._PENDING_CHEM_MODULES_;
      }
    }, { once: true });
  }

  // 🧮 TECLAT QUÍMIC (només s'activa si el mode és formulas)
function attachChemKeyboard(){
  // Evitem duplicats
  if(document.querySelector('.chem-keyboard')) return;

  const answer = document.querySelector('#answer');
  if(!answer) return;

  const kb = document.createElement('div');
  kb.className = 'chem-keyboard';
  kb.innerHTML = `
    <button type="button" onclick="insertSub('₁')">₁</button>
    <button type="button" onclick="insertSub('₂')">₂</button>
    <button type="button" onclick="insertSub('₃')">₃</button>
    <button type="button" onclick="insertSub('₄')">₄</button>
    <button type="button" onclick="insertSub('₅')">₅</button>
    <button type="button" onclick="insertSub('₆')">₆</button>
    <button type="button" onclick="insertSub('₇')">₇</button>
    <button type="button" onclick="insertSub('₈')">₈</button>
    <button type="button" onclick="insertSub('₉')">₉</button>
  `;
  answer.insertAdjacentElement('afterend', kb);
}

window.insertSub = function(sym){
  const a = document.querySelector('#answer');
  if(!a) return;
  const start = a.selectionStart, end = a.selectionEnd;
  a.value = a.value.slice(0,start) + sym + a.value.slice(end);
  a.focus();
  a.selectionStart = a.selectionEnd = start + sym.length;
};

// Estils
const style = document.createElement('style');
style.textContent = `
.chem-keyboard { margin-top:6px; display:flex; flex-wrap:wrap; gap:4px; }
.chem-keyboard button {
  background:#e0e7ff; border:none; border-radius:4px; padding:4px 6px;
  font-size:16px; cursor:pointer;
}
.chem-keyboard button:hover { background:#c7d2fe; }
`;
document.head.appendChild(style);



})();
