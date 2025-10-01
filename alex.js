/* =======================================================
   Focus Academy · Anglès (mòdul complet)
   Arxiu: alex.js
   ======================================================= */

(function(){
  const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];

  /* ========== BANCS DE VOCABULARI ========== */
  const BANK_VOCAB = {
    basics: [
      { ca:"casa", en:"house" }, { ca:"gos", en:"dog" }, { ca:"gat", en:"cat" }, { ca:"llibre", en:"book" },
      { ca:"taula", en:"table" }, { ca:"cadira", en:"chair" }, { ca:"cotxe", en:"car" }, { ca:"amic", en:"friend" }
    ],
    colors: [
      { ca:"vermell", en:"red" }, { ca:"blau", en:"blue" }, { ca:"groc", en:"yellow" }, { ca:"verd", en:"green" }
    ],
    body: [
      { ca:"mà", en:"hand" }, { ca:"peu", en:"foot" }, { ca:"cap", en:"head" }, { ca:"ull", en:"eye" }
    ],
    school: [
      { ca:"professor", en:"teacher" }, { ca:"escola", en:"school" }, { ca:"finestra", en:"window" }, { ca:"porta", en:"door" }
    ]
  };

  /* ========== GENERADORS DE PREGUNTES ========== */
  function genVocab(level, opts={}){
    const count = opts.count || 10;
    const allWords = Object.values(BANK_VOCAB).flat();

    return Array.from({length:count}, ()=>{
      const w = choice(allWords);

      if(level===1){
        // Test multiresposta català → anglès
        const options = [w.en];
        while(options.length<4){
          const rand = choice(allWords).en;
          if(!options.includes(rand)) options.push(rand);
        }
        return {
          text: `Traducció al anglès: "${w.ca}"`,
          options: options.sort(()=>Math.random()-0.5),
          answer: w.en
        };
      }

      if(level===2){
        // Resposta oberta català → anglès
        return { text:`Traducció al anglès: "${w.ca}"`, answer:w.en };
      }

      if(level===3){
        // Resposta oberta anglès → català
        return { text:`Traducció al català: "${w.en}"`, answer:w.ca };
      }

      // Nivell 4 → completar paraula
      const hidden = w.en.replace(/[aeiou]/g,"_");
      return { text:`Completa la paraula: ${hidden}`, answer:w.en };
    });
  }

  /* ========== EXPORTAR I REGISTRAR ========== */
  window.ModAng = { gen: genVocab };

  if(window.addModules){
    window.addModules([
      {
        id: 'ang-basic',
        name: 'Anglès bàsic',
        desc: 'Vocabulari, colors, cos humà i escola.',
        badge: 'Lang',
        gen: (level, opts)=> window.ModAng.gen(level, opts),
        category: 'ang'
      }
    ]);
  }

})();
