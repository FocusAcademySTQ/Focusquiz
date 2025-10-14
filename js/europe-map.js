const MAP_CONTAINER_ID = 'map';
const GEOJSON_SOURCES = [
  'data/europe.geojson',
  'https://cdn.jsdelivr.net/gh/leakyMirror/map-of-europe@master/GeoJSON/europe.geojson',
  'https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson',
];

const DEFAULT_STYLE = {
  color: '#0f172a',
  weight: 1.4,
  fillColor: '#cbd5f5',
  fillOpacity: 0.22,
  lineJoin: 'round',
  lineCap: 'round',
};

const HOVER_STYLE = {
  color: '#1d4ed8',
  weight: 2,
  fillColor: '#bfdbfe',
  fillOpacity: 0.55,
  lineJoin: 'round',
  lineCap: 'round',
};

const CORRECT_STYLE = {
  color: '#166534',
  weight: 2,
  fillColor: '#22c55e',
  fillOpacity: 0.8,
  lineJoin: 'round',
  lineCap: 'round',
};

const WRONG_STYLE = {
  color: '#b91c1c',
  weight: 2,
  fillColor: '#ef4444',
  fillOpacity: 0.8,
  lineJoin: 'round',
  lineCap: 'round',
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getFeatureId(feature) {
  const props = feature?.properties ?? {};
  return props.iso_a2 || props.iso_a3 || props.adm0_a3 || props.id || props.name;
}

function getFeatureName(feature) {
  const props = feature?.properties ?? {};
  return props.sovereignt_ct || props.name || props.sovereignt || 'País desconegut';
}

function ensureLayerAccessibility(layer, name) {
  layer.on('add', () => {
    const el = layer.getElement();
    if (!el) return;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', name);
    el.setAttribute('aria-pressed', 'false');
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        layer.fire('keyboard-click');
      }
    });
  });
}

function setLayerState(layer, state) {
  const el = layer.getElement?.();
  if (!el) return;
  if (state === 'correct') {
    el.setAttribute('aria-pressed', 'true');
  } else {
    el.setAttribute('aria-pressed', 'false');
  }
}

class EuropeMapGame {
  constructor() {
    this.map = L.map(MAP_CONTAINER_ID, {
      zoomControl: true,
      minZoom: 3,
      maxZoom: 7,
      inertia: true,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
    }).setView([53, 11], 4);

    // Base tiles are intentionally omitted to keep the quiz focused on the country shapes only.

    this.geoLayer = null;
    this.countries = [];
    this.order = [];
    this.currentIndex = 0;
    this.currentCountry = null;
    this.correct = 0;
    this.incorrect = 0;
    this.waiting = false;
    this.layerById = new Map();
    this.solved = new Set();

    this.questionEl = document.getElementById('question');
    this.scoreCorrectEl = document.getElementById('score-correct');
    this.scoreIncorrectEl = document.getElementById('score-incorrect');
    this.feedbackEl = document.getElementById('feedback');
    this.restartBtn = document.getElementById('restartBtn');
    this.helpBtn = document.getElementById('showHelpBtn');
    this.helpDialog = document.getElementById('helpDialog');

    this.bindUI();
    this.load();
  }

  bindUI() {
    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => this.restart());
    }
    if (this.helpBtn) {
      this.helpBtn.addEventListener('click', () => {
        if (this.helpDialog?.showModal) {
          this.helpDialog.showModal();
        } else if (this.helpDialog) {
          this.helpDialog.setAttribute('open', '');
        }
      });
    }
    if (this.helpDialog) {
      this.helpDialog.addEventListener('cancel', () => {
        this.helpDialog.close?.();
      });
    }
  }

  async load() {
    try {
      const data = await this.loadGeoData();
      this.setupMap(data);
      this.start();
    } catch (error) {
      console.error(error);
      this.setQuestion('No s’ha pogut carregar el mapa d’Europa. Torna-ho a provar més tard.');
      this.setFeedback(error.message || 'Error desconegut', 'error');
    }
  }

  async loadGeoData() {
    let lastError;
    for (const url of GEOJSON_SOURCES) {
      try {
        const response = await fetch(url, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`(${response.status}) ${response.statusText || 'Error'}`);
        const data = await response.json();
        if (data?.features?.length) {
          return data;
        }
      } catch (error) {
        console.warn(`No s'ha pogut carregar el GeoJSON des de ${url}`, error);
        lastError = error;
      }
    }
    throw lastError || new Error('No s’ha pogut obtenir el GeoJSON de països.');
  }

  setupMap(geojson) {
    this.countries = (geojson?.features || []).map((feature) => {
      const id = getFeatureId(feature);
      const name = getFeatureName(feature);
      return { id, name, feature };
    }).filter((item) => !!item.id && !!item.name);

    const styleFn = () => ({ ...DEFAULT_STYLE });

    this.geoLayer = L.geoJSON(geojson, {
      style: styleFn,
      smoothFactor: 0.4,
      onEachFeature: (feature, layer) => {
        const id = getFeatureId(feature);
        const name = getFeatureName(feature);
        if (!id) return;

        ensureLayerAccessibility(layer, name);
        this.layerById.set(id, layer);

        layer.on('click', () => this.handleSelection(feature, layer));
        layer.on('keyboard-click', () => this.handleSelection(feature, layer));
        layer.on('mouseover', () => {
          if (this.waiting) return;
          if (this.solved.has(id)) return;
          layer.setStyle(HOVER_STYLE);
        });
        layer.on('mouseout', () => {
          if (this.solved.has(id)) return;
          layer.setStyle(DEFAULT_STYLE);
        });
      },
    }).addTo(this.map);

    if (this.geoLayer.bringToFront) {
      this.geoLayer.bringToFront();
    }

    const bounds = this.geoLayer.getBounds();
    if (bounds?.isValid()) {
      this.map.fitBounds(bounds, { padding: [30, 30] });
      this.map.setMaxBounds(bounds.pad(0.35));
    }
  }

  start() {
    this.correct = 0;
    this.incorrect = 0;
    this.currentIndex = 0;
    this.order = shuffle(this.countries);
    this.solved.clear();
    this.layerById.forEach((layer) => {
      layer.setStyle(DEFAULT_STYLE);
      setLayerState(layer, 'pending');
    });
    this.updateScore();
    this.setFeedback('Comença el joc! Cerca el primer país.', 'info');
    this.nextQuestion();
  }

  restart() {
    this.waiting = false;
    this.start();
  }

  nextQuestion() {
    if (!this.order.length) {
      this.setQuestion('No s’han carregat països.');
      return;
    }

    if (this.currentIndex >= this.order.length) {
      this.finishGame();
      return;
    }

    this.currentCountry = this.order[this.currentIndex];
    this.currentIndex += 1;
    this.setQuestion(`Troba: ${this.currentCountry.name}`);
  }

  async handleSelection(feature, layer) {
    if (!this.currentCountry || this.waiting) return;

    const clickedId = getFeatureId(feature);
    if (!clickedId) return;

    this.waiting = true;
    const isCorrect = clickedId === this.currentCountry.id;

    if (isCorrect) {
      layer.setStyle(CORRECT_STYLE);
      setLayerState(layer, 'correct');
      this.solved.add(clickedId);
      this.correct += 1;
      this.setFeedback(`Correcte! Has trobat ${this.currentCountry.name}.`, 'success');
      this.updateScore();
      await wait(950);
    } else {
      layer.setStyle(WRONG_STYLE);
      this.incorrect += 1;
      this.setFeedback(`No és ${this.currentCountry.name}. Torna-ho a provar!`, 'error');
      this.updateScore();

      const correctLayer = this.layerById.get(this.currentCountry.id);
      if (correctLayer) {
        correctLayer.setStyle(CORRECT_STYLE);
        setLayerState(correctLayer, 'correct');
        this.solved.add(this.currentCountry.id);
      }
      await wait(1400);
      if (!this.solved.has(clickedId)) {
        layer.setStyle(DEFAULT_STYLE);
        setLayerState(layer, 'pending');
      }
    }

    this.waiting = false;
    this.nextQuestion();
  }

  finishGame() {
    this.currentCountry = null;
    const total = this.correct + this.incorrect;
    this.setQuestion('Has completat el mapa d’Europa!');
    this.setFeedback(`Resultat final: ${this.correct} encerts de ${total} països. Prem «Torna a començar» per repetir.`, 'success');
    if (this.restartBtn) {
      this.restartBtn.focus();
    }
  }

  updateScore() {
    if (this.scoreCorrectEl) this.scoreCorrectEl.textContent = String(this.correct);
    if (this.scoreIncorrectEl) this.scoreIncorrectEl.textContent = String(this.incorrect);
  }

  setQuestion(text) {
    if (this.questionEl) {
      this.questionEl.innerHTML = text;
    }
  }

  setFeedback(text, variant = 'info') {
    if (!this.feedbackEl) return;
    this.feedbackEl.textContent = text || '';
    this.feedbackEl.classList.remove('success', 'error');
    if (variant === 'success') {
      this.feedbackEl.classList.add('success');
    } else if (variant === 'error') {
      this.feedbackEl.classList.add('error');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (typeof L === 'undefined') {
    console.error('Leaflet no està disponible.');
    return;
  }
  new EuropeMapGame();
});
