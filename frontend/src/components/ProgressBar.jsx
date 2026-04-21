import { useState, useEffect } from 'react';

const STEPS = [
  { pct: 10, msg: 'Extrayendo contenido del programa docente...' },
  { pct: 28, msg: 'Analizando estructura y competencias...' },
  { pct: 52, msg: 'Generando elementos de competencia...' },
  { pct: 72, msg: 'Construyendo ruta formativa y cronograma...' },
  { pct: 90, msg: 'Creando documento Word (.docx)...' },
];

// Approximate ms between step transitions (total ≈ 50 s, matching typical Claude latency)
const STEP_DELAYS = [3000, 8000, 12000, 10000, 10000];

/**
 * Props:
 *  - status: 'uploading' | 'processing'
 *  - externalMsg: string (used during 'uploading' phase)
 */
export default function ProgressBar({ status, externalMsg }) {
  const [stepIdx, setStepIdx]   = useState(0);
  const [pct, setPct]           = useState(0);
  const [animPct, setAnimPct]   = useState(0); // smooth animated percentage

  // Drive step progression when processing
  useEffect(() => {
    if (status !== 'processing') return;

    setStepIdx(0);
    setPct(STEPS[0].pct);

    const timers = [];
    let accumulated = 0;

    STEPS.forEach((step, i) => {
      accumulated += STEP_DELAYS[i] ?? 5000;
      const t = setTimeout(() => {
        setStepIdx(i);
        setPct(step.pct);
      }, accumulated);
      timers.push(t);
    });

    return () => timers.forEach(clearTimeout);
  }, [status]);

  // Smooth CSS transition for the bar width (we animate animPct toward pct)
  useEffect(() => {
    if (status === 'uploading') {
      setAnimPct(8);
      return;
    }
    const raf = requestAnimationFrame(() => setAnimPct(pct));
    return () => cancelAnimationFrame(raf);
  }, [pct, status]);

  const currentMsg = status === 'uploading'
    ? (externalMsg || 'Enviando archivo...')
    : (STEPS[stepIdx]?.msg ?? 'Procesando...');

  const displayPct = status === 'uploading' ? 8 : animPct;

  return (
    <div className="flex flex-col gap-3">

      {/* Message row */}
      <div className="flex items-center gap-2">
        {/* Spinning ring */}
        <svg className="w-4 h-4 text-blue-600 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-80" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-slate-700 font-medium leading-snug transition-all duration-500">
          {currentMsg}
        </p>
      </div>

      {/* Track */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-[1200ms] ease-out"
          style={{ width: `${displayPct}%` }}
        />
      </div>

      {/* Step dots */}
      {status === 'processing' && (
        <div className="flex justify-between px-1">
          {STEPS.map((step, i) => (
            <div
              key={i}
              title={step.msg}
              className={`w-2 h-2 rounded-full transition-colors duration-500
                ${i <= stepIdx ? 'bg-blue-600' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      )}

      {/* Substep list */}
      {status === 'processing' && (
        <ul className="text-xs text-slate-400 space-y-0.5 pl-1">
          {STEPS.map((step, i) => (
            <li
              key={i}
              className={`flex items-center gap-1.5 transition-colors duration-300
                ${i < stepIdx  ? 'text-green-600'
                : i === stepIdx ? 'text-blue-700 font-medium'
                : 'text-slate-300'}`}
            >
              {i < stepIdx ? (
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className={`w-3 h-3 shrink-0 rounded-full border flex items-center justify-center text-[8px]
                  ${i === stepIdx ? 'border-blue-600 text-blue-700' : 'border-slate-200'}`}>
                  {i === stepIdx && '·'}
                </span>
              )}
              {step.msg}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-slate-400 text-right">
        {status === 'uploading'
          ? 'Subiendo archivo...'
          : 'Este proceso puede tardar entre 30 y 60 segundos.'}
      </p>
    </div>
  );
}
