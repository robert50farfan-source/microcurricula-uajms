'use strict';

const express   = require('express');
const multer    = require('multer');
const fs        = require('fs');
const path      = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const { extractTextFromPDF } = require('../services/pdfExtractor');

const router      = express.Router();
const CUSTOM_PATH = path.join(__dirname, '../data/malla_custom.json');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(Object.assign(new Error('Solo se permiten archivos PDF.'), { status: 400 }));
  },
});

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

// POST /api/malla — subir y parsear malla en PDF
router.post('/', upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo PDF.' });

  const apiKey = req.headers['x-api-key'];
  if (!apiKey || !apiKey.trim()) {
    return res.status(401).json({ error: 'No se ha configurado la clave de API de Anthropic. Ingresala en Configuración.' });
  }

  try {
    const texto = await extractTextFromPDF(req.file.buffer);
    const client = new Anthropic({ apiKey: apiKey.trim() });

    // Micro-llamada a Claude para parsear la tabla de la malla
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      system: 'Eres un parser de tablas curriculares. Responde ÚNICAMENTE con JSON válido, sin markdown ni texto adicional.',
      messages: [{
        role: 'user',
        content: `Analiza el siguiente texto extraído de una malla curricular en PDF.
La tabla tiene: primera fila con encabezados de semestres, siguientes filas con los nombres de las materias de cada semestre (una columna por semestre).

Extrae la estructura y responde SOLO con este JSON (sin texto antes ni después):
{
  "carrera": "<nombre de la carrera si se detecta, o 'Carrera personalizada'>",
  "semestres": [
    { "numero": 1, "asignaturas": [{ "nombre": "<nombre materia>" }] },
    { "numero": 2, "asignaturas": [{ "nombre": "<nombre materia>" }] }
  ]
}

TEXTO DE LA MALLA:
${texto}`,
      }],
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
      return res.status(422).json({ error: 'No se pudo interpretar la estructura de la malla desde el PDF. Verifica que el archivo tenga una tabla con semestres y materias.' });
    }

    if (!Array.isArray(parsed.semestres) || parsed.semestres.length === 0) {
      return res.status(422).json({ error: 'No se encontraron semestres en la malla. Verifica que el PDF tenga el formato correcto (primera fila = semestres).' });
    }

    // Construir objeto de malla en el formato que usa el sistema
    const malla = {
      carrera:      parsed.carrera ?? 'Carrera personalizada',
      facultad:     '',
      universidad:  'Universidad Autónoma "Juan Misael Saracho"',
      categorias:   { azul: 'Formación curricular' },
      semestres:    parsed.semestres.map((s, i) => ({
        numero:      s.numero ?? (i + 1),
        asignaturas: (s.asignaturas ?? []).map((a) => ({
          nombre:    String(a.nombre ?? '').trim(),
          categoria: 'azul',
        })).filter((a) => a.nombre),
      })),
    };

    fs.writeFileSync(CUSTOM_PATH, JSON.stringify(malla, null, 2), 'utf8');
    console.log(`[malla] Malla custom guardada: ${malla.carrera} (${malla.semestres.length} semestres)`);
    // Devolver la malla completa para que el cliente la guarde en localStorage
    // y la envíe con cada request de generación (evita estado compartido en servidor)
    res.json({ ok: true, carrera: malla.carrera, numSemestres: malla.semestres.length, malla });

  } catch (err) {
    console.error('[malla] Error al procesar PDF:', err.message);
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
