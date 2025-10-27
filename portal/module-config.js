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
    const scope = card?.querySelector('[data-module-config="arith"]');
    if (!scope) return arithmeticDefaults();
    const ops = [];
    if (scope.querySelector('[data-field="arith-op-plus"]')?.checked) ops.push('+');
    if (scope.querySelector('[data-field="arith-op-minus"]')?.checked) ops.push('-');
    if (scope.querySelector('[data-field="arith-op-times"]')?.checked) ops.push('×');
    if (scope.querySelector('[data-field="arith-op-div"]')?.checked) ops.push('÷');
    const allowNeg = !!scope.querySelector('[data-field="arith-allow-neg"]')?.checked;
    const tri = !!scope.querySelector('[data-field="arith-tri"]')?.checked;
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
    const scope = card?.querySelector('[data-module-config="frac"]');
    if (!scope) return fractionsDefaults();
    const sub = scope.querySelector('input[name="frac-sub"]:checked')?.value || 'identify';
    const mixedGrids = !!scope.querySelector('[data-field="frac-mixed-grids"]')?.checked;
    const forceSimplest = !!scope.querySelector('[data-field="frac-force-simplest"]')?.checked;
    return fractionsNormalize({ sub, mixedGrids, forceSimplest });
  },
  summarize(options = {}) {
    const opts = fractionsNormalize(options);
    const subLabel = fractionsSubthemes.find((item) => item.value === opts.sub)?.label || 'Subtema general';
    const parts = [`Subtema: ${subLabel}`];
    parts.push(opts.mixedGrids ? 'Formes variades' : 'Formes fixes');
    if (opts.forceSimplest) parts.push('Requereix forma més simple');
    return parts.join(' · ');
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
    const scope = card?.querySelector('[data-module-config="geom"]');
    if (!scope) return geometryDefaults();
    const selectedScope = scope.querySelector('input[name="geom-scope"]:checked')?.value;
    const fig = {};
    geometryFigures.forEach(({ key }) => {
      fig[key] = !!scope.querySelector(`[data-figure="${key}"]`)?.checked;
    });
    const units = scope.querySelector('[data-field="geom-units"]')?.value || 'cm';
    const round = Number.parseInt(scope.querySelector('[data-field="geom-round"]')?.value || '2', 10);
    const circleMode = scope.querySelector('[data-field="geom-circle-mode"]')?.value || 'numeric';
    const requireUnits = !!scope.querySelector('[data-field="geom-require-units"]')?.checked;
    return geometryNormalize({ scope: selectedScope, fig, units, round, circleMode, requireUnits });
  },
  summarize(options = {}) {
    const opts = geometryNormalize(options);
    const scopeLabel = geometryScopes.find((item) => item.value === opts.scope)?.label || 'Abast general';
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
    const scope = card?.querySelector('[data-module-config="stats"]');
    if (!scope) return statsDefaults();
    const sub = scope.querySelector('input[name="stats-sub"]:checked')?.value || 'mmm';
    const round = Number.parseInt(scope.querySelector('[data-field="stats-round"]')?.value || '2', 10);
    return statsNormalize({ sub, round });
  },
  summarize(options = {}) {
    const opts = statsNormalize(options);
    const subLabel = statsSubthemes.find((item) => item.value === opts.sub)?.label || 'Subtema general';
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
    const scope = card?.querySelector('[data-module-config="units"]');
    if (!scope) return unitsDefaults();
    const sub = scope.querySelector('input[name="units-sub"]:checked')?.value || 'length';
    const round = Number.parseInt(scope.querySelector('[data-field="units-round"]')?.value || '2', 10);
    return unitsNormalize({ sub, round });
  },
  summarize(options = {}) {
    const opts = unitsNormalize(options);
    const subLabel = unitsSubthemes.find((item) => item.value === opts.sub)?.label || 'Magnitud general';
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
    const scope = card?.querySelector('[data-module-config="eq"]');
    if (!scope) return equationsDefaults();
    const format = scope.querySelector('input[name="eq-format"]:checked')?.value || 'normal';
    const degree = scope.querySelector('input[name="eq-degree"]:checked')?.value || '1';
    const range = scope.querySelector('[data-field="eq-range"]')?.value || 'small';
    const forceInt = !!scope.querySelector('[data-field="eq-int-sol"]')?.checked;
    const allowIncomplete = !!scope.querySelector('[data-field="eq-incomplete"]')?.checked;
    const hints = !!scope.querySelector('[data-field="eq-hints"]')?.checked;
    return equationsNormalize({ format, degree, range, forceInt, allowIncomplete, hints });
  },
  summarize(options = {}) {
    const opts = equationsNormalize(options);
    const formatLabel = equationFormats.find((item) => item.value === opts.format)?.label || 'Format general';
    const degreeLabel = equationDegrees.find((item) => item.value === opts.degree)?.label || '1r grau';
    const rangeLabel = equationRanges.find((item) => item.value === opts.range)?.label || 'petits (−9…9)';
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
    const scope = card?.querySelector('[data-module-config="func"]');
    if (!scope) return functionsDefaults();
    const types = {};
    functionTypes.forEach(({ key }) => {
      types[key] = !!scope.querySelector(`[data-type="${key}"]`)?.checked;
    });
    const aspects = {};
    functionAspects.forEach(({ key }) => {
      aspects[key] = !!scope.querySelector(`[data-aspect="${key}"]`)?.checked;
    });
    const difficulty = Number.parseInt(scope.querySelector('[data-field="func-diff"]')?.value || '1', 10);
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
    const scope = card?.querySelector('[data-module-config="cat-ort"]');
    if (!scope) return ortografiaDefaults();
    const sub = scope.querySelector('input[name="cat-ort-sub"]:checked')?.value || 'bv';
    return ortografiaNormalize({ sub });
  },
  summarize(options = {}) {
    const opts = ortografiaNormalize(options);
    const subLabel = ortSubthemes.find((item) => item.value === opts.sub)?.label || 'Subtema general';
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
    const scope = card?.querySelector('[data-module-config="cat-morf"]');
    if (!scope) return morfologiaDefaults();
    const sub = scope.querySelector('input[name="cat-morf-sub"]:checked')?.value || 'basiques';
    return morfologiaNormalize({ sub });
  },
  summarize(options = {}) {
    const opts = morfologiaNormalize(options);
    const subLabel = morfSubthemes.find((item) => item.value === opts.sub)?.label || 'Subtema general';
    return `Subtema: ${subLabel}`;
  },
};

export const MODULE_OPTION_DEFINITIONS = {
  arith: arithmeticDefinition,
  frac: fractionsDefinition,
  geom: geometryDefinition,
  stats: statsDefinition,
  units: unitsDefinition,
  eq: equationsDefinition,
  func: functionsDefinition,
  'cat-ort': ortografiaDefinition,
  'cat-morf': morfologiaDefinition,
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
