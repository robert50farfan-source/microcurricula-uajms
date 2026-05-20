import { useRef, useState } from 'react';

/**
 * Props:
 *  - file: File | null          — archivo actualmente seleccionado
 *  - onFileSelected(file)       — callback cuando el usuario elige un archivo válido (PDF o DOCX)
 *  - onGenerate()               — callback para disparar la generación
 *  - disabled: bool             — deshabilita la interacción mientras procesa
 *  - validationState: string    — 'idle' | 'validating' | 'valid' | 'warning'
 *  - validationMsg: string      — mensaje descriptivo del resultado de validación
 */
export default function Uploader({ file, onFileSelected, onGenerate, disabled,
                                   validationState = 'idle', validationMsg = '' }) {
  const inputRef     = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState('');

  const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  const validate = (f) => {
    if (!f) return false;
    const isPdf  = f.type === 'application/pdf';
    const isDocx = f.type === DOCX_MIME || f.name?.toLowerCase().endsWith('.docx');
    if (!isPdf && !isDocx) {
      setError('Solo se aceptan archivos PDF (.pdf) o Word (.docx).');
      return false;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('El archivo supera el límite de 20 MB.');
      return false;
    }
    setError('');
    return true;
  };

  const handleChange = (e) => {
    const f = e.target.files?.[0];
    if (f && validate(f)) onFileSelected(f);
    // Reset input so the same file can be re-selected after an error
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f && validate(f)) onFileSelected(f);
  };

  const handleDragOver = (e) => { e.preventDefault(); if (!disabled) setDragging(true); };
  const handleDragLeave = ()  => setDragging(false);

  const openPicker = () => { if (!disabled) inputRef.current?.click(); };

  return (
    <div className="flex flex-col gap-4">

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Zona de carga del Programa Docente"
        onClick={openPicker}
        onKeyDown={(e) => e.key === 'Enter' && openPicker()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          'relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all',
          disabled
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
            : dragging
              ? 'border-blue-500 bg-blue-50 cursor-copy scale-[1.01]'
              : validationState === 'warning'
                ? 'border-amber-400 bg-amber-50 cursor-pointer hover:border-amber-500'
                : file && (validationState === 'valid' || validationState === 'validating')
                  ? 'border-green-400 bg-green-50 cursor-pointer hover:border-green-500'
                  : file
                    ? 'border-green-400 bg-green-50 cursor-pointer hover:border-green-500'
                    : 'border-slate-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50/40',
        ].join(' ')}
      >
        {/* Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors
          ${validationState === 'warning' ? 'bg-amber-100'
            : file ? 'bg-green-100'
            : dragging ? 'bg-blue-100'
            : 'bg-slate-100'}`}>
          {validationState === 'validating' ? (
            <svg className="w-7 h-7 text-green-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : validationState === 'warning' ? (
            <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          ) : file ? (
            <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          )}
        </div>

        {/* Text */}
        {file ? (
          <div className="text-center">
            <p className={`text-sm font-semibold break-all ${validationState === 'warning' ? 'text-amber-700' : 'text-green-700'}`}>
              {file.name}
            </p>
            <p className={`text-xs mt-0.5 ${validationState === 'warning' ? 'text-amber-600' : 'text-green-600'}`}>
              {(file.size / 1024).toFixed(0)} KB
              {validationState === 'validating' && ' · verificando documento…'}
              {validationState === 'valid'      && ' · programa docente verificado'}
              {validationState === 'warning'    && ' · documento no reconocido'}
              {validationState === 'idle'       && ' · listo para procesar'}
            </p>
            {!disabled && (
              <p className="text-xs text-slate-400 mt-1">Haz clic para cambiar el archivo</p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              Arrastra el <span className="text-blue-600 font-semibold">Programa Docente</span> aquí
            </p>
            <p className="text-xs text-slate-400 mt-1">PDF o Word (.docx) · o haz clic para seleccionar · Máx. 20 MB</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
      </div>

      {/* Validation error (formato/tamaño) */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Aviso de validación: documento no reconocido */}
      {validationState === 'warning' && validationMsg && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-xs text-amber-700 leading-relaxed">{validationMsg}</p>
          </div>
          <button
            onClick={onGenerate}
            disabled={disabled}
            className="self-end text-xs font-semibold text-amber-700 hover:text-amber-900
                       underline underline-offset-2 transition-colors disabled:opacity-40"
          >
            Continuar de todas formas →
          </button>
        </div>
      )}

      {/* Generate button — oculto cuando hay advertencia activa */}
      {validationState !== 'warning' && (
        <button
          onClick={onGenerate}
          disabled={!file || disabled || validationState === 'validating'}
          className={[
            'w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
            !file || disabled || validationState === 'validating'
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-900 hover:bg-blue-800 active:scale-[0.98] text-white shadow-md hover:shadow-lg',
          ].join(' ')}
        >
          {disabled ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Procesando...
            </>
          ) : validationState === 'validating' ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verificando documento...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generar Proyecto Formativo
            </>
          )}
        </button>
      )}
    </div>
  );
}
