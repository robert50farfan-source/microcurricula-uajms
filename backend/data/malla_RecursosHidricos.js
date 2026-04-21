/**
 * Malla curricular oficial de Ingeniería en Recursos Hídricos — UAJMS
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
  carrera: 'Ingeniería en Recursos Hídricos',
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
        { nombre: 'Cálculo I',                                  codigo: 'IHM-111', categoria: 'azul'    },
        { nombre: 'Álgebra Lineal y Teoría Matricial',          codigo: 'IHM-112', categoria: 'azul'    },
        { nombre: 'Química I y Laboratorio',                    codigo: 'IHQ-133', categoria: 'azul'    },
        { nombre: 'Física I y Laboratorio',                     codigo: 'IHF-124', categoria: 'azul'    },
        { nombre: 'Aplicaciones Computacionales en Ingeniería', codigo: 'IHT-145', categoria: 'verde'   },
        { nombre: 'Legislación del Agua',                       codigo: 'IHS-156', categoria: 'naranja' },
      ],
    },
    {
      numero: 2,
      asignaturas: [
        { nombre: 'Cálculo II',                                        codigo: 'IHM-211', categoria: 'azul'    },
        { nombre: 'Estadística Aplicada a la Ingeniería',              codigo: 'IHM-212', categoria: 'azul'    },
        { nombre: 'Química del Suelo, Agua y Laboratorio',             codigo: 'IHQ-233', categoria: 'azul'    },
        { nombre: 'Física II y Laboratorio',                           codigo: 'IHF-224', categoria: 'azul'    },
        { nombre: 'Dibujo Computarizado Aplicado a la Ingeniería',     codigo: 'IHT-245', categoria: 'verde'   },
        { nombre: 'Gestión Ambiental',                                 codigo: 'IHS-256', categoria: 'naranja' },
      ],
    },
    {
      numero: 3,
      asignaturas: [
        { nombre: 'Métodos Numéricos para Ingenieros',  codigo: 'IHM-311', categoria: 'azul'    },
        { nombre: 'Metodología de la Investigación',    codigo: 'IHT-342', categoria: 'naranja' },
        { nombre: 'Modelación Hidrogeoquímica',         codigo: 'IHQ-333', categoria: 'verde'   },
        { nombre: 'Hidráulica I y Laboratorio',         codigo: 'IHH-364', categoria: 'verde'   },
        { nombre: 'Topografía e Hidrometría',           codigo: 'IHT-345', categoria: 'verde'   },
        { nombre: 'Hidrología Superficial',             codigo: 'IHH-366', categoria: 'verde'   },
      ],
    },
    {
      numero: 4,
      asignaturas: [
        { nombre: 'Fundamentos de Programación',                            codigo: 'IHM-441', categoria: 'verde'  },
        { nombre: 'Mecánica de Suelos, Geotecnia y Laboratorio',            codigo: 'IHE-492', categoria: 'verde'  },
        { nombre: 'Sistemas de Distribución Hídrica',                       codigo: 'IHS-453', categoria: 'rojo'   },
        { nombre: 'Hidráulica II y Laboratorio',                            codigo: 'IHH-464', categoria: 'verde'  },
        { nombre: 'Modelación Hidrológica y Análisis Climático con SIG',    codigo: 'IHT-445', categoria: 'rojo'   },
        { nombre: 'Hidrología Estadística',                                 codigo: 'IHH-466', categoria: 'rojo'   },
      ],
    },
    {
      numero: 5,
      asignaturas: [
        { nombre: 'Programación de Sensores Hidrometeorológicos',                  codigo: 'IHT-541', categoria: 'rojo'   },
        { nombre: 'Análisis Estructural de Obras Hidráulicas',                     codigo: 'IHE-592', categoria: 'rojo'   },
        { nombre: 'Plantas de Tratamiento de Agua para Consumo',                   codigo: 'IHS-553', categoria: 'rojo'   },
        { nombre: 'Obras Hidráulicas I',                                           codigo: 'IHE-594', categoria: 'rojo'   },
        { nombre: 'SIG Avanzado para Gestión de Cuencas y Monitoreo Ambiental',    codigo: 'IHT-545', categoria: 'rojo'   },
        { nombre: 'Hidráulica e Hidrología Computacional',                         codigo: 'IHH-566', categoria: 'rojo'   },
      ],
    },
    {
      numero: 6,
      asignaturas: [
        { nombre: 'Ingeniería de Costos, Presupuestos y Planificación',             codigo: 'IHC-671', categoria: 'rojo'   },
        { nombre: 'Hormigón Armado de Obras Hidráulicas y Laboratorio',             codigo: 'IHE-692', categoria: 'rojo'   },
        { nombre: 'Sistemas de Drenaje y Alcantarillado',                           codigo: 'IHS-653', categoria: 'rojo'   },
        { nombre: 'Obras Hidráulicas II',                                           codigo: 'IHE-694', categoria: 'rojo'   },
        { nombre: 'Planificación y Monitoreo Integral de Cuencas y Recursos Hídricos', codigo: 'IHG-685', categoria: 'rojo' },
        { nombre: 'Hidrología Subterránea y Balance de Acuíferos',                  codigo: 'IHG-686', categoria: 'rojo'   },
      ],
    },
    {
      numero: 7,
      asignaturas: [
        { nombre: 'Optativa I',                                                    codigo: 'OPTATIVA-I', categoria: 'morado' },
        { nombre: 'Diseño Estructural de Obras Hidráulicas',                       codigo: 'IHE-793',    categoria: 'morado' },
        { nombre: 'Sistemas de Tratamiento de Aguas Residuales',                   codigo: 'IHS-753',    categoria: 'morado' },
        { nombre: 'Riego Tecnificado',                                             codigo: 'IHE-795',    categoria: 'morado' },
        { nombre: 'Exploración, Explotación y Recarga de Aguas Subterráneas',      codigo: 'IHG-786',    categoria: 'morado' },
        { nombre: 'Actividad de Profesionalización I',                             codigo: 'IHP-707',    categoria: 'morado' },
      ],
    },
    {
      numero: 8,
      asignaturas: [
        { nombre: 'Centrales Hidroeléctricas',           codigo: 'IHE-891', categoria: 'morado' },
        { nombre: 'Práctica Profesional en Recursos Hídricos', codigo: 'IHP-802', categoria: 'morado' },
        { nombre: 'Actividad de Profesionalización II',  codigo: 'IHP-803', categoria: 'morado' },
      ],
    },
  ],
};

module.exports = { malla };
