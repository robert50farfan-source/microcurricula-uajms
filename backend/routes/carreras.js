'use strict';

const express = require('express');
const { listarCarreras } = require('../data/mallas');

const router = express.Router();

// GET /api/carreras
router.get('/', (_req, res) => {
  res.json(listarCarreras());
});

module.exports = router;
