'use strict';

const express   = require('express');
const multer    = require('multer');
const fs        = require('fs');
const path      = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const { extractTextFromPDF } = require('../services/pdfExtractor');

const router      = express.Router();
const CUSTOM_PATH = path.join(__dirname, '../config/malla_custom.json');

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(Object.assign(new Error('Solo se permiten PDF o imágenes (JPG, PNG, WEBP).'), { status: 400 }));
  },
});

const PARSE_SYSTEM = 'Eres un parser de tablas curriculares. Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional.';

const PARSE_PROMPT = `Analiza la tabla de malla curricular.
La tabla tiene: primera fila con encabezados de semestres (ej. "I", "II", "1er Semestre"), filas siguientes con nombres de materias por semestre (una columna por semestre).

Responde SOLO con este JSON (sin texto antes ni después):
{
  "carrera": "<nombre de la carrera si se detecta, o 'Carrera personalizada'>",
  "semestres": [
    { "numero": 1, "asignaturas": [{ "nombre": "<nombre materia>" }] },
    { "numero": 2, "asignaturas": [{ "nombre": "<nombre materia>" }] }
  ]
}`;

// GET /api/malla — estado actual de la malla subida
router.get('/', (_req, res) => {
  try {
    if (!fs.existsSync(CUSTOM_PATH)) return res.json({ uploaded: false });
    const malla = JSON.parse(fs.readFileSync(CUSTOM_PATH, 'utf8'));
    res.json({ uploaded: true, carrera: malla.carrera, numSemestres: malla.semestres.length });
  } catch {
    res.json({ uploaded: false });
  }
});

// POST /api/malla — subir y parsear malla (PDF o imagen)
router.post('/', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo.' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !apiKey.trim()) {
    return res.status(401).json({ error: 'No se ha configurado la clave de API de Anthropic. Ingresala en Configuración.' });
  }

  try {
    const cleanKey = req.headers['x-api-key'].replace(/[^a-zA-Z0-9\-_]/g, '');
    const client   = new Anthropic({ apiKey: cleanKey });

    let messageContent;

    if (req.file.mimetype === 'application/pdf') {
      // ── Flujo PDF: extraer texto y enviarlo como prompt de texto ──────────
      const texto = await extractTextFromPDF(req.file.buffer);
      messageContent = [{
        role: 'user',
        content: `${PARSE_PROMPT}\n\nTEXTO DE LA MALLA:\n${texto}`,
      }];
    } else {
      // ── Flujo imagen: enviar la imagen directamente a Claude Vision ───────
      const imageBase64 = req.file.buffer.toString('base64');
      const mediaType   = req.file.mimetype; // image/jpeg | image/png | image/webp | image/gif
      messageContent = [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: imageBase64 },
          },
          {
            type: 'text',
            text: PARSE_PROMPT,
          },
        ],
      }];
    }

    const message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system:     PARSE_SYSTEM,
      messages:   messageContent,
    });

    const raw = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
    let parsed;
    try {
      const cleaned = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/, '')
        .trim();
      const start = cleaned.indexOf('{');
      const end   = cleaned.lastIndexOf('}');
      parsed = JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return res.status(422).json({ error: 'No se pudo interpretar la estructura de la malla. Verifica que el archivo tenga una tabla con semestres en la primera fila y materias debajo.' });
    }

    if (!Array.isArray(parsed.semestres) || parsed.semestres.length === 0) {
      return res.status(422).json({ error: 'No se encontraron semestres en la malla. Verifica que el archivo tenga el formato correcto (primera fila = semestres).' });
    }

    const malla = {
      carrera:     parsed.carrera ?? 'Carrera personalizada',
      facultad:    '',
      universidad: 'Universidad Autónoma "Juan Misael Saracho"',
      categorias:  { azul: 'Formación curricular' },
      semestres:   parsed.semestres.map((s, i) => ({
        numero:      s.numero ?? (i + 1),
        asignaturas: (s.asignaturas ?? []).map((a) => ({
          nombre:    String(a.nombre ?? '').trim(),
          categoria: 'azul',
        })).filter((a) => a.nombre),
      })),
    };

    fs.writeFileSync(CUSTOM_PATH, JSON.stringify(malla, null, 2), 'utf8');
    console.log(`[malla] Malla guardada: ${malla.carrera} (${malla.semestres.length} semestres) desde ${req.file.mimetype}`);
    res.json({ ok: true, carrera: malla.carrera, numSemestres: malla.semestres.length, malla });

  } catch (err) {
    console.error('[malla] Error al procesar archivo:', err.message);
    res.status(500).json({ error: err.message ?? 'Error al procesar la malla.' });
  }
});

// DELETE /api/malla — eliminar la malla subida
router.delete('/', (_req, res) => {
  try {
    if (fs.existsSync(CUSTOM_PATH)) fs.unlinkSync(CUSTOM_PATH);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'No se pudo eliminar la malla.' });
  }
});

module.exports = router;
