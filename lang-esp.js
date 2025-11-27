/* =======================================================
   Focus Academy · Lengua Castellana (módulos externos)
   Archivo: lang-esp.js
   ======================================================= */

(function(){
  const choice = (arr)=> arr[Math.floor(Math.random()*arr.length)];

  /* ========== BANCOS DE EJERCICIOS (ORTOGRAFÍA) ========== */

  // B / V
  const BANK_BV = [
    { text: `Escribe correctamente (B/V): ha_er`, answer: `haber` },
    { text: `Escribe correctamente (B/V): o_lidar (olvidar)`, answer: `olvidar` },
    { text: `Escribe correctamente (B/V): su_ir (elevar)`, answer: `subir` },
    { text: `Escribe correctamente (B/V): ca_erna`, answer: `caverna` },
    { text: `Escribe correctamente (B/V): _ehículo`, answer: `vehículo` },
    { text: `Escribe correctamente (B/V): _iblioteca`, answer: `biblioteca` },
    { text: `Escribe correctamente (B/V): cu_rir (proteger)`, answer: `cubrir` },
    { text: `Escribe correctamente (B/V): _otar (elecciones)`, answer: `votar` },
    { text: `Escribe correctamente (B/V): ca_er (entrar en un sitio)`, answer: `caber` },
    { text: `Escribe correctamente (B/V): tu_o (poseyó)`, answer: `tuvo` },
    { text: `Escribe correctamente (B/V): mo_imiento`, answer: `movimiento` },
    { text: `Escribe correctamente (B/V): _eber (tomar líquido)`, answer: `beber` }
  ];

  // G / J
  const BANK_GJ = [
    { text: `Escribe correctamente (G/J): via_e`, answer: `viaje` },
    { text: `Escribe correctamente (G/J): _imnasia`, answer: `gimnasia` },
    { text: `Escribe correctamente (G/J): prote_er`, answer: `proteger` },
    { text: `Escribe correctamente (G/J): le_islar`, answer: `legislar` },
    { text: `Escribe correctamente (G/J): o_ecto`, answer: `objeto` },
    { text: `Escribe correctamente (G/J): di_ital`, answer: `digital` },
    { text: `Escribe correctamente (G/J): ener_ía`, answer: `energía` },
    { text: `Escribe correctamente (G/J): ma_or (adulto)`, answer: `mayor` },
    { text: `Escribe correctamente (G/J): re_istro`, answer: `registro` },
    { text: `Escribe correctamente (G/J): prote_ión`, answer: `protección` },
    { text: `Escribe correctamente (G/J): ima_inar`, answer: `imaginar` },
    { text: `Escribe correctamente (G/J): e_emplo`, answer: `ejemplo` }
  ];

  // S / C / Z
  const BANK_SCZ = [
    { text: `Escribe correctamente (s/c/z): abra_o (saludo)`, answer: `abrazo` },
    { text: `Escribe correctamente (s/c/z): nece_ario`, answer: `necesario` },
    { text: `Escribe correctamente (s/c/z): dire__ión`, answer: `dirección` },
    { text: `Escribe correctamente (s/c/z): tran__urso`, answer: `transcurso` },
    { text: `Escribe correctamente (s/c/z): e_cena (obra)`, answer: `escena` },
    { text: `Escribe correctamente (s/c/z): permi_o`, answer: `permiso` },
    { text: `Escribe correctamente (s/c/z): velo_idad`, answer: `velocidad` },
    { text: `Escribe correctamente (s/c/z): pla_a (espacio público)`, answer: `plaza` },
    { text: `Escribe correctamente (s/c/z): corre__ión`, answer: `corrección` },
    { text: `Escribe correctamente (s/c/z): pre_ión (fuerza)`, answer: `presión` },
    { text: `Escribe correctamente (s/c/z): con_ciencia`, answer: `conciencia` },
    { text: `Escribe correctamente (s/c/z): can_ión (melodía)`, answer: `canción` }
  ];

  // Correcciones libres
  const BANK_corregir = [
    { text: `Corrige: *a ver si vienes* escrito como "haber si vienes"`, answer: `a ver si vienes` },
    { text: `Corrige: *haber* comida para todos`, answer: `ha de haber comida para todos` },
    { text: `Corrige: Voy ha casa`, answer: `Voy a casa` },
    { text: `Corrige: *Halla* salido bien`, answer: `Haya salido bien` },
    { text: `Corrige: *haber* si puedes`, answer: `a ver si puedes` },
    { text: `Corrige: Ven ha jugar`, answer: `Ven a jugar` },
    { text: `Corrige: Trae haver si está`, answer: `Trae a ver si está` },
    { text: `Corrige: Haber que pasa mañana`, answer: `A ver qué pasa mañana` },
    { text: `Corrige: iva a ir contigo`, answer: `iba a ir contigo` },
    { text: `Corrige: asta luego`, answer: `hasta luego` },
    { text: `Corrige: nose que decir`, answer: `no sé qué decir` },
    { text: `Corrige: por ke`, answer: `por qué` },
    { text: `Corrige: haber si queda claro`, answer: `a ver si queda claro` },
    { text: `Corrige: lo a hecho`, answer: `lo ha hecho` },
    { text: `Corrige: a ver si as entendido`, answer: `a ver si has entendido` }
  ];

  // R / RR
  const BANK_RR = [
    { text: `Escribe correctamente, R o RR: ca_era (competición).`, answer: `carrera` },
    { text: `Escribe correctamente, R o RR: te_or (miedo).`, answer: `terror` },
    { text: `Escribe correctamente, R o RR: ho_or (honra).`, answer: `honor` },
    { text: `Escribe correctamente, R o RR: pe_o (animal).`, answer: `perro` },
    { text: `Escribe correctamente, R o RR: ca_o (coche).`, answer: `carro` },
    { text: `Escribe correctamente, R o RR: cie_o (cielo).`, answer: `cielo` },
    { text: `Escribe correctamente, R o RR: ba_a (barra metálica).`, answer: `barra` },
    { text: `Escribe correctamente, R o RR: ho_a (verbo ahorrar).`, answer: `ahorra` }
  ];

  // LL / Y
  const BANK_LLY = [
    { text: `Escribe correctamente, LL o Y: po_o (ave).`, answer: `pollo` },
    { text: `Escribe correctamente, LL o Y: ca_e (vía urbana).`, answer: `calle` },
    { text: `Escribe correctamente, LL o Y: apo_o (sostén).`, answer: `apoyo` },
    { text: `Escribe correctamente, LL o Y: ensa_ar (probar antes de actuar).`, answer: `ensayar` },
    { text: `Escribe correctamente, LL o Y: _ave (instrumento para abrir).`, answer: `llave` },
    { text: `Escribe correctamente, LL o Y: bri_ante (reluciente).`, answer: `brillante` },
    { text: `Escribe correctamente, LL o Y: arro_o (corriente pequeña).`, answer: `arroyo` },
    { text: `Escribe correctamente, LL o Y: _uvia (precipitación).`, answer: `lluvia` }
  ];

  // Catálogo de subtemas Ortografía
  const SUBS = [
    { key: 'bv', label: 'B / V', bank: BANK_BV },
    { key: 'gj', label: 'G / J', bank: BANK_GJ },
    { key: 'scz', label: 'S / C / Z', bank: BANK_SCZ },
    { key: 'corregir', label: 'Corregir', bank: BANK_corregir },
    { key: 'rr', label: 'R / RR', bank: BANK_RR },
    { key: 'lly', label: 'LL / Y', bank: BANK_LLY }
  ];

  /* ========== MORFOLOGÍA (5 SUBTEMAS) ========== */

  const BANK_MORFO_SUJETO = [
    {
      text: `¿Cuál es el sujeto de: "El profesor explica la lección."?`,
      options: ["El profesor", "explica", "la lección", "profesor"],
      answer: `El profesor`
    },
    {
      text: `¿Cuál es el predicado de: "Los niños juegan en el parque."?`,
      options: ["Los niños", "juegan en el parque", "en el parque", "juegan"],
      answer: `juegan en el parque`
    },
    {
      text: `¿Cuál es el sujeto de: "Las flores huelen bien."?`,
      options: ["Las flores", "huelen bien", "huelen", "bien"],
      answer: `Las flores`
    },
    {
      text: `¿Cuál es el predicado de: "El tren llega puntual."?`,
      options: ["El tren", "llega puntual", "llega", "puntual"],
      answer: `llega puntual`
    },
    {
      text: `¿Cuál es el sujeto de: "Mi abuela cocina paella."?`,
      options: ["Mi abuela", "cocina", "paella", "cocina paella"],
      answer: `Mi abuela`
    },
    {
      text: `¿Cuál es el predicado de: "El perro duerme en el sofá."?`,
      options: ["El perro", "duerme en el sofá", "duerme", "en el sofá"],
      answer: `duerme en el sofá`
    },
    {
      text: `¿Cuál es el sujeto de: "Los estudiantes leen en silencio."?`,
      options: ["Los estudiantes", "leen", "en silencio", "silencio"],
      answer: `Los estudiantes`
    },
    {
      text: `¿Cuál es el predicado de: "La maestra escribe en la pizarra."?`,
      options: ["La maestra", "escribe en la pizarra", "escribe", "pizarra"],
      answer: `escribe en la pizarra`
    }
  ];

  const BANK_MORFO_TIEMPOS = [
    {
      text: `Indica tiempo y modo: "Cantábamos"`,
      options: ["Pretérito imperfecto de indicativo", "Futuro simple", "Condicional simple", "Pretérito pluscuamperfecto"],
      answer: `Pretérito imperfecto de indicativo`
    },
    {
      text: `Indica tiempo y modo: "Habrá terminado"`,
      options: ["Futuro compuesto de indicativo", "Pretérito perfecto simple", "Condicional compuesto", "Subjuntivo presente"],
      answer: `Futuro compuesto de indicativo`
    },
    {
      text: `Indica tiempo y modo: "Cantaría"`,
      options: ["Condicional simple", "Futuro simple", "Pretérito imperfecto", "Subjuntivo presente"],
      answer: `Condicional simple`
    },
    {
      text: `Indica tiempo y modo: "He comido"`,
      options: ["Pretérito perfecto compuesto de indicativo", "Pretérito pluscuamperfecto", "Futuro perfecto", "Condicional compuesto"],
      answer: `Pretérito perfecto compuesto de indicativo`
    },
    {
      text: `Indica tiempo y modo: "Durmieras"`,
      options: ["Pretérito imperfecto de subjuntivo", "Pretérito perfecto simple", "Condicional", "Gerundio"],
      answer: `Pretérito imperfecto de subjuntivo`
    },
    {
      text: `Indica tiempo y modo: "Habíamos viajado"`,
      options: ["Pretérito pluscuamperfecto de indicativo", "Pretérito anterior", "Futuro compuesto", "Condicional compuesto"],
      answer: `Pretérito pluscuamperfecto de indicativo`
    }
  ];

  const BANK_MORFO_CATEGORIAS = [
    {
      text: `¿Qué categoría gramatical es "rápidamente"?`,
      options: ["Sustantivo", "Adjetivo", "Adverbio", "Verbo"],
      answer: `Adverbio`
    },
    {
      text: `¿Qué categoría gramatical es "hermoso"?`,
      options: ["Adjetivo", "Verbo", "Artículo", "Pronombre"],
      answer: `Adjetivo`
    },
    {
      text: `¿Qué categoría gramatical es "nosotros"?`,
      options: ["Pronombre personal", "Sustantivo", "Verbo", "Adverbio"],
      answer: `Pronombre personal`
    },
    {
      text: `¿Qué categoría gramatical es "aunque"?`,
      options: ["Conjunción", "Preposición", "Adjetivo", "Sustantivo"],
      answer: `Conjunción`
    },
    {
      text: `¿Qué categoría gramatical es "debajo"?`,
      options: ["Preposición", "Adverbio", "Interjección", "Sustantivo"],
      answer: `Adverbio`
    }
  ];

  const BANK_MORFO_CONCORDANCIA = [
    {
      text: `Elige la frase con concordancia correcta`,
      options: [
        "La niñas estaban contentas",
        "Las niñas estaban contentas",
        "La niña estaban contentas",
        "Las niña estaban contentas"
      ],
      answer: `Las niñas estaban contentas`
    },
    {
      text: `Elige la concordancia adecuada`,
      options: [
        "Esos libro antiguos",
        "Ese libro antiguos",
        "Esos libros antiguos",
        "Ese libros antiguo"
      ],
      answer: `Esos libros antiguos`
    },
    {
      text: `Selecciona la opción correcta`,
      options: [
        "Aquella casas blancas",
        "Aquellas casas blancas",
        "Aquellas casa blanca",
        "Aquella casa blancas"
      ],
      answer: `Aquellas casas blancas`
    }
  ];

  const BANK_MORFO_FUNCIONES = [
    {
      text: `Identifica la función: "Compré un regalo para ti" (para ti)`,
      options: ["Complemento directo", "Complemento circunstancial de finalidad", "Complemento de régimen", "Sujeto"],
      answer: `Complemento circunstancial de finalidad`
    },
    {
      text: `Identifica la función: "Los niños jugaron en el patio" (en el patio)`,
      options: ["Complemento directo", "Complemento de lugar", "Atributo", "Sujeto"],
      answer: `Complemento de lugar`
    },
    {
      text: `Identifica la función: "Me alegro de tu éxito" (de tu éxito)`,
      options: ["Complemento directo", "Complemento de régimen", "Complemento circunstancial", "Sujeto"],
      answer: `Complemento de régimen`
    },
    {
      text: `Identifica la función: "El profesor está cansado" (cansado)`,
      options: ["Atributo", "Complemento directo", "Sujeto", "Complemento de régimen"],
      answer: `Atributo`
    }
  ];

  const SUBS_MORF = [
    { key: 'basicas', label: 'Sujeto y predicado', bank: BANK_MORFO_SUJETO },
    { key: 'temps', label: 'Tiempos verbales', bank: BANK_MORFO_TIEMPOS },
    { key: 'cat', label: 'Categorías gramaticales', bank: BANK_MORFO_CATEGORIAS },
    { key: 'concord', label: 'Concordancia', bank: BANK_MORFO_CONCORDANCIA },
    { key: 'funcions', label: 'Funciones sintácticas', bank: BANK_MORFO_FUNCIONES }
  ];

  /* ========== COMPRENSIÓN LECTORA ========== */

  const BANK_LECT = [
    {
      title: 'Horario del centro cultural',
      passage: 'El centro cultural abre de lunes a viernes de 9:00 a 14:00 y de 16:00 a 20:00. Los sábados solo abre por la mañana de 9:00 a 14:00.',
      question: '¿En qué horario abre los sábados?',
      options: [
        'De 9:00 a 14:00',
        'De 16:00 a 20:00',
        'Todo el día',
        'Solo por la tarde'
      ],
      answer: 'De 9:00 a 14:00'
    },
    {
      title: 'Aviso de excursión',
      passage: 'La clase saldrá de excursión al museo de ciencias el jueves. Deben llevar almuerzo, libreta y bolígrafo. El regreso está previsto a las 14:30.',
      question: '¿Qué día se realiza la excursión?',
      options: ['El jueves', 'El viernes', 'El lunes', 'El miércoles'],
      answer: 'El jueves'
    },
    {
      title: 'Normas de biblioteca',
      passage: 'Para usar la sala de estudio se debe guardar silencio y mantener los móviles en modo avión. Los libros prestados se devuelven en el mostrador principal.',
      question: '¿Dónde se devuelven los libros prestados?',
      options: ['En el mostrador principal', 'En la sala de estudio', 'En la sala infantil', 'En la entrada'],
      answer: 'En el mostrador principal'
    },
    {
      title: 'Cartel de teatro',
      passage: 'La obra "Luz de otoño" se representará el 12 de noviembre a las 19:00 en el auditorio municipal. Las entradas se venden en línea y en taquilla.',
      question: '¿A qué hora comienza la obra?',
      options: ['A las 19:00', 'A las 17:00', 'A las 20:30', 'A las 18:00'],
      answer: 'A las 19:00'
    },
    {
      title: 'Club de lectura',
      passage: 'El club de lectura se reúne cada dos semanas. En la próxima sesión se comentarán los capítulos 1 al 3 del libro escogido. La reunión será a las 18:30 en la biblioteca.',
      question: '¿Qué capítulos se comentarán en la próxima sesión?',
      options: [
        'Del 1 al 3',
        'Solo el capítulo 1',
        'Del 4 al 6',
        'Todos los capítulos'
      ],
      answer: 'Del 1 al 3'
    }
  ];

  function renderReadingPassage(raw){
    return String(raw)
      .split(/\r?\n+/)
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => `<p>${part}</p>`)
      .join('');
  }

  /* ========== GENERADORES ========== */
  function genEspOrt(level, opts = {}){
    const subKey = opts.sub || 'bv';
    const sub = SUBS.find(s => s.key === subKey) || SUBS[0];
    const q = choice(sub.bank);
    return {
      type: 'esp-ort',
      text: q.text,
      answer: q.answer,
      options: q.options || null,
      input: 'text'
    };
  }

  function genEspMorf(level, opts = {}){
    const subKey = opts.sub || 'basicas';
    const sub = SUBS_MORF.find(s => s.key === subKey) || SUBS_MORF[0];
    const q = choice(sub.bank);
    return {
      type: 'esp-morf',
      text: q.text,
      answer: q.answer,
      options: q.options || null,
      input: q.options ? 'choice' : 'text'
    };
  }

  function genEspLect(level, _opts = {}){
    const q = choice(BANK_LECT);
    const passageHtml = renderReadingPassage(q.passage) || `<p>${q.passage}</p>`;
    const text = `
      <div class="reading-card">
        <div class="reading-card__title">${q.title}</div>
        <div class="reading-card__passage">${passageHtml}</div>
        <div class="reading-card__question"><span class="reading-card__question-label">Pregunta</span><p>${q.question}</p></div>
      </div>
    `;
    const options = Array.isArray(q.options) ? q.options.slice() : null;
    return {
      type: 'esp-lect',
      text: text.trim(),
      answer: q.answer,
      options,
      input: options ? 'choice' : 'text'
    };
  }

  /* ========== UI DE CONFIG ========== */
  const OrtografiaConfig = {
    render(){
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div class="section-title">Ortografía · Subtemas</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Subtemas de ortografía">
            ${SUBS.map((s,i)=>`
              <label class="toggle">
                <input class="check" type="radio" name="esp-ort-sub" value="${s.key}" ${i===0?'checked':''}>
                ${s.label}
              </label>
            `).join('')}
          </div>
        </div>
        <div class="subtitle">La respuesta ha de ser exacta (mayúsculas y acentos incluidos).</div>
      `;
      return wrap;
    },
    collect(){
      const v = (document.querySelector('input[name="esp-ort-sub"]:checked') || {}).value || 'bv';
      return { sub: v };
    }
  };

  const MorfologiaConfig = {
    render(){
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div class="section-title">Morfología · Subtemas</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Subtemas de morfología">
            ${SUBS_MORF.map((s,i)=>`
              <label class="toggle">
                <input class="check" type="radio" name="esp-morf-sub" value="${s.key}" ${i===0?'checked':''}>
                ${s.label}
              </label>
            `).join('')}
          </div>
        </div>
      `;
      return wrap;
    },
    collect(){
      const v = (document.querySelector('input[name="esp-morf-sub"]:checked') || {}).value || 'basicas';
      return { sub: v };
    }
  };

  const SUBS_LECT = [
    { key: 'general', label: 'Textos informativos', bank: BANK_LECT }
  ];

  const LecturaConfig = {
    render(){
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div class="section-title">Comprensión lectora · Subtemas</div>
        <div class="controls">
          <div class="group" role="group" aria-label="Subtemas de comprensión lectora">
            ${SUBS_LECT.map((s,i)=>`
              <label class="toggle">
                <input class="check" type="radio" name="esp-lect-sub" value="${s.key}" ${i===0?'checked':''}>
                ${s.label}
              </label>
            `).join('')}
          </div>
        </div>
        <div class="subtitle">Textos breves con preguntas de comprensión literal.</div>
      `;
      return wrap;
    },
    collect(){
      const v = (document.querySelector('input[name="esp-lect-sub"]:checked') || {}).value || 'general';
      return { sub: v };
    }
  };

  /* ========== MÓDULOS ========== */
  const ESP_MODULES = [
    {
      id: 'esp-ort',
      name: 'Ortografía castellana',
      desc: 'b/v, g/j, s/c/z, corrección libre, r/rr, ll/y.',
      category: 'esp',
      usesLevels: false,
      levelLabel: 'Modo libre',
      gen: genEspOrt,
      config: OrtografiaConfig
    },
    {
      id: 'esp-morf',
      name: 'Morfología castellana',
      desc: 'Sujeto, tiempos verbales, categorías, concordancia, funciones sintácticas.',
      category: 'esp',
      usesLevels: false,
      levelLabel: 'Modo libre',
      gen: genEspMorf,
      config: MorfologiaConfig
    },
    {
      id: 'esp-lect',
      name: 'Comprensión lectora en castellano',
      desc: 'Textos cortos sobre horarios, avisos y normas.',
      category: 'esp',
      usesLevels: false,
      levelLabel: 'Modo libre',
      gen: genEspLect
    }
  ];

  /* ========== REGISTRO ========== */
  if (typeof window.addModules === 'function') {
    window.addModules(ESP_MODULES);
  } else {
    window._PENDING_ESP_MODULES_ = ESP_MODULES;
    window.addEventListener('DOMContentLoaded', ()=>{
      if (typeof window.addModules === 'function' && window._PENDING_ESP_MODULES_) {
        window.addModules(window._PENDING_ESP_MODULES_);
        delete window._PENDING_ESP_MODULES_;
      }
    });
  }
})();
