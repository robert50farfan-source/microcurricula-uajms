/**
 * Props:
 *  - downloadUrl: string  — blob URL del .docx generado
 *  - fileName: string     — nombre original del PDF subido (se usa para sugerir nombre del .docx)
 */
export default function DownloadButton({ downloadUrl, fileName }) {
  const docxName = fileName
    ? fileName.replace(/\.pdf$/i, '') + '-proyecto-formativo.docx'
    : 'proyecto-formativo.docx';

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Success badge */}
      <div className="flex items-center gap-2 text-green-700">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="font-semibold text-sm">¡Proyecto Formativo generado exitosamente!</span>
      </div>

      {/* Download link styled as button */}
      <a
        href={downloadUrl}
        download={docxName}
        className="w-full flex items-center justify-center gap-2.5
                   bg-green-600 hover:bg-green-700 active:scale-[0.98]
                   text-white font-semibold text-sm
                   py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg
                   transition-all duration-150"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Descargar Proyecto Formativo (.docx)
      </a>

      <p className="text-xs text-slate-400 text-center">
        Archivo: <span className="text-slate-600 font-mono">{docxName}</span>
        <br />
        Compatible con Microsoft Word y LibreOffice Writer
      </p>
    </div>
  );
}
