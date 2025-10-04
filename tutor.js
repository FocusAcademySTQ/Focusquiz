/* =======================================================
   Focus Academy · Tutor Virtual Intel·ligent
   Arxiu: tutor.js
   ======================================================= */

(function(){

  const $ = (q) => document.querySelector(q);

  // Guarda el resultat de cada pregunta
  window.saveResult = function(moduleName, questionText, correct){
    const data = JSON.parse(localStorage.getItem('progress') || '{}');
    if(!data[moduleName]) data[moduleName] = [];
    data[moduleName].push({
      question: questionText,
      correct: !!correct,
      time: Date.now()
    });
    localStorage.setItem('progress', JSON.stringify(data));
  };

  // Calcula el rendiment mitjà per mòdul
  window.getPerformance = function(){
    const data = JSON.parse(localStorage.getItem('progress') || '{}');
    const summary = {};
    for(const mod in data){
      const items = data[mod];
      if(items.length === 0) continue;
      const correct = items.filter(x => x.correct).length;
      summary[mod] = Math.round((correct / items.length) * 100);
    }
    return summary;
  };

  // Recomana el mòdul més fluix
  window.recommendNextModule = function(){
    const perf = getPerformance();
    const entries = Object.entries(perf);
    if(entries.length === 0) return "Encara no hi ha dades per fer recomanacions.";
    const worst = entries.sort((a,b)=>a[1]-b[1])[0];
    return `Et recomano practicar més <b>${worst[0]}</b>, ja que tens un ${worst[1]}% d'encerts 💪`;
  };

  // Mostra la recomanació dins d'un selector
  window.showRecommendation = function(selector){
    const msg = recommendNextModule();
    const el = $(selector);
    if(el) el.innerHTML = msg;
  };

  // Esborra tot el progrés (opcional)
  window.resetProgress = function(){
    localStorage.removeItem('progress');
    alert('Progrés esborrat.');
  };

})();
