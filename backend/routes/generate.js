'use strict';

const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();

const { extractTextFromPDF, countElementosDeCompetencia, extractUnidadesAprendizaje } = require('../services/pdfExtractor');
const { extractTextFromDocx }       = require('../services/docxExtractor');
const { generateProyectoFormativo } = require('../services/claudeService');
const { generateDocx }              = require('../services/docxGenerator');
const { registrarEvento }           = require('../services/statsService');
// mallas no se necesita aquí: la malla siempre viene del cliente (localStorage)

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const CONFIG_PATH = path.join(__dirname, '../config/settings.json');
function readConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch { return {}; }
}

// ─── Multer: memoria, PDF o DOCX, 20 MB ──────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isDocx = file.mimetype === DOCX_MIME ||
                   file.originalname?.toLowerCase().endsWith('.docx');
    if (file.mimetype === 'application/pdf' || isDocx) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Solo se aceptan archivos PDF o DOCX.'), { status: 400 }));
    }
  },
});

// ─── POST /api/generate ───────────────────────────────────────────────────────
router.post('/', upload.single('pdf'), async (req, res) => {
  // 1. Validar que llegó el archivo
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo. Envía el Programa Docente en PDF o DOCX.' });
  }

  // 1b. Leer datos institucionales enviados por el cliente (guardados en su navegador)
  const institucional = {
    nombreUniversidad: (req.body.nombreUniversidad ?? '').trim(),
    nombreFacultad:    (req.body.nombreFacultad    ?? '').trim(),
    nombreCarrera:     (req.body.nombreCarrera     ?? '').trim(),
    nombreDocente:     (req.body.nombreDocente     ?? '').trim(),
    emailDocente:      (req.body.emailDocente      ?? '').trim(),
    celDocente:        (req.body.celDocente        ?? '').trim(),
    nombreDirector:    (req.body.nombreDirector    ?? '').trim(),
  };
  const missingFields = [];
  if (!institucional.nombreFacultad) missingFields.push('Nombre de la Facultad');
  if (!institucional.nombreCarrera)  missingFields.push('Nombre de la carrera');
  if (missingFields.length) {
    return res.status(400).json({
      error: `Completa los siguientes campos en Configuración antes de generar: ${missingFields.join(', ')}.`,
    });
  }

  try {
    // 2. Extraer texto del documento (PDF o DOCX)
    const isDocx   = req.file.mimetype === DOCX_MIME || req.file.originalname?.toLowerCase().endsWith('.docx');
    const textoPDF = isDocx
      ? await extractTextFromDocx(req.file.buffer)
      : await extractTextFromPDF(req.file.buffer);

    // 2b. Detectar número de ECs en el PDF para pasarlo como restricción dura
    const numECsDetectados = countElementosDeCompetencia(textoPDF);
    if (numECsDetectados) {
      console.log(`[generate] ECs detectados en el PDF: ${numECsDetectados}`);
    }

    // 2c. Extraer mapa UA→título para inyectarlo como restricción irrompible en el prompt
    const uaMapping = extractUnidadesAprendizaje(textoPDF);
    if (uaMapping) {
      console.log(`[generate] UAs extraídas del PDF: ${uaMapping.map(u => `UA${u.ua}="${u.titulo}"`).join(', ')}`);
    } else {
      console.warn('[generate] No se pudo extraer el mapa UA→título del PDF. Claude inferirá la asignación.');
    }

    // 3. Malla: solo se usa si el cliente la envía explícitamente (desde localStorage).
    //    Si no viene, malla=null → sección 12 muestra descripción textual.
    let malla = null;
    if (req.body?.mallaJson) {
      try {
        malla = JSON.parse(req.body.mallaJson);
        console.log(`[generate] malla recibida del cliente: "${malla?.carrera}"`);
      } catch {
        console.warn('[generate] mallaJson inválido, se generará sin malla (descripción textual).');
      }
    }

    const apiKey = req.headers['x-api-key'];
    const datosProyecto = await generateProyectoFormativo(textoPDF, {}, numECsDetectados, apiKey, malla, institucional, uaMapping);

    // Registrar evento exitoso en el log de estadísticas
    registrarEvento({
      universidad: institucional.nombreUniversidad,
      facultad:    institucional.nombreFacultad,
      carrera:     institucional.nombreCarrera,
      docente:     institucional.nombreDocente,
      asignatura:  datosProyecto?.identificacion?.asignatura ?? '',
      exito:       true,
    });

    // 4. Construir el documento Word
    const docxBuffer = await generateDocx(datosProyecto);

    // 5. Responder con el archivo
    res.setHeader('Content-Type',        'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="proyecto_formativo.docx"');
    res.setHeader('Content-Length',      docxBuffer.length);
    return res.send(docxBuffer);

  } catch (err) {
    // Registrar evento fallido
    registrarEvento({
      universidad: institucional?.nombreUniversidad ?? '',
      facultad:    institucional?.nombreFacultad    ?? '',
      carrera:     institucional?.nombreCarrera     ?? '',
      docente:     institucional?.nombreDocente     ?? '',
      asignatura:  '',
      exito:       false,
      error:       err.message,
    });

    // Distinguir errores de Claude vs errores generales para dar mensajes claros
    const isClaude = err.message?.toLowerCase().includes('anthropic') ||
                     err.message?.toLowerCase().includes('claude') ||
                     err.message?.toLowerCase().includes('api key');

    console.error('[generate]', err.message);

    return res.status(500).json({
      error: isClaude
        ? `Error al comunicarse con Claude AI: ${err.message}`
        : err.message || 'Error interno al generar el proyecto formativo.',
    });
  }
});

module.exports = router;
