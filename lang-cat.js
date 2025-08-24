/* =======================================================
   Focus Academy · Llengua Catalana (mòduls externs)
   Arxiu: lang-cat.js
   Requereix a main.js:
     - window.addModules(...)
     - hooks de config (config.render / config.collect) si vols UI pròpia
   ======================================================= */
(function(){
  const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];

  /* ========== BANCS D'EXERCICIS (mostra inicial) ========== */
  // Format: { text: 'enunciat', answer: 'resposta exacta' }

  // B / V
  const BANK_BV = [
    { text:`Omple amb B o V: ha_er`,                     answer:'haver' },
    { text:`Escriu correctament: a__ans (B/V)`,          answer:'abans' },
    { text:`Tria la forma correcta: "pro__ar" (B/V)`,    answer:'provar' },
    { text:`Escriu correctament: a__isar (B/V)`,         answer:'avisar' },
    { text:`Omple amb B o V: cu__erta`,                  answer:'coberta' }
  ];

  // J / G
  const BANK_JG = [
    { text:`Escriu la paraula correcta (g/j): via_tge`,  answer:'viatge' },
    { text:`Tria la forma correcta: pro_ecció (g/j)`,    answer:'projecció' },
    { text:`Completa amb g/j: le__islació`,              answer:'legislació' },
    { text:`Escriu correctament (g/j): _enollar (a la mà)`, answer:'genollar' },
    { text:`Tria la forma correcta: _erani (g/j)`,       answer:'gerani' }
  ];

  // S / C / Ç / Z / X
  const BANK_SCCZX = [
    { text:`Escriu correctament: can_ó (c/ç)`,           answer:'cançó' },
    { text:`Tria: a_ció (c/ç)`,                          answer:'acció' },
    { text:`Completa: bra_ (c/ç)`,                       answer:'braç' },
    { text:`Escriu correctament: e_aminar (x/ks)`,       answer:'examinar' },
    { text:`Tria la forma correcta: pa__a (s/ss)`,       answer:'passa' },
    { text:`Completa: di_a (s/z) — (dia de la setman_a)`,answer:'diumenge??' }
  ];
  // (Eliminem la trampa anterior: millor variants clares)
  BANK_SCCZX.splice(BANK_SCCZX.length-1, 1); // neteja l'últim mal exemple
  BANK_SCCZX.push(
    { text:`Omple amb s/ss: pre__a`,                     answer:'pressa' },
    { text:`Omple amb s/z: ca__ador (persona que caça)`, answer:'caçador' },
    { text:`Tria: organit_acions (s/z/ç)`,               answer:'organitzacions' }
  );

  // H (presència/absència)
  const BANK_H = [
    { text:`Afegeix (o no) la H: _ivern`,                answer:'hivern' },
    { text:`Afegeix (o no) la H: _istòria`,              answer:'història' },
    { text:`Afegeix (o no) la H: _ora (unitat de temps)`,answer:'hora' },
    { text:`Afegeix (o no) la H: _onestedat`,            answer:'honestedat' },
    { text:`Afegeix (o no) la H: _aurí (animal)`,        answer:'jaurí?` } // placeholder? nope
  ];
  // correcció: traiem l'últim i afegim exemples bons
  BANK_H.splice(BANK_H.length-1, 1);
  BANK_H.push(
    { text:`Afegeix (o no) la H: _onest`,                answer:'honest' },
    { text:`Afegeix (o no) la H: _abitació`,             answer:'habitació' }
  );

  // R / RR
  const BANK_R = [
    { text:`Entre vocals, escriu R o RR: ca_era (via). Escriu la paraula completa.`, answer:'carretera' },
    { text:`Completa amb R/RR: te__a (sòl).`,                                     answer:'terra' },
    { text:`Completa amb R/RR: ca_el (objecte allargat).`,                         answer:'carril' },
    { text:`Completa amb R/RR: pa_e (de pa).`,                                     answer:'paer?` } // no
  ];
  // netegem i afegim exemples clars
  BANK_R.splice(BANK_R.length-1, 1);
  BANK_R.push(
    { text:`Completa amb R/RR: pa__a (acció de parar).`,                            answer:'parar?` } // tampoc
  );
  // Fem una llista sòlida:
  const BANK_R_FIX = [
    { text:`Entre vocals, R o RR: ca_era (via).`, answer:'carretera' },
    { text:`R o RR: te__a (sòl).`,                answer:'terra' },
    { text:`R o RR: ca__il (carril).`,            answer:'carril' },
    { text:`R o RR: so__oll (peix).`,             answer:'sorell?` } // hmm
  ];
  // millor reescriure completament BANK_R:
  const BANK_R_NEW = [
    { text:`Entre vocals, escriu R o RR: ca_era (via).`,       answer:'carretera' },
    { text:`Completa: te__a (sòl).`,                           answer:'terra' },
    { text:`Completa: ca__il (vial per a vehicles).`,          answer:'carril' },
    { text:`Completa: pe__ill (que pot fer mal).`,             answer:'perill' },
    { text:`Completa: a__òs (musculatura).`,                   answer:'arròs' }
  ];

  // L / L·L (ela geminada)
  const BANK_LGEM = [
    { text:`Usa L o L·L: co__egi`,                              answer:'col·legi' },
    { text:`Usa L o L·L: inte__igent`,                          answer:'intel·ligent' },
    { text:`Usa L o L·L: para__el`,                             answer:'paral·lel' },
    { text:`Usa L o L·L: i__lusió`,                             answer:'il·lusió' },
    { text:`Usa L o L·L: a__lot (noi, balear)`,                 answer:'al·lot' }
  ];

  // Reassignem el banc R a la versió neta
  const BANK_RR = BANK_R_NEW;

  /* ========== GENERADOR D'ORTOGRAFIA AMB SUBTEMES ========== */

  const SUBS = [
    { key:'bv',    label:'B / V',            bank: BANK_BV    },
    { key:'jg',    label:'J / G',            bank: BANK_JG    },
    { key:'scczx', label:'S / C / Ç / Z / X',bank: BANK_SCCZX },
    { key:'h',     label:'H',                bank: BANK_H     },
    { key:'rr',    label:'R / RR',           bank: BANK_RR    },
    { key:'lgel',  label:'L / L·L',          bank: BANK_LGEM  },
  ];

  function genCatOrt(level, opts={}){
    const subKey = opts.sub || 'bv';
    const sub = SUBS.find(s=>s.key===subKey) || SUBS[0];
    const q = choice(sub.bank);
    return { type:'cat-ort', text:q.text, answer:q.answer };
  }

  /* ========== UI DE CONFIGURACIÓ PER AL MÒDUL ========== */

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

  /* ========== REGISTRE DELS MÒDULS ========== */
  const CAT_MODULES = [
    {
      id: 'cat-ort',
      name: 'Català · Ortografia',
      desc: 'B/V, J/G, S/C/Ç/Z/X, H, R/RR, L/L·L.',
      badge: 'CAT',
      category:'cat',
      gen: genCatOrt,
      config: OrtografiaConfig
    }
    // Pots reactivar Morfologia o altres mòduls aquí en el futur
  ];

  if (typeof window.addModules === 'function') {
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

