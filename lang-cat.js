/* =======================================================
   Focus Academy · Llengua Catalana (mòduls externs)
   Arxiu: lang-cat.js
   S’afegeix a la web amb <script defer src="lang-cat.js">
   i es registra amb window.addModules([...])
   Requereix a main.js:
     - window.addModules(...)
     - hooks config.render / config.collect (ja afegits)
   ======================================================= */

(function(){
  // Utilitats
  const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];

  /* ========== BANCS D'EXERCICIS PER SUBTEMA ========== */
  // Format: { text: 'enunciat', answer: 'resposta exacta' }

  // B / V
  const BANK_BV = [
    { text:`Omple amb B o V: ha_er`,               answer:'haver' },
    { text:`Escriu correctament (B/V): a__ans`,    answer:'abans' },
    { text:`Tria (B/V): pro__ar (intentar)`,       answer:'provar' },
    { text:`Completa (B/V): cu__erta (d’un llibre)`,answer:'coberta' },
    { text:`Omple (B/V): a__isar (notificar)`,     answer:'avisar' },
    { text:`Escriu la paraula: su__ir (aparèixer)`,answer:'sorgir?` (No)`. // esmena
  ];
  // Esmena ítem dubtós i afegeix exemples clars
  BANK_BV.pop();
  BANK_BV.push(
    { text:`Omple (B/V): su__stituir`,             answer:'substituir' },
    { text:`Omple (B/V): o__lidar (oblidar)`,      answer:'oblidar' }
  );

  // J / G
  const BANK_JG = [
    { text:`Escriu correctament (g/j): via_tge`,   answer:'viatge' },
    { text:`Tria (g/j): pro_ecció`,                answer:'projecció' },
    { text:`Completa (g/j): le__islació`,          answer:'legislació' },
    { text:`Escriu (g/j): _enollar (a terra)`,     answer:'genollar' },
    { text:`Tria (g/j): _erani (planta)`,          answer:'gerani' },
    { text:`Omple (g/j): le__ir (fer lectura)`,    answer:'llegir' }
  );

  // S / C / Ç / Z / X
  const BANK_SCCZX = [
    { text:`Escriu correctament (c/ç): can_ó`,     answer:'cançó' },
    { text:`Tria (c/ç): a_ció`,                    answer:'acció' },
    { text:`Completa (c/ç): bra_`,                 answer:'braç' },
    { text:`Escriu (x/ks): e_aminar`,              answer:'examinar' },
    { text:`Omple (s/ss): pre__a`,                 answer:'pressa' },
    { text:`Omple (s/z/ç): organit_acions`,        answer:'organitzacions' },
    { text:`Omple (s/ss/ç): pa__a (fer un pas)`,   answer:'passa' },
    { text:`Tria (z/s): organit_ar (verb)`,        answer:'organitzar' }
  );

  // H (presència/absència)
  const BANK_H = [
    { text:`Afegeix (o no) la H: _ivern`,          answer:'hivern' },
    { text:`Afegeix (o no) la H: _istòria`,        answer:'història' },
    { text:`Afegeix (o no) la H: _ora`,            answer:'hora' },
    { text:`Afegeix (o no) la H: _onest`,          answer:'honest' },
    { text:`Afegeix (o no) la H: _abitació`,       answer:'habitació' }
  );

  // R / RR
  const BANK_RR = [
    { text:`Entre vocals, R o RR: ca_era (via). Escriu la paraula completa.`, answer:'carretera' },
    { text:`Completa amb R/RR: te__a (sòl).`,                                answer:'terra' },
    { text:`Completa amb R/RR: ca__il (vial).`,                               answer:'carril' },
    { text:`Completa amb R/RR: pe__ill (que pot fer mal).`,                   answer:'perill' },
    { text:`Completa amb R/RR: co__ent (actual).`,                            answer:'corrent' }
  );

  // L / L·L (ela geminada)
  const BANK_LLG = [
    { text:`Usa L o L·L: co__egi`,                 answer:'col·legi' },
    { text:`Usa L o L·L: inte__igent`,             answer:'intel·ligent' },
    { text:`Usa L o L·L: para__el`,                answer:'paral·lel' },
    { text:`Usa L o L·L: i__lusió`,                answer:'il·lusió' },
    { text:`Usa L o L·L: a__lot (noi, balear)`,    answer:'al·lot' }
  );

  /* ========== GENERADOR D'ORTOGRAFIA AMB SUBTEMES ========== */

  const SUBS = [
    { key:'bv',    label:'B / V',             bank: BANK_BV   },
    { key:'jg',    label:'J / G',             bank: BANK_JG   },
    { key:'scczx', label:'S / C / Ç / Z / X', bank: BANK_SCCZX},
    { key:'h',     label:'H',                 bank: BANK_H    },
    { key:'rr',    label:'R / RR',            bank: BANK_RR   },
    { key:'llg',   label:'L / L·L',           bank: BANK_LLG  },
  ];

  function genCatOrt(level, opts={}){
    const subKey = opts.sub || 'bv';
    const sub = SUBS.find(s=>s.key===subKey) || SUBS[0];
    const q = choice(sub.bank);
    return { type:'cat-ort', text:q.text, answer:q.answer };
  }

  // UI de Config per al mòdul d’Ortografia
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
      const v = (document.querySelector('input[name="cat-ort-sub"]:checked')||{}).value || 'bv';
      return { sub: v };
    }
  };

  /* ========== MÒDULS ========== */

  const BANK_MORF = [
    { text: `Identifica la categoria gramatical de "ràpidament".`, answer: `adverbi` },
    { text: `Identifica la categoria gramatical de "nosaltres".`,  answer: `pronom personal` },
    { text: `Identifica la categoria gramatical de "gran".`,       answer: `adjectiu` }
  ];

  function genFromBank(bank){
    return function(level, opts={}){
      const q = choice(bank);
      return { type:'cat', text:q.text, answer:q.answer };
    };
  }

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
      gen: genFromBank(BANK_MORF),
      category: 'cat'
    }
  ];

  // Registre
  if(typeof window.addModules === 'function'){
    window.addModules(CAT_MODULES);
  } else {
    window._PENDING_CAT_MODULES_ = CAT_MODULES;
    window.addEventListener('DOMContentLoaded', ()=>{
      if(typeof window.addModules === 'function' && window._PENDING_CAT_MODULES_){
        window.addModules(window._PENDING_CAT_MODULES_);
        delete window._PENDING_CAT_MODULES_;
      }
    });
  }
})();
