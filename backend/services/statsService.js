'use strict';

const fs   = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const LOG_FILE    = path.join(__dirname, '../config/logs.json');
const MAX_ENTRIES = 2000;

// ── Persistencia ──────────────────────────────────────────────────────────────

function readLogs() {
  try { return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8')); }
  catch { return []; }
}

function writeLogs(logs) {
  try { fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2), 'utf8'); }
  catch (err) { console.error('[statsService] Error al escribir logs:', err.message); }
}

// ── Registro de eventos ───────────────────────────────────────────────────────

function registrarEvento({ universidad, facultad, carrera, docente, asignatura, exito, error }) {
  const logs = readLogs();
  logs.push({
    id:          randomUUID(),
    ts:          new Date().toISOString(),
    universidad: universidad || '',
    facultad:    facultad    || '',
    carrera:     carrera     || '',
    docente:     docente     || '',
    asignatura:  asignatura  || '',
    exito:       !!exito,
    error:       error       || null,
  });
  if (logs.length > MAX_ENTRIES) logs.splice(0, logs.length - MAX_ENTRIES);
  writeLogs(logs);
  notificarClientes();
}

// ── SSE clients ───────────────────────────────────────────────────────────────

const sseClients = new Set();

function agregarClienteSSE(res) {
  sseClients.add(res);
  res.on('close', () => sseClients.delete(res));
}

function notificarClientes() {
  if (sseClients.size === 0) return;
  const data = JSON.stringify(computarStats());
  for (const res of sseClients) {
    try { res.write(`event: stats\ndata: ${data}\n\n`); }
    catch { sseClients.delete(res); }
  }
}

// ── Cómputo de estadísticas ───────────────────────────────────────────────────

function computarStats() {
  const logs  = readLogs();
  const ahora = new Date();
  const hoyStr = ahora.toISOString().slice(0, 10);
  const hace7d = new Date(ahora - 7 * 24 * 60 * 60 * 1000);
  const hace24h = new Date(ahora - 24 * 60 * 60 * 1000);

  const exitosos = logs.filter((l) => l.exito).length;
  const hoy      = logs.filter((l) => l.ts.startsWith(hoyStr)).length;
  const semana   = logs.filter((l) => new Date(l.ts) >= hace7d).length;

  // Rankings
  const carreraMap = {};
  const uniMap     = {};
  const facMap     = {};
  const docenteMap = {};
  for (const l of logs) {
    if (l.carrera)     carreraMap[l.carrera]     = (carreraMap[l.carrera]     || 0) + 1;
    if (l.universidad) uniMap[l.universidad]     = (uniMap[l.universidad]     || 0) + 1;
    if (l.facultad)    facMap[l.facultad]         = (facMap[l.facultad]       || 0) + 1;
    if (l.docente)     docenteMap[l.docente]     = (docenteMap[l.docente]     || 0) + 1;
  }

  const toRanking = (map, top = 10) =>
    Object.entries(map)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, top);

  // Actividad por hora (últimas 24h) — array de 24 slots
  const horaMap = {};
  for (let h = 0; h < 24; h++) {
    const label = `${String(h).padStart(2, '0')}:00`;
    horaMap[label] = 0;
  }
  for (const l of logs) {
    const d = new Date(l.ts);
    if (d >= hace24h) {
      const label = `${String(d.getHours()).padStart(2, '0')}:00`;
      horaMap[label] = (horaMap[label] || 0) + 1;
    }
  }
  const porHora = Object.entries(horaMap).map(([label, total]) => ({ label, total }));

  // Actividad por día (últimos 7 días)
  const diaMap = {};
  for (let i = 6; i >= 0; i--) {
    const d  = new Date(ahora);
    d.setDate(d.getDate() - i);
    diaMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const l of logs) {
    const dia = l.ts.slice(0, 10);
    if (dia in diaMap) diaMap[dia] = diaMap[dia] + 1;
  }
  const porDia = Object.entries(diaMap).map(([fecha, total]) => ({ fecha, total }));

  // Recientes (últimos 25 eventos)
  const recientes = [...logs].reverse().slice(0, 25).map(
    ({ id, ts, universidad, facultad, carrera, docente, asignatura, exito, error }) =>
      ({ id, ts, universidad, facultad, carrera, docente, asignatura, exito, error })
  );

  return {
    resumen: {
      total: logs.length,
      hoy,
      semana,
      exitosos,
      errores:    logs.length - exitosos,
      tasaExito:  logs.length ? Math.round((exitosos / logs.length) * 100) : 100,
    },
    porCarrera:     toRanking(carreraMap),
    porUniversidad: toRanking(uniMap),
    porFacultad:    toRanking(facMap),
    porDocente:     toRanking(docenteMap),
    porHora,
    porDia,
    recientes,
    actualizadoEn: new Date().toISOString(),
  };
}

// ── Limpieza de logs ──────────────────────────────────────────────────────────

function limpiarErrores() {
  const logs      = readLogs();
  const filtrados = logs.filter((l) => l.exito);
  writeLogs(filtrados);
  notificarClientes();
  return { eliminados: logs.length - filtrados.length, restantes: filtrados.length };
}

module.exports = { registrarEvento, computarStats, agregarClienteSSE, limpiarErrores };
