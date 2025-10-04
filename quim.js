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
     // Òxids bàsics
  { syms:['Fe','O'],  name:'Òxid de ferro(III) (Fe₂O₃)' },
  { syms:['Cu','O'],  name:'Òxid de coure(II) (CuO)' },
  { syms:['Ca','O'],  name:'Òxid de calci (CaO)' },
  { syms:['Mg','O'],  name:'Òxid de magnesi (MgO)' },
  { syms:['Al','O'],  name:'Òxid d’alumini (Al₂O₃)' },

  // Òxids no metàl·lics
  { syms:['C','O'],   name:'Diòxid de carboni (CO₂)' },
  { syms:['N','O'],   name:'Diòxid de nitrogen (NO₂)' },
  { syms:['S','O'],   name:'Triòxid de sofre (SO₃)' },
  { syms:['P','O'],   name:'Pentòxid de difòsfor (P₂O₅)' },

  // Hidràcids
  { syms:['H','Cl'],  name:'Àcid clorhídric (HCl)' },
  { syms:['H','S'],   name:'Àcid sulfhídric (H₂S)' },
  { syms:['H','Br'],  name:'Àcid bromhídric (HBr)' },
  { syms:['H','I'],   name:'Àcid iodhídric (HI)' },
  { syms:['H','F'],   name:'Àcid fluorhídric (HF)' },

  // Oxiàcids
  { syms:['H','N','O'], name:'Àcid nítric (HNO₃)' },
  { syms:['H','S','O'], name:'Àcid sulfúric (H₂SO₄)' },
  { syms:['H','C','O'], name:'Àcid carbònic (H₂CO₃)' },
  { syms:['H','P','O'], name:'Àcid fosfòric (H₃PO₄)' },

  // Hidròxids
  { syms:['Na','O','H'], name:'Hidròxid de sodi (NaOH)' },
  { syms:['K','O','H'],  name:'Hidròxid de potassi (KOH)' },
  { syms:['Ca','O','H'], name:'Hidròxid de calci (Ca(OH)₂)' },
  { syms:['Fe','O','H'], name:'Hidròxid de ferro(III) (Fe(OH)₃)' },
  { syms:['Al','O','H'], name:'Hidròxid d’alumini (Al(OH)₃)' },

  // Sals neutres
  { syms:['Na','Cl'], name:'Clorur de sodi (NaCl)' },
  { syms:['K','Br'],  name:'Bromur de potassi (KBr)' },
  { syms:['Ca','Cl'], name:'Clorur de calci (CaCl₂)' },
  { syms:['Na','NO₃'], name:'Nitrat de sodi (NaNO₃)' },
  { syms:['K','NO₃'],  name:'Nitrat de potassi (KNO₃)' },
  { syms:['Ca','CO₃'], name:'Carbonat de calci (CaCO₃)' },
  { syms:['Na','₂','SO₄'], name:'Sulfat de sodi (Na₂SO₄)' },
  { syms:['Cu','SO₄'], name:'Sulfat de coure(II) (CuSO₄)' },

  // Compostos moleculars senzills
  { syms:['H','O'],   name:'Aigua (H₂O)' },
  { syms:['NH','₃'],  name:'Amoníac (NH₃)' },
  { syms:['CH','₄'],  name:'Metà (CH₄)' },
  { syms:['CO','₂'],  name:'Diòxid de carboni (CO₂)' },
  { syms:['CO'],      name:'Monòxid de carboni (CO)' },

  // Altres compostos interessants
  { syms:['Na','HCO₃'], name:'Bicarbonat de sodi (NaHCO₃)' },
  { syms:['Ca','SO₄'],  name:'Sulfat de calci (CaSO₄)' },
  { syms:['Fe','₂','S','₃'], name:'Sulfur de ferro(III) (Fe₂S₃)' },
  { syms:['Ag','NO₃'],  name:'Nitrat de plata (AgNO₃)' },
  { syms:['Zn','Cl₂'],  name:'Clorur de zinc (ZnCl₂)' }
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
  // REGISTRE DELS DOS MÒDULS
  // ========================
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
    name:'Fórmules i compostos',
    desc:'Valències, fórmules bàsiques i compostos moleculars.',
    badge:'🧪',
    gen: genCompoundsExtra,
    category:'sci',
    config: compoundsConfig
  }]);

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

