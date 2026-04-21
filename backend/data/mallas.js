'use strict';

const fs   = require('fs');
const path = require('path');

const { malla: mallaInformatica }       = require('./malla_Informatica');
const { malla: mallaSanitaria }         = require('./malla_SanitariaAmbiental');
const { malla: mallaHidricos }          = require('./malla_RecursosHidricos');
const { malla: mallaAgronomia }         = require('./malla_Agronomia');

const MALLAS = {
  informatica:  mallaInformatica,
  sanitaria:    mallaSanitaria,
  hidricos:     mallaHidricos,
  agronomia:    mallaAgronomia,
};

const CARRERA_DEFAULT = 'informatica';
const CUSTOM_PATH     = path.join(__dirname, 'malla_custom.json');
const CONFIG_PATH     = path.join(__dirname, '../config/settings.json');

/** Lee la malla personalizada subida por el usuario. Retorna null si no existe. */
function getMallaCustom() {
  try {
    if (!fs.existsSync(CUSTOM_PATH)) return null;
    return JSON.parse(fs.readFileSync(CUSTOM_PATH, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Retorna la malla de la carrera indicada.
 * - 'custom' → malla subida por el usuario (null si no hay ninguna)
 * - clave estática → malla hardcodeada correspondiente
 * - desconocida → malla por defecto
 */
function getMalla(claveCarrera) {
  if (claveCarrera === 'custom') return getMallaCustom();
  return MALLAS[claveCarrera] ?? MALLAS[CARRERA_DEFAULT];
}

/**
 * Determina la clave de carrera a usar sin intervención del usuario:
 * 1. Si existe malla_custom.json → 'custom'
 * 2. Si nombreCarrera en config coincide con una malla estática → esa clave
 * 3. Default
 */
function resolveClaveCarrera() {
  if (getMallaCustom()) return 'custom';
  try {
    const { nombreCarrera = '' } = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    const lower = nombreCarrera.trim().toLowerCase();
    const found = Object.entries(MALLAS).find(([, m]) => m.carrera.toLowerCase() === lower);
    if (found) return found[0];
  } catch { /* usa default */ }
  return CARRERA_DEFAULT;
}

function listarCarreras() {
  const estaticas = Object.entries(MALLAS).map(([clave, malla]) => ({
    clave,
    nombre: malla.carrera,
  }));
  const custom = getMallaCustom();
  if (custom) {
    estaticas.push({ clave: 'custom', nombre: custom.carrera });
  }
  return estaticas;
}

module.exports = { getMalla, listarCarreras, resolveClaveCarrera, CARRERA_DEFAULT };
