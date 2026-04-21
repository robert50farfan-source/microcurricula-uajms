/**
 * Malla curricular oficial de Ingeniería Informática — UAJMS
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
  carrera: 'Ingeniería Informática',
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
        { nombre: 'Programación I',                          categoria: 'verde'   },
        { nombre: 'Álgebra',                                 categoria: 'verde'   },
        { nombre: 'Arquitectura de Computadores I',          categoria: 'verde'   },
        { nombre: 'Física I',                                categoria: 'azul'    },
        { nombre: 'Cálculo I',                               categoria: 'azul'    },
        { nombre: 'Probabilidad y Estadísticas',             categoria: 'azul'    },
      ],
    },
    {
      numero: 2,
      asignaturas: [
        { nombre: 'Programación II',                                        categoria: 'verde'   },
        { nombre: 'Arquitectura de Computadores II',                        categoria: 'verde'   },
        { nombre: 'Administración de Sistemas Operativos',                  categoria: 'naranja' },
        { nombre: 'Física II',                                              categoria: 'azul'    },
        { nombre: 'Cálculo II',                                             categoria: 'azul'    },
        { nombre: 'Metodología de Investigación en Informática Aplicada',   categoria: 'azul'    },
      ],
    },
    {
      numero: 3,
      asignaturas: [
        { nombre: 'Programación III',                                        categoria: 'verde'   },
        { nombre: 'Teoría de Autómatas y Lenguajes Formales',               categoria: 'verde'   },
        { nombre: 'Modelación y Simulación en Ingeniería Informática',      categoria: 'verde'   },
        { nombre: 'Estructuras de Datos Complejas',                         categoria: 'verde'   },
        { nombre: 'Cálculo III',                                            categoria: 'azul'    },
        { nombre: 'Fundamentos de los Sistemas de Información Geográfica',  categoria: 'verde'   },
      ],
    },
    {
      numero: 4,
      asignaturas: [
        { nombre: 'Programación IV',        categoria: 'verde' },
        { nombre: 'Redes I',                categoria: 'rojo'  },
        { nombre: 'Base de Datos I',        categoria: 'rojo'  },
        { nombre: 'Análisis de Sistemas I', categoria: 'rojo'  },
        { nombre: 'Análisis Numérico',      categoria: 'azul'  },
        { nombre: 'Internet De Las Cosas',  categoria: 'rojo'  },
      ],
    },
    {
      numero: 5,
      asignaturas: [
        { nombre: 'Taller I',               categoria: 'rojo'   },
        { nombre: 'Redes II',               categoria: 'rojo'   },
        { nombre: 'Base de Datos II',       categoria: 'rojo'   },
        { nombre: 'Análisis de Sistemas II',categoria: 'rojo'   },
        { nombre: 'Robótica',               categoria: 'rojo'   },
        { nombre: 'Optativa I',             categoria: 'morado' },
      ],
    },
    {
      numero: 6,
      asignaturas: [
        { nombre: 'Taller II',                               categoria: 'rojo'   },
        { nombre: 'Redes III',                               categoria: 'rojo'   },
        { nombre: 'Base de Datos III',                       categoria: 'rojo'   },
        { nombre: 'Ingeniería de Software I',                categoria: 'rojo'   },
        { nombre: 'Preparación y Evaluación de Proyectos',   categoria: 'rojo'   },
        { nombre: 'Optativa II',                             categoria: 'morado' },
      ],
    },
    {
      numero: 7,
      asignaturas: [
        { nombre: 'Minería de Datos',          categoria: 'rojo'   },
        { nombre: 'Tecnologías Emergentes I',  categoria: 'morado' },
        { nombre: 'Programación Gráfica',      categoria: 'rojo'   },
        { nombre: 'Ingeniería de Software II', categoria: 'rojo'   },
        { nombre: 'Electiva I',                categoria: 'morado' },
        { nombre: 'Optativa III',              categoria: 'morado' },
      ],
    },
    {
      numero: 8,
      asignaturas: [
        { nombre: 'Trabajo de Grado I',        categoria: 'morado' },
        { nombre: 'Tecnologías Emergentes II', categoria: 'morado' },
        { nombre: 'Inteligencia Artificial',   categoria: 'morado' },
        { nombre: 'Auditoría Informática',     categoria: 'rojo'   },
        { nombre: 'Electiva II',               categoria: 'morado' },
        { nombre: 'Optativa IV',               categoria: 'morado' },
      ],
    },
    {
      numero: 9,
      asignaturas: [
        { nombre: 'Trabajo de Grado II', categoria: 'morado' },
      ],
    },
  ],
};

module.exports = { malla };
