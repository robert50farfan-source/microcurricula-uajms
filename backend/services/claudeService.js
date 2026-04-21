const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');
const { plantilla } = require('../data/plantilla');
const { ejemplo } = require('../data/ejemplo');
const { buildFuentesPromptBlock } = require('./fuentesLoader');

const CONFIG_PATH = path.join(__dirname, '../config/settings.json');

const MODELO = 'claude-haiku-4-5-20251001';

function getConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return { nombreCarrera: 'Ingeniería Informática', nombreFacultad: '', nombreDocente: '', nombreDirector: '', numIndicadores: 3, numInstrumentos: 2 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompts
// ─────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(malla) {
  const carreraCtx = malla
    ? `Carrera de ${malla.carrera}`
    : 'la carrera indicada en el programa docente';
  const cfg = getConfig();
  const facultad = cfg.nombreFacultad || 'FACULTAD DE INGENIERIA EN RECURSOS NATURALES Y TECNOLOGIA';
  return `Eres un experto en diseño curricular por competencias de la Universidad Autónoma \
Juan Misael Saracho (UAJMS), ${facultad}, ${carreraCtx}. \
Tu tarea es generar un Proyecto Formativo completo y detallado siguiendo EXACTAMENTE la plantilla \
institucional. Debes responder ÚNICAMENTE con un objeto JSON válido sin markdown ni texto adicional.`;
}

/**
 * Construye el user prompt combinando el programa docente con el contexto
 * institucional (ejemplo, plantilla y malla).
 *
 * @param {string} textoProgramaDocente - Texto plano extraído del PDF
 * @param {Object} datosAsignatura      - Datos extra opcionales (nombre, sigla, semestre…)
 */
async function buildUserPrompt(textoProgramaDocente, datosAsignatura = {}, numECs = null, malla) {
  const cfg = getConfig();
  const hasMalla = malla !== null;

  const carreraDisplay = hasMalla
    ? malla.carrera
    : (cfg.nombreCarrera ?? 'la carrera indicada en el programa docente');

  // Merge config values as authoritative institutional data
  const datosFinales = {
    carrera: carreraDisplay,
    ...(cfg.nombreDocente ? { docente: cfg.nombreDocente } : {}),
    ...(cfg.nombreDirector ? { director: cfg.nombreDirector } : {}),
    ...datosAsignatura,
  };

  const mallaBlock = hasMalla
    ? `=== MALLA CURRICULAR DE ${malla.carrera.toUpperCase()} — UAJMS ===
${JSON.stringify(malla, null, 2)}`
    : `=== MALLA CURRICULAR ===
No se ha proporcionado malla curricular. Para el campo "ubicacionTextual" describe en 2-4 oraciones \
la ubicación de la asignatura en el plan de estudios (semestre, área, prerrequisitos y relación con \
otras materias) basándote en la información del programa docente.`;

  const mallaInfoSchema = hasMalla
    ? `"mallaInfo": {
    "semestre": "<número, ej: 1>",
    "categoriaColor": "<verde|azul|naranja|rojo|morado>",
    "categoriaNombre": "<nombre de la categoría según la malla>",
    "asignaturasPrevias": ["<lista de prerrequisitos directos>"],
    "asignaturasSiguientes": ["<asignaturas que esta habilita según la malla>"]
  },`
    : `"mallaInfo": {
    "semestre": "<número del semestre extraído del programa docente>",
    "categoriaColor": "azul",
    "categoriaNombre": "Formación curricular",
    "asignaturasPrevias": ["<prerrequisitos mencionados en el programa docente>"],
    "asignaturasSiguientes": []
  },
  "ubicacionTextual": "<descripción de 2-4 oraciones sobre la ubicación de la asignatura: semestre, área de conocimiento, prerrequisitos y asignaturas que habilita, basada en el programa docente>",`;

  const carreraJSON = hasMalla
    ? `"${malla.carrera}"`
    : '"<nombre de la carrera según el programa docente>"';

  return `
=== PROGRAMA DOCENTE (texto extraído del PDF) ===
${textoProgramaDocente}

=== CONFIGURACIÓN INSTITUCIONAL (valores oficiales — usar exactamente) ===
- Nombre de la carrera: ${carreraDisplay}
${cfg.nombreDocente ? `- Nombre del docente: ${cfg.nombreDocente}` : '- Nombre del docente: (extraer del PDF si está disponible)'}
${cfg.nombreDirector ? `- Nombre del director: ${cfg.nombreDirector}` : '- Nombre del director: (dejar vacío si no se conoce)'}
- Número de indicadores de evaluación por elemento de competencia: ${cfg.numIndicadores}
- Número de instrumentos de evaluación por elemento de competencia: ${cfg.numInstrumentos}

IMPORTANTE: El array "indicadores" de cada elemento debe contener EXACTAMENTE ${cfg.numIndicadores} indicador(es).
IMPORTANTE: El array "instrumentos" de cada elemento debe contener EXACTAMENTE ${cfg.numInstrumentos} instrumento(s).

=== DATOS ADICIONALES DE LA ASIGNATURA (si se proporcionaron) ===
${Object.keys(datosFinales).length
      ? JSON.stringify(datosFinales, null, 2)
      : 'No se proporcionaron datos adicionales.'}

${mallaBlock}

=== PLANTILLA OFICIAL DEL PROYECTO FORMATIVO (campos requeridos) ===
${JSON.stringify(plantilla, null, 2)}

=== EJEMPLO DE REFERENCIA DE CALIDAD (Arquitectura de Computadores I — DIC-112) ===
Usa este ejemplo como guía del nivel de detalle, tono y estructura esperados:
${JSON.stringify(ejemplo, null, 2)}

=== DOCUMENTOS DE REFERENCIA INSTITUCIONAL UAJMS ===
Los siguientes documentos oficiales de la UAJMS explican los criterios, ejemplos y estándares
que debe cumplir el Proyecto Formativo. Úsalos como fuente de autoridad para el contenido,
la redacción y la estructura de cada sección:

${await buildFuentesPromptBlock() ?? '(No se encontraron documentos de referencia en backend/data/fuentes.)'}

=== INSTRUCCIÓN ===
${numECs
      ? `⚠️ RESTRICCIÓN IRROMPIBLE: El programa docente contiene EXACTAMENTE ${numECs} Elemento(s) de Competencia. El array "elementosDeCompetencia" del JSON de salida DEBE tener EXACTAMENTE ${numECs} objeto(s). No combinar, no omitir, no dividir ninguno. Si generas un número diferente a ${numECs}, la respuesta es inválida.`
      : 'IMPORTANTE: Cuenta los Elementos de Competencia en el programa docente y genera exactamente ese mismo número de objetos en "elementosDeCompetencia". No omitas ni combines ninguno.'}

Genera el Proyecto Formativo completo para la asignatura descrita en el programa docente.
Responde ÚNICAMENTE con el siguiente JSON, sin markdown, sin texto antes ni después:

{
  "identificacion": {
    "facultad": "${cfg.nombreFacultad || 'FACULTAD DE INGENIERIA EN RECURSOS NATURALES Y TECNOLOGIA'}",
    "carrera": ${carreraJSON},
    "semestre": "<número ordinal, ej: Primero>",
    "asignatura": "<nombre completo de la asignatura>",
    "prerrequisito": "<asignatura(s) prerrequisito o 'Ninguno'>",
    "sigla": "<código de la asignatura, ej: DIC-112>",
    "cargaHoraria": {
      "teoria": "<horas Teoría/Práctica por semana (un solo valor combinado, ej: 3)>",
      "practica": "0",
      "laboratorio": "<horas de laboratorio por semana (0 si no hay)>",
      "totalSemana": "<teoria + laboratorio (NO sumar practica por separado, ya está incluida en teoria)>",
      "totalSemestre": "<suma de horas semestrales del programa docente: horasTeoriaPractica_semestral + horasLaboratorio_semestral (ej: si el programa indica 40 hrs T/P y 80 hrs Lab, totalSemestre=120)>",
      "totalSemanas": "<totalSemestre / totalSemana, redondeado al entero más cercano (ej: 120 / 6 = 20)>",
      "creditos": "<número de créditos de la asignatura según el programa docente; dejar vacío ('') si no figura>"
    },
    "horasDocente": "<horas con el docente en el semestre>",
    "horasAutonomo": "<horas autónomas del estudiante en el semestre>",
    "nombreDocente": "<nombre completo del/los docente(s) si figura en el programa, si no: ''>",
    "emailDocente": "<correo electrónico del docente si figura en el programa, si no: ''>",
    "celDocente": "<número de celular/teléfono del docente si figura en el programa, si no: ''>",
    "justificacion": "<párrafo de 80-150 palabras fundamentando la relevancia de la asignatura>"
  },
  ${mallaInfoSchema}
  "competenciaGlobal": "<competencia global de la carrera a la que contribuye esta asignatura>",
  "competenciaAsignatura": "<competencia específica de la asignatura, inicia con verbo en infinitivo>",
  "elementosDeCompetencia": [
    {
      "numero": 1,
      "codigo": "EC1",
      "descripcion": "<enunciado del elemento de competencia, inicia con verbo en infinitivo>",
      "evidencias": ["<evidencia 1>", "<evidencia 2>"],
      "nivelInicial": "<round(5 * ponderacion/maxEstándar) si alcanza Inicial, o \"\" si no aplica>",
      "nivelBasico": "<round(10 * ponderacion/maxEstándar) si alcanza Básico, o \"\" si no aplica>",
      "nivelAutonomo": "<round(20 * ponderacion/maxEstándar) si alcanza Autónomo, o \"\" si no aplica; si es el nivel máximo = ponderacion exacto>",
      "nivelEstrategico": "<ponderacion si es el nivel máximo, o round(30 * ponderacion/maxEstándar) si hay nivel superior, o \"\" si no aplica>",
      "saberConocer": "<contenidos conceptuales: lista en texto, separados por punto y coma>",
      "saberHacer": "<contenidos procedimentales: lista en texto, separados por punto y coma>",
      "saberSer": "<contenidos actitudinales: lista en texto, separados por punto y coma>",
      "indicadores": "<indicadores de logro en texto, separados por punto y coma>",
      "instrumentos": "<instrumentos de evaluación en texto, separados por coma>",
      "ponderacion": "<número entero proporcional a la amplitud del EC — todos los ECs deben sumar exactamente 100>",
      "distribucionHoraria": {
        "teoria": "<horas Teoría/Práctica asignadas a ESTE EC según el programa docente>",
        "practica": "0",
        "autonomo": "<horas autónomas del estudiante para ESTE EC>",
        "investigacion": "<horas de investigación para ESTE EC>",
        "interaccion": "<horas de interacción social para ESTE EC>",
        "total": "<teoria + autonomo + investigacion + interaccion para ESTE EC (total general del EC, incluye horas autónomas)>"
      },
      "unidadesAprendizaje": [
        {
          "nombre": "<título exacto de la unidad de aprendizaje como figura en el programa docente>",
          "contenido": ["<Título tema 1>", "<Título tema 2>", "<Título tema 3>", "<Título tema 4>"]
        }
      ],
      "actividadesTeoricas": "<descripción de actividades teóricas con el docente>",
      "actividadesPracticas": "<descripción de actividades prácticas con el docente>",
      "actividadesAutonomas": "<descripción del trabajo autónomo del estudiante>",
      "actividadesInvestigacion": {
        "tipos": ["<uno o más de: Investigación documental, Estudio de caso, Ensayo, Proyecto, Resolución de problemas, Monografía>"],
        "otro": "<opcional: puedes proponer una actividad complementaria específica para esta asignatura aunque ya hayas marcado opciones estándar; si no hay nada relevante que agregar, dejar vacío>"
      },
      "actividadesInteraccionSocial": {
        "tipos": ["<uno o más de: Feria exposición, Trabajo comunitario, Campaña de sensibilización, Trabajo con instituciones>"],
        "otro": "<opcional: puedes proponer una actividad complementaria específica para esta asignatura aunque ya hayas marcado opciones estándar; si no hay nada relevante que agregar, dejar vacío>"
      }
    }
  ],
  "cronograma": [
    {
      "semana": 1,
      "elemento": "EC1",
      "unidad": "<nombre de la unidad>",
      "contenido": "<tema específico de la semana>",
      "actividad": "<actividad principal de la semana>",
      "horas": "<horas de la semana>"
    }
  ],
  "recursos": {
    "didacticos": "<descripción de recursos: hardware, software, plataformas y materiales>",
    "alianzas": "<instituciones aliadas o 'Ninguna'>",
    "bibliografia": [
      "<referencia 1 en formato APA 7>",
      "<referencia 2 en formato APA 7>"
    ]
  }
}

REGLAS OBLIGATORIAS:
1. El cronograma debe tener exactamente tantas entradas como totalSemanas indique la carga horaria de la Sección I (ej: si totalSemanas=20, el cronograma va de semana 1 a 20).
2. La semana de evaluación parcial es la mitad del semestre (Math.ceil(totalSemanas/2)) y la evaluación final es la última semana (totalSemanas).
3. NIVEL DE LOGRO (campo 17) — los valores se calculan a partir de la ponderación del EC:
   El nivel máximo que alcanza cada EC lo determinas por su complejidad y objetivo en el programa docente:
   - EC introductorio o declarativo → máximo BÁSICO
   - EC de aplicación práctica → máximo AUTÓNOMO
   - EC de análisis, diseño o creación → máximo ESTRATÉGICO
   Asigna todos los niveles desde INICIAL hasta el máximo alcanzado (inclusive); los superiores quedan "".
   REGLA DE CÁLCULO: el valor del nivel MÁXIMO siempre es igual a la ponderación del EC (campo 18.3).
   Los niveles inferiores se escalan proporcionalmente usando como referencia la escala estándar (Inicial=5, Básico=10, Autónomo=20, Estratégico=30).
   FÓRMULA: factor = ponderacion / valorEstandarDelNivelMaximo; nivelX = round(valorEstandarX * factor); nivelMaximo = ponderacion (exacto).
   EJEMPLO con ponderación=12 y nivel máximo=Autónomo (estándar=20): factor=12/20=0.6 → Inicial=round(5*0.6)=3, Básico=round(10*0.6)=6, Autónomo=12, Estratégico="".
   EJEMPLO con ponderación=25 y nivel máximo=Estratégico (estándar=30): factor=25/30=0.833 → Inicial=4, Básico=8, Autónomo=17, Estratégico=25.

4. PONDERACIÓN (campo 18.3) — REGLA CRÍTICA, SUMA EXACTA = 100:
   La ponderación mide la AMPLITUD del EC: cuántas unidades de aprendizaje abarca y qué tan complejo es.
   Un EC con más unidades de aprendizaje o mayor nivel de logro recibe mayor ponderación.
   ALGORITMO OBLIGATORIO:
   PASO 1 — Cuenta las unidades de aprendizaje (UA) de cada EC: ua[1], ua[2], ..., ua[k].
   PASO 2 — Calcula ponderación proporcional: pond_raw[i] = ua[i] / sum(ua) × 100
   PASO 3 — Ajuste por complejidad: si el EC alcanza ESTRATÉGICO suma +3 a pond_raw[i];
             si alcanza AUTÓNOMO, sin cambio; si alcanza BÁSICO o INICIAL, resta 2.
             Recalcula los valores para que el ajuste mantenga la proporción.
   PASO 4 — Redondea cada ponderación al entero más cercano (mínimo 5 por EC).
   PASO 5 — VERIFICACIÓN OBLIGATORIA: suma todos los valores redondeados.
             Si la suma ≠ 100, distribuye la diferencia sumando o restando 1 punto
             al EC con más unidades de aprendizaje (o al de mayor nivel) hasta que la suma sea exactamente 100.
   EJEMPLO con 3 ECs (2 UA, 3 UA, 1 UA con niveles AUTÓNOMO/ESTRATÉGICO/BÁSICO):
     pond_raw = [33.3, 50.0, 16.7] → ajuste = [33.3, 53.0, 14.7] → normalizados a 100 → [32, 52, 16]
     suma = 100 ✓
5. DISTRIBUCIÓN DE CARGA HORARIA (campo 19 — REGLA CRÍTICA):
   El campo que se muestra en la columna 19 del documento es distribucionHoraria.teoria (horas con el docente por EC).
   PASO 1 — Busca en el programa docente la tabla de distribución de carga horaria por unidad temática o elemento de competencia. Puede aparecer con encabezados como "Horas", "H.T.", "H.P.", "Carga horaria", "Distribución", etc.
   PASO 2 — Si encuentras esa tabla, extrae las horas de cada EC/unidad y colócalas en distribucionHoraria.teoria. Verifica que la suma de todos los EC.distribucionHoraria.teoria sea igual al valor de horasDocente (punto 8 de identificacion). Si la suma no cuadra, ajusta proporcionalmente.
   PASO 3 — Si NO encuentras la tabla en el programa docente, distribuye las horas de manera equitativa: horasDocente ÷ número de ECs, redondeando al entero más cercano y ajustando el último EC para que la suma sea exactamente igual a horasDocente. Coloca el valor resultante en distribucionHoraria.teoria de cada EC.
   PASO 4 — VERIFICACIÓN OBLIGATORIA antes de responder: suma todos los EC.distribucionHoraria.teoria. Esa suma DEBE ser igual a identificacion.horasDocente. Si no es igual, corrige los valores antes de responder.
   EJEMPLO: horasDocente=120, 4 ECs → cada EC.distribucionHoraria.teoria=30, suma=120 ✓. Si hubiera 3 ECs → EC1.teoria=40, EC2.teoria=40, EC3.teoria=40, suma=120 ✓.
   NUNCA asignar el total de la asignatura a cada EC individual.
6. ${numECs
      ? `El array "elementosDeCompetencia" DEBE contener EXACTAMENTE ${numECs} objetos (detectado en el PDF). Combinar o suprimir elementos es un error grave.`
      : 'El número de elementosDeCompetencia debe coincidir exactamente con los que indica el programa docente. No agregar ni omitir ninguno.'}
7. Todo el contenido debe estar en español formal y académico.
8. El campo "unidadesAprendizaje" de cada elemento de competencia:
   a) Extrae el nombre o nombres de la(s) unidad(es) de aprendizaje EXACTAMENTE como figuran en el programa docente (puede ser solo el título, ej: "Unidad 1: Introducción a…").
   b) Si el programa docente define más de una unidad de aprendizaje para el mismo elemento de competencia, inclúyelas TODAS como objetos separados dentro del array "unidadesAprendizaje".
   c) El array "contenido" de cada unidad debe contener SOLO títulos de temas (sin subtemas, sin numeración, sin puntos). Mínimo 4 títulos y máximo 8 títulos por unidad.
9. Responde ÚNICAMENTE con el JSON. Sin texto antes, sin markdown, sin explicaciones.
`.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// Validación básica de la respuesta
// ─────────────────────────────────────────────────────────────────────────────

const CAMPOS_REQUERIDOS = [
  'identificacion',
  'mallaInfo',
  'competenciaGlobal',
  'competenciaAsignatura',
  'elementosDeCompetencia',
  'cronograma',
  'recursos',
];

function validateResponse(data) {
  // Campos estructurales obligatorios
  const faltantes = CAMPOS_REQUERIDOS.filter((campo) => !(campo in data));
  if (faltantes.length > 0) {
    throw new Error(`Respuesta de Claude incompleta. Campos faltantes: ${faltantes.join(', ')}`);
  }

  if (!Array.isArray(data.elementosDeCompetencia) || data.elementosDeCompetencia.length < 1) {
    throw new Error('elementosDeCompetencia debe ser un array con al menos un elemento.');
  }

  // Cronograma: validar contra totalSemanas de la carga horaria
  if (!Array.isArray(data.cronograma) || data.cronograma.length < 1) {
    throw new Error('cronograma debe ser un array con al menos una entrada.');
  }

  // Corrección: recalcular totalSemestre y totalSemanas desde horasDocente para garantizar
  // que el punto 7 (CARGA HORARIA SEM/AÑO) sea consistente con el punto 8 (HORAS APRENDIZAJE CON DOCENTE).
  // El programa docente da los totales semestrales (ej: T/P=40 + Lab=80 = 120), de los cuales
  // se deriva totalSemanas = 120 / 6 = 20. Claude a veces usa 18 semanas por defecto, lo que
  // produce 6×18=108 en lugar de 120.
  {
    const horasDoc = Number(data.identificacion?.horasDocente ?? 0);
    const semanaVal = Number(data.identificacion?.cargaHoraria?.totalSemana ?? 0);
    if (horasDoc > 0 && semanaVal > 0) {
      const semanasCalc = Math.round(horasDoc / semanaVal);
      const semActual = Number(data.identificacion.cargaHoraria.totalSemanas ?? 0);
      const semStr = Number(data.identificacion.cargaHoraria.totalSemestre ?? 0);
      if (semActual !== semanasCalc || semStr !== horasDoc) {
        console.warn(
          `[claudeService] totalSemestre corregido: ${semStr} → ${horasDoc} | ` +
          `totalSemanas corregido: ${semActual} → ${semanasCalc} (horasDocente=${horasDoc} / totalSemana=${semanaVal})`
        );
        data.identificacion.cargaHoraria.totalSemestre = horasDoc;
        data.identificacion.cargaHoraria.totalSemanas = semanasCalc;
      }
    }
  }

  const totalSemanas = Number(data.identificacion?.cargaHoraria?.totalSemanas ?? 18);
  const tolerance = 2;
  if (Math.abs(data.cronograma.length - totalSemanas) > tolerance) {
    console.warn(`[claudeService] cronograma tiene ${data.cronograma.length} semanas (se esperaban ${totalSemanas}). Continuando de todas formas.`);
  }

  // Ponderaciones: cada valor debe ser positivo (≥1) y la suma debe ser exactamente 100
  const ecs = data.elementosDeCompetencia;

  // Paso 1 — garantizar que ninguna ponderación sea ≤ 0
  ecs.forEach((ec, i) => {
    const val = Math.round(Number(ec.ponderacion ?? 0));
    if (val <= 0) {
      console.warn(`[claudeService] EC${i + 1} tenía ponderación inválida (${ec.ponderacion}), corregida a 1.`);
      ec.ponderacion = 1;
    } else {
      ec.ponderacion = val;   // normalizar a entero
    }
  });

  // Paso 2 — verificar suma; si no es 100, redistribuir proporcionalmente
  const sumaActualPond = ecs.reduce((s, ec) => s + ec.ponderacion, 0);
  if (sumaActualPond !== 100) {
    if (sumaActualPond > 0) {
      // Escalar proporcionalmente manteniendo mínimo 1 por EC
      let acumPond = 0;
      ecs.forEach((ec, i) => {
        ec.ponderacion = i < ecs.length - 1
          ? Math.max(1, Math.round((ec.ponderacion / sumaActualPond) * 100))
          : Math.max(1, 100 - acumPond);   // último absorbe el residuo
        acumPond += ec.ponderacion;
      });
    } else {
      // Caso extremo: todos eran 0 o negativos → repartir igual
      const base = Math.floor(100 / ecs.length);
      ecs.forEach((ec, i) => { ec.ponderacion = i < ecs.length - 1 ? base : 100 - base * (ecs.length - 1); });
    }
    const sumaNuevaPond = ecs.reduce((s, ec) => s + ec.ponderacion, 0);
    console.warn(
      `[claudeService] Ponderaciones sumaban ${sumaActualPond}%. Redistribuidas proporcionalmente → nueva suma: ${sumaNuevaPond}%.`
    );
  } else {
    console.log(`[claudeService] ✓ Ponderaciones verificadas: suma = 100%, todos los valores positivos.`);
  }

  // Nivel de Logro (punto 17): recalcular valores para que el nivel máximo == ponderación del EC
  // Escala estándar de referencia: Inicial=5, Básico=10, Autónomo=20, Estratégico=30
  {
    const NIVELES = [
      { key: 'nivelInicial', std: 5 },
      { key: 'nivelBasico', std: 10 },
      { key: 'nivelAutonomo', std: 20 },
      { key: 'nivelEstrategico', std: 30 },
    ];
    data.elementosDeCompetencia.forEach((ec, idx) => {
      const pond = Math.round(Number(ec.ponderacion ?? 0));
      if (pond <= 0) return;
      // Determinar qué niveles aplican (no vacíos) y cuál es el máximo
      const activos = NIVELES.filter(({ key }) => ec[key] !== '' && ec[key] != null);
      if (activos.length === 0) return;
      const maxNivel = activos[activos.length - 1];   // último nivel activo = máximo
      const maxStd = maxNivel.std;
      const factor = pond / maxStd;
      let cambiados = false;
      activos.forEach(({ key, std }, i) => {
        const esperado = i < activos.length - 1
          ? Math.round(std * factor)    // niveles intermedios: proporcional
          : pond;                        // nivel máximo: exactamente la ponderación
        if (Number(ec[key]) !== esperado) {
          ec[key] = esperado;
          cambiados = true;
        }
      });
      if (cambiados) {
        console.warn(
          `[claudeService] EC${idx + 1} Nivel de Logro recalculado para pond=${pond}%: ` +
          activos.map(({ key }) => `${key}=${ec[key]}`).join(', ')
        );
      }
    });
  }

  // Horas punto 19: verificar y corregir que Σ distribucionHoraria.teoria == horasDocente (punto 8)
  const horasDocente = Number(data.identificacion?.horasDocente ?? 0);
  const totalSemestre = Number(data.identificacion?.cargaHoraria?.totalSemestre ?? 0);
  const referencia = horasDocente > 0 ? horasDocente : totalSemestre;
  if (referencia > 0) {
    const ecs = data.elementosDeCompetencia;
    const sumaActual = ecs.reduce((sum, ec) => sum + Number(ec.distribucionHoraria?.teoria ?? 0), 0);

    if (sumaActual !== referencia) {
      // Redistribuir proporcionalmente; si todos son 0, repartir igual
      const base = sumaActual > 0 ? sumaActual : ecs.length;
      let acumulado = 0;
      ecs.forEach((ec, i) => {
        if (!ec.distribucionHoraria) ec.distribucionHoraria = {};
        const pesoOriginal = sumaActual > 0 ? Number(ec.distribucionHoraria.teoria ?? 0) : 1;
        const nuevo = i < ecs.length - 1
          ? Math.round((pesoOriginal / base) * referencia)
          : referencia - acumulado;           // último EC absorbe el residuo de redondeo
        ec.distribucionHoraria.teoria = nuevo;
        acumulado += nuevo;
      });
      const sumaNueva = ecs.reduce((s, ec) => s + Number(ec.distribucionHoraria.teoria), 0);
      console.warn(
        `[claudeService] Distribución horaria (punto 19) corregida: ${sumaActual}h → ${sumaNueva}h ` +
        `(referencia horasDocente=${referencia}h).`
      );
    } else {
      console.log(`[claudeService] ✓ Distribución horaria (punto 19) verificada: Σ=${sumaActual}h = horasDocente=${referencia}h`);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Función principal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Genera el contenido completo del Proyecto Formativo llamando a la API de Claude.
 *
 * @param {string} textoProgramaDocente - Texto extraído del PDF del programa docente
 * @param {Object} [datosAsignatura={}]  - Metadatos adicionales (nombre, sigla, semestre…)
 * @returns {Promise<Object>}            - Objeto JSON estructurado del proyecto formativo
 */
async function generateProyectoFormativo(textoProgramaDocente, datosAsignatura = {}, numECs = null, apiKey, malla) {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('No se ha configurado la clave de API de Anthropic. Ingresala en Configuración.');
  }

  if (!textoProgramaDocente || textoProgramaDocente.trim().length < 50) {
    throw new Error('El texto del programa docente es demasiado corto o está vacío.');
  }

  const client = new Anthropic({ apiKey: apiKey.trim() });

  console.log(`[claudeService] malla=${malla ? `"${malla.carrera}"` : 'null (sin malla, se usará descripción textual)'}`);
  const userPrompt = await buildUserPrompt(textoProgramaDocente, datosAsignatura, numECs, malla);

  let message;
  try {
    message = await client.messages.create({
      model: MODELO,
      max_tokens: 16000,
      system: buildSystemPrompt(malla),
      messages: [{ role: 'user', content: userPrompt }],
    });
  } catch (apiError) {
    // Distinguir errores de autenticación, límite de tasa y errores genéricos
    if (apiError.status === 401) {
      throw new Error('API key de Anthropic inválida o no configurada. Revisa la variable ANTHROPIC_API_KEY.');
    }
    if (apiError.status === 429) {
      throw new Error('Límite de solicitudes de la API de Anthropic alcanzado. Intenta nuevamente en unos momentos.');
    }
    if (apiError.status === 529) {
      throw new Error('La API de Anthropic está sobrecargada. Intenta nuevamente en unos momentos.');
    }
    throw new Error(`Error al llamar a la API de Anthropic: ${apiError.message}`);
  }

  // Detectar truncación por límite de tokens antes de intentar parsear
  if (message.stop_reason === 'max_tokens') {
    throw new Error(
      'La respuesta de Claude fue truncada (max_tokens alcanzado). ' +
      'El programa docente puede ser demasiado extenso. Intenta con un PDF más conciso.'
    );
  }

  // Extraer el texto de la respuesta
  const rawText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('');

  if (!rawText.trim()) {
    throw new Error('Claude devolvió una respuesta vacía.');
  }

  // Parsear el JSON — Claude a veces envuelve en ```json ... ``` a pesar de la instrucción
  let data;
  try {
    // 1. Eliminar bloques de código markdown: ```json ... ``` o ``` ... ```
    let cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    // 2. Extraer el objeto JSON más externo (desde la primera { hasta la última })
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1 || end < start) {
      throw new SyntaxError('No se encontró ningún objeto JSON en la respuesta.');
    }
    cleaned = cleaned.slice(start, end + 1);

    data = JSON.parse(cleaned);
  } catch (parseError) {
    console.error('[claudeService] Respuesta cruda de Claude (primeros 800 chars):\n', rawText.slice(0, 800));
    throw new Error(`La respuesta de Claude no es un JSON válido: ${parseError.message}`);
  }

  // Validar campos obligatorios y restricciones numéricas
  validateResponse(data);

  // Adjuntar la malla para que docxGenerator la use directamente
  data._mallaData = malla ?? null;

  return data;
}

module.exports = { generateProyectoFormativo };
