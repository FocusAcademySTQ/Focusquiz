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
    'San Marino': 'sm',
    'Canadà': 'ca',
    'Estats Units': 'us',
    'Mèxic': 'mx',
    'Guatemala': 'gt',
    'Hondures': 'hn',
    'El Salvador': 'sv',
    'Nicaragua': 'ni',
    'Costa Rica': 'cr',
    'Panamà': 'pa',
    'Cuba': 'cu',
    'República Dominicana': 'do',
    'Haití': 'ht',
    'Colòmbia': 'co',
    'Veneçuela': 've',
    'Equador': 'ec',
    'Perú': 'pe',
    'Bolívia': 'bo',
    'Xile': 'cl',
    'Argentina': 'ar',
    'Uruguai': 'uy',
    'Paraguai': 'py',
    'Brasil': 'br',
    'Guyana': 'gy',
    'Surinam': 'sr',
    'Egipte': 'eg',
    'Marroc': 'ma',
    'Algèria': 'dz',
    'Tunísia': 'tn',
    'Líbia': 'ly',
    'Sudan': 'sd',
    'Sudan del Sud': 'ss',
    'Etiòpia': 'et',
    'Somàlia': 'so',
    'Kenya': 'ke',
    'Tanzània': 'tz',
    'Uganda': 'ug',
    'Ruanda': 'rw',
    'Burundi': 'bi',
    'República Democràtica del Congo': 'cd',
    'República del Congo': 'cg',
    'Nigèria': 'ng',
    'Ghana': 'gh',
    'Costa d\'Ivori': 'ci',
    'Senegal': 'sn',
    'Mali': 'ml',
    'Níger': 'ne',
    'Txad': 'td',
    'Camerun': 'cm',
    'Angola': 'ao',
    'Moçambic': 'mz',
    'Madagascar': 'mg',
    'Namíbia': 'na',
    'Botswana': 'bw',
    'Zimbabwe': 'zw',
    'Zàmbia': 'zm',
    'Sud-àfrica': 'za',
    'Lesotho': 'ls',
    'Eswatini': 'sz',
    'Xina': 'cn',
    'Japó': 'jp',
    'Corea del Sud': 'kr',
    'Corea del Nord': 'kp',
    'Índia': 'in',
    'Pakistan': 'pk',
    'Bangla Desh': 'bd',
    'Nepal': 'np',
    'Bhutan': 'bt',
    'Sri Lanka': 'lk',
    'Myanmar': 'mm',
    'Tailàndia': 'th',
    'Vietnam': 'vn',
    'Laos': 'la',
    'Cambodja': 'kh',
    'Malàisia': 'my',
    'Singapur': 'sg',
    'Indonèsia': 'id',
    'Filipines': 'ph',
    'Brunei': 'bn',
    'Aràbia Saudita': 'sa',
    'Iran': 'ir',
    'Iraq': 'iq',
    'Israel': 'il',
    'Jordània': 'jo',
    'Síria': 'sy',
    'Turquia': 'tr',
    'Qatar': 'qa',
    'Emirats Àrabs Units': 'ae',
    'Oman': 'om',
    'Iemen': 'ye',
    'Kazakhstan': 'kz',
    'Uzbekistan': 'uz',
    'Tadjikistan': 'tj',
    'Kirguizstan': 'kg',
    'Turkmenistan': 'tm',
    'Mongòlia': 'mn'
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

  const EUROPE_GROUP_LABELS = {
    baltic: 'els Països Bàltics',
    mediterrani: 'els països mediterranis',
    nordic: 'els països nòrdics',
    balcans: 'la península balcànica',
    alps: 'la regió alpina',
    iberia: 'la península Ibèrica',
    microstate: 'els microestats europeus',
    'illes-britaniques': 'les Illes Britàniques'
  };

  const AMERICA_COUNTRIES = [
    {
      name: 'Canadà',
      capital: 'Ottawa',
      flag: '🇨🇦',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "És el país més gran d'Amèrica per superfície i té deu províncies i tres territoris.",
        "La seva bandera mostra una fulla d'arce vermella al centre."
      ],
      neighbors: ['Estats Units'],
      groups: ['nord-america', 'angloamerica']
    },
    {
      name: 'Estats Units',
      capital: 'Washington, DC',
      flag: '🇺🇸',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "És el tercer país més gran del món i la seva capital és Washington, DC.",
        "Està format per 50 estats i té Alaska separada al nord-oest del Canadà."
      ],
      neighbors: ['Canadà', 'Mèxic'],
      groups: ['nord-america', 'angloamerica']
    },
    {
      name: 'Mèxic',
      capital: 'Ciutat de Mèxic',
      flag: '🇲🇽',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "Comparteix la península de Yucatán i té deserts com el de Sonora.",
        "La seva capital està construïda sobre l'antiga ciutat asteca de Tenochtitlan."
      ],
      neighbors: ['Estats Units', 'Guatemala'],
      groups: ['nord-america', 'mesoamerica']
    },
    {
      name: 'Guatemala',
      capital: 'Ciutat de Guatemala',
      flag: '🇬🇹',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Conserva temples maies com els de Tikal a la selva del Petén.",
        "La seva bandera té un quetzal, l'ocell nacional, al centre."
      ],
      neighbors: ['Mèxic', 'Hondures', 'El Salvador'],
      groups: ['mesoamerica']
    },
    {
      name: 'Hondures',
      capital: 'Tegucigalpa',
      flag: '🇭🇳',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Té una costa a la mar Carib i una altra al Pacífic a través del golf de Fonseca.",
        "El seu nom prové de les grans profunditats que hi van trobar els exploradors espanyols."
      ],
      neighbors: ['Guatemala', 'El Salvador', 'Nicaragua'],
      groups: ['mesoamerica']
    },
    {
      name: 'El Salvador',
      capital: 'San Salvador',
      flag: '🇸🇻',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "És el país més petit de l'Amèrica continental i està ple de volcans.",
        "La seva costa està banyada pel Pacífic, sense sortida al Carib."
      ],
      neighbors: ['Guatemala', 'Hondures'],
      groups: ['mesoamerica']
    },
    {
      name: 'Nicaragua',
      capital: 'Managua',
      flag: '🇳🇮',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "És conegut com la terra dels llacs i els volcans, amb el llac més gran d'Amèrica Central.",
        "Comparteix el golf de Fonseca amb Hondures i El Salvador."
      ],
      neighbors: ['Hondures', 'Costa Rica'],
      groups: ['mesoamerica']
    },
    {
      name: 'Costa Rica',
      capital: 'San José',
      flag: '🇨🇷',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "És famosa pels parcs nacionals i per no tenir exèrcit des del 1948.",
        "Entre el Pacífic i el Carib, connecta amb Nicaragua al nord i Panamà al sud."
      ],
      neighbors: ['Nicaragua', 'Panamà'],
      groups: ['mesoamerica']
    },
    {
      name: 'Panamà',
      capital: 'Ciutat de Panamà',
      flag: '🇵🇦',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "El seu canal uneix els oceans Atlàntic i Pacífic i és vital per al comerç mundial.",
        "Separa Amèrica Central d'Amèrica del Sud."
      ],
      neighbors: ['Costa Rica', 'Colòmbia'],
      groups: ['mesoamerica']
    },
    {
      name: 'Cuba',
      capital: "L'Havana",
      flag: '🇨🇺',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "És la major illa del Carib i la seva capital és L'Havana.",
        "Fou un centre important de la guerra freda al Carib."
      ],
      neighbors: [],
      groups: ['carib']
    },
    {
      name: 'República Dominicana',
      capital: 'Santo Domingo',
      flag: '🇩🇴',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Comparteix l'illa d'Hispaniola amb Haití i la seva capital és Santo Domingo.",
        "Va ser la primera colònia europea permanent a Amèrica."
      ],
      neighbors: ['Haití'],
      groups: ['carib']
    },
    {
      name: 'Haití',
      capital: 'Port-au-Prince',
      flag: '🇭🇹',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "És el primer estat llatinoamericà que va proclamar la independència d'una colònia esclavista.",
        "Comparteix l'illa amb la República Dominicana."
      ],
      neighbors: ['República Dominicana'],
      groups: ['carib']
    },
    {
      name: 'Colòmbia',
      capital: 'Bogotà',
      flag: '🇨🇴',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "Té costa tant al Carib com al Pacífic i la seva capital és Bogotà.",
        "És un dels països megadiversos amb selva amazònica i Andes."
      ],
      neighbors: ['Panamà', 'Veneçuela', 'Equador', 'Perú', 'Brasil'],
      groups: ['andina', 'amazonia', 'carib']
    },
    {
      name: 'Veneçuela',
      capital: 'Caracas',
      flag: '🇻🇪',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Allotja el salt d'aigua més alt del món, el Salto Ángel.",
        "Exporta petroli del cinturó de l'Orinoco."
      ],
      neighbors: ['Colòmbia', 'Brasil', 'Guyana'],
      groups: ['andina', 'carib']
    },
    {
      name: 'Equador',
      capital: 'Quito',
      flag: '🇪🇨',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "El seu nom prové de la línia equatorial que el travessa.",
        "Inclou les illes Galápagos a l'oceà Pacífic."
      ],
      neighbors: ['Colòmbia', 'Perú'],
      groups: ['andina', 'amazonia']
    },
    {
      name: 'Perú',
      capital: 'Lima',
      flag: '🇵🇪',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "Conté la ciutat inca de Machu Picchu a la serralada dels Andes.",
        "El riu Amazones neix a les seves muntanyes."
      ],
      neighbors: ['Equador', 'Colòmbia', 'Brasil', 'Bolívia', 'Xile'],
      groups: ['andina', 'amazonia']
    },
    {
      name: 'Bolívia',
      capital: 'Sucre',
      flag: '🇧🇴',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "Té dues capitals: Sucre (constitucional) i La Paz (seu del govern).",
        "El Salar d'Uyuni és el desert de sal més gran del món."
      ],
      neighbors: ['Perú', 'Brasil', 'Paraguai', 'Argentina', 'Xile'],
      groups: ['andina', 'amazonia']
    },
    {
      name: 'Xile',
      capital: 'Santiago de Xile',
      flag: '🇨🇱',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "S'estén llargament al llarg de l'oceà Pacífic i inclou el desert d'Atacama.",
        "La seva forma estreta recorre gran part de la costa sud-americana."
      ],
      neighbors: ['Perú', 'Bolívia', 'Argentina'],
      groups: ['cone-sud']
    },
    {
      name: 'Argentina',
      capital: 'Buenos Aires',
      flag: '🇦🇷',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "La Pampa i la Patagònia ocupen gran part del país, amb capital a Buenos Aires.",
        "Comparteix les cascades d'Iguazú amb el Brasil."
      ],
      neighbors: ['Xile', 'Bolívia', 'Paraguai', 'Brasil', 'Uruguai'],
      groups: ['cone-sud']
    },
    {
      name: 'Uruguai',
      capital: 'Montevideo',
      flag: '🇺🇾',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "És un dels països més petits de Sud-amèrica amb costa al Riu de la Plata.",
        "La seva capital és Montevideo, famosa per la Rambla costanera."
      ],
      neighbors: ['Argentina', 'Brasil'],
      groups: ['cone-sud']
    },
    {
      name: 'Paraguai',
      capital: 'Asunción',
      flag: '🇵🇾',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "És un dels dos països sense litoral de Sud-amèrica, travessat pels rius Paraguai i Paraná.",
        "Comparteix la represa hidroelèctrica d'Itaipú amb el Brasil."
      ],
      neighbors: ['Bolívia', 'Brasil', 'Argentina'],
      groups: ['cone-sud']
    },
    {
      name: 'Brasil',
      capital: 'Brasília',
      flag: '🇧🇷',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "És el país més gran de Sud-amèrica i el portuguès és la seva llengua oficial.",
        "La selva amazònica cobreix gran part del seu territori."
      ],
      neighbors: ['Uruguai', 'Argentina', 'Paraguai', 'Bolívia', 'Perú', 'Colòmbia', 'Veneçuela', 'Guyana', 'Surinam'],
      groups: ['amazonia', 'cone-sud']
    },
    {
      name: 'Guyana',
      capital: 'Georgetown',
      flag: '🇬🇾',
      difficulty: 4,
      coastal: true,
      landlocked: false,
      clues: [
        "És l'únic país de Sud-amèrica on l'anglès és llengua oficial.",
        "Es troba a la regió històrica de la Guaiana al nord del continent."
      ],
      neighbors: ['Veneçuela', 'Brasil', 'Surinam'],
      groups: ['amazonia', 'carib']
    },
    {
      name: 'Surinam',
      capital: 'Paramaribo',
      flag: '🇸🇷',
      difficulty: 4,
      coastal: true,
      landlocked: false,
      clues: [
        "Va ser colònia neerlandesa i encara utilitza el neerlandès com a llengua oficial.",
        "Més del 90% del seu territori està cobert de selva tropical."
      ],
      neighbors: ['Guyana', 'Brasil'],
      groups: ['amazonia', 'carib']
    }
  ];

  const AMERICA_GROUP_LABELS = {
    'nord-america': 'Amèrica del Nord',
    angloamerica: "els països anglosaxons d'Amèrica",
    mesoamerica: 'Mesoamèrica',
    carib: 'el Carib',
    andina: 'els països andins',
    'cone-sud': 'el Con Sud',
    amazonia: "l'Amazònia"
  };

  const AFRICA_COUNTRIES = [
    {
      name: 'Egipte',
      capital: 'El Caire',
      flag: '🇪🇬',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "Banyat pel Mediterrani i el mar Roig, acull les piràmides de Gizeh.",
        "El riu Nil travessa el país de sud a nord."
      ],
      neighbors: ['Líbia', 'Sudan'],
      groups: ['magreb']
    },
    {
      name: 'Marroc',
      capital: 'Rabat',
      flag: '🇲🇦',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "Té ciutats imperials com Marrakech i Fes.",
        "Controla l'estret de Gibraltar des de la seva costa nord."
      ],
      neighbors: ['Algèria'],
      groups: ['magreb']
    },
    {
      name: 'Algèria',
      capital: 'Alger',
      flag: '🇩🇿',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "És el país més extens d'Àfrica amb gran part coberta pel Sàhara.",
        "Va aconseguir la independència de França el 1962 després d'una llarga guerra."
      ],
      neighbors: ['Marroc', 'Tunísia', 'Líbia', 'Níger', 'Mali'],
      groups: ['magreb', 'sahel']
    },
    {
      name: 'Tunísia',
      capital: 'Tunis',
      flag: '🇹🇳',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Hi ha les ruïnes de Cartago i la capital moderna és Tunis.",
        "És el país més petit del Magrib."
      ],
      neighbors: ['Algèria', 'Líbia'],
      groups: ['magreb']
    },
    {
      name: 'Líbia',
      capital: 'Trípoli',
      flag: '🇱🇾',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "Gran part del territori és desert i conté reserves de petroli importants.",
        "Les ciutats principals són Trípoli i Bengasi."
      ],
      neighbors: ['Tunísia', 'Algèria', 'Níger', 'Txad', 'Sudan', 'Egipte'],
      groups: ['magreb', 'sahel']
    },
    {
      name: 'Sudan',
      capital: 'Khartum',
      flag: '🇸🇩',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Els rius Nil Blau i Nil Blanc es troben a Khartum.",
        "Es va dividir el 2011 amb la independència del Sudan del Sud."
      ],
      neighbors: ['Egipte', 'Líbia', 'Txad', 'Sudan del Sud', 'Etiòpia'],
      groups: ['sahel']
    },
    {
      name: 'Sudan del Sud',
      capital: 'Juba',
      flag: '🇸🇸',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "És el país més jove del món, independent des del 2011.",
        "Gran part del seu territori és sabana i aiguamolls del Nil."
      ],
      neighbors: ['Sudan', 'Etiòpia', 'Kenya', 'Uganda', 'República Democràtica del Congo'],
      groups: ['sahel']
    },
    {
      name: 'Etiòpia',
      capital: 'Addis Abeba',
      flag: '🇪🇹',
      difficulty: 2,
      coastal: false,
      landlocked: true,
      clues: [
        "És el país més antic independent d'Àfrica i seu de la Unió Africana.",
        "Mai va ser colonitzat completament i utilitza un calendari propi."
      ],
      neighbors: ['Sudan', 'Sudan del Sud', 'Kenya', 'Somàlia'],
      groups: ['banya', 'africa-oriental']
    },
    {
      name: 'Somàlia',
      capital: 'Mogadiscio',
      flag: '🇸🇴',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "Forma el Banya d'Àfrica amb una llarga costa a l'oceà Índic.",
        "La seva bandera és blava amb una estrella blanca de cinc puntes."
      ],
      neighbors: ['Etiòpia', 'Kenya'],
      groups: ['banya', 'africa-oriental']
    },
    {
      name: 'Kenya',
      capital: 'Nairobi',
      flag: '🇰🇪',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "És famosa pels safaris i la vall del Rift travessa el país.",
        "La muntanya més alta és el Kilimanjaro, compartit amb Tanzània."
      ],
      neighbors: ['Somàlia', 'Etiòpia', 'Sudan del Sud', 'Uganda', 'Tanzània'],
      groups: ['africa-oriental', 'grans-llacs']
    },
    {
      name: 'Tanzània',
      capital: 'Dodoma',
      flag: '🇹🇿',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Inclou les illes de Zanzíbar i Pemba a l'oceà Índic.",
        "El parc Serengeti és una de les reserves de fauna més famoses."
      ],
      neighbors: ['Kenya', 'Uganda', 'Ruanda', 'Burundi', 'República Democràtica del Congo', 'Zàmbia', 'Moçambic'],
      groups: ['africa-oriental', 'grans-llacs', 'africa-austral']
    },
    {
      name: 'Uganda',
      capital: 'Kampala',
      flag: '🇺🇬',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "És conegut com la perla d'Àfrica per la seva biodiversitat.",
        "El llac Victòria es troba al sud del país."
      ],
      neighbors: ['Sudan del Sud', 'Kenya', 'Tanzània', 'Ruanda', 'República Democràtica del Congo'],
      groups: ['grans-llacs', 'africa-oriental']
    },
    {
      name: 'Ruanda',
      capital: 'Kigali',
      flag: '🇷🇼',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "És conegut com el país de les mil colles per les seves muntanyes.",
        "Va patir un genocidi el 1994, però avui aposta per la tecnologia."
      ],
      neighbors: ['Uganda', 'Tanzània', 'Burundi', 'República Democràtica del Congo'],
      groups: ['grans-llacs']
    },
    {
      name: 'Burundi',
      capital: 'Gitega',
      flag: '🇧🇮',
      difficulty: 4,
      coastal: false,
      landlocked: true,
      clues: [
        "És un petit país muntanyós al voltant del llac Tanganyika.",
        "La seva economia es basa sobretot en l'agricultura."
      ],
      neighbors: ['Ruanda', 'Tanzània', 'República Democràtica del Congo'],
      groups: ['grans-llacs']
    },
    {
      name: 'República Democràtica del Congo',
      capital: 'Kinshasa',
      flag: '🇨🇩',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "És el segon país més extens d'Àfrica i està cobert majoritàriament per selva.",
        "El riu Congo és vital per al transport i l'energia hidroelèctrica."
      ],
      neighbors: ['Sudan del Sud', 'Uganda', 'Ruanda', 'Burundi', 'Tanzània', 'Zàmbia', 'Angola', 'República del Congo'],
      groups: ['africa-central', 'grans-llacs']
    },
    {
      name: 'República del Congo',
      capital: 'Brazzaville',
      flag: '🇨🇬',
      difficulty: 4,
      coastal: true,
      landlocked: false,
      clues: [
        "La seva capital Brazzaville està davant de Kinshasa separades pel riu Congo.",
        "Gran part del país està cobert de selva equatorial."
      ],
      neighbors: ['Camerun', 'Angola', 'República Democràtica del Congo'],
      groups: ['africa-central']
    },
    {
      name: 'Nigèria',
      capital: 'Abuja',
      flag: '🇳🇬',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "És el país africà més poblat i el petroli és un recurs clau.",
        "La ciutat de Lagos és un dels ports més actius del continent."
      ],
      neighbors: ['Níger', 'Txad', 'Camerun'],
      groups: ['africa-occidental']
    },
    {
      name: 'Ghana',
      capital: 'Accra',
      flag: '🇬🇭',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Va ser el primer país subsaharià a aconseguir la independència el 1957.",
        "És famós per la costa dels castells i el cacau."
      ],
      neighbors: ["Costa d'Ivori"],
      groups: ['africa-occidental']
    },
    {
      name: "Costa d'Ivori",
      capital: 'Yamoussoukro',
      flag: '🇨🇮',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "La capital política és Yamoussoukro però la ciutat més gran és Abidjan.",
        "És un dels principals productors de cacau del món."
      ],
      neighbors: ['Ghana', 'Mali'],
      groups: ['africa-occidental']
    },
    {
      name: 'Senegal',
      capital: 'Dakar',
      flag: '🇸🇳',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "La seva capital Dakar acull el llac Rosa i el ral·li París-Dakar històric.",
        "Envolta gairebé completament el petit país de Gàmbia."
      ],
      neighbors: ['Mali'],
      groups: ['africa-occidental']
    },
    {
      name: 'Mali',
      capital: 'Bamako',
      flag: '🇲🇱',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "Antigament va acollir l'imperi de Tombuctú, centre de comerç transsaharià.",
        "El riu Níger travessa el país de sud-oest a nord-est."
      ],
      neighbors: ['Senegal', "Costa d'Ivori", 'Níger', 'Algèria'],
      groups: ['sahel', 'africa-occidental']
    },
    {
      name: 'Níger',
      capital: 'Niamey',
      flag: '🇳🇪',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "Gran part del seu territori és desert, amb oasis com els de l'Aïr.",
        "Comparteix el riu Níger amb Mali i Nigèria."
      ],
      neighbors: ['Algèria', 'Líbia', 'Txad', 'Nigèria', 'Mali'],
      groups: ['sahel']
    },
    {
      name: 'Txad',
      capital: "N'Djamena",
      flag: '🇹🇩',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "Conté el llac Txad, una font important d'aigua per a la regió del Sahel.",
        "La seva bandera és similar a la de Romania, amb franges blau, groc i vermell."
      ],
      neighbors: ['Líbia', 'Sudan', 'Camerun', 'Nigèria', 'Níger'],
      groups: ['sahel']
    },
    {
      name: 'Camerun',
      capital: 'Yaoundé',
      flag: '🇨🇲',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "Es coneix com l'Àfrica en miniatura per la varietat de climes i paisatges.",
        "El mont Camerun és un volcà actiu proper a la costa."
      ],
      neighbors: ['Nigèria', 'Txad', 'República del Congo'],
      groups: ['africa-central']
    },
    {
      name: 'Angola',
      capital: 'Luanda',
      flag: '🇦🇴',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "És un important productor de petroli i diamants al sud-oest d'Àfrica.",
        "La seva capital Luanda és un port atlàntic destacat."
      ],
      neighbors: ['República Democràtica del Congo', 'Zàmbia', 'Namíbia', 'República del Congo'],
      groups: ['africa-central', 'africa-austral']
    },
    {
      name: 'Moçambic',
      capital: 'Maputo',
      flag: '🇲🇿',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "L'oceà Índic banya les seves costes amb illes com Bazaruto.",
        "La bandera mostra una eina agrícola i un fusell sobre un llibre."
      ],
      neighbors: ['Tanzània', 'Zàmbia', 'Zimbabwe', 'Sud-àfrica', 'Eswatini'],
      groups: ['africa-oriental', 'africa-austral']
    },
    {
      name: 'Madagascar',
      capital: 'Antananarivo',
      flag: '🇲🇬',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "És una gran illa a l'oceà Índic amb fauna única com els lèmurs.",
        "La seva biodiversitat és excepcional per l'aïllament geogràfic."
      ],
      neighbors: [],
      groups: ['illes']
    },
    {
      name: 'Namíbia',
      capital: 'Windhoek',
      flag: '🇳🇦',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "El desert del Namib té algunes de les dunes més altes del món.",
        "Va obtenir la independència de Sud-àfrica el 1990."
      ],
      neighbors: ['Angola', 'Zàmbia', 'Botswana', 'Sud-àfrica'],
      groups: ['africa-austral']
    },
    {
      name: 'Botswana',
      capital: 'Gaborone',
      flag: '🇧🇼',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "És conegut pel delta de l'Okavango, que desguassa al desert del Kalahari.",
        "És un dels països africans més estables políticament."
      ],
      neighbors: ['Namíbia', 'Zimbabwe', 'Sud-àfrica', 'Zàmbia'],
      groups: ['africa-austral']
    },
    {
      name: 'Zimbabwe',
      capital: 'Harare',
      flag: '🇿🇼',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "Comparteix amb Zàmbia les cascades Victòria al riu Zambeze.",
        "El seu nom prové de les ruïnes de Gran Zimbabwe."
      ],
      neighbors: ['Zàmbia', 'Moçambic', 'Sud-àfrica', 'Botswana'],
      groups: ['africa-austral']
    },
    {
      name: 'Zàmbia',
      capital: 'Lusaka',
      flag: '🇿🇲',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "El riu Zambeze i les mines de coure són vitals per a la seva economia.",
        "Comparteix el llac Kariba amb Zimbabwe."
      ],
      neighbors: ['Angola', 'República Democràtica del Congo', 'Tanzània', 'Moçambic', 'Zimbabwe', 'Botswana', 'Namíbia'],
      groups: ['africa-austral', 'africa-central']
    },
    {
      name: 'Sud-àfrica',
      capital: 'Pretòria',
      flag: '🇿🇦',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "Té tres capitals: Pretòria (administrativa), Ciutat del Cap (legislativa) i Bloemfontein (judicial).",
        "El parc Kruger és una reserva emblemàtica de fauna."
      ],
      neighbors: ['Namíbia', 'Botswana', 'Zimbabwe', 'Moçambic', 'Lesotho', 'Eswatini'],
      groups: ['africa-austral']
    },
    {
      name: 'Lesotho',
      capital: 'Maseru',
      flag: '🇱🇸',
      difficulty: 4,
      coastal: false,
      landlocked: true,
      clues: [
        "És un enclavament completament envoltat per Sud-àfrica.",
        "La major part del seu territori es troba a gran altitud."
      ],
      neighbors: ['Sud-àfrica'],
      groups: ['africa-austral']
    },
    {
      name: 'Eswatini',
      capital: 'Mbabane',
      flag: '🇸🇿',
      difficulty: 4,
      coastal: false,
      landlocked: true,
      clues: [
        "Anteriorment conegut com a Swazilàndia, és una monarquia absoluta.",
        "Comparteix fronteres amb Sud-àfrica i Moçambic."
      ],
      neighbors: ['Sud-àfrica', 'Moçambic'],
      groups: ['africa-austral']
    }
  ];

  const AFRICA_GROUP_LABELS = {
    magreb: 'el Magrib',
    sahel: 'el Sahel',
    'africa-occidental': 'Àfrica Occidental',
    'africa-central': 'Àfrica Central',
    'africa-oriental': 'Àfrica Oriental',
    'grans-llacs': 'la regió dels Grans Llacs',
    'africa-austral': 'Àfrica Austral',
    banya: "el Banya d'Àfrica",
    illes: "les illes de l'oceà Índic"
  };

  const ASIA_COUNTRIES = [
    {
      name: 'Xina',
      capital: 'Pequín',
      flag: '🇨🇳',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "És el país més poblat del món i té la Gran Muralla com a símbol.",
        "Beijing (Pequín) va acollir els Jocs Olímpics d'estiu i d'hivern."
      ],
      neighbors: ['Mongòlia', 'Kazakhstan', 'Kirguizstan', 'Tadjikistan', 'Afganistan', 'Pakistan', 'Índia', 'Nepal', 'Bhutan', 'Myanmar', 'Laos', 'Vietnam', 'Corea del Nord', 'Rússia'],
      groups: ['extrem-orient']
    },
    {
      name: 'Japó',
      capital: 'Tòquio',
      flag: '🇯🇵',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "Arxipèlag d'illes volcàniques amb una cultura tecnològica avançada.",
        "La ciutat de Tòquio és una de les metròpolis més poblades del món."
      ],
      neighbors: [],
      groups: ['extrem-orient', 'illes']
    },
    {
      name: 'Corea del Sud',
      capital: 'Seül',
      flag: '🇰🇷',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "És famosa per la tecnologia i la música K-pop.",
        "Comparteix la península coreana amb Corea del Nord."
      ],
      neighbors: ['Corea del Nord'],
      groups: ['extrem-orient']
    },
    {
      name: 'Corea del Nord',
      capital: 'Pyongyang',
      flag: '🇰🇵',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "És un estat molt aïllat amb economia planificada.",
        "La zona desmilitaritzada separa el país del sud."
      ],
      neighbors: ['Corea del Sud', 'Xina'],
      groups: ['extrem-orient']
    },
    {
      name: 'Índia',
      capital: 'Nova Delhi',
      flag: '🇮🇳',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "És el país democràtic més poblat i té una gran diversitat lingüística.",
        "El Taj Mahal es troba a Agra."
      ],
      neighbors: ['Pakistan', 'Nepal', 'Bhutan', 'Bangla Desh', 'Myanmar', 'Xina'],
      groups: ['sud-asia']
    },
    {
      name: 'Pakistan',
      capital: 'Islamabad',
      flag: '🇵🇰',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Va néixer el 1947 quan es va dividir la Índia britànica.",
        "Conté algunes de les muntanyes més altes del món a l'Himàlaia i el Karakoram."
      ],
      neighbors: ['Índia', 'Xina'],
      groups: ['sud-asia']
    },
    {
      name: 'Bangla Desh',
      capital: 'Dacca',
      flag: '🇧🇩',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Està travessat pels rius Ganges i Brahmaputra, formant un gran delta.",
        "És un dels països més densament poblats del món."
      ],
      neighbors: ['Índia', 'Myanmar'],
      groups: ['sud-asia']
    },
    {
      name: 'Nepal',
      capital: 'Katmandú',
      flag: '🇳🇵',
      difficulty: 2,
      coastal: false,
      landlocked: true,
      clues: [
        "Acull l'Everest, el cim més alt del món.",
        "La seva bandera és l'única no rectangular, formada per dos triangles."
      ],
      neighbors: ['Índia', 'Xina'],
      groups: ['sud-asia', 'asia-central']
    },
    {
      name: 'Bhutan',
      capital: 'Thimphu',
      flag: '🇧🇹',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "Mesura la felicitat nacional bruta com a indicador de progrés.",
        "És un petit regne himalaic situat entre Índia i Xina."
      ],
      neighbors: ['Índia', 'Xina'],
      groups: ['sud-asia']
    },
    {
      name: 'Sri Lanka',
      capital: 'Sri Jayawardenapura Kotte',
      flag: '🇱🇰',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "És una illa al sud de l'Índia famosa pel te de Ceilan.",
        "La capital administrativa és diferent de la ciutat més gran, Colombo."
      ],
      neighbors: ['Índia'],
      groups: ['sud-asia', 'illes']
    },
    {
      name: 'Myanmar',
      capital: 'Naipyidó',
      flag: '🇲🇲',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "Antigament conegut com a Birmània, està a la cruïlla entre el sud i el sud-est d'Àsia.",
        "Conserva temples antics com els de Bagan."
      ],
      neighbors: ['Bangla Desh', 'Índia', 'Xina', 'Laos', 'Tailàndia'],
      groups: ['sud-est']
    },
    {
      name: 'Tailàndia',
      capital: 'Bangkok',
      flag: '🇹🇭',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "Mai va ser colonitzada per potències europees i és famosa per les platges i temples.",
        "La ciutat de Bangkok és el seu principal centre econòmic."
      ],
      neighbors: ['Myanmar', 'Laos', 'Cambodja', 'Malàisia'],
      groups: ['sud-est']
    },
    {
      name: 'Vietnam',
      capital: 'Hanoi',
      flag: '🇻🇳',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "S'estén en forma de S al llarg del mar de la Xina Meridional.",
        "La badia de Ha Long és Patrimoni de la Humanitat."
      ],
      neighbors: ['Laos', 'Cambodja', 'Xina'],
      groups: ['sud-est']
    },
    {
      name: 'Laos',
      capital: 'Vientiane',
      flag: '🇱🇦',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "És l'únic país sense litoral del sud-est asiàtic.",
        "El riu Mekong recorre gran part del seu territori."
      ],
      neighbors: ['Myanmar', 'Xina', 'Vietnam', 'Cambodja', 'Tailàndia'],
      groups: ['sud-est']
    },
    {
      name: 'Cambodja',
      capital: 'Nom Pen',
      flag: '🇰🇭',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Acull el complex de temples d'Angkor Wat, un dels més grans del món.",
        "El llac Tonle Sap és clau per a l'agricultura i la pesca."
      ],
      neighbors: ['Tailàndia', 'Laos', 'Vietnam'],
      groups: ['sud-est']
    },
    {
      name: 'Malàisia',
      capital: 'Kuala Lumpur',
      flag: '🇲🇾',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Està dividida entre la península Malaia i l'illa de Borneo.",
        "Les Torres Petronas van ser els edificis més alts del món als anys noranta."
      ],
      neighbors: ['Tailàndia', 'Singapur', 'Indonèsia', 'Brunei'],
      groups: ['sud-est']
    },
    {
      name: 'Singapur',
      capital: 'Singapur',
      flag: '🇸🇬',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "És una ciutat-estat insular molt desenvolupada econòmicament.",
        "Serveix de hub financer i logístic al sud-est asiàtic."
      ],
      neighbors: ['Malàisia', 'Indonèsia'],
      groups: ['sud-est', 'illes']
    },
    {
      name: 'Indonèsia',
      capital: 'Jakarta',
      flag: '🇮🇩',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "És l'arxipèlag més gran del món amb milers d'illes.",
        "L'illa de Java concentra la major part de la població."
      ],
      neighbors: ['Malàisia', 'Papua Nova Guinea', 'Timor Oriental', 'Singapur', 'Filipines'],
      groups: ['sud-est', 'illes']
    },
    {
      name: 'Filipines',
      capital: 'Manila',
      flag: '🇵🇭',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Arxipèlag al Pacífic amb més de 7.000 illes.",
        "La seva cultura combina influències hispanes i asiàtiques."
      ],
      neighbors: ['Indonèsia'],
      groups: ['sud-est', 'illes']
    },
    {
      name: 'Brunei',
      capital: 'Bandar Seri Begawan',
      flag: '🇧🇳',
      difficulty: 4,
      coastal: true,
      landlocked: false,
      clues: [
        "És un petit sultanat ric en petroli situat a l'illa de Borneo.",
        "Comparteix frontera amb Malàisia i té dues parts separades."
      ],
      neighbors: ['Malàisia'],
      groups: ['sud-est', 'illes']
    },
    {
      name: 'Mongòlia',
      capital: 'Ulán Bator',
      flag: '🇲🇳',
      difficulty: 2,
      coastal: false,
      landlocked: true,
      clues: [
        "És la terra de Genguis Khan amb estepes immenses.",
        "Té una de les densitats de població més baixes del món."
      ],
      neighbors: ['Rússia', 'Xina'],
      groups: ['asia-central']
    },
    {
      name: 'Kazakhstan',
      capital: 'Astana',
      flag: '🇰🇿',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "És el país sense sortida a oceans més gran del món, però té costa al mar Caspi.",
        "La seva capital s'anomena Astana, abans Nur-Sultan."
      ],
      neighbors: ['Rússia', 'Xina', 'Kirguizstan', 'Uzbekistan', 'Turkmenistan'],
      groups: ['asia-central']
    },
    {
      name: 'Uzbekistan',
      capital: 'Taixkent',
      flag: '🇺🇿',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "Conserva ciutats històriques de la Ruta de la Seda com Samarcanda i Bukhara.",
        "És un dels dos països doblement sense litoral del món."
      ],
      neighbors: ['Kazakhstan', 'Kirguizstan', 'Tadjikistan', 'Afganistan', 'Turkmenistan'],
      groups: ['asia-central']
    },
    {
      name: 'Tadjikistan',
      capital: 'Duixanbé',
      flag: '🇹🇯',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "És molt muntanyós, amb la serralada del Pamir.",
        "Va formar part de l'antiga Unió Soviètica."
      ],
      neighbors: ['Uzbekistan', 'Kirguizstan', 'Xina', 'Afganistan'],
      groups: ['asia-central']
    },
    {
      name: 'Kirguizstan',
      capital: 'Bixkek',
      flag: '🇰🇬',
      difficulty: 3,
      coastal: false,
      landlocked: true,
      clues: [
        "El llac Issyk-Kul és un gran llac alpí de muntanya.",
        "La cultura nòmada i les iurtes formen part del seu patrimoni."
      ],
      neighbors: ['Kazakhstan', 'Uzbekistan', 'Tadjikistan', 'Xina'],
      groups: ['asia-central']
    },
    {
      name: 'Turkmenistan',
      capital: 'Aixgabat',
      flag: '🇹🇲',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "Té un paisatge majoritàriament desèrtic amb el Karakum.",
        "El cràter de Darvaza s'anomena la Porta de l'Infern."
      ],
      neighbors: ['Kazakhstan', 'Uzbekistan', 'Afganistan', 'Iran'],
      groups: ['asia-central']
    },
    {
      name: 'Aràbia Saudita',
      capital: 'Riad',
      flag: '🇸🇦',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "Conté les ciutats santes de la Meca i Medina.",
        "És un dels principals productors de petroli del món."
      ],
      neighbors: ['Iraq', 'Jordània', 'Qatar', 'Emirats Àrabs Units', 'Oman', 'Iemen'],
      groups: ['orient-mitja', 'peninsula-arabica']
    },
    {
      name: 'Iran',
      capital: 'Teheran',
      flag: '🇮🇷',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Històricament conegut com Pèrsia, té monuments com Persèpolis.",
        "Té costa tant al mar Caspi com al golf Pèrsic."
      ],
      neighbors: ['Iraq', 'Turquia', 'Armènia', 'Azerbaidjan', 'Turkmenistan', 'Afganistan', 'Pakistan'],
      groups: ['orient-mitja']
    },
    {
      name: 'Iraq',
      capital: 'Bagdad',
      flag: '🇮🇶',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "El país està travessat pels rius Tigris i Eufrates.",
        "La Mesopotàmia històrica s'ubicava en el seu territori."
      ],
      neighbors: ['Turquia', 'Iran', 'Aràbia Saudita', 'Jordània'],
      groups: ['orient-mitja']
    },
    {
      name: 'Israel',
      capital: 'Jerusalem',
      flag: '🇮🇱',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "És un centre de les tres religions monoteistes principals.",
        "Té sortida al mar Mediterrani i al mar Roig."
      ],
      neighbors: ['Egipte', 'Jordània', 'Síria', 'Líban'],
      groups: ['orient-mitja']
    },
    {
      name: 'Jordània',
      capital: 'Amman',
      flag: '🇯🇴',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Conté la ciutat nabatea de Petra excavada a la roca.",
        "El mar Mort forma part de la seva frontera occidental."
      ],
      neighbors: ['Síria', 'Iraq', 'Aràbia Saudita', 'Israel'],
      groups: ['orient-mitja']
    },
    {
      name: 'Síria',
      capital: 'Damasc',
      flag: '🇸🇾',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "Damasc és una de les ciutats habitades més antigues.",
        "El país ha viscut una guerra civil des de 2011."
      ],
      neighbors: ['Turquia', 'Iraq', 'Jordània', 'Israel'],
      groups: ['orient-mitja']
    },
    {
      name: 'Turquia',
      capital: 'Ankara',
      flag: '🇹🇷',
      difficulty: 1,
      coastal: true,
      landlocked: false,
      clues: [
        "Es troba entre Europa i Àsia i controla els estrets del Bòsfor i els Dardanels.",
        "La seva ciutat més gran és Istanbul, antiga Constantinoble."
      ],
      neighbors: ['Grècia', 'Bulgària', 'Geòrgia', 'Armènia', 'Iran', 'Iraq', 'Síria'],
      groups: ['orient-mitja']
    },
    {
      name: 'Qatar',
      capital: 'Doha',
      flag: '🇶🇦',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "És un petit estat peninsular que va acollir la Copa del Món de futbol 2022.",
        "La seva economia es basa en el gas natural liquat."
      ],
      neighbors: ['Aràbia Saudita'],
      groups: ['peninsula-arabica']
    },
    {
      name: 'Emirats Àrabs Units',
      capital: 'Abu Dhabi',
      flag: '🇦🇪',
      difficulty: 2,
      coastal: true,
      landlocked: false,
      clues: [
        "Federació de set emirats on Dubai destaca per la seva arquitectura moderna.",
        "Gran part de la seva riquesa prové del petroli i els serveis."
      ],
      neighbors: ['Aràbia Saudita', 'Oman'],
      groups: ['peninsula-arabica']
    },
    {
      name: 'Oman',
      capital: 'Masqat',
      flag: '🇴🇲',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "Té una llarga costa a l'oceà Índic i controla l'estret d'Ormuz.",
        "La seva història està lligada al comerç de l'encens."
      ],
      neighbors: ['Aràbia Saudita', 'Iemen', 'Emirats Àrabs Units'],
      groups: ['peninsula-arabica']
    },
    {
      name: 'Iemen',
      capital: 'Sanà',
      flag: '🇾🇪',
      difficulty: 3,
      coastal: true,
      landlocked: false,
      clues: [
        "Es troba a l'extrem sud de la península Aràbiga amb costa al mar Roig i al golf d'Aden.",
        "És conegut pels antics gratacels de maó cru de Shibam."
      ],
      neighbors: ['Aràbia Saudita', 'Oman'],
      groups: ['peninsula-arabica']
    }
  ];

  const ASIA_GROUP_LABELS = {
    'extrem-orient': "l'Extrem Orient",
    'sud-asia': 'el subcontinent indi',
    'sud-est': 'el sud-est asiàtic',
    'orient-mitja': "l'Orient Mitjà",
    'asia-central': 'Àsia Central',
    'peninsula-arabica': 'la península Aràbiga',
    illes: 'les grans illes asiàtiques'
  };

  function formatOptionList(items = []) {
    if (!items.length) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} o ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} o ${items[items.length - 1]}`;
  }

  function createGeoConfig(moduleId, moduleName, region, options = {}) {
    const inputName = `${moduleId}-mode`;
    const baseModes = [
      { value: 'quiz', label: 'Preguntes generals' },
      { value: 'flag', label: 'Banderes' },
    ];
    const extraModes = Array.isArray(options.extraModes)
      ? options.extraModes.filter((mode) => mode && mode.value && mode.label)
      : [];
    const modes = baseModes.concat(extraModes);
    const subtitleModes = formatOptionList(modes.map((mode) => mode.label.toLowerCase()));
    const radios = modes.map((mode, index) => `
            <label class="toggle">
              <input class="check" type="radio" name="${inputName}" value="${mode.value}" ${index === 0 ? 'checked' : ''}>
              ${mode.label}
            </label>`).join('');

    return {
      render() {
        const wrap = document.createElement('div');
        wrap.innerHTML = `
        <div class="section-title">Mode de pràctica</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Modes del mòdul ${moduleName}">
            ${radios}
          </div>
        </div>
        <p class="subtitle">Escull el tipus de pràctica: ${subtitleModes} ${region.preposition}.</p>
      `;
        return wrap;
      },
      collect() {
        const selected = (document.querySelector(`input[name="${inputName}"]:checked`) || {}).value;
        const allowedValues = modes.map((mode) => mode.value);
        const value = allowedValues.includes(selected) ? selected : 'quiz';
        return { mode: value };
      }
    };
  }

  function createGeoModule({ id, name, desc, region, countries, groupLabels, configOptions = {} }) {
    const allNames = countries.map(c => c.name);
    const allCapitals = countries.map(c => c.capital);
    const labels = groupLabels || {};
    const config = createGeoConfig(id, name, region, configOptions);

    const makeOptions = (correct, pool, count = 3) => {
      const available = pool.filter(item => item !== correct);
      const picks = [];
      const copy = available.slice();
      while (picks.length < count && copy.length) {
        const idx = Math.floor(Math.random() * copy.length);
        picks.push(copy.splice(idx, 1)[0]);
      }
      if (picks.length < count) return null;
      return shuffle(picks.concat(correct));
    };

    const questionFromClue = (country, pool) => {
      const hint = choice(country.clues);
      const options = makeOptions(country.name, pool.map(c => c.name));
      if (!options) return null;
      return {
        type: 'geo-clue',
        text: `Quin país ${region.preposition} descriu aquesta pista? <br><strong>${hint}</strong>`,
        options,
        answer: country.name
      };
    };

    const questionCapitalFromCountry = (country, pool) => {
      const options = makeOptions(country.capital, pool.map(c => c.capital));
      if (!options) return null;
      return {
        type: 'geo-capital',
        text: `Quina és la capital de <strong>${country.name}</strong>?`,
        options,
        answer: country.capital
      };
    };

    const questionCountryFromCapital = (country, pool) => {
      const options = makeOptions(country.name, pool.map(c => c.name));
      if (!options) return null;
      return {
        type: 'geo-capital',
        text: `A quin país pertany la capital <strong>${country.capital}</strong>?`,
        options,
        answer: country.name
      };
    };

    const questionFromFlag = (country, pool) => {
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
    };

    const questionNeighbor = (country) => {
      const validNeighbors = (country.neighbors || []).filter(n => allNames.includes(n));
      if (!validNeighbors.length) return null;
      const correct = choice(validNeighbors);
      const wrongOptions = makeOptions(correct, allNames.filter(n => !validNeighbors.includes(n) && n !== country.name));
      if (!wrongOptions) return null;
      return {
        type: 'geo-neighbor',
        text: `Quin d'aquests països fa <strong>frontera</strong> amb ${country.name}?`,
        options: wrongOptions,
        answer: correct
      };
    };

    const questionLandlocked = (pool) => {
      const inland = pool.filter(c => c.landlocked);
      if (!inland.length) return null;
      const coastal = pool.filter(c => !c.landlocked);
      if (coastal.length < 3) return null;
      const country = choice(inland);
      const options = makeOptions(country.name, coastal.map(c => c.name));
      if (!options) return null;
      return {
        type: 'geo-landlocked',
        text: "Quin d'aquests països <strong>no té sortida al mar</strong>?",
        options,
        answer: country.name
      };
    };

    const questionGroup = (pool) => {
      const keys = Object.keys(labels);
      const pickable = keys.map(key => ({
        key,
        members: countries.filter(c => Array.isArray(c.groups) && c.groups.includes(key))
      })).filter(entry => entry.members.length >= 1);
      if (!pickable.length) return null;
      const selected = choice(pickable);
      const members = selected.members;
      const allowed = members.filter(c => pool.includes(c));
      if (!allowed.length) return null;
      const country = choice(allowed);
      const options = makeOptions(country.name, allNames.filter(n => !members.some(m => m.name === n)));
      if (!options) return null;
      return {
        type: 'geo-group',
        text: `Quin d'aquests països forma part de ${labels[selected.key]}?`,
        options,
        answer: country.name
      };
    };

    const generator = (level, opts = {}) => {
      const L = clampLevel(level || 4);
      let pool = countries.filter(c => (c.difficulty || 1) <= L);
      if (!pool.length) pool = countries.slice();
      const mode = opts.mode === 'flag' ? 'flag' : 'quiz';

      if (mode === 'flag') {
        for (let attempts = 0; attempts < 6; attempts++) {
          const country = choice(pool);
          if (!country) break;
          const q = questionFromFlag(country, pool);
          if (q) return q;
        }
      } else {
        const modes = ['clue', 'country-capital', 'capital-country'];
        const hasNeighbor = pool.some(c => (c.neighbors || []).some(n => allNames.includes(n)));
        const inlandCount = pool.filter(c => c.landlocked).length;
        const coastalCount = pool.filter(c => !c.landlocked).length;
        const hasGroups = Object.keys(labels).length > 0;
        if (hasNeighbor) modes.push('neighbor');
        if (inlandCount > 0 && coastalCount >= 3) modes.push('landlocked');
        if (hasGroups) modes.push('group');

        for (let attempts = 0; attempts < 8; attempts++) {
          const modeKey = choice(modes);
          const country = choice(pool);
          if (!country) continue;
          let q = null;
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
              q = questionNeighbor(country);
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

      const fallbackPool = pool.length ? pool : countries;
      const fallbackCountry = choice(fallbackPool);
      if (!fallbackCountry) {
        return {
          type: 'geo-capital',
          text: `Indica la capital d'un país ${region.gentilic} (mode de reserva).`,
          options: ['París'],
          answer: 'París'
        };
      }

      const options = makeOptions(fallbackCountry.capital, allCapitals);
      return {
        type: 'geo-capital',
        text: `Quina és la capital de <strong>${fallbackCountry.name}</strong>?`,
        options: options || [fallbackCountry.capital],
        answer: fallbackCountry.capital
      };
    };

    return {
      id,
      name,
      desc,
      category: 'geo',
      usesLevels: false,
      levelLabel: region.levelLabel || 'Mode lliure',
      gen: generator,
      config
    };
  }

  const GEO_MODULES = [
    createGeoModule({
      id: 'geo-europe',
      name: "Països d'Europa",
      desc: 'Descobreix països, capitals, banderes i fronteres europees.',
      region: { preposition: "d'Europa", gentilic: 'europeu', levelLabel: 'Mode lliure' },
      countries: EUROPE_COUNTRIES,
      groupLabels: EUROPE_GROUP_LABELS,
      configOptions: {
        extraModes: [
          { value: 'map', label: 'Mapa interactiu' }
        ]
      }
    }),
    createGeoModule({
      id: 'geo-america',
      name: "Països d'Amèrica",
      desc: 'Recorre el continent americà amb capitals, banderes i pistes culturals.',
      region: { preposition: "d'Amèrica", gentilic: 'americà', levelLabel: 'Mode lliure' },
      countries: AMERICA_COUNTRIES,
      groupLabels: AMERICA_GROUP_LABELS,
      configOptions: {
        extraModes: [
          { value: 'map', label: 'Mapa interactiu' }
        ]
      }
    }),
    createGeoModule({
      id: 'geo-africa',
      name: "Països d'Àfrica",
      desc: 'Coneix les regions africanes, les seves capitals i la seva diversitat.',
      region: { preposition: "d'Àfrica", gentilic: 'africà', levelLabel: 'Mode lliure' },
      countries: AFRICA_COUNTRIES,
      groupLabels: AFRICA_GROUP_LABELS,
      configOptions: {
        extraModes: [
          { value: 'map', label: 'Mapa interactiu' }
        ]
      }
    }),
    createGeoModule({
      id: 'geo-asia',
      name: "Països d'Àsia",
      desc: 'Explora Àsia de l\'Orient Mitjà a l\'Extrem Orient amb preguntes variades.',
      region: { preposition: "d'Àsia", gentilic: 'asiàtic', levelLabel: 'Mode lliure' },
      countries: ASIA_COUNTRIES,
      groupLabels: ASIA_GROUP_LABELS,
      configOptions: {
        extraModes: [
          { value: 'map', label: 'Mapa interactiu' }
        ]
      }
    })
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
