'use strict';

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const router      = express.Router();
const CONFIG_PATH = path.join(__dirname, '../config/settings.json');

// Campos permitidos y sus validaciones
const SCHEMA = {
  nombreFacultad:  { type: 'string',  required: false },
  nombreCarrera:   { type: 'string',  required: true },
  nombreDocente:   { type: 'string',  required: false },
  emailDocente:    { type: 'string',  required: false },
  celDocente:      { type: 'string',  required: false },
  nombreDirector:  { type: 'string',  required: false },
  numIndicadores:  { type: 'integer', required: true, min: 1, max: 20 },
  numInstrumentos: { type: 'integer', required: true, min: 1, max: 20 },
};

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function writeConfig(data) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function validate(body) {
  const errors = [];
  for (const [key, rules] of Object.entries(SCHEMA)) {
    const val = body[key];
    if (val === undefined || val === null) {
      if (rules.required) errors.push(`El campo "${key}" es obligatorio.`);
      continue;
    }
    if (rules.type === 'string' && typeof val !== 'string') {
      errors.push(`El campo "${key}" debe ser texto.`);
    }
    if (rules.type === 'integer') {
      const n = Number(val);
      if (!Number.isInteger(n)) errors.push(`El campo "${key}" debe ser un número entero.`);
      else if (rules.min !== undefined && n < rules.min) errors.push(`"${key}" debe ser al menos ${rules.min}.`);
      else if (rules.max !== undefined && n > rules.max) errors.push(`"${key}" debe ser como máximo ${rules.max}.`);
    }
  }
  return errors;
}

// GET /api/config
router.get('/', (_req, res) => {
  try {
    res.json(readConfig());
  } catch (err) {
    res.status(500).json({ error: 'No se pudo leer la configuración.' });
  }
});

// PUT /api/config
router.put('/', (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return res.status(400).json({ errors });

  try {
    const current = readConfig();
    const updated = {
      ...current,
      nombreFacultad:  String(req.body.nombreFacultad  ?? '').trim(),
      nombreCarrera:   String(req.body.nombreCarrera).trim(),
      nombreDocente:   String(req.body.nombreDocente   ?? '').trim(),
      emailDocente:    String(req.body.emailDocente    ?? '').trim(),
      celDocente:      String(req.body.celDocente      ?? '').trim(),
      nombreDirector:  String(req.body.nombreDirector  ?? '').trim(),
      numIndicadores:  Number(req.body.numIndicadores),
      numInstrumentos: Number(req.body.numInstrumentos),
    };
    writeConfig(updated);
    res.json({ ok: true, config: updated });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo guardar la configuración.' });
  }
});

module.exports = router;
