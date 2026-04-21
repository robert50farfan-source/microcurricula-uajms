/**
 * Plantilla oficial del Proyecto Formativo UAJMS v2
 * FACULTAD DE INGENIERIA EN RECURSOS NATURALES Y TECNOLOGIA — Ingeniería Informática
 *
 * Define la estructura completa de secciones, campos y tablas que Claude
 * debe completar para generar un Proyecto Formativo válido.
 */

const plantilla = {
  version: '2.0',
  institucion: {
    universidad: 'UNIVERSIDAD AUTÓNOMA "JUAN MISAEL SARACHO"',
    facultad: 'FACULTAD DE INGENIERIA EN RECURSOS NATURALES Y TECNOLOGÍA',
    carrera: 'INGENIERÍA INFORMÁTICA',
    documento: 'PROYECTO FORMATIVO',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECCIÓN I — IDENTIFICACIÓN
  // ─────────────────────────────────────────────────────────────────────────
  seccion_identificacion: {
    titulo: 'I. IDENTIFICACIÓN DE LA ASIGNATURA',
    campos: [
      { campo: 'facultad',      label: '1. Facultad' },
      { campo: 'carrera',       label: '2. Carrera' },
      { campo: 'semestre',      label: '3. Semestre' },
      { campo: 'asignatura',    label: '4. Asignatura' },
      { campo: 'prerrequisito', label: '5. Prerrequisito' },
      { campo: 'sigla',         label: '6. Sigla' },
      {
        campo: 'carga_horaria',
        label: '7. Carga Horaria Semestral',
        subCampos: [
          { campo: 'horas_teoria',      label: 'Teoría (h/sem)' },
          { campo: 'horas_practica',    label: 'Práctica (h/sem)' },
          { campo: 'horas_laboratorio', label: 'Laboratorio (h/sem)' },
          { campo: 'total_semana',      label: 'Total (h/sem)' },
          { campo: 'total_semestre',    label: 'Total semestre (h)' },
        ],
      },
      {
        campo: 'horas_docente',
        label: '8. Horas de Aprendizaje con el Docente',
        nota: 'Total debe coincidir con horas totales del semestre',
      },
      {
        campo: 'horas_autonomo',
        label: '9. Horas de Aprendizaje Autónomo del Estudiante',
        nota: 'Total debe coincidir con horas totales del semestre',
      },
      { campo: 'nombre_docente', label: '10. Nombre del Docente (e-mail, Cel.)' },
      {
        campo: 'justificacion',
        label: '11. Justificación de la Asignatura',
        descripcion: 'Fundamentación de la relevancia de la asignatura en el perfil del Ingeniero Informático y su aporte a la formación profesional.',
        longitud: 'párrafo de 80-150 palabras',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 12. UBICACIÓN EN LA MALLA CURRICULAR
  // ─────────────────────────────────────────────────────────────────────────
  seccion_malla: {
    titulo: '12. UBICACIÓN EN LA MALLA CURRICULAR',
    descripcion: 'Indicar el semestre y la categoría de la asignatura dentro de la malla, señalando las asignaturas precedentes (prerrequisitos) y las que se habilitan (dependientes).',
    campos: [
      { campo: 'semestre_ubicacion', label: 'Semestre' },
      { campo: 'categoria_color', label: 'Categoría (color en malla)' },
      { campo: 'asignaturas_previas', label: 'Asignaturas que la preceden' },
      { campo: 'asignaturas_siguientes', label: 'Asignaturas que habilita' },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECCIÓN II — COMPETENCIAS A FORMAR
  // ─────────────────────────────────────────────────────────────────────────
  seccion_competencias: {
    titulo: 'II. COMPETENCIAS A FORMAR',

    competencia_global_carrera: {
      label: '13. Competencia Global de la Carrera',
      descripcion: 'Competencia macro del perfil de egreso de Ingeniería Informática a la que contribuye esta asignatura.',
    },

    competencia_asignatura: {
      label: '14. Competencia de la Asignatura',
      descripcion: 'Competencia específica que el estudiante desarrollará al finalizar la asignatura. Debe iniciar con un verbo de desempeño observable.',
    },

    tabla_elementos: {
      label: 'Tabla de Elementos de Competencia (campos 15–19)',
      descripcion: 'Cada fila representa un elemento de competencia (EC). Generalmente coincide con las unidades temáticas principales.',
      columnas: [
        {
          campo: 'elemento_competencia',
          label: '15. Elemento de Competencia',
          descripcion: 'Enunciado del logro parcial. Inicia con verbo en infinitivo.',
        },
        {
          campo: 'evidencias',
          label: '16. Evidencias de Aprendizaje',
          descripcion: 'Productos o desempeños concretos que demuestran el logro (ej. informe, práctica de laboratorio, examen, proyecto).',
        },
        {
          campo: 'nivel_logro',
          label: '17. Nivel de Logro de Aprendizaje',
          opciones: ['Inicial', 'Básico', 'Autónomo', 'Estratégico'],
          descripcion: 'Nivel de dominio esperado al finalizar el elemento de competencia.',
        },
        {
          campo: 'evaluacion',
          label: '18. Evaluación',
          subColumnas: [
            { campo: 'indicadores',  label: '18.1 Indicadores de logro' },
            { campo: 'instrumentos', label: '18.2 Instrumentos de evaluación' },
            { campo: 'ponderacion',  label: '18.3 Ponderación (%)' },
          ],
          nota: 'Las ponderaciones de todos los EC deben sumar 100%.',
        },
        {
          campo: 'distribucion_horaria_ec',
          label: '19. Distribución de Carga Horaria',
          subColumnas: [
            { campo: 'horas_teoria',       label: 'Teoría' },
            { campo: 'horas_practica',     label: 'Práctica' },
            { campo: 'horas_autonomo',     label: 'Autónomo' },
            { campo: 'horas_investigacion',label: 'Investigación' },
            { campo: 'horas_interaccion',  label: 'Interacción Social' },
            { campo: 'total_ec',           label: 'Total EC' },
          ],
          nota: 'La suma de todos los EC debe coincidir con la distribución horaria total de la asignatura.',
        },
      ],
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECCIÓN III — RUTA FORMATIVA
  // ─────────────────────────────────────────────────────────────────────────
  seccion_ruta_formativa: {
    titulo: 'III. RUTA FORMATIVA',
    descripcion: 'Por cada Elemento de Competencia definido en la Sección II, se detalla el qué y el cómo del proceso de enseñanza-aprendizaje.',

    estructura_por_ec: {
      titulo_bloque: '20. Proceso de Desarrollo de la Competencia',
      nota_subnumero: 'Cada EC lleva subnúmero: 20.1, 20.2, 20.3 … 20.n',

      campos_saberes: [
        {
          campo: 'saber_conocer',
          label: 'Saber Conocer (Contenidos Conceptuales)',
          descripcion: 'Conceptos, teorías, principios y hechos que el estudiante debe conocer.',
        },
        {
          campo: 'saber_hacer',
          label: 'Saber Hacer (Contenidos Procedimentales)',
          descripcion: 'Habilidades, técnicas y procedimientos que el estudiante debe aplicar.',
        },
        {
          campo: 'saber_ser',
          label: 'Saber Ser (Contenidos Actitudinales)',
          descripcion: 'Valores, actitudes y disposiciones que el estudiante debe demostrar.',
        },
      ],

      unidad_aprendizaje: {
        campo: 'unidad_aprendizaje',
        label: 'Unidad de Aprendizaje',
        descripcion: 'Nombre de la unidad temática que abarca este elemento de competencia.',
      },

      contenido: {
        campo: 'contenido',
        label: 'Contenido',
        descripcion: 'Lista detallada de temas y subtemas que componen la unidad de aprendizaje.',
        formato: 'lista numerada con subniveles',
      },

      actividades: {
        label: 'Actividades de Proceso Formativo',
        tipos: [
          {
            campo: 'actividades_docente_teoricas',
            label: 'Actividades Didácticas con el Docente — Teóricas',
            descripcion: 'Estrategias didácticas para los contenidos conceptuales (clase magistral, exposición, debate, etc.).',
          },
          {
            campo: 'actividades_docente_practicas',
            label: 'Actividades Didácticas con el Docente — Prácticas',
            descripcion: 'Estrategias para los contenidos procedimentales (laboratorio, taller, resolución de problemas, etc.).',
          },
          {
            campo: 'actividades_autonomas',
            label: 'Actividades de Aprendizaje Autónomas del Estudiante',
            descripcion: 'Trabajo independiente fuera del aula (lecturas, tareas, proyectos, estudio).',
          },
          {
            campo: 'actividades_investigacion',
            label: 'Actividades relacionadas con la Investigación',
            descripcion: 'Indagación, consulta bibliográfica, análisis de casos, estado del arte.',
          },
          {
            campo: 'actividades_interaccion_social',
            label: 'Actividades relacionadas con la Interacción Social',
            descripcion: 'Vinculación con el entorno: visitas técnicas, proyectos comunitarios, entrevistas, etc.',
          },
        ],
      },
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 21. CRONOGRAMA DE EJECUCIÓN
  // ─────────────────────────────────────────────────────────────────────────
  cronograma: {
    titulo: '21. Cronograma de Ejecución',
    totalSemanas: 18,
    columnas: [
      { campo: 'semana',              label: 'Semana' },
      { campo: 'elemento_competencia',label: 'Elemento de Competencia' },
      { campo: 'unidad',              label: 'Unidad de Aprendizaje' },
      { campo: 'contenido_semana',    label: 'Contenido / Tema' },
      { campo: 'actividad_semana',    label: 'Actividad Principal' },
      { campo: 'horas_semana',        label: 'Horas' },
    ],
    nota: 'Las semanas 9 y 18 generalmente corresponden a evaluaciones parcial y final respectivamente.',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SECCIÓN IV — RECURSOS
  // ─────────────────────────────────────────────────────────────────────────
  seccion_recursos: {
    titulo: 'IV. RECURSOS',
    subsecciones: [
      {
        campo: 'recursos_didacticos',
        label: '22. Recursos Didácticos',
        descripcion: 'Materiales, equipos, software, plataformas y herramientas utilizadas en el desarrollo de la asignatura.',
        categorias: ['Hardware', 'Software', 'Material impreso', 'Plataformas digitales'],
      },
      {
        campo: 'alianzas_estrategicas',
        label: '23. Alianzas Estratégicas',
        descripcion: 'Instituciones, empresas u organizaciones con las que se coordinan actividades de la asignatura (visitas, charlas, proyectos).',
        nota: 'Puede ser "Ninguna" si no aplica.',
      },
      {
        campo: 'bibliografia',
        label: '24. Bibliografía',
        descripcion: 'Referencias bibliográficas en formato APA 7ma edición. Mínimo 5 fuentes. Preferir publicaciones de los últimos 10 años.',
        tipos: ['Libros de texto', 'Artículos científicos', 'Documentación oficial', 'Recursos en línea'],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // INSTRUCCIONES GENERALES PARA CLAUDE
  // ─────────────────────────────────────────────────────────────────────────
  instrucciones_generales: `
    INSTRUCCIONES PARA GENERAR EL PROYECTO FORMATIVO:

    1. IDIOMA: Todo el contenido debe estar en español formal y académico.
    2. EXTENSIÓN: El proyecto debe ser completo. No omitir ninguna sección ni campo.
    3. VERBOS: Los enunciados de competencias y elementos de competencia deben iniciar con verbos en infinitivo (Desarrollar, Implementar, Analizar, etc.).
    4. COHERENCIA: Los elementos de competencia en la Sección II deben corresponderse exactamente con los bloques de la Sección III (Ruta Formativa).
    5. CRONOGRAMA: Las 18 semanas deben cubrirse completamente. Semana 9 → evaluación parcial, Semana 18 → evaluación final.
    6. PONDERACIÓN: Las ponderaciones de los Elementos de Competencia deben sumar exactamente 100%.
    7. HORAS: La distribución horaria total debe cuadrar con la carga horaria definida en la Sección I.
    8. BIBLIOGRAFÍA: Formato APA 7. Incluir año de publicación. Priorizar fuentes en español si existen.
    9. FORMATO DE RESPUESTA: Devolver un objeto JSON válido con exactamente la estructura definida en la plantilla.
    10. CONTENIDO: Basarse estrictamente en la información del programa docente proporcionado. Completar y enriquecer lo que falte usando la malla curricular y el conocimiento de la disciplina.
  `,
};

module.exports = { plantilla };
