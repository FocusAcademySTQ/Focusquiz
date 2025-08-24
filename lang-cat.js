/* =======================================================
   Focus Academy · Llengua Catalana (mòduls externs)
   Arxiu: lang-cat.js
   S’afegeix a la web amb <script defer src="lang-cat.js">
   i es registra amb window.addModules([...])
   ======================================================= */

(function(){
  // Utilitats mínimes (reutilitzem "choice" si existeix)
  const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];

  // ------- Bancs de preguntes (prova) -------
  const BANK_ORT = [
    {
      text: `Escriu la forma correcta a la frase: "No hi vaig anar ______ estava cansat."`,
      answer: `perquè`
    },
    {
      text: `Completa amb s/ss/ç i escriu la paraula completa: pa__a`,
      answer: `passa`
    },
    {
      text: `Escriu la paraula correcta (b/v): ha_er`,
      answer: `haver`
    }
  ];

  const BANK_MORF = [
    { text: `Identifica la categoria gramatical de "ràpidament".`, answer: `adverbi` },
    { text: `Identifica la categoria gramatical de "nosaltres".`,  answer: `pronom personal` },
    { text: `Identifica la categoria gramatical de "gran".`,       answer: `adjectiu` }
  ];

  // ------- Generadors (format compatibles amb la teva app) -------
  function genFromBank(bank){
    return function(level, opts={}){
      const q = choice(bank);
      // Format genèric: la teva funció checkAnswer ja compara text (case/espais)
      return { type:'cat', text:q.text, answer:q.answer };
    };
  }

  const CAT_MODULES = [
  {
    id: 'cat-ort',
    name: 'Català · Ortografia',
    desc: 'Accents, b/v, s/ss/ç, perquè/per què…',
    badge: 'CAT',
    gen: genFromBank(BANK_ORT),
    category: 'cat'
  },
  {
    id: 'cat-morf',
    name: 'Català · Morfologia',
    desc: 'Categories gramaticals bàsiques.',
    badge: 'CAT',
    gen: genFromBank(BANK_MORF),
    category: 'cat'
    }
  ];

  // ------- Registra els mòduls a l’app -------
  if(typeof window.addModules === 'function'){
    window.addModules(CAT_MODULES);
  } else {
    // Si encara no existeix (arxiu carregat abans que main.js), guarda-ho per després
    window._PENDING_CAT_MODULES_ = CAT_MODULES;
    window.addEventListener('DOMContentLoaded', ()=>{
      if(typeof window.addModules === 'function' && window._PENDING_CAT_MODULES_){
        window.addModules(window._PENDING_CAT_MODULES_);
        delete window._PENDING_CAT_MODULES_;
      }
    });
  }
})();
