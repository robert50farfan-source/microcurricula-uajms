'use strict';

const fs       = require('fs');
const path     = require('path');
const pdfParse = require('pdf-parse');

const FUENTES_DIR = path.join(__dirname, '../data/fuentes');

const MAIN_MANUAL     = 'MANUAL DE LA MICROCURRÍCULA FINAL.pdf';
const MAX_CHARS_MAIN  = 80_000;  // ~20k tokens
const MAX_CHARS_OTHER = 30_000;  // ~7.5k tokens cada uno
const PDF_TIMEOUT_MS  = 60_000;  // máximo 60 s por archivo

function normalizeText(raw) {
  return (raw ?? '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Extrae el texto de un PDF con un timeout de seguridad
function extractPDF(filePath) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`timeout después de ${PDF_TIMEOUT_MS / 1000}s`)),
      PDF_TIMEOUT_MS,
    );
    const buffer = fs.readFileSync(filePath);
    pdfParse(buffer)
      .then((parsed) => { clearTimeout(timer); resolve(normalizeText(parsed.text)); })
      .catch((err)   => { clearTimeout(timer); reject(err); });
  });
}

// ── Caché ────────────────────────────────────────────────────────────────────
let cachedFuentes  = null;
let loadingPromise = null;

async function loadFuentes() {
  const result = [];

  let files;
  try {
    files = fs.readdirSync(FUENTES_DIR).filter((f) => f.toLowerCase().endsWith('.pdf'));
  } catch {
    console.warn('[fuentesLoader] Directorio backend/data/fuentes no encontrado. Se omiten las fuentes.');
    return [];
  }

  if (files.length === 0) {
    console.warn('[fuentesLoader] No hay archivos PDF en backend/data/fuentes.');
    return [];
  }

  // Manual principal primero
  const ordered = [
    ...files.filter((f) => f === MAIN_MANUAL),
    ...files.filter((f) => f !== MAIN_MANUAL),
  ];

  for (const file of ordered) {
    const filePath = path.join(FUENTES_DIR, file);
    const maxChars = file === MAIN_MANUAL ? MAX_CHARS_MAIN : MAX_CHARS_OTHER;
    try {
      let text = await extractPDF(filePath);
      const truncated = text.length > maxChars;
      if (truncated) text = text.slice(0, maxChars);
      result.push({ nombre: file, texto: text, truncado: truncated });
      console.log(`[fuentesLoader] ✓ ${file} (${text.length.toLocaleString()} chars${truncated ? ', truncado' : ''})`);
    } catch (err) {
      console.warn(`[fuentesLoader] ✗ "${file}" omitido: ${err.message}`);
    }
  }

  return result;
}

function getFuentes() {
  if (cachedFuentes)  return Promise.resolve(cachedFuentes);
  if (loadingPromise) return loadingPromise;

  loadingPromise = loadFuentes()
    .then((result) => { cachedFuentes = result; return result; })
    .catch((err)   => { console.error('[fuentesLoader] Error inesperado:', err.message); return []; })
    .finally(()    => { loadingPromise = null; });

  return loadingPromise;
}

/**
 * Inicia la carga en segundo plano sin bloquear.
 * Llamar al arrancar el servidor para que el caché esté listo antes del primer request.
 */
function preloadFuentes() {
  getFuentes();
}

/**
 * Devuelve el bloque de texto listo para insertar en el prompt de Claude.
 */
async function buildFuentesPromptBlock() {
  const fuentes = await getFuentes();
  if (!fuentes.length) return null;

  return fuentes
    .map(({ nombre, texto, truncado }) =>
      `--- ${nombre}${truncado ? ' [extracto parcial]' : ''} ---\n${texto}`)
    .join('\n\n');
}

module.exports = { buildFuentesPromptBlock, preloadFuentes };
