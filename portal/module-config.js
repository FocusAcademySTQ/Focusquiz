const CHECKED = (condition) => (condition ? 'checked' : '');
const SELECTED = (condition) => (condition ? 'selected' : '');

function createContainer(moduleId, innerHTML) {
  const wrapper = document.createElement('div');
  wrapper.className = 'portal-module-config-body';
  wrapper.dataset.moduleConfig = moduleId;
  wrapper.innerHTML = innerHTML.trim();
  return wrapper;
}

function deepClone(value) {
  if (!value || typeof value !== 'object') return {};
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_error) {
    return {};
  }
}

function safeQuery(scope, selector) {
  if (!scope || typeof scope.querySelector !== 'function') return null;
  try {
    return scope.querySelector(selector);
  } catch (_error) {
    return null;
  }
}

function nodeValue(node) {
  if (!node) return '';
  const { value } = node;
  if (value === undefined || value === null) return '';
  return String(value);
}

function getValue(scope, selector, fallback = '') {
  const value = nodeValue(safeQuery(scope, selector));
  return value || fallback;
}

function getCheckedValue(scope, selector, fallback = '') {
  const value = nodeValue(safeQuery(scope, selector));
  return value || fallback;
}

function isChecked(scope, selector) {
  const node = safeQuery(scope, selector);
  return !!(node && node.checked);
}

const arithmeticOps = ['+', '-', '×', '÷'];
const arithmeticLabels = {
  '+': 'Sumes',
  '-': 'Restes',
  '×': 'Multiplicacions',
  '÷': 'Divisions',
};

const fractionsSubthemes = [
  { value: 'identify', label: 'Identificar (imatge → fracció)' },
  { value: 'arith', label: 'Aritmètica' },
  { value: 'simplify', label: 'Simplificar' },
];

const percentSubthemes = [
  { value: 'mix', label: 'Barreja (tots els tipus)' },
  { value: 'of', label: 'Trobar el percentatge d’un valor' },
  { value: 'is-of', label: 'Saber quin percentatge representa un valor' },
  { value: 'discount', label: 'Preus amb descompte' },
];

const geometryScopes = [
  { value: 'area', label: 'Àrea' },
  { value: 'perim', label: 'Perímetre' },
  { value: 'both', label: 'Àrea + Perímetre' },
  { value: 'vol', label: 'Volum' },
];

const geometryFigures = [
  { key: 'rect', label: 'Rectangles/quadrats' },
  { key: 'tri', label: 'Triangles' },
  { key: 'circ', label: 'Cercles' },
  { key: 'poly', label: 'Polígons regulars' },
  { key: 'grid', label: 'Graella' },
  { key: 'comp', label: 'Figures compostes' },
  { key: 'cube', label: 'Cub/Cuboid' },
  { key: 'cylinder', label: 'Cilindre' },
];

const statsSubthemes = [
  { value: 'mmm', label: 'Mitjana, mediana i moda' },
  { value: 'range-dev', label: 'Rang i desviació' },
  { value: 'graphs', label: 'Representació gràfica' },
];

const coordSubthemes = [
  { value: 'read', label: 'Llegir coordenades (punt → (x,y))' },
  { value: 'quadrant', label: 'Identificar el quadrant' },
  { value: 'build', label: 'Construir un punt amb condicions' },
  { value: 'mix', label: 'Barreja de lectures, quadrants i punts' },
];

const unitsSubthemes = [
  { value: 'length', label: 'Longitud' },
  { value: 'mass', label: 'Massa' },
  { value: 'volume', label: 'Volum' },
  { value: 'area', label: 'Superfície' },
  { value: 'time', label: 'Temps' },
];

const equationFormats = [
  { value: 'normal', label: 'Normals' },
  { value: 'frac', label: 'Amb fraccions' },
  { value: 'par', label: 'Amb parèntesis' },
  { value: 'sys', label: "Sistemes d'equacions" },
];

const equationDegrees = [
  { value: '1', label: '1r grau' },
  { value: '2', label: '2n grau' },
  { value: 'mixed', label: 'Barrejats' },
];

const equationRanges = [
  { value: 'small', label: 'petits (−9…9)' },
  { value: 'med', label: 'mitjans (−20…20)' },
  { value: 'big', label: 'grans (−60…60)' },
];

const functionTypes = [
  { key: 'lin', label: 'Lineals' },
  { key: 'quad', label: 'Quadràtiques' },
  { key: 'poly', label: 'Polinòmiques' },
  { key: 'rac', label: 'Racionals' },
  { key: 'rad', label: 'Radicals' },
  { key: 'exp', label: 'Exponencials' },
  { key: 'log', label: 'Logarítmiques' },
];

const functionAspects = [
  { key: 'type', label: 'Identificar tipus' },
  { key: 'domain', label: 'Domini i recorregut' },
  { key: 'intercepts', label: 'Punts de tall' },
  { key: 'symmetry', label: 'Simetria' },
  { key: 'limits', label: 'Límits' },
  { key: 'extrema', label: 'Extrems relatius' },
  { key: 'monotony', label: 'Monotonia' },
];

const functionDifficultyLabels = {
  1: 'Bàsic',
  2: 'Intermedi',
  3: 'Avançat',
  4: 'Expert',
};

const ortSubthemes = [
  { value: 'bv', label: 'B / V' },
  { value: 'jg', label: 'J / G' },
  { value: 'scczx', label: 'S / C / Ç / Z / X' },
  { value: 'corregir', label: 'Corregir' },
  { value: 'rr', label: 'R / RR' },
  { value: 'llg', label: 'L / L·L' },
];

const morfSubthemes = [
  { value: 'basiques', label: 'Estructures bàsiques' },
  { value: 'subjecte', label: 'Subjecte vs Predicat' },
  { value: 'temps', label: 'Temps i mode verbal' },
  { value: 'categories', label: 'Categories gramaticals' },
  { value: 'concordanca', label: 'Concordança' },
  { value: 'funcions', label: 'Funcions sintàctiques' },
];

const GEO_BASE_MODES = [
  { value: 'quiz', label: 'Preguntes generals' },
  { value: 'flag', label: 'Banderes' },
];

const GEO_EXTRA_MODES = {
  'geo-europe': [{ value: 'map', label: 'Mapa interactiu' }],
  'geo-america': [{ value: 'map', label: 'Mapa interactiu' }],
  'geo-africa': [{ value: 'map', label: 'Mapa interactiu' }],
  'geo-asia': [{ value: 'map', label: 'Mapa interactiu' }],
};

const chemModeLabels = {
  speed: 'Quiz ràpid (símbol ↔ nom)',
  compounds: 'Construir compostos',
  map: 'Mapa interactiu',
  classify: 'Classificació ràpida',
};

const chemDirectionLabels = {
  sym2name: 'Símbol → Nom',
  name2sym: 'Nom → Símbol',
};

const chemCompoundSubthemes = [
  { value: 'valence', label: 'Valències i ions' },
  { value: 'formulas', label: 'Fórmules bàsiques' },
  { value: 'molecular', label: 'Compostos moleculars' },
];

function arithmeticDefaults() {
  return { ops: arithmeticOps.slice(), allowNeg: false, tri: false };
}

function arithmeticNormalize(options = {}) {
  const defaults = arithmeticDefaults();
  const ops = Array.isArray(options.ops)
    ? options.ops.filter((op) => arithmeticOps.includes(op))
    : defaults.ops.slice();
  return {
    ops,
    allowNeg: Boolean(options.allowNeg),
    tri: Boolean(options.tri),
  };
}

const arithmeticDefinition = {
  defaults: arithmeticDefaults,
  normalize: arithmeticNormalize,
  render(options = {}) {
    const opts = arithmeticNormalize(options);
    return createContainer('arith', `
      <div class="section-title">Operacions</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Operacions d'aritmètica">
          <label class="toggle"><input class="check" type="checkbox" data-field="arith-op-plus" ${CHECKED(opts.ops.includes('+'))}> Sumes</label>
          <label class="toggle"><input class="check" type="checkbox" data-field="arith-op-minus" ${CHECKED(opts.ops.includes('-'))}> Restes</label>
          <label class="toggle"><input class="check" type="checkbox" data-field="arith-op-times" ${CHECKED(opts.ops.includes('×'))}> Multiplicacions</label>
          <label class="toggle"><input class="check" type="checkbox" data-field="arith-op-div" ${CHECKED(opts.ops.includes('÷'))}> Divisions</label>
        </div>
      </div>
      <div class="controls">
        <label class="toggle"><input class="check" type="checkbox" data-field="arith-allow-neg" ${CHECKED(opts.allowNeg)}> Permetre negatius</label>
        <label class="toggle"><input class="check" type="checkbox" data-field="arith-tri" ${CHECKED(opts.tri)}> Operar amb 3 números</label>
      </div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="arith"]');
    if (!scope) return arithmeticDefaults();
    const ops = [];
    if (isChecked(scope, '[data-field="arith-op-plus"]')) ops.push('+');
    if (isChecked(scope, '[data-field="arith-op-minus"]')) ops.push('-');
    if (isChecked(scope, '[data-field="arith-op-times"]')) ops.push('×');
    if (isChecked(scope, '[data-field="arith-op-div"]')) ops.push('÷');
    const allowNeg = isChecked(scope, '[data-field="arith-allow-neg"]');
    const tri = isChecked(scope, '[data-field="arith-tri"]');
    return arithmeticNormalize({ ops, allowNeg, tri });
  },
  summarize(options = {}) {
    const opts = arithmeticNormalize(options);
    const parts = [];
    if (opts.ops.length) {
      parts.push(`Operacions: ${opts.ops.map((op) => arithmeticLabels[op]).join(', ')}`);
    } else {
      parts.push('Operacions: cap seleccionada');
    }
    if (opts.allowNeg) parts.push('Permet negatius');
    if (opts.tri) parts.push('Operacions amb 3 nombres');
    return parts.join(' · ');
  },
  validate(options = {}) {
    const opts = arithmeticNormalize(options);
    if (!opts.ops.length) {
      return 'Selecciona com a mínim una operació.';
    }
    return '';
  },
};

function fractionsDefaults() {
  return { sub: 'identify', mixedGrids: true, forceSimplest: false };
}

function fractionsNormalize(options = {}) {
  const defaults = fractionsDefaults();
  const allowed = fractionsSubthemes.map((item) => item.value);
  const sub = allowed.includes(options.sub) ? options.sub : defaults.sub;
  return {
    sub,
    mixedGrids: options.mixedGrids !== undefined ? Boolean(options.mixedGrids) : defaults.mixedGrids,
    forceSimplest: Boolean(options.forceSimplest),
  };
}

const fractionsDefinition = {
  defaults: fractionsDefaults,
  normalize: fractionsNormalize,
  render(options = {}) {
    const opts = fractionsNormalize(options);
    const radios = fractionsSubthemes
      .map((subtheme) => `
        <label class="toggle">
          <input class="check" type="radio" name="frac-sub" value="${subtheme.value}" ${CHECKED(opts.sub === subtheme.value)}>
          ${subtheme.label}
        </label>
      `)
      .join('');
    return createContainer('frac', `
      <div class="section-title">Subtemes</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes de fraccions">
          ${radios}
        </div>
      </div>
      <div class="controls">
        <label class="toggle"><input class="check" type="checkbox" data-field="frac-mixed-grids" ${CHECKED(opts.mixedGrids)}> Formes i grills variats</label>
        <label class="toggle"><input class="check" type="checkbox" data-field="frac-force-simplest" ${CHECKED(opts.forceSimplest)}> Obliga forma més simple</label>
      </div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="frac"]');
    if (!scope) return fractionsDefaults();
    const sub = getCheckedValue(scope, 'input[name="frac-sub"]:checked', 'identify');
    const mixedGrids = isChecked(scope, '[data-field="frac-mixed-grids"]');
    const forceSimplest = isChecked(scope, '[data-field="frac-force-simplest"]');
    return fractionsNormalize({ sub, mixedGrids, forceSimplest });
  },
  summarize(options = {}) {
    const opts = fractionsNormalize(options);
    const subInfo = fractionsSubthemes.find((item) => item.value === opts.sub);
    const subLabel = subInfo && subInfo.label ? subInfo.label : 'Subtema general';
    const parts = [`Subtema: ${subLabel}`];
    parts.push(opts.mixedGrids ? 'Formes variades' : 'Formes fixes');
    if (opts.forceSimplest) parts.push('Requereix forma més simple');
    return parts.join(' · ');
  },
};

function percentDefaults() {
  return { sub: 'mix' };
}

function percentNormalize(options = {}) {
  const defaults = percentDefaults();
  const allowed = percentSubthemes.map((item) => item.value);
  const sub = allowed.includes(options.sub) ? options.sub : defaults.sub;
  return { sub };
}

const percentDefinition = {
  defaults: percentDefaults,
  normalize: percentNormalize,
  render(options = {}) {
    const opts = percentNormalize(options);
    const radios = percentSubthemes
      .map((item, index) => `
        <label class="toggle">
          <input class="check" type="radio" name="perc-sub" value="${item.value}" ${CHECKED(opts.sub === item.value || (!options.sub && index === 0))}>
          ${item.label}
        </label>
      `)
      .join('');
    return createContainer('perc', `
      <div class="section-title">Tipus de problema</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Tipus de problemes de percentatges">
          ${radios}
        </div>
      </div>
      <div class="subtitle">Pots treballar un sol tipus d\'exercici o combinar-los tots a la vegada.</div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="perc"]');
    if (!scope) return percentDefaults();
    const sub = getCheckedValue(scope, 'input[name="perc-sub"]:checked', 'mix');
    return percentNormalize({ sub });
  },
  summarize(options = {}) {
    const opts = percentNormalize(options);
    const info = percentSubthemes.find((item) => item.value === opts.sub);
    const label = info && info.label ? info.label : 'Barreja (tots els tipus)';
    return `Problemes: ${label}`;
  },
};

function coordDefaults() {
  return { sub: 'read' };
}

function coordNormalize(options = {}) {
  const defaults = coordDefaults();
  const allowed = coordSubthemes.map((item) => item.value);
  const sub = allowed.includes(options.sub) ? options.sub : defaults.sub;
  return { sub };
}

const coordDefinition = {
  defaults: coordDefaults,
  normalize: coordNormalize,
  render(options = {}) {
    const opts = coordNormalize(options);
    const radios = coordSubthemes
      .map((item, index) => `
        <label class="toggle">
          <input class="check" type="radio" name="coord-sub" value="${item.value}" ${CHECKED(opts.sub === item.value || (!options.sub && index === 0))}>
          ${item.label}
        </label>
      `)
      .join('');
    return createContainer('coord', `
      <div class="section-title">Focus de les activitats</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes de coordenades cartesianes">
          ${radios}
        </div>
      </div>
      <div class="subtitle">Selecciona què vols reforçar: lectura de punts, identificació de quadrants o construcció de coordenades.</div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="coord"]');
    if (!scope) return coordDefaults();
    const sub = getCheckedValue(scope, 'input[name="coord-sub"]:checked', 'read');
    return coordNormalize({ sub });
  },
  summarize(options = {}) {
    const opts = coordNormalize(options);
    const info = coordSubthemes.find((item) => item.value === opts.sub);
    const label = info && info.label ? info.label : 'Llegir coordenades';
    return `Focus: ${label}`;
  },
};

function geometryDefaults() {
  return {
    scope: 'area',
    fig: {
      rect: true,
      tri: true,
      circ: true,
      poly: false,
      grid: false,
      comp: false,
      cube: false,
      cylinder: false,
    },
    units: 'cm',
    round: 2,
    circleMode: 'numeric',
    requireUnits: false,
  };
}

function geometryNormalize(options = {}) {
  const defaults = geometryDefaults();
  const scopeValues = geometryScopes.map((item) => item.value);
  const scope = scopeValues.includes(options.scope) ? options.scope : defaults.scope;
  const fig = { ...defaults.fig };
  if (options.fig && typeof options.fig === 'object') {
    geometryFigures.forEach(({ key }) => {
      if (key in options.fig) {
        fig[key] = Boolean(options.fig[key]);
      }
    });
  }
  const units = typeof options.units === 'string' ? options.units : defaults.units;
  const round = Number.isFinite(Number(options.round)) ? Number(options.round) : defaults.round;
  const circleModes = ['numeric', 'pi-exacte'];
  const circleMode = circleModes.includes(options.circleMode) ? options.circleMode : defaults.circleMode;
  const requireUnits = Boolean(options.requireUnits);
  return { scope, fig, units, round, circleMode, requireUnits };
}

const geometryDefinition = {
  defaults: geometryDefaults,
  normalize: geometryNormalize,
  render(options = {}) {
    const opts = geometryNormalize(options);
    const radios = geometryScopes
      .map((item) => `
        <label class="toggle"><input class="check" type="radio" name="geom-scope" value="${item.value}" ${CHECKED(opts.scope === item.value)}> ${item.label}</label>
      `)
      .join('');
    const figures = geometryFigures
      .map((figure) => `
        <label class="toggle"><input class="check" type="checkbox" data-figure="${figure.key}" ${CHECKED(Boolean(opts.fig[figure.key]))}> ${figure.label}</label>
      `)
      .join('');
    return createContainer('geom', `
      <div class="section-title">Abast</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Abast del mòdul de geometria">
          ${radios}
        </div>
      </div>
      <div class="section-title">Figures</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Figures geomètriques">
          ${figures}
        </div>
      </div>
      <div class="controls">
        <label class="field chip">Unitats
          <select data-field="geom-units">
            <option value="cm" ${SELECTED(opts.units === 'cm')}>cm</option>
            <option value="m" ${SELECTED(opts.units === 'm')}>m</option>
          </select>
        </label>
        <label class="field chip">Arrodoniment
          <select data-field="geom-round">
            <option value="0" ${SELECTED(opts.round === 0)}>sense</option>
            <option value="1" ${SELECTED(opts.round === 1)}>1</option>
            <option value="2" ${SELECTED(opts.round === 2)}>2</option>
            <option value="3" ${SELECTED(opts.round === 3)}>3</option>
          </select>
        </label>
        <label class="field chip">Mode cercles
          <select data-field="geom-circle-mode">
            <option value="numeric" ${SELECTED(opts.circleMode === 'numeric')}>Numèric</option>
            <option value="pi-exacte" ${SELECTED(opts.circleMode === 'pi-exacte')}>Exacte amb π</option>
          </select>
        </label>
      </div>
      <div class="controls">
        <label class="toggle"><input class="check" type="checkbox" data-field="geom-require-units" ${CHECKED(opts.requireUnits)}> Exigir unitats a la resposta</label>
      </div>
    `);
  },
  collect(card) {
    const scopeNode = safeQuery(card, '[data-module-config="geom"]');
    if (!scopeNode) return geometryDefaults();
    const defaults = geometryDefaults();
    const selectedScope = getCheckedValue(scopeNode, 'input[name="geom-scope"]:checked', defaults.scope);
    const fig = {};
    geometryFigures.forEach(({ key }) => {
      fig[key] = isChecked(scopeNode, `[data-figure="${key}"]`);
    });
    const units = getValue(scopeNode, '[data-field="geom-units"]', defaults.units);
    const round = Number.parseInt(getValue(scopeNode, '[data-field="geom-round"]', String(defaults.round)), 10);
    const circleMode = getValue(scopeNode, '[data-field="geom-circle-mode"]', defaults.circleMode);
    const requireUnits = isChecked(scopeNode, '[data-field="geom-require-units"]');
    return geometryNormalize({ scope: selectedScope, fig, units, round, circleMode, requireUnits });
  },
  summarize(options = {}) {
    const opts = geometryNormalize(options);
    const scopeInfo = geometryScopes.find((item) => item.value === opts.scope);
    const scopeLabel = scopeInfo && scopeInfo.label ? scopeInfo.label : 'Abast general';
    const figures = geometryFigures.filter(({ key }) => opts.fig[key]).map(({ label }) => label);
    const figureSummary = figures.length ? figures.join(', ') : 'Cap figura seleccionada';
    const roundLabel = opts.round === 0 ? 'sense' : `${opts.round}`;
    const circleLabel = opts.circleMode === 'pi-exacte' ? 'Exacte amb π' : 'Numèric';
    const parts = [
      `Abast: ${scopeLabel}`,
      `Figures: ${figureSummary}`,
      `Unitats: ${opts.units}`,
      `Arrodoniment: ${roundLabel}`,
      `Mode cercles: ${circleLabel}`,
    ];
    if (opts.requireUnits) parts.push('Cal indicar unitats a la resposta');
    return parts.join(' · ');
  },
  validate(options = {}) {
    const opts = geometryNormalize(options);
    const hasFigure = geometryFigures.some(({ key }) => opts.fig[key]);
    if (!hasFigure) {
      return 'Selecciona almenys una figura.';
    }
    return '';
  },
};

function statsDefaults() {
  return { sub: 'mmm', round: 2 };
}

function statsNormalize(options = {}) {
  const defaults = statsDefaults();
  const allowed = statsSubthemes.map((item) => item.value);
  const sub = allowed.includes(options.sub) ? options.sub : defaults.sub;
  const round = Number.isFinite(Number(options.round)) ? Number(options.round) : defaults.round;
  return { sub, round };
}

const statsDefinition = {
  defaults: statsDefaults,
  normalize: statsNormalize,
  render(options = {}) {
    const opts = statsNormalize(options);
    const radios = statsSubthemes
      .map((item) => `
        <label class="toggle"><input class="check" type="radio" name="stats-sub" value="${item.value}" ${CHECKED(opts.sub === item.value)}> ${item.label}</label>
      `)
      .join('');
    return createContainer('stats', `
      <div class="section-title">Subtemes</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes d'estadística">
          ${radios}
        </div>
      </div>
      <div class="controls">
        <label class="field chip">Decimals resultat
          <select data-field="stats-round">
            <option value="0" ${SELECTED(opts.round === 0)}>0</option>
            <option value="1" ${SELECTED(opts.round === 1)}>1</option>
            <option value="2" ${SELECTED(opts.round === 2)}>2</option>
          </select>
        </label>
      </div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="stats"]');
    if (!scope) return statsDefaults();
    const sub = getCheckedValue(scope, 'input[name="stats-sub"]:checked', 'mmm');
    const round = Number.parseInt(getValue(scope, '[data-field="stats-round"]', '2'), 10);
    return statsNormalize({ sub, round });
  },
  summarize(options = {}) {
    const opts = statsNormalize(options);
    const subInfo = statsSubthemes.find((item) => item.value === opts.sub);
    const subLabel = subInfo && subInfo.label ? subInfo.label : 'Subtema general';
    return `Subtema: ${subLabel} · Decimals: ${opts.round}`;
  },
};

function unitsDefaults() {
  return { sub: 'length', round: 2 };
}

function unitsNormalize(options = {}) {
  const defaults = unitsDefaults();
  const allowed = unitsSubthemes.map((item) => item.value);
  const sub = allowed.includes(options.sub) ? options.sub : defaults.sub;
  const round = Number.isFinite(Number(options.round)) ? Number(options.round) : defaults.round;
  return { sub, round };
}

const unitsDefinition = {
  defaults: unitsDefaults,
  normalize: unitsNormalize,
  render(options = {}) {
    const opts = unitsNormalize(options);
    const radios = unitsSubthemes
      .map((item) => `
        <label class="toggle"><input class="check" type="radio" name="units-sub" value="${item.value}" ${CHECKED(opts.sub === item.value)}> ${item.label}</label>
      `)
      .join('');
    return createContainer('units', `
      <div class="section-title">Magnitud</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes de conversions">
          ${radios}
        </div>
      </div>
      <div class="controls">
        <label class="field chip">Decimals resultat
          <select data-field="units-round">
            <option value="0" ${SELECTED(opts.round === 0)}>0</option>
            <option value="1" ${SELECTED(opts.round === 1)}>1</option>
            <option value="2" ${SELECTED(opts.round === 2)}>2</option>
          </select>
        </label>
      </div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="units"]');
    if (!scope) return unitsDefaults();
    const sub = getCheckedValue(scope, 'input[name="units-sub"]:checked', 'length');
    const round = Number.parseInt(getValue(scope, '[data-field="units-round"]', '2'), 10);
    return unitsNormalize({ sub, round });
  },
  summarize(options = {}) {
    const opts = unitsNormalize(options);
    const subInfo = unitsSubthemes.find((item) => item.value === opts.sub);
    const subLabel = subInfo && subInfo.label ? subInfo.label : 'Magnitud general';
    return `Magnitud: ${subLabel} · Decimals: ${opts.round}`;
  },
};

function equationsDefaults() {
  return {
    format: 'normal',
    degree: '1',
    range: 'small',
    forceInt: true,
    allowIncomplete: false,
    hints: false,
  };
}

function equationsNormalize(options = {}) {
  const defaults = equationsDefaults();
  const formatValues = equationFormats.map((item) => item.value);
  const degreeValues = equationDegrees.map((item) => item.value);
  const rangeValues = equationRanges.map((item) => item.value);
  const format = formatValues.includes(options.format) ? options.format : defaults.format;
  const degree = degreeValues.includes(options.degree) ? options.degree : defaults.degree;
  const range = rangeValues.includes(options.range) ? options.range : defaults.range;
  return {
    format,
    degree,
    range,
    forceInt: options.forceInt !== undefined ? Boolean(options.forceInt) : defaults.forceInt,
    allowIncomplete: Boolean(options.allowIncomplete),
    hints: Boolean(options.hints),
  };
}

const equationsDefinition = {
  defaults: equationsDefaults,
  normalize: equationsNormalize,
  render(options = {}) {
    const opts = equationsNormalize(options);
    const formatRadios = equationFormats
      .map((item) => `
        <label class="toggle"><input class="check" type="radio" name="eq-format" value="${item.value}" ${CHECKED(opts.format === item.value)}> ${item.label}</label>
      `)
      .join('');
    const degreeRadios = equationDegrees
      .map((item) => `
        <label class="toggle"><input class="check" type="radio" name="eq-degree" value="${item.value}" ${CHECKED(opts.degree === item.value)}> ${item.label}</label>
      `)
      .join('');
    const rangeOptions = equationRanges
      .map((item) => `<option value="${item.value}" ${SELECTED(opts.range === item.value)}>${item.label}</option>`) 
      .join('');
    return createContainer('eq', `
      <div class="section-title">Format</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Format de les equacions">
          ${formatRadios}
        </div>
      </div>
      <div class="section-title">Grau</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Grau de les equacions">
          ${degreeRadios}
        </div>
      </div>
      <div class="section-title">Opcions addicionals</div>
      <div class="controls">
        <label class="field chip">Coeficients (rang)
          <select data-field="eq-range">
            ${rangeOptions}
          </select>
        </label>
        <label class="toggle"><input class="check" type="checkbox" data-field="eq-int-sol" ${CHECKED(opts.forceInt)}> Força solucions enteres</label>
        <label class="toggle"><input class="check" type="checkbox" data-field="eq-incomplete" ${CHECKED(opts.allowIncomplete)}> Inclou equacions incompletes</label>
        <label class="toggle"><input class="check" type="checkbox" data-field="eq-hints" ${CHECKED(opts.hints)}> Mostrar pistes</label>
      </div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="eq"]');
    if (!scope) return equationsDefaults();
    const format = getCheckedValue(scope, 'input[name="eq-format"]:checked', 'normal');
    const degree = getCheckedValue(scope, 'input[name="eq-degree"]:checked', '1');
    const range = getValue(scope, '[data-field="eq-range"]', 'small');
    const forceInt = isChecked(scope, '[data-field="eq-int-sol"]');
    const allowIncomplete = isChecked(scope, '[data-field="eq-incomplete"]');
    const hints = isChecked(scope, '[data-field="eq-hints"]');
    return equationsNormalize({ format, degree, range, forceInt, allowIncomplete, hints });
  },
  summarize(options = {}) {
    const opts = equationsNormalize(options);
    const formatInfo = equationFormats.find((item) => item.value === opts.format);
    const formatLabel = formatInfo && formatInfo.label ? formatInfo.label : 'Format general';
    const degreeInfo = equationDegrees.find((item) => item.value === opts.degree);
    const degreeLabel = degreeInfo && degreeInfo.label ? degreeInfo.label : '1r grau';
    const rangeInfo = equationRanges.find((item) => item.value === opts.range);
    const rangeLabel = rangeInfo && rangeInfo.label ? rangeInfo.label : 'petits (−9…9)';
    const parts = [
      `Format: ${formatLabel}`,
      `Grau: ${degreeLabel}`,
      `Coeficients: ${rangeLabel}`,
    ];
    if (opts.forceInt) parts.push('Solucions enteres');
    if (opts.allowIncomplete) parts.push('Amb equacions incompletes');
    if (opts.hints) parts.push('Mostra pistes');
    return parts.join(' · ');
  },
};

function functionsDefaults() {
  return {
    types: {
      lin: true,
      quad: true,
      poly: true,
      rac: true,
      rad: true,
      exp: true,
      log: true,
    },
    aspects: {
      type: true,
      domain: false,
      intercepts: false,
      symmetry: false,
      limits: false,
      extrema: false,
      monotony: false,
    },
    difficulty: 1,
  };
}

function functionsNormalize(options = {}) {
  const defaults = functionsDefaults();
  const types = { ...defaults.types };
  const aspects = { ...defaults.aspects };
  if (options.types && typeof options.types === 'object') {
    functionTypes.forEach(({ key }) => {
      if (key in options.types) {
        types[key] = Boolean(options.types[key]);
      }
    });
  }
  if (options.aspects && typeof options.aspects === 'object') {
    functionAspects.forEach(({ key }) => {
      if (key in options.aspects) {
        aspects[key] = Boolean(options.aspects[key]);
      }
    });
  }
  const difficulty = Number.isFinite(Number(options.difficulty)) ? Number(options.difficulty) : defaults.difficulty;
  const clampedDifficulty = Math.min(Math.max(difficulty, 1), 4);
  return { types, aspects, difficulty: clampedDifficulty };
}

const functionsDefinition = {
  defaults: functionsDefaults,
  normalize: functionsNormalize,
  render(options = {}) {
    const opts = functionsNormalize(options);
    const typeOptions = functionTypes
      .map((item) => `
        <label class="toggle"><input class="check" type="checkbox" data-type="${item.key}" ${CHECKED(opts.types[item.key])}> ${item.label}</label>
      `)
      .join('');
    const aspectOptions = functionAspects
      .map((item) => `
        <label class="toggle"><input class="check" type="checkbox" data-aspect="${item.key}" ${CHECKED(opts.aspects[item.key])}> ${item.label}</label>
      `)
      .join('');
    return createContainer('func', `
      <div class="section-title">Tipus de funcions</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Tipus de funcions a practicar">
          ${typeOptions}
        </div>
      </div>
      <div class="section-title">Aspectes a treballar</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Aspectes a estudiar">
          ${aspectOptions}
        </div>
      </div>
      <div class="controls">
        <label class="field chip">Dificultat
          <select data-field="func-diff">
            <option value="1" ${SELECTED(opts.difficulty === 1)}>Bàsic</option>
            <option value="2" ${SELECTED(opts.difficulty === 2)}>Intermedi</option>
            <option value="3" ${SELECTED(opts.difficulty === 3)}>Avançat</option>
            <option value="4" ${SELECTED(opts.difficulty === 4)}>Expert</option>
          </select>
        </label>
      </div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="func"]');
    if (!scope) return functionsDefaults();
    const types = {};
    functionTypes.forEach(({ key }) => {
      types[key] = isChecked(scope, `[data-type="${key}"]`);
    });
    const aspects = {};
    functionAspects.forEach(({ key }) => {
      aspects[key] = isChecked(scope, `[data-aspect="${key}"]`);
    });
    const difficulty = Number.parseInt(getValue(scope, '[data-field="func-diff"]', '1'), 10);
    return functionsNormalize({ types, aspects, difficulty });
  },
  summarize(options = {}) {
    const opts = functionsNormalize(options);
    const activeTypes = functionTypes.filter(({ key }) => opts.types[key]).map(({ label }) => label);
    const activeAspects = functionAspects.filter(({ key }) => opts.aspects[key]).map(({ label }) => label);
    const typeSummary = activeTypes.length ? activeTypes.join(', ') : 'Cap tipus seleccionat';
    const aspectSummary = activeAspects.length ? activeAspects.join(', ') : 'Cap aspecte seleccionat';
    const difficultyLabel = functionDifficultyLabels[opts.difficulty] || functionDifficultyLabels[1];
    return `Tipus: ${typeSummary} · Aspectes: ${aspectSummary} · Dificultat: ${difficultyLabel}`;
  },
  validate(options = {}) {
    const opts = functionsNormalize(options);
    const hasType = functionTypes.some(({ key }) => opts.types[key]);
    const hasAspect = functionAspects.some(({ key }) => opts.aspects[key]);
    if (!hasType) {
      return 'Selecciona almenys un tipus de funció.';
    }
    if (!hasAspect) {
      return 'Selecciona almenys un aspecte a treballar.';
    }
    return '';
  },
};

function ortografiaDefaults() {
  return { sub: 'bv' };
}

function ortografiaNormalize(options = {}) {
  const defaults = ortografiaDefaults();
  const allowed = ortSubthemes.map((item) => item.value);
  const sub = allowed.includes(options.sub) ? options.sub : defaults.sub;
  return { sub };
}

const ortografiaDefinition = {
  defaults: ortografiaDefaults,
  normalize: ortografiaNormalize,
  render(options = {}) {
    const opts = ortografiaNormalize(options);
    const radios = ortSubthemes
      .map((item, index) => `
        <label class="toggle"><input class="check" type="radio" name="cat-ort-sub" value="${item.value}" ${CHECKED(opts.sub === item.value || (!options.sub && index === 0))}> ${item.label}</label>
      `)
      .join('');
    return createContainer('cat-ort', `
      <div class="section-title">Subtemes d'ortografia</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes d'ortografia">
          ${radios}
        </div>
      </div>
      <div class="subtitle">La resposta ha de ser exacta (accents i ela geminada inclosos).</div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="cat-ort"]');
    if (!scope) return ortografiaDefaults();
    const sub = getCheckedValue(scope, 'input[name="cat-ort-sub"]:checked', 'bv');
    return ortografiaNormalize({ sub });
  },
  summarize(options = {}) {
    const opts = ortografiaNormalize(options);
    const subInfo = ortSubthemes.find((item) => item.value === opts.sub);
    const subLabel = subInfo && subInfo.label ? subInfo.label : 'Subtema general';
    return `Subtema: ${subLabel}`;
  },
};

function morfologiaDefaults() {
  return { sub: 'basiques' };
}

function morfologiaNormalize(options = {}) {
  const defaults = morfologiaDefaults();
  const allowed = morfSubthemes.map((item) => item.value);
  const sub = allowed.includes(options.sub) ? options.sub : defaults.sub;
  return { sub };
}

const morfologiaDefinition = {
  defaults: morfologiaDefaults,
  normalize: morfologiaNormalize,
  render(options = {}) {
    const opts = morfologiaNormalize(options);
    const radios = morfSubthemes
      .map((item, index) => `
        <label class="toggle"><input class="check" type="radio" name="cat-morf-sub" value="${item.value}" ${CHECKED(opts.sub === item.value || (!options.sub && index === 0))}> ${item.label}</label>
      `)
      .join('');
    return createContainer('cat-morf', `
      <div class="section-title">Subtemes de morfologia</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes de morfologia">
          ${radios}
        </div>
      </div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="cat-morf"]');
    if (!scope) return morfologiaDefaults();
    const sub = getCheckedValue(scope, 'input[name="cat-morf-sub"]:checked', 'basiques');
    return morfologiaNormalize({ sub });
  },
  summarize(options = {}) {
    const opts = morfologiaNormalize(options);
    const subInfo = morfSubthemes.find((item) => item.value === opts.sub);
    const subLabel = subInfo && subInfo.label ? subInfo.label : 'Subtema general';
    return `Subtema: ${subLabel}`;
  },
};

const geoEuropeDefinition = createGeoDefinition('geo-europe');
const geoAmericaDefinition = createGeoDefinition('geo-america');
const geoAfricaDefinition = createGeoDefinition('geo-africa');
const geoAsiaDefinition = createGeoDefinition('geo-asia');

function getGeoModeOptions(moduleId) {
  const extras = Array.isArray(GEO_EXTRA_MODES[moduleId]) ? GEO_EXTRA_MODES[moduleId] : [];
  const seen = new Set();
  return GEO_BASE_MODES.concat(extras).filter((mode) => {
    if (!mode || typeof mode.value !== 'string') return false;
    if (seen.has(mode.value)) return false;
    seen.add(mode.value);
    return true;
  });
}

function createGeoDefinition(moduleId) {
  const modeOptions = getGeoModeOptions(moduleId);
  const defaultMode = modeOptions.length > 0 && modeOptions[0] && modeOptions[0].value
    ? modeOptions[0].value
    : 'quiz';
  const normalize = (options = {}) => {
    const candidates = [options.mode, options.sub];
    let selected = candidates.find((candidate) => typeof candidate === 'string' && modeOptions.some((mode) => mode.value === candidate));
    if (!selected) selected = defaultMode;
    return { mode: selected };
  };
  return {
    defaults: () => ({ mode: defaultMode }),
    normalize,
    render(options = {}) {
      const opts = normalize(options);
      const inputName = `${moduleId}-mode`;
      const radios = modeOptions
        .map((mode) => `
          <label class="toggle">
            <input class="check" type="radio" name="${inputName}" value="${mode.value}" ${CHECKED(opts.mode === mode.value)}>
            ${mode.label}
          </label>
        `)
        .join('');
      return createContainer(moduleId, `
        <div class="section-title">Mode de pràctica</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Modes del mòdul">
            ${radios}
          </div>
        </div>
        <div class="subtitle">Escull el tipus de pregunta per aquest examen.</div>
      `);
    },
    collect(card) {
      const scope = safeQuery(card, `[data-module-config="${moduleId}"]`);
      if (!scope) return { mode: defaultMode };
      const inputName = `${moduleId}-mode`;
      const selected = getCheckedValue(scope, `input[name="${inputName}"]:checked`, defaultMode);
      return normalize({ mode: selected });
    },
    summarize(options = {}) {
      const opts = normalize(options);
      const match = modeOptions.find((mode) => mode.value === opts.mode);
      const label = match && match.label ? match.label : 'Preguntes generals';
      return `Mode: ${label}`;
    },
  };
}

function chemDefaults() {
  return { sub: 'speed', dir: null };
}

function chemNormalize(options = {}) {
  const defaults = chemDefaults();
  const allowedSubs = Object.keys(chemModeLabels);
  const sub = allowedSubs.includes(options.sub) ? options.sub : defaults.sub;
  const allowedDirs = Object.keys(chemDirectionLabels);
  let dir = null;
  const rawDir = typeof options.dir === 'string' ? options.dir : typeof options.direction === 'string' ? options.direction : null;
  if (sub === 'speed' && rawDir && allowedDirs.includes(rawDir)) {
    dir = rawDir;
  }
  return { sub, dir };
}

const chemDefinition = {
  defaults: chemDefaults,
  normalize: chemNormalize,
  render(options = {}) {
    const opts = chemNormalize(options);
    const subRadios = Object.keys(chemModeLabels)
      .map((value) => `
        <label class="toggle">
          <input class="check" type="radio" name="chem-sub" value="${value}" ${CHECKED(opts.sub === value)}>
          ${chemModeLabels[value]}
        </label>
      `)
      .join('');
    const dirRadios = `
      <label class="toggle"><input class="check" type="radio" name="chem-dir" value="auto" ${CHECKED(!opts.dir)}> Automàtic</label>
      <label class="toggle"><input class="check" type="radio" name="chem-dir" value="sym2name" ${CHECKED(opts.dir === 'sym2name')}> Símbol → Nom</label>
      <label class="toggle"><input class="check" type="radio" name="chem-dir" value="name2sym" ${CHECKED(opts.dir === 'name2sym')}> Nom → Símbol</label>
    `;
    return createContainer('chem', `
      <div class="section-title">Mode de pràctica</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Modes del mòdul de química">
          ${subRadios}
        </div>
      </div>
      <div class="section-title">Direcció (només per al quiz ràpid)</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Direcció de resposta">
          ${dirRadios}
        </div>
      </div>
      <div class="subtitle">Si tries el quiz ràpid pots fixar si vols respondre símbol→nom, nom→símbol o deixar que es barregi automàticament.</div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="chem"]');
    if (!scope) return chemDefaults();
    const sub = getCheckedValue(scope, 'input[name="chem-sub"]:checked', 'speed');
    const dirRaw = getCheckedValue(scope, 'input[name="chem-dir"]:checked', 'auto');
    const dir = dirRaw === 'auto' ? null : dirRaw;
    return chemNormalize({ sub, dir });
  },
  summarize(options = {}) {
    const opts = chemNormalize(options);
    const parts = [`Mode: ${chemModeLabels[opts.sub] || chemModeLabels.speed}`];
    if (opts.sub === 'speed') {
      const dirLabel = opts.dir ? chemDirectionLabels[opts.dir] || chemDirectionLabels.sym2name : 'Automàtic';
      parts.push(`Direcció: ${dirLabel}`);
    }
    return parts.join(' · ');
  },
};

function chemCompoundsDefaults() {
  return { sub: 'valence' };
}

function chemCompoundsNormalize(options = {}) {
  const defaults = chemCompoundsDefaults();
  const allowed = chemCompoundSubthemes.map((item) => item.value);
  const sub = allowed.includes(options.sub) ? options.sub : defaults.sub;
  return { sub };
}

const chemCompoundsDefinition = {
  defaults: chemCompoundsDefaults,
  normalize: chemCompoundsNormalize,
  render(options = {}) {
    const opts = chemCompoundsNormalize(options);
    const radios = chemCompoundSubthemes
      .map((item, index) => `
        <label class="toggle">
          <input class="check" type="radio" name="chem-comp-sub" value="${item.value}" ${CHECKED(opts.sub === item.value || (!options.sub && index === 0))}>
          ${item.label}
        </label>
      `)
      .join('');
    return createContainer('chem-compounds', `
      <div class="section-title">Àmbit dels exercicis</div>
      <div class="controls">
        <div class="group" role="group" aria-label="Subtemes de fórmules i compostos">
          ${radios}
        </div>
      </div>
      <div class="subtitle">Escull si vols treballar valències, fórmules bàsiques o identificar compostos moleculars.</div>
    `);
  },
  collect(card) {
    const scope = safeQuery(card, '[data-module-config="chem-compounds"]');
    if (!scope) return chemCompoundsDefaults();
    const sub = getCheckedValue(scope, 'input[name="chem-comp-sub"]:checked', 'valence');
    return chemCompoundsNormalize({ sub });
  },
  summarize(options = {}) {
    const opts = chemCompoundsNormalize(options);
    const match = chemCompoundSubthemes.find((item) => item.value === opts.sub);
    const label = match && match.label ? match.label : 'Valències i ions';
    return `Subtema: ${label}`;
  },
};

export const MODULE_OPTION_DEFINITIONS = {
  arith: arithmeticDefinition,
  frac: fractionsDefinition,
  perc: percentDefinition,
  geom: geometryDefinition,
  coord: coordDefinition,
  stats: statsDefinition,
  units: unitsDefinition,
  eq: equationsDefinition,
  func: functionsDefinition,
  'cat-ort': ortografiaDefinition,
  'cat-morf': morfologiaDefinition,
  'geo-europe': geoEuropeDefinition,
  'geo-america': geoAmericaDefinition,
  'geo-africa': geoAfricaDefinition,
  'geo-asia': geoAsiaDefinition,
  chem: chemDefinition,
  'chem-compounds': chemCompoundsDefinition,
};

export function getModuleOptionDefinition(moduleId) {
  return MODULE_OPTION_DEFINITIONS[moduleId] || null;
}

export function getDefaultModuleOptions(moduleId) {
  const definition = getModuleOptionDefinition(moduleId);
  return definition ? deepClone(definition.defaults()) : {};
}

export function normalizeModuleOptions(moduleId, options) {
  const definition = getModuleOptionDefinition(moduleId);
  return definition ? definition.normalize(options) : {};
}

export function summarizeModuleOptions(moduleId, options) {
  const definition = getModuleOptionDefinition(moduleId);
  if (!definition || typeof definition.summarize !== 'function') return '';
  return definition.summarize(options);
}

export function validateModuleOptions(moduleId, options) {
  const definition = getModuleOptionDefinition(moduleId);
  if (!definition || typeof definition.validate !== 'function') return '';
  return definition.validate(options);
}

export function cloneModuleOptions(options) {
  return deepClone(options);
}
