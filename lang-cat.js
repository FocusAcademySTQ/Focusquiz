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
    { text: `Escriu correctament (g/j): mà__ia (encanteri)`, answer: `màgia` },
    { text: `Escriu correctament (g/j): __ove (adolescent)`, answer: `jove` },
    { text: `Escriu correctament (g/j): __utjar (valorar)`, answer: `jutjar` },
    { text: `Escriu correctament (g/j): di__ital (numèric)`, answer: `digital` },
    { text: `Escriu correctament (g/j): estra__ègia`, answer: `estratègia` },
    { text: `Escriu correctament (g/j): lle__ió (grup de soldats)`, answer: `llegió` },
    { text: `Escriu correctament (g/j): re__ió (territori)`, answer: `regió` },
    { text: `Escriu correctament (g/j): re__istre`, answer: `registre` },
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
    { text: `Escriu correctament (s/ss): pa__ar (transcórrer)`, answer: `passar` }
  ];

  // Correccions lliures
  const BANK_corregir = [
    { text: `Corregix: xulo`, answer: `bonic` },
    { text: `Corregix: balla`, answer: `vella` },
    { text: `Corregix: vorem`, answer: `veurem` },
    { text: `Corregix: cuan`, answer: `quan` },
    { text: `Corregix: ke fa`, answer: `què fa` },
   { text: `Corregix: lo llibre`, answer: `el llibre` },
   { text: `Corregix: la meu`, answer: `el meu` },
   { text: `Corregix: vosté`, answer: `vostè` },
   { text: `Corregix: abia`, answer: `havia` },
   { text: `Corregix: dijus`, answer: `dijous` },
   { text: `Corregix: plassa`, answer: `plaça` },
   { text: `Corregix: fems`, answer: `fem` },
   { text: `Corregix: bona nitss`, answer: `bona nit` },
   { text: `Corregix: comensar`, answer: `començar` },
   { text: `Corregix: avans`, answer: `abans` },
   { text: `Corregix: istòria`, answer: `història` },
   { text: `Corregix: nesesari`, answer: `necessari` },
   { text: `Corregix: aixo es molt guapo`, answer: `això és molt bonic` },
   { text: `Corregix: no tinc res més ha dir`, answer: `no tinc res més a dir` },
   { text: `Corregix: aquet`, answer: `aquest` },
   { text: `Corregix: ase`, answer: `ase` },
   { text: `Corregix: colegi`, answer: `col·legi` },
   { text: `Corregix: dibuixu`, answer: `dibuixo` },
   { text: `Corregix: camvi`, answer: `canvi` },
   { text: `Corregix: vui`, answer: `vull` },
     { text: `Corregix: avia`, answer: `havia` },
{ text: `Corregix: seba`, answer: `seva` },
{ text: `Corregix: ecsamen`, answer: `examen` },
{ text: `Corregix: boi`, answer: `voi` },
{ text: `Corregix: mirala`, answer: `mira-la` },
{ text: `Corregix: nose`, answer: `no sé` },
{ text: `Corregix: porke`, answer: `perquè` },
{ text: `Corregix: xq`, answer: `perquè` },
{ text: `Corregix: ke vols`, answer: `què vols` },
{ text: `Corregix: aixo es`, answer: `això és` },
{ text: `Corregix: no se res`, answer: `no sé res` },
{ text: `Corregix: tambe`, answer: `també` },
{ text: `Corregix: faborit`, answer: `favorit` },
{ text: `Corregix: istiu`, answer: `estiu` },
{ text: `Corregix: aki`, answer: `aquí` },
{ text: `Corregix: akesta`, answer: `aquesta` },
{ text: `Corregix: escrivint-ho mal`, answer: `escrivint-ho malament` },
{ text: `Corregix: vienes`, answer: `vens` },
{ text: `Corregix: tengui`, answer: `tingui` },
{ text: `Corregix: no ho se`, answer: `no ho sé` },
{ text: `Corregix: esta clar`, answer: `està clar` },
{ text: `Corregix: es bo`, answer: `és bo` },
{ text: `Corregix: es de dia`, answer: `és de dia` },
{ text: `Corregix: estávem`, answer: `estàvem` },
{ text: `Corregix: mossegarém`, answer: `mossegarem` },
{ text: `Corregix: anarém`, answer: `anirem` },
{ text: `Corregix: tindria que`, answer: `hauria de` },
{ text: `Corregix: vaig anar-me`, answer: `me'n vaig anar` },
{ text: `Corregix: diguem`, answer: `diguem-ho` },
{ text: `Corregix: mirame`, answer: `mira'm` },
{ text: `Corregix: amb tú`, answer: `amb tu` },
{ text: `Corregix: sols ho fa`, answer: `només ho fa` },
{ text: `Corregix: vaig pujar amunt`, answer: `vaig pujar` },
{ text: `Corregix: vaig baixar avall`, answer: `vaig baixar` },
{ text: `Corregix: vaig sortir fora`, answer: `vaig sortir` },
{ text: `Corregix: vaig entrar dins`, answer: `vaig entrar` },
{ text: `Corregix: obligatoriament`, answer: `obligatòriament` },
{ text: `Corregix: esperat`, answer: `has esperat` },
{ text: `Corregix: siem`, answer: `siguem` },
{ text: `Corregix: eis`, answer: `ells` },
{ text: `Corregix: bo`, answer: `bé` },
{ text: `Corregix: avia vingut`, answer: `havia vingut` },
{ text: `Corregix: disfrutar`, answer: `gaudir` },
{ text: `Corregix: xulo`, answer: `bonic` },
{ text: `Corregix: vale`, answer: `d'acord` },
{ text: `Corregix: nesesitat`, answer: `necessitat` },
{ text: `Corregix: be`, answer: `bé` },
{ text: `Corregix: mon`, answer: `món` },
{ text: `Corregix: corasó`, answer: `cor` },
{ text: `Corregix: estic enfadat perque`, answer: `estic enfadat perquè` },
{ text: `Corregix: aixo`, answer: `això` },
{ text: `Corregix: donés-li`, answer: `dona-li` },
{ text: `Corregix: venin`, answer: `venint` },
{ text: `Corregix: vaig naixer`, answer: `vaig néixer` },
{ text: `Corregix: nesiu`, answer: `nascut` },
{ text: `Corregix: ma dit`, answer: `m'ha dit` },
{ text: `Corregix: savia`, answer: `sabia` },
{ text: `Corregix: hi han molts`, answer: `hi ha molts` },
{ text: `Corregix: vaiga`, answer: `vagi` },
{ text: `Corregix: ha vegades`, answer: `hi ha vegades` },
{ text: `Corregix: casi mai`, answer: `gairebé mai` },
{ text: `Corregix: va vindré`, answer: `va vindre` },
{ text: `Corregix: aixo es molt dificil`, answer: `això és molt difícil` },
{ text: `Corregix: ambdós dos`, answer: `ambdós` },
{ text: `Corregix: va caure a baix`, answer: `va caure` },
{ text: `Corregix: torna a repetir`, answer: `repeteix` },
{ text: `Corregix: baixa avall`, answer: `baixa` },
{ text: `Corregix: puja amunt`, answer: `puja` },
{ text: `Corregix: vaig sortir fora a fora`, answer: `vaig sortir fora` },
{ text: `Corregix: tots i totes`, answer: `tothom` },
{ text: `Corregix: tingueu que`, answer: `hàgiu de` },
{ text: `Corregix: l’història`, answer: `la història` },
{ text: `Corregix: el aula`, answer: `l’aula` },
{ text: `Corregix: la problema`, answer: `el problema` },
{ text: `Corregix: les sistema`, answer: `els sistemes` },
     { text: `Corregix: lo nen`, answer: `el nen` },
{ text: `Corregix: la calor son forts`, answer: `la calor és forta` },
{ text: `Corregix: els professora`, answer: `la professora` },
{ text: `Corregix: la mans`, answer: `les mans` },
{ text: `Corregix: els aigua`, answer: `l’aigua` },
{ text: `Corregix: el àvia`, answer: `l’àvia` },
{ text: `Corregix: la màxima autoritat es`, answer: `la màxima autoritat és` },
{ text: `Corregix: la mon`, answer: `el món` },
{ text: `Corregix: el mare`, answer: `la mare` },
{ text: `Corregix: la pare`, answer: `el pare` },
{ text: `Corregix: vaig dixar`, answer: `vaig deixar` },
{ text: `Corregix: vax`, answer: `vaig` },
{ text: `Corregix: disidir`, answer: `decidir` },
{ text: `Corregix: despres`, answer: `després` },
{ text: `Corregix: ora`, answer: `hora` },
{ text: `Corregix: vorem`, answer: `veurem` },
{ text: `Corregix: podriem`, answer: `podríem` },
{ text: `Corregix: tinguerem`, answer: `tinguérem` },
{ text: `Corregix: mosatros`, answer: `nosaltres` },
{ text: `Corregix: vosatros`, answer: `vosaltres` },
{ text: `Corregix: me se ha caigut`, answer: `m’ha caigut` },
{ text: `Corregix: li ho vaig dir`, answer: `l’hi vaig dir` },
{ text: `Corregix: vaig dixar-lo`, answer: `vaig deixar-lo` },
{ text: `Corregix: se va anar`, answer: `se’n va anar` },
{ text: `Corregix: vindrém`, answer: `vindrem` },
{ text: `Corregix: treballarém`, answer: `treballarem` },
{ text: `Corregix: cantarem-ho`, answer: `cantarem` },
{ text: `Corregix: cantan`, answer: `canten` },
{ text: `Corregix: estiguem bé tots`, answer: `estiguem tots bé` },
{ text: `Corregix: no se fer-ho`, answer: `no sé fer-ho` }
  ];

  // R / RR
  const BANK_RR = [
    { text: `Escriu correctament, R o RR: ca_era (via).`, answer: `carretera` },
    { text: `Escriu correctament, R o RR: te__a (sòl).`, answer: `terra` },
    { text: `Escriu correctament, R o RR: ca__il (vial).`, answer: `carril` }, 
    { text: `Escriu correctament, R o RR: co_eu (casc urbà).`, answer: `carrer` },
   { text: `Escriu correctament, R o RR: bu__o (animal de granja).`, answer: `burro` },
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
  { text: `Escriu correctament, L o L·L: co__ar (unir dues peces)`, answer: `collar` },
  { text: `Escriu correctament, L o L·L: so__icitud (petició formal)`, answer: `sol·licitud` },
  { text: `Escriu correctament, L o L·L: mi__or (de més petita mida)`, answer: `millor` },
  { text: `Escriu correctament, L o L·L: exce__ent (molt bo)`, answer: `excel·lent` },
  { text: `Escriu correctament, L o L·L: a__umne (estudiant)`, answer: `alumne` },
  { text: `Escriu correctament, L o L·L: po__ució (contaminació)`, answer: `pol·lució` },
  { text: `Escriu correctament, L o L·L: ce__òfana (plàstic transparent)`, answer: `cel·lofana` },
  { text: `Escriu correctament, L o L·L: co__egi (institució educativa)`, answer: `col·legi` },
  { text: `Escriu correctament, L o L·L: be__igerant (agressiu o combatiu)`, answer: `bel·ligerant` },
  { text: `Escriu correctament, L o L·L: vi__a (camí o direcció)`, answer: `villa` },
  { text: `Escriu correctament, L o L·L: mo__í (aparell per moldre)`, answer: `molí` },
  { text: `Escriu correctament, L o L·L: te__efonista (persona que atén trucades)`, answer: `telefònista` },
  { text: `Escriu correctament, L o L·L: co__ector (que recull o agrupa)`, answer: `col·lector` },
  { text: `Escriu correctament, L o L·L: a__ucinant (sorprenent)`, answer: `al·lucinant` },
  { text: `Escriu correctament, L o L·L: mo__estia (actitud humil)`, answer: `modèstia` }
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
  },
   { 
  text: `Indica temps i mode: "Cantaria"`, 
  options: ["Condicional simple", "Futur simple", "Imperfet d’indicatiu", "Present de subjuntiu"], 
  answer: `Condicional simple` 
},
{ 
  text: `Indica temps i mode: "Havia estudiat"`, 
  options: ["Plusquamperfet d’indicatiu", "Perfet de subjuntiu", "Condicional compost", "Futur compost"], 
  answer: `Plusquamperfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Correrem"`, 
  options: ["Condicional simple", "Futur simple d’indicatiu", "Imperfet de subjuntiu", "Present d’indicatiu"], 
  answer: `Futur simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Cantéssiu"`, 
  options: ["Present de subjuntiu", "Perfet de subjuntiu", "Imperfet de subjuntiu", "Condicional"], 
  answer: `Imperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Ha plogut"`, 
  options: ["Perfet d’indicatiu", "Plusquamperfet d’indicatiu", "Futur compost", "Condicional compost"], 
  answer: `Perfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Canti"`, 
  options: ["Present de subjuntiu", "Present d’indicatiu", "Imperfet de subjuntiu", "Condicional"], 
  answer: `Present de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Haguérem menjat"`, 
  options: ["Perfet de subjuntiu", "Plusquamperfet de subjuntiu", "Condicional compost", "Futur compost"], 
  answer: `Plusquamperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Vindré"`, 
  options: ["Condicional simple", "Futur simple d’indicatiu", "Imperfet d’indicatiu", "Present de subjuntiu"], 
  answer: `Futur simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Hauríeu arribat"`, 
  options: ["Condicional compost", "Futur compost d’indicatiu", "Plusquamperfet d’indicatiu", "Perfet de subjuntiu"], 
  answer: `Condicional compost` 
},
{ 
  text: `Indica temps i mode: "Arribi"`, 
  options: ["Present de subjuntiu", "Imperfet d’indicatiu", "Futur simple", "Condicional"], 
  answer: `Present de subjuntiu` 
},
   { 
  text: `Indica temps i mode: "Cantava"`, 
  options: ["Imperfet d’indicatiu", "Present d’indicatiu", "Condicional", "Futur simple"], 
  answer: `Imperfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Hauran jugat"`, 
  options: ["Perfet de subjuntiu", "Futur compost d’indicatiu", "Condicional compost", "Plusquamperfet d’indicatiu"], 
  answer: `Futur compost d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Cantarem"`, 
  options: ["Condicional simple", "Futur simple d’indicatiu", "Imperfet de subjuntiu", "Perfet de subjuntiu"], 
  answer: `Futur simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Cantéssim"`, 
  options: ["Imperfet de subjuntiu", "Present de subjuntiu", "Condicional compost", "Perfet d’indicatiu"], 
  answer: `Imperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "He escrit"`, 
  options: ["Perfet d’indicatiu", "Plusquamperfet d’indicatiu", "Futur compost", "Condicional compost"], 
  answer: `Perfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Escrivia"`, 
  options: ["Present d’indicatiu", "Imperfet d’indicatiu", "Condicional simple", "Imperfet de subjuntiu"], 
  answer: `Imperfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Escrivint"`, 
  options: ["Gerundi", "Infinitiu", "Participi", "Perfet d’indicatiu"], 
  answer: `Gerundi` 
},
{ 
  text: `Indica temps i mode: "Escrivint"`, 
  options: ["Gerundi", "Participi", "Infinitiu", "Imperfet de subjuntiu"], 
  answer: `Gerundi` 
},
{ 
  text: `Indica temps i mode: "Correríeu"`, 
  options: ["Condicional simple", "Futur simple", "Imperfet d’indicatiu", "Present de subjuntiu"], 
  answer: `Condicional simple` 
},
{ 
  text: `Indica temps i mode: "Haguérem parlat"`, 
  options: ["Plusquamperfet d’indicatiu", "Perfet de subjuntiu", "Plusquamperfet de subjuntiu", "Condicional compost"], 
  answer: `Plusquamperfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Parlaré"`, 
  options: ["Present d’indicatiu", "Futur simple d’indicatiu", "Condicional simple", "Imperfet de subjuntiu"], 
  answer: `Futur simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Parleu"`, 
  options: ["Present d’indicatiu", "Present de subjuntiu", "Imperfet d’indicatiu", "Perfet d’indicatiu"], 
  answer: `Present d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Parlin"`, 
  options: ["Imperfet d’indicatiu", "Present de subjuntiu", "Perfet de subjuntiu", "Futur simple"], 
  answer: `Present de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Hauria arribat"`, 
  options: ["Condicional compost", "Futur compost", "Plusquamperfet d’indicatiu", "Perfet de subjuntiu"], 
  answer: `Condicional compost` 
},
{ 
  text: `Indica temps i mode: "Va arribar"`, 
  options: ["Perfet perifràstic d’indicatiu", "Passat simple", "Plusquamperfet", "Futur simple"], 
  answer: `Perfet perifràstic d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Arribés"`, 
  options: ["Imperfet de subjuntiu", "Present de subjuntiu", "Condicional simple", "Perfet d’indicatiu"], 
  answer: `Imperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Sigui"`, 
  options: ["Present de subjuntiu", "Present d’indicatiu", "Imperfet de subjuntiu", "Condicional"], 
  answer: `Present de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Serem"`, 
  options: ["Futur simple d’indicatiu", "Condicional simple", "Present d’indicatiu", "Perfet de subjuntiu"], 
  answer: `Futur simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Era"`, 
  options: ["Present d’indicatiu", "Imperfet d’indicatiu", "Condicional simple", "Imperfet de subjuntiu"], 
  answer: `Imperfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Fos"`, 
  options: ["Imperfet de subjuntiu", "Present de subjuntiu", "Condicional simple", "Perfet d’indicatiu"], 
  answer: `Imperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Hàgim parlat"`, 
  options: ["Perfet de subjuntiu", "Perfet d’indicatiu", "Plusquamperfet d’indicatiu", "Condicional compost"], 
  answer: `Perfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Cantareu"`, 
  options: ["Futur simple d’indicatiu", "Condicional simple", "Imperfet d’indicatiu", "Present de subjuntiu"], 
  answer: `Futur simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Cantin"`, 
  options: ["Present de subjuntiu", "Present d’indicatiu", "Condicional simple", "Imperfet de subjuntiu"], 
  answer: `Present de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Cantà"`, 
  options: ["Passat simple d’indicatiu", "Perfet d’indicatiu", "Condicional simple", "Futur simple"], 
  answer: `Passat simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Havia viscut"`, 
  options: ["Plusquamperfet d’indicatiu", "Perfet d’indicatiu", "Condicional compost", "Futur compost"], 
  answer: `Plusquamperfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Visquéreu"`, 
  options: ["Passat simple d’indicatiu", "Imperfet d’indicatiu", "Perfet de subjuntiu", "Condicional simple"], 
  answer: `Passat simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Visquessin"`, 
  options: ["Imperfet de subjuntiu", "Present de subjuntiu", "Condicional compost", "Perfet d’indicatiu"], 
  answer: `Imperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Viu"`, 
  options: ["Present d’indicatiu", "Present de subjuntiu", "Imperfet d’indicatiu", "Condicional"], 
  answer: `Present d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Vius"`, 
  options: ["Present d’indicatiu", "Present de subjuntiu", "Imperfet d’indicatiu", "Perfet d’indicatiu"], 
  answer: `Present d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Viuré"`, 
  options: ["Futur simple d’indicatiu", "Condicional simple", "Perfet de subjuntiu", "Imperfet d’indicatiu"], 
  answer: `Futur simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Voldria"`, 
  options: ["Condicional simple", "Futur simple", "Imperfet d’indicatiu", "Present de subjuntiu"], 
  answer: `Condicional simple` 
},
{ 
  text: `Indica temps i mode: "Voldré"`, 
  options: ["Futur simple d’indicatiu", "Condicional simple", "Present d’indicatiu", "Perfet d’indicatiu"], 
  answer: `Futur simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Volgués"`, 
  options: ["Imperfet de subjuntiu", "Present de subjuntiu", "Imperfet d’indicatiu", "Condicional compost"], 
  answer: `Imperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Vol"`, 
  options: ["Present d’indicatiu", "Imperfet d’indicatiu", "Present de subjuntiu", "Perfet de subjuntiu"], 
  answer: `Present d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Volgué"`, 
  options: ["Passat simple d’indicatiu", "Perfet perifràstic", "Imperfet d’indicatiu", "Condicional simple"], 
  answer: `Passat simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Haurien volgut"`, 
  options: ["Condicional compost", "Futur compost d’indicatiu", "Plusquamperfet d’indicatiu", "Perfet de subjuntiu"], 
  answer: `Condicional compost` 
},
{ 
  text: `Indica temps i mode: "Hagin volgut"`, 
  options: ["Perfet de subjuntiu", "Perfet d’indicatiu", "Plusquamperfet d’indicatiu", "Condicional compost"], 
  answer: `Perfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Anàrem"`, 
  options: ["Passat simple d’indicatiu", "Perfet d’indicatiu", "Imperfet de subjuntiu", "Condicional simple"], 
  answer: `Passat simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Anés"`, 
  options: ["Imperfet de subjuntiu", "Present de subjuntiu", "Imperfet d’indicatiu", "Condicional"], 
  answer: `Imperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Aniria"`, 
  options: ["Condicional simple", "Futur simple d’indicatiu", "Imperfet d’indicatiu", "Perfet de subjuntiu"], 
  answer: `Condicional simple` 
},
   { 
  text: `Indica temps i mode: "Cantaria"`, 
  options: ["Condicional simple", "Futur simple", "Present d’indicatiu", "Imperfet de subjuntiu"], 
  answer: `Condicional simple` 
},
{ 
  text: `Indica temps i mode: "Hauríem sortit"`, 
  options: ["Condicional compost", "Futur compost", "Perfet de subjuntiu", "Plusquamperfet d’indicatiu"], 
  answer: `Condicional compost` 
},
{ 
  text: `Indica temps i mode: "Sortí"`, 
  options: ["Passat simple d’indicatiu", "Perfet perifràstic", "Imperfet d’indicatiu", "Condicional"], 
  answer: `Passat simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Sortissin"`, 
  options: ["Present de subjuntiu", "Imperfet de subjuntiu", "Condicional simple", "Perfet d’indicatiu"], 
  answer: `Imperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Ha sortit"`, 
  options: ["Perfet d’indicatiu", "Perfet de subjuntiu", "Condicional compost", "Futur compost"], 
  answer: `Perfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Hagi sortit"`, 
  options: ["Perfet de subjuntiu", "Perfet d’indicatiu", "Plusquamperfet d’indicatiu", "Condicional compost"], 
  answer: `Perfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Dormia"`, 
  options: ["Imperfet d’indicatiu", "Present d’indicatiu", "Condicional simple", "Imperfet de subjuntiu"], 
  answer: `Imperfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Dormiré"`, 
  options: ["Futur simple d’indicatiu", "Condicional simple", "Imperfet d’indicatiu", "Perfet de subjuntiu"], 
  answer: `Futur simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Dormís"`, 
  options: ["Imperfet de subjuntiu", "Present de subjuntiu", "Condicional simple", "Perfet d’indicatiu"], 
  answer: `Imperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Dormi"`, 
  options: ["Present de subjuntiu", "Present d’indicatiu", "Imperfet de subjuntiu", "Condicional"], 
  answer: `Present de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Hem dormit"`, 
  options: ["Perfet d’indicatiu", "Condicional compost", "Perfet de subjuntiu", "Plusquamperfet d’indicatiu"], 
  answer: `Perfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Haguessin dormit"`, 
  options: ["Plusquamperfet de subjuntiu", "Condicional compost", "Futur compost", "Perfet de subjuntiu"], 
  answer: `Plusquamperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Llegí"`, 
  options: ["Passat simple d’indicatiu", "Perfet d’indicatiu", "Futur simple", "Condicional"], 
  answer: `Passat simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Llegiràs"`, 
  options: ["Futur simple d’indicatiu", "Condicional simple", "Present d’indicatiu", "Imperfet de subjuntiu"], 
  answer: `Futur simple d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Llegissis"`, 
  options: ["Imperfet de subjuntiu", "Present de subjuntiu", "Condicional compost", "Imperfet d’indicatiu"], 
  answer: `Imperfet de subjuntiu` 
},
{ 
  text: `Indica temps i mode: "Llegim"`, 
  options: ["Present d’indicatiu", "Present de subjuntiu", "Imperfet d’indicatiu", "Condicional"], 
  answer: `Present d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Llegiu"`, 
  options: ["Present d’indicatiu", "Imperfet d’indicatiu", "Present de subjuntiu", "Condicional"], 
  answer: `Present d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Havíem llegit"`, 
  options: ["Plusquamperfet d’indicatiu", "Perfet d’indicatiu", "Futur compost", "Condicional compost"], 
  answer: `Plusquamperfet d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Hauran llegit"`, 
  options: ["Futur compost d’indicatiu", "Condicional compost", "Perfet de subjuntiu", "Plusquamperfet de subjuntiu"], 
  answer: `Futur compost d'indicatiu` 
},
{ 
  text: `Indica temps i mode: "Llegissin"`, 
  options: ["Imperfet de subjuntiu", "Present de subjuntiu", "Condicional simple", "Perfet d’indicatiu"], 
  answer: `Imperfet de subjuntiu` 
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
  }, 
   { 
  text: `Categoria gramatical de "blau"`, 
  options: ["Adjectiu", "Nom comú", "Verb", "Adverbi"], 
  answer: `Adjectiu` 
},
{ 
  text: `Categoria gramatical de "menjar" (acció)`, 
  options: ["Verb", "Nom comú", "Adverbi", "Pronom"], 
  answer: `Verb` 
},
{ 
  text: `Categoria gramatical de "taula"`, 
  options: ["Nom comú", "Adjectiu", "Verb", "Article"], 
  answer: `Nom comú` 
},
{ 
  text: `Categoria gramatical de "elles"`, 
  options: ["Pronom", "Nom comú", "Verb", "Adjectiu"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "molt"`, 
  options: ["Adverbi", "Adjectiu", "Nom comú", "Conjunció"], 
  answer: `Adverbi` 
},
{ 
  text: `Categoria gramatical de "i"`, 
  options: ["Conjunció", "Pronom", "Adjectiu", "Nom comú"], 
  answer: `Conjunció` 
},
{ 
  text: `Categoria gramatical de "amb"`, 
  options: ["Preposició", "Adverbi", "Article", "Verb"], 
  answer: `Preposició` 
},
{ 
  text: `Categoria gramatical de "els" (article)`, 
  options: ["Article", "Pronom", "Nom comú", "Adverbi"], 
  answer: `Article` 
},
{ 
  text: `Categoria gramatical de "aquell"`, 
  options: ["Pronom", "Adjectiu", "Adverbi", "Conjunció"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "nosaltres"`, 
  options: ["Pronom", "Nom comú", "Adjectiu", "Verb"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "feliç"`, 
  options: ["Adjectiu", "Nom comú", "Verb", "Adverbi"], 
  answer: `Adjectiu` 
},
{ 
  text: `Categoria gramatical de "a"`, 
  options: ["Preposició", "Article", "Conjunció", "Pronom"], 
  answer: `Preposició` 
},
{ 
  text: `Categoria gramatical de "què"`, 
  options: ["Pronom", "Conjunció", "Nom comú", "Adverbi"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "quan"`, 
  options: ["Adverbi", "Conjunció", "Pronom", "Article"], 
  answer: `Adverbi` 
},
{ 
  text: `Categoria gramatical de "sota"`, 
  options: ["Preposició", "Adverbi", "Conjunció", "Pronom"], 
  answer: `Preposició` 
},
{ 
  text: `Categoria gramatical de "la" (article)`, 
  options: ["Article", "Pronom", "Adverbi", "Adjectiu"], 
  answer: `Article` 
},
{ 
  text: `Categoria gramatical de "contentament"`, 
  options: ["Nom comú", "Adjectiu", "Verb", "Adverbi"], 
  answer: `Nom comú` 
},
{ 
  text: `Categoria gramatical de "córrer"`, 
  options: ["Verb", "Nom comú", "Adverbi", "Adjectiu"], 
  answer: `Verb` 
},
{ 
  text: `Categoria gramatical de "més"`, 
  options: ["Adverbi", "Conjunció", "Pronom", "Nom comú"], 
  answer: `Adverbi` 
},
{ 
  text: `Categoria gramatical de "cap" (determinant)`, 
  options: ["Determinant", "Nom comú", "Pronom", "Verb"], 
  answer: `Determinant` 
},
   { 
  text: `Categoria gramatical de "llum"`, 
  options: ["Nom comú", "Adjectiu", "Verb", "Pronom"], 
  answer: `Nom comú` 
},
{ 
  text: `Categoria gramatical de "casa"`, 
  options: ["Nom comú", "Adverbi", "Verb", "Adjectiu"], 
  answer: `Nom comú` 
},
{ 
  text: `Categoria gramatical de "ràpid"`, 
  options: ["Adjectiu", "Nom comú", "Verb", "Adverbi"], 
  answer: `Adjectiu` 
},
{ 
  text: `Categoria gramatical de "ells"`, 
  options: ["Pronom", "Article", "Verb", "Adverbi"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "perquè"`, 
  options: ["Conjunció", "Adverbi", "Pronom", "Nom comú"], 
  answer: `Conjunció` 
},
{ 
  text: `Categoria gramatical de "sota"`, 
  options: ["Preposició", "Article", "Adverbi", "Pronom"], 
  answer: `Preposició` 
},
{ 
  text: `Categoria gramatical de "els" (pronom)`, 
  options: ["Pronom", "Article", "Nom comú", "Adverbi"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "bonic"`, 
  options: ["Adjectiu", "Nom comú", "Adverbi", "Verb"], 
  answer: `Adjectiu` 
},
{ 
  text: `Categoria gramatical de "lentament"`, 
  options: ["Adverbi", "Adjectiu", "Verb", "Nom comú"], 
  answer: `Adverbi` 
},
{ 
  text: `Categoria gramatical de "el" (article)`, 
  options: ["Article", "Pronom", "Nom comú", "Adverbi"], 
  answer: `Article` 
},
{ 
  text: `Categoria gramatical de "vosaltres"`, 
  options: ["Pronom", "Nom comú", "Verb", "Adjectiu"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "bonament"`, 
  options: ["Adverbi", "Adjectiu", "Nom comú", "Verb"], 
  answer: `Adverbi` 
},
{ 
  text: `Categoria gramatical de "quan"`, 
  options: ["Adverbi", "Conjunció", "Pronom", "Article"], 
  answer: `Adverbi` 
},
{ 
  text: `Categoria gramatical de "tot" (determinant)`, 
  options: ["Determinant", "Nom comú", "Adverbi", "Pronom"], 
  answer: `Determinant` 
},
{ 
  text: `Categoria gramatical de "sense"`, 
  options: ["Preposició", "Conjunció", "Adverbi", "Pronom"], 
  answer: `Preposició` 
},
{ 
  text: `Categoria gramatical de "moltíssim"`, 
  options: ["Adverbi", "Nom comú", "Adjectiu", "Conjunció"], 
  answer: `Adverbi` 
},
{ 
  text: `Categoria gramatical de "quina"` , 
  options: ["Pronom", "Determinant", "Adjectiu", "Adverbi"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "cap" (nom)`, 
  options: ["Nom comú", "Determinant", "Adverbi", "Verb"], 
  answer: `Nom comú` 
},
{ 
  text: `Categoria gramatical de "aleshores"`, 
  options: ["Adverbi", "Conjunció", "Pronom", "Nom comú"], 
  answer: `Adverbi` 
},
{ 
  text: `Categoria gramatical de "damunt"`, 
  options: ["Preposició", "Adverbi", "Conjunció", "Pronom"], 
  answer: `Preposició` 
}, 
   { 
  text: `Categoria gramatical de "llibertat"`, 
  options: ["Nom comú", "Adjectiu", "Verb", "Pronom"], 
  answer: `Nom comú` 
},
{ 
  text: `Categoria gramatical de "elles mateixes"`, 
  options: ["Pronom", "Nom comú", "Article", "Adjectiu"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "tranquil·lament"`, 
  options: ["Adverbi", "Adjectiu", "Verb", "Nom comú"], 
  answer: `Adverbi` 
},
{ 
  text: `Categoria gramatical de "fosc"`, 
  options: ["Adjectiu", "Nom comú", "Verb", "Adverbi"], 
  answer: `Adjectiu` 
},
{ 
  text: `Categoria gramatical de "jo"`, 
  options: ["Pronom", "Article", "Adverbi", "Nom comú"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "ells"`, 
  options: ["Pronom", "Adjectiu", "Nom comú", "Conjunció"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "damunt"`, 
  options: ["Preposició", "Adverbi", "Conjunció", "Pronom"], 
  answer: `Preposició` 
},
{ 
  text: `Categoria gramatical de "mentre"`, 
  options: ["Conjunció", "Adverbi", "Pronom", "Nom comú"], 
  answer: `Conjunció` 
},
{ 
  text: `Categoria gramatical de "nosaltres"`, 
  options: ["Pronom", "Article", "Nom comú", "Verb"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "dolçament"`, 
  options: ["Adverbi", "Adjectiu", "Verb", "Nom comú"], 
  answer: `Adverbi` 
},
{ 
  text: `Categoria gramatical de "gran"`, 
  options: ["Adjectiu", "Nom comú", "Adverbi", "Verb"], 
  answer: `Adjectiu` 
},
{ 
  text: `Categoria gramatical de "quina" (determinant)`, 
  options: ["Determinant", "Pronom", "Article", "Adjectiu"], 
  answer: `Determinant` 
},
{ 
  text: `Categoria gramatical de "quan"`, 
  options: ["Adverbi", "Conjunció", "Pronom", "Nom comú"], 
  answer: `Adverbi` 
},
{ 
  text: `Categoria gramatical de "per"`, 
  options: ["Preposició", "Article", "Conjunció", "Pronom"], 
  answer: `Preposició` 
},
{ 
  text: `Categoria gramatical de "doncs"`, 
  options: ["Conjunció", "Adverbi", "Pronom", "Nom comú"], 
  answer: `Conjunció` 
},
{ 
  text: `Categoria gramatical de "amics"`, 
  options: ["Nom comú", "Verb", "Adjectiu", "Pronom"], 
  answer: `Nom comú` 
},
{ 
  text: `Categoria gramatical de "la" (pronom)`, 
  options: ["Pronom", "Article", "Adjectiu", "Nom comú"], 
  answer: `Pronom` 
},
{ 
  text: `Categoria gramatical de "petit"`, 
  options: ["Adjectiu", "Nom comú", "Verb", "Adverbi"], 
  answer: `Adjectiu` 
},
{ 
  text: `Categoria gramatical de "damunt"`, 
  options: ["Preposició", "Conjunció", "Pronom", "Adverbi"], 
  answer: `Preposició` 
},
{ 
  text: `Categoria gramatical de "bé"`, 
  options: ["Adverbi", "Nom comú", "Adjectiu", "Verb"], 
  answer: `Adverbi` 
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
  },
  { 
    text: `Frase correcta:`, 
    options:["El gossos corren pel parc","Els gos corre pel parc","Els gossos corren pel parc","El gos corren pel parc"], 
    answer: `Els gossos corren pel parc` 
  },
  { 
    text: `Frase correcta:`, 
    options:["La nen content","El nen contents","La nena contents","La nena contenta"], 
    answer: `La nena contenta` 
  },
  { 
    text: `Frase correcta:`, 
    options:["Els llibres nou","Els llibre nous","Els llibres nous","El llibres nous"], 
    answer: `Els llibres nous` 
  },
  { 
    text: `Frase correcta:`, 
    options:["Les flors vermells","Les flors vermelles","La flor vermelles","Les flor vermell"], 
    answer: `Les flors vermelles` 
  },
  { 
    text: `Frase correcta:`, 
    options:["L'home alt caminen ràpid","Els homes alts caminen ràpid","Els home alt camina ràpid","Els homes alt caminen ràpid"], 
    answer: `Els homes alts caminen ràpid` 
  },
  { 
    text: `Frase correcta:`, 
    options:["Les nenes juga al pati","Les nen juga al pati","Les nenes juguen al pati","La nena juguen al pati"], 
    answer: `Les nenes juguen al pati` 
  },
  { 
    text: `Frase correcta:`, 
    options:["El cotxes vermells estan aparcat","Els cotxes vermells estan aparcats","Els cotxe vermell estan aparcats","Els cotxes vermell està aparcat"], 
    answer: `Els cotxes vermells estan aparcats` 
  },
  { 
    text: `Frase correcta:`, 
    options:["La cases grans són boniques","Les cases gran són boniques","Les cases grans són boniques","Les casa grans és bonica"], 
    answer: `Les cases grans són boniques` 
  },
  { 
    text: `Frase correcta:`, 
    options:["El gats dormen molt","Els gats dormen molt","Els gat dorm molt","Els gats dorm molt"], 
    answer: `Els gats dormen molt` 
  },
  { 
    text: `Frase correcta:`, 
    options:["La professors simpàtics","Els professors simpàtics","Els professors simpàtic","Els professor simpàtics"], 
    answer: `Els professors simpàtics` 
  },
  { 
    text: `Frase correcta:`, 
    options:["Les alumnes nou","Les alumnes noves","La alumna noves","Les alumne noves"], 
    answer: `Les alumnes noves` 
  },
  { 
    text: `Frase correcta:`, 
    options:["Els nois i les noies està contents","Els nois i les noies estan contents","Els noi i la noia estan content","Els nois i les noies està contentes"], 
    answer: `Els nois i les noies estan contents` 
  },
  { 
    text: `Frase correcta:`, 
    options:["El nens petit juguen","Els nens petits juguen","Els nen petits juga","Els nens petit juga"], 
    answer: `Els nens petits juguen` 
  },
  { 
    text: `Frase correcta:`, 
    options:["Les portes obertes deixen passar l’aire","Les porta oberta deixen passar l’aire","Les portes oberta deixa passar l’aire","Les porta obertes deixen passar l’aire"], 
    answer: `Les portes obertes deixen passar l’aire` 
  },
  { 
    text: `Frase correcta:`, 
    options:["El noi i la noia simpàtics","Els nois i les noies simpàtics","Els noi i la noia simpàtic","Els nois i la noia simpàtics"], 
    answer: `Els nois i les noies simpàtics` 
  },
  { 
    text: `Frase correcta:`, 
    options:["Aquest nen són divertits","Aquests nens són divertits","Aquest nens és divertit","Aquests nen és divertit"], 
    answer: `Aquests nens són divertits` 
  },
  { 
    text: `Frase correcta:`, 
    options:["La nena i el nen contentes","La nena i el nen contents","Les nenes i els nens content","Les nen i els nen contenta"], 
    answer: `La nena i el nen contents` 
  },
  { 
    text: `Frase correcta:`, 
    options:["Els amics nova","Les amigues noves","Els amics nous","Els amiga noves"], 
    answer: `Els amics nous` 
  },
  // 🔹 Noves frases (21–50)
  {
    text: `Frase correcta:`,
    options:["Les noies és altes","Les noies són altes","Les noia són altes","La noies és altes"],
    answer: `Les noies són altes`
  },
  {
    text: `Frase correcta:`,
    options:["Els nens és intel·ligents","Els nens són intel·ligents","Els nen són intel·ligent","Els nens és intel·ligent"],
    answer: `Els nens són intel·ligents`
  },
  {
    text: `Frase correcta:`,
    options:["La nena és simpàtic","La nena és simpàtica","Les nenes són simpàtic","La nen és simpàtica"],
    answer: `La nena és simpàtica`
  },
  {
    text: `Frase correcta:`,
    options:["Els homes jove treballen molt","Els homes joves treballen molt","Els home jove treballa molt","Els homes jove treballa molt"],
    answer: `Els homes joves treballen molt`
  },
  {
    text: `Frase correcta:`,
    options:["Les classes divertides agraden a tothom","Les classe divertit agraden a tothom","Les classes divertit agraden a tothom","Les classe divertida agraden a tothom"],
    answer: `Les classes divertides agraden a tothom`
  },
  {
    text: `Frase correcta:`,
    options:["Els llibres és interessants","Els llibres són interessants","Els llibre són interessant","Els llibres és interessant"],
    answer: `Els llibres són interessants`
  },
  {
    text: `Frase correcta:`,
    options:["El gos i el gat són amics","Els gos i el gat són amic","El gos i el gat són amics","Els gossos i els gats és amics"],
    answer: `El gos i el gat són amics`
  },
  {
    text: `Frase correcta:`,
    options:["La porta oberta deixen entrar la llum","La porta oberta deixa entrar la llum","Les portes obertes deixa entrar la llum","La portes obertes deixen entrar la llum"],
    answer: `La porta oberta deixa entrar la llum`
  },
  {
    text: `Frase correcta:`,
    options:["Els nens i nenes petit juga","Els nens i nenes petits juguen","Els nen i nena petits juga","Els nens i nenes petites juga"],
    answer: `Els nens i nenes petits juguen`
  },
  {
    text: `Frase correcta:`,
    options:["Els amics noves","Els amics nous","Les amigues nous","Les amics nova"],
    answer: `Els amics nous`
  },
  // 🔸 Gènere i adjectius
  {
    text: `Frase correcta:`,
    options:["El noi alt","La noi alta","El noi alta","La noia alt"],
    answer: `El noi alt`
  },
  {
    text: `Frase correcta:`,
    options:["La noia alta","El noia alta","La noia alt","El noi alta"],
    answer: `La noia alta`
  },
  {
    text: `Frase correcta:`,
    options:["Els nois alts","Els nois alta","Els noi alts","Les nois alts"],
    answer: `Els nois alts`
  },
  {
    text: `Frase correcta:`,
    options:["Les noies altes","La noies alts","Les noia altes","Els noies altes"],
    answer: `Les noies altes`
  },
  {
    text: `Frase correcta:`,
    options:["El cotxe vermella","El cotxe vermell","La cotxe vermell","La cotxe vermella"],
    answer: `El cotxe vermell`
  },
  {
    text: `Frase correcta:`,
    options:["La taula vermella","El taula vermell","La taula vermell","La taules vermelles"],
    answer: `La taula vermella`
  },
  {
    text: `Frase correcta:`,
    options:["Els cotxes vermells","Els cotxe vermelles","Els cotxes vermella","Els cotxes vermell"],
    answer: `Els cotxes vermells`
  },
  {
    text: `Frase correcta:`,
    options:["Les cadires vermelles","La cadira vermell","Les cadira vermelles","Les cadires vermell"],
    answer: `Les cadires vermelles`
  },
  {
    text: `Frase correcta:`,
    options:["El nen trist","El nen trista","La nen trist","La nena trist"],
    answer: `El nen trist`
  },
  {
    text: `Frase correcta:`,
    options:["La nena trista","El nena trist","La nena trist","La nenes tristes"],
    answer: `La nena trista`
  },
  {
    text: `Frase correcta:`,
    options:["Els nens tristos","Els nens trista","Els nen trist","Les nens tristes"],
    answer: `Els nens tristos`
  },
  {
    text: `Frase correcta:`,
    options:["Les nenes tristes","Les nena trista","Les nenes trist","La nenes tristes"],
    answer: `Les nenes tristes`
  },
  {
    text: `Frase correcta:`,
    options:["El gos gran","La gos gran","El gos grans","La gossa gran"],
    answer: `El gos gran`
  },
  {
    text: `Frase correcta:`,
    options:["La gossa gran","El gossa gran","La gossa grans","El gos gran"],
    answer: `La gossa gran`
  },
  {
    text: `Frase correcta:`,
    options:["Els gossos grans","Els gos gran","Els gossos gran","Els gossa grans"],
    answer: `Els gossos grans`
  },
  {
    text: `Frase correcta:`,
    options:["Les gosses grans","Les gossa gran","Les gosses gran","Les gossa grans"],
    answer: `Les gosses grans`
  },
  {
    text: `Frase correcta:`,
    options:["El nen feliç","La nen feliç","Els nens feliços","Les nenes feliç"],
    answer: `El nen feliç`
  },
  {
    text: `Frase correcta:`,
    options:["Les nenes feliços","Els nenes feliç","Les nenes feliç","Les nena feliços"],
    answer: `Les nenes feliços`
  },
  {
    text: `Frase correcta:`,
    options:["El noi jove","La noi jove","Els nois joves","Les noies jove"],
    answer: `El noi jove`
  },
   { 
  text: `Frase correcta:`, 
  options:["Jo canta molt bé","Jo canto molt bé","Jo canten molt bé","Jo cantem molt bé"], 
  answer: `Jo canto molt bé` 
},
{ 
  text: `Frase correcta:`, 
  options:["Tu estudien cada tarda","Tu estudies cada tarda","Tu estudia cada tarda","Tu estudiem cada tarda"], 
  answer: `Tu estudies cada tarda` 
},
{ 
  text: `Frase correcta:`, 
  options:["Ell jugues al futbol","Ell juga al futbol","Ell juguen al futbol","Ell jugo al futbol"], 
  answer: `Ell juga al futbol` 
},
{ 
  text: `Frase correcta:`, 
  options:["Nosaltres llegeixem un llibre","Nosaltres llegim un llibre","Nosaltres llegeixen un llibre","Nosaltres llegiu un llibre"], 
  answer: `Nosaltres llegim un llibre` 
},
{ 
  text: `Frase correcta:`, 
  options:["Vosaltres estudien molt","Vosaltres estudieu molt","Vosaltres estudia molt","Vosaltres estudiem molt"], 
  answer: `Vosaltres estudieu molt` 
},
{ 
  text: `Frase correcta:`, 
  options:["Ells mira la televisió","Ells miren la televisió","Ell mira la televisió","Ell miren la televisió"], 
  answer: `Ells miren la televisió` 
},
{ 
  text: `Frase correcta:`, 
  options:["Jo dorms vuit hores","Jo dormo vuit hores","Jo dorm vuit hores","Jo dormim vuit hores"], 
  answer: `Jo dormo vuit hores` 
},
{ 
  text: `Frase correcta:`, 
  options:["Tu menjam una poma","Tu menges una poma","Tu mengeu una poma","Tu mengen una poma"], 
  answer: `Tu menges una poma` 
},
{ 
  text: `Frase correcta:`, 
  options:["Nosaltres aneu a escola","Nosaltres anem a escola","Nosaltres va a escola","Nosaltres vas a escola"], 
  answer: `Nosaltres anem a escola` 
},
{ 
  text: `Frase correcta:`, 
  options:["Ells tenen gana","Ell té gana","Ells té gana","Ell tenen gana"], 
  answer: `Ells tenen gana` 
},
  {
    text: `Frase correcta:`,
    options:["Les noies joves","Els noies jove","La noia jove","Les noia joves"],
    answer: `Les noies joves`
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

const BANK_MORFO_BASIQUES = [
  {
    text: `Jo ___ un llibre.<br><small>Verb: tenir</small>`,
    answer: `tinc`
  },
  {
    text: `Ella ___ molt alta.<br><small>Verb: ser</small>`,
    answer: `és`
  },
  {
    text: `Nosaltres ___ a l'escola.<br><small>Verb: anar</small>`,
    answer: `anem`
  },
  {
    text: `Tu ___ un germà petit.<br><small>Verb: tenir</small>`,
    answer: `tens`
  },
  {
    text: `Ell ___ els deures.<br><small>Verb: fer</small>`,
    answer: `fa`
  },
  {
    text: `Vosaltres ___ molt contents.<br><small>Verb: ser</small>`,
    answer: `sou`
  },
  {
    text: `Jo ___ a casa cada dia.<br><small>Verb: anar</small>`,
    answer: `vaig`
  },
  {
    text: `Ells ___ moltes ganes de jugar.<br><small>Verb: tenir</small>`,
    answer: `tenen`
  },
  {
    text: `Nosaltres ___ un pastís els diumenges.<br><small>Verb: fer</small>`,
    answer: `fem`
  },
  {
    text: `Tu ___ molt amable amb tothom.<br><small>Verb: ser</small>`,
    answer: `ets`
  },
  {
    text: `Ell ___ a l'institut amb bicicleta.<br><small>Verb: anar</small>`,
    answer: `va`
  },
  {
    text: `Vosaltres ___ dues germanes.<br><small>Verb: tenir</small>`,
    answer: `teniu`
  }
];

const SUBS_MORF = [
  { key: 'basiques', label: 'Estructures bàsiques', bank: BANK_MORFO_BASIQUES },
  { key: 'subjecte', label: 'Subjecte Vs Predicat', bank: BANK_MORFO_SUBJECTE },
  { key: 'temps', label: 'Temps i mode verbal', bank: BANK_MORFO_TEMPS },
  { key: 'categories', label: 'Categories gramaticals', bank: BANK_MORFO_CATEGORIES },
  { key: 'concordanca', label: 'Concordança', bank: BANK_MORFO_CONCORDANCA },
  { key: 'funcions', label: 'Funcions sintàctiques', bank: BANK_MORFO_FUNCIONS }
];

  /* ========== BANCS D'EXERCICIS (COMPRENSIÓ LECTORA) ========== */
  const BANK_LECT = [
    // Instruccions de l'escola
    {
      title: 'Sortida de ciències',
      passage: 'Demà anirem al jardí botànic. Cal portar el quadern de ciències, llapis i una ampolla d\'aigua petita. Sortirem a les 9.30 h des de la porta principal. Si plou, utilitzarem el recinte cobert del pati.',
      question: 'Quin material és imprescindible portar?',
      options: [
        'Només el dinar i una jaqueta',
        "El quadern de ciències, llapis i una ampolla d'aigua",
        'La tauleta i els auriculars',
        'Res, perquè es deixarà tot al jardí'
      ],
      answer: "El quadern de ciències, llapis i una ampolla d'aigua"
    },
    {
      title: 'Taller de biblioteca',
      passage: 'La bibliotecària envia una nota: "Per al taller de lectura heu de triar un llibre curt de la sala infantil i llegir el primer capítol. Porteu el carnet de la biblioteca i arribeu deu minuts abans per signar l\'assistència."',
      question: 'Què han de fer els alumnes abans del taller?',
      options: [
        'Comprar un llibre nou a la llibreria',
        'Llegir el primer capítol del llibre triat',
        'Portar una redacció escrita',
        'Enviar un correu a la bibliotecària'
      ],
      answer: 'Llegir el primer capítol del llibre triat'
    },
    {
      title: 'Laboratori de llengües',
      passage: 'El professor d\'acollida recorda que la sessió de demà serà al laboratori de llengües. Cal deixar les motxilles a les taquilles, entrar en silenci i connectar els auriculars als ordinadors. Durant els primers quinze minuts faran un exercici d\'escolta guiada.',
      question: 'Quina és la primera acció quan entren al laboratori?',
      options: [
        'Connectar els auriculars als ordinadors',
        'Deixar les motxilles a les taquilles',
        'Parlar amb els companys',
        'Encendre la calefacció'
      ],
      answer: 'Deixar les motxilles a les taquilles'
    },

    // Horaris i rutines
    {
      title: 'Horari del dilluns',
      passage: "A l'aula d'acollida, el dilluns comença amb tutoria de 8.30 a 9.00 h. Després hi ha català fins a les 10.30 h i un descans de 30 minuts. A les 11.00 h fan matemàtiques i acaben amb educació física a les 12.30 h.",
      question: 'Quina matèria fan després del descans?',
      options: ['Tutoria', 'Català', 'Matemàtiques', 'Educació física'],
      answer: 'Matemàtiques'
    },
    {
      title: 'Activitats de tarda',
      passage: "Els dimarts a la tarda, els alumnes poden quedar-se a l'espai de suport. De 15.30 a 16.15 h hi ha reforç de lectura, i de 16.15 a 17.00 h un taller de conversa. Els dimecres, en canvi, només hi ha estudi assistit de 15.30 a 16.30 h.",
      question: 'Quan comença el taller de conversa dels dimarts?',
      options: ['A les 15.00 h', 'A les 15.30 h', 'A les 16.15 h', 'A les 17.00 h'],
      answer: 'A les 16.15 h'
    },
    {
      title: 'Calendari de proves',
      passage: "Aquest mes hi haurà dues proves. L'avaluació de vocabulari serà el 12 de març a primera hora. La prova de comprensió oral serà el 20 de març a les 11.30 h. La setmana anterior a cada prova es dedicarà una sessió completa a repassar.",
      question: 'Quan es farà la prova de comprensió oral?',
      options: [
        'El 12 de març a primera hora',
        "El 20 de març a les 11.30 h",
        "El 20 d'abril a les 11.30 h",
        'La setmana abans de cada prova'
      ],
      answer: "El 20 de març a les 11.30 h"
    },

    // Avisos a les famílies
    {
      title: 'Reunió amb les famílies',
      passage: "L'escola envia aquest avís: \"Dijous 5 d'octubre a les 18.00 h farem una reunió per explicar el projecte d'aula d'acollida. Es farà a la sala polivalent. Hi haurà servei de traducció al castellà i àrab.\"",
      question: 'On se celebrarà la reunió?',
      options: ['A l\'aula de música', 'Al gimnàs', 'A la sala polivalent', 'Al pati'],
      answer: 'A la sala polivalent'
    },
    {
      title: 'Autorització de sortida',
      passage: "La coordinadora recorda a les famílies que cal signar i retornar l'autorització per a la sortida al museu abans de divendres. Sense el document, l'alumne haurà de quedar-se a l'institut.",
      question: 'Què passa si no entreguen l\'autorització signada?',
      options: [
        "L'excursió es cancel·la per a tothom",
        "L'alumne haurà de quedar-se a l'institut",
        'Es pot entregar el mateix dia de la sortida',
        'El museu enviarà una altra autorització'
      ],
      answer: "L'alumne haurà de quedar-se a l'institut"
    },
    {
      title: 'Canvi de servei de menjador',
      passage: "La direcció informa que a partir del proper dilluns el menjador oferirà menús sense gluten sota petició. Les famílies que ho necessitin han d'emplenar el formulari en línia abans de divendres i lliurar un informe mèdic al tutor.",
      question: 'Quin pas han de fer les famílies abans de divendres?',
      options: [
        'Comprar menjar a part',
        'Emplenar el formulari en línia per demanar el menú sense gluten',
        'Enviar un correu al menjador cada dia',
        'Fer el pagament addicional al banc'
      ],
      answer: 'Emplenar el formulari en línia per demanar el menú sense gluten'
    },

    // Activitats i serveis complementaris
    {
      title: 'Taller de cuina intercultural',
      passage: 'El divendres 14 d\'abril a les 17.00 h farem un taller de cuina intercultural a la cuina pedagògica. Cada alumne ha de portar un ingredient típic del seu país ja rentat i tallat. L\'escola facilitarà els estris i els fogons. Cal confirmar assistència abans de dimecres.',
      question: 'Què ha de portar cada alumne?',
      options: [
        'Un ingredient típic del seu país rentat i tallat',
        'Els estris de cuina de casa seva',
        'Una recepta escrita en català',
        'Només la confirmació d\'assistència'
      ],
      answer: 'Un ingredient típic del seu país rentat i tallat'
    },
    {
      title: "Normes de l'aula d'estudi",
      passage: "L'aula d'estudi obre de dilluns a dijous de 16.00 a 18.00 h. Cal entrar en silenci, deixar les motxilles a les prestatgeries i utilitzar auriculars si es mira un vídeo. Si s'ha de sortir uns minuts, s'ha d'avisar a la persona responsable.",
      question: 'Què han de fer si necessiten sortir una estona?',
      options: [
        'Marxar sense avisar per no molestar',
        'Avisar a la persona responsable',
        'Deixar la cadira buida amb els llibres',
        'Apuntar el nom en una llista a la porta'
      ],
      answer: 'Avisar a la persona responsable'
    },
    {
      title: 'Revisió mèdica escolar',
      passage: 'El centre de salut passarà revisió mèdica dilluns vinent al gimnàs. Cada alumne ha de portar la targeta sanitària i una autorització signada. Qui no la presenti farà la revisió en una altra data.',
      question: 'Què és imprescindible portar el dia de la revisió?',
      options: [
        'Només l\'esmorzar i aigua',
        'La targeta sanitària i l\'autorització signada',
        'La motxilla amb roba esportiva',
        'Un informe de notes del trimestre'
      ],
      answer: "La targeta sanitària i l'autorització signada"
    },
    {
      title: 'Setmana de la Ciència',
      passage: 'Durant la Setmana de la Ciència hi haurà tallers cada dia. Dimarts es fa un experiment de química a l\'aula d\'acollida, dimecres una xerrada sobre energia i dijous una visita al laboratori de robòtica. Cal inscriure\'s només per a l\'activitat de dijous.',
      question: 'Per a quina activitat cal inscripció prèvia?',
      options: [
        "Per a l'experiment de química de dimarts",
        "Per a la xerrada sobre energia de dimecres",
        'Per a la visita al laboratori de robòtica de dijous',
        'Per al descans de divendres'
      ],
      answer: 'Per a la visita al laboratori de robòtica de dijous'
    },
    {
      title: 'Club de lectura de primavera',
      passage: 'El club de lectura de primavera es reuneix cada dues setmanes a la biblioteca. La primera trobada serà el 3 de maig a les 16.30 h per comentar els capítols 1 i 2 del llibre triat. A la segona trobada, el 17 de maig, es parlarà dels capítols 3 i 4.',
      question: 'Quan es farà la primera trobada del club de lectura?',
      options: [
        'El 3 de maig a les 16.30 h',
        'El 10 de maig a les 16.30 h',
        'El 17 de maig a les 15.00 h',
        'El 24 de maig a les 17.00 h'
      ],
      answer: 'El 3 de maig a les 16.30 h'
    },
    {
      title: "Servei d'acollida matinal",
      passage: "L'escola ofereix servei d'acollida matinal per a les famílies que entren a treballar aviat. El servei funciona de 7.45 a 8.25 h a la sala de psicomotricitat. Cal inscriure els infants mitjançant el formulari en línia i portar un esmorzar lleuger.",
      question: "En quin horari funciona el servei d'acollida matinal?",
      options: [
        'De 6.45 a 7.15 h',
        'De 7.45 a 8.25 h',
        'De 8.30 a 9.15 h',
        'De 9.30 a 10.00 h'
      ],
      answer: 'De 7.45 a 8.25 h'
    }
  ];

  function renderReadingPassage(raw){
    return String(raw)
      .split(/\r?\n+/)
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => `<p>${part}</p>`)
      .join('');
  }

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
  const subKey = opts.sub || 'basiques';
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

function genCatLect(level, _opts = {}){
  const q = choice(BANK_LECT);
  const passageHtml = renderReadingPassage(q.passage) || `<p>${q.passage}</p>`;
  const text = `
    <div class="reading-card">
      <div class="reading-card__title">${q.title}</div>
      <div class="reading-card__passage">${passageHtml}</div>
      <div class="reading-card__question"><span class="reading-card__question-label">Pregunta</span><p>${q.question}</p></div>
    </div>
  `;
  const options = Array.isArray(q.options) ? q.options.slice() : null;
  return {
    type: 'cat-lect',
    text: text.trim(),
    answer: q.answer,
    options,
    input: options ? 'choice' : 'text'
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
      const v = (document.querySelector('input[name="cat-morf-sub"]:checked') || {}).value || 'basiques';
      return { sub: v };
    }
  };

  /* ========== MÒDULS ========== */
  const CAT_MODULES = [
    {
      id: 'cat-ort',
      name: 'Ortografia',
      desc: 'b/v, j/g, s/c/ç/z/x, corregir, r/rr, l/l·l.',
      category: 'cat',
      usesLevels: false,
      levelLabel: 'Mode lliure',
      gen: genCatOrt,
      config: OrtografiaConfig
    },
    {
      id: 'cat-morf',
      name: 'Morfologia',
      desc: 'Subjecte, temps verbals, categories, concordança, funcions sintàctiques.',
      category: 'cat',
      usesLevels: false,
      levelLabel: 'Mode lliure',
      gen: genCatMorf,
      config: MorfologiaConfig
    },
    {
      id: 'cat-lect',
      name: 'Comprensió lectora bàsica',
      desc: 'Textos curts sobre instruccions, horaris i avisos.',
      category: 'cat',
      usesLevels: false,
      levelLabel: 'Mode lliure',
      gen: genCatLect
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
