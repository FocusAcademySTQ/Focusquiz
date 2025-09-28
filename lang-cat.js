/* =======================================================
   Focus Academy · Llengua Catalana (mòduls externs)
   Arxiu: lang-cat.js
   ======================================================= */

(function(){
  const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];

  /* ========== BANCS D'EXERCICIS (ORTOGRAFIA) ========== */

  // B / V
  const BANK_BV = [
    { text: `Escriu correctament (B/V): ha_er`, answer: `haver` },
    { text: `Escriu correctament (B/V): a__ans`, answer: `abans` },
    { text: `Escriu correctament (B/V): pro__ar (intentar)`, answer: `provar` },
    { text: `Escriu correctament (B/V): co__erta (d'un llibre)`, answer: `coberta` },
    { text: `Escriu correctament (B/V): su__stituir`, answer: `substituir` },
    { text: `Escriu correctament (B/V): o__lidar (oblidar)`, answer: `oblidar` },
    { text: `Escriu correctament (B/V): a__ril (mes)`, answer: `abril` },
    { text: `Escriu correctament (B/V): __eure (prendre líquids)`, answer: `beure` },
    { text: `Escriu correctament (B/V): __iure (habitar)`, answer: `viure` },
    { text: `Escriu correctament (B/V): tre__all (feina)`, answer: `treball` },
    { text: `Escriu correctament (B/V): __aixell`, answer: `vaixell` },
    { text: `Escriu correctament (B/V): __icicleta`, answer: `bicicleta` },
    { text: `Escriu correctament (B/V): su__urbí`, answer: `suburbí` },
    { text: `Escriu correctament (B/V): __enefici`, answer: `benefici` },
    { text: `Escriu correctament (B/V): __uit (8)`, answer: `vuit` },
    { text: `Escriu correctament (B/V): __acances`, answer: `vacances` },
    { text: `Escriu correctament (B/V): a__usar-se (aprofitar-se)`, answer: `abusar-se` },
    { text: `Escriu correctament (B/V): o__stacle`, answer: `obstacle` },
    { text: `Escriu correctament (B/V): no__el·la`, answer: `novel·la` },
    { text: `Escriu correctament (B/V): o__rir (desplegar)`, answer: `obrir` },
    { text: `Escriu correctament (B/V): pro__ident (convenient)`, answer: `provident` },
    { text: `Escriu correctament (B/V): __ocabulari`, answer: `vocabulari` },
    { text: `Escriu correctament (B/V): ha__itar (viure en un lloc)`, answer: `habitar` },
    { text: `Escriu correctament (B/V): a__usar (fer mal ús)`, answer: `abusar` },
    { text: `Escriu correctament (B/V): __olcà (muntanya que treu foc)`, answer: `volcà` },
    { text: `Escriu correctament (B/V): __ell (molts anys)`, answer: `vell` },
    { text: `Escriu correctament (B/V): __otar (eleccions)`, answer: `votar` },
    { text: `Escriu correctament (B/V): __enir (caminar)`, answer: `venir` },
    { text: `Escriu correctament (B/V): __alència (ciutat)`, answer: `valència` },
    { text: `Escriu correctament (B/V): __iblioteca (llibreria)`, answer: `biblioteca` }
  ];

  // J / G
  const BANK_JG = [
    { text: `Escriu correctament (g/j): viat_e`, answer: `viatge` },
    { text: `Escriu correctament (g/j): pro_ecció`, answer: `projecció` },
    { text: `Escriu correctament (g/j): le__islació`, answer: `legislació` },
    { text: `Escriu correctament (g/j): _erani (planta)`, answer: `gerani` },
    { text: `Escriu correctament (g/j): le__ir (fer lectura)`, answer: `llegir` },
    { text: `Escriu correctament (g/j): ob__ecte`, answer: `objecte` },
    { text: `Escriu correctament (g/j): ma__or (més gran)`, answer: `major` },
    { text: `Escriu correctament (g/j): ima__inari`, answer: `imaginari` },
    { text: `Escriu correctament (g/j): obli__ar (forçar)`, answer: `obligar` },
    { text: `Escriu correctament (g/j): prodi__i`, answer: `prodigi` },
    { text: `Escriu correctament (g/j): ma__ia (encanteri)`, answer: `màgia` },
    { text: `Escriu correctament (g/j): __ove (adolescent)`, answer: `jove` },
    { text: `Escriu correctament (g/j): __utjar (valorar)`, answer: `jutjar` },
    { text: `Escriu correctament (g/j): di__ital (numèric)`, answer: `digital` },
    { text: `Escriu correctament (g/j): estra__ègia`, answer: `estratègia` },
    { text: `Escriu correctament (g/j): lle__ió (grup de soldats)`, answer: `llegió` },
    { text: `Escriu correctament (g/j): re__ió (territori)`, answer: `regió` },
    { text: `Escriu correctament (g/j): re__istre`, answer: `registre` },
    { text: `Escriu correctament (g/j): di__erir (separar)`, answer: `digerir` },
    { text: `Escriu correctament (g/j): di__it (numèric)`, answer: `dígit` },
    { text: `Escriu correctament (g/j): ener__ia`, answer: `energia` },
    { text: `Escriu correctament (g/j): pa__ina (web)`, answer: `pàgina` },
    { text: `Escriu correctament (g/j): __oc (broma)`, answer: `joc` }
  ];

  // S / C / Ç / Z / X
  const BANK_SCCZX = [
    { text: `Escriu correctament (c/ç): can_ó`, answer: `cançó` },
    { text: `Escriu correctament (c/ç): a_ció`, answer: `acció` },
    { text: `Escriu correctament (c/ç): bra_`, answer: `braç` },
    { text: `Escriu correctament (x/ks): e_aminar`, answer: `examinar` },
    { text: `Escriu correctament (s/ss): pre__a`, answer: `pressa` },
    { text: `Escriu correctament (s/z/ç): organit_acions`, answer: `organitzacions` },
    { text: `Escriu correctament (s/ss/ç): pa__a (fer un pas)`, answer: `passa` },
    { text: `Escriu correctament (z/s): organit_ar (verb)`, answer: `organitzar` },
    { text: `Escriu correctament (c/ç): ca_a (caçar animals)`, answer: `caça` },
    { text: `Escriu correctament (s/ss): ca__ola (utensili de cuina)`, answer: `cassola` },
    { text: `Escriu correctament (c/ç): for_a (força)`, answer: `força` },
    { text: `Escriu correctament (s/ss): pre__ió`, answer: `pressió` },
    { text: `Escriu correctament (c/ç): feli_ (content)`, answer: `feliç` },
    { text: `Escriu correctament (c/ç): balan_`, answer: `balanç` },
    { text: `Escriu correctament (x/gs): e__emple`, answer: `exemple` },
    { text: `Escriu correctament (s/ss): mi__ió`, answer: `missió` },
    { text: `Escriu correctament (z/s): realit_ar`, answer: `realitzar` },
    { text: `Escriu correctament (c/ç): pla__a (plaça pública)`, answer: `plaça` },
    { text: `Escriu correctament (c/ç): fa__ana`, answer: `façana` },
    { text: `Escriu correctament (x/ix): refle__`, answer: `reflex` },
    { text: `Escriu correctament (s/ss): depre__ió`, answer: `depressió` },
    { text: `Escriu correctament (c/ç): bra__alet (de natació)`, answer: `braçalet` },
    { text: `Escriu correctament (z/s): pa__sar (transcórrer)`, answer: `passar` }
  ];

  // Correccions lliures
  const BANK_corregir = [
    { text: `Corregix: porke`, answer: `perquè` },
    { text: `Corregix: xulo`, answer: `bonic` },
    { text: `Corregix: balla`, answer: `vella` },
    { text: `Corregix: vorem`, answer: `veurem` },
    { text: `Corregix: cuan`, answer: `quan` },
    { text: `Corregix: ke fa`, answer: `què fa` }
  ];

  // R / RR
  const BANK_RR = [
    { text: `Escriu correctament, R o RR: ca_era (via).`, answer: `carretera` },
    { text: `Escriu correctament, R o RR: te__a (sòl).`, answer: `terra` },
    { text: `Escriu correctament, R o RR: ca__il (vial).`, answer: `carril` }, 
    { text: `Escriu correctament, R o RR: co_eu (casc urbà).`, answer: `carrer` },
   { text: `Escriu correctament, R o RR: ba_a (animal de granja).`, answer: `barra` },
   { text: `Escriu correctament, R o RR: co__eus (cos humà).`, answer: `còrreus` },
   { text: `Escriu correctament, R o RR: se__a (eina).`, answer: `serra` }, 
   { text: `Escriu correctament, R o RR: fe__o (material).`, answer: `ferro` },
   { text: `Escriu correctament, R o RR: a__òs (menjar).`, answer: `arròs` }, 
   { text: `Escriu correctament, R o RR: te_eny (espai).`, answer: `terreny` },
   { text: `Escriu correctament, R o RR: _atolí (animal petit).`, answer: `ratolí` },
   { text: `Escriu correctament, R o RR: ba_era (símbol).`, answer: `bandera` }
  ];

  // L / L·L
  const BANK_LLG = [
    { text: `Escriu correctament, L o L·L: co__egi`, answer: `col·legi` },
    { text: `Escriu correctament, L o L·L: inte__igent`, answer: `intel·ligent` },
    { text: `Escriu correctament, L o L·L: para__el`, answer: `paral·lel` }
  ];

  // Catàleg de subtemes Ortografia
  const SUBS = [
    { key: 'bv', label: 'B / V', bank: BANK_BV },
    { key: 'jg', label: 'J / G', bank: BANK_JG },
    { key: 'scczx', label: 'S / C / Ç / Z / X', bank: BANK_SCCZX },
    { key: 'corregir', label: 'Corregir', bank: BANK_corregir },
    { key: 'rr', label: 'R / RR', bank: BANK_RR },
    { key: 'llg', label: 'L / L·L', bank: BANK_LLG }
  ];

  /* ========== MORFOLOGIA (5 SUBTEMES) ========== */

  const BANK_MORFO_SUBJECTE = [
  { 
  text: `Quin és el subjecte de: "La Maria canta una cançó."`, 
  options: ["La Maria", "canta", "una cançó", "cançó"], 
  answer: `La Maria` 
},
{ 
  text: `Quin és el predicat de: "El gos corre pel jardí."`, 
  options: ["El gos", "corre pel jardí", "pel jardí", "corre"], 
  answer: `corre pel jardí` 
},
{ 
  text: `Quin és el subjecte de: "Els nens juguen a pilota."`, 
  options: ["Els nens", "juguen", "a pilota", "pilota"], 
  answer: `Els nens` 
},
{ 
  text: `Quin és el predicat de: "L’avi llegeix el diari."`, 
  options: ["L’avi", "llegeix el diari", "el diari", "llegeix"], 
  answer: `llegeix el diari` 
},
{ 
  text: `Quin és el subjecte de: "Les flors oloren bé."`, 
  options: ["Les flors", "oloren", "bé", "cap"], 
  answer: `Les flors` 
},
{ 
  text: `Quin és el predicat de: "La nena dibuixa una casa."`, 
  options: ["La nena", "dibuixa una casa", "una casa", "dibuixa"], 
  answer: `dibuixa una casa` 
},
{ 
  text: `Quin és el subjecte de: "El professor explica la lliçó."`, 
  options: ["El professor", "explica", "la lliçó", "cap"], 
  answer: `El professor` 
},
{ 
  text: `Quin és el predicat de: "Els ocells volen pel cel."`, 
  options: ["Els ocells", "volen pel cel", "volen", "pel cel"], 
  answer: `volen pel cel` 
},
{ 
  text: `Quin és el subjecte de: "El cotxe és vermell."`, 
  options: ["El cotxe", "vermell", "és", "vermell i cotxe"], 
  answer: `El cotxe` 
},
{ 
  text: `Quin és el predicat de: "La Júlia menja pa amb oli."`, 
  options: ["La Júlia", "menja pa amb oli", "menja", "pa amb oli"], 
  answer: `menja pa amb oli` 
},
{ 
  text: `Quin és el subjecte de: "El gat dorm al sofà."`, 
  options: ["El gat", "dorm", "al sofà", "cap"], 
  answer: `El gat` 
},
{ 
  text: `Quin és el predicat de: "La mare prepara el dinar."`, 
  options: ["La mare", "prepara el dinar", "el dinar", "prepara"], 
  answer: `prepara el dinar` 
},
{ 
  text: `Quin és el subjecte de: "Els estudiants fan els deures."`, 
  options: ["Els estudiants", "fan", "els deures", "cap"], 
  answer: `Els estudiants` 
},
{ 
  text: `Quin és el predicat de: "La pluja cau suaument."`, 
  options: ["La pluja", "cau suaument", "cau", "suaument"], 
  answer: `cau suaument` 
},
{ 
  text: `Quin és el subjecte de: "La lluna il·lumina el bosc."`, 
  options: ["La lluna", "il·lumina", "el bosc", "cap"], 
  answer: `La lluna` 
},
{ 
  text: `Quin és el predicat de: "Els professors corregeixen exàmens."`, 
  options: ["Els professors", "corregeixen exàmens", "exàmens", "corregeixen"], 
  answer: `corregeixen exàmens` 
},
{ 
  text: `Quin és el subjecte de: "La Marta escriu una carta."`, 
  options: ["La Marta", "escriu", "una carta", "carta"], 
  answer: `La Marta` 
},
{ 
  text: `Quin és el predicat de: "Els jugadors entrenen cada tarda."`, 
  options: ["Els jugadors", "entrenen cada tarda", "entrenen", "cada tarda"], 
  answer: `entrenen cada tarda` 
},
{ 
  text: `Quin és el subjecte de: "El tren arriba puntual."`, 
  options: ["El tren", "arriba", "puntual", "cap"], 
  answer: `El tren` 
},
{ 
  text: `Quin és el predicat de: "La nena somriu feliç."`, 
  options: ["La nena", "somriu feliç", "somriu", "feliç"], 
  answer: `somriu feliç` 
},
{ 
  text: `Quin és el subjecte de: "Els peixos neden ràpid."`, 
  options: ["Els peixos", "naden", "ràpid", "cap"], 
  answer: `Els peixos` 
},
{ 
  text: `Quin és el predicat de: "El sol escalfa la platja."`, 
  options: ["El sol", "escalfa la platja", "la platja", "escalfa"], 
  answer: `escalfa la platja` 
},
{ 
  text: `Quin és el subjecte de: "La bicicleta té tres rodes."`, 
  options: ["La bicicleta", "té", "tres rodes", "cap"], 
  answer: `La bicicleta` 
},
{ 
  text: `Quin és el predicat de: "Els nens riuen contents."`, 
  options: ["Els nens", "riuen contents", "riuen", "contents"], 
  answer: `riuen contents` 
},
{ 
  text: `Quin és el subjecte de: "El rellotge marca les dotze."`, 
  options: ["El rellotge", "marca", "les dotze", "cap"], 
  answer: `El rellotge` 
},
{ 
  text: `Quin és el predicat de: "Les estrelles brillen al cel."`, 
  options: ["Les estrelles", "brillen al cel", "brillen", "al cel"], 
  answer: `brillen al cel` 
},
{ 
  text: `Quin és el subjecte de: "La televisió funciona bé."`, 
  options: ["La televisió", "funciona", "bé", "cap"], 
  answer: `La televisió` 
},
{ 
  text: `Quin és el predicat de: "El nen canta una cançó."`, 
  options: ["El nen", "canta una cançó", "canta", "una cançó"], 
  answer: `canta una cançó` 
},
{ 
  text: `Quin és el subjecte de: "Les fulles cauen dels arbres."`, 
  options: ["Les fulles", "cauen", "arbres", "cap"], 
  answer: `Les fulles` 
},
{ 
  text: `Quin és el predicat de: "Els gats cacen ratolins."`, 
  options: ["Els gats", "cacen ratolins", "ratolins", "cacen"], 
  answer: `cacen ratolins` 
},
{ 
  text: `Quin és el subjecte de: "El mestre corregeix les redaccions."`, 
  options: ["El mestre", "corregeix", "les redaccions", "cap"], 
  answer: `El mestre` 
},
{ 
  text: `Quin és el predicat de: "La Maria compra fruita fresca."`, 
  options: ["La Maria", "compra fruita fresca", "compra", "fruita fresca"], 
  answer: `compra fruita fresca` 
},
{ 
  text: `Quin és el subjecte de: "Els avis caminen pel parc."`, 
  options: ["Els avis", "caminen", "pel parc", "cap"], 
  answer: `Els avis` 
},
{ 
  text: `Quin és el predicat de: "La Júlia pinta un quadre."`, 
  options: ["La Júlia", "pinta un quadre", "pinta", "un quadre"], 
  answer: `pinta un quadre` 
},
{ 
  text: `Quin és el subjecte de: "El telèfon sona fort."`, 
  options: ["El telèfon", "sona", "fort", "cap"], 
  answer: `El telèfon` 
},
{ 
  text: `Quin és el predicat de: "Els alumnes escolten la lliçó."`, 
  options: ["Els alumnes", "escolten la lliçó", "escolten", "lliçó"], 
  answer: `escolten la lliçó` 
},
{ 
  text: `Quin és el subjecte de: "El riu porta molta aigua."`, 
  options: ["El riu", "porta", "aigua", "cap"], 
  answer: `El riu` 
},
{ 
  text: `Quin és el predicat de: "Els cotxes circulen ràpid."`, 
  options: ["Els cotxes", "circulen ràpid", "circulen", "ràpid"], 
  answer: `circulen ràpid` 
},
{ 
  text: `Quin és el subjecte de: "La biblioteca té molts llibres."`, 
  options: ["La biblioteca", "té", "llibres", "cap"], 
  answer: `La biblioteca` 
},
{ 
  text: `Quin és el predicat de: "Els estudiants llegeixen en silenci."`, 
  options: ["Els estudiants", "llegeixen en silenci", "llegeixen", "en silenci"], 
  answer: `llegeixen en silenci` 
},
{ 
  text: `Quin és el subjecte de: "Els gossos borden fort."`, 
  options: ["Els gossos", "borden", "fort", "cap"], 
  answer: `Els gossos` 
},
{ 
  text: `Quin és el predicat de: "La mare renta els plats."`, 
  options: ["La mare", "renta els plats", "renta", "els plats"], 
  answer: `renta els plats` 
},
{ 
  text: `Quin és el subjecte de: "Els llibres estan a la taula."`, 
  options: ["Els llibres", "estan", "a la taula", "cap"], 
  answer: `Els llibres` 
},
{ 
  text: `Quin és el predicat de: "El vent bufa fort."`, 
  options: ["El vent", "bufa fort", "bufa", "fort"], 
  answer: `bufa fort` 
},
{ 
  text: `Quin és el subjecte de: "Les nenes ballen a l’escenari."`, 
  options: ["Les nenes", "ballen", "a l’escenari", "cap"], 
  answer: `Les nenes` 
},
{ 
  text: `Quin és el predicat de: "El noi obre la porta."`, 
  options: ["El noi", "obre la porta", "obre", "porta"], 
  answer: `obre la porta` 
},
{ 
  text: `Quin és el subjecte de: "Els ocells canten alegres."`, 
  options: ["Els ocells", "canten", "alegres", "cap"], 
  answer: `Els ocells` 
},
{ 
  text: `Quin és el predicat de: "La mestra escriu a la pissarra."`, 
  options: ["La mestra", "escriu a la pissarra", "escriu", "pissarra"], 
  answer: `escriu a la pissarra` 
},
{ 
  text: `Quin és el subjecte de: "El pare condueix el cotxe."`, 
  options: ["El pare", "condueix", "el cotxe", "cap"], 
  answer: `El pare` 
},
{ 
  text: `Quin és el predicat de: "La Clara prepara un pastís."`, 
  options: ["La Clara", "prepara un pastís", "prepara", "un pastís"], 
  answer: `prepara un pastís` 
},
{ 
  text: `Quin és el subjecte de: "Els núvols tapen el sol."`, 
  options: ["Els núvols", "tapen", "el sol", "cap"], 
  answer: `Els núvols` 
},
{ 
  text: `Quin és el predicat de: "El gos busca la pilota."`, 
  options: ["El gos", "busca la pilota", "busca", "la pilota"], 
  answer: `busca la pilota` 
},
{ 
  text: `Quin és el subjecte de: "La Maria llegeix un llibre."`, 
  options: ["La Maria", "llegeix", "un llibre", "cap"], 
  answer: `La Maria` 
},
{ 
  text: `Quin és el predicat de: "Els nens pinten dibuixos."`, 
  options: ["Els nens", "pinten dibuixos", "pinten", "dibuixos"], 
  answer: `pinten dibuixos` 
},
{ 
  text: `Quin és el subjecte de: "El gosset juga al jardí."`, 
  options: ["El gosset", "juga", "al jardí", "cap"], 
  answer: `El gosset` 
},
{ 
  text: `Quin és el predicat de: "La Júlia obre la finestra."`, 
  options: ["La Júlia", "obre la finestra", "obre", "finestra"], 
  answer: `obre la finestra` 
},
{ 
  text: `Quin és el subjecte de: "Les flors decoren la taula."`, 
  options: ["Les flors", "decoren", "la taula", "cap"], 
  answer: `Les flors` 
},
{ 
  text: `Quin és el predicat de: "El nen trenca el paper."`, 
  options: ["El nen", "trenca el paper", "trenca", "paper"], 
  answer: `trenca el paper` 
},
{ 
  text: `Quin és el subjecte de: "Els avis expliquen històries."`, 
  options: ["Els avis", "expliquen", "històries", "cap"], 
  answer: `Els avis` 
},
{ 
  text: `Quin és el predicat de: "La mare cus un vestit."`, 
  options: ["La mare", "cus un vestit", "cus", "vestit"], 
  answer: `cus un vestit` 
},
{ 
  text: `Quin és el subjecte de: "El cotxe aparca davant l’escola."`, 
  options: ["El cotxe", "aparca", "davant l’escola", "cap"], 
  answer: `El cotxe` 
},
{ 
  text: `Quin és el predicat de: "Els nens obren els regals."`, 
  options: ["Els nens", "obren els regals", "obren", "regals"], 
  answer: `obren els regals` 
},
{ 
  text: `Quin és el subjecte de: "La llum entra per la finestra."`, 
  options: ["La llum", "entra", "finestra", "cap"], 
  answer: `La llum` 
},
{ 
  text: `Quin és el predicat de: "Els gossos mengen carn."`, 
  options: ["Els gossos", "mengen carn", "mengen", "carn"], 
  answer: `mengen carn` 
},
{ 
  text: `Quin és el subjecte de: "El nen juga a l’ordinador."`, 
  options: ["El nen", "juga", "a l’ordinador", "cap"], 
  answer: `El nen` 
},
{ 
  text: `Quin és el predicat de: "La mestra ajuda els alumnes."`, 
  options: ["La mestra", "ajuda els alumnes", "ajuda", "alumnes"], 
  answer: `ajuda els alumnes` 
},
{ 
  text: `Quin és el subjecte de: "El pintor pinta un quadre."`, 
  options: ["El pintor", "pinta", "un quadre", "cap"], 
  answer: `El pintor` 
},
{ 
  text: `Quin és el predicat de: "Els músics toquen la cançó."`, 
  options: ["Els músics", "toquen la cançó", "toquen", "cançó"], 
  answer: `toquen la cançó` 
},
{ 
  text: `Quin és el subjecte de: "El foc crema la fusta."`, 
  options: ["El foc", "crema", "la fusta", "cap"], 
  answer: `El foc` 
},
{ 
  text: `Quin és el predicat de: "Els nens miren la televisió."`, 
  options: ["Els nens", "miren la televisió", "miren", "televisió"], 
  answer: `miren la televisió` 
},
{ 
  text: `Quin és el subjecte de: "El mar cobreix la sorra."`, 
  options: ["El mar", "cobreix", "sorra", "cap"], 
  answer: `El mar` 
},
{ 
  text: `Quin és el predicat de: "La nena beu aigua."`, 
  options: ["La nena", "beu aigua", "beu", "aigua"], 
  answer: `beu aigua` 
},
{ 
  text: `Quin és el subjecte de: "Les ovelles mengen herba."`, 
  options: ["Les ovelles", "mengen", "herba", "cap"], 
  answer: `Les ovelles` 
},
{ 
  text: `Quin és el predicat de: "Els avis seuen al banc."`, 
  options: ["Els avis", "seuen al banc", "seuen", "banc"], 
  answer: `seuen al banc` 
},
{ 
  text: `Quin és el subjecte de: "El camió porta fusta."`, 
  options: ["El camió", "porta", "fusta", "cap"], 
  answer: `El camió` 
},
{ 
  text: `Quin és el predicat de: "La Júlia escriu un poema."`, 
  options: ["La Júlia", "escriu un poema", "escriu", "poema"], 
  answer: `escriu un poema` 
},
{ 
  text: `Quin és el subjecte de: "Els nens aprenen matemàtiques."`, 
  options: ["Els nens", "aprenen", "matemàtiques", "cap"], 
  answer: `Els nens` 
},
{ 
  text: `Quin és el predicat de: "El noi juga a futbol."`, 
  options: ["El noi", "juga a futbol", "juga", "futbol"], 
  answer: `juga a futbol` 
},
{ 
  text: `Quin és el subjecte de: "La mare prepara cafè."`, 
  options: ["La mare", "prepara", "cafè", "cap"], 
  answer: `La mare` 
},
{ 
  text: `Quin és el predicat de: "Els nens corren al pati."`, 
  options: ["Els nens", "corren al pati", "corren", "pati"], 
  answer: `corren al pati` 
},
{ 
  text: `Quin és el subjecte de: "La nena toca el piano."`, 
  options: ["La nena", "toca", "piano", "cap"], 
  answer: `La nena` 
},
{ 
  text: `Quin és el predicat de: "El gos mossega l’os."`, 
  options: ["El gos", "mossega l’os", "mossega", "os"], 
  answer: `mossega l’os` 
},
{ 
  text: `Quin és el subjecte de: "Els avions volen alt."`, 
  options: ["Els avions", "volen", "alt", "cap"], 
  answer: `Els avions` 
},
{ 
  text: `Quin és el predicat de: "El nen menja galetes."`, 
  options: ["El nen", "menja galetes", "menja", "galetes"], 
  answer: `menja galetes` 
},
{ 
  text: `Quin és el subjecte de: "La professora escriu la data."`, 
  options: ["La professora", "escriu", "data", "cap"], 
  answer: `La professora` 
},
{ 
  text: `Quin és el predicat de: "Els arbres donen ombra."`, 
  options: ["Els arbres", "donen ombra", "donen", "ombra"], 
  answer: `donen ombra` 
},
{ 
  text: `Quin és el subjecte de: "El nen llegeix un conte."`, 
  options: ["El nen", "llegeix", "conte", "cap"], 
  answer: `El nen` 
},
{ 
  text: `Quin és el predicat de: "La mare cuina arròs."`, 
  options: ["La mare", "cuina arròs", "cuina", "arròs"], 
  answer: `cuina arròs` 
},
{ 
  text: `Quin és el subjecte de: "Els cotxes fan soroll."`, 
  options: ["Els cotxes", "fan", "soroll", "cap"], 
  answer: `Els cotxes` 
},
{ 
  text: `Quin és el predicat de: "El gat caça un ratolí."`, 
  options: ["El gat", "caça un ratolí", "caça", "ratolí"], 
  answer: `caça un ratolí` 
},
{ 
  text: `Quin és el subjecte de: "Les estrelles il·luminen la nit."`, 
  options: ["Les estrelles", "il·luminen", "nit", "cap"], 
  answer: `Les estrelles` 
},
{ 
  text: `Quin és el predicat de: "El nen porta la motxilla."`, 
  options: ["El nen", "porta la motxilla", "porta", "motxilla"], 
  answer: `porta la motxilla` 
},
{ 
  text: `Quin és el subjecte de: "El professor explica història."`, 
  options: ["El professor", "explica", "història", "cap"], 
  answer: `El professor` 
},
{ 
  text: `Quin és el predicat de: "La nena pinta flors."`, 
  options: ["La nena", "pinta flors", "pinta", "flors"], 
  answer: `pinta flors` 
},
{ 
  text: `Quin és el subjecte de: "Els soldats marxen units."`, 
  options: ["Els soldats", "marxen", "units", "cap"], 
  answer: `Els soldats` 
},
{ 
  text: `Quin és el predicat de: "El gos dorm tranquil."`, 
  options: ["El gos", "dorm tranquil", "dorm", "tranquil"], 
  answer: `dorm tranquil` 
}

];

const BANK_MORFO_TEMPS = [
  { 
    text: `Indica temps i mode: "Cantàvem"`, 
    options: ["Present d’indicatiu", "Imperfet d’indicatiu", "Futur simple", "Condicional"], 
    answer: `Imperfet d'indicatiu` 
  },
  { 
    text: `Indica temps i mode: "Hauré menjat"`, 
    options: ["Passat simple", "Futur compost d’indicatiu", "Imperfet subjuntiu", "Condicional compost"], 
    answer: `Futur compost d'indicatiu` 
  }
];

const BANK_MORFO_CATEGORIES = [
  { 
    text: `Categoria gramatical de "ràpidament"`, 
    options: ["Nom comú", "Adverbi", "Adjectiu", "Verb"], 
    answer: `Adverbi` 
  },
  { 
    text: `Categoria gramatical de "gossos"`, 
    options: ["Nom comú", "Verb", "Pronom", "Adjectiu"], 
    answer: `Nom comú` 
  }
];

const BANK_MORFO_CONCORDANCA = [
  { 
    text: `Frase correcta:`, 
    options:["Els nen juga a pilota","Els nens juguen a pilota","Els nens juga a pilota","Els nen juguen a pilota"], 
    answer: `Els nens juguen a pilota` 
  },
  { 
    text: `Frase correcta:`, 
    options:["La noies bonica","Les noies boniques","La noia boniques","Les noia bonica"], 
    answer: `Les noies boniques` 
  }
];

const BANK_MORFO_FUNCIONS = [
  { 
    text: `Funció de "al parc" en: "La Marta juga al parc"`, 
    options: ["Complement circumstancial de lloc", "Subjecte", "Complement directe", "Complement de règim"], 
    answer: `Complement circumstancial de lloc` 
  },
  { 
    text: `Funció de "un llibre" en: "Vaig comprar un llibre"`, 
    options: ["Complement directe", "Subjecte", "Atribut", "Complement de lloc"], 
    answer: `Complement directe` 
  }
];

   const SUBS_MORF = [
  { key: 'subjecte', label: 'Subjecte / Predicat', bank: BANK_MORFO_SUBJECTE },
  { key: 'temps', label: 'Temps i mode verbal', bank: BANK_MORFO_TEMPS },
  { key: 'categories', label: 'Categories gramaticals', bank: BANK_MORFO_CATEGORIES },
  { key: 'concordanca', label: 'Concordança', bank: BANK_MORFO_CONCORDANCA },
  { key: 'funcions', label: 'Funcions sintàctiques', bank: BANK_MORFO_FUNCIONS }
];

  /* ========== GENERADORS ========== */
  function genCatOrt(level, opts = {}){
  const subKey = opts.sub || 'bv';
  const sub = SUBS.find(s => s.key === subKey) || SUBS[0];
  const q = choice(sub.bank);
  return { 
    type: 'cat-ort', 
    text: q.text, 
    answer: q.answer, 
    options: q.options || null,
    input: "text"
  };
}

function genCatMorf(level, opts = {}){
  const subKey = opts.sub || 'categories';
  const sub = SUBS_MORF.find(s => s.key === subKey) || SUBS_MORF[0];
  const q = choice(sub.bank);
  return { 
    type: 'cat-morf',
    text: q.text,
    answer: q.answer,
    options: q.options || null,
    input: q.options ? "choice" : "text"   // 👈 si té options → multiple choice
  };
}

  /* ========== UI DE CONFIG ========== */
  const OrtografiaConfig = {
    render(){
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div class="section-title">Ortografia · Subtemes</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Subtemes d'ortografia">
            ${SUBS.map((s,i)=>`
              <label class="toggle">
                <input class="check" type="radio" name="cat-ort-sub" value="${s.key}" ${i===0?'checked':''}>
                ${s.label}
              </label>
            `).join('')}
          </div>
        </div>
        <div class="subtitle">La resposta ha de ser exacta (accents i ela geminada inclosos).</div>
      `;
      return wrap;
    },
    collect(){
      const v = (document.querySelector('input[name="cat-ort-sub"]:checked') || {}).value || 'bv';
      return { sub: v };
    }
  };

  const MorfologiaConfig = {
    render(){
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div class="section-title">Morfologia · Subtemes</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Subtemes de morfologia">
            ${SUBS_MORF.map((s,i)=>`
              <label class="toggle">
                <input class="check" type="radio" name="cat-morf-sub" value="${s.key}" ${i===0?'checked':''}>
                ${s.label}
              </label>
            `).join('')}
          </div>
        </div>
      `;
      return wrap;
    },
    collect(){
      const v = (document.querySelector('input[name="cat-morf-sub"]:checked') || {}).value || 'categories';
      return { sub: v };
    }
  };

  /* ========== MÒDULS ========== */
  const CAT_MODULES = [
    {
      id: 'cat-ort',
      name: 'Ortografia',
      desc: 'b/v, j/g, s/c/ç/z/x, corregir, r/rr, l/l·l.',
      badge: 'CAT',
      category: 'cat',
      gen: genCatOrt,
      config: OrtografiaConfig
    },
    {
id: 'cat-morf',
      name: 'Morfologia',
      desc: 'Subjecte, temps verbals, categories, concordança, funcions sintàctiques.',
      badge: 'CAT',
      category: 'cat',
      gen: genCatMorf,
      config: MorfologiaConfig
    }
  ];

  /* ========== REGISTRE ========== */
  if (typeof window.addModules === 'function') {
    window.addModules(CAT_MODULES);
  } else {
    window._PENDING_CAT_MODULES_ = CAT_MODULES;
    window.addEventListener('DOMContentLoaded', ()=>{
      if (typeof window.addModules === 'function' && window._PENDING_CAT_MODULES_) {
        window.addModules(window._PENDING_CAT_MODULES_);
        delete window._PENDING_CAT_MODULES_;
      }
    });
  }
})();
