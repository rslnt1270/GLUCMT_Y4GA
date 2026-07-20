// Plantilla HTML/CSS que emula un documento LaTeX (clase article + booktabs).
// La misma plantilla alimenta la exportación a PDF (expo-print) y a HTML.

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const fmt = (num, decimals = 0) =>
  num === null || num === undefined || Number.isNaN(num) ? '—' : Number(num).toFixed(decimals);

const LATEX_CSS = `
  @page { margin: 48px 56px; }
  * { box-sizing: border-box; }
  body {
    font-family: 'Latin Modern Roman', 'Computer Modern', 'CMU Serif', Georgia, 'Times New Roman', serif;
    color: #1a1a1a;
    font-size: 12pt;
    line-height: 1.45;
    margin: 0 auto;
    max-width: 680px;
    padding: 24px 16px;
    background: #ffffff;
  }
  .titlepage { text-align: center; margin-bottom: 28px; }
  .titlepage h1 { font-size: 20pt; font-weight: normal; margin: 0 0 10px; }
  .titlepage .author { font-size: 12pt; margin: 2px 0; }
  .titlepage .date { font-size: 11pt; font-style: italic; margin-top: 6px; }
  .rule { border: none; border-top: 0.8pt solid #1a1a1a; margin: 18px 0; }
  h2.section {
    font-size: 13.5pt;
    font-weight: bold;
    margin: 26px 0 10px;
  }
  h2.section .secnum { margin-right: 10px; }
  p.abstract { font-size: 10.5pt; text-align: justify; margin: 0 40px 8px; }
  .abstract-title { text-align: center; font-weight: bold; font-size: 11pt; margin-bottom: 4px; }
  table.booktabs {
    border-collapse: collapse;
    width: 100%;
    font-size: 10.5pt;
    margin: 10px 0 4px;
  }
  table.booktabs th {
    border-top: 1.4pt solid #1a1a1a;
    border-bottom: 0.7pt solid #1a1a1a;
    padding: 5px 8px;
    font-weight: bold;
    text-align: center;
  }
  table.booktabs td { padding: 4px 8px; text-align: center; }
  table.booktabs tr:last-child td { border-bottom: 1.4pt solid #1a1a1a; }
  table.booktabs td.left, table.booktabs th.left { text-align: left; }
  .stat-flag-low { color: #b3261e; font-weight: bold; }
  .stat-flag-high { color: #b3261e; font-weight: bold; }
  .footnote {
    font-size: 9pt;
    margin-top: 26px;
    padding-top: 6px;
    border-top: 0.5pt solid #1a1a1a;
    width: 55%;
    color: #333;
  }
  .empty-note { font-style: italic; font-size: 10.5pt; }
`;

// Marca visual de valores fuera de rango en la tabla, al estilo de una nota clínica
const glucoseCell = (glucose, range) => {
  if (glucose === null || glucose === undefined) return '—';
  if (glucose < range.min) return `<span class="stat-flag-low">${glucose} ↓</span>`;
  if (glucose > range.max) return `<span class="stat-flag-high">${glucose} ↑</span>`;
  return String(glucose);
};

export function buildReportHtml(report) {
  const {
    patientName,
    profile,
    periodLabel,
    generatedAt,
    rows,
    stats,
    glucoseRange,
  } = report;

  const profileParts = [
    profile?.age ? `Edad: ${escapeHtml(profile.age)}` : null,
    profile?.diabetesType ? `Diagnóstico: ${escapeHtml(profile.diabetesType)}` : null,
    profile?.bloodType ? `Tipo de sangre: ${escapeHtml(profile.bloodType)}` : null,
    profile?.allergies ? `Alergias: ${escapeHtml(profile.allergies)}` : null,
  ].filter(Boolean).join(' · ');

  const tableRows = rows.map((row) => `
        <tr>
          <td class="left">${escapeHtml(row.dateLabel)}</td>
          <td>${escapeHtml(row.timeLabel)}</td>
          <td>${glucoseCell(row.glucose, glucoseRange)}</td>
          <td>${row.bloodPressure ? `${row.bloodPressure.sys}/${row.bloodPressure.dia}` : '—'}</td>
          <td>${row.insulin ?? '—'}</td>
          <td class="left">${row.medications.length > 0 ? escapeHtml(row.medications.join(', ')) : '—'}</td>
        </tr>`).join('');

  const recordsTable = rows.length > 0
    ? `
      <table class="booktabs">
        <thead>
          <tr>
            <th class="left">Fecha</th>
            <th>Hora</th>
            <th>Glucosa<br/>(mg/dL)</th>
            <th>Presión<br/>(mmHg)</th>
            <th>Insulina<br/>(U)</th>
            <th class="left">Medicamentos</th>
          </tr>
        </thead>
        <tbody>${tableRows}
        </tbody>
      </table>`
    : '<p class="empty-note">No se registraron tomas durante el período seleccionado.</p>';

  const statsTable = `
      <table class="booktabs">
        <thead>
          <tr>
            <th class="left">Indicador</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          <tr><td class="left">Tomas registradas</td><td>${stats.totalReadings}</td></tr>
          <tr><td class="left">Glucosa promedio (mg/dL)</td><td>${fmt(stats.glucoseAvg, 1)}</td></tr>
          <tr><td class="left">Glucosa mínima / máxima (mg/dL)</td><td>${fmt(stats.glucoseMin)} / ${fmt(stats.glucoseMax)}</td></tr>
          <tr><td class="left">Desviación estándar (mg/dL)</td><td>${fmt(stats.glucoseStdDev, 1)}</td></tr>
          <tr><td class="left">Lecturas en rango ${glucoseRange.min}–${glucoseRange.max} mg/dL</td><td>${fmt(stats.inRangePct, 1)}%</td></tr>
          <tr><td class="left">Hipoglucemias (&lt; ${glucoseRange.min} mg/dL)</td><td>${stats.hypoCount}</td></tr>
          <tr><td class="left">Hiperglucemias (&gt; ${glucoseRange.max} mg/dL)</td><td>${stats.hyperCount}</td></tr>
          <tr><td class="left">Presión arterial promedio (mmHg)</td><td>${stats.bpAvg ? `${fmt(stats.bpAvg.sys)}/${fmt(stats.bpAvg.dia)}` : '—'}</td></tr>
          <tr><td class="left">Insulina total aplicada (U)</td><td>${fmt(stats.insulinTotal)}</td></tr>
        </tbody>
      </table>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Reporte de control — ${escapeHtml(patientName)}</title>
<style>${LATEX_CSS}</style>
</head>
<body>
  <div class="titlepage">
    <h1>Reporte de Control Glucémico y Signos Vitales</h1>
    <div class="author">Paciente: <b>${escapeHtml(patientName)}</b></div>
    ${profileParts ? `<div class="author">${profileParts}</div>` : ''}
    <div class="date">${escapeHtml(periodLabel)} — Generado el ${escapeHtml(generatedAt)}</div>
  </div>
  <hr class="rule" />

  <div class="abstract-title">Resumen</div>
  <p class="abstract">
    Este documento concentra las tomas de glucosa capilar, presión arterial, dosis de insulina y
    medicamentos registrados con la aplicación GLUCMT-Y4GA durante el período indicado, para su
    valoración en consulta médica.
  </p>

  <h2 class="section"><span class="secnum">1</span>Estadísticas del período</h2>
  ${statsTable}

  <h2 class="section"><span class="secnum">2</span>Registro de tomas</h2>
  ${recordsTable}

  <div class="footnote">
    Rango objetivo de glucosa: ${glucoseRange.min}–${glucoseRange.max} mg/dL.
    Los valores marcados con ↓/↑ están fuera de rango.
    Documento generado automáticamente; no sustituye una valoración médica.
  </div>
</body>
</html>`;
}
