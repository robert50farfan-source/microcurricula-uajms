'use strict';

const mammoth = require('mammoth');

/**
 * Extrae el texto plano de un buffer DOCX y lo normaliza.
 *
 * @param {Buffer} docxBuffer
 * @returns {Promise<string>}
 */
async function extractTextFromDocx(docxBuffer) {
  if (!docxBuffer || docxBuffer.length === 0) {
    throw new Error('El buffer del archivo DOCX está vacío.');
  }

  let result;
  try {
    result = await mammoth.extractRawText({ buffer: docxBuffer });
  } catch (err) {
    throw new Error(`No se pudo leer el archivo DOCX. Asegúrate de que no esté corrupto o protegido. Detalle: ${err.message}`);
  }

  const raw = result.value ?? '';

  if (raw.trim().length < 30) {
    throw new Error('El archivo DOCX no contiene texto extraíble o está vacío.');
  }

  const clean = raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return clean;
}

module.exports = { extractTextFromDocx };
