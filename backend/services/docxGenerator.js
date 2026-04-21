'use strict';

const fs = require('fs');
const path = require('path');

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ShadingType, NumberFormat, VerticalAlign,
  PageOrientation,
} = require('docx');


const CONFIG_PATH = path.join(__dirname, '../config/settings.json');
function getConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8')); }
  catch { return { nombreDocente: '', nombreDirector: '', numIndicadores: 3, numInstrumentos: 3 }; }
}

// ─── Page geometry (carta / letter landscape, 2 cm margins) ──────────────────
// NOTA: docx espera width=lado corto, height=lado largo (portrait dims).
// La propiedad orientation:LANDSCAPE hace la rotación en Word.
const PAGE_W = 12240;          // carta portrait width  = 8.5" × 1440 twips  (lado corto)
const PAGE_H = 15840;          // carta portrait height = 11"  × 1440 twips  (lado largo)
const MARGIN = 1134;           // 2 cm → 1134 DXA  (1 cm ≈ 567 twips)
const CW = PAGE_H - 2 * MARGIN; // usable content width en landscape = 13572 DXA

// ─── Typography ───────────────────────────────────────────────────────────────
const F = 'Arial';
const SZ = { xs: 16, sm: 18, md: 22, lg: 24 }; // half-points

// ─── Palette ──────────────────────────────────────────────────────────────────
const CLR = {
  // Malla categories — escala de grises para impresión económica
  verde: 'F2F2F2',   // gris muy claro
  azul: 'D9D9D9',   // gris claro
  naranja: 'BFBFBF',   // gris medio-claro
  rojo: 'A5A5A5',   // gris medio
  morado: '7F7F7F',   // gris medio-oscuro
  // UI
  navy: '1F4E79',
  secBg: '2E74B5',
  tblHdr: 'BDD7EE',
  ecHdr: 'D6E4F0',
  lgray: 'F2F2F2',
  dgray: 'D9D9D9',
  cronAct: '4472C4',
  white: 'FFFFFF',
};

const CAT_COLOR = {
  verde: CLR.verde, azul: CLR.azul, naranja: CLR.naranja,
  rojo: CLR.rojo, morado: CLR.morado,
};

// ─── Numbering config (never raw unicode bullets in TextRun) ──────────────────
// Genera la config de numeración. Se crean referencias independientes
// por cada EC (num-list-ec-0, num-list-ec-1 …) para que el contador
// de contenidos reinicie en cada unidad temática.
function buildNumbering(ecs = []) {
  const ecCount = Array.isArray(ecs) ? ecs.length : ecs; // acepta array o número (retrocompat)
  const numListLevel = {
    level: 0, format: NumberFormat.DECIMAL, text: '%1.',
    alignment: AlignmentType.LEFT,
    style: {
      paragraph: { indent: { left: 400, hanging: 200 } },
      run: { font: F, size: SZ.sm },
    },
  };

  const ecConfigs = Array.from({ length: ecCount }, (_, i) => [
    { reference: `num-list-ec-${i}`, levels: [{ ...numListLevel }] },
    { reference: `num-ind-ec-${i}`, levels: [{ ...numListLevel }] },
    { reference: `num-ins-ec-${i}`, levels: [{ ...numListLevel }] },
  ]).flat();

  // Referencias por unidad dentro de cada EC (num-list-ec-0-unit-0, …)
  // para que la numeración de contenidos reinicie en 1 en cada unidad temática
  const unitConfigs = Array.isArray(ecs) ? ecs.flatMap((ec, ecIdx) => {
    const units = Array.isArray(ec.unidadesAprendizaje) && ec.unidadesAprendizaje.length > 0
      ? ec.unidadesAprendizaje
      : [{}]; // al menos 1 unidad por EC
    return units.map((_, unitIdx) => ({
      reference: `num-list-ec-${ecIdx}-unit-${unitIdx}`,
      levels: [{ ...numListLevel }],
    }));
  }) : [];

  return {
    config: [
      { reference: 'num-list', levels: [{ ...numListLevel }] },
      { reference: 'bib-list', levels: [{ ...numListLevel }] },
      {
        reference: 'dash-list',
        levels: [{
          level: 0, format: NumberFormat.BULLET, text: '-',
          alignment: AlignmentType.LEFT,
          style: {
            paragraph: { indent: { left: 360, hanging: 180 } },
            run: { font: F, size: SZ.sm },
          },
        }],
      },
      ...ecConfigs,
      ...unitConfigs,
    ],
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// PRIMITIVE HELPERS
// ═════════════════════════════════════════════════════════════════════════════

/** Build a TextRun */
function run(text, { bold = false, italic = false, size = SZ.md, color } = {}) {
  return new TextRun({ text: String(text ?? ''), font: F, size, bold, italics: italic, color });
}

/** Build a Paragraph */
function p(text, { bold = false, size = SZ.md, align = AlignmentType.LEFT, color, after = 80, num } = {}) {
  return new Paragraph({
    alignment: align,
    spacing: { after },
    numbering: num ? { reference: num, level: 0 } : undefined,
    children: [run(text, { bold, size, color })],
  });
}

/** Empty spacer paragraph */
const sp = () => new Paragraph({ children: [], spacing: { after: 0, line: 200 } });

/** Shading — always ShadingType.CLEAR + fill */
const shade = (fill) => ({ type: ShadingType.CLEAR, color: 'auto', fill });

/** Single border descriptor */
const brd = (color = '000000', size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const noBrd = () => ({ style: BorderStyle.NIL, size: 0, color: 'auto' });
const allBrd = (color = '000000', size = 4) => {
  const b = brd(color, size);
  return { top: b, bottom: b, left: b, right: b };
};

/**
 * Build a TableCell.
 * Rules: always specify width with WidthType.DXA, always ShadingType.CLEAR for bg.
 */
function mkCell(children, {
  w,
  bg,
  bold = false,
  size = SZ.sm,
  color: textColor,
  align = AlignmentType.LEFT,
  va = VerticalAlign.CENTER,
  colspan,
  rowspan,
  borders,
} = {}) {
  // Normalise children → array of Paragraph
  const toP = (c) => {
    if (c instanceof Paragraph) return c;
    return new Paragraph({
      alignment: align,
      spacing: { after: 40 },
      children: [run(String(c ?? ''), { bold, size, color: textColor })],
    });
  };
  const paragraphs = Array.isArray(children)
    ? children.map(toP)
    : [toP(children)];

  return new TableCell({
    children: paragraphs,
    width: w != null ? { size: w, type: WidthType.DXA } : undefined,
    shading: bg ? shade(bg) : undefined,
    columnSpan: colspan,
    rowSpan: rowspan,
    verticalAlign: va,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    borders: borders ?? allBrd(),
  });
}

// ─── Section / sub-title paragraphs ──────────────────────────────────────────

const secTitle = (num, text) => [
  sp(),
  new Paragraph({
    spacing: { before: 100, after: 80 },
    shading: shade(CLR.secBg),
    indent: { left: 80 },
    children: [run(num ? `${num}. ${text}` : text, { bold: true, size: SZ.lg, color: CLR.white })],
  }),
];

const subTitle = (text) => new Paragraph({
  spacing: { before: 100, after: 60 },
  children: [run(text, { bold: true, size: SZ.md, color: CLR.navy })],
});

// ─── Text → list of Paragraphs (split on ; or \n) ────────────────────────────
function toList(text, num = 'dash-list') {
  if (!text) return [p('—', { size: SZ.sm })];
  return String(text)
    .split(/;|\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => new Paragraph({
      numbering: { reference: num, level: 0 },
      children: [run(s, { size: SZ.sm })],
      spacing: { after: 30 },
    }));
}

/** Divide texto por ; o \n, toma los primeros `max` ítems y los reúne con \n */
function trimList(text, max) {
  if (!text) return '';
  const items = String(text).split(/;|\n/).map((s) => s.trim()).filter(Boolean);
  return items.slice(0, max).join('\n');
}

// ─── Checkbox row (☐ / ☑ — these are checkbox symbols, not bullet points) ────
function checkboxRow(label, checked = false) {
  return new Paragraph({
    spacing: { after: 40 },
    children: [run(`${checked ? '\u2611' : '\u2610'}  ${label}`, { size: SZ.sm })],
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// SECTION BUILDERS
// ═════════════════════════════════════════════════════════════════════════════

// ── ENCABEZADO ────────────────────────────────────────────────────────────────
function buildHeader() {
  const cfg = getConfig();
  const facultad = (cfg.nombreFacultad ?? 'FACULTAD DE INGENIERIA EN RECURSOS NATURALES Y TECNOLOGÍA').toUpperCase();
  const carrera  = (cfg.nombreCarrera  ?? 'INGENIERÍA INFORMÁTICA').toUpperCase();

  const c1 = Math.round(CW * 0.70);
  const c2 = CW - c1;
  return [
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [c1, c2],
      rows: [new TableRow({
        children: [
          mkCell([
            p('UNIVERSIDAD AUTÓNOMA "JUAN MISAEL SARACHO"', { bold: true, align: AlignmentType.CENTER, size: SZ.md, color: CLR.white, after: 30 }),
            p(facultad, { bold: true, align: AlignmentType.CENTER, size: SZ.sm, color: CLR.white, after: 30 }),
            p(`CARRERA DE ${carrera}`, { bold: true, align: AlignmentType.CENTER, size: SZ.sm, color: CLR.white, after: 0 }),
          ], { w: c1, bg: CLR.navy }),
          mkCell([
            p('PROYECTO FORMATIVO', { bold: true, align: AlignmentType.CENTER, size: SZ.lg, color: CLR.white, after: 40 }),
            p('Versión: V2', { align: AlignmentType.CENTER, size: SZ.sm, color: CLR.white, after: 0 }),
          ], { w: c2, bg: CLR.secBg }),
        ]
      })],
    }),
    sp(),
  ];
}

// ── I. IDENTIFICACIÓN ─────────────────────────────────────────────────────────
function buildIdentificacion(data) {
  const id  = data.identificacion ?? {};
  const ch  = id.cargaHoraria ?? {};
  const cfg = getConfig();

  // ── Grilla base de 6 columnas iguales (MCM de 3 y 2)
  // Fila 1: 3 celdas × 2 cols cada una  → 1/3 cada una  ✓
  // Fila 2: 2 celdas × 3 cols cada una  → 1/2 cada una  ✓
  // Fila 3-4: SIGLA=1col | CARGA HORARIA=3cols | HORAS=2cols
  const Wc  = Math.floor(CW / 6);
  const Wc6 = CW - 5 * Wc;           // última columna absorbe el redondeo
  const colW = [Wc, Wc, Wc, Wc, Wc, Wc6];

  // Celda con etiqueta en negrita + valor normal en la misma celda
  const lv = (label, val, opts = {}) => mkCell(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        run(`${label}:  `, { bold: true, size: SZ.sm }),
        run(String(val ?? ''), { size: SZ.sm }),
      ],
    }),
    { va: VerticalAlign.TOP, ...opts },
  );

  // Strings compactos para carga horaria
  const cargaStr  = `${ch.totalSemestre ?? '—'} Hrs/Semestre (${ch.totalSemana ?? '—'} Hrs/Semana)`;
  const horasDoc  = `${id.horasDocente ?? '—'} Hrs/Semestre (${ch.totalSemana ?? '—'} Hrs/Semana)`;
  const horasAuto = String(id.horasAutonomo ?? '—');

  // Datos del docente: extrae Claude del PDF, fallback a configuración
  const docenteNombre = String(id.nombreDocente || cfg.nombreDocente || '').trim();
  const docenteEmail  = String(id.emailDocente  || cfg.emailDocente  || '').trim();
  const docenteCel    = String(id.celDocente    || cfg.celDocente    || '').trim();

  const docenteParas = [
    new Paragraph({
      spacing: { after: docenteEmail || docenteCel ? 30 : 0 },
      children: [
        run('10. NOMBRE DE DOCENTE:  ', { bold: true, size: SZ.sm }),
        run(docenteNombre || 'A determinar', { size: SZ.sm }),
      ],
    }),
    ...(docenteEmail ? [new Paragraph({
      spacing: { after: docenteCel ? 30 : 0 },
      children: [
        run('E-MAIL:  ', { bold: true, size: SZ.sm }),
        run(docenteEmail, { size: SZ.sm }),
      ],
    })] : []),
    ...(docenteCel ? [new Paragraph({
      spacing: { after: 0 },
      children: [
        run('TELF.:  ', { bold: true, size: SZ.sm }),
        run(docenteCel, { size: SZ.sm }),
      ],
    })] : []),
  ];

  const mainTable = new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: colW,
    rows: [
      // Fila 1: tres tercios iguales (2 cols cada una)
      new TableRow({ children: [
        lv('1. FACULTAD',     cfg.nombreFacultad ?? id.facultad  ?? '', { w: 2 * Wc,        colspan: 2 }),
        lv('2. CARRERA',      cfg.nombreCarrera  ?? id.carrera   ?? '', { w: 2 * Wc,        colspan: 2 }),
        lv('3. SEMESTRE/AÑO', id.semestre  ?? '', { w: Wc + Wc6,      colspan: 2 }),
      ]}),
      // Fila 2: dos mitades iguales (3 cols cada una)
      new TableRow({ children: [
        lv('4. ASIGNATURA',    id.asignatura    ?? '', { w: 3 * Wc,   colspan: 3 }),
        lv('5. PRERREQUISITO', id.prerrequisito ?? 'Ninguno', { w: 2 * Wc + Wc6, colspan: 3 }),
      ]}),
      // Fila 3: SIGLA(1col,rowspan=2) | CARGA HORARIA(3cols,rowspan=2) | HORAS DOCENTE(2cols)
      new TableRow({ children: [
        lv('6. SIGLA',                               id.sigla ?? '', { w: Wc,          rowspan: 2 }),
        mkCell([
          new Paragraph({
            spacing: { after: 30 },
            children: [
              run('7. CARGA HORARIA SEM/AÑO:  ', { bold: true, size: SZ.sm }),
              run(cargaStr, { size: SZ.sm }),
            ],
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              run('7.1. CRÉDITOS:  ', { bold: true, size: SZ.sm }),
              run(String(ch.creditos ?? ''), { size: SZ.sm }),
            ],
          }),
        ], { w: 3 * Wc, colspan: 3, rowspan: 2, va: VerticalAlign.TOP }),
        lv('8. HORAS DE APRENDIZAJE CON EL DOCENTE', horasDoc,       { w: Wc + Wc6,    colspan: 2 }),
      ]}),
      // Fila 4: cols 1-4 cubiertas por rowspan | HORAS AUTÓNOMO(2cols)
      new TableRow({ children: [
        lv('9. HORAS DE APRENDIZAJE AUTÓNOMO DEL ESTUDIANTE', horasAuto, { w: Wc + Wc6, colspan: 2 }),
      ]}),
      // Fila 5: NOMBRE DOCENTE + EMAIL + TELF (ancho completo, 6 cols)
      new TableRow({ children: [
        mkCell(docenteParas, { w: CW, colspan: 6, va: VerticalAlign.TOP }),
      ]}),
    ],
  });

  const justRows = id.justificacion ? [
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [CW],
      rows: [
        new TableRow({ children: [mkCell('11. Justificación de la Asignatura', { w: CW, bg: CLR.tblHdr, bold: true })] }),
        new TableRow({
          children: [mkCell(
            new Paragraph({ children: [run(id.justificacion, { size: SZ.sm })], spacing: { after: 60 } }),
            { w: CW },
          )]
        }),
      ],
    }),
  ] : [];

  return [...secTitle('I', 'IDENTIFICACIÓN'), mainTable, ...(justRows.length ? [sp(), ...justRows] : []), sp()];
}

// ── MALLA CURRICULAR ──────────────────────────────────────────────────────────
function buildMallaCurricular(data) {
  const malla = data._mallaData ?? null;

  // Sin malla: descripción textual basada en el programa docente
  if (!malla) {
    const ubicacion = data.ubicacionTextual
      ?? data.mallaInfo
        ? [
            data.mallaInfo?.semestre ? `Semestre: ${data.mallaInfo.semestre}.` : '',
            Array.isArray(data.mallaInfo?.asignaturasPrevias) && data.mallaInfo.asignaturasPrevias.length
              ? `Prerrequisitos: ${data.mallaInfo.asignaturasPrevias.join(', ')}.`
              : '',
          ].filter(Boolean).join(' ') || 'Ver programa docente.'
        : 'Ver programa docente.';
    return [
      new Paragraph({ pageBreakBefore: true, children: [] }),
      ...secTitle('12', 'UBICACIÓN EN LA MALLA CURRICULAR'),
      p(ubicacion, { size: SZ.sm, after: 120 }),
      sp(),
    ];
  }

  // Normaliza un nombre de asignatura eliminando el prefijo de sigla (ej: "IHQ-133 Química I" → "química i")
  const stripSigla = (str) => str.trim().toLowerCase().replace(/^[a-záéíóúñA-Z]{2,4}-\d{3}\s+/i, '');
  const currentName    = (data.identificacion?.asignatura ?? '').trim().toLowerCase();
  const currentNormalized = stripSigla(currentName);
  const currentSigla   = (data.identificacion?.sigla ?? '').trim().toLowerCase();
  const numSem = malla.semestres.length;
  const colW = Math.floor(CW / numSem);
  const colWLast = CW - colW * (numSem - 1);
  const colWidths = [...Array(numSem - 1).fill(colW), colWLast];

  const ORDS = ['1er', '2do', '3er', '4to', '5to', '6to', '7mo', '8vo', '9no', '10mo'];

  const headerRow = new TableRow({
    children: malla.semestres.map((_, i) =>
      mkCell(`${ORDS[i]} Sem`, {
        w: colWidths[i], bg: CLR.navy, bold: true,
        color: CLR.white, align: AlignmentType.CENTER,
      }),
    ),
  });

  const maxRows = Math.max(...malla.semestres.map((s) => s.asignaturas.length));
  const dataRows = Array.from({ length: maxRows }, (_, r) =>
    new TableRow({
      children: malla.semestres.map((s, si) => {
        const asig = s.asignaturas[r];
        if (!asig) return mkCell('', { w: colWidths[si] });
        const asigNombre = asig.nombre.trim().toLowerCase();
        const asigNormalized = stripSigla(asigNombre);
        // Coincide si: nombre exacto, nombre exacto sin sigla, o la sigla es igual
        // NO se usa "includes" para evitar falsos positivos (ej: "Cálculo I" ⊂ "Cálculo II")
        const isCurrent =
          asigNombre === currentName ||
          asigNormalized === currentNormalized ||
          (currentSigla.length > 0 && asigNombre.startsWith(currentSigla));
        const bg = CAT_COLOR[asig.categoria] ?? CLR.lgray;
        return mkCell(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 20, before: 20 },
            children: [run(asig.nombre, { size: SZ.xs, color: '000000', bold: true })],
          }),
          {
            w: colWidths[si],
            bg,
            borders: isCurrent ? allBrd('FF0000', 18) : undefined,
          },
        );
      }),
    }),
  );

  const mallaTable = new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...dataRows],
  });

  // Legend
  const legW1 = 280, legW2 = CW - legW1;
  const legendTable = new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [legW1, legW2],
    rows: Object.entries(malla.categorias).map(([key, label]) =>
      new TableRow({
        children: [
          mkCell('', { w: legW1, bg: CAT_COLOR[key] ?? CLR.lgray }),
          mkCell(label, { w: legW2 }),
        ]
      }),
    ),
  });

  return [
    new Paragraph({ pageBreakBefore: true, children: [] }),
    ...secTitle('12', 'UBICACIÓN EN LA MALLA CURRICULAR'),
    mallaTable, sp(),
    subTitle('Leyenda de categorías:'), legendTable, sp(),
  ];
}

// ── II. COMPETENCIAS ──────────────────────────────────────────────────────────
function buildCompetencias(data) {
  const ecs = data.elementosDeCompetencia ?? [];
  const cfg = getConfig();
  const maxInd = Number(cfg.numIndicadores ?? 3);
  const maxIns = Number(cfg.numInstrumentos ?? 2);

  // Competencia global + asignatura
  const W1 = Math.round(CW * 0.30), W2 = CW - W1;
  const compTable = new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [W1, W2],
    rows: [
      new TableRow({
        children: [
          mkCell('13. Competencia Global de la Carrera', { w: W1, bg: CLR.tblHdr, bold: true }),
          mkCell(data.competenciaGlobal ?? '', { w: W2 }),
        ]
      }),
      new TableRow({
        children: [
          mkCell('14. Competencia de la Asignatura', { w: W1, bg: CLR.tblHdr, bold: true }),
          mkCell(data.competenciaAsignatura ?? '', { w: W2 }),
        ]
      }),
    ],
  });

  // ── EC table: 7 columns, dual-row header ──────────────────────────────────
  // Elemento | Evidencias | Nivel | Indicadores | Instrumentos | Pond | Dist. CH
  const RAW = [1100, 1300, 1700, 1050, 900, 480, 700];
  const rawSum = RAW.reduce((a, b) => a + b, 0);
  const colWidths = RAW.map((r) => Math.round((r / rawSum) * CW));
  colWidths[colWidths.length - 1] += CW - colWidths.reduce((a, b) => a + b, 0);
  const [wE, wEv, wN, wInd, wIns, wPo, wDH] = colWidths;

  // Header row 1 — merged groups
  const ecH1 = new TableRow({
    children: [
      mkCell('15. Elemento de\nCompetencia', { w: wE, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, rowspan: 2, size: SZ.xs }),
      mkCell('16. Evidencias', { w: wEv, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, rowspan: 2, size: SZ.xs }),
      mkCell('17. Nivel de\nLogro', { w: wN, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, rowspan: 2, size: SZ.xs }),
      mkCell('18. Evaluación', { w: wInd + wIns + wPo, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, colspan: 3, size: SZ.xs }),
      mkCell('19. Distribución\nde Carga\nHoraria', { w: wDH, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, rowspan: 2, size: SZ.xs }),
    ]
  });

  // Header row 2 — sub-columns de Evaluación únicamente
  const ecH2 = new TableRow({
    children: [
      mkCell('18.1\nIndicadores', { w: wInd, bg: CLR.tblHdr, bold: true, align: AlignmentType.CENTER, size: SZ.xs }),
      mkCell('18.2\nInstrumentos', { w: wIns, bg: CLR.tblHdr, bold: true, align: AlignmentType.CENTER, size: SZ.xs }),
      mkCell('18.3\nPond.(%)', { w: wPo, bg: CLR.tblHdr, bold: true, align: AlignmentType.CENTER, size: SZ.xs }),
    ]
  });

  const ecDataRows = ecs.map((ec, ecIdx) => {
    const dh = ec.distribucionHoraria ?? {};
    const evid = Array.isArray(ec.evidencias) ? ec.evidencias : [ec.evidencias ?? ''];
    const evidPs = evid.map((e) => new Paragraph({
      numbering: { reference: 'dash-list', level: 0 },
      children: [run(String(e), { size: SZ.xs })],
      spacing: { after: 30 },
    }));
    // Cada nivel muestra su porcentaje fijo si fue alcanzado, o se omite si está vacío.
    // El último nivel visible no lleva espaciado inferior.
    const nivelesConfig = [
      { label: 'Inicial',     valor: ec.nivelInicial     },
      { label: 'Básico',      valor: ec.nivelBasico      },
      { label: 'Autónomo',    valor: ec.nivelAutonomo    },
      { label: 'Estratégico', valor: ec.nivelEstrategico },
    ].filter(({ valor }) => valor !== '' && valor != null);
    const nivelPs = nivelesConfig.map(({ label, valor }, i) =>
      p(`${label}: ${valor}%`, { size: SZ.xs, after: i < nivelesConfig.length - 1 ? 20 : 0 }),
    );

    return new TableRow({
      children: [
        mkCell([
          new Paragraph({ children: [run(`EC${ecIdx + 1}`, { bold: true, size: SZ.xs })], spacing: { after: 30 } }),
          new Paragraph({ children: [run(ec.descripcion ?? '', { size: SZ.xs })], spacing: { after: 0 } }),
        ], { w: wE, va: VerticalAlign.TOP }),
        mkCell(evidPs, { w: wEv, va: VerticalAlign.TOP }),
        mkCell(nivelPs, { w: wN, va: VerticalAlign.TOP }),
        mkCell(toList(trimList(ec.indicadores, maxInd), `num-ind-ec-${ecIdx}`), { w: wInd, va: VerticalAlign.TOP }),
        mkCell(toList(trimList((ec.instrumentos ?? '').replace(/,\s*/g, '\n'), maxIns), `num-ins-ec-${ecIdx}`), { w: wIns, va: VerticalAlign.TOP }),
        mkCell(String(ec.ponderacion ?? ''), { w: wPo, size: SZ.xs, align: AlignmentType.CENTER }),
        mkCell(String(dh.teoria ?? ''), { w: wDH, size: SZ.xs, align: AlignmentType.CENTER }),
      ]
    });
  });

  const ecTable = new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [ecH1, ecH2, ...ecDataRows],
  });

  return [
    new Paragraph({ pageBreakBefore: true, children: [] }),
    ...secTitle('II', 'COMPETENCIAS'),
    compTable, sp(),
    subTitle('Elementos de Competencia:'),
    ecTable, sp(),
  ];
}

// ── III. RUTA FORMATIVA ───────────────────────────────────────────────────────
const INV_OPTS = ['Investigación documental', 'Estudio de caso', 'Ensayo', 'Proyecto', 'Resolución de problemas', 'Monografía'];
const SOC_OPTS = ['Feria exposición', 'Trabajo comunitario', 'Campaña de sensibilización', 'Trabajo con instituciones'];

/**
 * Construye párrafos de checkbox para las actividades de investigación.
 * Marca las opciones seleccionadas y agrega "Otro" con descripción si aplica.
 * @param {Object|string} actInv - Objeto {tipos:[], otro:""} o texto plano (legacy)
 */
function buildInvCheckboxes(actInv) {
  // Compatibilidad con respuestas legacy (texto plano)
  if (!actInv || typeof actInv === 'string') {
    const texto = actInv || '—';
    return INV_OPTS.map((opt) => checkboxRow(opt, false)).concat(
      [checkboxRow(`Otro (especificar): ${texto}`, false)],
    );
  }

  const seleccionados = (actInv.tipos ?? []).map((t) => String(t).trim());
  const otro = (actInv.otro ?? '').trim();

  const rows = INV_OPTS.map((opt) =>
    checkboxRow(opt, seleccionados.some((s) => s.toLowerCase() === opt.toLowerCase())),
  );

  const otroMarcado = otro.length > 0 &&
    !seleccionados.some((s) => INV_OPTS.some((o) => o.toLowerCase() === s.toLowerCase()) === false && s);
  rows.push(checkboxRow(
    otro ? `Otro (especificar): ${otro}` : 'Otro (especificar): ___________________________',
    otroMarcado || (otro.length > 0),
  ));

  return rows;
}

/**
 * Construye párrafos de checkbox para las actividades de interacción social.
 */
function buildSocCheckboxes(actSoc) {
  if (!actSoc || typeof actSoc === 'string') {
    const texto = actSoc || '—';
    return SOC_OPTS.map((opt) => checkboxRow(opt, false)).concat(
      [checkboxRow(`Otro (especificar): ${texto}`, false)],
    );
  }

  const seleccionados = (actSoc.tipos ?? []).map((t) => String(t).trim());
  const otro = (actSoc.otro ?? '').trim();

  const rows = SOC_OPTS.map((opt) =>
    checkboxRow(opt, seleccionados.some((s) => s.toLowerCase() === opt.toLowerCase())),
  );

  rows.push(checkboxRow(
    otro ? `Otro (especificar): ${otro}` : 'Otro (especificar): ___________________________',
    otro.length > 0,
  ));

  return rows;
}

function buildRutaFormativa(data) {
  const ecs = data.elementosDeCompetencia ?? [];
  const blocks = [...secTitle('III', 'RUTA FORMATIVA')];

  ecs.forEach((ec, idx) => {
    const code = `EC${idx + 1}`;

    // EC header: título en celda superior, descripción en celda inferior
    blocks.push(new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [CW],
      rows: [
        new TableRow({
          children: [
            mkCell(`20.${idx + 1} ELEMENTO DE COMPETENCIA (${code})`, { w: CW, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER }),
          ],
        }),
        new TableRow({
          children: [
            mkCell(ec.descripcion ?? '', { w: CW, bg: CLR.ecHdr }),
          ],
        }),
      ],
    }));

    // Tabla unificada con 6 columnas base (LCM de 2 y 3):
    //   Saber (3 × colspan=2 → 1/3 c/u) | Unidad/Contenido (2 × colspan=3 → 1/2 c/u)
    //   Actividades (colspan=2 izq. + colspan=4 der. → 1/3 y 2/3)
    const c6 = Math.floor(CW / 6);                 // unidad base (CW/6)
    const c6Last = CW - c6 * 5;                        // última columna absorbe el resto
    const cThird = c6 * 2;                             // 1/3 del ancho total
    const cThirdR = c6 + c6Last;                        // 1/3 del ancho (último par)
    const cHalf = c6 * 3;                             // 1/2 del ancho total (Unidad y Contenido)
    const cHalfR = c6 * 2 + c6Last;                   // 1/2 del ancho total (segundo par de cols)
    // Normalizar a formato multi-unidad: [{nombre, contenido[]}]
    // Soporta tanto el nuevo campo "unidadesAprendizaje" como el legado "unidadAprendizaje"+"contenido"
    let unidades;
    if (Array.isArray(ec.unidadesAprendizaje) && ec.unidadesAprendizaje.length > 0) {
      unidades = ec.unidadesAprendizaje;
    } else {
      const contenidoOld = Array.isArray(ec.contenido) ? ec.contenido : [String(ec.contenido ?? '')];
      unidades = [{ nombre: ec.unidadAprendizaje ?? '', contenido: contenidoOld }];
    }

    // Celda "Unidad de Aprendizaje": una línea por unidad
    const unidadParrafos = unidades.map((u, ui) => new Paragraph({
      children: [run(u.nombre ?? '', { bold: unidades.length > 1, size: SZ.sm })],
      spacing: { after: ui < unidades.length - 1 ? 80 : 30 },
    }));

    // Celda "Contenido": si hay varias unidades, encabezado en negrita antes de cada grupo
    const contenidoParrafos = [];
    unidades.forEach((u, ui) => {
      if (unidades.length > 1) {
        contenidoParrafos.push(new Paragraph({
          children: [run(u.nombre ?? '', { bold: true, size: SZ.sm })],
          spacing: { after: 20 },
        }));
      }
      // Usar referencia por unidad para que la numeración reinicie en 1 en cada unidad
      const numRef = unidades.length > 1
        ? `num-list-ec-${idx}-unit-${ui}`
        : `num-list-ec-${idx}`;
      const items = Array.isArray(u.contenido) ? u.contenido : [String(u.contenido ?? '')];
      items.forEach((item) => {
        contenidoParrafos.push(new Paragraph({
          numbering: { reference: numRef, level: 0 },
          children: [run(item, { size: SZ.sm })],
          spacing: { after: 30 },
        }));
      });
      if (ui < unidades.length - 1) {
        contenidoParrafos.push(new Paragraph({ children: [], spacing: { after: 50 } }));
      }
    });
    const actDocParrafos = [
      new Paragraph({ children: [run('Teóricas:', { bold: true, size: SZ.sm })], spacing: { after: 20 } }),
      new Paragraph({ children: [run(ec.actividadesTeoricas ?? '—', { size: SZ.sm })], spacing: { after: 40 } }),
      new Paragraph({ children: [run('Prácticas:', { bold: true, size: SZ.sm })], spacing: { after: 20 } }),
      new Paragraph({ children: [run(ec.actividadesPracticas ?? '—', { size: SZ.sm })], spacing: { after: 0 } }),
    ];
    blocks.push(new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [c6, c6, c6, c6, c6, c6Last],
      rows: [
        // Saber Conocer | Saber Hacer | Saber Ser  (colspan=2 cada una → 1/3 c/u)
        new TableRow({
          children: [
            mkCell('Saber Conocer', { w: cThird, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, colspan: 2 }),
            mkCell('Saber Hacer', { w: cThird, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, colspan: 2 }),
            mkCell('Saber Ser', { w: cThirdR, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, colspan: 2 }),
          ],
        }),
        new TableRow({
          children: [
            mkCell(toList(ec.saberConocer), { w: cThird, va: VerticalAlign.TOP, colspan: 2 }),
            mkCell(toList(ec.saberHacer), { w: cThird, va: VerticalAlign.TOP, colspan: 2 }),
            mkCell(toList(ec.saberSer), { w: cThirdR, va: VerticalAlign.TOP, colspan: 2 }),
          ],
        }),
        // Unidad de Aprendizaje | Contenido  (colspan=2 → 1/3 | colspan=4 → 2/3)
        new TableRow({
          children: [
            mkCell('Unidad de Aprendizaje', { w: cThird, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, colspan: 2 }),
            mkCell('Contenido', { w: c6 * 4 + c6Last, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, colspan: 4 }),
          ],
        }),
        new TableRow({
          children: [
            mkCell(unidadParrafos, { w: cThird, va: VerticalAlign.TOP, colspan: 2 }),
            mkCell(contenidoParrafos, { w: c6 * 4 + c6Last, va: VerticalAlign.TOP, colspan: 4 }),
          ],
        }),
        // Actividades Didácticas | Actividades Autónomas  (colspan=3 | colspan=3 → 50% c/u)
        new TableRow({
          children: [
            mkCell('Actividades Didácticas con el Docente', { w: cHalf, bg: CLR.tblHdr, bold: true, align: AlignmentType.CENTER, colspan: 3 }),
            mkCell('Actividades Autónomas del Estudiante', { w: cHalfR, bg: CLR.tblHdr, bold: true, align: AlignmentType.CENTER, colspan: 3 }),
          ],
        }),
        new TableRow({
          children: [
            mkCell(actDocParrafos, { w: cHalf, va: VerticalAlign.TOP, colspan: 3 }),
            mkCell(ec.actividadesAutonomas ?? '—', { w: cHalfR, va: VerticalAlign.TOP, colspan: 3 }),
          ],
        }),
        // Investigación | Interacción Social  (colspan=3 | colspan=3 → 50% c/u)
        new TableRow({
          children: [
            mkCell('Actividades Relacionadas con la Investigación', { w: cHalf, bg: CLR.tblHdr, bold: true, align: AlignmentType.CENTER, colspan: 3 }),
            mkCell('Actividades Relacionadas con la Interacción Social', { w: cHalfR, bg: CLR.tblHdr, bold: true, align: AlignmentType.CENTER, colspan: 3 }),
          ],
        }),
        new TableRow({
          children: [
            mkCell(buildInvCheckboxes(ec.actividadesInvestigacion), { w: cHalf, va: VerticalAlign.TOP, colspan: 3 }),
            mkCell(buildSocCheckboxes(ec.actividadesInteraccionSocial), { w: cHalfR, va: VerticalAlign.TOP, colspan: 3 }),
          ],
        }),
      ],
    }));
    blocks.push(sp());

  });

  return blocks;
}

// ── CRONOGRAMA ────────────────────────────────────────────────────────────────
function buildCronograma(data) {
  const cron = data.cronograma ?? [];
  const nSem = Number(data.identificacion?.cargaHoraria?.totalSemanas ?? 18);

  // Group cronograma entries by EC, accumulate weeks and hours
  const ecMap = {};
  cron.forEach((row) => {
    const ec = String(row.elemento ?? 'EC?');
    if (!ecMap[ec]) ecMap[ec] = { semanas: new Set(), horas: 0, desc: ec };
    ecMap[ec].semanas.add(Number(row.semana));
    ecMap[ec].horas += Number(row.horas ?? 0);
  });

  // Column widths: Nro | Elemento | H | S1..nSem
  const wNro = 310;
  const wElem = 1450;
  const wH = 330;
  const wSemAll = CW - wNro - wElem - wH;
  const wS = Math.floor(wSemAll / nSem);
  const wSLast = wSemAll - wS * (nSem - 1);
  const semWidths = [...Array(nSem - 1).fill(wS), wSLast];
  const allWidths = [wNro, wElem, wH, ...semWidths];

  const headerRow = new TableRow({
    children: [
      mkCell('N°', { w: wNro, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, size: SZ.xs }),
      mkCell('Elemento de Competencia', { w: wElem, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, size: SZ.xs }),
      mkCell('H', { w: wH, bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, size: SZ.xs }),
      ...Array.from({ length: nSem }, (_, i) =>
        mkCell(String(i + 1), { w: semWidths[i], bg: CLR.navy, bold: true, color: CLR.white, align: AlignmentType.CENTER, size: SZ.xs }),
      ),
    ]
  });

  const dataRows = Object.entries(ecMap).map(([ec, info], idx) =>
    new TableRow({
      children: [
        mkCell(String(idx + 1), { w: wNro, align: AlignmentType.CENTER, size: SZ.xs }),
        mkCell(ec, { w: wElem, bold: true, size: SZ.xs }),
        mkCell(String(info.horas), { w: wH, align: AlignmentType.CENTER, size: SZ.xs }),
        ...Array.from({ length: nSem }, (_, i) => {
          const active = info.semanas.has(i + 1);
          return mkCell('', { w: semWidths[i], bg: active ? CLR.cronAct : CLR.white });
        }),
      ]
    }),
  );

  const cronTable = new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: allWidths,
    rows: [headerRow, ...dataRows],
  });

  return [...secTitle('21', 'CRONOGRAMA DE EJECUCIÓN'), cronTable, sp()];
}

// ── IV. RECURSOS ──────────────────────────────────────────────────────────────
function buildRecursos(data) {
  const res = data.recursos ?? {};
  const bib = (Array.isArray(res.bibliografia) ? res.bibliografia : [])
    .slice()
    .sort((a, b) => String(a).localeCompare(String(b), 'es', { sensitivity: 'base' }));
  const W1 = Math.round(CW * 0.26), W2 = CW - W1;

  const bibPs = bib.length > 0
    ? bib.map((ref) => new Paragraph({
      numbering: { reference: 'bib-list', level: 0 },
      children: [run(String(ref), { size: SZ.sm })],
      spacing: { after: 40 },
    }))
    : [p('Sin referencias bibliográficas.', { size: SZ.sm })];

  const didacticosPs = res.didacticos
    ? String(res.didacticos)
        .split(/;\s*/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s, i, arr) => new Paragraph({
          children: [run(s.endsWith('.') ? s : `${s}.`, { size: SZ.sm })],
          spacing: { after: i < arr.length - 1 ? 60 : 0 },
        }))
    : [p('—', { size: SZ.sm })];

  const resTable = new Table({
    width: { size: CW, type: WidthType.DXA },
    columnWidths: [W1, W2],
    rows: [
      new TableRow({
        children: [
          mkCell('22. Recursos Didácticos', { w: W1, bg: CLR.tblHdr, bold: true }),
          mkCell(didacticosPs, { w: W2, va: VerticalAlign.TOP }),
        ]
      }),
      new TableRow({
        children: [
          mkCell('23. Alianzas Estratégicas', { w: W1, bg: CLR.tblHdr, bold: true }),
          mkCell(res.alianzas ?? 'Ninguna', { w: W2 }),
        ]
      }),
      new TableRow({
        children: [
          mkCell('24. Bibliografía', { w: W1, bg: CLR.tblHdr, bold: true }),
          mkCell(bibPs, { w: W2, va: VerticalAlign.TOP }),
        ]
      }),
    ],
  });

  return [...secTitle('IV', 'RECURSOS'), resTable, sp()];
}

// ── FIRMA ─────────────────────────────────────────────────────────────────────
function buildFirma(_data) {
  const cfg = getConfig();
  const docente = cfg.nombreDocente ?? '';
  const director = cfg.nombreDirector ?? '';
  const W = Math.floor(CW / 2);
  const noBorders = { top: noBrd(), bottom: noBrd(), left: noBrd(), right: noBrd() };

  return [
    p(`Fecha de presentación: ${new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      { align: AlignmentType.LEFT, size: SZ.sm, after: 80 }),
    sp(),
    new Table({
      width: { size: CW, type: WidthType.DXA },
      columnWidths: [W, CW - W],
      rows: [new TableRow({
        children: [
          mkCell([
            sp(), sp(),
            p('_____________________________________', { align: AlignmentType.CENTER, size: SZ.sm, after: 20 }),
            p('Firma del Docente', { align: AlignmentType.CENTER, bold: true, size: SZ.sm, after: 10 }),
            p(docente, { align: AlignmentType.CENTER, size: SZ.sm }),
          ], { w: W, borders: noBorders }),
          mkCell([
            sp(), sp(),
            p('_____________________________________', { align: AlignmentType.CENTER, size: SZ.sm, after: 20 }),
            p('Director(a) de Carrera', { align: AlignmentType.CENTER, bold: true, size: SZ.sm, after: 10 }),
            p(director, { align: AlignmentType.CENTER, size: SZ.sm }),
          ], { w: CW - W, borders: noBorders }),
        ]
      })],
    }),
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Genera el archivo .docx del Proyecto Formativo siguiendo la plantilla UAJMS v2.
 * @param {Object} proyectoData - Objeto estructurado generado por claudeService
 * @returns {Promise<Buffer>}    - Buffer del .docx listo para enviar al cliente
 */
async function generateDocx(proyectoData) {
  const children = [
    ...buildHeader(),
    ...buildIdentificacion(proyectoData),
    ...buildMallaCurricular(proyectoData),
    ...buildCompetencias(proyectoData),
    ...buildRutaFormativa(proyectoData),
    ...buildCronograma(proyectoData),
    ...buildRecursos(proyectoData),
    ...buildFirma(proyectoData),
  ];

  const doc = new Document({
    numbering: buildNumbering(proyectoData.elementosDeCompetencia ?? []),
    sections: [{
      properties: {
        page: {
          size: { width: PAGE_W, height: PAGE_H, orientation: PageOrientation.LANDSCAPE },
          margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN },
        },
      },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}

module.exports = { generateDocx };
