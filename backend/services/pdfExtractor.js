'use strict';

const pdfParse = require('pdf-parse');

/**
 * Extrae el texto completo de un buffer PDF y lo normaliza.
 *
 * @param {Buffer} pdfBuffer - Buffer del archivo PDF recibido por multer
 * @returns {Promise<string>} - Texto plano limpio extraído del PDF
 * @throws {Error} Si el PDF está vacío, corrupto o no contiene texto extraíble
 */
async function extractTextFromPDF(pdfBuffer) {
  if (!pdfBuffer || pdfBuffer.length === 0) {
    throw new Error('El buffer del PDF está vacío.');
  }

  let parsed;
  try {
    parsed = await pdfParse(pdfBuffer);
  } catch (err) {
    throw new Error(`No se pudo leer el PDF. Asegúrate de que el archivo no esté corrupto o protegido con contraseña. Detalle: ${err.message}`);
  }

  const raw = parsed.text ?? '';

  if (raw.trim().length < 30) {
    throw new Error(
      'El PDF no contiene texto extraíble (puede ser un PDF escaneado como imagen). ' +
      'Por favor, usa un PDF con texto seleccionable.',
    );
  }

  // ── Normalización ────────────────────────────────────────────────────────
  const clean = raw
    // Eliminar caracteres de control excepto tabulaciones y saltos de línea
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Colapsar espacios múltiples en uno solo (conservando saltos de línea)
    .replace(/[^\S\n]+/g, ' ')
    // Reducir más de 3 líneas en blanco consecutivas a 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return clean;
}

/**
 * Detecta el número de Elementos de Competencia en el texto extraído del PDF.
 * Busca patrones como "Elemento de Competencia 1", "EC1", "EC-3", etc.
 * Devuelve el conteo de números únicos encontrados, o null si no hay señal suficiente.
 *
 * @param {string} text - Texto plano extraído del PDF
 * @returns {number|null}
 */
function countElementosDeCompetencia(text) {
  const numbers = new Set();

  // "Elemento de Competencia N" (con variantes de separadores y prefijos)
  const patternEC = /elemento\s+de\s+competencia\s*[n°#\-]?\s*(\d+)/gi;
  let m;
  while ((m = patternEC.exec(text)) !== null) {
    numbers.add(parseInt(m[1], 10));
  }

  // Código "EC1", "EC-2", "EC 3"
  const patternCode = /\bEC[-\s]?(\d+)\b/g;
  while ((m = patternCode.exec(text)) !== null) {
    numbers.add(parseInt(m[1], 10));
  }

  // Necesitamos al menos 2 ECs distintos para confiar en la detección
  if (numbers.size < 2) return null;
  return numbers.size; // cantidad de ECs únicos detectados
}

module.exports = { extractTextFromPDF, countElementosDeCompetencia };
