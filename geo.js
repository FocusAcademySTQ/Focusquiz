/* =======================================================
   Focus Academy · Geografia d'Europa (mòduls externs)
   Arxiu: geo.js
   ======================================================= */

(function(){
  const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  const clampLevel = (lvl) => Math.max(1, Math.min(4, parseInt(lvl, 10) || 1));

  const FLAG_BASE_URL = 'https://flagcdn.com';
  const EUROPE_MAP_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Blank_map_of_Europe.svg';
  const FLAG_CODE_BY_COUNTRY = {
    'Espanya': 'es',
    'França': 'fr',
    'Alemanya': 'de',
    'Itàlia': 'it',
    'Regne Unit': 'gb',
    'Portugal': 'pt',
    'Bèlgica': 'be',
    'Països Baixos': 'nl',
    'Irlanda': 'ie',
    'Àustria': 'at',
    'Suïssa': 'ch',
    'Luxemburg': 'lu',
    'Polònia': 'pl',
    'Txèquia': 'cz',
    'Hongria': 'hu',
    'Grècia': 'gr',
    'Suècia': 'se',
    'Noruega': 'no',
    'Finlàndia': 'fi',
    'Dinamarca': 'dk',
    'Islàndia': 'is',
    'Estònia': 'ee',
    'Letònia': 'lv',
    'Lituània': 'lt',
    'Eslovènia': 'si',
    'Croàcia': 'hr',
    'Eslovàquia': 'sk',
    'Romania': 'ro',
    'Bulgària': 'bg',
    'Sèrbia': 'rs',
    'Albània': 'al',
    'Bòsnia i Hercegovina': 'ba',
    'Andorra': 'ad',
    'Liechtenstein': 'li',
    'San Marino': 'sm'
  };

  const getFlagUrl = (country, size = 'svg') => {
    const code = FLAG_CODE_BY_COUNTRY[country?.name];
    if (!code) return null;
    if (size === 'svg') return `${FLAG_BASE_URL}/${code}.svg`;
    return `${FLAG_BASE_URL}/${size}/${code}.png`;
  };

  const EUROPE_COUNTRIES = [
    {
      name: 'Espanya',
      capital: 'Madrid',
      flag: '🇪🇸',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        'Comparteix la península Ibèrica amb Portugal.',
        'Té comunitats autònomes com Catalunya i Andalusia.'
      ],
      neighbors: ['França', 'Portugal', 'Andorra'],
      groups: ['iberia', 'mediterrani']
    },
    {
      name: 'França',
      capital: 'París',
      flag: '🇫🇷',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        'Té costa a l\'Atlàntic i al Mediterrani i la capital és París.',
        'Inclou territoris d\'ultramar com Guadalupe i Martinica.'
      ],
      neighbors: ['Espanya', 'Itàlia', 'Alemanya', 'Bèlgica', 'Luxemburg', 'Suïssa', 'Andorra', 'Mònaco'],
      groups: ['mediterrani', 'europa-occidental']
    },
    {
      name: 'Alemanya',
      capital: 'Berlín',
      flag: '🇩🇪',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        'És el país més poblat de la Unió Europea i la seva capital és Berlín.',
        'Fa frontera amb nou països diferents al centre d\'Europa.'
      ],
      neighbors: ['Dinamarca', 'Països Baixos', 'Bèlgica', 'Luxemburg', 'França', 'Suïssa', 'Àustria', 'Txèquia', 'Polònia'],
      groups: ['europa-central']
    },
    {
      name: 'Itàlia',
      capital: 'Roma',
      flag: '🇮🇹',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        'Forma una bota al Mediterrani amb la capital a Roma.',
        'A l\'interior té els microestats de San Marino i Ciutat del Vaticà.'
      ],
      neighbors: ['França', 'Suïssa', 'Àustria', 'Eslovènia', 'San Marino'],
      groups: ['mediterrani']
    },
    {
      name: 'Regne Unit',
      capital: 'Londres',
      flag: '🇬🇧',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        'Està format per Anglaterra, Escòcia, Gal·les i Irlanda del Nord.',
        'El seu parlament es troba a Westminster, Londres.'
      ],
      neighbors: ['Irlanda'],
      groups: ['illes-britaniques']
    },
    {
      name: 'Portugal',
      capital: 'Lisboa',
      flag: '🇵🇹',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        'És el país més occidental de l\'Europa continental.',
        'Inclou les illes de Madeira i les Açores.'
      ],
      neighbors: ['Espanya'],
      groups: ['iberia', 'mediterrani']
    },
    {
      name: 'Bèlgica',
      capital: 'Brussel·les',
      flag: '🇧🇪',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        'La seva capital també acull la seu principal de la Unió Europea.',
        'Està dividida en les regions de Flandes, Valònia i Brussel·les.'
      ],
      neighbors: ['França', 'Països Baixos', 'Alemanya', 'Luxemburg'],
      groups: ['europa-occidental']
    },
    {
      name: 'Països Baixos',
      capital: 'Amsterdam',
      flag: '🇳🇱',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        'Una gran part del territori és sota el nivell del mar.',
        'Té ciutats com Amsterdam, Rotterdam i Utrecht.'
      ],
      neighbors: ['Bèlgica', 'Alemanya'],
      groups: ['europa-occidental']
    },
    {
      name: 'Irlanda',
      capital: 'Dublín',
      flag: '🇮🇪',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        'És una illa verda a l\'oceà Atlàntic amb capital a Dublín.',
        'Comparteix illa amb Irlanda del Nord.'
      ],
      neighbors: ['Regne Unit'],
      groups: ['illes-britaniques']
    },
    {
      name: 'Àustria',
      capital: 'Viena',
      flag: '🇦🇹',
      difficulty: 2,
      coastal: false,
      landlocked: true,
      clues: [
        'País alpí amb la capital musical de Viena.',
        'No té sortida al mar i limita amb vuit països.'
      ],
      neighbors: ['Alemanya', 'Txèquia', 'Eslovàquia', 'Hongria', 'Eslovènia', 'Itàlia', 'Suïssa', 'Liechtenstein'],
      groups: ['alps', 'europa-central']
    },
    {
      name: 'Suïssa',
      capital: 'Berna',
      flag: '🇨🇭',
      difficulty: 2,
      coastal: false,
      landlocked: true,
      clues: [
        'És coneguda pels Alps i per la seva neutralitat política.',
        'La seva capital federal és Berna.'
      ],
      neighbors: ['França', 'Alemanya', 'Àustria', 'Itàlia', 'Liechtenstein'],
      groups: ['alps', 'europa-central']
    },
    {
      name: 'Luxemburg',
      capital: 'Luxemburg',
      flag: '🇱🇺',
      difficulty: 2,
      coastal: false,
      landlocked: true,
      clues: [
        'És un gran ducat al cor d\'Europa.',
        'És un dels països amb PIB per càpita més alt del món.'
      ],
      neighbors: ['Bèlgica', 'França', 'Alemanya'],
      groups: ['europa-occidental']
    },
    {
      name: 'Polònia',
      capital: 'Varsòvia',
      flag: '🇵🇱',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        'La seva capital és Varsòvia i té costa al mar Bàltic.',
        'Va formar part del bloc de l\'Est durant la Guerra Freda.'
      ],
      neighbors: ['Alemanya', 'Txèquia', 'Eslovàquia', 'Lituània'],
      groups: ['europa-central']
    },
    {
      name: 'Txèquia',
      capital: 'Praga',
      flag: '🇨🇿',
      difficulty: 2,
      coastal: false,
      landlocked: true,
      clues: [
        'La seva capital és Praga, famosa pel pont de Carles.',
        'Va formar amb Eslovàquia l\'antiga Txecoslovàquia.'
      ],
      neighbors: ['Alemanya', 'Polònia', 'Àustria', 'Eslovàquia'],
      groups: ['europa-central']
    },
    {
      name: 'Hongria',
      capital: 'Budapest',
      flag: '🇭🇺',
      difficulty: 2,
      coastal: false,
      landlocked: true,
      clues: [
        'La capital Budapest està travessada pel Danubi.',
        'El seu idioma pertany a la família úgrica.'
      ],
      neighbors: ['Àustria', 'Eslovàquia', 'Ucraïna', 'Romania', 'Sèrbia', 'Croàcia', 'Eslovènia'],
      groups: ['europa-central']
    },
    {
      name: 'Grècia',
      capital: 'Atenes',
      flag: '🇬🇷',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        'Bressol de la democràcia amb capital a Atenes.',
        'Compta amb milers d\'illes a la mar Egea i la Mediterrània.'
      ],
      neighbors: ['Albània', 'Macedònia del Nord', 'Bulgària', 'Turquia'],
      groups: ['mediterrani', 'balcans']
    },
    {
      name: 'Suècia',
      capital: 'Estocolm',
      flag: '🇸🇪',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'País nòrdic amb capital a Estocolm.',
        'El seu territori inclou milers d\'illes a l\'arxipèlag.'
      ],
      neighbors: ['Noruega', 'Finlàndia'],
      groups: ['nordic']
    },
    {
      name: 'Noruega',
      capital: 'Oslo',
      flag: '🇳🇴',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'Té fiords espectaculars i la capital és Oslo.',
        'Comparteix la península escandinava amb Suècia.'
      ],
      neighbors: ['Suècia', 'Finlàndia'],
      groups: ['nordic']
    },
    {
      name: 'Finlàndia',
      capital: 'Hèlsinki',
      flag: '🇫🇮',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'Terra dels llacs amb capital a Hèlsinki.',
        'Té frontera amb Rússia, Suècia i Noruega.'
      ],
      neighbors: ['Suècia', 'Noruega'],
      groups: ['nordic']
    },
    {
      name: 'Dinamarca',
      capital: 'Copenhaguen',
      flag: '🇩🇰',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'País nòrdic connectat a Suècia pel pont d\'Øresund.',
        'El seu territori inclou la península de Jutlàndia i moltes illes.'
      ],
      neighbors: ['Alemanya'],
      groups: ['nordic']
    },
    {
      name: 'Islàndia',
      capital: 'Reykjavík',
      flag: '🇮🇸',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'Illa volcànica a l\'Atlàntic Nord amb capital a Reykjavík.',
        'És famosa per les aurores boreals i els guèisers.'
      ],
      neighbors: [],
      groups: ['nordic']
    },
    {
      name: 'Estònia',
      capital: 'Tallinn',
      flag: '🇪🇪',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'Una de les repúbliques bàltiques amb capital a Tallinn.',
        'És un dels països més digitalitzats del món.'
      ],
      neighbors: ['Letònia'],
      groups: ['baltic']
    },
    {
      name: 'Letònia',
      capital: 'Riga',
      flag: '🇱🇻',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'País bàltic amb capital a Riga.',
        'La seva bandera és d\'un to borgonya distintiu.'
      ],
      neighbors: ['Estònia', 'Lituània'],
      groups: ['baltic']
    },
    {
      name: 'Lituània',
      capital: 'Vílnius',
      flag: '🇱🇹',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'Antiga unió amb Polònia, capital a Vílnius.',
        'És el més gran dels països bàltics.'
      ],
      neighbors: ['Letònia', 'Polònia'],
      groups: ['baltic']
    },
    {
      name: 'Eslovènia',
      capital: 'Ljubljana',
      flag: '🇸🇮',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'Petit país alpí amb accés a l\'Adriàtic.',
        'La seva capital és Ljubljana.'
      ],
      neighbors: ['Itàlia', 'Àustria', 'Hongria', 'Croàcia'],
      groups: ['balcans', 'alps']
    },
    {
      name: 'Croàcia',
      capital: 'Zagreb',
      flag: '🇭🇷',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'La seva costa adriàtica està plena d\'illes.',
        'La capital és Zagreb.'
      ],
      neighbors: ['Eslovènia', 'Hongria', 'Sèrbia', 'Bòsnia i Hercegovina', 'Montenegro'],
      groups: ['balcans']
    },
    {
      name: 'Eslovàquia',
      capital: 'Bratislava',
      flag: '🇸🇰',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        'Va formar part de Txecoslovàquia fins al 1993.',
        'La seva capital Bratislava està a tocar de Viena.'
      ],
      neighbors: ['Txèquia', 'Polònia', 'Ucraïna', 'Hongria', 'Àustria'],
      groups: ['europa-central']
    },
    {
      name: 'Romania',
      capital: 'Bucarest',
      flag: '🇷🇴',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'Terra de la llegenda de Dràcula amb capital a Bucarest.',
        'El riu Danubi desemboca aquí al mar Negre.'
      ],
      neighbors: ['Hongria', 'Sèrbia', 'Bulgària'],
      groups: ['balcans']
    },
    {
      name: 'Bulgària',
      capital: 'Sofia',
      flag: '🇧🇬',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        'Capital a Sofia i costa al mar Negre.',
        'Utilitza l\'alfabet ciríl·lic.'
      ],
      neighbors: ['Romania', 'Sèrbia', 'Macedònia del Nord', 'Grècia'],
      groups: ['balcans']
    },
    {
      name: 'Sèrbia',
      capital: 'Belgrad',
      flag: '🇷🇸',
      difficulty: 4,
      coastal: false,
      landlocked: true,
      clues: [
        'La seva capital és Belgrad, on s\'uneixen el Danubi i el Sava.',
        'És un dels països centrals de la península balcànica.'
      ],
      neighbors: ['Hongria', 'Romania', 'Bulgària', 'Macedònia del Nord', 'Kosovo', 'Bòsnia i Hercegovina', 'Croàcia', 'Montenegro'],
      groups: ['balcans']
    },
    {
      name: 'Albània',
      capital: 'Tirana',
      flag: '🇦🇱',
      difficulty: 4,
      coastal: true,
      landlocked: false,
      clues: [
        'La seva capital és Tirana i la bandera mostra un àguila bicèfala.',
        'Situat a la costa adriàtica, és veí de Grècia i Montenegro.'
      ],
      neighbors: ['Montenegro', 'Kosovo', 'Macedònia del Nord', 'Grècia'],
      groups: ['balcans']
    },
    {
      name: 'Bòsnia i Hercegovina',
      capital: 'Sarajevo',
      flag: '🇧🇦',
      difficulty: 4,
      coastal: true,
      landlocked: false,
      clues: [
        'La seva capital Sarajevo va acollir els Jocs Olímpics d\'hivern 1984.',
        'Té una sortida al mar Adriàtic molt curta a Neum.'
      ],
      neighbors: ['Croàcia', 'Sèrbia', 'Montenegro'],
      groups: ['balcans']
    },
    {
      name: 'Andorra',
      capital: 'Andorra la Vella',
      flag: '🇦🇩',
      difficulty: 4,
      coastal: false,
      landlocked: true,
      clues: [
        'Microestat als Pirineus entre Espanya i França.',
        'La capital és Andorra la Vella.'
      ],
      neighbors: ['Espanya', 'França'],
      groups: ['microstate']
    },
    {
      name: 'Liechtenstein',
      capital: 'Vaduz',
      flag: '🇱🇮',
      difficulty: 4,
      coastal: false,
      landlocked: true,
      clues: [
        'Microestat alpí entre Suïssa i Àustria.',
        'La capital és Vaduz.'
      ],
      neighbors: ['Suïssa', 'Àustria'],
      groups: ['microstate', 'alps']
    },
    {
      name: 'San Marino',
      capital: 'Ciutat de San Marino',
      flag: '🇸🇲',
      difficulty: 4,
      coastal: false,
      landlocked: true,
      clues: [
        'Una de les repúbliques més antigues del món.',
        'Està completament envoltada per Itàlia.'
      ],
      neighbors: ['Itàlia'],
      groups: ['microstate']
    }
  ];

  const MAP_LOCATIONS = {
    'Portugal': { lat: 39.5, lon: -8.0 },
    'Espanya': { lat: 40.2, lon: -3.7 },
    'França': { lat: 46.2, lon: 2.2 },
    'Bèlgica': { lat: 50.5, lon: 4.7 },
    'Països Baixos': { lat: 52.1, lon: 5.3 },
    'Luxemburg': { lat: 49.8, lon: 6.1 },
    'Alemanya': { lat: 51.2, lon: 10.4 },
    'Itàlia': { lat: 41.9, lon: 12.6 },
    'Suïssa': { lat: 46.8, lon: 8.3 },
    'Àustria': { lat: 47.5, lon: 14.5 },
    'Regne Unit': { lat: 55.4, lon: -3.4 },
    'Irlanda': { lat: 53.1, lon: -8.0 },
    'Islàndia': { lat: 64.9, lon: -18.6 },
    'Noruega': { lat: 62.3, lon: 10.0 },
    'Suècia': { lat: 61.0, lon: 15.0 },
    'Finlàndia': { lat: 64.0, lon: 26.0 },
    'Dinamarca': { lat: 56.0, lon: 9.0 },
    'Estònia': { lat: 58.6, lon: 25.0 },
    'Letònia': { lat: 56.9, lon: 24.0 },
    'Lituània': { lat: 55.2, lon: 24.0 },
    'Polònia': { lat: 52.1, lon: 19.1 },
    'Txèquia': { lat: 49.8, lon: 15.3 },
    'Eslovàquia': { lat: 48.7, lon: 19.7 },
    'Hongria': { lat: 47.2, lon: 19.1 },
    'Eslovènia': { lat: 46.1, lon: 14.8 },
    'Croàcia': { lat: 45.1, lon: 16.4 },
    'Bòsnia i Hercegovina': { lat: 44.1, lon: 17.8 },
    'Sèrbia': { lat: 44.0, lon: 20.7 },
    'Albània': { lat: 41.2, lon: 20.0 },
    'Grècia': { lat: 39.0, lon: 22.0 },
    'Bulgària': { lat: 42.7, lon: 25.5 },
    'Romania': { lat: 45.9, lon: 24.9 },
    'Andorra': { lat: 42.6, lon: 1.5 },
    'Liechtenstein': { lat: 47.1, lon: 9.6 },
    'San Marino': { lat: 43.9, lon: 12.5 }
  };

  const MAP_BOUNDS = {
    west: -25,
    east: 45,
    north: 72,
    south: 34
  };

  const MAP_COUNTRIES = EUROPE_COUNTRIES.filter(c => MAP_LOCATIONS[c.name]);

  function projectToPercent(name) {
    const loc = MAP_LOCATIONS[name];
    if (!loc) return null;
    const { west, east, north, south } = MAP_BOUNDS;
    const rangeLon = east - west;
    const rangeLat = north - south;
    if (rangeLon <= 0 || rangeLat <= 0) return null;
    const x = ((loc.lon - west) / rangeLon) * 100;
    const y = ((north - loc.lat) / rangeLat) * 100;
    return {
      x: Math.min(96, Math.max(4, x)),
      y: Math.min(96, Math.max(4, y))
    };
  }

  const GROUP_LABELS = {
    baltic: 'els Països Bàltics',
    mediterrani: 'els països mediterranis',
    nordic: 'els països nòrdics',
    balcans: 'la península balcànica',
    alps: 'la regió alpina',
    iberia: 'la península Ibèrica',
    microstate: 'els microestats europeus',
    'illes-britaniques': 'les Illes Britàniques'
  };

  const allNames = EUROPE_COUNTRIES.map(c => c.name);
  const allCapitals = EUROPE_COUNTRIES.map(c => c.capital);

  function makeOptions(correct, pool, count = 3) {
    const available = pool.filter(item => item !== correct);
    const picks = [];
    const copy = available.slice();
    while (picks.length < count && copy.length) {
      const idx = Math.floor(Math.random() * copy.length);
      picks.push(copy.splice(idx, 1)[0]);
    }
    if (picks.length < count) return null;
    return shuffle(picks.concat(correct));
  }

  function questionFromClue(country, pool) {
    const hint = choice(country.clues);
    const options = makeOptions(country.name, pool.map(c => c.name));
    if (!options) return null;
    return {
      type: 'geo-clue',
      text: `Quin país d\'Europa descriu aquesta pista? <br><strong>${hint}</strong>`,
      options,
      answer: country.name
    };
  }

  function questionCapitalFromCountry(country, pool) {
    const options = makeOptions(country.capital, pool.map(c => c.capital));
    if (!options) return null;
    return {
      type: 'geo-capital',
      text: `Quina és la capital de <strong>${country.name}</strong>?`,
      options,
      answer: country.capital
    };
  }

  function questionCountryFromCapital(country, pool) {
    const options = makeOptions(country.name, pool.map(c => c.name));
    if (!options) return null;
    return {
      type: 'geo-capital',
      text: `A quin país pertany la capital <strong>${country.capital}</strong>?`,
      options,
      answer: country.name
    };
  }

  function questionFromFlag(country, pool) {
    const flagUrl = getFlagUrl(country);
    if (!flagUrl && !country.flag) return null;
    const options = makeOptions(country.name, pool.map(c => c.name));
    if (!options) return null;
    const card = flagUrl
      ? `<div class="flag-card" role="img" aria-label="Bandera de ${country.name}"><img src="${flagUrl}" alt="Bandera de ${country.name}" loading="lazy" decoding="async"></div>`
      : `<div class="flag-card" role="img" aria-label="Bandera de ${country.name}">${country.flag}</div>`;
    return {
      type: 'geo-flag',
      text: 'A quin país pertany aquesta bandera?',
      html: card,
      options,
      answer: country.name
    };
  }

  function questionNeighbor(country, pool) {
    const validNeighbors = (country.neighbors || []).filter(n => allNames.includes(n));
    if (!validNeighbors.length) return null;
    const correct = choice(validNeighbors);
    const wrongOptions = makeOptions(correct, allNames.filter(n => !validNeighbors.includes(n) && n !== country.name));
    if (!wrongOptions) return null;
    return {
      type: 'geo-neighbor',
      text: `Quin d\'aquests països fa <strong>frontera</strong> amb ${country.name}?`,
      options: wrongOptions,
      answer: correct
    };
  }

  function questionLandlocked(pool) {
    const inland = pool.filter(c => c.landlocked);
    if (!inland.length) return null;
    const coastal = pool.filter(c => !c.landlocked);
    if (coastal.length < 3) return null;
    const country = choice(inland);
    const options = makeOptions(country.name, coastal.map(c => c.name));
    if (!options) return null;
    return {
      type: 'geo-landlocked',
      text: 'Quin d\'aquests països <strong>no té sortida al mar</strong>?',
      options,
      answer: country.name
    };
  }

  function questionGroup(pool) {
    const keys = Object.keys(GROUP_LABELS);
    const pickable = keys.map(key => ({
      key,
      members: EUROPE_COUNTRIES.filter(c => c.groups && c.groups.includes(key))
    })).filter(entry => entry.members.length >= 1);
    if (!pickable.length) return null;
    const selected = choice(pickable);
    const members = selected.members;
    const allowed = members.filter(c => pool.includes(c));
    if (!allowed.length) return null;
    const country = choice(allowed);
    const label = GROUP_LABELS[selected.key];
    const options = makeOptions(country.name, allNames.filter(n => !members.some(m => m.name === n)));
    if (!options) return null;
    return {
      type: 'geo-group',
      text: `Quin d\'aquests països forma part de ${label}?`,
      options,
      answer: country.name
    };
  }

  function renderMap(countryName) {
    const points = MAP_COUNTRIES.map(c => {
      const coords = projectToPercent(c.name);
      if (!coords) return '';
      const flagUrl = getFlagUrl(c, 'w80');
      const icon = flagUrl
        ? `<img src="${flagUrl}" alt="" loading="lazy" decoding="async">`
        : `<span class="geo-map-point-fallback">${c.flag || '•'}</span>`;
      return `
        <button type="button" class="geo-map-point" data-country="${c.name}" style="left:${coords.x}%;top:${coords.y}%" aria-label="${c.name}">
          ${icon}
        </button>
      `;
    }).join('');

    return `
      <div class="geo-map" data-answer="${countryName}">
        <div class="geo-map-inner">
          <img class="geo-map-image" src="${EUROPE_MAP_IMAGE}" alt="Mapa polític d'Europa" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/europe-map.svg';">
          <div class="geo-map-canvas">
            ${points}
          </div>
        </div>
        <p class="geo-map-help">Clica sobre el país correcte al mapa interactiu.</p>
      </div>
    `;
  }

  function questionMap(country) {
    if (!country || !MAP_LOCATIONS[country.name]) return null;
    return {
      type: 'geo-map',
      text: `On es troba <strong>${country.name}</strong> al mapa d'Europa?`,
      answer: country.name,
      html: renderMap(country.name)
    };
  }

  function genGeoEurope(level, opts = {}) {
    const L = clampLevel(level);
    const pool = EUROPE_COUNTRIES.filter(c => c.difficulty <= L);
    const mode = opts.mode || 'quiz';

    if (mode === 'flag') {
      for (let attempts = 0; attempts < 6; attempts++) {
        const country = choice(pool);
        if (!country) break;
        const q = questionFromFlag(country, pool);
        if (q) return q;
      }
    } else if (mode === 'map') {
      const mapPool = pool.filter(c => MAP_LOCATIONS[c.name]);
      if (mapPool.length) {
        const country = choice(mapPool);
        const q = questionMap(country);
        if (q) return q;
      }
    } else {
      const modes = ['clue', 'country-capital'];
      if (L >= 1) modes.push('capital-country');
      if (L >= 3) modes.push('neighbor');
      if (L >= 4) modes.push('landlocked', 'group');

      for (let attempts = 0; attempts < 8; attempts++) {
        const modeKey = choice(modes);
        const country = choice(pool);
        let q = null;
        if (!country) continue;
        switch (modeKey) {
          case 'clue':
            q = questionFromClue(country, pool);
            break;
          case 'country-capital':
            q = questionCapitalFromCountry(country, pool);
            break;
          case 'capital-country':
            q = questionCountryFromCapital(country, pool);
            break;
          case 'neighbor':
            q = questionNeighbor(country, pool);
            break;
          case 'landlocked':
            q = questionLandlocked(pool);
            break;
          case 'group':
            q = questionGroup(pool);
            break;
        }
        if (q) return q;
      }
    }

    // Fallback senzill
    const fallbackPool = (mode === 'map') ? MAP_COUNTRIES.filter(c => c.difficulty <= L) : pool;
    const fallbackCountry = choice(fallbackPool.length ? fallbackPool : EUROPE_COUNTRIES);
    if (!fallbackCountry) {
      return {
        type: 'geo-capital',
        text: 'Indica la capital d\'un país europeu (mode de reserva).',
        options: ['París'],
        answer: 'París'
      };
    }

    if (mode === 'map' && MAP_LOCATIONS[fallbackCountry.name]) {
      const mapQuestion = questionMap(fallbackCountry);
      if (mapQuestion) return mapQuestion;
    }

    const options = makeOptions(fallbackCountry.capital, allCapitals);
    return {
      type: 'geo-capital',
      text: `Quina és la capital de <strong>${fallbackCountry.name}</strong>?`,
      options: options || [fallbackCountry.capital],
      answer: fallbackCountry.capital
    };
  }

  const GeoEuropeConfig = {
    render() {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div class="section-title">Mode de pràctica</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Modes del mòdul Països d'Europa">
            <label class="toggle">
              <input class="check" type="radio" name="geo-mode" value="quiz" checked>
              Preguntes generals
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="geo-mode" value="flag">
              Banderes
            </label>
            <label class="toggle">
              <input class="check" type="radio" name="geo-mode" value="map">
              Mapa interactiu
            </label>
          </div>
        </div>
        <p class="subtitle">Escull el tipus de pràctica: capital i fronteres, identificació de banderes o localització al mapa.</p>
      `;
      return wrap;
    },
    collect() {
      const value = (document.querySelector('input[name="geo-mode"]:checked') || {}).value || 'quiz';
      return { mode: value };
    }
  };

  const GEO_MODULES = [
    {
      id: 'geo-europe',
      name: 'Països d\'Europa',
      desc: 'Localitza països, capitals, banderes i fronteres europees.',
      category: 'geo',
      gen: genGeoEurope,
      config: GeoEuropeConfig
    }
  ];

  if (typeof window.addModules === 'function') {
    window.addModules(GEO_MODULES);
  } else {
    window._PENDING_GEO_MODULES_ = GEO_MODULES;
    window.addEventListener('DOMContentLoaded', () => {
      if (typeof window.addModules === 'function' && window._PENDING_GEO_MODULES_) {
        window.addModules(window._PENDING_GEO_MODULES_);
        delete window._PENDING_GEO_MODULES_;
      }
    });
  }
})();
