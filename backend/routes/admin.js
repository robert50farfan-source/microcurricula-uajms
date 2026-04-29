'use strict';

const express   = require('express');
const fs        = require('fs');
const path      = require('path');
const { randomUUID } = require('crypto');
const adminAuth = require('../middleware/adminAuth');

const router    = express.Router();
const DATA_FILE = path.join(__dirname, '../data/universidades.json');

// ── Helpers ───────────────────────────────────────────────────────────────────

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// ── Todas las rutas requieren autenticación de administrador ──────────────────
router.use(adminAuth);

// ═══════════════════════════════════════════════════════════════════════════════
// UNIVERSIDADES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/admin/universidades
router.get('/universidades', (_req, res) => {
  res.json(readData());
});

// POST /api/admin/universidades
router.post('/universidades', (req, res) => {
  const { nombre, sigla } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El campo "nombre" es requerido.' });

  const data = readData();
  const nueva = {
    id:        randomUUID(),
    nombre:    nombre.trim(),
    sigla:     (sigla ?? '').trim(),
    facultades: [],
  };
  data.push(nueva);
  writeData(data);
  res.status(201).json(nueva);
});

// PUT /api/admin/universidades/:uid
router.put('/universidades/:uid', (req, res) => {
  const { nombre, sigla } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El campo "nombre" es requerido.' });

  const data = readData();
  const uni  = data.find((u) => u.id === req.params.uid);
  if (!uni) return res.status(404).json({ error: 'Universidad no encontrada.' });

  uni.nombre = nombre.trim();
  uni.sigla  = (sigla ?? '').trim();
  writeData(data);
  res.json(uni);
});

// DELETE /api/admin/universidades/:uid
router.delete('/universidades/:uid', (req, res) => {
  const data    = readData();
  const idx     = data.findIndex((u) => u.id === req.params.uid);
  if (idx === -1) return res.status(404).json({ error: 'Universidad no encontrada.' });

  data.splice(idx, 1);
  writeData(data);
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// FACULTADES
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/admin/universidades/:uid/facultades
router.post('/universidades/:uid/facultades', (req, res) => {
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El campo "nombre" es requerido.' });

  const data = readData();
  const uni  = data.find((u) => u.id === req.params.uid);
  if (!uni) return res.status(404).json({ error: 'Universidad no encontrada.' });

  const nueva = { id: randomUUID(), nombre: nombre.trim(), carreras: [] };
  uni.facultades.push(nueva);
  writeData(data);
  res.status(201).json(nueva);
});

// PUT /api/admin/universidades/:uid/facultades/:fid
router.put('/universidades/:uid/facultades/:fid', (req, res) => {
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El campo "nombre" es requerido.' });

  const data = readData();
  const uni  = data.find((u) => u.id === req.params.uid);
  if (!uni) return res.status(404).json({ error: 'Universidad no encontrada.' });

  const fac = uni.facultades.find((f) => f.id === req.params.fid);
  if (!fac) return res.status(404).json({ error: 'Facultad no encontrada.' });

  fac.nombre = nombre.trim();
  writeData(data);
  res.json(fac);
});

// DELETE /api/admin/universidades/:uid/facultades/:fid
router.delete('/universidades/:uid/facultades/:fid', (req, res) => {
  const data = readData();
  const uni  = data.find((u) => u.id === req.params.uid);
  if (!uni) return res.status(404).json({ error: 'Universidad no encontrada.' });

  const idx = uni.facultades.findIndex((f) => f.id === req.params.fid);
  if (idx === -1) return res.status(404).json({ error: 'Facultad no encontrada.' });

  uni.facultades.splice(idx, 1);
  writeData(data);
  res.json({ ok: true });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CARRERAS
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/admin/universidades/:uid/facultades/:fid/carreras
router.post('/universidades/:uid/facultades/:fid/carreras', (req, res) => {
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El campo "nombre" es requerido.' });

  const data = readData();
  const uni  = data.find((u) => u.id === req.params.uid);
  if (!uni) return res.status(404).json({ error: 'Universidad no encontrada.' });

  const fac = uni.facultades.find((f) => f.id === req.params.fid);
  if (!fac) return res.status(404).json({ error: 'Facultad no encontrada.' });

  const nueva = { id: randomUUID(), nombre: nombre.trim() };
  fac.carreras.push(nueva);
  writeData(data);
  res.status(201).json(nueva);
});

// PUT /api/admin/universidades/:uid/facultades/:fid/carreras/:cid
router.put('/universidades/:uid/facultades/:fid/carreras/:cid', (req, res) => {
  const { nombre } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ error: 'El campo "nombre" es requerido.' });

  const data = readData();
  const uni  = data.find((u) => u.id === req.params.uid);
  if (!uni) return res.status(404).json({ error: 'Universidad no encontrada.' });

  const fac = uni.facultades.find((f) => f.id === req.params.fid);
  if (!fac) return res.status(404).json({ error: 'Facultad no encontrada.' });

  const car = fac.carreras.find((c) => c.id === req.params.cid);
  if (!car) return res.status(404).json({ error: 'Carrera no encontrada.' });

  car.nombre = nombre.trim();
  writeData(data);
  res.json(car);
});

// DELETE /api/admin/universidades/:uid/facultades/:fid/carreras/:cid
router.delete('/universidades/:uid/facultades/:fid/carreras/:cid', (req, res) => {
  const data = readData();
  const uni  = data.find((u) => u.id === req.params.uid);
  if (!uni) return res.status(404).json({ error: 'Universidad no encontrada.' });

  const fac = uni.facultades.find((f) => f.id === req.params.fid);
  if (!fac) return res.status(404).json({ error: 'Facultad no encontrada.' });

  const idx = fac.carreras.findIndex((c) => c.id === req.params.cid);
  if (idx === -1) return res.status(404).json({ error: 'Carrera no encontrada.' });

  fac.carreras.splice(idx, 1);
  writeData(data);
  res.json({ ok: true });
});

module.exports = router;
