const MAP_CONTAINER_ID = 'map';
const GEOJSON_SOURCES = [
  'data/europe.geojson',
  'https://cdn.jsdelivr.net/gh/leakyMirror/map-of-europe@master/GeoJSON/europe.geojson',
  'https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson',
];

const CATALAN_NAME_OVERRIDES = {
  AL: 'Albània',
  AND: 'Andorra',
  AD: 'Andorra',
  AM: 'Armènia',
  ARM: 'Armènia',
  AT: 'Àustria',
  AUT: 'Àustria',
  AZ: 'Azerbaidjan',
  AZE: 'Azerbaidjan',
  BY: 'Belarús',
  BLR: 'Belarús',
  BE: 'Bèlgica',
  BEL: 'Bèlgica',
  BA: 'Bòsnia i Hercegovina',
  BIH: 'Bòsnia i Hercegovina',
  BG: 'Bulgària',
  BGR: 'Bulgària',
  HR: 'Croàcia',
  HRV: 'Croàcia',
  CY: 'Xipre',
  CYP: 'Xipre',
  CZ: 'Txèquia',
  CZE: 'Txèquia',
  DK: 'Dinamarca',
  DNK: 'Dinamarca',
  EE: 'Estònia',
  EST: 'Estònia',
  FO: 'Illes Fèroe',
  FRO: 'Illes Fèroe',
  AX: 'Illes Åland',
  ALA: 'Illes Åland',
  FI: 'Finlàndia',
  FIN: 'Finlàndia',
  FR: 'França',
  FRA: 'França',
  GE: 'Geòrgia',
  GEO: 'Geòrgia',
  DE: 'Alemanya',
  DEU: 'Alemanya',
  GI: 'Gibraltar',
  GIB: 'Gibraltar',
  GR: 'Grècia',
  GRC: 'Grècia',
  EL: 'Grècia',
  HU: 'Hongria',
  HUN: 'Hongria',
  IS: 'Islàndia',
  ISL: 'Islàndia',
  IE: 'Irlanda',
  IRL: 'Irlanda',
  IT: 'Itàlia',
  ITA: 'Itàlia',
  KZ: 'Kazakhstan',
  KAZ: 'Kazakhstan',
  LV: 'Letònia',
  LVA: 'Letònia',
  LT: 'Lituània',
  LTU: 'Lituània',
  LI: 'Liechtenstein',
  LIE: 'Liechtenstein',
  LU: 'Luxemburg',
  LUX: 'Luxemburg',
  MT: 'Malta',
  MLT: 'Malta',
  MD: 'Moldàvia',
  MDA: 'Moldàvia',
  MC: 'Mònaco',
  MCO: 'Mònaco',
  ME: 'Montenegro',
  MNE: 'Montenegro',
  NL: 'Països Baixos',
  NLD: 'Països Baixos',
  MK: 'Macedònia del Nord',
  MKD: 'Macedònia del Nord',
  NMK: 'Macedònia del Nord',
  NO: 'Noruega',
  NOR: 'Noruega',
  PL: 'Polònia',
  POL: 'Polònia',
  PT: 'Portugal',
  PRT: 'Portugal',
  RO: 'Romania',
  ROU: 'Romania',
  RU: 'Rússia',
  RUS: 'Rússia',
  SM: 'San Marino',
  SMR: 'San Marino',
  RS: 'Sèrbia',
  SRB: 'Sèrbia',
  SK: 'Eslovàquia',
  SVK: 'Eslovàquia',
  SI: 'Eslovènia',
  SVN: 'Eslovènia',
  ES: 'Espanya',
  ESP: 'Espanya',
  SE: 'Suècia',
  SWE: 'Suècia',
  CH: 'Suïssa',
  CHE: 'Suïssa',
  TR: 'Turquia',
  TUR: 'Turquia',
  UA: 'Ucraïna',
  UKR: 'Ucraïna',
  GB: 'Regne Unit',
  GBR: 'Regne Unit',
  UK: 'Regne Unit',
  VA: 'Ciutat del Vaticà',
  VAT: 'Ciutat del Vaticà',
  XK: 'Kosovo',
  RKS: 'Kosovo',
  XKO: 'Kosovo',
  IM: 'Illa de Man',
  IMN: 'Illa de Man',
  JE: 'Jersei',
  JEY: 'Jersei',
  GG: 'Guernsey',
  GGY: 'Guernsey',
};

const DEFAULT_STYLE = {
  color: 'transparent',
  weight: 0,
  fillColor: 'transparent',
  fillOpacity: 0,
  lineJoin: 'round',
  lineCap: 'round',
};

const OUTLINE_STYLE = {
  color: '#0f172a',
  weight: 1.25,
  fillColor: '#dbeafe',
  fillOpacity: 0.14,
  lineJoin: 'round',
  lineCap: 'round',
  interactive: false,
};

const HOVER_STYLE = {
  color: '#1d4ed8',
  weight: 2.25,
  fillColor: '#bfdbfe',
  fillOpacity: 0.5,
  lineJoin: 'round',
  lineCap: 'round',
};

const CORRECT_STYLE = {
  color: '#166534',
  weight: 2.4,
  fillColor: '#22c55e',
  fillOpacity: 0.82,
  lineJoin: 'round',
  lineCap: 'round',
};

const WRONG_STYLE = {
  color: '#b91c1c',
  weight: 2.4,
  fillColor: '#ef4444',
  fillOpacity: 0.82,
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
  const id = props.iso_a2 || props.iso_a3 || props.adm0_a3 || props.id || props.name;
  if (id === undefined || id === null) return null;
  if (typeof id === 'string') return id.trim();
  return String(id);
}

function getFeatureName(feature) {
  const props = feature?.properties ?? {};
  const isoA2Raw = props.iso_a2 || props.ISO_A2;
  const isoA3Raw = props.iso_a3 || props.adm0_a3 || props.ISO_A3;
  const isoA2 = typeof isoA2Raw === 'string' ? isoA2Raw.trim().toUpperCase() : '';
  const isoA3 = typeof isoA3Raw === 'string' ? isoA3Raw.trim().toUpperCase() : '';
  if (isoA2 && CATALAN_NAME_OVERRIDES[isoA2]) {
    return CATALAN_NAME_OVERRIDES[isoA2];
  }
  if (isoA3 && CATALAN_NAME_OVERRIDES[isoA3]) {
    return CATALAN_NAME_OVERRIDES[isoA3];
  }
  const id = typeof props.id === 'string' ? props.id.trim() : '';
  if (id && CATALAN_NAME_OVERRIDES[id.toUpperCase()]) {
    return CATALAN_NAME_OVERRIDES[id.toUpperCase()];
  }
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

    this.map.options.maxBoundsViscosity = 0.6;
    this.outlinePane = this.map.createPane('outlinePane');
    this.outlinePane.style.zIndex = 360;

    this.geoLayer = null;
    this.outlineLayer = null;
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
    this.layerById.clear();
    const seen = new Set();
    this.countries = (geojson?.features || []).map((feature) => {
      const geometryType = feature?.geometry?.type;
      if (!geometryType || (geometryType !== 'Polygon' && geometryType !== 'MultiPolygon')) {
        return null;
      }
      const id = getFeatureId(feature);
      const name = getFeatureName(feature);
      return { id, name, feature };
    }).filter((item) => {
      if (!item) return false;
      if (!item.id || !item.name) return false;
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    if (this.outlineLayer) {
      this.map.removeLayer(this.outlineLayer);
    }
    this.outlineLayer = L.geoJSON(geojson, {
      style: () => ({ ...OUTLINE_STYLE }),
      smoothFactor: 0.2,
      interactive: false,
      pane: 'outlinePane',
    }).addTo(this.map);
    this.outlineLayer.bringToBack?.();

    if (this.geoLayer) {
      this.map.removeLayer(this.geoLayer);
    }

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

    this.geoLayer.bringToFront?.();

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
      layer.bringToFront?.();
      setLayerState(layer, 'correct');
      this.solved.add(clickedId);
      this.correct += 1;
      this.setFeedback(`Correcte! Has trobat ${this.currentCountry.name}.`, 'success');
      this.updateScore();
      await wait(950);
    } else {
      layer.setStyle(WRONG_STYLE);
      layer.bringToFront?.();
      this.incorrect += 1;
      this.setFeedback(`No és ${this.currentCountry.name}. Torna-ho a provar!`, 'error');
      this.updateScore();

      const correctLayer = this.layerById.get(this.currentCountry.id);
      if (correctLayer) {
        correctLayer.setStyle(CORRECT_STYLE);
        correctLayer.bringToFront?.();
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
    this.feedbackEl.classList.remove('success', 'error', 'info');
    if (variant === 'success') {
      this.feedbackEl.classList.add('success');
    } else if (variant === 'error') {
      this.feedbackEl.classList.add('error');
    } else {
      this.feedbackEl.classList.add('info');
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
