import { useState, useEffect } from 'react';

const API_BASE      = import.meta.env.VITE_API_BASE ?? '';
const CONFIG_URL    = `${API_BASE}/api/config`;
const MALLA_URL     = `${API_BASE}/api/malla`;
const UNIVERS_URL   = `${API_BASE}/api/universidades`;

export default function ConfigPanel({ onClose }) {
  const [form, setForm] = useState(() => {
    const inst = JSON.parse(localStorage.getItem('inst_config') ?? '{}');
    return {
      nombreUniversidad: inst.nombreUniversidad ?? '',
      nombreFacultad:    inst.nombreFacultad    ?? '',
      nombreCarrera:     inst.nombreCarrera     ?? '',
      nombreDocente:     inst.nombreDocente     ?? '',
      emailDocente:      inst.emailDocente      ?? '',
      celDocente:        inst.celDocente        ?? '',
      nombreDirector:    inst.nombreDirector    ?? '',
      numIndicadores:    3,
      numInstrumentos:   3,
    };
  });
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState(null); // { type: 'ok'|'error', text }

  // API key
  const [apiKey, setApiKey]         = useState(() => localStorage.getItem('anthropic_api_key') ?? '');
  const [showApiKey, setShowApiKey] = useState(false);

  // Malla curricular — estado basado en localStorage (por navegador, no compartido)
  const [mallaStatus,    setMallaStatus]    = useState(() => {
    const stored = localStorage.getItem('malla_custom_data');
    if (!stored) return { uploaded: false };
    try {
      const malla = JSON.parse(stored);
      return { uploaded: true, carrera: malla.carrera, numSemestres: malla.semestres?.length ?? 0 };
    } catch {
      return { uploaded: false };
    }
  });
  const [mallaFile,      setMallaFile]      = useState(null);
  const [mallaUploading, setMallaUploading] = useState(false);
  const [mallaMsg,       setMallaMsg]       = useState(null);

  // Datos de universidades para los combos
  const [universidades, setUniversidades] = useState([]);
  const [uniLoading,    setUniLoading]    = useState(true);

  useEffect(() => {
    fetch(CONFIG_URL)
      .then((r) => r.json())
      .then((data) => setForm((prev) => ({
        ...prev,
        numIndicadores:  data.numIndicadores  ?? 3,
        numInstrumentos: data.numInstrumentos ?? 3,
      })))
      .catch(() => {});

    fetch(UNIVERS_URL)
      .then((r) => r.json())
      .then((data) => setUniversidades(data))
      .catch(() => setUniversidades([]))
      .finally(() => setUniLoading(false));
  }, []);

  // Universidad seleccionada → lista de facultades disponibles
  const uniSeleccionada = universidades.find((u) => u.nombre === form.nombreUniversidad) ?? null;
  const facultadesDisp  = uniSeleccionada?.facultades ?? [];

  // Facultad seleccionada → lista de carreras disponibles
  const facSeleccionada = facultadesDisp.find((f) => f.nombre === form.nombreFacultad) ?? null;
  const carrerasDisp    = facSeleccionada?.carreras ?? [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMsg(null);
    if (name === 'nombreUniversidad') {
      // Resetear facultad y carrera al cambiar universidad
      setForm((prev) => ({ ...prev, nombreUniversidad: value, nombreFacultad: '', nombreCarrera: '' }));
    } else if (name === 'nombreFacultad') {
      // Resetear carrera al cambiar facultad
      setForm((prev) => ({ ...prev, nombreFacultad: value, nombreCarrera: '' }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleMallaUpload = async () => {
    if (!mallaFile) return;
    // Usar la clave del campo actual (no localStorage); conservar solo chars válidos de API key
    const effectiveKey = apiKey.replace(/[^a-zA-Z0-9\-_]/g, '');
    if (!effectiveKey) {
      setMallaMsg({ type: 'error', text: 'Configura la clave de API de Anthropic antes de subir la malla.' });
      return;
    }
    setMallaUploading(true);
    setMallaMsg(null);
    const fd = new FormData();
    fd.append('pdf', mallaFile);
    try {
      const res  = await fetch(MALLA_URL, { method: 'POST', headers: { 'x-api-key': effectiveKey }, body: fd });
      const json = await res.json();
      if (!res.ok) {
        setMallaMsg({ type: 'error', text: json.error ?? 'Error al subir la malla.' });
      } else {
        localStorage.setItem('malla_custom_data', JSON.stringify(json.malla));
        setMallaStatus({ uploaded: true, carrera: json.carrera, numSemestres: json.numSemestres });
        setMallaFile(null);
        setMallaMsg({ type: 'ok', text: `Malla "${json.carrera}" cargada (${json.numSemestres} semestres).` });
      }
    } catch {
      setMallaMsg({ type: 'error', text: 'No se pudo conectar con el servidor.' });
    } finally {
      setMallaUploading(false);
    }
  };

  const handleMallaDelete = () => {
    localStorage.removeItem('malla_custom_data');
    setMallaStatus({ uploaded: false });
    setMallaFile(null);
    setMallaMsg({ type: 'ok', text: 'Malla eliminada. Se usará descripción textual.' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const cleanKey = apiKey.replace(/[^a-zA-Z0-9\-_]/g, '');
      if (cleanKey) {
        localStorage.setItem('anthropic_api_key', cleanKey);
      } else {
        localStorage.removeItem('anthropic_api_key');
      }

      localStorage.setItem('inst_config', JSON.stringify({
        nombreUniversidad: form.nombreUniversidad,
        nombreFacultad:    form.nombreFacultad,
        nombreCarrera:     form.nombreCarrera,
        nombreDocente:     form.nombreDocente,
        emailDocente:      form.emailDocente,
        celDocente:        form.celDocente,
        nombreDirector:    form.nombreDirector,
      }));

      const res = await fetch(CONFIG_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numIndicadores:  Number(form.numIndicadores),
          numInstrumentos: Number(form.numInstrumentos),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const errText = json.errors ? json.errors.join(' ') : (json.error ?? 'Error al guardar.');
        setMsg({ type: 'error', text: errText });
      } else {
        setMsg({ type: 'ok', text: 'Configuración guardada correctamente.' });
      }
    } catch {
      setMsg({ type: 'error', text: 'No se pudo conectar con el servidor.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-800">Configuración del Proyecto</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-1 min-h-0">
          <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">

            {/* Sección: API de Anthropic */}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-blue-900 mb-1">
                Clave de API de Anthropic
              </legend>
              <div className="flex flex-col gap-1">
                <div className="relative flex items-center">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-ant-api03-…"
                    autoComplete="off"
                    spellCheck={false}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 pr-10 text-sm text-slate-800
                               font-mono focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
                               placeholder:text-slate-400 placeholder:font-sans transition"
                  />
                  <button type="button" onClick={() => setShowApiKey((v) => !v)}
                    className="absolute right-2 text-slate-400 hover:text-slate-600 transition-colors"
                    title={showApiKey ? 'Ocultar clave' : 'Mostrar clave'}>
                    {showApiKey ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  La clave se guarda solo en este navegador y nunca se almacena en el servidor.{' '}
                  <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline">Obtener clave</a>
                </p>
              </div>
            </fieldset>

            <hr className="border-slate-100" />

            {/* Sección: Malla curricular */}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-blue-900 mb-1">
                Malla curricular
              </legend>
              {mallaStatus === null ? (
                <p className="text-xs text-slate-400">Cargando estado de la malla...</p>
              ) : mallaStatus.uploaded ? (
                <div className="flex items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-blue-800 truncate">{mallaStatus.carrera}</p>
                      <p className="text-xs text-blue-500">{mallaStatus.numSemestres} semestres</p>
                    </div>
                  </div>
                  <button type="button" onClick={handleMallaDelete}
                    className="text-xs text-red-500 hover:text-red-700 shrink-0 transition-colors">
                    Eliminar
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                  Sin malla. La sección 12 del documento usará descripción textual.
                </p>
              )}
              <div className="flex gap-2">
                <label className="flex-1 flex items-center gap-2 cursor-pointer border border-slate-200 rounded-lg px-3 py-2
                                  hover:border-blue-300 transition bg-white">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-xs text-slate-500 truncate">
                    {mallaFile ? mallaFile.name : 'Seleccionar malla en PDF…'}
                  </span>
                  <input type="file" accept=".pdf" className="sr-only"
                    onChange={(e) => { setMallaFile(e.target.files[0] ?? null); setMallaMsg(null); }} />
                </label>
                <button type="button" onClick={handleMallaUpload}
                  disabled={!mallaFile || mallaUploading}
                  className="px-3 py-2 text-xs font-semibold bg-blue-900 text-white rounded-lg
                             hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0">
                  {mallaUploading ? 'Procesando…' : 'Subir'}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                El PDF debe tener una tabla: primera fila = semestres, filas siguientes = materias por semestre.
              </p>
              {mallaMsg && (
                <div className={`text-xs rounded-lg px-3 py-2 ${
                  mallaMsg.type === 'ok'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {mallaMsg.text}
                </div>
              )}
            </fieldset>

            <hr className="border-slate-100" />

            {/* Sección: Datos institucionales */}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-blue-900 mb-1">
                Datos institucionales
              </legend>

              {uniLoading ? (
                <p className="text-xs text-slate-400">Cargando opciones institucionales...</p>
              ) : universidades.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <p className="text-xs text-amber-700">
                    No hay universidades configuradas. Un administrador debe agregarlas desde el módulo de administración (icono escudo en el encabezado).
                  </p>
                </div>
              ) : (
                <>
                  {/* Universidad */}
                  <SelectField
                    label="Universidad"
                    name="nombreUniversidad"
                    value={form.nombreUniversidad}
                    onChange={handleChange}
                    required
                    placeholder="Selecciona una universidad…"
                    options={universidades.map((u) => ({
                      value: u.nombre,
                      label: u.sigla ? `${u.nombre} (${u.sigla})` : u.nombre,
                    }))}
                  />

                  {/* Facultad */}
                  <SelectField
                    label="Facultad"
                    name="nombreFacultad"
                    value={form.nombreFacultad}
                    onChange={handleChange}
                    required
                    disabled={!form.nombreUniversidad}
                    placeholder={form.nombreUniversidad ? 'Selecciona una facultad…' : 'Primero selecciona la universidad'}
                    options={facultadesDisp.map((f) => ({ value: f.nombre, label: f.nombre }))}
                  />

                  {/* Carrera */}
                  <SelectField
                    label="Carrera"
                    name="nombreCarrera"
                    value={form.nombreCarrera}
                    onChange={handleChange}
                    required
                    disabled={!form.nombreFacultad}
                    placeholder={form.nombreFacultad ? 'Selecciona una carrera…' : 'Primero selecciona la facultad'}
                    options={carrerasDisp.map((c) => ({ value: c.nombre, label: c.nombre }))}
                  />
                </>
              )}

              <Field label="Nombre del docente" name="nombreDocente" value={form.nombreDocente ?? ''}
                onChange={handleChange} placeholder="Ej: Dr. Juan Pérez" />

              <div className="grid grid-cols-2 gap-3">
                <Field label="E-mail del docente" name="emailDocente" value={form.emailDocente ?? ''}
                  onChange={handleChange} placeholder="Ej: docente@uajms.edu.bo" />
                <Field label="Celular del docente" name="celDocente" value={form.celDocente ?? ''}
                  onChange={handleChange} placeholder="Ej: 77123456" />
              </div>

              <Field label="Nombre del/la director/a" name="nombreDirector" value={form.nombreDirector ?? ''}
                onChange={handleChange} placeholder="Ej: Ing. María García" />
            </fieldset>

            <hr className="border-slate-100" />

            {/* Sección: Datos técnicos */}
            <fieldset className="flex flex-col gap-3">
              <legend className="text-xs font-semibold uppercase tracking-wide text-blue-900 mb-1">
                Datos técnicos del proyecto formativo
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <NumberField label="Indicadores de evaluación" name="numIndicadores"
                  value={form.numIndicadores} onChange={handleChange} min={1} max={20}
                  hint="Por elemento de competencia" />
                <NumberField label="Instrumentos de evaluación" name="numInstrumentos"
                  value={form.numInstrumentos} onChange={handleChange} min={1} max={20}
                  hint="Por elemento de competencia" />
              </div>
            </fieldset>

            {msg && (
              <div className={`text-sm rounded-lg px-4 py-2.5 ${
                msg.type === 'ok'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {msg.text}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-800
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Sub-componentes ──────────────────────────────────────────────────────────

function SelectField({ label, name, value, onChange, required, placeholder, options, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800
                   focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
                   disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
                   transition bg-white appearance-none"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function Field({ label, name, value, onChange, required, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800
                   focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
                   placeholder:text-slate-400 transition"
      />
    </div>
  );
}

function NumberField({ label, name, value, onChange, min, max, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        required
        className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800
                   focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
                   transition text-center"
      />
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  );
}
