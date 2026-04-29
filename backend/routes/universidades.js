'use strict';

const express = require('express');
const fs      = require('fs');
const path    = require('path');

const router    = express.Router();
const DATA_FILE = path.join(__dirname, '../data/universidades.json');

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

// GET /api/universidades  — público, usado por los combos del ConfigPanel
router.get('/', (_req, res) => {
  res.json(readData());
});

module.exports = router;
