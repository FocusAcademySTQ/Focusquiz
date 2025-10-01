/* =======================================================
   Focus Academy · Anglès (mòdul de vocabulari bàsic)
   Arxiu: alex.js
   ======================================================= */

(function(){
  const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];

  /* ========== BANCS D'EXERCICIS (VOCABULARI BÀSIC) ========== */
  const BANK_EN = [
    { text: `Traducció al anglès: "casa"`,       answer: `house` },
    { text: `Traducció al anglès: "gos"`,        answer: `dog` },
    { text: `Traducció al anglès: "gat"`,        answer: `cat` },
    { text: `Traducció al anglès: "llibre"`,     answer: `book` },
    { text: `Traducció al anglès: "taula"`,      answer: `table` },
    { text: `Traducció al anglès: "cadira"`,     answer: `chair` },
    { text: `Traducció al anglès: "cotxe"`,      answer: `car` },
    { text: `Traducció al anglès: "amic"`,       answer: `friend` },
    { text: `Traducció al anglès: "aigua"`,      answer: `water` },
    { text: `Traducció al anglès: "menjar"`,     answer: `food` },
    { text: `Traducció al anglès: "professor"`,  answer: `teacher` },
    { text: `Traducció al anglès: "escola"`,     answer: `school` },
    { text: `Traducció al anglès: "sol"`,        answer: `sun` },
    { text: `Traducció al anglès: "lluna"`,      answer: `moon` },
    { text: `Traducció al anglès: "finestra"`,   answer: `window` },
    { text: `Traducció al anglès: "porta"`,      answer: `door` },
    { text: `Traducció al anglès: "mà"`,         answer: `hand` },
    { text: `Traducció al anglès: "peu"`,        answer: `foot` },
    { text: `Traducció al anglès: "cap"`,        answer: `head` },
    { text: `Traducció al anglès: "ull"`,        answer: `eye` }
  ];

  /* ========== EXPORTAR ========== */
window.ModAng = {
  get: ()=> choice(BANK_EN),
  all: ()=> BANK_EN
};

/* ========== REGISTRE AL SISTEMA ========== */
if (window.addModules) {
  window.addModules([
    { 
      id: 'ang-basic',
      name: 'Anglès bàsic',
      desc: 'Vocabulari essencial català → anglès',
      badge: 'New',
      gen: ()=> window.ModAng.get(),
      category: 'ang'
    }
  ]);
}

})();
