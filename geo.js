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
  const EUROPE_MAP_IMAGE = 'https://proyectomapamundi.com/wp-content/uploads/2018/10/mapa-mudo-europa-02.png';
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

  function poly(outer, holes = []) {
    return { outer, holes };
  }

  function rect(north, south, west, east) {
    return [
      [north, west],
      [north, east],
      [south, east],
      [south, west]
    ];
  }

  const MAP_SHAPES = {
    'Portugal': poly([
      [42.3, -9.6],
      [42.1, -6.1],
      [39.9, -6.1],
      [38.4, -7.4],
      [37.1, -7.6],
      [37.0, -9.3]
    ]),
    'Espanya': poly([
      [43.8, -9.4],
      [43.6, -1.5],
      [42.9, 3.2],
      [40.8, 3.4],
      [38.8, 1.6],
      [36.2, -0.4],
      [36.0, -5.5],
      [36.7, -9.3],
      [40.4, -9.6]
    ], [
      [
        [42.1, -9.1],
        [41.8, -6.1],
        [38.5, -6.1],
        [38.6, -8.9]
      ]
    ]),
    'França': poly([
      [51.0, -4.9],
      [50.8, 2.5],
      [49.9, 8.1],
      [44.0, 7.6],
      [42.6, 3.2],
      [43.0, -1.6],
      [45.6, -3.8]
    ]),
    'Bèlgica': poly(rect(51.5, 49.4, 2.5, 6.5)),
    'Països Baixos': poly([
      [53.6, 3.2],
      [53.5, 7.6],
      [51.2, 7.6],
      [51.3, 3.4]
    ]),
    'Luxemburg': poly(rect(50.2, 49.3, 5.4, 6.6)),
    'Alemanya': poly([
      [55.1, 5.7],
      [54.9, 15.2],
      [47.4, 15.0],
      [47.4, 6.1]
    ]),
    'Itàlia': poly([
      [46.9, 6.6],
      [47.0, 12.4],
      [45.2, 18.6],
      [40.4, 18.9],
      [36.7, 15.5],
      [37.5, 12.0],
      [39.5, 8.8],
      [43.2, 7.0]
    ]),
    'Suïssa': poly(rect(47.9, 45.7, 5.9, 10.7)),
    'Àustria': poly([
      [49.0, 9.4],
      [48.8, 17.2],
      [46.3, 16.9],
      [46.2, 10.3]
    ]),
    'Regne Unit': poly([
      [58.8, -8.7],
      [58.6, 1.8],
      [50.0, 1.4],
      [49.9, -5.8]
    ]),
    'Irlanda': poly([
      [55.5, -10.6],
      [55.1, -6.0],
      [51.4, -6.0],
      [51.5, -10.4]
    ]),
    'Islàndia': poly(rect(66.7, 63.0, -24.5, -13.0)),
    'Noruega': poly([
      [71.2, 5.0],
      [70.9, 30.5],
      [65.5, 30.0],
      [63.2, 14.0],
      [58.2, 6.0],
      [58.4, 4.5]
    ]),
    'Suècia': poly([
      [69.4, 11.5],
      [69.0, 24.5],
      [55.0, 24.3],
      [55.2, 12.0],
      [60.0, 11.5]
    ]),
    'Finlàndia': poly([
      [69.9, 20.0],
      [69.5, 31.5],
      [60.2, 31.2],
      [60.5, 23.0],
      [65.0, 20.2]
    ]),
    'Dinamarca': poly([
      [57.8, 8.0],
      [57.7, 12.7],
      [54.4, 12.7],
      [54.5, 8.1]
    ]),
    'Estònia': poly(rect(59.8, 57.3, 21.5, 28.3)),
    'Letònia': poly(rect(58.2, 55.6, 20.7, 28.2)),
    'Lituània': poly(rect(56.5, 54.3, 20.9, 26.8)),
    'Polònia': poly([
      [54.9, 14.3],
      [54.7, 24.0],
      [49.0, 24.0],
      [49.2, 15.0]
    ]),
    'Txèquia': poly(rect(51.1, 48.4, 12.0, 18.9)),
    'Eslovàquia': poly(rect(49.6, 47.7, 16.8, 22.6)),
    'Hongria': poly(rect(48.7, 45.7, 16.0, 22.9)),
    'Eslovènia': poly(rect(47.1, 45.3, 13.2, 16.6)),
    'Croàcia': poly([
      [46.5, 13.5],
      [46.4, 16.5],
      [45.5, 18.7],
      [44.0, 18.9],
      [42.5, 18.1],
      [43.5, 14.5]
    ]),
    'Bòsnia i Hercegovina': poly([
      [45.2, 16.0],
      [45.0, 19.5],
      [42.7, 19.2],
      [42.8, 16.2]
    ]),
    'Sèrbia': poly([
      [46.0, 18.7],
      [45.8, 22.9],
      [42.2, 22.5],
      [42.3, 19.3]
    ]),
    'Albània': poly(rect(42.7, 39.6, 19.0, 21.1)),
    'Grècia': poly([
      [41.5, 19.6],
      [41.2, 28.3],
      [35.0, 28.3],
      [35.2, 20.3]
    ]),
    'Bulgària': poly(rect(44.3, 41.1, 22.3, 28.6)),
    'Romania': poly([
      [48.3, 20.5],
      [48.1, 29.7],
      [43.7, 29.4],
      [44.2, 22.1]
    ]),
    'Andorra': poly(rect(42.7, 42.3, 1.3, 1.8)),
    'Liechtenstein': poly(rect(47.3, 47.0, 9.4, 9.7)),
    'San Marino': poly(rect(44.1, 43.9, 12.4, 12.6))
  };

  const MAP_BOUNDS = {
    west: -24.5,
    east: 34,
    north: 72,
    south: 34
  };

  const MAP_COUNTRIES = EUROPE_COUNTRIES.filter(c => MAP_LOCATIONS[c.name]);

  const MAP_POINTS = MAP_COUNTRIES.map(c => {
    const loc = MAP_LOCATIONS[c.name];
    return {
      name: c.name,
      lat: loc.lat,
      lon: loc.lon
    };
  });

  const MAP_POLYGONS = MAP_COUNTRIES.map(c => {
    const shape = MAP_SHAPES[c.name];
    if (!shape) return null;
    const coords = [shape.outer];
    if (Array.isArray(shape.holes)) {
      shape.holes.forEach(hole => coords.push(hole));
    }
    return {
      name: c.name,
      coords
    };
  }).filter(Boolean);

  if (typeof window !== 'undefined') {
    window.__FOCUS_GEO__ = window.__FOCUS_GEO__ || {};
    window.__FOCUS_GEO__.europe = {
      points: MAP_POINTS,
      polygons: MAP_POLYGONS,
      bounds: MAP_BOUNDS,
      image: EUROPE_MAP_IMAGE
    };
  }

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
      return `
        <button type="button" class="geo-map-point" data-country="${c.name}" style="left:${coords.x}%;top:${coords.y}%" aria-label="${c.name}">
          <span class="geo-map-pin" aria-hidden="true"></span>
          <span class="sr-only">${c.name}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="geo-map" data-answer="${countryName}">
        <div class="geo-map-leaflet" role="application" aria-label="Mapa interactiu d'Europa"></div>
        <div class="geo-map-fallback">
          <div class="geo-map-inner">
           <img class="geo-map-image" src="${EUROPE_MAP_IMAGE}" alt="Mapa mut d'Europa" loading="lazy" decoding="async">
            <div class="geo-map-canvas">
              ${points}
            </div>
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
