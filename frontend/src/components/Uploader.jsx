import { useRef, useState } from 'react';

/**
 * Props:
 *  - file: File | null        — archivo actualmente seleccionado
 *  - onFileSelected(file)     — callback cuando el usuario elige un PDF válido
 *  - onGenerate()             — callback para disparar la generación
 *  - disabled: bool           — deshabilita la interacción mientras procesa
 */
export default function Uploader({ file, onFileSelected, onGenerate, disabled }) {
  const inputRef     = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState('');

  const validate = (f) => {
    if (!f) return false;
    if (f.type !== 'application/pdf') {
      setError('Solo se aceptan archivos PDF (.pdf).');
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
        aria-label="Zona de carga de PDF"
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
              : file
                ? 'border-green-400 bg-green-50 cursor-pointer hover:border-green-500'
                : 'border-slate-300 bg-white cursor-pointer hover:border-blue-400 hover:bg-blue-50/40',
        ].join(' ')}
      >
        {/* Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors
          ${file ? 'bg-green-100' : dragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
          {file ? (
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
            <p className="text-sm font-semibold text-green-700 break-all">{file.name}</p>
            <p className="text-xs text-green-600 mt-0.5">
              {(file.size / 1024).toFixed(0)} KB · PDF listo para procesar
            </p>
            {!disabled && (
              <p className="text-xs text-slate-400 mt-1">
                Haz clic para cambiar el archivo
              </p>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              Arrastra el <span className="text-blue-600 font-semibold">Programa Docente en PDF</span> aquí
            </p>
            <p className="text-xs text-slate-400 mt-1">o haz clic para seleccionar · Máx. 20 MB</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />
      </div>

      {/* Validation error */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={!file || disabled}
        className={[
          'w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all',
          !file || disabled
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
    </div>
  );
}
