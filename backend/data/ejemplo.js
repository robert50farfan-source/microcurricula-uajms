/**
 * Ejemplo de referencia completo: Proyecto Formativo
 * Asignatura: Arquitectura de Computadores I — Sigla: DIC-112
 * Semestre 1 — Ingeniería Informática, UAJMS
 *
 * Este ejemplo se envía a Claude como referencia few-shot para que comprenda
 * exactamente el nivel de detalle, el tono y la estructura esperados.
 */

const ejemplo = {

  // ═══════════════════════════════════════════════════════════════════════
  // SECCIÓN I — IDENTIFICACIÓN
  // ═══════════════════════════════════════════════════════════════════════
  identificacion: {
    facultad:     'FACULTAD DE INGENIERIA EN RECURSOS NATURALES Y TECNOLOGIA',
    carrera:      'Ingeniería Informática',
    semestre:     'Primero',
    asignatura:   'Arquitectura de Computadores I',
    prerrequisito: 'Ninguno',
    sigla:        'DIC-112',
    carga_horaria: {
      horas_teoria:       2,
      horas_practica:     2,
      horas_laboratorio:  0,
      total_semana:       4,
      total_semestre:     72,  // 18 semanas × 4 h
    },
    distribucion_horaria: {
      horas_docente:   72,
      horas_autonomo:  36,
      // Total con autónomo: 108 h (para créditos académicos)
    },
    nombre_docente: 'Ing. Carlos Alberto Fernández Quispe',
    justificacion: `La asignatura Arquitectura de Computadores I constituye el fundamento técnico
indispensable para comprender cómo funcionan internamente los sistemas computacionales modernos.
Al estudiar los principios de representación de la información, la organización interna del procesador,
los sistemas de memoria y los mecanismos de entrada/salida, el estudiante de primer semestre adquiere
la base conceptual que sustenta el resto de su formación en ingeniería informática. Sin este conocimiento,
disciplinas como sistemas operativos, redes, programación de bajo nivel y arquitecturas distribuidas
resultan inaccesibles en profundidad. La asignatura contribuye directamente al perfil del Ingeniero
Informático capaz de diseñar, optimizar e integrar soluciones tecnológicas de software y hardware.`,
  },

  // ═══════════════════════════════════════════════════════════════════════
  // UBICACIÓN EN LA MALLA CURRICULAR
  // ═══════════════════════════════════════════════════════════════════════
  malla_curricular: {
    semestre_ubicacion: 1,
    categoria_color:    'verde',
    categoria_nombre:   'Básica Formación Disciplinar',
    asignaturas_previas:    ['Ninguna (asignatura de primer semestre)'],
    asignaturas_siguientes: ['Arquitectura de Computadores II', 'Administración de Sistemas Operativos'],
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SECCIÓN II — COMPETENCIAS
  // ═══════════════════════════════════════════════════════════════════════
  competencias: {
    competencia_global_carrera: `Diseñar, desarrollar e implementar soluciones informáticas de calidad,
aplicando conocimientos científicos y tecnológicos para resolver problemas reales de la sociedad,
con responsabilidad ética y compromiso con el desarrollo sostenible.`,

    competencia_asignatura: `Analizar la organización y funcionamiento interno de los sistemas computacionales
modernos, aplicando los principios de representación de la información, arquitectura del procesador,
jerarquía de memoria y mecanismos de E/S, para fundamentar el diseño e integración de soluciones
informáticas eficientes.`,

    elementos_competencia: [
      {
        id: 'EC1',
        elemento_competencia: `Interpretar los sistemas de representación numérica y codificación de la información
utilizados en los computadores modernos para comprender los fundamentos del procesamiento digital.`,
        evidencias: [
          'Ejercicio práctico de conversión entre sistemas numéricos (binario, octal, hexadecimal)',
          'Informe sobre representación de enteros y punto flotante (IEEE 754)',
          'Cuestionario de evaluación de la unidad',
        ],
        nivel_logro: 'Básico',
        evaluacion: {
          indicadores: [
            'Convierte correctamente números entre sistemas posicionales (binario, octal, decimal, hexadecimal)',
            'Explica el estándar IEEE 754 para representación de punto flotante',
            'Identifica y aplica los códigos BCD, Gray y ASCII',
          ],
          instrumentos: ['Rúbrica de ejercicio práctico', 'Cuestionario escrito'],
          ponderacion: 20,
        },
        distribucion_horaria: {
          horas_teoria:       8,
          horas_practica:     8,
          horas_autonomo:     6,
          horas_investigacion: 2,
          horas_interaccion:  0,
          total_ec:           24,
        },
      },
      {
        id: 'EC2',
        elemento_competencia: `Describir la organización interna y el ciclo de funcionamiento del procesador,
identificando los componentes de la ALU, la unidad de control y los registros para comprender
la ejecución de instrucciones a nivel de hardware.`,
        evidencias: [
          'Diagrama detallado de la arquitectura interna de un procesador (ALU, UC, registros)',
          'Informe de análisis del ciclo fetch-decode-execute',
          'Práctica de simulación en Logisim o similar',
        ],
        nivel_logro: 'Básico',
        evaluacion: {
          indicadores: [
            'Identifica y describe los componentes internos principales del procesador',
            'Explica el ciclo de instrucción completo (búsqueda, decodificación, ejecución)',
            'Distingue entre arquitecturas RISC y CISC con sus ventajas y limitaciones',
          ],
          instrumentos: ['Informe técnico con rúbrica', 'Simulación práctica evaluada'],
          ponderacion: 30,
        },
        distribucion_horaria: {
          horas_teoria:       10,
          horas_practica:     10,
          horas_autonomo:     8,
          horas_investigacion: 4,
          horas_interaccion:  0,
          total_ec:           32,
        },
      },
      {
        id: 'EC3',
        elemento_competencia: `Comparar los distintos niveles de la jerarquía de memoria y los mecanismos
de entrada/salida de un sistema computacional para evaluar su impacto en el rendimiento global.`,
        evidencias: [
          'Tabla comparativa de tecnologías de memoria (registros, caché, RAM, disco)',
          'Informe de análisis de rendimiento con benchmarks básicos',
          'Exposición grupal sobre interfaces y buses de E/S',
        ],
        nivel_logro: 'Autónomo',
        evaluacion: {
          indicadores: [
            'Compara correctamente las características de cada nivel de la jerarquía de memoria',
            'Explica el principio de localidad y su relación con la caché',
            'Identifica los estándares modernos de buses y dispositivos de E/S',
          ],
          instrumentos: ['Tabla comparativa evaluada con rúbrica', 'Exposición grupal', 'Examen parcial'],
          ponderacion: 30,
        },
        distribucion_horaria: {
          horas_teoria:       8,
          horas_practica:     6,
          horas_autonomo:     8,
          horas_investigacion: 4,
          horas_interaccion:  2,
          total_ec:           28,
        },
      },
      {
        id: 'EC4',
        elemento_competencia: `Evaluar tendencias actuales en arquitectura de computadores —sistemas
multinúcleo, computación en la nube y arquitecturas especializadas (GPU, FPGA)— para reconocer
su relevancia en el contexto profesional del Ingeniero Informático.`,
        evidencias: [
          'Ensayo analítico sobre arquitecturas contemporáneas (mínimo 1000 palabras)',
          'Presentación comparativa de dos arquitecturas especializadas',
          'Examen final integrador',
        ],
        nivel_logro: 'Autónomo',
        evaluacion: {
          indicadores: [
            'Explica las características y ventajas de los procesadores multinúcleo',
            'Describe los principios de la computación en la nube y su relación con el hardware',
            'Compara arquitecturas GPU y FPGA con casos de uso reales',
          ],
          instrumentos: ['Rúbrica de ensayo', 'Rúbrica de presentación', 'Examen final escrito'],
          ponderacion: 20,
        },
        distribucion_horaria: {
          horas_teoria:       6,
          horas_practica:     4,
          horas_autonomo:     6,
          horas_investigacion: 4,
          horas_interaccion:  2,
          total_ec:           22,
        },
      },
    ],

    // Verificación: 20 + 30 + 30 + 20 = 100 %
    // Horas totales: 24 + 32 + 28 + 22 = 106 h (72 docente + 34 autónomo ≈ correcto)
  },

  // ═══════════════════════════════════════════════════════════════════════
  // SECCIÓN III — RUTA FORMATIVA
  // ═══════════════════════════════════════════════════════════════════════
  ruta_formativa: [
    // ── EC1: Representación de la información ────────────────────────────
    {
      ec_id: 'EC1',
      saber_conocer: [
        'Sistemas numéricos posicionales: binario, octal, decimal, hexadecimal',
        'Conversión entre sistemas numéricos: métodos de división sucesiva y factorización',
        'Aritmética binaria: suma, resta, multiplicación y división',
        'Representación de enteros: magnitud y signo, complemento a 1, complemento a 2',
        'Representación de punto flotante: estándar IEEE 754 (simple y doble precisión)',
        'Códigos alfanuméricos: BCD, código Gray, ASCII, Unicode (UTF-8)',
        'Álgebra de Boole: axiomas, teoremas, simplificación de expresiones',
        'Compuertas lógicas básicas y universales (NAND, NOR)',
      ],
      saber_hacer: [
        'Convertir números entre los distintos sistemas posicionales con precisión',
        'Realizar operaciones aritméticas en binario detectando desbordamiento (overflow)',
        'Representar números decimales en formato IEEE 754',
        'Codificar y decodificar mensajes usando ASCII y Unicode',
        'Simplificar expresiones booleanas usando álgebra y mapas de Karnaugh',
        'Diseñar circuitos combinacionales básicos a partir de tablas de verdad',
      ],
      saber_ser: [
        'Precisión y rigor en la resolución de ejercicios matemáticos',
        'Perseverancia ante la dificultad inicial con los sistemas no decimales',
        'Trabajo colaborativo en la resolución de problemas grupales',
        'Curiosidad intelectual por comprender los fundamentos del procesamiento digital',
      ],

      unidad_aprendizaje: 'Unidad 1: Representación de la Información en Sistemas Digitales',

      contenido: [
        '1. Sistemas numéricos posicionales',
        '   1.1 Sistema binario',
        '   1.2 Sistema octal',
        '   1.3 Sistema hexadecimal',
        '   1.4 Conversiones entre sistemas',
        '2. Aritmética binaria',
        '   2.1 Suma y resta binaria',
        '   2.2 Representación de negativos (complemento a 2)',
        '   2.3 Detección de overflow',
        '3. Punto flotante',
        '   3.1 Notación científica binaria',
        '   3.2 Estándar IEEE 754 de simple precisión',
        '   3.3 Estándar IEEE 754 de doble precisión',
        '4. Códigos de información',
        '   4.1 Código BCD',
        '   4.2 Código Gray',
        '   4.3 ASCII y Unicode',
        '5. Álgebra de Boole y compuertas lógicas',
        '   5.1 Axiomas y teoremas del álgebra de Boole',
        '   5.2 Compuertas lógicas AND, OR, NOT, NAND, NOR, XOR',
        '   5.3 Simplificación con mapas de Karnaugh',
      ],

      actividades: {
        docente_teoricas: [
          'Clase expositiva con diapositivas sobre sistemas numéricos (semana 1)',
          'Demostración paso a paso de conversiones en pizarrón (semanas 1-2)',
          'Explicación del estándar IEEE 754 con ejemplos reales (semana 3)',
          'Presentación de álgebra de Boole con aplicaciones en circuitos digitales (semana 4)',
        ],
        docente_practicas: [
          'Taller de conversiones numéricas con ejercicios graduados de dificultad (semana 2)',
          'Práctica de operaciones aritméticas binarias y detección de overflow (semana 3)',
          'Ejercicio de codificación/decodificación ASCII de mensajes (semana 3)',
          'Taller de simplificación booleana con mapas de Karnaugh (semana 4)',
        ],
        autonomas: [
          'Resolución de series de ejercicios de conversión numérica (entregable semana 2)',
          'Práctica individual de representación IEEE 754 con calculadora científica',
          'Estudio del material bibliográfico de los capítulos 1 y 2 de Patterson & Hennessy',
          'Preparación de resumen conceptual de álgebra de Boole',
        ],
        investigacion: [
          'Investigación bibliográfica: evolución histórica de los sistemas de numeración en computación',
          'Consulta del estándar IEEE 754-2008 en el sitio oficial de IEEE',
        ],
        interaccion_social: [],
      },
    },

    // ── EC2: Organización del procesador ─────────────────────────────────
    {
      ec_id: 'EC2',
      saber_conocer: [
        'Modelo de Von Neumann y sus componentes fundamentales',
        'Organización de la Unidad Aritmético-Lógica (ALU): circuitos sumadores, multiplicadores',
        'Registros del procesador: propósito general, especiales (PC, IR, MAR, MDR)',
        'Unidad de Control: cableada vs microprogramada',
        'Ciclo de instrucción: fetch, decode, execute, write-back',
        'Conjunto de instrucciones (ISA): tipos de instrucciones y modos de direccionamiento',
        'Comparación de arquitecturas RISC y CISC',
        'Pipeline: principio, etapas y hazards (datos, control, estructurales)',
      ],
      saber_hacer: [
        'Trazar el camino de datos de una instrucción a través de los componentes del procesador',
        'Analizar el ciclo fetch-decode-execute para instrucciones concretas',
        'Identificar modos de direccionamiento en fragmentos de código ensamblador',
        'Simular el funcionamiento básico de un procesador en Logisim',
        'Identificar y clasificar hazards de pipeline en secuencias de instrucciones',
      ],
      saber_ser: [
        'Pensamiento analítico y capacidad de abstracción para comprender procesos internos',
        'Atención al detalle en el trazado de caminos de datos',
        'Responsabilidad en la entrega de informes técnicos con precisión',
        'Iniciativa para explorar simuladores y herramientas de modelado',
      ],

      unidad_aprendizaje: 'Unidad 2: Organización Interna y Funcionamiento del Procesador',

      contenido: [
        '1. Modelo de Von Neumann',
        '   1.1 CPU, Memoria, E/S y bus del sistema',
        '   1.2 Limitaciones del modelo de Von Neumann',
        '2. Unidad Aritmético-Lógica (ALU)',
        '   2.1 Sumadores: semisumador y sumador completo',
        '   2.2 Sumador con acarreo anticipado (carry lookahead)',
        '   2.3 Operaciones lógicas en la ALU',
        '3. Registros del procesador',
        '   3.1 Registros de propósito general',
        '   3.2 Contador de programa (PC)',
        '   3.3 Registro de instrucción (IR)',
        '   3.4 MAR y MDR',
        '4. Unidad de Control',
        '   4.1 Control cableado',
        '   4.2 Control microprogramado',
        '5. Ciclo de instrucción',
        '   5.1 Fase de búsqueda (fetch)',
        '   5.2 Fase de decodificación (decode)',
        '   5.3 Fase de ejecución (execute)',
        '   5.4 Escritura de resultados (write-back)',
        '6. Conjunto de instrucciones (ISA)',
        '   6.1 Tipos de instrucciones: aritmético-lógicas, transferencia, salto',
        '   6.2 Modos de direccionamiento',
        '   6.3 Arquitecturas RISC vs CISC',
        '7. Segmentación (Pipeline)',
        '   7.1 Concepto y ventajas del pipeline',
        '   7.2 Riesgos: de datos, de control, estructurales',
        '   7.3 Técnicas de mitigación',
      ],

      actividades: {
        docente_teoricas: [
          'Clase expositiva sobre el modelo de Von Neumann con esquema en pizarrón (semana 5)',
          'Explicación detallada de la ALU y construcción de sumadores (semana 5)',
          'Presentación del ciclo fetch-decode-execute con diagrama de estados (semana 6)',
          'Clase comparativa RISC vs CISC con ejemplos de procesadores reales (semana 7)',
          'Exposición sobre pipeline y análisis de hazards (semana 8)',
        ],
        docente_practicas: [
          'Simulación del ciclo de instrucción en Logisim con procesador de 8 bits (semanas 6-7)',
          'Taller de identificación de modos de direccionamiento en código MIPS (semana 7)',
          'Práctica de análisis de hazards en secuencias de instrucciones (semana 8)',
        ],
        autonomas: [
          'Elaboración del diagrama de la arquitectura interna del procesador (entregable)',
          'Lectura de los capítulos 4 y 5 de Patterson & Hennessy: "Computer Organization and Design"',
          'Instalación y exploración autónoma de Logisim Evolution',
          'Informe comparativo RISC vs CISC: análisis de Intel Core y ARM Cortex',
        ],
        investigacion: [
          'Investigación sobre la evolución histórica de las arquitecturas x86 y ARM',
          'Consulta de datasheets oficiales de procesadores comerciales (Intel, AMD, ARM)',
        ],
        interaccion_social: [],
      },
    },

    // ── EC3: Jerarquía de memoria y E/S ──────────────────────────────────
    {
      ec_id: 'EC3',
      saber_conocer: [
        'Principio de localidad temporal y espacial',
        'Jerarquía de memoria: registros, caché L1/L2/L3, RAM, disco, almacenamiento en nube',
        'Tipos de memoria RAM: SRAM, DRAM, SDRAM, DDR4, DDR5',
        'Memoria caché: mapeo directo, totalmente asociativo, asociativo por conjuntos',
        'Políticas de reemplazo: LRU, FIFO, aleatoria',
        'Memoria virtual: paginación, segmentación, TLB',
        'Buses del sistema: FSB, PCIe, USB, SATA, NVMe',
        'Técnicas de transferencia de E/S: polling, interrupciones, DMA',
        'Dispositivos de entrada/salida modernos y sus interfaces',
      ],
      saber_hacer: [
        'Calcular tasas de acierto (hit rate) y tiempo de acceso promedio en memorias caché',
        'Determinar la dirección de bloque en caché con mapeo directo',
        'Analizar el rendimiento de un sistema según su configuración de memoria',
        'Comparar tecnologías de almacenamiento (HDD, SSD NVMe) mediante benchmarks',
        'Identificar los estándares de buses en una placa madre real o esquema',
      ],
      saber_ser: [
        'Pensamiento crítico para evaluar el rendimiento de sistemas computacionales',
        'Trabajo en equipo para la preparación y exposición grupal',
        'Comunicación oral efectiva en la presentación de resultados',
        'Actitud investigativa ante la rápida evolución de las tecnologías de memoria',
      ],

      unidad_aprendizaje: 'Unidad 3: Jerarquía de Memoria y Sistemas de Entrada/Salida',

      contenido: [
        '1. Principio de localidad',
        '   1.1 Localidad temporal',
        '   1.2 Localidad espacial',
        '2. Jerarquía de memoria',
        '   2.1 Registros del procesador',
        '   2.2 Memoria caché (L1, L2, L3)',
        '   2.3 Memoria principal (RAM)',
        '   2.4 Almacenamiento secundario (SSD, HDD)',
        '   2.5 Almacenamiento terciario y en la nube',
        '3. Tecnologías de memoria RAM',
        '   3.1 SRAM vs DRAM',
        '   3.2 Evolución: SDR, DDR, DDR4, DDR5',
        '4. Memoria caché',
        '   4.1 Organización: mapeo directo, asociativo y por conjuntos',
        '   4.2 Políticas de escritura: write-through y write-back',
        '   4.3 Políticas de reemplazo: LRU, FIFO',
        '   4.4 Cálculo del tiempo de acceso efectivo',
        '5. Memoria virtual',
        '   5.1 Paginación y tablas de páginas',
        '   5.2 TLB (Translation Lookaside Buffer)',
        '   5.3 Fallo de página y thrashing',
        '6. Buses e interconexiones',
        '   6.1 Bus del sistema y arquitectura de buses',
        '   6.2 Estándares: PCIe, USB 3.x, Thunderbolt, NVMe',
        '7. Sistemas de Entrada/Salida',
        '   7.1 Polling e interrupciones',
        '   7.2 Acceso Directo a Memoria (DMA)',
        '   7.3 Dispositivos y controladores de E/S',
      ],

      actividades: {
        docente_teoricas: [
          'Clase expositiva sobre jerarquía de memoria con pirámide comparativa (semana 10)',
          'Presentación de tecnologías RAM y evolución DDR con curvas de rendimiento (semana 10)',
          'Explicación de la memoria caché y cálculo de hit rate con ejemplos (semana 11)',
          'Clase sobre buses modernos con comparativa de velocidades (semana 12)',
          'Exposición sobre técnicas de E/S: polling, interrupciones y DMA (semana 13)',
        ],
        docente_practicas: [
          'Ejercicios de cálculo de tiempo de acceso efectivo con distintos escenarios de caché (semana 11)',
          'Práctica con herramienta CPU-Z para identificar memoria y caché del equipo (semana 12)',
          'Análisis comparativo de benchmarks de SSD vs HDD con CrystalDiskMark (semana 13)',
        ],
        autonomas: [
          'Elaboración de tabla comparativa de tecnologías de memoria (entregable)',
          'Lectura del capítulo 5 de Patterson & Hennessy sobre la jerarquía de memoria',
          'Preparación de exposición grupal sobre interfaces de E/S (semana 13)',
        ],
        investigacion: [
          'Investigación sobre las últimas generaciones de memoria DDR5 y LPDDR5X',
          'Consulta de artículos académicos sobre técnicas de prefetching en caché',
        ],
        interaccion_social: [
          'Exposición grupal ante la clase sobre interfaces de E/S modernas (USB4, Thunderbolt 5, PCIe 5.0)',
        ],
      },
    },

    // ── EC4: Tendencias actuales ──────────────────────────────────────────
    {
      ec_id: 'EC4',
      saber_conocer: [
        'Procesadores multinúcleo: arquitectura, comunicación entre núcleos y gestión de caché compartida',
        'Computación paralela: SIMD, MIMD, taxonomía de Flynn',
        'Unidades de procesamiento gráfico (GPU): arquitectura CUDA y SIMT',
        'Dispositivos lógicos programables: FPGA y CPLD',
        'Computación en la nube: IaaS, PaaS, SaaS y su relación con el hardware',
        'Procesadores de uso específico: DSP, TPU (Tensor Processing Unit)',
        'Tendencias emergentes: computación neuromórfica, cuántica y edge computing',
      ],
      saber_hacer: [
        'Analizar las ventajas y limitaciones de los procesadores multinúcleo respecto a los de un solo núcleo',
        'Identificar escenarios donde una GPU supera a una CPU y viceversa',
        'Comparar dos arquitecturas especializadas (GPU vs FPGA) para una aplicación dada',
        'Redactar un ensayo académico argumentativo sobre tendencias en arquitectura de computadores',
        'Elaborar una presentación técnica estructurada con conclusiones y referencias',
      ],
      saber_ser: [
        'Visión prospectiva para anticipar el impacto de las nuevas tecnologías en la profesión',
        'Pensamiento crítico para evaluar fuentes de información tecnológica',
        'Responsabilidad académica en la elaboración del ensayo (citación correcta)',
        'Apertura al aprendizaje continuo en un campo en constante evolución',
      ],

      unidad_aprendizaje: 'Unidad 4: Tendencias Contemporáneas en Arquitectura de Computadores',

      contenido: [
        '1. Procesadores multinúcleo',
        '   1.1 Motivación: límite de la frecuencia de reloj (power wall)',
        '   1.2 Arquitectura de múltiples núcleos',
        '   1.3 Coherencia de caché en sistemas multinúcleo',
        '   1.4 Paralelismo a nivel de hilo (TLP)',
        '2. Computación paralela',
        '   2.1 Taxonomía de Flynn: SISD, SIMD, MISD, MIMD',
        '   2.2 OpenMP y programación paralela básica',
        '3. Unidades de Procesamiento Gráfico (GPU)',
        '   3.1 Arquitectura GPU: SM, warp, SIMT',
        '   3.2 Comparativa CPU vs GPU por tipo de tarea',
        '   3.3 CUDA y OpenCL como plataformas de cómputo general (GPGPU)',
        '4. Dispositivos lógicos programables',
        '   4.1 Arquitectura interna de una FPGA',
        '   4.2 Casos de uso: procesamiento de señales, IA en el borde',
        '5. Computación en la nube',
        '   5.1 Modelos de servicio: IaaS, PaaS, SaaS',
        '   5.2 Virtualización de hardware y hipervisores',
        '   5.3 Centros de datos y su arquitectura física',
        '6. Arquitecturas especializadas emergentes',
        '   6.1 TPU (Tensor Processing Unit) de Google',
        '   6.2 Computación neuromórfica (Intel Loihi)',
        '   6.3 Computación cuántica: qubits y puertas cuánticas',
        '   6.4 Edge computing y sus requerimientos de hardware',
      ],

      actividades: {
        docente_teoricas: [
          'Clase expositiva sobre la crisis del "power wall" y el giro hacia el paralelismo (semana 14)',
          'Presentación de la taxonomía de Flynn y arquitecturas paralelas (semana 14)',
          'Charla sobre GPU: de los gráficos al cómputo general con CUDA (semana 15)',
          'Exposición sobre computación en la nube y virtualización de hardware (semana 16)',
          'Clase de síntesis: panorama de arquitecturas emergentes (semana 17)',
        ],
        docente_practicas: [
          'Demostración en vivo: comparativa de rendimiento CPU vs GPU en tarea de álgebra lineal (semana 15)',
          'Análisis de especificaciones técnicas de servidores cloud (AWS, Azure, GCP) (semana 16)',
        ],
        autonomas: [
          'Redacción de ensayo académico: "Impacto de las arquitecturas multinúcleo en el desarrollo de software moderno" (entregable semana 17)',
          'Preparación de presentación comparativa de dos arquitecturas especializadas (semana 15)',
          'Lectura de artículo: "In-Datacenter Performance Analysis of a Tensor Processing Unit" (Google, 2017)',
        ],
        investigacion: [
          'Investigación sobre el estado del arte de la computación cuántica (IBM Quantum, Google Sycamore)',
          'Revisión de artículos recientes (2022-2024) sobre edge computing y su hardware',
        ],
        interaccion_social: [
          'Presentación grupal de arquitecturas especializadas ante docentes y compañeros (semana 17)',
        ],
      },
    },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // CRONOGRAMA DE EJECUCIÓN (18 semanas)
  // ═══════════════════════════════════════════════════════════════════════
  cronograma: [
    { semana: 1,  ec: 'EC1', unidad: 'Unidad 1', contenido: 'Presentación de la asignatura. Sistemas numéricos: binario, octal, hexadecimal. Conversiones.',                       actividad: 'Clase expositiva + ejercicios de conversión',                          horas: 4 },
    { semana: 2,  ec: 'EC1', unidad: 'Unidad 1', contenido: 'Aritmética binaria. Representación de enteros negativos: complemento a 2. Detección de overflow.',                    actividad: 'Taller de ejercicios aritméticos binarios. Entrega ejercicio 1.',      horas: 4 },
    { semana: 3,  ec: 'EC1', unidad: 'Unidad 1', contenido: 'Punto flotante: notación científica binaria. Estándar IEEE 754. Códigos BCD, Gray, ASCII.',                           actividad: 'Práctica de codificación IEEE 754 y ASCII. Cuestionario de evaluación.',horas: 4 },
    { semana: 4,  ec: 'EC1', unidad: 'Unidad 1', contenido: 'Álgebra de Boole: axiomas, teoremas. Compuertas lógicas. Mapas de Karnaugh.',                                         actividad: 'Taller de simplificación booleana. Cierre EC1.',                       horas: 4 },
    { semana: 5,  ec: 'EC2', unidad: 'Unidad 2', contenido: 'Modelo de Von Neumann. ALU: semisumador, sumador completo, sumador con carry lookahead.',                             actividad: 'Clase expositiva + diseño de sumadores en Logisim.',                   horas: 4 },
    { semana: 6,  ec: 'EC2', unidad: 'Unidad 2', contenido: 'Registros del procesador. Unidad de Control. Ciclo fetch-decode-execute.',                                            actividad: 'Simulación del ciclo de instrucción en Logisim.',                     horas: 4 },
    { semana: 7,  ec: 'EC2', unidad: 'Unidad 2', contenido: 'Conjunto de instrucciones (ISA). Modos de direccionamiento. Arquitecturas RISC vs CISC.',                            actividad: 'Taller de análisis de instrucciones MIPS. Informe comparativo RISC/CISC.',horas: 4 },
    { semana: 8,  ec: 'EC2', unidad: 'Unidad 2', contenido: 'Pipeline: etapas, ventajas y hazards de datos, control y estructurales. Técnicas de mitigación.',                    actividad: 'Análisis de hazards en secuencias de instrucciones. Cierre EC2.',     horas: 4 },
    { semana: 9,  ec: 'EC1-EC2', unidad: '1 y 2', contenido: 'Repaso integral de Unidades 1 y 2.',                                                                                actividad: 'EVALUACIÓN PARCIAL (EC1 + EC2)',                                       horas: 4 },
    { semana: 10, ec: 'EC3', unidad: 'Unidad 3', contenido: 'Principio de localidad. Jerarquía de memoria. Tecnologías RAM: SRAM, DRAM, DDR4, DDR5.',                             actividad: 'Clase expositiva + tabla comparativa de tecnologías (inicio).',        horas: 4 },
    { semana: 11, ec: 'EC3', unidad: 'Unidad 3', contenido: 'Memoria caché: organización, mapeo directo y asociativo. Cálculo de hit rate y tiempo de acceso efectivo.',          actividad: 'Ejercicios de cálculo de hit rate. Práctica con CPU-Z.',              horas: 4 },
    { semana: 12, ec: 'EC3', unidad: 'Unidad 3', contenido: 'Políticas de reemplazo (LRU, FIFO). Memoria virtual, paginación y TLB. Buses: PCIe, USB, NVMe.',                    actividad: 'Comparativa benchmarks SSD vs HDD. Entrega tabla comparativa.',       horas: 4 },
    { semana: 13, ec: 'EC3', unidad: 'Unidad 3', contenido: 'Sistemas de E/S: polling, interrupciones, DMA. Dispositivos modernos y sus controladores.',                          actividad: 'Exposición grupal sobre interfaces E/S modernas. Cierre EC3.',        horas: 4 },
    { semana: 14, ec: 'EC4', unidad: 'Unidad 4', contenido: 'Procesadores multinúcleo: motivación, arquitectura, coherencia de caché. Taxonomía de Flynn.',                       actividad: 'Clase expositiva + análisis de especificaciones de CPUs multinúcleo.',horas: 4 },
    { semana: 15, ec: 'EC4', unidad: 'Unidad 4', contenido: 'GPU: arquitectura CUDA/SIMT. Comparativa CPU vs GPU. FPGA: arquitectura y casos de uso.',                            actividad: 'Demo CPU vs GPU. Preparación de presentación grupal.',               horas: 4 },
    { semana: 16, ec: 'EC4', unidad: 'Unidad 4', contenido: 'Computación en la nube: IaaS, PaaS, SaaS. Virtualización y hipervisores. Centros de datos.',                        actividad: 'Análisis de arquitecturas cloud. Entrega avance de ensayo.',          horas: 4 },
    { semana: 17, ec: 'EC4', unidad: 'Unidad 4', contenido: 'Arquitecturas emergentes: TPU, computación neuromórfica, cuántica y edge computing.',                                actividad: 'Presentaciones grupales. Entrega ensayo final. Cierre EC4.',          horas: 4 },
    { semana: 18, ec: 'EC1-EC4', unidad: '1-4',  contenido: 'Repaso integral de la asignatura.',                                                                                  actividad: 'EVALUACIÓN FINAL INTEGRADORA',                                         horas: 4 },
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // SECCIÓN IV — RECURSOS
  // ═══════════════════════════════════════════════════════════════════════
  recursos: {
    didacticos: {
      hardware: [
        'Computadoras de escritorio del laboratorio de informática',
        'Proyector y pizarra digital del aula',
        'Placa madre desmontada para demostración física de componentes',
      ],
      software: [
        'Logisim Evolution 3.8 (simulador de circuitos digitales, software libre)',
        'CPU-Z (herramienta de identificación de hardware)',
        'CrystalDiskMark (benchmarking de almacenamiento)',
        'Microsoft Visual Studio Code (editor de código)',
      ],
      material_impreso: [
        'Guías de práctica elaboradas por el docente (disponibles en Moodle)',
        'Fichas de ejercicios por unidad',
      ],
      plataformas_digitales: [
        'Moodle institucional (plataforma principal del curso)',
        'GitHub (repositorio de materiales y prácticas)',
        'YouTube — Canal oficial del curso (videoconferencias grabadas)',
      ],
    },

    alianzas_estrategicas: [
      {
        institucion: 'Asociación de Empresas de Tecnología de Tarija (AETI)',
        tipo: 'Charla técnica de profesionales del sector sobre arquitecturas usadas en producción',
      },
    ],

    bibliografia: [
      'Patterson, D. A., & Hennessy, J. L. (2021). *Computer Organization and Design: The Hardware/Software Interface* (RISC-V Edition, 2nd ed.). Morgan Kaufmann.',
      'Tanenbaum, A. S., & Austin, T. (2012). *Structured Computer Organization* (6th ed.). Pearson.',
      'Hamacher, C., Vranesic, Z., Zaky, S., & Manjikian, N. (2011). *Computer Organization and Embedded Systems* (6th ed.). McGraw-Hill.',
      'Stallings, W. (2018). *Computer Organization and Architecture: Designing for Performance* (10th ed.). Pearson.',
      'Hennessy, J. L., & Patterson, D. A. (2019). *Computer Architecture: A Quantitative Approach* (6th ed.). Morgan Kaufmann.',
      'IEEE. (2019). *IEEE Standard for Floating-Point Arithmetic* (IEEE Std 754-2019). IEEE.',
      'Jouppi, N. P., et al. (2017). In-datacenter performance analysis of a tensor processing unit. *Proceedings of the 44th Annual International Symposium on Computer Architecture (ISCA)*. ACM. https://doi.org/10.1145/3079856.3080246',
    ],
  },
};

module.exports = { ejemplo };
