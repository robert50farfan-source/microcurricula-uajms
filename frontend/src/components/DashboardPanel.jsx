import { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE    = import.meta.env.VITE_API_BASE ?? '';
const STATS_URL   = `${API_BASE}/api/admin/stats`;
const LIVE_URL    = `${API_BASE}/api/admin/stats/live`;
const ERRORS_URL  = `${API_BASE}/api/admin/stats/errores`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtTime(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function fmtDate(isoStr) {
  const d = new Date(isoStr);
  return d.toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit' });
}

function fmtDia(fecha) {
  const d = new Date(fecha + 'T12:00:00');
  return d.toLocaleDateString('es-BO', { weekday: 'short', day: 'numeric' });
}

function elapsed(isoStr) {
  const sec = Math.floor((Date.now() - new Date(isoStr)) / 1000);
  if (sec < 60)  return `hace ${sec}s`;
  if (sec < 3600) return `hace ${Math.floor(sec / 60)}min`;
  return `hace ${Math.floor(sec / 3600)}h`;
}

// ── Sub-componentes ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }) {
  const colors = {
    blue:  'bg-blue-900  text-white',
    green: 'bg-green-600 text-white',
    amber: 'bg-amber-500 text-white',
    red:   'bg-red-500   text-white',
    slate: 'bg-slate-100 text-slate-800',
  };
  return (
    <div className={`rounded-xl px-4 py-3 flex flex-col gap-0.5 ${colors[color] ?? colors.slate}`}>
      <span className="text-xs opacity-80 font-medium">{label}</span>
      <span className="text-2xl font-bold leading-none">{value}</span>
      {sub && <span className="text-xs opacity-70 mt-0.5">{sub}</span>}
    </div>
  );
}

function BarChart({ items, colorClass = 'bg-blue-600', emptyMsg = 'Sin datos aún' }) {
  if (!items || items.length === 0) {
    return <p className="text-xs text-slate-400 py-2">{emptyMsg}</p>;
  }
  const max = Math.max(...items.map((i) => i.total), 1);
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item) => (
        <div key={item.nombre} className="flex items-center gap-2">
          <span className="text-xs text-slate-600 truncate w-40 shrink-0" title={item.nombre}>
            {item.nombre}
          </span>
          <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${colorClass}`}
              style={{ width: `${Math.round((item.total / max) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-700 w-6 text-right shrink-0">{item.total}</span>
        </div>
      ))}
    </div>
  );
}

function HoraChart({ porHora }) {
  if (!porHora || porHora.length === 0) return null;
  const max = Math.max(...porHora.map((h) => h.total), 1);
  const ahora = new Date().getHours();
  return (
    <div className="flex items-end gap-0.5 h-16">
      {porHora.map((h) => {
        const horaNum = parseInt(h.label, 10);
        const isNow   = horaNum === ahora;
        const pct     = Math.round((h.total / max) * 100);
        return (
          <div key={h.label} className="flex flex-col items-center flex-1" title={`${h.label}: ${h.total}`}>
            <div className="w-full flex items-end justify-center" style={{ height: '48px' }}>
              <div
                className={`w-full rounded-t transition-all duration-500 ${
                  isNow ? 'bg-blue-500' : h.total > 0 ? 'bg-blue-300' : 'bg-slate-100'
                }`}
                style={{ height: `${Math.max(pct, h.total > 0 ? 8 : 2)}%` }}
              />
            </div>
            {horaNum % 6 === 0 && (
              <span className="text-[9px] text-slate-400 mt-0.5">{h.label}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DiaChart({ porDia }) {
  if (!porDia || porDia.length === 0) return null;
  const max = Math.max(...porDia.map((d) => d.total), 1);
  const hoyStr = new Date().toISOString().slice(0, 10);
  return (
    <div className="flex items-end gap-1 h-16">
      {porDia.map((d) => {
        const isHoy = d.fecha === hoyStr;
        const pct   = Math.round((d.total / max) * 100);
        return (
          <div key={d.fecha} className="flex flex-col items-center flex-1" title={`${d.fecha}: ${d.total}`}>
            <span className="text-xs font-semibold text-slate-600 mb-1">{d.total || ''}</span>
            <div className="w-full flex items-end justify-center" style={{ height: '36px' }}>
              <div
                className={`w-full rounded-t transition-all duration-500 ${
                  isHoy ? 'bg-blue-600' : d.total > 0 ? 'bg-blue-300' : 'bg-slate-100'
                }`}
                style={{ height: `${Math.max(pct, d.total > 0 ? 15 : 4)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5">{fmtDia(d.fecha)}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────

export default function DashboardPanel({ pwd }) {
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [live,         setLive]         = useState(false);
  const [pulse,        setPulse]        = useState(false);
  const [lastUpd,      setLastUpd]      = useState(null);
  const [cleaningErr,  setCleaningErr]  = useState(false);
  const esRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(STATS_URL, { headers: { 'x-admin-password': pwd } });
      if (!res.ok) throw new Error('Error al cargar estadísticas.');
      const data = await res.json();
      setStats(data);
      setLastUpd(new Date());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pwd]);

  // Carga inicial + SSE
  useEffect(() => {
    fetchStats();

    // Conectar SSE
    const url = `${LIVE_URL}?pwd=${encodeURIComponent(pwd)}`;
    const es  = new EventSource(url);
    esRef.current = es;

    es.addEventListener('stats', (e) => {
      try {
        setStats(JSON.parse(e.data));
        setLastUpd(new Date());
        setPulse(true);
        setTimeout(() => setPulse(false), 1000);
      } catch { /* ignore */ }
    });

    es.onopen  = () => setLive(true);
    es.onerror = () => { setLive(false); };

    return () => { es.close(); esRef.current = null; };
  }, [pwd, fetchStats]);

  // Fallback: refresca cada 15s si SSE no está conectado
  useEffect(() => {
    if (live) return;
    const id = setInterval(fetchStats, 15_000);
    return () => clearInterval(id);
  }, [live, fetchStats]);

  const handleLimpiarErrores = async () => {
    if (!confirm(`¿Eliminar los ${resumen?.errores ?? 0} registros con error? Esta acción no se puede deshacer.`)) return;
    setCleaningErr(true);
    try {
      const res = await fetch(ERRORS_URL, {
        method: 'DELETE',
        headers: { 'x-admin-password': pwd },
      });
      if (!res.ok) throw new Error('Error al limpiar registros.');
      await fetchStats();
    } catch (err) {
      alert(err.message);
    } finally {
      setCleaningErr(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
        Cargando estadísticas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-10">
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{error}</p>
        <button onClick={fetchStats}
          className="text-xs text-blue-600 underline">Reintentar</button>
      </div>
    );
  }

  const { resumen, porCarrera, porUniversidad, porFacultad, porDocente, porHora, porDia, recientes } = stats ?? {};

  return (
    <div className="flex flex-col gap-5">

      {/* Indicador en vivo + última actualización */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${live ? 'bg-green-500' : 'bg-slate-300'} ${live && pulse ? 'animate-ping' : ''}`} />
          <span className="text-xs text-slate-500">{live ? 'En vivo' : 'Actualización automática'}</span>
        </div>
        <div className="flex items-center gap-3">
          {lastUpd && (
            <span className="text-xs text-slate-400">Actualizado {fmtTime(lastUpd.toISOString())}</span>
          )}
          <button onClick={fetchStats}
            className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
            Refrescar
          </button>
          {(resumen?.errores ?? 0) > 0 && (
            <button
              onClick={handleLimpiarErrores}
              disabled={cleaningErr}
              className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-40">
              {cleaningErr ? 'Limpiando…' : `Limpiar ${resumen.errores} error${resumen.errores !== 1 ? 'es' : ''}`}
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard label="Total generaciones" value={resumen?.total ?? 0} color="blue" />
        <StatCard label="Hoy"                value={resumen?.hoy   ?? 0} sub="generaciones" color="slate" />
        <StatCard label="Esta semana"        value={resumen?.semana ?? 0} sub="últimos 7 días" color="slate" />
        <StatCard
          label="Tasa de éxito"
          value={`${resumen?.tasaExito ?? 100}%`}
          sub={`${resumen?.errores ?? 0} error${resumen?.errores !== 1 ? 'es' : ''}`}
          color={resumen?.tasaExito >= 90 ? 'green' : resumen?.tasaExito >= 70 ? 'amber' : 'red'}
        />
      </div>

      {/* Actividad 7 días */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Generaciones — últimos 7 días
        </h3>
        <DiaChart porDia={porDia} />
      </div>

      {/* Actividad últimas 24h */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Actividad por hora — últimas 24 horas
        </h3>
        <HoraChart porHora={porHora} />
      </div>

      {/* Rankings en 2 columnas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Por carrera */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Por carrera
          </h3>
          <BarChart items={porCarrera} colorClass="bg-blue-500" emptyMsg="Sin generaciones aún" />
        </div>

        {/* Por docente */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Por docente
          </h3>
          <BarChart items={porDocente} colorClass="bg-indigo-500" emptyMsg="Sin generaciones aún" />
        </div>

        {/* Por universidad */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Por universidad
          </h3>
          <BarChart items={porUniversidad} colorClass="bg-teal-500" emptyMsg="Sin generaciones aún" />
        </div>

        {/* Por facultad */}
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">
            Por facultad
          </h3>
          <BarChart items={porFacultad} colorClass="bg-violet-500" emptyMsg="Sin generaciones aún" />
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Actividad reciente
          </h3>
          <span className="text-xs text-slate-400">{recientes?.length ?? 0} registros</span>
        </div>

        {!recientes || recientes.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">
            Aún no se han generado proyectos formativos.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-left">
                  <th className="px-4 py-2 font-medium">Hora</th>
                  <th className="px-4 py-2 font-medium">Asignatura</th>
                  <th className="px-4 py-2 font-medium">Carrera</th>
                  <th className="px-4 py-2 font-medium">Docente</th>
                  <th className="px-4 py-2 font-medium text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recientes.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2 text-slate-500 whitespace-nowrap">
                      <span title={new Date(r.ts).toLocaleString('es-BO')}>
                        {fmtDate(r.ts)} {fmtTime(r.ts)}
                      </span>
                      <span className="block text-slate-400">{elapsed(r.ts)}</span>
                    </td>
                    <td className="px-4 py-2 text-slate-800 max-w-[160px] truncate" title={r.asignatura}>
                      {r.asignatura || <span className="text-slate-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-2 text-slate-600 max-w-[130px] truncate" title={r.carrera}>
                      {r.carrera || <span className="text-slate-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-2 text-slate-600 max-w-[120px] truncate" title={r.docente}>
                      {r.docente || <span className="text-slate-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {r.exito ? (
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700
                                         border border-green-200 rounded-full px-2 py-0.5 text-[10px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-700
                                         border border-red-200 rounded-full px-2 py-0.5 text-[10px] font-medium"
                              title={r.error ?? ''}>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Error
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
