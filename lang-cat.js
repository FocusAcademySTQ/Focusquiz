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
    { text: `Escriu correctament, R o RR: ca__il (vial).`, answer: `carril` }
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
    text: `Quin és el subjecte de: "Els alumnes estudien molt."`, 
    options: ["Els alumnes", "molt", "estudien", "cap"], 
    answer: `Els alumnes` 
  },
  { 
    text: `Quin és el predicat de: "La Marta juga al parc."`, 
    options: ["La Marta", "juga al parc", "al parc", "juga"], 
    answer: `juga al parc` 
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
