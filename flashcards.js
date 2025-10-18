(function(){
  function extend(target){
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      if (!source) continue;
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  }

  function clone(obj){
    return JSON.parse(JSON.stringify(obj));
  }

  function uuid(prefix){
    prefix = prefix || 'id';
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return prefix + '-' + crypto.randomUUID();
    }
    var random = Math.random().toString(16).slice(2);
    var time = Date.now().toString(16);
    return prefix + '-' + random + time;
  }

  function escapeHTML(value){
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  document.addEventListener('DOMContentLoaded', function(){
    var root = document.getElementById('flashcards');
    if (!root) return;

    var STORAGE_COLLECTIONS = 'fq_flashcards_collections';
    var STORAGE_CARDS = 'fq_flashcards_cards';
    var STORAGE_PREFS = 'fq_flashcards_prefs';

    var strings = {
      ca: {
        title: "Flashcards d'estudi",
        subtitle: "Repàs actiu amb repetició espaiada i memòria local.",
        collectionLabel: "Col·lecció",
        searchLabel: "Cerca",
        searchPlaceholder: "Filtra per text",
        flipShow: "Mostra resposta",
        flipHide: "Mostra pregunta",
        unknown: "👎 No ho sabia",
        known: "👍 Ho sabia",
        next: "Següent",
        counter: function(seen, total){ return seen + ' / ' + total + ' targetes vistes'; },
        learned: function(pct){ return pct + '% après'; },
        empty: "No hi ha targetes disponibles.",
        addCard: "+ Nova targeta",
        editCard: "Edita",
        deleteCard: "Esborra",
        cancel: "Cancel·la",
        save: "Desa",
        frontLabel: "Anvers",
        backLabel: "Revers",
        modalNewTitle: "Nova targeta",
        modalEditTitle: "Edita la targeta",
        collectionManager: "Gestiona col·leccions",
        createCollection: "Nova col·lecció",
        rename: "Canvia nom",
        remove: "Esborra",
        confirmDeleteCard: "Vols eliminar aquesta targeta?",
        confirmDeleteCollection: function(name){ return 'Vols eliminar la col·lecció "' + name + '"?'; },
        promptCollectionName: "Nom de la col·lecció",
        promptCardFront: "Text de l'anvers",
        promptCardBack: "Text del revers",
        sessionComplete: "Has repassat totes les targetes." ,
        onboarding: "Crea una col·lecció i afegeix targetes per començar.",
        onboardingAction: "Crea una col·lecció",
        onboardingExample: "Mostra l'exemple",
        onboardingDismiss: "Amaga aquest missatge"
      },
      es: {
        title: "Flashcards de estudio",
        subtitle: "Repaso activo con repetición espaciada y memoria local.",
        collectionLabel: "Colección",
        searchLabel: "Búsqueda",
        searchPlaceholder: "Filtra por texto",
        flipShow: "Mostrar respuesta",
        flipHide: "Mostrar pregunta",
        unknown: "👎 No lo sabía",
        known: "👍 Sí lo sabía",
        next: "Siguiente",
        counter: function(seen, total){ return seen + ' / ' + total + ' tarjetas vistas'; },
        learned: function(pct){ return pct + '% aprendido'; },
        empty: "No hay tarjetas disponibles.",
        addCard: "+ Nueva tarjeta",
        editCard: "Editar",
        deleteCard: "Eliminar",
        cancel: "Cancelar",
        save: "Guardar",
        frontLabel: "Anverso",
        backLabel: "Reverso",
        modalNewTitle: "Nueva tarjeta",
        modalEditTitle: "Editar tarjeta",
        collectionManager: "Gestionar colecciones",
        createCollection: "Nueva colección",
        rename: "Renombrar",
        remove: "Eliminar",
        confirmDeleteCard: "¿Quieres eliminar esta tarjeta?",
        confirmDeleteCollection: function(name){ return '¿Quieres eliminar la colección "' + name + '"?'; },
        promptCollectionName: "Nombre de la colección",
        promptCardFront: "Texto del anverso",
        promptCardBack: "Texto del reverso",
        sessionComplete: "Has repasado todas las tarjetas.",
        onboarding: "Crea una colección y añade tarjetas para empezar.",
        onboardingAction: "Crea una colección",
        onboardingExample: "Ver ejemplo",
        onboardingDismiss: "Ocultar este mensaje"
      }
    };

    var state = {
      collections: [],
      cards: [],
      prefs: {
        lang: 'ca',
        lastCollectionId: null,
        search: '',
        darkMode: false,
        largeText: false,
        highContrast: false,
        onboardingDismissed: false
      }
    };

    var session = {
      pool: [],
      index: 0,
      current: null,
      flipped: false,
      seen: {},
      stats: {
        known: 0,
        unknown: 0
      }
    };

    var els = {
      title: document.getElementById('flashcards-title'),
      subtitle: document.getElementById('flashcards-subtitle'),
      collectionSelect: document.getElementById('flashcardsCollection'),
      search: document.getElementById('flashcardsSearch'),
      counter: document.getElementById('flashcardsCounter'),
      learned: document.getElementById('flashcardsLearned'),
      progress: root.querySelector('.flashcards__progress-bar i'),
      cardFront: document.getElementById('flashcardFront'),
      cardBack: document.getElementById('flashcardBack'),
      frontLabel: document.getElementById('flashcardFrontLabel'),
      backLabel: document.getElementById('flashcardBackLabel'),
      flip: document.getElementById('flashcardFlip'),
      next: document.getElementById('flashcardNext'),
      known: document.getElementById('flashcardKnown'),
      unknown: document.getElementById('flashcardUnknown'),
      card: document.getElementById('flashcardInner'),
      empty: document.getElementById('flashcardsEmpty'),
      emptyText: document.getElementById('flashcardsEmpty') ? document.getElementById('flashcardsEmpty').querySelector('p') : null,
      resetFilters: document.getElementById('flashcardsResetFilters'),
      addCard: document.getElementById('flashcardsAddCard'),
      manageCollections: document.getElementById('flashcardsManageCollections'),
      feedback: document.getElementById('flashcardsFeedback'),
      markDoubt: document.getElementById('flashcardMarkDoubt'),
      editCard: document.getElementById('flashcardEdit'),
      lang: document.getElementById('flashcardsLang'),
      darkMode: document.getElementById('flashcardsDarkMode'),
      largeText: document.getElementById('flashcardsLargeText'),
      highContrast: document.getElementById('flashcardsHighContrast'),
      diagnosticsToggle: document.getElementById('flashcardsDiagnosticsToggle'),
      diagnostics: document.getElementById('flashcardsDiagnostics'),
      diagCollections: document.getElementById('flashcardsDiagCollections'),
      diagPool: document.getElementById('flashcardsDiagPool'),
      resetAll: document.getElementById('flashcardsResetAll'),
      onboarding: document.getElementById('flashcardsOnboarding'),
      onboardingText: document.getElementById('flashcardsOnboardingDescription'),
      onboardingAction: document.getElementById('flashcardsOnboardingCreate'),
      onboardingExample: document.getElementById('flashcardsOnboardingExample'),
      onboardingDismiss: document.getElementById('flashcardsOnboardingDismiss')
    };

    function t(key){
      var lang = state.prefs.lang || 'ca';
      var dict = strings[lang] || strings.ca;
      if (typeof dict[key] === 'function') {
        var args = Array.prototype.slice.call(arguments, 1);
        return dict[key].apply(null, args);
      }
      if (dict[key] !== undefined) return dict[key];
      var fallback = strings.ca[key];
      if (typeof fallback === 'function') {
        var argsFallback = Array.prototype.slice.call(arguments, 1);
        return fallback.apply(null, argsFallback);
      }
      return fallback || key;
    }

    function loadJSON(key, fallback){
      try {
        var raw = localStorage.getItem(key);
        if (!raw) return fallback;
        var parsed = JSON.parse(raw);
        return parsed || fallback;
      } catch (err) {
        console.warn('flashcards load error', key, err);
        return fallback;
      }
    }

    function saveJSON(key, value){
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.warn('flashcards save error', key, err);
      }
    }

    function seedExample(){
      var collectionId = uuid('col');
      state.collections = [{ id: collectionId, name: 'Hàbits d\'estudi', createdAt: Date.now() }];
      state.cards = [
        { id: uuid('card'), collectionId: collectionId, front: 'Què és la tècnica Pomodoro?', back: '25 minuts d\'estudi i 5 de descans repetits.', createdAt: Date.now(), updatedAt: Date.now(), flagged: false },
        { id: uuid('card'), collectionId: collectionId, front: 'Per què serveixen les flashcards?', back: 'Per repassar activament i detectar dubtes.', createdAt: Date.now(), updatedAt: Date.now(), flagged: false }
      ];
      state.prefs.lastCollectionId = collectionId;
    }

    function loadState(){
      state.collections = loadJSON(STORAGE_COLLECTIONS, []);
      state.cards = loadJSON(STORAGE_CARDS, []);
      var prefs = loadJSON(STORAGE_PREFS, {});
      state.prefs = extend({}, state.prefs, prefs);
      state.prefs.darkMode = !!state.prefs.darkMode;
      state.prefs.largeText = !!state.prefs.largeText;
      state.prefs.highContrast = !!state.prefs.highContrast;
      state.prefs.onboardingDismissed = !!state.prefs.onboardingDismissed;

      if (!state.collections || !state.collections.length) {
        seedExample();
        saveCollections();
        saveCards();
        savePrefs();
      } else {
        var keep = [];
        for (var i = 0; i < state.collections.length; i++) {
          var col = state.collections[i];
          if (col && col.id && col.name) keep.push(col);
        }
        state.collections = keep;
      }
      if (!state.cards) state.cards = [];
      var seenCollection = false;
      for (var j = 0; j < state.collections.length; j++) {
        if (state.collections[j].id === state.prefs.lastCollectionId) {
          seenCollection = true;
          break;
        }
      }
      if (!seenCollection) {
        state.prefs.lastCollectionId = state.collections.length ? state.collections[0].id : null;
      }
    }

    function saveCollections(){ saveJSON(STORAGE_COLLECTIONS, state.collections); }
    function saveCards(){ saveJSON(STORAGE_CARDS, state.cards); }
    function savePrefs(){ saveJSON(STORAGE_PREFS, state.prefs); }

    function activeLangDict(){
      return strings[state.prefs.lang] || strings.ca;
    }

    function applyLanguage(){
      var dict = activeLangDict();
      if (els.title) els.title.textContent = dict.title;
      if (els.subtitle) els.subtitle.textContent = dict.subtitle;
      var labelCollection = root.querySelector('[data-i18n="collection"]');
      if (labelCollection) labelCollection.textContent = dict.collectionLabel;
      var labelSearch = root.querySelector('[data-i18n="search"]');
      if (labelSearch) labelSearch.textContent = dict.searchLabel;
      if (els.search) els.search.placeholder = dict.searchPlaceholder;
      if (els.flip) els.flip.textContent = session.flipped ? dict.flipHide : dict.flipShow;
      if (els.known) els.known.textContent = dict.known;
      if (els.unknown) els.unknown.textContent = dict.unknown;
      if (els.next) els.next.textContent = dict.next;
      if (els.frontLabel) els.frontLabel.textContent = dict.frontLabel;
      if (els.backLabel) els.backLabel.textContent = dict.backLabel;
      if (els.addCard) els.addCard.textContent = dict.addCard;
      if (els.manageCollections) els.manageCollections.textContent = dict.collectionManager;
      if (els.emptyText) els.emptyText.textContent = dict.empty;
      if (els.onboardingText) els.onboardingText.textContent = dict.onboarding;
      if (els.onboardingAction && dict.onboardingAction) els.onboardingAction.textContent = dict.onboardingAction;
      if (els.onboardingExample && dict.onboardingExample) els.onboardingExample.textContent = dict.onboardingExample;
      if (els.onboardingDismiss && dict.onboardingDismiss) els.onboardingDismiss.textContent = dict.onboardingDismiss;
      updateProgress();
    }

    function collectionCounts(){
      var map = {};
      for (var i = 0; i < state.cards.length; i++) {
        var card = state.cards[i];
        map[card.collectionId] = (map[card.collectionId] || 0) + 1;
      }
      return map;
    }

    function renderCollections(){
      if (!els.collectionSelect) return;
      var counts = collectionCounts();
      var html = '';
      for (var i = 0; i < state.collections.length; i++) {
        var col = state.collections[i];
        var value = counts[col.id] || 0;
        var label = col.name + ' (' + value + ')';
        html += '<option value="' + escapeHTML(col.id) + '">' + escapeHTML(label) + '</option>';
      }
      els.collectionSelect.innerHTML = html;
      if (state.prefs.lastCollectionId) {
        els.collectionSelect.value = state.prefs.lastCollectionId;
      }
      var hasCollections = state.collections.length > 0;
      els.collectionSelect.disabled = !hasCollections;
      if (els.search) els.search.disabled = !hasCollections;
      if (els.addCard) els.addCard.disabled = !hasCollections;
      if (els.manageCollections) els.manageCollections.disabled = !hasCollections;
      if (els.onboarding) {
        var show = !hasCollections && !state.prefs.onboardingDismissed;
        els.onboarding.hidden = !show;
        els.onboarding.setAttribute('aria-hidden', show ? 'false' : 'true');
      }
    }

    function filterCards(){
      session.pool = [];
      session.index = 0;
      session.current = null;
      session.flipped = false;
      var collectionId = state.prefs.lastCollectionId;
      if (!collectionId) return;
      var query = (state.prefs.search || '').toLowerCase();
      for (var i = 0; i < state.cards.length; i++) {
        var card = state.cards[i];
        if (card.collectionId !== collectionId) continue;
        if (query) {
          var text = (card.front || '') + ' ' + (card.back || '');
          if (text.toLowerCase().indexOf(query) === -1) continue;
        }
        session.pool.push(card);
      }
    }

    function updateProgress(){
      var collectionId = state.prefs.lastCollectionId;
      var total = 0;
      var learned = 0;
      var seen = 0;
      if (collectionId) {
        for (var i = 0; i < state.cards.length; i++) {
          var card = state.cards[i];
          if (card.collectionId !== collectionId) continue;
          total++;
          if (session.seen[card.id]) seen++;
          if (card.flagged) learned++;
        }
      }
      if (els.counter) els.counter.textContent = t('counter', seen, total);
      if (els.learned) {
        var pct = total ? Math.round((learned / total) * 100) : 0;
        els.learned.textContent = t('learned', pct);
        if (els.progress) els.progress.style.width = pct + '%';
      }
    }

    function showCard(){
      if (!session.pool.length) {
        session.current = null;
        if (els.cardFront) els.cardFront.textContent = '';
        if (els.cardBack) els.cardBack.textContent = '';
        if (els.card) els.card.classList.remove('is-flipped');
        if (els.empty) els.empty.hidden = false;
        if (els.flip) els.flip.disabled = true;
        if (els.next) els.next.disabled = true;
        if (els.known) els.known.disabled = true;
        if (els.unknown) els.unknown.disabled = true;
        return;
      }
      if (session.index >= session.pool.length) session.index = 0;
      session.current = session.pool[session.index];
      session.flipped = false;
      if (els.cardFront) els.cardFront.textContent = session.current.front || '';
      if (els.cardBack) els.cardBack.textContent = session.current.back || '';
      if (els.card) els.card.classList.remove('is-flipped');
      if (els.flip) {
        els.flip.disabled = false;
        els.flip.textContent = t('flipShow');
      }
      if (els.next) els.next.disabled = session.pool.length <= 1;
      if (els.known) els.known.disabled = true;
      if (els.unknown) els.unknown.disabled = true;
      if (els.empty) els.empty.hidden = true;
      if (els.feedback) els.feedback.textContent = '';
      if (els.markDoubt) {
        els.markDoubt.textContent = session.current.flagged ? '🔖' : '❓';
        els.markDoubt.setAttribute('aria-pressed', session.current.flagged ? 'true' : 'false');
      }
    }

    function nextCard(){
      if (!session.pool.length) return;
      session.index = (session.index + 1) % session.pool.length;
      showCard();
    }

    function flipCard(){
      if (!session.current) return;
      session.flipped = !session.flipped;
      if (els.card) els.card.classList.toggle('is-flipped', session.flipped);
      if (els.flip) els.flip.textContent = session.flipped ? t('flipHide') : t('flipShow');
      if (els.known) els.known.disabled = !session.flipped;
      if (els.unknown) els.unknown.disabled = !session.flipped;
    }

    function gradeCard(known){
      if (!session.current || !session.flipped) return;
      session.seen[session.current.id] = true;
      if (known) {
        session.stats.known += 1;
      } else {
        session.stats.unknown += 1;
        session.current.flagged = true;
        saveCards();
      }
      if (els.feedback) {
        els.feedback.textContent = known ? '✅' : 'Repassa de nou';
      }
      updateProgress();
      nextCard();
    }

    function resetFilters(){
      state.prefs.search = '';
      if (els.search) els.search.value = '';
      savePrefs();
      filterCards();
      showCard();
      updateDiagnostics();
    }

    function pickCollection(id){
      state.prefs.lastCollectionId = id || null;
      savePrefs();
      filterCards();
      showCard();
      updateProgress();
      updateDiagnostics();
    }

    function createCollection(){
      var name = prompt(t('promptCollectionName'));
      if (!name) return;
      name = name.trim();
      if (!name) return;
      var id = uuid('col');
      state.collections.push({ id: id, name: name, createdAt: Date.now() });
      saveCollections();
      state.prefs.onboardingDismissed = true;
      savePrefs();
      renderCollections();
      pickCollection(id);
    }

    function deleteCollection(id){
      var collection = null;
      for (var i = 0; i < state.collections.length; i++) {
        if (state.collections[i].id === id) {
          collection = state.collections[i];
          break;
        }
      }
      if (!collection) return;
      if (!confirm(t('confirmDeleteCollection', collection.name))) return;
      state.collections = state.collections.filter(function(col){ return col.id !== id; });
      state.cards = state.cards.filter(function(card){ return card.collectionId !== id; });
      saveCollections();
      saveCards();
      if (state.prefs.lastCollectionId === id) {
        state.prefs.lastCollectionId = state.collections.length ? state.collections[0].id : null;
      }
      savePrefs();
      renderCollections();
      filterCards();
      showCard();
      updateProgress();
      updateDiagnostics();
    }

    function renameCollection(id){
      var collection = null;
      for (var i = 0; i < state.collections.length; i++) {
        if (state.collections[i].id === id) {
          collection = state.collections[i];
          break;
        }
      }
      if (!collection) return;
      var name = prompt(t('promptCollectionName'), collection.name);
      if (!name) return;
      name = name.trim();
      if (!name) return;
      collection.name = name;
      saveCollections();
      renderCollections();
      updateDiagnostics();
    }

    function openCollectionManager(){
      if (typeof showModal !== 'function') {
        createCollection();
        return;
      }
      var html = '<section class="flashcards-modal" id="flashcardsManageModal"><h3>' + t('collectionManager') + '</h3>';
      html += '<button type="button" class="btn-primary" data-action="create">' + t('createCollection') + '</button>';
      html += '<ul class="flashcards-modal__list">';
      for (var i = 0; i < state.collections.length; i++) {
        var col = state.collections[i];
        html += '<li data-id="' + escapeHTML(col.id) + '">';
        html += '<span>' + escapeHTML(col.name) + '</span>';
        html += '<div class="flashcards-modal__list-actions">';
        html += '<button type="button" data-action="rename">' + t('rename') + '</button>';
        html += '<button type="button" data-action="delete">' + t('remove') + '</button>';
        html += '</div></li>';
      }
      html += '</ul>';
      html += '<div class="flashcards-modal__actions"><button type="button" data-close class="btn-secondary">' + t('cancel') + '</button></div>';
      html += '</section>';
      showModal(html);
      var panel = document.getElementById('flashcardsManageModal') || document.querySelector('.flashcards-modal');
      if (!panel) return;
      panel.addEventListener('click', function(event){
        var target = event.target;
        if (target.getAttribute('data-close') !== null) {
          if (typeof closeModal === 'function') closeModal();
          return;
        }
        var action = target.getAttribute('data-action');
        if (!action) return;
        if (action === 'create') {
          if (typeof closeModal === 'function') closeModal();
          createCollection();
        } else {
          var item = target.closest('li');
          if (!item) return;
          var id = item.getAttribute('data-id');
          if (action === 'rename') {
            renameCollection(id);
          } else if (action === 'delete') {
            deleteCollection(id);
          }
          if (typeof closeModal === 'function') closeModal();
        }
      });
    }

    function openCardModal(card){
      var editing = !!card;
      if (!editing) {
        card = { front: '', back: '', collectionId: state.prefs.lastCollectionId };
      }
      if (typeof showModal !== 'function') {
        var frontPrompt = prompt(t('promptCardFront'), card.front || '');
        if (!frontPrompt) return;
        var backPrompt = prompt(t('promptCardBack'), card.back || '');
        if (!backPrompt) return;
        saveCard(editing ? card.id : null, frontPrompt, backPrompt, card.collectionId);
        return;
      }
      var html = '<section class="flashcards-modal" id="flashcardsCardModal">';
      html += '<h3>' + (editing ? t('modalEditTitle') : t('modalNewTitle')) + '</h3>';
      html += '<form id="flashcardsCardForm">';
      html += '<label>' + t('frontLabel') + '<textarea name="front" required rows="3">' + escapeHTML(card.front || '') + '</textarea></label>';
      html += '<label>' + t('backLabel') + '<textarea name="back" required rows="3">' + escapeHTML(card.back || '') + '</textarea></label>';
      html += '<label>' + t('collectionLabel') + '<select name="collection" required>';
      for (var i = 0; i < state.collections.length; i++) {
        var col = state.collections[i];
        var selected = card.collectionId === col.id ? ' selected' : '';
        html += '<option value="' + escapeHTML(col.id) + '"' + selected + '>' + escapeHTML(col.name) + '</option>';
      }
      html += '</select></label>';
      html += '<div class="flashcards-modal__actions">';
      html += '<button type="submit" class="btn-primary">' + t('save') + '</button>';
      if (editing) {
        html += '<button type="button" data-delete class="btn-danger">' + t('deleteCard') + '</button>';
      }
      html += '<button type="button" data-close class="btn-secondary">' + t('cancel') + '</button>';
      html += '</div></form></section>';
      showModal(html);
      var form = document.getElementById('flashcardsCardForm');
      if (!form) return;
      form.addEventListener('submit', function(event){
        event.preventDefault();
        var front = form.elements.front.value.trim();
        var back = form.elements.back.value.trim();
        var collectionId = form.elements.collection.value;
        if (!front || !back || !collectionId) return;
        saveCard(editing ? card.id : null, front, back, collectionId);
        if (typeof closeModal === 'function') closeModal();
      });
      var closeBtn = form.querySelector('[data-close]');
      if (closeBtn) closeBtn.addEventListener('click', function(){
        if (typeof closeModal === 'function') closeModal();
      });
      var deleteBtn = form.querySelector('[data-delete]');
      if (deleteBtn) deleteBtn.addEventListener('click', function(){
        if (!confirm(t('confirmDeleteCard'))) return;
        removeCard(card.id);
        if (typeof closeModal === 'function') closeModal();
      });
    }

    function saveCard(id, front, back, collectionId){
      if (id) {
        for (var i = 0; i < state.cards.length; i++) {
          if (state.cards[i].id === id) {
            state.cards[i].front = front;
            state.cards[i].back = back;
            state.cards[i].collectionId = collectionId;
            state.cards[i].updatedAt = Date.now();
            break;
          }
        }
      } else {
        state.cards.push({
          id: uuid('card'),
          collectionId: collectionId,
          front: front,
          back: back,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          flagged: false
        });
      }
      saveCards();
      renderCollections();
      filterCards();
      showCard();
      updateProgress();
      updateDiagnostics();
    }

    function removeCard(id){
      state.cards = state.cards.filter(function(card){ return card.id !== id; });
      saveCards();
      filterCards();
      showCard();
      updateProgress();
      updateDiagnostics();
    }

    function toggleDiagnostics(){
      if (!els.diagnostics) return;
      var hidden = !els.diagnostics.hidden;
      els.diagnostics.hidden = hidden;
      els.diagnostics.setAttribute('aria-hidden', hidden ? 'true' : 'false');
      if (els.diagnosticsToggle) {
        els.diagnosticsToggle.setAttribute('aria-expanded', hidden ? 'false' : 'true');
      }
    }

    function updateDiagnostics(){
      if (!els.diagnostics || els.diagnostics.hidden) return;
      if (els.diagCollections) {
        els.diagCollections.innerHTML = '';
        for (var i = 0; i < state.collections.length; i++) {
          var col = state.collections[i];
          var count = collectionCounts()[col.id] || 0;
          var li = document.createElement('li');
          li.textContent = col.name + ' · ' + count + ' cards';
          els.diagCollections.appendChild(li);
        }
      }
      if (els.diagPool) {
        els.diagPool.innerHTML = '';
        for (var j = 0; j < session.pool.length; j++) {
          var card = session.pool[j];
          var item = document.createElement('li');
          item.textContent = (j + 1) + '. ' + card.front;
          els.diagPool.appendChild(item);
        }
      }
    }

    function applyAppearance(){
      if (!root) return;
      var list = root.classList;
      list.toggle('flashcards--dark', !!state.prefs.darkMode);
      list.toggle('flashcards--large-text', !!state.prefs.largeText);
      list.toggle('flashcards--high-contrast', !!state.prefs.highContrast);
    }

    function resetAll(){
      if (!confirm('Vols esborrar totes les dades?')) return;
      localStorage.removeItem(STORAGE_COLLECTIONS);
      localStorage.removeItem(STORAGE_CARDS);
      localStorage.removeItem(STORAGE_PREFS);
      state.collections = [];
      state.cards = [];
      state.prefs.lastCollectionId = null;
      state.prefs.darkMode = false;
      state.prefs.largeText = false;
      state.prefs.highContrast = false;
      state.prefs.onboardingDismissed = false;
      session.pool = [];
      session.current = null;
      session.seen = {};
      session.stats = { known: 0, unknown: 0 };
      loadState();
      renderCollections();
      filterCards();
      showCard();
      updateProgress();
      updateDiagnostics();
      if (els.darkMode) els.darkMode.checked = !!state.prefs.darkMode;
      if (els.largeText) els.largeText.checked = !!state.prefs.largeText;
      if (els.highContrast) els.highContrast.checked = !!state.prefs.highContrast;
      applyAppearance();
    }

    function toggleFlag(){
      if (!session.current) return;
      session.current.flagged = !session.current.flagged;
      saveCards();
      if (els.markDoubt) {
        els.markDoubt.textContent = session.current.flagged ? '🔖' : '❓';
        els.markDoubt.setAttribute('aria-pressed', session.current.flagged ? 'true' : 'false');
      }
      updateProgress();
    }

    function handleKeydown(event){
      if (!session.current) return;
      if (event.target && (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA')) return;
      var key = event.key || event.keyCode;
      if (key === ' ' || key === 'Spacebar') {
        event.preventDefault();
        flipCard();
      } else if (key === 'ArrowRight') {
        event.preventDefault();
        gradeCard(true);
      } else if (key === 'ArrowLeft') {
        event.preventDefault();
        gradeCard(false);
      } else if (key === 'Enter') {
        event.preventDefault();
        nextCard();
      }
    }

    loadState();
    renderCollections();
    applyLanguage();
    if (els.lang) els.lang.value = state.prefs.lang;
    if (els.search) {
      els.search.value = state.prefs.search || '';
    }
    if (els.darkMode) els.darkMode.checked = !!state.prefs.darkMode;
    if (els.largeText) els.largeText.checked = !!state.prefs.largeText;
    if (els.highContrast) els.highContrast.checked = !!state.prefs.highContrast;
    filterCards();
    showCard();
    updateProgress();
    applyAppearance();

    if (els.collectionSelect) {
      els.collectionSelect.addEventListener('change', function(){
        pickCollection(els.collectionSelect.value);
      });
    }
    if (els.search) {
      els.search.addEventListener('input', function(){
        state.prefs.search = els.search.value;
        savePrefs();
        filterCards();
        showCard();
        updateDiagnostics();
      });
    }
    if (els.flip) els.flip.addEventListener('click', flipCard);
    if (els.next) els.next.addEventListener('click', nextCard);
    if (els.known) els.known.addEventListener('click', function(){ gradeCard(true); });
    if (els.unknown) els.unknown.addEventListener('click', function(){ gradeCard(false); });
    if (els.resetFilters) els.resetFilters.addEventListener('click', resetFilters);
    if (els.addCard) els.addCard.addEventListener('click', function(){ openCardModal(null); });
    if (els.editCard) els.editCard.addEventListener('click', function(){ if (session.current) openCardModal(clone(session.current)); });
    if (els.manageCollections) els.manageCollections.addEventListener('click', openCollectionManager);
    if (els.lang) els.lang.addEventListener('change', function(){
      state.prefs.lang = els.lang.value || 'ca';
      savePrefs();
      applyLanguage();
    });
    if (els.darkMode) els.darkMode.addEventListener('change', function(){
      state.prefs.darkMode = !!els.darkMode.checked;
      savePrefs();
      applyAppearance();
    });
    if (els.largeText) els.largeText.addEventListener('change', function(){
      state.prefs.largeText = !!els.largeText.checked;
      savePrefs();
      applyAppearance();
    });
    if (els.highContrast) els.highContrast.addEventListener('change', function(){
      state.prefs.highContrast = !!els.highContrast.checked;
      savePrefs();
      applyAppearance();
    });
    if (els.diagnosticsToggle) els.diagnosticsToggle.addEventListener('click', toggleDiagnostics);
    if (els.resetAll) els.resetAll.addEventListener('click', resetAll);
    if (els.markDoubt) els.markDoubt.addEventListener('click', toggleFlag);
    if (els.onboardingAction) els.onboardingAction.addEventListener('click', createCollection);
    if (els.onboardingExample) els.onboardingExample.addEventListener('click', function(){
      if (!state.collections.length) return;
      state.prefs.lastCollectionId = state.collections[0].id;
      state.prefs.onboardingDismissed = true;
      savePrefs();
      renderCollections();
      filterCards();
      showCard();
      updateProgress();
    });
    if (els.onboardingDismiss) els.onboardingDismiss.addEventListener('click', function(){
      state.prefs.onboardingDismissed = true;
      savePrefs();
      renderCollections();
    });
    document.addEventListener('keydown', handleKeydown);
  });
})();
