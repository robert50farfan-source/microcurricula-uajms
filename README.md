# Generador de Proyectos Formativos — UAJMS

Aplicación web full-stack que genera automáticamente un **Proyecto Formativo** en formato `.docx` a partir del PDF de un **programa docente**, siguiendo la plantilla institucional **UAJMS v2** (Universidad Autónoma "Juan Misael Saracho" — Ingeniería Informática).

---

## ¿Qué hace?

1. El docente sube el PDF del programa docente de su asignatura.
2. El backend extrae el texto del PDF con `pdf-parse`.
3. Se llama a **Claude AI** (`claude-sonnet-4-20250514`) con el texto + la plantilla UAJMS v2 + la malla curricular + un ejemplo de referencia.
4. Claude devuelve el proyecto formativo completo en JSON estructurado.
5. Se genera un archivo **Word (.docx)** con todas las secciones: Identificación, Malla Curricular, Competencias, Ruta Formativa, Cronograma y Recursos.
6. El archivo se descarga directamente en el navegador.

---

## Requisitos

- **Node.js** 18 o superior
- **npm** 9 o superior
- **Clave de API de Anthropic** — obtener en [console.anthropic.com](https://console.anthropic.com)

---

## Instalación

### 1. Clonar / descargar el proyecto

```bash
cd proyecto-formativo-generator
```

### 2. Configurar el backend

```bash
cd backend
npm install
cp .env.example .env
```

Edita el archivo `.env` y agrega tu clave de API:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
PORT=3001
```

### 3. Configurar el frontend

```bash
cd ../frontend
npm install
```

---

## Ejecutar la aplicación

Abre **dos terminales** desde la raíz del proyecto.

**Terminal 1 — Backend:**

```bash
cd backend
npm run dev
# → Servidor corriendo en http://localhost:3001
```

**Terminal 2 — Frontend:**

```bash
cd frontend
npm run dev
# → Vite: http://localhost:5173
```

Abre el navegador en **http://localhost:5173**.

---

## Cómo usar

1. Haz clic en la zona de carga (o arrastra el PDF) y selecciona el **programa docente en PDF**.
2. Presiona **"Generar Proyecto Formativo"**.
3. Espera entre 30 y 60 segundos mientras la IA procesa el documento (verás el progreso por etapas).
4. Cuando aparezca el botón verde, haz clic en **"Descargar Proyecto Formativo (.docx)"**.
5. Abre el archivo en Microsoft Word o LibreOffice Writer.

> **Requisito del PDF:** debe ser un PDF con texto seleccionable (no un escaneo como imagen). Tamaño máximo: 10 MB.

---

## Estructura de archivos

```
proyecto-formativo-generator/
│
├── backend/
│   ├── .env.example            ← variables de entorno requeridas
│   ├── package.json
│   ├── server.js               ← Express + CORS + manejo global de errores
│   │
│   ├── routes/
│   │   └── generate.js         ← POST /api/generate (pipeline completo)
│   │
│   ├── services/
│   │   ├── pdfExtractor.js     ← extrae y normaliza texto con pdf-parse
│   │   ├── claudeService.js    ← llama a la API de Claude, valida JSON
│   │   └── docxGenerator.js    ← genera el .docx con la librería docx
│   │
│   └── data/
│       ├── plantilla.js        ← estructura oficial Proyecto Formativo UAJMS v2
│       ├── malla.js            ← malla curricular de Ingeniería Informática
│       └── ejemplo.js          ← ejemplo completo (Arquitectura de Computadores I)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js          ← proxy /api → localhost:3001
│   ├── tailwind.config.js
│   ├── index.html
│   │
│   └── src/
│       ├── main.jsx
│       ├── App.jsx             ← estado global + StepIndicator
│       └── components/
│           ├── Uploader.jsx        ← drag & drop con validación
│           ├── ProgressBar.jsx     ← progreso por etapas con delays
│           └── DownloadButton.jsx  ← descarga del .docx generado
│
└── README.md
```

---

## Variables de entorno

El backend requiere un archivo `.env` en la carpeta `backend/`:

| Variable            | Descripción                                      | Requerida |
|---------------------|--------------------------------------------------|-----------|
| `ANTHROPIC_API_KEY` | Clave de la API de Anthropic (Claude)            | **Sí**    |
| `PORT`              | Puerto del servidor Express (por defecto: 3001)  | No        |

**Nunca subas el archivo `.env` a un repositorio público.** Está incluido en `.gitignore`.

---

## Stack tecnológico

| Capa      | Tecnología                                                  |
|-----------|-------------------------------------------------------------|
| Backend   | Node.js · Express · multer · pdf-parse · docx              |
| IA        | Anthropic SDK · `claude-sonnet-4-20250514`                 |
| Frontend  | React 18 · Vite · TailwindCSS                              |

---

## Notas

- El documento generado sigue la plantilla **Proyecto Formativo UAJMS v2** con las secciones: Identificación, Malla Curricular, Competencias (tabla de EC con niveles de logro), Ruta Formativa (Saber Conocer / Hacer / Ser + actividades + cronograma) y Recursos.
- La malla curricular en el documento resalta visualmente la asignatura actual con un borde rojo y usa los colores institucionales por categoría.
- La calidad del documento generado depende directamente de la completitud del programa docente en PDF.
