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
        onboardingTitle: "Comença creant una col·lecció",
        onboardingDescription: "Afegeix la teva primera col·lecció o revisa l'exemple per veure com funcionen les flashcards.",
        onboardingAction: "Crea una col·lecció",
        onboardingExample: "Mostra l'exemple",
        onboardingDismiss: "Amaga aquest missatge",
        emptyNoCollections: "Encara no hi ha col·leccions disponibles. Crea'n una per començar a practicar.",
        close: "Tanca",
        resetConfirm: "Això esborrarà totes les flashcards i preferències locals. Vols continuar?",
        addCollectionPrompt: "Introdueix el nom de la nova col·lecció",
        renamePrompt: (name) => `Nou nom per a "${name}"`,
        toastSaved: "Canvis guardats",
        toastError: "No s'ha pogut guardar. Revisa els camps.",
        langCatalan: "Català",
        langSpanish: "Castellano",
        searchAria: "Filtra targetes per text",
        progressAnnounce: (front) => `Mostrant: ${front}`,
        toggleLargeText: "Text gran",
        toggleContrast: "Contrast alt",
        exportData: "📤 Exporta",
        importData: "📥 Importa",
        importSuccess: "Importació completada",
        importError: "No s'ha pogut importar. Verifica el fitxer.",
        importConfirm: "Això substituirà les col·leccions i targetes actuals pel contingut importat. Vols continuar?",
        summaryTitle: "Resum de la sessió",
        summaryStats: (known, unknown) => `Correctes: ${known} · Per repassar: ${unknown}`,
        summaryNone: "Fantàstic! No hi ha errors recents.",
        summaryUnknownTitle: "Targetes a reforçar",
        summaryRecommendation: "Repassa aquestes targetes i revisa el diagnòstic per més detalls.",
        summaryClose: "Entesos",
        backToTop: "⬆️ Torna al capçal",
        exampleCollectionName: "Exemple: hàbits d'estudi",
        exampleCards: [
          { front: "Què és la tècnica Pomodoro?", back: "Mètode d'estudi que alterna 25 minuts de treball concentrat i 5 de descans." },
          { front: "Quina és una bona pràctica abans d'una prova?", back: "Fer un repàs actiu amb flashcards i identificar els conceptes amb més dubtes." }
        ],
        sessionComplete: "Has repassat totes les targetes disponibles d'aquesta col·lecció."
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
        onboardingTitle: "Empieza creando una colección",
        onboardingDescription: "Añade tu primera colección o revisa el ejemplo para entender cómo funcionan las flashcards.",
        onboardingAction: "Crea una colección",
        onboardingExample: "Ver el ejemplo",
        onboardingDismiss: "Ocultar este mensaje",
        emptyNoCollections: "Todavía no hay colecciones disponibles. Crea una para comenzar a practicar.",
        close: "Cerrar",
        resetConfirm: "Esto borrará todas las flashcards y preferencias locales. ¿Quieres continuar?",
        addCollectionPrompt: "Introduce el nombre de la nueva colección",
        renamePrompt: (name) => `Nuevo nombre para \"${name}\"`,
        toastSaved: "Cambios guardados",
        toastError: "No se ha podido guardar. Revisa los campos.",
        langCatalan: "Català",
        langSpanish: "Castellano",
        searchAria: "Filtra tarjetas por texto",
        progressAnnounce: (front) => `Mostrando: ${front}`,
        toggleLargeText: "Texto grande",
        toggleContrast: "Alto contraste",
        exportData: "📤 Exportar",
        importData: "📥 Importar",
        importSuccess: "Importación completada",
        importError: "No se pudo importar. Revisa el archivo.",
        importConfirm: "Esto sustituirá las colecciones y tarjetas actuales por el contenido importado. ¿Quieres continuar?",
        summaryTitle: "Resumen de la sesión",
        summaryStats: (known, unknown) => `Correctas: ${known} · A repasar: ${unknown}`,
        summaryNone: "¡Genial! No hay errores recientes.",
        summaryUnknownTitle: "Tarjetas a reforzar",
        summaryRecommendation: "Revisa estas tarjetas y consulta el diagnóstico para más detalles.",
        summaryClose: "Entendido",
        backToTop: "⬆️ Volver al inicio",
        exampleCollectionName: "Ejemplo: hábitos de estudio",
        exampleCards: [
          { front: "¿Qué es la técnica Pomodoro?", back: "Método de estudio que alterna 25 minutos de trabajo concentrado y 5 de descanso." },
          { front: "¿Qué es recomendable antes de un examen?", back: "Realizar un repaso activo con flashcards e identificar los conceptos con más dudas." }
        ],
        sessionComplete: "Has repasado todas las tarjetas disponibles de esta colección."
      }
    };

    const state = {
      collections: [],
      cards: [],
      prefs: {
        darkMode: false,
        lang: 'ca',
        lastCollectionId: null,
        search: '',
        largeText: false,
        highContrast: false,
        onboardingDismissed: false,
        exampleCollectionId: null
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
      seenIds: new Set(),
      stats: {
        known: 0,
        unknown: 0,
        misses: new Map()
      },
      summaryShown: false
    };

    let announceTimer = null;

    const els = {
      subtitle: document.getElementById('flashcards-subtitle'),
      collectionSelect: document.getElementById('flashcardsCollection'),
      search: document.getElementById('flashcardsSearch'),
      darkMode: document.getElementById('flashcardsDarkMode'),
      largeText: document.getElementById('flashcardsLargeText'),
      highContrast: document.getElementById('flashcardsHighContrast'),
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
      noteClose: document.getElementById('flashcardCloseNote'),
      onboarding: document.getElementById('flashcardsOnboarding'),
      onboardingTitle: document.getElementById('flashcardsOnboardingTitle'),
      onboardingDescription: document.getElementById('flashcardsOnboardingDescription'),
      onboardingAction: document.getElementById('flashcardsOnboardingCreate'),
      onboardingExample: document.getElementById('flashcardsOnboardingExample'),
      onboardingDismiss: document.getElementById('flashcardsOnboardingDismiss'),
      summary: document.getElementById('flashcardsSummary'),
      summaryTitle: document.getElementById('flashcardsSummaryTitle'),
      summaryStats: document.getElementById('flashcardsSummaryStats'),
      summaryList: document.getElementById('flashcardsSummaryList'),
      summaryNote: document.getElementById('flashcardsSummaryNote'),
      summaryClose: document.getElementById('flashcardsSummaryClose'),
      exportBtn: document.getElementById('flashcardsExport'),
      importBtn: document.getElementById('flashcardsImport'),
      importInput: document.getElementById('flashcardsImportInput'),
      backToTop: document.getElementById('flashcardsBackToTop')
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
      state.prefs.largeText = Boolean(state.prefs.largeText);
      state.prefs.highContrast = Boolean(state.prefs.highContrast);
      state.prefs.onboardingDismissed = Boolean(state.prefs.onboardingDismissed);
      state.prefs.exampleCollectionId = state.collections.some(col => col.id === state.prefs.exampleCollectionId) ? state.prefs.exampleCollectionId : null;
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
      const locale = strings[state.prefs.lang] || strings.ca;
      const cards = Array.isArray(locale.exampleCards) && locale.exampleCards.length ? locale.exampleCards : strings.ca.exampleCards;
      state.collections = [{ id: collectionId, name: locale.exampleCollectionName || 'Col·lecció d\'exemple', createdAt: now }];
      state.cards = cards.map(sample => ({
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
      state.prefs.exampleCollectionId = collectionId;
      state.prefs.onboardingDismissed = false;
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
      const largeTextNode = root.querySelector('[data-i18n="largeText"]');
      if (largeTextNode) largeTextNode.textContent = t('toggleLargeText');
      const contrastNode = root.querySelector('[data-i18n="contrast"]');
      if (contrastNode) contrastNode.textContent = t('toggleContrast');
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
      if (els.exportBtn) {
        els.exportBtn.textContent = t('exportData');
      }
      if (els.importBtn) {
        els.importBtn.textContent = t('importData');
      }
      if (els.backToTop) {
        els.backToTop.textContent = t('backToTop');
      }
      if (els.onboardingTitle) els.onboardingTitle.textContent = t('onboardingTitle');
      if (els.onboardingDescription) els.onboardingDescription.textContent = t('onboardingDescription');
      if (els.onboardingAction) els.onboardingAction.textContent = t('onboardingAction');
      if (els.onboardingExample) els.onboardingExample.textContent = t('onboardingExample');
      if (els.onboardingDismiss) els.onboardingDismiss.textContent = t('onboardingDismiss');
      if (els.summaryTitle) els.summaryTitle.textContent = t('summaryTitle');
      if (els.summaryClose) els.summaryClose.textContent = t('summaryClose');
      if (!els.summary.hidden) {
        if (els.summaryStats) els.summaryStats.textContent = t('summaryStats', session.stats.known, session.stats.unknown);
        if (els.summaryNote) els.summaryNote.textContent = session.stats.unknown ? t('summaryRecommendation') : '';
        renderSessionSummary({ silent: true });
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
      updateOnboarding();
    }

    function renderCollections(){
      const previousCollection = state.prefs.lastCollectionId;
      const counts = countByCollection();
      if (!state.collections.length) {
        if (els.collectionSelect) {
          els.collectionSelect.innerHTML = '';
          els.collectionSelect.disabled = true;
        }
        if (els.search) els.search.disabled = true;
        if (els.addCard) els.addCard.disabled = true;
        if (els.manageCollections) els.manageCollections.disabled = false;
        state.prefs.lastCollectionId = null;
      } else {
        const options = state.collections.map(col => {
          const count = counts[col.id] || 0;
          const label = `${col.name} (${count})`;
          return `<option value="${escapeHTML(col.id)}">${escapeHTML(label)}</option>`;
        }).join('');
        if (els.collectionSelect) {
          els.collectionSelect.innerHTML = options;
          els.collectionSelect.disabled = false;
        }
        if (els.search) els.search.disabled = false;
        if (els.addCard) els.addCard.disabled = false;
        if (els.manageCollections) els.manageCollections.disabled = false;
        if (state.prefs.lastCollectionId && els.collectionSelect) {
          els.collectionSelect.value = state.prefs.lastCollectionId;
        } else {
          const fallbackId = state.collections[0]?.id || null;
          state.prefs.lastCollectionId = fallbackId;
          if (fallbackId && els.collectionSelect) {
            els.collectionSelect.value = fallbackId;
          }
        }
      }
      updateOnboarding();
      if (state.prefs.lastCollectionId !== previousCollection) {
        savePrefs();
      }
    }

    function updateOnboarding(){
      if (!els.onboarding) return;
      const hasCollections = state.collections.length > 0;
      const hasCustom = state.collections.some(col => col.id !== state.prefs.exampleCollectionId);
      const shouldShow = !state.prefs.onboardingDismissed && (!hasCollections || !hasCustom);
      els.onboarding.hidden = !shouldShow;
      els.onboarding.setAttribute('aria-hidden', String(!shouldShow));
      if (els.onboardingExample) {
        const hasExample = Boolean(state.prefs.exampleCollectionId && state.collections.some(col => col.id === state.prefs.exampleCollectionId));
        els.onboardingExample.hidden = !hasExample;
      }
    }

    function buildPool(){
      const collectionId = state.prefs.lastCollectionId;
      if (!collectionId) {
        session.pool = [];
        session.filteredCount = 0;
        session.totalInCollection = 0;
        session.currentCard = null;
        return;
      }
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
        const message = state.collections.length ? t('empty') : t('emptyNoCollections');
        els.front.innerHTML = escapeHTML(message);
        els.back.innerHTML = escapeHTML(message);
        if (els.noteWrapper) els.noteWrapper.hidden = true;
        hideSessionSummary();
      }
    }

    function hideSessionSummary(){
      if (!els.summary) return;
      els.summary.hidden = true;
      els.summary.setAttribute('aria-hidden', 'true');
      if (els.summaryList) els.summaryList.innerHTML = '';
      if (els.summaryStats) els.summaryStats.textContent = '';
      if (els.summaryNote) els.summaryNote.textContent = '';
    }

    function renderSessionSummary(options = {}){
      if (!els.summary) return;
      const silent = Boolean(options.silent);
      const misses = Array.from(session.stats.misses.values()).sort((a, b) => b.count - a.count).slice(0, 3);
      els.summaryTitle.textContent = t('summaryTitle');
      els.summaryStats.textContent = t('summaryStats', session.stats.known, session.stats.unknown);
      if (!session.stats.unknown) {
        els.summaryList.innerHTML = `<li>${escapeHTML(t('summaryNone'))}</li>`;
      } else {
        els.summaryList.innerHTML = misses.map(item => `
          <li><strong>${escapeHTML(item.front || '')}</strong><br><small>${escapeHTML(item.back || '')}</small></li>
        `).join('');
      }
      if (els.summaryNote) {
        els.summaryNote.textContent = session.stats.unknown ? t('summaryRecommendation') : '';
      }
      els.summary.hidden = false;
      els.summary.setAttribute('aria-hidden', 'false');
      if (!silent) {
        els.summary.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        els.feedback.textContent = t('sessionComplete');
      }
    }

    function maybeShowSessionSummary(){
      if (session.summaryShown) return;
      if (!session.filteredCount) return;
      if (session.seenIds.size < session.filteredCount) return;
      session.summaryShown = true;
      renderSessionSummary();
    }

    function resetSessionTracking(){
      session.seenIds.clear();
      session.stats = { known: 0, unknown: 0, misses: new Map() };
      session.summaryShown = false;
      hideSessionSummary();
    }

    function scrollToTop(){
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function exportData(){
      const payload = {
        collections: state.collections,
        cards: state.cards,
        prefs: state.prefs,
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `focusquiz-flashcards-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      requestAnimationFrame(() => {
        URL.revokeObjectURL(url);
        anchor.remove();
      });
    }

    function triggerImport(){
      if (!els.importInput) return;
      if (!confirm(t('importConfirm'))) return;
      els.importInput.value = '';
      els.importInput.click();
    }

    function handleImportFile(event){
      const input = event.target;
      const file = input?.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const raw = reader.result;
          const data = typeof raw === 'string' ? JSON.parse(raw) : null;
          if (!data || !Array.isArray(data.collections) || !Array.isArray(data.cards)) {
            throw new Error('invalid payload');
          }
          const nextPrefs = data.prefs && typeof data.prefs === 'object' ? { ...state.prefs, ...data.prefs } : { ...state.prefs };
          saveJSON(STORAGE.collections, data.collections);
          saveJSON(STORAGE.cards, data.cards);
          saveJSON(STORAGE.prefs, nextPrefs);
          loadState();
          resetSessionTracking();
          renderCollections();
          els.lang.value = state.prefs.lang;
          els.search.value = state.prefs.search;
          toggleDarkMode(state.prefs.darkMode, false);
          toggleLargeText(state.prefs.largeText, false);
          toggleHighContrast(state.prefs.highContrast, false);
          if (els.largeText) els.largeText.checked = state.prefs.largeText;
          if (els.highContrast) els.highContrast.checked = state.prefs.highContrast;
          applyLanguage();
          showNextCard(true);
          alert(t('importSuccess'));
        } catch (error) {
          console.error('flashcards import error', error);
          alert(t('importError'));
          loadState();
          renderCollections();
          applyLanguage();
          showNextCard(true);
        } finally {
          input.value = '';
        }
      };
      reader.onerror = () => {
        alert(t('importError'));
        input.value = '';
      };
      reader.readAsText(file);
    }

    function selectExampleCollection(){
      if (!state.prefs.exampleCollectionId) return;
      if (!state.collections.some(col => col.id === state.prefs.exampleCollectionId)) return;
      state.prefs.lastCollectionId = state.prefs.exampleCollectionId;
      state.prefs.onboardingDismissed = true;
      savePrefs();
      if (els.collectionSelect) els.collectionSelect.value = state.prefs.lastCollectionId;
      resetSessionTracking();
      showNextCard(true);
      updateOnboarding();
      scrollToTop();
    }

    function dismissOnboarding(){
      state.prefs.onboardingDismissed = true;
      savePrefs();
      updateOnboarding();
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
        session.stats.known += 1;
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
        session.stats.unknown += 1;
        spaced.repetitions = 0;
        spaced.interval = 1;
        spaced.ease = Math.max(1.3, (spaced.ease || 2.5) - 0.2);
        spaced.lastGrade = 'unknown';
        card.flagged = true;
        els.feedback.textContent = t('feedbackUnknown');
        const record = session.stats.misses.get(card.id) || { front: card.front, back: card.back, count: 0 };
        record.front = card.front;
        record.back = card.back;
        record.count += 1;
        session.stats.misses.set(card.id, record);
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
      maybeShowSessionSummary();
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
      resetSessionTracking();
      scrollToTop();
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

    function toggleDarkMode(on, persist = true){
      state.prefs.darkMode = on;
      root.classList.toggle('flashcards--dark', on);
      if (els.darkMode) els.darkMode.checked = on;
      if (persist) savePrefs();
    }

    function toggleLargeText(on, persist = true){
      state.prefs.largeText = on;
      root.classList.toggle('flashcards--large-text', on);
      if (els.largeText) els.largeText.checked = on;
      if (persist) savePrefs();
    }

    function toggleHighContrast(on, persist = true){
      state.prefs.highContrast = on;
      root.classList.toggle('flashcards--high-contrast', on);
      if (els.highContrast) els.highContrast.checked = on;
      if (persist) savePrefs();
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
        resetSessionTracking();
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
            resetSessionTracking();
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
      state.prefs.onboardingDismissed = true;
      savePrefs();
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
            if (state.prefs.exampleCollectionId === col.id) {
              state.prefs.exampleCollectionId = null;
            }
            saveCollections();
            saveCards();
            savePrefs();
            renderCollections();
            updateDiagnostics();
            if (typeof closeModal === 'function') closeModal();
            else panel.closest('.modal-fallback')?.remove();
            resetSessionTracking();
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
        resetSessionTracking();
        showNextCard(true);
      });
    }

    function resetAll(){
      if (!confirm(t('resetConfirm'))) return;
      Object.values(STORAGE).forEach(key => localStorage.removeItem(key));
      loadState();
      resetSessionTracking();
      renderCollections();
      els.lang.value = state.prefs.lang;
      els.search.value = state.prefs.search;
      toggleDarkMode(state.prefs.darkMode, false);
      toggleLargeText(state.prefs.largeText, false);
      toggleHighContrast(state.prefs.highContrast, false);
      if (els.largeText) els.largeText.checked = state.prefs.largeText;
      if (els.highContrast) els.highContrast.checked = state.prefs.highContrast;
      applyLanguage();
      showNextCard(true);
    }

    function handleCollectionChange(){
      state.prefs.lastCollectionId = els.collectionSelect.value || null;
      savePrefs();
      resetSessionTracking();
      showNextCard(true);
      scrollToTop();
    }

    function handleSearch(event){
      state.prefs.search = event.target.value;
      savePrefs();
      resetSessionTracking();
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
        case 'ArrowDown':
        case 'ArrowUp':
          if (!els.next.disabled) {
            event.preventDefault();
            showNextCard(true);
          }
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
      els.search.value = state.prefs.search;
      toggleDarkMode(state.prefs.darkMode, false);
      toggleLargeText(state.prefs.largeText, false);
      toggleHighContrast(state.prefs.highContrast, false);
      if (els.largeText) els.largeText.checked = state.prefs.largeText;
      if (els.highContrast) els.highContrast.checked = state.prefs.highContrast;
      resetSessionTracking();
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
      els.largeText?.addEventListener('change', () => toggleLargeText(els.largeText.checked));
      els.highContrast?.addEventListener('change', () => toggleHighContrast(els.highContrast.checked));
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
      els.exportBtn?.addEventListener('click', exportData);
      els.importBtn?.addEventListener('click', triggerImport);
      els.importInput?.addEventListener('change', handleImportFile);
      els.backToTop?.addEventListener('click', scrollToTop);
      els.onboardingAction?.addEventListener('click', () => {
        state.prefs.onboardingDismissed = true;
        savePrefs();
        openCollectionManager();
      });
      els.onboardingExample?.addEventListener('click', selectExampleCollection);
      els.onboardingDismiss?.addEventListener('click', dismissOnboarding);
      els.summaryClose?.addEventListener('click', () => {
        hideSessionSummary();
        els.feedback.textContent = '';
      });
    }

    init();
  });
})();
