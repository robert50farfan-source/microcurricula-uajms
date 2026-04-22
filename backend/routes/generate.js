'use strict';

const express = require('express');
const multer  = require('multer');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();

const { extractTextFromPDF, countElementosDeCompetencia } = require('../services/pdfExtractor');
const { generateProyectoFormativo } = require('../services/claudeService');
const { generateDocx }              = require('../services/docxGenerator');
const { resolveClaveCarrera, getMalla } = require('../data/mallas');

const CONFIG_PATH = path.join(__dirname, '../config/settings.json');
function readConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch { return {}; }
}

// ─── Multer: memoria, solo PDF, 10 MB ────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(Object.assign(new Error('Solo se aceptan archivos PDF.'), { status: 400 }));
    }
  },
});

// ─── POST /api/generate ───────────────────────────────────────────────────────
router.post('/', upload.single('pdf'), async (req, res) => {
  // 1. Validar que llegó el archivo
  if (!req.file) {
    return res.status(400).json({ error: 'No se recibió ningún archivo. Envía el PDF en el campo "pdf".' });
  }

  // 1b. Leer datos institucionales enviados por el cliente (guardados en su navegador)
  const institucional = {
    nombreFacultad: (req.body.nombreFacultad ?? '').trim(),
    nombreCarrera:  (req.body.nombreCarrera  ?? '').trim(),
    nombreDocente:  (req.body.nombreDocente  ?? '').trim(),
    emailDocente:   (req.body.emailDocente   ?? '').trim(),
    celDocente:     (req.body.celDocente     ?? '').trim(),
    nombreDirector: (req.body.nombreDirector ?? '').trim(),
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
    // 2. Extraer texto del PDF
    const textoPDF = await extractTextFromPDF(req.file.buffer);

    // 2b. Detectar número de ECs en el PDF para pasarlo como restricción dura
    const numECsDetectados = countElementosDeCompetencia(textoPDF);
    if (numECsDetectados) {
      console.log(`[generate] ECs detectados en el PDF: ${numECsDetectados}`);
    }

    // 3. Resolver malla: priorizar la que viene del cliente (por request) para
    //    garantizar aislamiento entre usuarios concurrentes. Si no viene, caer
    //    a la malla estática resuelta por config del servidor.
    let malla = null;
    if (req.body?.mallaJson) {
      try {
        malla = JSON.parse(req.body.mallaJson);
        console.log(`[generate] malla recibida del cliente: "${malla?.carrera}"`);
      } catch {
        console.warn('[generate] mallaJson inválido, se usará malla estática');
      }
    }
    if (!malla) {
      const claveCarrera = resolveClaveCarrera();
      malla = getMalla(claveCarrera);
      console.log(`[generate] malla estática resuelta: "${malla?.carrera ?? 'ninguna'}"`);
    }

    const apiKey = req.headers['x-api-key'];
    const datosProyecto = await generateProyectoFormativo(textoPDF, {}, numECsDetectados, apiKey, malla, institucional);

    // 4. Construir el documento Word
    const docxBuffer = await generateDocx(datosProyecto);

    // 5. Responder con el archivo
    res.setHeader('Content-Type',        'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', 'attachment; filename="proyecto_formativo.docx"');
    res.setHeader('Content-Length',      docxBuffer.length);
    return res.send(docxBuffer);

  } catch (err) {
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
