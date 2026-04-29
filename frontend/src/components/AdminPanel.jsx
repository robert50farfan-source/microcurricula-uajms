import { useState, useEffect, useCallback } from 'react';
import DashboardPanel from './DashboardPanel';

const API_BASE  = import.meta.env.VITE_API_BASE ?? '';
const ADMIN_URL = `${API_BASE}/api/admin/universidades`;

// ── Iconos inline ─────────────────────────────────────────────────────────────

function IconPlus() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.943l-3.536.707.707-3.536A4 4 0 019 13z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4h6v3M3 7h18" />
    </svg>
  );
}
function IconChevron({ open }) {
  return (
    <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ── Componente login ──────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [pwd, setPwd]     = useState('');
  const [show, setShow]   = useState(false);
  const [err, setErr]     = useState('');
  const [busy, setBusy]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pwd.trim()) return;
    setBusy(true);
    setErr('');
    try {
      const res = await fetch(ADMIN_URL, { headers: { 'x-admin-password': pwd } });
      if (res.status === 401 || res.status === 503) {
        const json = await res.json().catch(() => ({}));
        setErr(json.error ?? 'Contraseña incorrecta.');
      } else {
        sessionStorage.setItem('admin_pwd', pwd);
        onLogin(pwd);
      }
    } catch {
      setErr('No se pudo conectar con el servidor.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-10 px-6">
      <div className="w-14 h-14 rounded-2xl bg-blue-900 flex items-center justify-center shadow-lg">
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-slate-800 text-base">Acceso restringido</h3>
        <p className="text-sm text-slate-500 mt-0.5">Solo administradores del sistema</p>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
        <div className="relative flex items-center">
          <input
            type={show ? 'text' : 'password'}
            value={pwd}
            onChange={(e) => { setPwd(e.target.value); setErr(''); }}
            placeholder="Contraseña de administrador"
            autoComplete="current-password"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 pr-10 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
          />
          <button type="button" onClick={() => setShow((v) => !v)}
            className="absolute right-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {show
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                : <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </>
              }
            </svg>
          </button>
        </div>
        {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{err}</p>}
        <button type="submit" disabled={busy || !pwd.trim()}
          className="py-2.5 text-sm font-semibold bg-blue-900 text-white rounded-lg
                     hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
          {busy ? 'Verificando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

// ── Formulario inline para agregar/editar ─────────────────────────────────────

function InlineForm({ placeholder, initialValue = '', onSave, onCancel, extraField }) {
  const [val, setVal]   = useState(initialValue);
  const [ext, setExt]   = useState(extraField?.initial ?? '');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!val.trim()) return;
    setBusy(true);
    await onSave(val.trim(), ext.trim());
    setBusy(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        className="border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none
                   focus:ring-2 focus:ring-blue-300 w-full"
      />
      {extraField && (
        <input
          value={ext}
          onChange={(e) => setExt(e.target.value)}
          placeholder={extraField.placeholder}
          className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none
                     focus:ring-2 focus:ring-blue-300 w-full"
        />
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={busy || !val.trim()}
          className="px-3 py-1.5 text-xs font-semibold bg-blue-900 text-white rounded-lg
                     hover:bg-blue-800 disabled:opacity-40 transition-colors">
          {busy ? 'Guardando…' : 'Guardar'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

// ── Panel principal de administración ────────────────────────────────────────

export default function AdminPanel({ onClose }) {
  const savedPwd = sessionStorage.getItem('admin_pwd');
  const [pwd, setPwd]             = useState(savedPwd ?? '');
  const [authenticated, setAuth]  = useState(!!savedPwd);
  const [tab, setTab]             = useState('gestion'); // 'gestion' | 'dashboard'
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [globalErr, setGlobalErr] = useState('');

  // Qué ítem está expandido
  const [openUni, setOpenUni]   = useState(null);
  const [openFac, setOpenFac]   = useState({});

  // Formularios activos: 'addUni' | { type:'editUni', uid } | { type:'addFac', uid }
  //   | { type:'editFac', uid, fid } | { type:'addCar', uid, fid }
  //   | { type:'editCar', uid, fid, cid }
  const [activeForm, setActiveForm] = useState(null);

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    'x-admin-password': pwd,
  }), [pwd]);

  const load = useCallback(async () => {
    setLoading(true);
    setGlobalErr('');
    try {
      const res = await fetch(ADMIN_URL, { headers: headers() });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Error al cargar datos.');
      setData(await res.json());
    } catch (err) {
      setGlobalErr(err.message);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    if (authenticated) load();
  }, [authenticated, load]);

  const handleLogin = (password) => {
    setPwd(password);
    setAuth(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_pwd');
    setAuth(false);
    setPwd('');
    setData([]);
  };

  // ── Universidades ──────────────────────────────────────────────────────────

  const addUniversidad = async (nombre, sigla) => {
    const res = await fetch(ADMIN_URL, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ nombre, sigla }),
    });
    if (res.ok) { setActiveForm(null); load(); }
    else setGlobalErr((await res.json().catch(() => ({}))).error ?? 'Error al crear universidad.');
  };

  const editUniversidad = async (uid, nombre, sigla) => {
    const res = await fetch(`${ADMIN_URL}/${uid}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ nombre, sigla }),
    });
    if (res.ok) { setActiveForm(null); load(); }
    else setGlobalErr((await res.json().catch(() => ({}))).error ?? 'Error al actualizar universidad.');
  };

  const deleteUniversidad = async (uid) => {
    if (!confirm('¿Eliminar esta universidad y todas sus facultades y carreras?')) return;
    const res = await fetch(`${ADMIN_URL}/${uid}`, { method: 'DELETE', headers: headers() });
    if (res.ok) { if (openUni === uid) setOpenUni(null); load(); }
    else setGlobalErr((await res.json().catch(() => ({}))).error ?? 'Error al eliminar universidad.');
  };

  // ── Facultades ─────────────────────────────────────────────────────────────

  const addFacultad = async (uid, nombre) => {
    const res = await fetch(`${ADMIN_URL}/${uid}/facultades`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ nombre }),
    });
    if (res.ok) { setActiveForm(null); load(); }
    else setGlobalErr((await res.json().catch(() => ({}))).error ?? 'Error al crear facultad.');
  };

  const editFacultad = async (uid, fid, nombre) => {
    const res = await fetch(`${ADMIN_URL}/${uid}/facultades/${fid}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ nombre }),
    });
    if (res.ok) { setActiveForm(null); load(); }
    else setGlobalErr((await res.json().catch(() => ({}))).error ?? 'Error al actualizar facultad.');
  };

  const deleteFacultad = async (uid, fid) => {
    if (!confirm('¿Eliminar esta facultad y todas sus carreras?')) return;
    const res = await fetch(`${ADMIN_URL}/${uid}/facultades/${fid}`, { method: 'DELETE', headers: headers() });
    if (res.ok) load();
    else setGlobalErr((await res.json().catch(() => ({}))).error ?? 'Error al eliminar facultad.');
  };

  // ── Carreras ───────────────────────────────────────────────────────────────

  const addCarrera = async (uid, fid, nombre) => {
    const res = await fetch(`${ADMIN_URL}/${uid}/facultades/${fid}/carreras`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ nombre }),
    });
    if (res.ok) { setActiveForm(null); load(); }
    else setGlobalErr((await res.json().catch(() => ({}))).error ?? 'Error al crear carrera.');
  };

  const editCarrera = async (uid, fid, cid, nombre) => {
    const res = await fetch(`${ADMIN_URL}/${uid}/facultades/${fid}/carreras/${cid}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ nombre }),
    });
    if (res.ok) { setActiveForm(null); load(); }
    else setGlobalErr((await res.json().catch(() => ({}))).error ?? 'Error al actualizar carrera.');
  };

  const deleteCarrera = async (uid, fid, cid) => {
    if (!confirm('¿Eliminar esta carrera?')) return;
    const res = await fetch(`${ADMIN_URL}/${uid}/facultades/${fid}/carreras/${cid}`, { method: 'DELETE', headers: headers() });
    if (res.ok) load();
    else setGlobalErr((await res.json().catch(() => ({}))).error ?? 'Error al eliminar carrera.');
  };

  const toggleFac = (uid, fid) => {
    setOpenFac((prev) => ({ ...prev, [`${uid}_${fid}`]: !prev[`${uid}_${fid}`] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-800">Administración del Sistema</h2>
          </div>
          <div className="flex items-center gap-2">
            {authenticated && (
              <button onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded">
                Cerrar sesión
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pestañas — solo visibles tras autenticarse */}
        {authenticated && (
          <div className="flex border-b border-slate-100 shrink-0 px-6">
            {[
              { key: 'gestion',   label: 'Gestión institucional' },
              { key: 'dashboard', label: 'Dashboard' },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {!authenticated ? (
            <LoginScreen onLogin={handleLogin} />
          ) : tab === 'dashboard' ? (
            <DashboardPanel pwd={pwd} />
          ) : loading ? (
            <p className="text-center text-slate-400 text-sm py-10">Cargando datos...</p>
          ) : (
            <div className="flex flex-col gap-4">

              {globalErr && (
                <div className="text-xs bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2">
                  {globalErr}
                  <button onClick={() => setGlobalErr('')} className="ml-2 underline">cerrar</button>
                </div>
              )}

              {/* ── Lista de universidades ──────────────────────────────── */}
              {data.map((uni) => (
                <div key={uni.id} className="border border-slate-200 rounded-xl overflow-hidden">

                  {/* Cabecera universidad */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-blue-900 text-white">
                    <button onClick={() => setOpenUni(openUni === uni.id ? null : uni.id)}
                      className="flex items-center gap-2 flex-1 text-left min-w-0">
                      <IconChevron open={openUni === uni.id} />
                      <span className="font-semibold text-sm truncate">{uni.nombre}</span>
                      {uni.sigla && <span className="text-xs bg-white/20 rounded px-1.5 py-0.5 shrink-0">{uni.sigla}</span>}
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setActiveForm({ type: 'editUni', uid: uni.id })}
                        title="Editar universidad"
                        className="p-1.5 rounded hover:bg-white/20 transition-colors">
                        <IconEdit />
                      </button>
                      <button onClick={() => deleteUniversidad(uni.id)}
                        title="Eliminar universidad"
                        className="p-1.5 rounded hover:bg-red-500/80 transition-colors">
                        <IconTrash />
                      </button>
                    </div>
                  </div>

                  {/* Formulario editar universidad */}
                  {activeForm?.type === 'editUni' && activeForm.uid === uni.id && (
                    <div className="px-4 py-3 bg-blue-50 border-b border-slate-200">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Editar universidad</p>
                      <InlineForm
                        placeholder="Nombre completo de la universidad"
                        initialValue={uni.nombre}
                        extraField={{ placeholder: 'Sigla (ej: UAJMS)', initial: uni.sigla ?? '' }}
                        onSave={(nombre, sigla) => editUniversidad(uni.id, nombre, sigla)}
                        onCancel={() => setActiveForm(null)}
                      />
                    </div>
                  )}

                  {/* Facultades (colapsables) */}
                  {openUni === uni.id && (
                    <div className="divide-y divide-slate-100">
                      {uni.facultades.map((fac) => (
                        <div key={fac.id}>
                          {/* Cabecera facultad */}
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <button onClick={() => toggleFac(uni.id, fac.id)}
                              className="flex items-center gap-2 flex-1 text-left min-w-0">
                              <IconChevron open={!!openFac[`${uni.id}_${fac.id}`]} />
                              <span className="text-sm text-slate-700 font-medium truncate">{fac.nombre}</span>
                              <span className="text-xs text-slate-400 shrink-0">
                                {fac.carreras.length} carrera{fac.carreras.length !== 1 ? 's' : ''}
                              </span>
                            </button>
                            <div className="flex items-center gap-1 shrink-0">
                              <button onClick={() => setActiveForm({ type: 'editFac', uid: uni.id, fid: fac.id })}
                                title="Editar facultad"
                                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                <IconEdit />
                              </button>
                              <button onClick={() => deleteFacultad(uni.id, fac.id)}
                                title="Eliminar facultad"
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                                <IconTrash />
                              </button>
                            </div>
                          </div>

                          {/* Formulario editar facultad */}
                          {activeForm?.type === 'editFac' && activeForm.uid === uni.id && activeForm.fid === fac.id && (
                            <div className="px-6 py-3 bg-blue-50 border-b border-slate-200">
                              <p className="text-xs font-semibold text-blue-900 mb-1">Editar facultad</p>
                              <InlineForm
                                placeholder="Nombre completo de la facultad"
                                initialValue={fac.nombre}
                                onSave={(nombre) => editFacultad(uni.id, fac.id, nombre)}
                                onCancel={() => setActiveForm(null)}
                              />
                            </div>
                          )}

                          {/* Carreras */}
                          {openFac[`${uni.id}_${fac.id}`] && (
                            <div className="px-8 py-2 flex flex-col gap-1 bg-white">
                              {fac.carreras.map((car) => (
                                <div key={car.id}>
                                  <div className="flex items-center gap-2 py-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                    <span className="text-sm text-slate-700 flex-1">{car.nombre}</span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      <button onClick={() => setActiveForm({ type: 'editCar', uid: uni.id, fid: fac.id, cid: car.id })}
                                        title="Editar carrera"
                                        className="p-1 rounded text-slate-300 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                        <IconEdit />
                                      </button>
                                      <button onClick={() => deleteCarrera(uni.id, fac.id, car.id)}
                                        title="Eliminar carrera"
                                        className="p-1 rounded text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors">
                                        <IconTrash />
                                      </button>
                                    </div>
                                  </div>
                                  {/* Formulario editar carrera */}
                                  {activeForm?.type === 'editCar' && activeForm.cid === car.id && (
                                    <div className="pl-4 py-2">
                                      <InlineForm
                                        placeholder="Nombre de la carrera"
                                        initialValue={car.nombre}
                                        onSave={(nombre) => editCarrera(uni.id, fac.id, car.id, nombre)}
                                        onCancel={() => setActiveForm(null)}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Agregar carrera */}
                              {activeForm?.type === 'addCar' && activeForm.uid === uni.id && activeForm.fid === fac.id ? (
                                <div className="pl-4 py-2">
                                  <InlineForm
                                    placeholder="Nombre de la nueva carrera"
                                    onSave={(nombre) => addCarrera(uni.id, fac.id, nombre)}
                                    onCancel={() => setActiveForm(null)}
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() => setActiveForm({ type: 'addCar', uid: uni.id, fid: fac.id })}
                                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800
                                             transition-colors py-1 mt-1">
                                  <IconPlus />
                                  Agregar carrera
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Agregar facultad */}
                      <div className="px-4 py-3 bg-slate-50">
                        {activeForm?.type === 'addFac' && activeForm.uid === uni.id ? (
                          <InlineForm
                            placeholder="Nombre completo de la facultad"
                            onSave={(nombre) => addFacultad(uni.id, nombre)}
                            onCancel={() => setActiveForm(null)}
                          />
                        ) : (
                          <button
                            onClick={() => setActiveForm({ type: 'addFac', uid: uni.id })}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-600
                                       hover:text-blue-900 transition-colors">
                            <IconPlus />
                            Agregar facultad
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Agregar universidad */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl px-4 py-3">
                {activeForm === 'addUni' ? (
                  <>
                    <p className="text-xs font-semibold text-blue-900 mb-2">Nueva universidad</p>
                    <InlineForm
                      placeholder="Nombre completo de la universidad"
                      extraField={{ placeholder: 'Sigla (ej: UATF, UMSS, UPSA…)', initial: '' }}
                      onSave={(nombre, sigla) => addUniversidad(nombre, sigla)}
                      onCancel={() => setActiveForm(null)}
                    />
                  </>
                ) : (
                  <button
                    onClick={() => setActiveForm('addUni')}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-900 transition-colors w-full">
                    <IconPlus />
                    Agregar universidad
                  </button>
                )}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
