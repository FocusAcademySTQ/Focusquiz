/* =======================================================
   Focus Academy · Llengua Catalana (mòduls externs)
   Arxiu: lang-cat.js
   ======================================================= */

(function(){
  const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];

  /* ========== BANCS D'EXERCICIS (ORTOGRAFIA) ========== */

  // B / V
  const BANK_BV = [
    { text: `Omple amb B o V: ha_er`,                 answer: `haver` },
    { text: `Escriu correctament (B/V): a__ans`,      answer: `abans` },
    { text: `Tria (B/V): pro__ar (intentar)`,         answer: `provar` },
    { text: `Completa (B/V): cu__erta (d’un llibre)`, answer: `coberta` },
    { text: `Omple (B/V): su__stituir`,               answer: `substituir` },
    { text: `Omple (B/V): o__lidar (oblidar)`,        answer: `oblidar` },
    { text: `Escriu (B/V): a__ril (mes)`,             answer: `abril` },
    { text: `Tria (B/V): __eure (prendre líquids)`,   answer: `beure` },
    { text: `Completa (B/V): __iure (habitar)`,       answer: `viure` },
    { text: `Omple (B/V): tre__all (feina)`,          answer: `treball` },
    { text: `Escriu (B/V): __aixell`,                 answer: `vaixell` },
    { text: `Tria (B/V): __icicleta`,                 answer: `bicicleta` },
    { text: `Completa (B/V): su__urbí`,               answer: `suburbí` },
    { text: `Omple (B/V): __enefici`,                 answer: `benefici` },
    { text: `Escriu (B/V): __uit (8)`,                answer: `vuit` },
    { text: `Completa (B/V): __acances`,              answer: `vacances` },
    { text: `Escriu correctament (B/V): a__usar-se (aprofitar-se)`, answer: `abusar-se` },
    { text: `Omple (B/V): o__stacle`,                 answer: `obstacle` },
    { text: `Tria (B/V): su__venir (ocórrer)`,        answer: `sobrevenir` },
    { text: `Completa (B/V): no__el·la`,              answer: `novel·la` },
    { text: `Escriu (B/V): o__rir (desplegar)`,       answer: `obrir` },
    { text: `Omple (B/V): pro__ident (convenient)`,   answer: `provident` },
    { text: `Tria (B/V): __ocabulari`,                answer: `vocabulari` },
    { text: `Omple (B/V): ha__itar (viure en un lloc)`, answer: `habitar` },
    { text: `Tria (B/V): a__usar (fer mal ús)`,       answer: `abusar` }
  ];

  // J / G
  const BANK_JG = [
    { text: `Escriu correctament (g/j): via_tge`,     answer: `viatge` },
    { text: `Tria (g/j): pro_ecció`,                  answer: `projecció` },
    { text: `Completa (g/j): le__islació`,            answer: `legislació` },
    { text: `Escriu (g/j): genollar (a terra)`,       answer: `genollar` },
    { text: `Tria (g/j): _erani (planta)`,            answer: `gerani` },
    { text: `Omple (g/j): le__ir (fer lectura)`,      answer: `llegir` },
    { text: `Tria (g/j): ob__ecte`,                   answer: `objecte` },
    { text: `Completa (g/j): ma__or (més gran)`,      answer: `major` },
    { text: `Omple (g/j): ima__inari`,                answer: `imaginari` },
    { text: `Tria (g/j): obli__ar (forçar)`,          answer: `obligar` },
    { text: `Completa (g/j): prodi__i`,               answer: `prodigi` },
    { text: `Escriu (g/j): ma__ia (encanteri)`,       answer: `màgia` },
    { text: `Tria (g/j): in__enier (professió)`,      answer: `enginyer` },
    { text: `Omple (g/j): __ove (adolescent)`,        answer: `jove` },
    { text: `Escriu (g/j): __utjar (valorar)`,        answer: `jutjar` },
    { text: `Completa (g/j): di__ital (numèric)`,     answer: `digital` },
    { text: `Tria (g/j): estra__ègia`,                answer: `estratègia` },
    { text: `Escriu (g/j): lle__ió (grup de soldats)`,answer: `llegió` },
    { text: `Completa (g/j): re__ió (territori)`,     answer: `regió` },
    { text: `Tria (g/j): re__istre`,                  answer: `registre` },
    { text: `Omple (g/j): di__erir (separar)`,        answer: `digerir` },
    { text: `Tria (g/j): di__it (numèric)`,           answer: `dígit` },
    { text: `Escriu (g/j): ener__ia`,                 answer: `energia` },
    { text: `Completa (g/j): pa__ina (web)`,          answer: `pàgina` },
    { text: `Tria (g/j): __oc (broma)`,               answer: `joc` }
  ];

  // S / C / Ç / Z / X
  const BANK_SCCZX = [
    { text: `Escriu correctament (c/ç): can_ó`,       answer: `cançó` },
    { text: `Tria (c/ç): a_ció`,                      answer: `acció` },
    { text: `Completa (c/ç): bra_`,                   answer: `braç` },
    { text: `Escriu (x/ks): e_aminar`,                answer: `examinar` },
    { text: `Omple (s/ss): pre__a`,                   answer: `pressa` },
    { text: `Omple (s/z/ç): organit_acions`,          answer: `organitzacions` },
    { text: `Omple (s/ss/ç): pa__a (fer un pas)`,     answer: `passa` },
    { text: `Tria (z/s): organit_ar (verb)`,          answer: `organitzar` },
    { text: `Escriu (c/ç): ca_a (caçar animals)`,     answer: `caça` },
    { text: `Tria (s/ss): ca__ola (utensili de cuina)`,answer: `cassola` },
    { text: `Completa (c/ç): for_a (força)`,          answer: `força` },
    { text: `Escriu (s/ss): pre__ió`,                 answer: `pressió` },
    { text: `Tria (x/ix): ca__a (on guardes coses)`,  answer: `caixa` },
    { text: `Completa (c/ç): feli_ (content)`,        answer: `feliç` },
    { text: `Tria (c/ç): balan_`,                     answer: `balanç` },
    { text: `Escriu (x/gs): e__emple`,                answer: `exemple` },
    { text: `Completa (s/ss): mi__ió`,                answer: `missió` },
    { text: `Tria (z/s): realit_ar`,                  answer: `realitzar` },
    { text: `Omple (c/ç): pla__a (plaça pública)`,    answer: `plaça` },
    { text: `Tria (c/ç): fa__ana`,                    answer: `façana` },
    { text: `Escriu (x/ix): refle__`,                 answer: `reflex` },
    { text: `Tria (s/ss): depre__ió`,                 answer: `depressió` },
    { text: `Escriu (c/ç): bra__alet (de natació)`,   answer: `braçalet` },
    { text: `Completa (z/s): pa__sar (transcórrer)`,  answer: `passar` }
  ];

  // H
  const BANK_H = [
    { text: `Afegeix (o no) la H: _ivern`,            answer: `hivern` },
    { text: `Afegeix (o no) la H: _istòria`,          answer: `història` },
    { text: `Afegeix (o no) la H: _ora`,              answer: `hora` },
    { text: `Afegeix (o no) la H: _onest`,            answer: `honest` },
    { text: `Afegeix (o no) la H: _abitació`,         answer: `habitació` },
    { text: `Afegeix (o no) la H: _ospital`,          answer: `hospital` },
    { text: `Afegeix (o no) la H: _ola (salutació)`,  answer: `hola` },
    { text: `Afegeix (o no) la H: _àbit (costum)`,    answer: `hàbit` },
    { text: `Afegeix (o no) la H: _abilitat`,         answer: `habilitat` },
    { text: `Afegeix (o no) la H: _onor`,             answer: `honor` },
    { text: `Afegeix (o no) la H: _umitat`,           answer: `humitat` },
    { text: `Afegeix (o no) la H: _umanitat`,         answer: `humanitat` },
    { text: `Afegeix (o no) la H: _àlit (alè)`,       answer: `hàlit` },
    { text: `Afegeix (o no) la H: _eroi`,             answer: `heroi` },
    { text: `Afegeix (o no) la H: _elena (nom propi)`,answer: `Helena` },
    { text: `Afegeix (o no) la H: _ivernacle`,        answer: `hivernacle` },
    { text: `Afegeix (o no) la H: _onra`,             answer: `honra` },
    { text: `Afegeix (o no) la H: _orror`,            answer: `horror` },
    { text: `Afegeix (o no) la H: _omilia`,           answer: `homilia` },
    { text: `Afegeix (o no) la H: _heura (planta)`,   answer: `heura` }
  ];

  // R / RR
  const BANK_RR = [
    { text: `Entre vocals, R o RR: ca_era (via).`,    answer: `carretera` },
    { text: `Completa amb R/RR: te__a (sòl).`,        answer: `terra` },
    { text: `Completa amb R/RR: ca__il (vial).`,      answer: `carril` },
    { text: `Completa amb R/RR: pe__ill (que pot fer mal).`, answer: `perill` },
    { text: `Completa amb R/RR: co__ent (actual).`,   answer: `corrent` },
    { text: `Entre vocals, R o RR: ca__era (competició).`, answer: `carrera` },
    { text: `Completa amb R/RR: co__al (animals).`,   answer: `corral` },
    { text: `Entre vocals, R o RR: a__òs (menjar).`,  answer: `arròs` },
    { text: `Entre vocals, R o RR: go__a (capell).`,  answer: `gorra` },
    { text: `Completa amb R/RR: se__ra (eina).`,      answer: `serra` },
    { text: `Entre vocals, R o RR: fe__rer (mes).`,   answer: `febrer` },
    { text: `Completa amb R/RR: to__re (construcció).`, answer: `torre` },
    { text: `Completa amb R/RR: co__ecte (adequat).`, answer: `correcte` },
    { text: `Completa amb R/RR: co__er (córrer).`,    answer: `córrer` },
    { text: `Completa amb R/RR: a__ibar (arribar).`,  answer: `arribar` }
  ];

  // L / L·L
  const BANK_LLG = [
    { text: `Usa L o L·L: co__egi`,          answer: `col·legi` },
    { text: `Usa L o L·L: inte__igent`,      answer: `intel·ligent` },
    { text: `Usa L o L·L: para__el`,         answer: `paral·lel` },
    { text: `Usa L o L·L: i__lusió`,         answer: `il·lusió` },
    { text: `Usa L o L·L: a__lot`,           answer: `al·lot` },
    { text: `Usa L o L·L: mi__lenni`,        answer: `mil·lenni` },
    { text: `Usa L o L·L: co__lecció`,       answer: `col·lecció` },
    { text: `Usa L o L·L: co__lapse`,        answer: `col·lapse` },
    { text: `Usa L o L·L: a__legoria`,       answer: `al·legoria` },
    { text: `Usa L o L·L: a__lèrgia`,        answer: `al·lèrgia` },
    { text: `Usa L o L·L: pe__lícula`,       answer: `pel·lícula` },
    { text: `Usa L o L·L: co__locar`,        answer: `col·locar` },
    { text: `Usa L o L·L: il__lustrar`,      answer: `il·lustrar` },
    { text: `Usa L o L·L: co__laborar`,      answer: `col·laborar` },
    { text: `Usa L o L·L: intel__lecte`,     answer: `intel·lecte` },
    { text: `Usa L o L·L: intel__lectual`,   answer: `intel·lectual` },
    { text: `Usa L o L·L: par__lelisme`,     answer: `paral·lelisme` },
    { text: `Usa L o L·L: a__ternatiu`,      answer: `al·ternatiu` },
    { text: `Usa L o L·L: ce__lular`,        answer: `cel·lular` },
    { text: `Usa L o L·L: a__lusió`,         answer: `al·lusió` }
  ];

  // Catàleg de subtemes
  const SUBS = [
    { key: 'bv',    label: 'B / V',             bank: BANK_BV   },
    { key: 'jg',    label: 'J / G',             bank: BANK_JG   },
    { key: 'scczx', label: 'S / C / Ç / Z / X', bank: BANK_SCCZX},
    { key: 'h',     label: 'H',                 bank: BANK_H    },
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
      desc: 'B/V, J/G, S/C/Ç/Z/X, H, R/RR, L/L·L.',
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

