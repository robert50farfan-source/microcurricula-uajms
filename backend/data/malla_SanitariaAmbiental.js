/**
 * Malla curricular oficial de Ingeniería Sanitaria y Ambiental — UAJMS
 * FACULTAD DE INGENIERIA EN RECURSOS NATURALES Y TECNOLOGIA
 *
 * Categorías por color:
 *   verde   → Básica Formación Disciplinar
 *   azul    → Básicas de la Ciencia
 *   naranja → Básica Formación Integral
 *   rojo    → Formación Disciplinar / Profesional
 *   morado  → Especialidad
 */

const malla = {
  carrera: 'Ingeniería Sanitaria y Ambiental',
  facultad: 'FACULTAD DE INGENIERIA EN RECURSOS NATURALES Y TECNOLOGIA',
  universidad: 'Universidad Autónoma "Juan Misael Saracho"',

  categorias: {
    verde:   'Básica Formación Disciplinar',
    azul:    'Básicas de la Ciencia',
    naranja: 'Básica Formación Integral',
    rojo:    'Formación Disciplinar / Profesional',
    morado:  'Especialidad',
  },

  semestres: [
    {
      numero: 1,
      asignaturas: [
        { nombre: 'Álgebra Lineal',                    categoria: 'azul'    },
        { nombre: 'Ecología Aplicada',                 categoria: 'verde'   },
        { nombre: 'Química General y Laboratorio',     categoria: 'azul'    },
        { nombre: 'Materiales de Construcción',        categoria: 'verde'   },
        { nombre: 'Diseño Asistido por Computadora',   categoria: 'verde'   },
        { nombre: 'Electiva I',                        categoria: 'morado'  },
      ],
    },
    {
      numero: 2,
      asignaturas: [
        { nombre: 'Cálculo I',                                    categoria: 'azul'    },
        { nombre: 'Física I y Laboratorio',                       categoria: 'azul'    },
        { nombre: 'Estadística y Probabilidades Aplicada',        categoria: 'azul'    },
        { nombre: 'Química Orgánica y Laboratorio',               categoria: 'azul'    },
        { nombre: 'Biología, Microbiología Aplicada y Laboratorio', categoria: 'verde' },
        { nombre: 'Electiva II',                                  categoria: 'morado'  },
      ],
    },
    {
      numero: 3,
      asignaturas: [
        { nombre: 'Cálculo II',                                               categoria: 'azul'    },
        { nombre: 'Geología Aplicada',                                        categoria: 'verde'   },
        { nombre: 'Química Sanitaria y Laboratorio',                          categoria: 'verde'   },
        { nombre: 'Física II y Laboratorio',                                  categoria: 'azul'    },
        { nombre: 'Topografía',                                               categoria: 'verde'   },
        { nombre: 'Metodología de la Investigación Aplicada a la Ingeniería', categoria: 'naranja' },
      ],
    },
    {
      numero: 4,
      asignaturas: [
        { nombre: 'Ecuaciones Diferenciales',               categoria: 'azul'    },
        { nombre: 'Legislación Sanitaria y Ambiental',      categoria: 'naranja' },
        { nombre: 'Mecánica de Fluidos y Laboratorio',      categoria: 'verde'   },
        { nombre: 'Mecánica de Suelos y Laboratorio',       categoria: 'verde'   },
        { nombre: 'Análisis de Estructuras',                categoria: 'verde'   },
        { nombre: 'Climatología e Hidrología Aplicada',     categoria: 'verde'   },
      ],
    },
    {
      numero: 5,
      asignaturas: [
        { nombre: 'Hidráulica Aplicada y Laboratorio',             categoria: 'rojo'   },
        { nombre: 'Seguridad y Salud Ocupacional',                 categoria: 'naranja' },
        { nombre: 'Hormigón Armado para Obras Sanitarias',         categoria: 'rojo'   },
        { nombre: 'Sistemas de Información Geográfico Aplicado',   categoria: 'rojo'   },
        { nombre: 'Instalaciones Hidrosanitarias en Edificios',    categoria: 'rojo'   },
        { nombre: 'Optativa I',                                    categoria: 'morado'  },
      ],
    },
    {
      numero: 6,
      asignaturas: [
        { nombre: 'Proceso Fisicoquímicos de Tratamiento de Agua y Laboratorio',          categoria: 'rojo'   },
        { nombre: 'Tratamiento de Aguas Residuales Domésticas, Comerciales y Laboratorio', categoria: 'rojo'  },
        { nombre: 'Saneamiento Ambiental',                                                categoria: 'rojo'   },
        { nombre: 'Sistema de Alcantarillado',                                            categoria: 'rojo'   },
        { nombre: 'Sistema de Abastecimiento de Agua',                                    categoria: 'rojo'   },
        { nombre: 'Optativa II',                                                          categoria: 'morado'  },
      ],
    },
    {
      numero: 7,
      asignaturas: [
        { nombre: 'Diseño de Plantas de Agua Residual',   categoria: 'rojo'   },
        { nombre: 'Gestión de Residuos Sólidos I',        categoria: 'rojo'   },
        { nombre: 'Diseño de Plantas de Agua Potable',    categoria: 'rojo'   },
        { nombre: 'Monitoreo Ambiental',                  categoria: 'rojo'   },
        { nombre: 'Evaluación del Impacto Ambiental',     categoria: 'rojo'   },
        { nombre: 'Optativa III',                         categoria: 'morado'  },
      ],
    },
    {
      numero: 8,
      asignaturas: [
        { nombre: 'Preparación, Evaluación y Gestión de Proyectos Sanitarios y Ambientales', categoria: 'rojo'   },
        { nombre: 'Gestión de Residuos Sólidos II',                                          categoria: 'rojo'   },
        { nombre: 'Gestión de Calidad Ambiental',                                            categoria: 'morado'  },
        { nombre: 'Estructuras de Costos',                                                   categoria: 'rojo'   },
        { nombre: 'Actividad de Profesionalización I',                                       categoria: 'morado'  },
        { nombre: 'Optativa IV',                                                             categoria: 'morado'  },
      ],
    },
    {
      numero: 9,
      asignaturas: [
        { nombre: 'Actividad de Profesionalización II', categoria: 'morado' },
      ],
    },
  ],
};

module.exports = { malla };
