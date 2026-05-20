'use strict';

const express = require('express');
const multer  = require('multer');
const router  = express.Router();

const { extractTextFromPDF }  = require('../services/pdfExtractor');
const { extractTextFromDocx } = require('../services/docxExtractor');

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isDocx = file.mimetype === DOCX_MIME || file.originalname?.toLowerCase().endsWith('.docx');
    if (file.mimetype === 'application/pdf' || isDocx) cb(null, true);
    else cb(Object.assign(new Error('Solo se aceptan archivos PDF o DOCX.'), { status: 400 }));
  },
});

// Grupos de indicadores para identificar un programa docente
const GRUPOS = [
  { nombre: 'identificacion', palabras: ['asignatura', 'materia', 'cátedra', 'catedra', 'código', 'codigo', 'crédito', 'credito'] },
  { nombre: 'temporal',       palabras: ['semestre', 'período', 'periodo', 'gestión', 'gestion', 'horas', 'carga horaria'] },
  { nombre: 'docencia',       palabras: ['docente', 'catedrático', 'catedratico', 'profesor', 'facilitador'] },
  { nombre: 'academico',      palabras: ['competencia', 'objetivo', 'contenido', 'unidad temática', 'unidad tematica', 'syllabus'] },
  { nombre: 'institucional',  palabras: ['facultad', 'carrera', 'plan de estudios', 'universidad'] },
  { nombre: 'bibliografia',   palabras: ['bibliografía', 'bibliografia', 'referencia', 'fuente bibliográfica', 'fuente bibliografica'] },
];

const MIN_GRUPOS = 4;

// POST /api/validar-documento
router.post('/', upload.single('pdf'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo.' });
  }

  let texto;
  try {
    const isDocx = req.file.mimetype === DOCX_MIME ||
                   req.file.originalname?.toLowerCase().endsWith('.docx');
    texto = isDocx
      ? await extractTextFromDocx(req.file.buffer)
      : await extractTextFromPDF(req.file.buffer);
  } catch (err) {
    return res.json({
      valido:          false,
      confianza:       'baja',
      razon:           `No se pudo leer el documento: ${err.message}`,
      gruposDetectados: 0,
      totalGrupos:     GRUPOS.length,
    });
  }

  const textoLower = texto.toLowerCase();

  const gruposEncontrados = GRUPOS.filter(({ palabras }) =>
    palabras.some((p) => textoLower.includes(p))
  );

  const total    = gruposEncontrados.length;
  const valido   = total >= MIN_GRUPOS;
  const confianza = total >= 5 ? 'alta' : total >= MIN_GRUPOS ? 'media' : 'baja';

  const razon = valido
    ? `Documento reconocido como Programa Docente (${total} de ${GRUPOS.length} indicadores detectados).`
    : `El documento no parece ser un Programa Docente. Se detectaron solo ${total} de ${MIN_GRUPOS} indicadores mínimos requeridos.`;

  return res.json({ valido, confianza, razon, gruposDetectados: total, totalGrupos: GRUPOS.length });
});

module.exports = router;
