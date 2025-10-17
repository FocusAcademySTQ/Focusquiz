(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('flashcards');
    if (!root) return;

    const STORAGE = {
      collections: 'fq_flashcards_collections',
      cards: 'fq_flashcards_cards',
      prefs: 'fq_flashcards_prefs'
    };

    const strings = {
      ca: {
        title: "Flashcards d'estudi",
        subtitle: "Repàs actiu amb repetició espaiada i memòria local.",
        collectionLabel: "Col·lecció",
        searchLabel: "Cerca",
        searchPlaceholder: "Filtra per text",
        front: "Anvers",
        back: "Revers",
        flipShow: "Mostra resposta",
        flipHide: "Mostra pregunta",
        unknown: "👎 No ho sabia",
        known: "👍 Ho sabia",
        next: "Següent",
        counter: (seen, total) => `${seen} / ${total} targetes vistes`,
        learned: (pct) => `${pct}% après`,
        noteLabel: "Nota personal",
        notePlaceholder: "Escriu anotacions o dubtes...",
        noteClose: "Tanca nota",
        noteSaved: "Nota guardada ✅",
        noteCleared: "Nota eliminada",
        feedbackKnown: "Genial! Aquesta targeta s'espaiarà més.",
        feedbackUnknown: "Cap problema, la revisarem aviat de nou.",
        empty: "No hi ha targetes que coincideixin amb el filtre actual.",
        resetFilters: "Reinicia filtres",
        diagnosticsTitle: "Diagnòstic",
        diagnosticsDescription: "Revisa l'estat de les col·leccions, el filtre actiu i el progrés d'aprenentatge.",
        diagnosticsCollections: "Col·leccions",
        diagnosticsPool: "Pool actual",
        diagnosticsReset: "Reset LocalStorage",
        diagnosticsPoolStats: (count, filtered, ease, rep) => `Targetes filtrades: ${filtered} / ${count} · facilitat mitjana: ${ease} · repeticions totals: ${rep}`,
        diagnosticsNoCollections: "Encara no hi ha col·leccions.",
        diagnosticsNoPool: "Cap targeta disponible amb els filtres actuals.",
        addCard: "+ Nova targeta",
        manageCollections: "🗂️ Col·leccions",
        diagnosticsToggle: "🔍 Diagnòstic",
        doubt: "❓ Dubte",
        doubtActive: "🔖 Dubte",
        doubtAriaActive: "Marca el dubte com resolt",
        doubtAriaInactive: "Marca aquesta targeta com a dubte",
        edit: "✏️ Edita",
        modalNewTitle: "Nova targeta",
        modalEditTitle: "Edita la targeta",
        modalFront: "Anvers",
        modalBack: "Revers",
        modalCollection: "Col·lecció",
        modalNewCollection: "Nova col·lecció (opcional)",
        modalCreate: "Afegeix",
        modalSave: "Desa canvis",
        modalCancel: "Cancel·la",
        modalDelete: "Esborra",
        modalDeleteConfirm: "Segur que vols eliminar aquesta targeta?",
        manageTitle: "Gestiona col·leccions",
        manageAddLabel: "Afegeix col·lecció",
        manageAddPlaceholder: "Nom de la col·lecció",
        manageAddButton: "Afegeix",
        manageRename: "Canvia nom",
        manageDelete: "Esborra",
        manageDeleteConfirm: (name, count) => `Eliminar "${name}" també esborrarà ${count} targetes. Vols continuar?",
        manageEmpty: "Encara no hi ha col·leccions guardades.",
        manageKeepOne: "Cal mantenir almenys una col·lecció.",
        close: "Tanca",
        resetConfirm: "Això esborrarà totes les flashcards i preferències locals. Vols continuar?",
        addCollectionPrompt: "Introdueix el nom de la nova col·lecció",
        renamePrompt: (name) => `Nou nom per a "${name}"`,
        toastSaved: "Canvis guardats",
        toastError: "No s'ha pogut guardar. Revisa els camps.",
        langCatalan: "Català",
        langSpanish: "Castellano",
        searchAria: "Filtra targetes per text",
        progressAnnounce: (front) => `Mostrant: ${front}`
      },
      es: {
        title: "Flashcards de estudio",
        subtitle: "Repaso activo con repetición espaciada y memoria local.",
        collectionLabel: "Colección",
        searchLabel: "Búsqueda",
        searchPlaceholder: "Filtra por texto",
        front: "Anverso",
        back: "Reverso",
        flipShow: "Mostrar respuesta",
        flipHide: "Mostrar pregunta",
        unknown: "👎 No lo sabía",
        known: "👍 Sí lo sabía",
        next: "Siguiente",
        counter: (seen, total) => `${seen} / ${total} tarjetas vistas`,
        learned: (pct) => `${pct}% aprendido`,
        noteLabel: "Nota personal",
        notePlaceholder: "Escribe anotaciones o dudas...",
        noteClose: "Cerrar nota",
        noteSaved: "Nota guardada ✅",
        noteCleared: "Nota eliminada",
        feedbackKnown: "¡Bien! Esta tarjeta se espaciará más.",
        feedbackUnknown: "Sin problema, la revisaremos pronto otra vez.",
        empty: "No hay tarjetas que coincidan con el filtro actual.",
        resetFilters: "Reiniciar filtros",
        diagnosticsTitle: "Diagnóstico",
        diagnosticsDescription: "Revisa el estado de las colecciones, el filtro activo y el progreso de aprendizaje.",
        diagnosticsCollections: "Colecciones",
        diagnosticsPool: "Pool actual",
        diagnosticsReset: "Resetear LocalStorage",
        diagnosticsPoolStats: (count, filtered, ease, rep) => `Tarjetas filtradas: ${filtered} / ${count} · facilidad media: ${ease} · repeticiones totales: ${rep}`,
        diagnosticsNoCollections: "Todavía no hay colecciones.",
        diagnosticsNoPool: "Ninguna tarjeta disponible con los filtros actuales.",
        addCard: "+ Nueva tarjeta",
        manageCollections: "🗂️ Colecciones",
        diagnosticsToggle: "🔍 Diagnóstico",
        doubt: "❓ Duda",
        doubtActive: "🔖 Duda",
        doubtAriaActive: "Marca la duda como resuelta",
        doubtAriaInactive: "Marca esta tarjeta como duda",
        edit: "✏️ Editar",
        modalNewTitle: "Nueva tarjeta",
        modalEditTitle: "Editar tarjeta",
        modalFront: "Anverso",
        modalBack: "Reverso",
        modalCollection: "Colección",
        modalNewCollection: "Nueva colección (opcional)",
        modalCreate: "Añadir",
        modalSave: "Guardar",
        modalCancel: "Cancelar",
        modalDelete: "Eliminar",
        modalDeleteConfirm: "¿Seguro que quieres eliminar esta tarjeta?",
        manageTitle: "Gestionar colecciones",
        manageAddLabel: "Añadir colección",
        manageAddPlaceholder: "Nombre de la colección",
        manageAddButton: "Añadir",
        manageRename: "Renombrar",
        manageDelete: "Eliminar",
        manageDeleteConfirm: (name, count) => `Eliminar \"${name}\" también borrará ${count} tarjetas. ¿Continuar?`,
        manageEmpty: "Todavía no hay colecciones guardadas.",
        manageKeepOne: "Debe existir al menos una colección.",
        close: "Cerrar",
        resetConfirm: "Esto borrará todas las flashcards y preferencias locales. ¿Quieres continuar?",
        addCollectionPrompt: "Introduce el nombre de la nueva colección",
        renamePrompt: (name) => `Nuevo nombre para \"${name}\"`,
        toastSaved: "Cambios guardados",
        toastError: "No se ha podido guardar. Revisa los campos.",
        langCatalan: "Català",
        langSpanish: "Castellano",
        searchAria: "Filtra tarjetas por texto",
        progressAnnounce: (front) => `Mostrando: ${front}`
      }
    };

    const state = {
      collections: [],
      cards: [],
      prefs: {
        darkMode: false,
        lang: 'ca',
        lastCollectionId: null,
        search: ''
      }
    };

    const session = {
      pool: [],
      filteredCount: 0,
      totalInCollection: 0,
      currentCard: null,
      isFlipped: false,
      hasRevealed: false,
      awaitingGrade: false,
      lastCardId: null,
      seenIds: new Set()
    };

    let announceTimer = null;

    const els = {
      subtitle: document.getElementById('flashcards-subtitle'),
      collectionSelect: document.getElementById('flashcardsCollection'),
      search: document.getElementById('flashcardsSearch'),
      darkMode: document.getElementById('flashcardsDarkMode'),
      lang: document.getElementById('flashcardsLang'),
      counter: document.getElementById('flashcardsCounter'),
      learned: document.getElementById('flashcardsLearned'),
      progressBar: root.querySelector('.flashcards__progress-bar'),
      progressFill: root.querySelector('.flashcards__progress-bar i'),
      card: document.getElementById('flashcardCard'),
      inner: document.getElementById('flashcardInner'),
      frontLabel: document.getElementById('flashcardFrontLabel'),
      backLabel: document.getElementById('flashcardBackLabel'),
      front: document.getElementById('flashcardFront'),
      back: document.getElementById('flashcardBack'),
      flip: document.getElementById('flashcardFlip'),
      known: document.getElementById('flashcardKnown'),
      unknown: document.getElementById('flashcardUnknown'),
      next: document.getElementById('flashcardNext'),
      feedback: document.getElementById('flashcardsFeedback'),
      empty: document.getElementById('flashcardsEmpty'),
      resetFilters: document.getElementById('flashcardsResetFilters'),
      diagnosticsToggle: document.getElementById('flashcardsDiagnosticsToggle'),
      diagnostics: document.getElementById('flashcardsDiagnostics'),
      diagCollections: document.getElementById('flashcardsDiagCollections'),
      diagPool: document.getElementById('flashcardsDiagPool'),
      resetAll: document.getElementById('flashcardsResetAll'),
      addCard: document.getElementById('flashcardsAddCard'),
      manageCollections: document.getElementById('flashcardsManageCollections'),
      markDoubt: document.getElementById('flashcardMarkDoubt'),
      edit: document.getElementById('flashcardEdit'),
      noteWrapper: document.getElementById('flashcardNoteWrapper'),
      noteInput: document.getElementById('flashcardNoteInput'),
      noteStatus: document.getElementById('flashcardNoteStatus'),
      noteClose: document.getElementById('flashcardCloseNote')
    };

    function t(key, ...args){
      const lang = state.prefs.lang || 'ca';
      const pack = strings[lang] || strings.ca;
      const value = pack[key];
      if (typeof value === 'function') return value(...args);
      return value ?? strings.ca[key] ?? key;
    }

    function defaultSpaced(){
      return { repetitions: 0, interval: 1, ease: 2.5, lastReviewed: null, lastGrade: null };
    }

    function createId(prefix){
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${prefix}-${crypto.randomUUID()}`;
      }
      return `${prefix}-${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
    }

    function escapeHTML(str = ''){
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function formatContent(text){
      return escapeHTML(text).replace(/\n/g, '<br>');
    }

    function loadJSON(key, fallback){
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed ?? fallback;
      } catch (err) {
        console.warn('flashcards: error loading', key, err);
        return fallback;
      }
    }

    function saveJSON(key, value){
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.warn('flashcards: error saving', key, err);
      }
    }

    function loadState(){
      const storedCollections = loadJSON(STORAGE.collections, []);
      const storedCards = loadJSON(STORAGE.cards, []);
      const storedPrefs = loadJSON(STORAGE.prefs, {});

      state.collections = Array.isArray(storedCollections) ? storedCollections.filter(c => c && c.id && c.name) : [];
      state.cards = Array.isArray(storedCards) ? storedCards.filter(c => c && c.id && c.collectionId) : [];
      state.cards.forEach(card => {
        card.spaced = card.spaced && typeof card.spaced === 'object' ? { ...defaultSpaced(), ...card.spaced } : defaultSpaced();
        card.note = typeof card.note === 'string' ? card.note : '';
        card.flagged = Boolean(card.flagged);
      });

      state.prefs = {
        ...state.prefs,
        ...(storedPrefs && typeof storedPrefs === 'object' ? storedPrefs : {})
      };

      if (!state.collections.length || !state.cards.length) {
        seedExampleData();
      }

      if (!state.collections.some(col => col.id === state.prefs.lastCollectionId)) {
        state.prefs.lastCollectionId = state.collections[0]?.id || null;
      }

      state.prefs.lang = state.prefs.lang || 'ca';
      state.prefs.darkMode = Boolean(state.prefs.darkMode);
      state.prefs.search = state.prefs.search || '';
    }

    function saveCollections(){
      saveJSON(STORAGE.collections, state.collections);
    }

    function saveCards(){
      saveJSON(STORAGE.cards, state.cards);
    }

    function savePrefs(){
      saveJSON(STORAGE.prefs, state.prefs);
    }

    function seedExampleData(){
      const now = Date.now();
      const collectionId = createId('col');
      state.collections = [{ id: collectionId, name: 'MHS (1r Batx)', createdAt: now }];
      const samples = [
        { front: 'Fórmula posició en MHS', back: 'x = A·cos(ωt + φ)' },
        { front: 'Relació entre ω i T', back: 'ω = 2π / T' },
        { front: 'Relació entre ω i f', back: 'ω = 2π·f' },
        { front: 'Velocitat instantània', back: 'v(t) = -A·ω·sin(ωt + φ)' },
        { front: 'Acceleració en MHS', back: 'a(t) = -A·ω²·cos(ωt + φ)' },
        { front: 'Energia potencial elàstica', back: 'Ep = 1/2 · k · x²' },
        { front: 'Energia cinètica en MHS', back: 'Ec = 1/2 · m · ω² · (A² - x²)' },
        { front: 'Energia total en MHS', back: 'Et = 1/2 · k · A² (constant)' },
        { front: 'Període d’un ressort', back: 'T = 2π · √(m/k)' },
        { front: 'Període d’un pèndol simple', back: 'T = 2π · √(ℓ/g)' },
        { front: 'Significat de l’amplitud A', back: 'És el desplaçament màxim respecte la posició d’equilibri.' },
        { front: 'Fase inicial φ', back: 'Angle que fixa la posició en t = 0.' }
      ];
      state.cards = samples.map(sample => ({
        id: createId('card'),
        collectionId,
        front: sample.front,
        back: sample.back,
        spaced: defaultSpaced(),
        createdAt: now,
        updatedAt: now,
        note: '',
        flagged: false
      }));
      state.prefs.lastCollectionId = collectionId;
      saveCollections();
      saveCards();
      savePrefs();
    }

    function countByCollection(){
      const counts = {};
      state.cards.forEach(card => {
        counts[card.collectionId] = (counts[card.collectionId] || 0) + 1;
      });
      return counts;
    }

    function applyLanguage(){
      els.subtitle.textContent = t('subtitle');
      els.frontLabel.textContent = t('front');
      els.backLabel.textContent = t('back');
      els.flip.textContent = session.isFlipped ? t('flipHide') : t('flipShow');
      els.unknown.textContent = t('unknown');
      els.known.textContent = t('known');
      els.next.textContent = t('next');
      els.noteWrapper?.querySelector('label span')?.textContent;
      const titleNode = document.getElementById('flashcards-title');
      if (titleNode) titleNode.textContent = t('title');
      if (els.noteWrapper) {
        const span = els.noteWrapper.querySelector('.flashcards__note-title');
        if (span) span.textContent = t('noteLabel');
      }
      if (els.noteInput) {
        els.noteInput.placeholder = t('notePlaceholder');
      }
      if (els.noteClose) {
        els.noteClose.textContent = t('noteClose');
      }
      if (els.edit) {
        els.edit.textContent = t('edit');
      }
      if (els.search) {
        els.search.placeholder = t('searchPlaceholder');
        els.search.setAttribute('aria-label', t('searchAria'));
      }
      const collectionLabelNode = root.querySelector('[data-i18n="collection"]');
      if (collectionLabelNode) collectionLabelNode.textContent = t('collectionLabel');
      const searchLabelNode = root.querySelector('[data-i18n="search"]');
      if (searchLabelNode) searchLabelNode.textContent = t('searchLabel');
      if (els.diagnosticsToggle) {
        els.diagnosticsToggle.textContent = t('diagnosticsToggle');
      }
      if (els.addCard) {
        els.addCard.textContent = t('addCard');
      }
      if (els.manageCollections) {
        els.manageCollections.textContent = t('manageCollections');
      }
      if (els.resetFilters) {
        els.resetFilters.textContent = t('resetFilters');
      }
      const diagTitle = els.diagnostics?.querySelector('h3');
      if (diagTitle) diagTitle.textContent = t('diagnosticsTitle');
      const diagDesc = els.diagnostics?.querySelector('p');
      if (diagDesc) diagDesc.textContent = t('diagnosticsDescription');
      const diagHeadings = els.diagnostics?.querySelectorAll('h4');
      if (diagHeadings && diagHeadings.length >= 2) {
        diagHeadings[0].textContent = t('diagnosticsCollections');
        diagHeadings[1].textContent = t('diagnosticsPool');
      }
      if (els.resetAll) els.resetAll.textContent = t('diagnosticsReset');
      updateProgress();
      updateDiagnostics();
      updateDoubtButton();
    }

    function renderCollections(){
      const counts = countByCollection();
      const options = state.collections.map(col => {
        const count = counts[col.id] || 0;
        const label = `${col.name} (${count})`;
        return `<option value="${escapeHTML(col.id)}">${escapeHTML(label)}</option>`;
      }).join('');
      els.collectionSelect.innerHTML = options;
      if (state.prefs.lastCollectionId) {
        els.collectionSelect.value = state.prefs.lastCollectionId;
      }
    }

    function buildPool(){
      const collectionId = state.prefs.lastCollectionId;
      const cardsInCollection = state.cards.filter(card => card.collectionId === collectionId);
      const query = (state.prefs.search || '').trim().toLowerCase();
      const filtered = query
        ? cardsInCollection.filter(card => {
            const front = card.front || '';
            const back = card.back || '';
            return front.toLowerCase().includes(query) || back.toLowerCase().includes(query);
          })
        : cardsInCollection;
      session.pool = filtered;
      session.filteredCount = filtered.length;
      session.totalInCollection = cardsInCollection.length;
      if (session.filteredCount === 0) {
        session.currentCard = null;
      }
    }

    function pickNextCard(){
      const pool = session.pool;
      if (!pool.length) return null;
      const now = Date.now();
      const scored = pool.map(card => {
        const spaced = card.spaced || defaultSpaced();
        const repsScore = 3 - Math.min(spaced.repetitions || 0, 3);
        const intervalScore = 1 / Math.max(1, spaced.interval || 1);
        const easeScore = 1 / Math.max(1.3, spaced.ease || 2.5);
        const missBoost = spaced.lastGrade === 'unknown' ? 2 : 0;
        const flaggedBoost = card.flagged ? 1.5 : 0;
        const elapsed = spaced.lastReviewed ? Math.max(0, now - spaced.lastReviewed) : Infinity;
        const recencyScore = spaced.lastReviewed ? Math.min(1.5, 600000 / Math.max(elapsed, 1)) : 1.2;
        const random = Math.random() * 0.1;
        const score = repsScore * 2.8 + intervalScore * 3 + easeScore + missBoost + flaggedBoost + recencyScore + random;
        return { card, score };
      });
      scored.sort((a, b) => b.score - a.score);
      if (scored.length > 1 && scored[0].card.id === session.lastCardId) {
        const alt = scored.find(entry => entry.card.id !== session.lastCardId);
        if (alt) return alt.card;
      }
      return scored[0].card;
    }

    function updateProgress(){
      const total = session.totalInCollection;
      const seen = state.cards.filter(card => card.collectionId === state.prefs.lastCollectionId && card.spaced?.lastReviewed).length;
      const learnedCount = state.cards.filter(card => card.collectionId === state.prefs.lastCollectionId && (card.spaced?.repetitions || 0) >= 2).length;
      const pct = total ? Math.round((learnedCount / total) * 100) : 0;
      els.counter.textContent = t('counter', seen, total);
      els.learned.textContent = t('learned', pct);
      els.progressBar?.setAttribute('aria-valuenow', String(pct));
      if (els.progressFill) {
        els.progressFill.style.width = `${pct}%`;
      }
    }

    function updateEmptyState(){
      const empty = session.filteredCount === 0;
      els.empty.hidden = !empty;
      els.flip.disabled = empty;
      els.known.disabled = empty;
      els.unknown.disabled = empty;
      els.next.disabled = empty;
      els.markDoubt.disabled = empty;
      els.edit.disabled = empty;
      if (empty) {
        els.feedback.textContent = '';
        els.front.innerHTML = escapeHTML(t('empty'));
        els.back.innerHTML = escapeHTML(t('empty'));
        if (els.noteWrapper) els.noteWrapper.hidden = true;
      }
    }

    function renderCard(card){
      if (!card) {
        updateEmptyState();
        return;
      }
      els.empty.hidden = true;
      els.front.innerHTML = formatContent(card.front || '');
      els.back.innerHTML = formatContent(card.back || '');
      session.isFlipped = false;
      session.hasRevealed = false;
      session.awaitingGrade = true;
      els.inner.classList.remove('is-flipped');
      els.flip.textContent = t('flipShow');
      els.flip.disabled = false;
      els.known.disabled = true;
      els.unknown.disabled = true;
      els.next.disabled = true;
      els.feedback.textContent = '';
      updateDoubtButton();
      syncNoteUI();
      announceCard(card.front);
    }

    function announceCard(text){
      if (!text) return;
      if (announceTimer) {
        clearTimeout(announceTimer);
        announceTimer = null;
      }
      els.feedback.textContent = t('progressAnnounce', text);
      announceTimer = setTimeout(() => {
        els.feedback.textContent = '';
        announceTimer = null;
      }, 800);
    }

    function updateDoubtButton(){
      if (!session.currentCard || !els.markDoubt) return;
      const flagged = !!session.currentCard.flagged;
      els.markDoubt.textContent = flagged ? t('doubtActive') : t('doubt');
      els.markDoubt.setAttribute('aria-pressed', String(flagged));
      els.markDoubt.setAttribute('aria-label', flagged ? t('doubtAriaActive') : t('doubtAriaInactive'));
    }

    function syncNoteUI(){
      if (!session.currentCard || !els.noteWrapper) return;
      const note = session.currentCard.note || '';
      els.noteInput.value = note;
      const flagged = session.currentCard.flagged || note.trim().length > 0;
      els.noteWrapper.hidden = !flagged;
      els.noteStatus.textContent = '';
    }

    function flipCard(){
      if (!session.currentCard) return;
      session.isFlipped = !session.isFlipped;
      if (session.isFlipped) session.hasRevealed = true;
      els.inner.classList.toggle('is-flipped', session.isFlipped);
      els.flip.textContent = session.isFlipped ? t('flipHide') : t('flipShow');
      if (session.isFlipped) {
        els.known.disabled = false;
        els.unknown.disabled = false;
      } else {
        els.known.disabled = true;
        els.unknown.disabled = true;
      }
    }

    function gradeCard(known){
      if (!session.currentCard || !session.hasRevealed) return;
      const card = session.currentCard;
      const spaced = card.spaced || defaultSpaced();
      card.spaced = spaced;
      if (known) {
        spaced.repetitions = (spaced.repetitions || 0) + 1;
        spaced.ease = Math.max(1.3, (spaced.ease || 2.5) + 0.1);
        if (spaced.repetitions === 1) spaced.interval = 1;
        else if (spaced.repetitions === 2) spaced.interval = 2;
        else if (spaced.repetitions === 3) spaced.interval = 5;
        else if (spaced.repetitions === 4) spaced.interval = 10;
        else spaced.interval = Math.round(spaced.interval * spaced.ease);
        spaced.lastGrade = 'known';
        els.feedback.textContent = t('feedbackKnown');
      } else {
        spaced.repetitions = 0;
        spaced.interval = 1;
        spaced.ease = Math.max(1.3, (spaced.ease || 2.5) - 0.2);
        spaced.lastGrade = 'unknown';
        card.flagged = true;
        els.feedback.textContent = t('feedbackUnknown');
      }
      spaced.lastReviewed = Date.now();
      card.updatedAt = Date.now();
      session.seenIds.add(card.id);
      session.awaitingGrade = false;
      session.lastCardId = card.id;
      if (announceTimer) {
        clearTimeout(announceTimer);
        announceTimer = null;
      }
      els.known.disabled = true;
      els.unknown.disabled = true;
      els.next.disabled = false;
      saveCards();
      updateProgress();
      updateDiagnostics();
      updateDoubtButton();
    }

    function showNextCard(force){
      buildPool();
      updateProgress();
      updateDiagnostics();
      updateEmptyState();
      if (!session.pool.length) {
        session.currentCard = null;
        return;
      }
      if (!force && session.currentCard && session.pool.includes(session.currentCard)) {
        renderCard(session.currentCard);
        return;
      }
      const nextCard = pickNextCard();
      if (nextCard) {
        session.currentCard = nextCard;
        renderCard(nextCard);
      }
    }

    function resetFilters(){
      state.prefs.search = '';
      els.search.value = '';
      savePrefs();
      showNextCard(true);
    }

    function toggleDiagnostics(){
      const isVisible = !els.diagnostics.hidden;
      const show = !isVisible;
      els.diagnostics.hidden = !show;
      els.diagnosticsToggle.setAttribute('aria-expanded', String(show));
      if (show) updateDiagnostics();
    }

    function updateDiagnostics(){
      if (!els.diagnostics) return;
      const counts = countByCollection();
      if (els.diagCollections) {
        if (!state.collections.length) {
          els.diagCollections.innerHTML = `<li>${escapeHTML(t('diagnosticsNoCollections'))}</li>`;
        } else {
          els.diagCollections.innerHTML = state.collections.map(col => {
            const count = counts[col.id] || 0;
            return `<li><strong>${escapeHTML(col.name)}</strong>: ${count}</li>`;
          }).join('');
        }
      }
      if (els.diagPool) {
        if (!session.pool.length) {
          els.diagPool.innerHTML = `<li>${escapeHTML(t('diagnosticsNoPool'))}</li>`;
        } else {
          const ease = (session.pool.reduce((acc, card) => acc + (card.spaced?.ease || 2.5), 0) / session.pool.length).toFixed(2);
          const reps = session.pool.reduce((acc, card) => acc + (card.spaced?.repetitions || 0), 0);
          const item = escapeHTML(t('diagnosticsPoolStats', session.totalInCollection, session.filteredCount, ease, reps));
          els.diagPool.innerHTML = `<li>${item}</li>`;
        }
      }
    }

    function toggleDarkMode(on){
      state.prefs.darkMode = on;
      root.classList.toggle('flashcards--dark', on);
      savePrefs();
    }

    function handleNoteChange(){
      if (!session.currentCard) return;
      session.currentCard.note = els.noteInput.value;
      session.currentCard.updatedAt = Date.now();
      saveCards();
      els.noteStatus.textContent = session.currentCard.note.trim() ? t('noteSaved') : t('noteCleared');
      setTimeout(() => {
        els.noteStatus.textContent = '';
      }, 1500);
    }

    function toggleNote(){
      if (!session.currentCard) return;
      session.currentCard.flagged = !session.currentCard.flagged;
      const show = session.currentCard.flagged || session.currentCard.note.trim().length > 0;
      els.noteWrapper.hidden = !show;
      updateDoubtButton();
      saveCards();
    }

    function openNote(){
      if (!session.currentCard) return;
      session.currentCard.flagged = true;
      els.noteWrapper.hidden = false;
      updateDoubtButton();
      saveCards();
    }

    function closeNote(){
      if (!session.currentCard) return;
      session.currentCard.flagged = false;
      if (!session.currentCard.note.trim()) {
        els.noteWrapper.hidden = true;
      }
      updateDoubtButton();
      saveCards();
    }

    function openCardModal(card){
      const isNew = !card;
      const collections = state.collections.map(col => `<option value="${escapeHTML(col.id)}" ${card && card.collectionId === col.id ? 'selected' : ''}>${escapeHTML(col.name)}</option>`).join('');
      const modal = `
        <form class="flashcards-modal" id="flashcardsCardForm">
          <h3>${escapeHTML(isNew ? t('modalNewTitle') : t('modalEditTitle'))}</h3>
          <label class="flashcards-modal__field">${escapeHTML(t('modalCollection'))}
            <select name="collectionId" required>${collections}</select>
          </label>
          <label class="flashcards-modal__field">${escapeHTML(t('modalNewCollection'))}
            <input type="text" name="newCollection" placeholder="${escapeHTML(t('manageAddPlaceholder'))}">
          </label>
          <label class="flashcards-modal__field">${escapeHTML(t('modalFront'))}
            <textarea name="front" rows="3" required>${card ? escapeHTML(card.front) : ''}</textarea>
          </label>
          <label class="flashcards-modal__field">${escapeHTML(t('modalBack'))}
            <textarea name="back" rows="3" required>${card ? escapeHTML(card.back) : ''}</textarea>
          </label>
          <div class="flashcards-modal__actions">
            <button type="submit" class="btn-primary">${escapeHTML(isNew ? t('modalCreate') : t('modalSave'))}</button>
            <button type="button" class="btn-secondary" data-close>${escapeHTML(t('modalCancel'))}</button>
            ${!isNew ? `<button type="button" class="btn-danger" data-delete>${escapeHTML(t('modalDelete'))}</button>` : ''}
          </div>
        </form>
      `;
      if (typeof showModal === 'function') {
        showModal(modal);
      } else {
        const container = document.createElement('div');
        container.className = 'modal-fallback';
        container.innerHTML = modal;
        document.body.appendChild(container);
      }
      const form = document.getElementById('flashcardsCardForm');
      if (!form) return;
      const closeBtn = form.querySelector('[data-close]');
      closeBtn?.addEventListener('click', () => {
        if (typeof closeModal === 'function') closeModal();
        else form.closest('.modal-fallback')?.remove();
      });
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(form);
        let collectionId = data.get('collectionId');
        const newCollection = (data.get('newCollection') || '').toString().trim();
        if (newCollection) {
          collectionId = createCollection(newCollection);
        }
        const front = data.get('front').toString().trim();
        const back = data.get('back').toString().trim();
        if (!collectionId || !front || !back) {
          alert(t('toastError'));
          return;
        }
        if (isNew) {
          const newCard = {
            id: createId('card'),
            collectionId,
            front,
            back,
            spaced: defaultSpaced(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            note: '',
            flagged: false
          };
          state.cards.push(newCard);
        } else {
          card.collectionId = collectionId.toString();
          card.front = front;
          card.back = back;
          card.updatedAt = Date.now();
        }
        saveCards();
        saveCollections();
        renderCollections();
        state.prefs.lastCollectionId = collectionId.toString();
        savePrefs();
        els.collectionSelect.value = state.prefs.lastCollectionId;
        if (typeof closeModal === 'function') closeModal();
        else form.closest('.modal-fallback')?.remove();
        showNextCard(true);
      });
      const deleteBtn = form.querySelector('[data-delete]');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          if (!card) return;
          if (confirm(t('modalDeleteConfirm'))) {
            state.cards = state.cards.filter(item => item.id !== card.id);
            saveCards();
            if (typeof closeModal === 'function') closeModal();
            else form.closest('.modal-fallback')?.remove();
            showNextCard(true);
          }
        });
      }
    }

    function createCollection(name){
      const trimmed = name.trim();
      if (!trimmed) return null;
      const id = createId('col');
      state.collections.push({ id, name: trimmed, createdAt: Date.now() });
      saveCollections();
      renderCollections();
      return id;
    }

    function openCollectionManager(){
      const counts = countByCollection();
      const list = state.collections.map(col => `
        <li data-id="${escapeHTML(col.id)}">
          <span class="flashcards-modal__list-name">${escapeHTML(col.name)}</span>
          <span class="flashcards-modal__list-count">${counts[col.id] || 0}</span>
          <div class="flashcards-modal__list-actions">
            <button type="button" data-action="rename" data-id="${escapeHTML(col.id)}">${escapeHTML(t('manageRename'))}</button>
            <button type="button" data-action="delete" data-id="${escapeHTML(col.id)}">${escapeHTML(t('manageDelete'))}</button>
          </div>
        </li>`).join('');
      const modal = `
        <section class="flashcards-modal" id="flashcardsManageModal">
          <h3>${escapeHTML(t('manageTitle'))}</h3>
          <ul class="flashcards-modal__list">${list || `<li>${escapeHTML(t('manageEmpty'))}</li>`}</ul>
          <form id="flashcardsNewCollection" class="flashcards-modal__form">
            <label>${escapeHTML(t('manageAddLabel'))}
              <input type="text" name="name" placeholder="${escapeHTML(t('manageAddPlaceholder'))}" required minlength="2">
            </label>
            <button type="submit" class="btn-primary">${escapeHTML(t('manageAddButton'))}</button>
          </form>
          <div class="flashcards-modal__actions">
            <button type="button" class="btn-secondary" data-close>${escapeHTML(t('close'))}</button>
          </div>
        </section>
      `;
      if (typeof showModal === 'function') {
        showModal(modal);
      } else {
        const container = document.createElement('div');
        container.className = 'modal-fallback';
        container.innerHTML = modal;
        document.body.appendChild(container);
      }
      const panel = document.getElementById('flashcardsManageModal');
      if (!panel) return;
      const closeBtn = panel.querySelector('[data-close]');
      closeBtn?.addEventListener('click', () => {
        if (typeof closeModal === 'function') closeModal();
        else panel.closest('.modal-fallback')?.remove();
      });
      const listEl = panel.querySelector('.flashcards-modal__list');
      listEl?.addEventListener('click', (event) => {
        const target = event.target.closest('button[data-action]');
        if (!target) return;
        const action = target.getAttribute('data-action');
        const id = target.getAttribute('data-id');
        const col = state.collections.find(item => item.id === id);
        if (!col) return;
        if (action === 'rename') {
          const newName = prompt(t('renamePrompt', col.name), col.name);
          if (!newName || !newName.trim()) return;
          col.name = newName.trim();
          saveCollections();
          renderCollections();
          updateDiagnostics();
          if (typeof closeModal === 'function') closeModal();
          openCollectionManager();
        }
        if (action === 'delete') {
          const count = countByCollection()[col.id] || 0;
          if (state.collections.length === 1) {
            alert(t('manageKeepOne'));
            return;
          }
          if (confirm(t('manageDeleteConfirm', col.name, count))) {
            state.cards = state.cards.filter(card => card.collectionId !== col.id);
            state.collections = state.collections.filter(item => item.id !== col.id);
            if (state.prefs.lastCollectionId === col.id) {
              state.prefs.lastCollectionId = state.collections[0]?.id || null;
            }
            saveCollections();
            saveCards();
            renderCollections();
            updateDiagnostics();
            if (typeof closeModal === 'function') closeModal();
            else panel.closest('.modal-fallback')?.remove();
            showNextCard(true);
          }
        }
      });
      const form = document.getElementById('flashcardsNewCollection');
      form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = form.elements.namedItem('name').value.trim();
        if (!name) return;
        const id = createCollection(name);
        state.prefs.lastCollectionId = id;
        savePrefs();
        renderCollections();
        els.collectionSelect.value = id;
        if (typeof closeModal === 'function') closeModal();
        else panel.closest('.modal-fallback')?.remove();
        showNextCard(true);
      });
    }

    function resetAll(){
      if (!confirm(t('resetConfirm'))) return;
      Object.values(STORAGE).forEach(key => localStorage.removeItem(key));
      session.seenIds.clear();
      loadState();
      renderCollections();
      els.lang.value = state.prefs.lang;
      els.darkMode.checked = state.prefs.darkMode;
      els.search.value = state.prefs.search;
      toggleDarkMode(state.prefs.darkMode);
      applyLanguage();
      showNextCard(true);
    }

    function handleCollectionChange(){
      state.prefs.lastCollectionId = els.collectionSelect.value;
      savePrefs();
      showNextCard(true);
    }

    function handleSearch(event){
      state.prefs.search = event.target.value;
      savePrefs();
      showNextCard(true);
    }

    function handleLangChange(){
      state.prefs.lang = els.lang.value || 'ca';
      savePrefs();
      applyLanguage();
    }

    function handleKeydown(event){
      if (document.getElementById('view-home')?.classList.contains('hidden')) return;
      if (!session.pool.length) return;
      const target = event.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      switch (event.key) {
        case ' ':
        case 'Spacebar':
          event.preventDefault();
          flipCard();
          break;
        case 'f':
        case 'F':
          event.preventDefault();
          flipCard();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          gradeCard(false);
          break;
        case 'ArrowRight':
          event.preventDefault();
          gradeCard(true);
          break;
        case 'Enter':
          if (!els.next.disabled) {
            event.preventDefault();
            showNextCard(true);
          }
          break;
        default:
          break;
      }
    }

    function init(){
      loadState();
      els.lang.value = state.prefs.lang;
      els.darkMode.checked = state.prefs.darkMode;
      els.search.value = state.prefs.search;
      toggleDarkMode(state.prefs.darkMode);
      renderCollections();
      applyLanguage();
      showNextCard(true);
      document.addEventListener('keydown', handleKeydown);
      els.flip.addEventListener('click', flipCard);
      els.known.addEventListener('click', () => gradeCard(true));
      els.unknown.addEventListener('click', () => gradeCard(false));
      els.next.addEventListener('click', () => showNextCard(true));
      els.resetFilters.addEventListener('click', resetFilters);
      els.collectionSelect.addEventListener('change', handleCollectionChange);
      els.search.addEventListener('input', handleSearch);
      els.darkMode.addEventListener('change', () => toggleDarkMode(els.darkMode.checked));
      els.lang.addEventListener('change', handleLangChange);
      els.diagnosticsToggle.addEventListener('click', toggleDiagnostics);
      els.resetAll.addEventListener('click', resetAll);
      els.addCard.addEventListener('click', () => openCardModal(null));
      els.edit.addEventListener('click', () => session.currentCard && openCardModal(session.currentCard));
      els.manageCollections.addEventListener('click', openCollectionManager);
      els.markDoubt.addEventListener('click', () => {
        if (!session.currentCard) return;
        if (!session.currentCard.flagged && els.noteWrapper.hidden) {
          openNote();
        } else {
          toggleNote();
        }
      });
      els.noteInput.addEventListener('input', handleNoteChange);
      els.noteClose.addEventListener('click', closeNote);
    }

    init();
  });
})();
