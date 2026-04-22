import { useState } from 'react';

export default function HelpPanel({ onClose }) {
  const [tab, setTab] = useState('instrucciones'); // 'instrucciones' | 'acerca'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-semibold text-slate-800">Ayuda</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 shrink-0 px-6">
          <TabBtn active={tab === 'instrucciones'} onClick={() => setTab('instrucciones')}>
            Instrucciones de uso
          </TabBtn>
          <TabBtn active={tab === 'acerca'} onClick={() => setTab('acerca')}>
            Acerca de
          </TabBtn>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {tab === 'instrucciones' ? <Instrucciones /> : <AcercaDe />}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end shrink-0">
          <button onClick={onClose}
            className="px-5 py-2 text-sm font-semibold bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Tab button ─────────────────────────────────────────────────────────────── */
function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${active
        ? 'border-blue-900 text-blue-900'
        : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

/* ── Instrucciones ──────────────────────────────────────────────────────────── */
function Instrucciones() {
  const pasos = [
    {
      num: 1,
      titulo: 'Configurar la aplicación',
      desc: (
        <>
          Haz clic en el icono de configuración{' '}
          <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-100 text-slate-500 align-middle">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>{' '}
          en la parte superior derecha. Completa los datos de la sección{' '}
          <strong>Clave de API de Anthropic</strong> (obtenida en{' '}
          <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
            className="text-blue-600 hover:underline">console.anthropic.com</a>
          ) y los <strong>Datos institucionales</strong> (nombre de la facultad, carrera, docente, director).
          La clave de API se guarda solo en tu navegador y nunca se envía al servidor para almacenarse.
        </>
      ),
    },
    {
      num: 2,
      titulo: 'Subir la malla curricular (opcional)',
      desc: (
        <>
          Dentro de Configuración, en la sección <strong>Malla curricular</strong>, puedes cargar el PDF
          de la malla de la carrera. Esto permite que el sistema ubique automáticamente la asignatura
          en la malla (semestre, categoría, prerrequisitos, asignaturas que habilita) sin necesidad
          de descripción textual. El PDF debe tener una tabla donde la primera fila corresponde a
          los semestres y las filas siguientes a las materias de cada semestre.
        </>
      ),
    },
    {
      num: 3,
      titulo: 'Obtener el Programa Docente en PDF',
      desc: (
        <>
          Consigue el <strong>Programa Docente</strong> de la asignatura en formato PDF. Este documento
          contiene la información académica oficial: datos de la asignatura (sigla, semestre, carga
          horaria), competencias, elementos de competencia, unidades de aprendizaje, distribución
          horaria y bibliografía. El archivo no debe superar los <strong>20 MB</strong>.
        </>
      ),
    },
    {
      num: 4,
      titulo: 'Cargar el PDF del Programa Docente',
      desc: (
        <>
          Arrastra el PDF a la zona de carga o haz clic sobre ella para seleccionarlo desde tu
          equipo. Una vez seleccionado, verás el nombre del archivo y su tamaño confirmados en
          la zona de carga con fondo verde.
        </>
      ),
    },
    {
      num: 5,
      titulo: 'Generar el Proyecto Formativo',
      desc: (
        <>
          Haz clic en el botón <strong>"Generar Proyecto Formativo"</strong>. La aplicación enviará el
          PDF al servidor, que extraerá el texto y lo procesará con la IA de Claude (Anthropic).
          Este paso puede tardar entre <strong>30 segundos y 2 minutos</strong> dependiendo de la
          extensión del programa docente y la carga de la API. La barra de progreso te indica el estado.
        </>
      ),
    },
    {
      num: 6,
      titulo: 'Descargar el documento Word',
      desc: (
        <>
          Al finalizar el procesamiento, aparecerá el botón <strong>"Descargar .docx"</strong>. Haz clic
          para guardar el Proyecto Formativo completo en formato Word (.docx), siguiendo la{' '}
          <strong>plantilla institucional UAJMS v2</strong>. El documento incluye: Identificación,
          Malla Curricular, Competencias, Ruta Formativa por cada Elemento de Competencia,
          Cronograma y Recursos.
        </>
      ),
    },
    {
      num: 7,
      titulo: 'Revisar y ajustar',
      desc: (
        <>
          El documento generado es una <strong>propuesta base de alta calidad</strong> elaborada a
          partir del Programa Docente oficial. Se recomienda revisar el contenido, verificar los
          datos institucionales, y realizar los ajustes académicos pertinentes antes de presentarlo
          formalmente. La responsabilidad del contenido final recae en el docente.
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-600 leading-relaxed">
        Esta herramienta genera automáticamente el <strong>Proyecto Formativo</strong> institucional
        a partir del Programa Docente de una asignatura, utilizando Inteligencia Artificial.
        Sigue los pasos a continuación:
      </p>

      <ol className="flex flex-col gap-4">
        {pasos.map((p) => (
          <li key={p.num} className="flex gap-4">
            <div className="shrink-0 w-7 h-7 rounded-full bg-blue-900 text-white flex items-center
                            justify-center text-xs font-bold mt-0.5">
              {p.num}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-slate-800">{p.titulo}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3 mt-1">
        <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Importante:</strong> La clave de API de Anthropic tiene un costo de uso asociado.
          Cada generación consume tokens de la API según la extensión del programa docente.
          Consulta el consumo en tu cuenta de Anthropic.
        </p>
      </div>
    </div>
  );
}

/* ── Acerca de ──────────────────────────────────────────────────────────────── */
function AcercaDe() {
  return (
    <div className="flex flex-col gap-6 text-sm text-slate-700 leading-relaxed">

      {/* Revisión y aportes */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-900">Revisión y aportes técnicos</h3>
        <p className="text-slate-600">
          En la revisión y aportes para contar con un software que responda a criterios técnicos
          participaron la <strong>Dirección de la Carrera de Ingeniería Informática</strong>,
          docentes y autoridades Facultativas de la <strong>FIRNT</strong>, un profesional experto de{' '}
          <strong>Secretaría Académica de la UAJMS</strong> y un profesional experto de la{' '}
          <strong>Secretaría Nacional Académica</strong> perteneciente al {' '}
          <strong>Comité Ejecutivo de la Universidad Boliviana CEUB</strong>.
        </p>
      </section>

      {/* Bibliografía base */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-900">Base documental</h3>
        <div className="border border-slate-200 rounded-xl px-4 py-3 flex gap-3">
          <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <div>
            <p className="font-medium text-slate-800">
              Manual para la Elaboración de la Microcurrícula bajo el Enfoque FBC — Proyecto Formativo
            </p>
            <p className="text-slate-500 text-xs mt-1">
              Elaborado por la Secretaría Académica de la Universidad Autónoma Juan Misael Saracho (UAJMS).
            </p>
          </div>
        </div>
      </section>

      {/* Tecnología */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-900">Tecnología utilizada</h3>
        <p className="text-slate-600">
          La aplicación fue desarrollada con tecnología web moderna tanto en el frontend como en el
          backend, integrando capacidades de <strong>Inteligencia Artificial generativa</strong> a
          través de los modelos de lenguaje de última generación de <strong>Anthropic (Claude AI)</strong>,
          lo que permite analizar el Programa Docente y producir un Proyecto Formativo completo,
          estructurado y contextualizado con alta fidelidad a los estándares institucionales de la UAJMS.
        </p>
      </section>

      {/* Desarrollador */}
      <section className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-900">Autor del proyecto</h3>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-4 flex flex-col gap-1">
          <p className="font-semibold text-slate-800 text-base">Ing. Luis Robert Farfán Sivila</p>
          <p className="text-slate-600">
            Docente de la Carrera de <strong>Ingeniería Informática</strong>, Facultad de Ingeniería
            de Recursos Naturales y Tecnología — <strong>FIRNT</strong>, Universidad Autónoma Juan
            Misael Saracho — <strong>UAJMS</strong>, Tarija, Bolivia.
          </p>
        </div>
      </section>

      {/* Nota */}
      <p className="text-xs text-slate-400 border-t border-slate-100 pt-4">
        Herramienta desarrollada para apoyar al cuerpo docente de la UAJMS en la elaboración
        del Proyecto Formativo institucional bajo el enfoque de Formación Basada en Competencias (FBC).
      </p>
    </div>
  );
}
