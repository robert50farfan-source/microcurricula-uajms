'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');

const generateRouter  = require('./routes/generate');
const configRouter    = require('./routes/config');
const carrerasRouter  = require('./routes/carreras');
const mallaRouter     = require('./routes/malla');
const { preloadFuentes } = require('./services/fuentesLoader');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middlewares ──────────────────────────────────────────────────────────────
// En producción nginx sirve el frontend en el mismo dominio y hace proxy a /api,
// por lo que el origen es el mismo host → no se necesita CORS.
// En desarrollo se permite localhost:5173 explícitamente.
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/generate',  generateRouter);
app.use('/api/config',    configRouter);
app.use('/api/carreras',  carrerasRouter);
app.use('/api/malla',     mallaRouter);

// ─── Manejo global de errores ─────────────────────────────────────────────────
// Errores de multer (límite de tamaño, tipo de archivo no permitido)
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? 'El archivo supera el límite de 10 MB.'
      : `Error al subir el archivo: ${err.message}`;
    return res.status(400).json({ error: msg });
  }
  // Errores del fileFilter u otros errores con .status asignado
  if (err?.status) {
    return res.status(err.status).json({ error: err.message });
  }
  // Error genérico no capturado
  console.error('[server]', err);
  return res.status(500).json({ error: err.message || 'Error interno del servidor.' });
});

// ─── Inicio ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  // Precarga los PDFs de fuentes en background para que estén listos antes del primer request
  preloadFuentes();
});
