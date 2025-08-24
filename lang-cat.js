/* =======================================================
   Focus Academy · Llengua Catalana (mòduls externs)
   Arxiu: lang-cat.js
   ======================================================= */

(function(){
  const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];

  /* ========== BANCS D'EXERCICIS (ORTOGRAFIA) ========== */

  // B / V
  const BANK_BV = [
    { text: `Escriu correctament amb B o V: ha_er`,                 answer: `haver` },
    { text: `Escriu correctament correctament (B/V): a__ans`,      answer: `abans` },
    { text: `Escriu correctament (B/V): pro__ar (intentar)`,         answer: `provar` },
    { text: `Escriu correctament (B/V): cu__erta (d’un llibre)`, answer: `coberta` },
    { text: `Escriu correctament (B/V): su__stituir`,               answer: `substituir` },
    { text: `Escriu correctament (B/V): o__lidar (oblidar)`,        answer: `oblidar` },
    { text: `Escriu correctament (B/V): a__ril (mes)`,             answer: `abril` },
    { text: `Escriu correctament (B/V): __eure (prendre líquids)`,   answer: `beure` },
    { text: `Escriu correctament (B/V): __iure (habitar)`,       answer: `viure` },
    { text: `Escriu correctament (B/V): tre__all (feina)`,          answer: `treball` },
    { text: `Escriu correctament (B/V): __aixell`,                 answer: `vaixell` },
    { text: `Escriu correctament (B/V): __icicleta`,                 answer: `bicicleta` },
    { text: `Escriu correctament (B/V): su__urbí`,               answer: `suburbí` },
    { text: `Escriu correctament (B/V): __enefici`,                 answer: `benefici` },
    { text: `Escriu correctament (B/V): __uit (8)`,                answer: `vuit` },
    { text: `Escriu correctament (B/V): __acances`,              answer: `vacances` },
    { text: `Escriu correctament (B/V): a__Escriu correctament, L o L·Lr-se (aprofitar-se)`, answer: `abEscriu correctament, L o L·Lr-se` },
    { text: `Escriu correctament (B/V): o__stacle`,                 answer: `obstacle` },
    { text: `Escriu correctament (B/V): no__el·la`,              answer: `novel·la` },
    { text: `Escriu correctament (B/V): o__rir (desplegar)`,       answer: `obrir` },
    { text: `Escriu correctament (B/V): pro__ident (convenient)`,   answer: `provident` },
    { text: `Escriu correctament (B/V): __ocabulari`,                answer: `vocabulari` },
    { text: `Escriu correctament (B/V): ha__itar (viure en un lloc)`, answer: `habitar` },
    { text: `Escriu correctament (B/V): a__Escriu correctament, L o L·Lr (fer mal ús)`,       answer: `abEscriu correctament, L o L·Lr` }
  ];

  // J / G
  const BANK_JG = [
    { text: `Escriu correctament correctament (g/j): via_tge`,     answer: `viatge` },
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
    { text: `Escriu correctament (g/j): in__enier (professió)`,      answer: `enginyer` },
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
    { text: `Escriu correctament correctament (c/ç): can_ó`,       answer: `cançó` },
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
    { text: `Corregix: escribia`, answer: `escrivia` },
    { text: `Corregix: anavas`, answer: `anaves` },
    { text: `Corregix: kom`, answer: `com` },
    { text: `Corregix: tambe`, answer: `també` },
    { text: `Corregix: aixo`, answer: `això` },
    { text: `Corregix: vale`, answer: `val` },
    { text: `Corregix: anarém`, answer: `anirem` },
    { text: `Corregix: estàven`, answer: `estaven` },
    { text: `Corregix: k`, answer: `que` },
    { text: `Corregix: xq`, answer: `perquè` },
    { text: `Corregix: mirame`, answer: `mira'm` },
    { text: `Corregix: diguem`, answer: `diguem-ho` },
    { text: `Corregix: savo`, answer: `sabeu` },
    { text: `Corregix: ke`, answer: `que` },
    { text: `Corregix: kuan`, answer: `quan` },
    { text: `Corregix: akesta`, answer: `aquesta` },
    { text: `Corregix: aki`, answer: `aquí` },
    { text: `Corregix: els professora`, answer: `la professora` },
    { text: `Corregix: la mans`, answer: `les mans` },
    { text: `Corregix: es bo`, answer: `és bo` },
    { text: `Corregix: pingui`, answer: `pingüí` },
    { text: `Corregix: raim`, answer: `raïm` },
    { text: `Corregix: tinc gana`, answer: `tingui gana` },
    { text: `Corregix: disfrutar`, answer: `gaudir` },
    { text: `Corregix: sols ho fa`, answer: `només ho fa` },
    { text: `Corregix: obligatoriament`, answer: `obligatòriament` },
    { text: `Corregix: esperat`, answer: `has esperat` },
    { text: `Corregix: siem`, answer: `siguem` },
    { text: `Corregix: eis`, answer: `ells` },
    { text: `Corregix: bo`, answer: `bé` },
    { text: `Corregix: avia vingut`, answer: `havia vingut` },
    { text: `Corregix: faborit`, answer: `favorit` },
    { text: `Corregix: perke`, answer: `perquè` },
    { text: `Corregix: es de dia`, answer: `és de dia` },
    { text: `Corregix: na`, answer: `anar` },
    { text: `Corregix: vienes`, answer: `vens` },
    { text: `Corregix: mossegarém`, answer: `mossegarem` },
    { text: `Corregix: vam sortir fora a fora`, answer: `vam sortir fora` },
    { text: `Corregix: amb tú`, answer: `amb tu` },
    { text: `Corregix: vullo`, answer: `vull` },
    { text: `Corregix: antés`, answer: `abans` }
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

