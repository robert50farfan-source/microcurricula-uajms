/**
 * Malla curricular oficial de Ingeniería Agronómica — UAJMS
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
  carrera: 'Ingeniería Agronómica',
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
        { nombre: 'Botánica General',    categoria: 'verde'   },
        { nombre: 'Sociología Rural',    categoria: 'naranja' },
        { nombre: 'Cálculo I',           categoria: 'azul'    },
        { nombre: 'Química General',     categoria: 'azul'    },
        { nombre: 'Producción Pecuaria I', categoria: 'verde' },
        { nombre: 'Electiva I',          categoria: 'morado'  },
      ],
    },
    {
      numero: 2,
      asignaturas: [
        { nombre: 'Cálculo II',           categoria: 'azul'   },
        { nombre: 'Física',               categoria: 'azul'   },
        { nombre: 'Botánica Sistemática', categoria: 'verde'  },
        { nombre: 'Química Orgánica',     categoria: 'azul'   },
        { nombre: 'Edafología',           categoria: 'verde'  },
        { nombre: 'Módulo I',             categoria: 'morado' },
      ],
    },
    {
      numero: 3,
      asignaturas: [
        { nombre: 'Fisiología Vegetal',     categoria: 'verde'  },
        { nombre: 'Zoología Agrícola',      categoria: 'verde'  },
        { nombre: 'Topografía',             categoria: 'verde'  },
        { nombre: 'Bioestadística',         categoria: 'azul'   },
        { nombre: 'Climatología y Fenología', categoria: 'verde' },
        { nombre: 'Electiva II',            categoria: 'morado' },
      ],
    },
    {
      numero: 4,
      asignaturas: [
        { nombre: 'Maquinaria y Mecanización Agrícola', categoria: 'verde'  },
        { nombre: 'Hidráulica Agrícola',                categoria: 'verde'  },
        { nombre: 'Agroecología',                       categoria: 'verde'  },
        { nombre: 'Producción Pecuaria II',             categoria: 'rojo'   },
        { nombre: 'Bioquímica',                         categoria: 'azul'   },
        { nombre: 'Módulo II',                          categoria: 'morado' },
      ],
    },
    {
      numero: 5,
      asignaturas: [
        { nombre: 'Diseños Experimentales',       categoria: 'rojo'   },
        { nombre: 'Fertilidad y Nutrición Vegetal', categoria: 'rojo' },
        { nombre: 'Malezas',                      categoria: 'rojo'   },
        { nombre: 'Horticultura',                 categoria: 'rojo'   },
        { nombre: 'Fruticultura',                 categoria: 'rojo'   },
        { nombre: 'Fitopatología',                categoria: 'rojo'   },
        { nombre: 'Electiva III',                 categoria: 'morado' },
      ],
    },
    {
      numero: 6,
      asignaturas: [
        { nombre: 'Fuentes y Captación de Aguas',   categoria: 'rojo'    },
        { nombre: 'Módulo III',                     categoria: 'morado'  },
        { nombre: 'Manejo y Conservación de Suelos', categoria: 'rojo'   },
        { nombre: 'Genética',                       categoria: 'rojo'    },
        { nombre: 'Administración Agropecuaria',    categoria: 'naranja' },
        { nombre: 'Riegos',                         categoria: 'rojo'    },
        { nombre: 'Construcciones Agropecuarias',   categoria: 'rojo'    },
      ],
    },
    {
      numero: 7,
      asignaturas: [
        { nombre: 'Producción de Cereales y Granos', categoria: 'rojo'    },
        { nombre: 'Tecnología de Semillas',          categoria: 'rojo'    },
        { nombre: 'Extensión Agrícola',              categoria: 'naranja' },
        { nombre: 'Investigación Agropecuaria',      categoria: 'naranja' },
        { nombre: 'Fitomejoramiento',                categoria: 'rojo'    },
        { nombre: 'Producción de Oleaginosas',       categoria: 'rojo'    },
        { nombre: 'Optativa I',                      categoria: 'morado'  },
      ],
    },
    {
      numero: 8,
      asignaturas: [
        { nombre: 'Agronegocios',             categoria: 'rojo'   },
        { nombre: 'Proyectos Agropecuarios',  categoria: 'rojo'   },
        { nombre: 'Sistemas de Producción',   categoria: 'rojo'   },
        { nombre: 'Forrajicultura',           categoria: 'rojo'   },
        { nombre: 'Recuperación de Suelos',   categoria: 'rojo'   },
        { nombre: 'Módulo IV',                categoria: 'morado' },
      ],
    },
    {
      numero: 9,
      asignaturas: [
        { nombre: 'Procesamiento de Productos Agropecuarios', categoria: 'morado' },
        { nombre: 'Seminario I',                              categoria: 'morado' },
        { nombre: 'Optativa II',                              categoria: 'morado' },
        { nombre: 'Optativa III',                             categoria: 'morado' },
      ],
    },
    {
      numero: 10,
      asignaturas: [
        { nombre: 'Seminario II',                categoria: 'morado' },
        { nombre: 'Prácticas de Profesionalización', categoria: 'morado' },
      ],
    },
  ],
};

module.exports = { malla };
