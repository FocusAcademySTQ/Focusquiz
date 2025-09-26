/* =======================================================
   Focus Academy · Llengua Catalana (mòduls externs)
   Arxiu: lang-cat.js
   ======================================================= */

(function(){
  const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];

  /* ========== BANCS D'EXERCICIS (ORTOGRAFIA) ========== */

  // B / V
  const BANK_BV = [
    { text: `Escriu correctament (B/V): ha_er`,                 answer: `haver` },
    { text: `Escriu correctament (B/V): a__ans`,                answer: `abans` },
    { text: `Escriu correctament (B/V): pro__ar (intentar)`,    answer: `provar` },
    { text: `Escriu correctament (B/V): co__erta (d'un llibre)`, answer: `coberta` },
    { text: `Escriu correctament (B/V): su__stituir`,           answer: `substituir` },
    { text: `Escriu correctament (B/V): o__lidar (oblidar)`,    answer: `oblidar` },
    { text: `Escriu correctament (B/V): a__ril (mes)`,          answer: `abril` },
    { text: `Escriu correctament (B/V): __eure (prendre líquids)`, answer: `beure` },
    { text: `Escriu correctament (B/V): __iure (habitar)`,      answer: `viure` },
    { text: `Escriu correctament (B/V): tre__all (feina)`,      answer: `treball` },
    { text: `Escriu correctament (B/V): __aixell`,              answer: `vaixell` },
    { text: `Escriu correctament (B/V): __icicleta`,            answer: `bicicleta` },
    { text: `Escriu correctament (B/V): su__urbí`,              answer: `suburbí` },
    { text: `Escriu correctament (B/V): __enefici`,             answer: `benefici` },
    { text: `Escriu correctament (B/V): __uit (8)`,             answer: `vuit` },
    { text: `Escriu correctament (B/V): __acances`,             answer: `vacances` },
    { text: `Escriu correctament (B/V): a__usar-se (aprofitar-se)`, answer: `abusar-se` },
    { text: `Escriu correctament (B/V): o__stacle`,             answer: `obstacle` },
    { text: `Escriu correctament (B/V): no__el·la`,             answer: `novel·la` },
    { text: `Escriu correctament (B/V): o__rir (desplegar)`,    answer: `obrir` },
    { text: `Escriu correctament (B/V): pro__ident (convenient)`, answer: `provident` },
    { text: `Escriu correctament (B/V): __ocabulari`,           answer: `vocabulari` },
    { text: `Escriu correctament (B/V): ha__itar (viure en un lloc)`, answer: `habitar` },
    { text: `Escriu correctament (B/V): a__usar (fer mal ús)`,  answer: `abusar` },
    { text: `Escriu correctament (B/V): __olcà (muntanya que treu foc)`, answer: `volcà` },
    { text: `Escriu correctament (B/V): __ell (molts anys)`, answer: `vell` },
    { text: `Escriu correctament (B/V): __otar (eleccions)`, answer: `votar` },
    { text: `Escriu correctament (B/V): __enir (caminar)`, answer: `venir` },
    { text: `Escriu correctament (B/V): __alència (ciutat)`, answer: `valència` },
    { text: `Escriu correctament (B/V): __iblioteca (llibreria)`, answer: `biblioteca` }
  ];

  // J / G
  const BANK_JG = [
    { text: `Escriu correctament (g/j): viat_e`,     answer: `viatge` },
    { text: `Escriu correctament (g/j): pro_ecció`,                  answer: `projecció` },
    { text: `Escriu correctament (g/j): le__islació`,            answer: `legislació` },
    { text: `Escriu correctament (g/j): _erani (planta)`,            answer: `gerani` },
    { text: `Escriu correctament (g/j): le__ir (fer lectura)`,      answer: `llegir` },
    { text: `Escriu correctament (g/j): ob__ecte`,                   answer: `objecte` },
    { text: `Escriu correctament (g/j): ma__or (més gran)`,      answer: `major` },
    { text: `Escriu correctament (g/j): ima__inari`,                answer: `imaginari` },
    { text: `Escriu correctament (g/j): obli__ar (forçar)`,          answer: `obligar` },
    { text: `Escriu correctament (g/j): prodi__i`,               answer: `prodigi` },
    { text: `Escriu correctament (g/j): ma__ia (encanteri)`,       answer: `màgia` },
    { text: `Escriu correctament (g/j): __ove (adolescent)`,        answer: `jove` },
    { text: `Escriu correctament (g/j): __utjar (valorar)`,        answer: `jutjar` },
    { text: `Escriu correctament (g/j): di__ital (numèric)`,     answer: `digital` },
    { text: `Escriu correctament (g/j): estra__ègia`,                answer: `estratègia` },
    { text: `Escriu correctament (g/j): lle__ió (grup de soldats)`,answer: `llegió` },
    { text: `Escriu correctament (g/j): re__ió (territori)`,     answer: `regió` },
    { text: `Escriu correctament (g/j): re__istre`,                  answer: `registre` },
    { text: `Escriu correctament (g/j): di__erir (separar)`,        answer: `digerir` },
    { text: `Escriu correctament (g/j): di__it (numèric)`,           answer: `dígit` },
    { text: `Escriu correctament (g/j): ener__ia`,                 answer: `energia` },
    { text: `Escriu correctament (g/j): pa__ina (web)`,          answer: `pàgina` },
    { text: `Escriu correctament (g/j): __oc (broma)`,               answer: `joc` }
  ];

  // S / C / Ç / Z / X
  const BANK_SCCZX = [
    { text: `Escriu correctament (c/ç): can_ó`,       answer: `cançó` },
    { text: `Escriu correctament (c/ç): a_ció`,                      answer: `acció` },
    { text: `Escriu correctament (c/ç): bra_`,                   answer: `braç` },
    { text: `Escriu correctament (x/ks): e_aminar`,                answer: `examinar` },
    { text: `Escriu correctament (s/ss): pre__a`,                   answer: `pressa` },
    { text: `Escriu correctament (s/z/ç): organit_acions`,          answer: `organitzacions` },
    { text: `Escriu correctament (s/ss/ç): pa__a (fer un pas)`,     answer: `passa` },
    { text: `Escriu correctament (z/s): organit_ar (verb)`,          answer: `organitzar` },
    { text: `Escriu correctament (c/ç): ca_a (caçar animals)`,     answer: `caça` },
    { text: `Escriu correctament (s/ss): ca__ola (utensili de cuina)`,answer: `cassola` },
    { text: `Escriu correctament (c/ç): for_a (força)`,          answer: `força` },
    { text: `Escriu correctament (s/ss): pre__ió`,                 answer: `pressió` },
    { text: `Escriu correctament (c/ç): feli_ (content)`,        answer: `feliç` },
    { text: `Escriu correctament (c/ç): balan_`,                     answer: `balanç` },
    { text: `Escriu correctament (x/gs): e__emple`,                answer: `exemple` },
    { text: `Escriu correctament (s/ss): mi__ió`,                answer: `missió` },
    { text: `Escriu correctament (z/s): realit_ar`,                  answer: `realitzar` },
    { text: `Escriu correctament (c/ç): pla__a (plaça pública)`,    answer: `plaça` },
    { text: `Escriu correctament (c/ç): fa__ana`,                    answer: `façana` },
    { text: `Escriu correctament (x/ix): refle__`,                 answer: `reflex` },
    { text: `Escriu correctament (s/ss): depre__ió`,                 answer: `depressió` },
    { text: `Escriu correctament (c/ç): bra__alet (de natació)`,   answer: `braçalet` },
    { text: `Escriu correctament (z/s): pa__sar (transcórrer)`,  answer: `passar` }
  ];

  // H
  const BANK_corregir = [
    { text: `Corregix: porke`, answer: `perquè` },
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
   { text: `Corregix: egzamen`, answer: `examen` },
   { text: `Corregix: nesesari`, answer: `necessari` },
   { text: `Corregix: aixo es molt guapo`, answer: `això és molt bonic` },
   { text: `Corregix: no tinc res més ha dir`, answer: `no tinc res més a dir` },
   { text: `Corregix: no se res`, answer: `no sé res` },
   { text: `Corregix: aquet`, answer: `aquest` },
   { text: `Corregix: selva`, answer: `seva` },
   { text: `Corregix: ase`, answer: `ase` },
   { text: `Corregix: colegi`, answer: `col·legi` },
   { text: `Corregix: dibuixu`, answer: `dibuixo` },
   { text: `Corregix: camvi`, answer: `canvi` },
   { text: `Corregix: sense cap dubte que si`, answer: `sense cap dubte que sí` },
   { text: `Corregix: vui`, answer: `vull` },
     { text: `Corregix: avia`, answer: `havia` },
{ text: `Corregix: selva`, answer: `seva` },
{ text: `Corregix: cuan`, answer: `quan` },
{ text: `Corregix: plassa`, answer: `plaça` },
{ text: `Corregix: colegi`, answer: `col·legi` },
{ text: `Corregix: dijus`, answer: `dijous` },
{ text: `Corregix: camvi`, answer: `canvi` },
{ text: `Corregix: istòria`, answer: `història` },
{ text: `Corregix: nesesari`, answer: `necessari` },
{ text: `Corregix: egzamen`, answer: `examen` },
{ text: `Corregix: aquet`, answer: `aquest` },
{ text: `Corregix: vui`, answer: `vull` },
{ text: `Corregix: mirala`, answer: `mira-la` },
{ text: `Corregix: nose`, answer: `no sé` },
{ text: `Corregix: porke`, answer: `perquè` },
{ text: `Corregix: xq`, answer: `perquè` },
{ text: `Corregix: vorem`, answer: `veurem` },
{ text: `Corregix: ke vols`, answer: `què vols` },
{ text: `Corregix: aixo es`, answer: `això és` },
{ text: `Corregix: no se res`, answer: `no sé res` },
{ text: `Corregix: tambe`, answer: `també` },
{ text: `Corregix: faborit`, answer: `favorit` },
{ text: `Corregix: istiu`, answer: `estiu` },
{ text: `Corregix: es molt xulo`, answer: `és molt bonic` },
{ text: `Corregix: avans`, answer: `abans` },
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
{ text: `Corregix: sense cap dubte que si`, answer: `sense cap dubte que sí` },
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
{ text: `Corregix: no se fer-ho`, answer: `no sé fer-ho` },
  ];

  // R / RR
  const BANK_RR = [
    { text: `Escriu correctament, R o RR: ca_era (via).`,    answer: `carretera` },
    { text: `Escriu correctament, R o RR: te__a (sòl).`,        answer: `terra` },
    { text: `Escriu correctament, R o RR: ca__il (vial).`,      answer: `carril` },
    { text: `Escriu correctament, R o RR: pe__ill (que pot fer mal).`, answer: `perill` },
    { text: `Escriu correctament, R o RR: co__ent (actual).`,   answer: `corrent` },
    { text: `Escriu correctament, R o RR: ca__era (competició).`, answer: `carrera` },
    { text: `Escriu correctament, R o RR: co__al (animals).`,   answer: `corral` },
    { text: `Escriu correctament, R o RR: a__òs (menjar).`,  answer: `arròs` },
    { text: `Escriu correctament, R o RR: go__a (capell).`,  answer: `gorra` },
    { text: `Escriu correctament, R o RR: se__ra (eina).`,      answer: `serra` },
    { text: `Escriu correctament, R o RR: fe__rer (mes).`,   answer: `febrer` },
    { text: `Escriu correctament, R o RR: to__re (construcció).`, answer: `torre` },
    { text: `Escriu correctament, R o RR: co__ecte (adequat).`, answer: `correcte` },
    { text: `Escriu correctament, R o RR: co__er (córrer).`,    answer: `córrer` },
    { text: `Escriu correctament, R o RR: a__ibar (arribar).`,  answer: `arribar` }
  ];

  // L / L·L
  const BANK_LLG = [
    { text: `Escriu correctament, L o L·L L o L·L: co__egi`,          answer: `col·legi` },
    { text: `Escriu correctament, L o L·L L o L·L: inte__igent`,      answer: `intel·ligent` },
    { text: `Escriu correctament, L o L·L L o L·L: para__el`,         answer: `paral·lel` },
    { text: `Escriu correctament, L o L·L L o L·L: i__lusió`,         answer: `il·lusió` },
    { text: `Escriu correctament, L o L·L L o L·L: a__lot`,           answer: `al·lot` },
    { text: `Escriu correctament, L o L·L L o L·L: mi__lenni`,        answer: `mil·lenni` },
    { text: `Escriu correctament, L o L·L L o L·L: co__lecció`,       answer: `col·lecció` },
    { text: `Escriu correctament, L o L·L L o L·L: co__lapse`,        answer: `col·lapse` },
    { text: `Escriu correctament, L o L·L L o L·L: a__legoria`,       answer: `al·legoria` },
    { text: `Escriu correctament, L o L·L L o L·L: a__lèrgia`,        answer: `al·lèrgia` },
    { text: `Escriu correctament, L o L·L L o L·L: pe__lícula`,       answer: `pel·lícula` },
    { text: `Escriu correctament, L o L·L L o L·L: co__locar`,        answer: `col·locar` },
    { text: `Escriu correctament, L o L·L L o L·L: il__lustrar`,      answer: `il·lustrar` },
    { text: `Escriu correctament, L o L·L L o L·L: co__laborar`,      answer: `col·laborar` },
    { text: `Escriu correctament, L o L·L L o L·L: intel__lecte`,     answer: `intel·lecte` },
    { text: `Escriu correctament, L o L·L L o L·L: intel__lectual`,   answer: `intel·lectual` },
    { text: `Escriu correctament, L o L·L L o L·L: par__lelisme`,     answer: `paral·lelisme` },
    { text: `Escriu correctament, L o L·L L o L·L: a__ternatiu`,      answer: `al·ternatiu` },
    { text: `Escriu correctament, L o L·L L o L·L: ce__lular`,        answer: `cel·lular` },
    { text: `Escriu correctament, L o L·L L o L·L: a__lusió`,         answer: `al·lusió` }
  ];

  // Catàleg de subtemes
  const SUBS = [
    { key: 'bv',    label: 'B / V',             bank: BANK_BV   },
    { key: 'jg',    label: 'J / G',             bank: BANK_JG   },
    { key: 'scczx', label: 'S / C / Ç / Z / X', bank: BANK_SCCZX},
    { key: 'corregir',     label: 'corregir',                 bank: BANK_corregir    },
    { key: 'rr',    label: 'R / RR',            bank: BANK_RR   },
    { key: 'llg',   label: 'L / L·L',           bank: BANK_LLG  }
  ];

  /* ========== GENERADORS ========== */
  function genCatOrt(level, opts = {}){
    const subKey = opts.sub || 'bv';
    const sub = SUBS.find(s => s.key === subKey) || SUBS[0];
    const q = choice(sub.bank);
    return { type: 'cat-ort', text: q.text, answer: q.answer };
  }

  const BANK_MORF = [
    { text: `Identifica la categoria gramatical de "ràpidament".`, answer: `adverbi` },
    { text: `Identifica la categoria gramatical de "nosaltres".`,  answer: `pronom personal` },
    { text: `Identifica la categoria gramatical de "gran".`,       answer: `adjectiu` },
    { text: `Quina categoria és "el"?`,                            answer: `article determinat` },
    { text: `Quina categoria és "una"?`,                           answer: `article indeterminat` },
    { text: `Quina categoria és "casa"?`,                          answer: `nom comú` },
    { text: `Quina categoria és "Barcelona"?`,                     answer: `nom propi` },
    { text: `Quina categoria és "córrer"?`,                        answer: `verb` },
    { text: `Quina categoria és "amb"?`,                           answer: `preposició` },
    { text: `Quina categoria és "però"?`,                          answer: `conjunció` },
    { text: `Quina categoria és "ai!"?`,                           answer: `interjecció` },
    { text: `Quina categoria és "meu" (en "el meu llibre")?`,      answer: `adjectiu possessiu` },
    { text: `Quina categoria és "alguns"?`,                        answer: `determinant indefinit` },
    { text: `Quina categoria és "aquestes"?`,                      answer: `determinant demostratiu` },
    { text: `Quina categoria és "on"?`,                            answer: `pronom relatiu / adverbi interrogatiu` },
    { text: `Quina categoria és "mai"?`,                           answer: `adverbi de temps` },
    { text: `Quina categoria és "molt"?`,                          answer: `adverbi de quantitat` },
    { text: `Quina categoria és "jo"?`,                            answer: `pronom personal` },
    { text: `Quina categoria és "que" en "El llibre que vull"?`,   answer: `pronom relatiu` },
    { text: `Quina categoria és "se" en "se'n va"?`,               answer: `pronom feble` },
    { text: `Quina categoria és "cap" en "No hi ha cap problema"?`,answer: `determinant quantitatiu` },
    { text: `Quina categoria és "tothom"?`,                        answer: `pronom indefinit` },
    { text: `Quina categoria és "quan" (interrogatiu)?`,           answer: `adverbi interrogatiu` },
    { text: `Quina categoria és "sempre"?`,                        answer: `adverbi de temps` },
    { text: `Quina categoria és "tan" en "és tan alt"?`,           answer: `adverbi de quantitat` }
  ];

  function genFromBank(bank){
    return function(level, opts = {}){
      const q = choice(bank);
      return { type: 'cat', text: q.text, answer: q.answer };
    };
  }

  /* ========== UI DE CONFIG (opcional per a Ortografia) ========== */
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
      desc: 'Categories gramaticals bàsiques.',
      badge: 'CAT',
      category: 'cat',
      gen: genFromBank(BANK_MORF)
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

