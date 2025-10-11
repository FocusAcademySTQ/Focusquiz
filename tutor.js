/* =======================================================
   Focus Academy · Tutor Virtual Intel·ligent
   Arxiu: tutor.js
   ======================================================= */

(function(){

  /* ======== UTILITATS ======== */
  const $ = (q) => document.querySelector(q);
  const STORAGE_KEY = 'progress';
  const MS_DAY = 86400000;
  const THEORY_LINKS = {
    arith: { href: 'teoria.html#aritmetica', title: 'Aritmètica' },
    frac:  { href: 'teoria.html#fraccions', title: 'Fraccions' },
    perc:  { href: 'teoria.html#percentatges', title: 'Percentatges' },
    geom:  { href: 'teoria.html#geometria', title: 'Geometria' },
    stats: { href: 'teoria.html#estadistica', title: 'Estadística' },
    units: { href: 'teoria.html#unitats', title: 'Unitats i conversions' },
    eq:    { href: 'teoria.html#equacions', title: 'Equacions' },
    func:  { href: 'teoria.html#funcions', title: 'Funcions' }
  };
  const dateFormatter = (typeof Intl !== 'undefined' && Intl.DateTimeFormat)
    ? new Intl.DateTimeFormat('ca-ES', { day: 'numeric', month: 'long' })
    : null;

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

  const formatDaysAgo = (days) => {
    if (typeof days !== 'number' || !isFinite(days)) return 'fa poc';
    if (days <= 0) return 'avui';
    if (days === 1) return 'fa 1 dia';
    return `fa ${days} dies`;
  };

  const formatFutureDays = (days) => {
    if (days <= 0) return 'avui';
    if (days === 1) return 'en 1 dia';
    return `en ${days} dies`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    try {
      return dateFormatter ? dateFormatter.format(date) : date.toLocaleDateString('ca-ES');
    } catch {
      return date.toLocaleDateString();
    }
  };

  const calcModuleStats = (id, entries) => {
    if (!Array.isArray(entries) || entries.length === 0) return null;
    let correct = 0;
    let lastTime = 0;
    let lastIncorrectTime = 0;
    entries.forEach(item => {
      if (item && item.correct) correct++;
      if (item && item.time && item.time > lastTime) lastTime = item.time;
      if (item && !item.correct && item.time && item.time > lastIncorrectTime) lastIncorrectTime = item.time;
    });
    const total = entries.length;
    const incorrect = total - correct;
    const accuracy = total ? Math.round((correct / total) * 100) : 0;
    const recentWindow = entries.slice(-5);
    const recentIncorrect = recentWindow.filter(item => item && !item.correct).length;
    const struggles = recentWindow.length >= 3 && recentIncorrect / recentWindow.length >= 0.5;
    const anchor = lastIncorrectTime || lastTime || Date.now();
    const spacing = accuracy >= 90 ? 7 : accuracy >= 75 ? 4 : accuracy >= 50 ? 2 : 1;
    const reviewDate = anchor + spacing * MS_DAY;
    const now = Date.now();
    const daysUntil = Math.max(Math.ceil((reviewDate - now) / MS_DAY), 0);
    const daysSince = lastTime ? Math.max(Math.floor((now - lastTime) / MS_DAY), 0) : null;
    return {
      id,
      name: moduleLabel(id),
      total,
      correct,
      incorrect,
      accuracy,
      lastTime,
      reviewDate,
      daysUntil,
      daysSince,
      struggles,
      recentIncorrect,
      recentWindow: recentWindow.length,
      due: reviewDate <= now
    };
  };

  const gatherUserStats = (targetUser) => {
    const user = targetUser || activeUser();
    if (!user) return { user: null, safeUser: '', stats: [] };
    const safeUser = escapeHTML(user);
    const data = loadProgress();
    const bucket = data[user];
    if (!bucket || typeof bucket !== 'object') {
      return { user, safeUser, stats: [] };
    }
    const stats = Object.entries(bucket)
      .map(([id, items]) => calcModuleStats(id, items))
      .filter(Boolean);
    return { user, safeUser, stats };
  };

  const buildLeadMessage = ({ user, safeUser, stats }) => {
    if (!user) return 'Inicia sessió per rebre recomanacions personalitzades.';
    if (!stats.length) {
      return `${safeUser} encara no té dades suficients. Completa un examen per generar recomanacions.`;
    }
    const weakest = stats.slice().sort((a, b) => a.accuracy - b.accuracy)[0];
    const safeModule = escapeHTML(weakest.name);
    return `${safeUser}, et recomano practicar més <strong>${safeModule}</strong> perquè tens un ${weakest.accuracy}% d'encerts. 💪`;
  };

  const buildCalendarSection = (stats) => {
    if (!stats.length) return '';
    const relevant = stats.filter(s => s.total >= 3 && s.lastTime);
    if (!relevant.length) return '';
    const now = Date.now();
    const due = relevant.filter(s => s.due).sort((a, b) => a.reviewDate - b.reviewDate);
    const upcoming = relevant
      .filter(s => !s.due)
      .sort((a, b) => a.reviewDate - b.reviewDate);
    const candidates = (due.length ? due : upcoming).slice(0, 3);
    if (!candidates.length) return '';
    const items = candidates.map(stat => {
      const label = escapeHTML(stat.name);
      if (stat.due) {
        const since = typeof stat.daysSince === 'number' ? formatDaysAgo(stat.daysSince) : 'fa poc';
        return `<li><strong>${label}</strong>: toca repàs ${since}. Obre una nova sessió per consolidar-ho.</li>`;
      }
      const window = formatFutureDays(stat.daysUntil);
      const date = formatDate(stat.reviewDate);
      const when = date ? `${window} (${escapeHTML(date)})` : window;
      return `<li><strong>${label}</strong>: planifica el repàs ${when} per no oblidar-lo.</li>`;
    }).join('');
    return `<div class="tutor-section"><h4>🗓️ Calendari de repàs</h4><ul class="tutor-list">${items}</ul></div>`;
  };

  const buildTheorySection = (stats) => {
    if (!stats.length) return '';
    const struggling = stats
      .filter(s => s.struggles && s.recentIncorrect >= 2 && THEORY_LINKS[s.id])
      .sort((a, b) => b.recentIncorrect - a.recentIncorrect || a.accuracy - b.accuracy);
    if (!struggling.length) return '';
    const focus = struggling[0];
    const link = THEORY_LINKS[focus.id];
    const safeModule = escapeHTML(focus.name);
    const safeTitle = escapeHTML(link.title);
    const href = escapeHTML(link.href);
    return `<div class="tutor-section"><h4>📚 Repàs de teoria recomanat</h4><p>Hem detectat errors recurrents a <strong>${safeModule}</strong>. Dona un cop d'ull a la secció <a class="tutor-link" href="${href}" target="_blank" rel="noopener">${safeTitle}</a> per reforçar-ho amb exemples.</p></div>`;
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
    const info = gatherUserStats(targetUser);
    return buildLeadMessage(info);
  };

  // Mostra recomanació (pots cridar-la des de la Home)
  window.showRecommendation = function(selector, targetUser){
    const el = $(selector);
    if(!el) return;
    const info = gatherUserStats(targetUser);
    const lead = buildLeadMessage(info);
    const calendar = buildCalendarSection(info.stats);
    const theory = buildTheorySection(info.stats);
    el.innerHTML = `<p class="tutor-lead">${lead}</p>${calendar}${theory}`;
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
