import { useState, useEffect, useRef } from 'react';
import Uploader from './components/Uploader';
import ProgressBar from './components/ProgressBar';
import DownloadButton from './components/DownloadButton';
import ConfigPanel from './components/ConfigPanel';
import HelpPanel from './components/HelpPanel';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';
const API_URL = `${API_BASE}/api/generate`;

export default function App() {
  const [status, setStatus] = useState('idle');    // idle | uploading | processing | done | error
  const [file, setFile] = useState(null);
  const [progressMsg, setProgressMsg] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [nombreCarrera, setNombreCarrera] = useState('');
  const blobUrlRef = useRef(null);

  // Revoke blob URL when component unmounts or a new one is generated
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  // Cargar nombre de la carrera desde la configuración
  const fetchNombreCarrera = () => {
    fetch(`${API_BASE}/api/config`)
      .then((r) => r.json())
      .then((data) => setNombreCarrera(data.nombreCarrera ?? ''))
      .catch(() => { });
  };

  useEffect(() => { fetchNombreCarrera(); }, []);

  const handleFileSelected = (selectedFile) => {
    setFile(selectedFile);
    // Reset previous results when a new file is chosen
    if (status === 'done' || status === 'error') {
      setStatus('idle');
      setErrorMsg('');
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
        setDownloadUrl(null);
      }
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    const apiKey = localStorage.getItem('anthropic_api_key');
    if (!apiKey || !apiKey.trim()) {
      setErrorMsg('Configura la clave de API de Anthropic antes de generar (icono ⚙ arriba a la derecha).');
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setProgressMsg('Enviando archivo al servidor...');
    setErrorMsg('');
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      setDownloadUrl(null);
    }

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      // Adjuntar la malla propia del usuario (guardada en localStorage)
      // para que el servidor use la del request y no la del archivo compartido
      const mallaData = localStorage.getItem('malla_custom_data');
      if (mallaData) formData.append('mallaJson', mallaData);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-api-key': apiKey.trim() },
        body: formData,
      });

      // Switch to processing state as soon as upload is complete
      setStatus('processing');

      if (!response.ok) {
        let msg = `Error del servidor (${response.status})`;
        try {
          const json = await response.json();
          msg = json.error ?? msg;
        } catch { /* response might not be JSON */ }
        throw new Error(msg);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      setDownloadUrl(url);
      setStatus('done');
    } catch (err) {
      setErrorMsg(err.message ?? 'Error inesperado. Intenta nuevamente.');
      setStatus('error');
    }
  };

  const isWorking = status === 'uploading' || status === 'processing';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {showConfig && <ConfigPanel onClose={() => { setShowConfig(false); fetchNombreCarrera(); }} />}
      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-4">
          {/* Logos institucionales */}
          <div className="flex items-center gap-1 shrink-0">
            <img src="/images/uajms.png" alt="UAJMS"
              title="Universidad Autónoma 'Juan Misael Saracho'"
              className="w-12 h-12 rounded-full object-contain" />
            <img src="/images/firnt.png" alt="FIRNT"
              title="Facultad de Ingeniería de Recursos Naturales y Tecnología"
              className="w-12 h-12 rounded-full object-contain" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-blue-900 leading-tight">
              Generador de Proyectos Formativos
            </h1>
            <p className="text-sm text-slate-500">
              UAJMS · FIRNT · Ingeniería Informatica
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowHelp(true)}
              title="Ayuda / Acerca de"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400
                         hover:text-blue-900 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={() => setShowConfig(true)}
              title="Configuración"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400
                         hover:text-blue-900 hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10 flex flex-col gap-6">

        {/* Description card */}
        <div className="bg-blue-900 text-white rounded-2xl px-7 py-5">
          <h2 className="font-semibold text-base mb-1">¿Qué hace esta herramienta?</h2>
          <p className="text-sm text-blue-200 leading-relaxed">
            Sube el <strong className="text-white">programa docente en PDF</strong> de cualquier
            asignatura de la carrera. La IA analiza el contenido y genera automáticamente
            el <strong className="text-white">Proyecto Formativo completo</strong> (Identificación,
            Malla Curricular, Competencias, Ruta Formativa, Cronograma y Recursos) siguiendo
            la plantilla institucional <strong className="text-white">UAJMS v2</strong>, listo
            para descargar en Word (.docx).
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 flex flex-col gap-6">

          {/* Step indicators */}
          <StepIndicator status={status} />


          {/* Uploader */}
          <Uploader
            onFileSelected={handleFileSelected}
            onGenerate={handleGenerate}
            file={file}
            disabled={isWorking}
          />

          {/* Progress bar */}
          {isWorking && (
            <ProgressBar status={status} externalMsg={progressMsg} />
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-700">Error al generar el documento</p>
                <p className="text-sm text-red-600 mt-0.5">{errorMsg}</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-xs text-red-500 underline mt-1 hover:text-red-700"
                >
                  Intentar nuevamente
                </button>
              </div>
            </div>
          )}

          {/* Download button */}
          {status === 'done' && downloadUrl && (
            <DownloadButton downloadUrl={downloadUrl} fileName={file?.name} />
          )}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="text-center py-5 text-xs text-slate-400 border-t border-slate-200 bg-white">
        Documento generado siguiendo la plantilla{' '}
        <span className="font-medium text-slate-500">Proyecto Formativo UAJMS v2</span>
        {' '}· Powered by Claude AI - LRFS · FIRNT — Ingenieria Informatica
      </footer>
    </div>
  );
}

// ── Step indicator (sub-component, local to App) ─────────────────────────────
function StepIndicator({ status }) {
  const steps = [
    { key: 'upload', label: 'Subir PDF' },
    { key: 'process', label: 'Generando' },
    { key: 'done', label: 'Listo' },
  ];

  const activeIdx = status === 'idle' || status === 'error' ? 0
    : status === 'uploading' || status === 'processing' ? 1
      : 2;

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
              ${i < activeIdx ? 'bg-blue-600 text-white'
                : i === activeIdx ? 'bg-blue-900 text-white ring-4 ring-blue-200'
                  : 'bg-slate-200 text-slate-400'}`}
            >
              {i < activeIdx ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-xs mt-1 ${i === activeIdx ? 'text-blue-900 font-semibold' : 'text-slate-400'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-0.5 mb-4 mx-1 transition-colors
              ${i < activeIdx ? 'bg-blue-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
