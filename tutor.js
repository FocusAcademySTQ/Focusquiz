/* =======================================================
   Focus Academy · Tutor Virtual Intel·ligent
   Arxiu: tutor.js
   ======================================================= */

(function(){

  /* ======== UTILITATS ======== */
  const $ = (q) => document.querySelector(q);
  const STORAGE_KEY = 'progress';

  const escapeHTML = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const activeUser = () => {
    const name = localStorage.getItem('lastStudent');
    return name ? name : null;
  };

  const fallbackUser = () => activeUser() || 'Anònim';

  const loadProgress = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
      const values = Object.values(raw);
      if (values.length && Array.isArray(values[0])) {
        const migrated = { [fallbackUser()]: raw };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      return raw;
    } catch {
      return {};
    }
  };

  const saveProgress = (data) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('No s\'ha pogut actualitzar el progrés del tutor virtual.', err);
    }
  };

  const ensureUserBucket = (data, user) => {
    if (!user) return null;
    if (!data[user] || typeof data[user] !== 'object') data[user] = {};
    return data[user];
  };

  const moduleLabel = (id) => {
    if (typeof MODULES !== 'undefined' && Array.isArray(MODULES)) {
      const found = MODULES.find(m => m.id === id);
      if (found) return found.name;
    }
    return id;
  };

  // Guarda resultat de cada pregunta
  window.saveResult = function(moduleName, questionText, correct){
    const data = loadProgress();
    const user = fallbackUser();
    const bucket = ensureUserBucket(data, user);
    if (!bucket) return;
    if (!Array.isArray(bucket[moduleName])) bucket[moduleName] = [];
    bucket[moduleName].push({
      question: questionText,
      correct: !!correct,
      time: Date.now()
    });
    saveProgress(data);
  };

  // Obté el rendiment mitjà per mòdul
  window.getPerformance = function(targetUser){
    const data = loadProgress();
    const user = targetUser || activeUser();
    if (!user) return {};
    const bucket = data[user];
    if (!bucket || typeof bucket !== 'object') return {};
    const summary = {};
    for(const mod in bucket){
      const items = bucket[mod];
      if(!Array.isArray(items) || items.length === 0) continue;
      const correct = items.filter(x => x.correct).length;
      summary[mod] = Math.round((correct / items.length) * 100);
    }
    return summary;
  };

  // Recomana el mòdul més fluix
  window.recommendNextModule = function(targetUser){
    const user = targetUser || activeUser();
    if (!user) return 'Inicia sessió per rebre recomanacions personalitzades.';
    const safeUser = escapeHTML(user);
    const perf = getPerformance(user);
    const entries = Object.entries(perf);
    if(entries.length === 0) return `${safeUser} encara no té dades suficients. Completa un examen per generar recomanacions.`;
    const [modId, pct] = entries.sort((a,b)=>a[1]-b[1])[0];
    const readable = moduleLabel(modId);
    const safeModule = escapeHTML(readable);
    return `${safeUser}, et recomano practicar més <strong>${safeModule}</strong> perquè tens un ${pct}% d'encerts. 💪`;
  };

  // Mostra recomanació (pots cridar-la des de la Home)
  window.showRecommendation = function(selector, targetUser){
    const el = $(selector);
    if(!el) return;
    el.innerHTML = recommendNextModule(targetUser);
  };

  // (Opcional) Neteja el progrés de l'usuari actiu
  window.resetProgress = function(){
    const data = loadProgress();
    const user = activeUser();
    if (user && data[user]) {
      delete data[user];
      if (Object.keys(data).length) saveProgress(data);
      else localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    alert('Progrés esborrat.');
  };

})();
