'use strict';

const express   = require('express');
const adminAuth = require('../middleware/adminAuth');
const { computarStats, agregarClienteSSE, limpiarErrores } = require('../services/statsService');

const router = express.Router();

// GET /api/admin/stats  — estadísticas calculadas (requiere header auth)
router.get('/', adminAuth, (_req, res) => {
  res.json(computarStats());
});

// GET /api/admin/stats/live  — SSE en tiempo real
// EventSource no soporta headers custom, por eso la contraseña va como query param ?pwd=
router.get('/live', (req, res) => {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return res.status(503).json({ error: 'Módulo de administración no configurado.' });
  }
  if (!req.query.pwd || req.query.pwd !== password) {
    return res.status(401).json({ error: 'No autorizado.' });
  }

  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // evita buffering en nginx
  res.flushHeaders();

  // Enviar estado actual de inmediato
  res.write(`event: stats\ndata: ${JSON.stringify(computarStats())}\n\n`);

  agregarClienteSSE(res);

  // Ping cada 25s para mantener la conexión viva
  const ping = setInterval(() => {
    try { res.write(': ping\n\n'); }
    catch { clearInterval(ping); }
  }, 25_000);

  req.on('close', () => clearInterval(ping));
});

// DELETE /api/admin/stats/errores  — elimina todos los registros fallidos
router.delete('/errores', adminAuth, (_req, res) => {
  const result = limpiarErrores();
  res.json(result);
});

module.exports = router;
