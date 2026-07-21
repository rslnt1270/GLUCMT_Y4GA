import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { buildReportHtml } from '../templates/reportTemplate';
import { getLocalDateKey, recordDateKey } from '../utils/dates';

// Rango objetivo estándar de glucosa capilar (mg/dL)
export const GLUCOSE_TARGET_RANGE = { min: 70, max: 180 };

const average = (values) =>
  values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;

const stdDev = (values) => {
  if (values.length < 2) return null;
  const mean = average(values);
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
};

// Construye los datos del reporte para los últimos `rangeDays` días (incluyendo hoy)
export function buildReportData({ patient, profile, rangeDays }) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (rangeDays - 1));
  const startKey = getLocalDateKey(start);
  const endKey = getLocalDateKey(end);

  const records = (patient.glucoseHistory || [])
    .filter((record) => {
      const key = recordDateKey(record);
      return key >= startKey && key <= endKey;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const rows = records.map((record) => {
    const snap = record.fullSnapshot || { glucose: record.value };
    const dateObj = new Date(record.date);
    return {
      dateLabel: dateObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
      timeLabel: dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      glucose: typeof snap.glucose === 'number' ? snap.glucose : null,
      bloodPressure: snap.bloodPressure || null,
      insulin: typeof snap.insulin === 'number' ? snap.insulin : null,
      medications: snap.medicationsTaken || [],
    };
  });

  const glucoseValues = rows.map((r) => r.glucose).filter((v) => v !== null);
  const bpValues = rows.map((r) => r.bloodPressure).filter(Boolean);
  const insulinValues = rows.map((r) => r.insulin).filter((v) => v !== null);
  const inRange = glucoseValues.filter(
    (v) => v >= GLUCOSE_TARGET_RANGE.min && v <= GLUCOSE_TARGET_RANGE.max
  );

  const stats = {
    totalReadings: rows.length,
    glucoseAvg: average(glucoseValues),
    glucoseMin: glucoseValues.length > 0 ? Math.min(...glucoseValues) : null,
    glucoseMax: glucoseValues.length > 0 ? Math.max(...glucoseValues) : null,
    glucoseStdDev: stdDev(glucoseValues),
    inRangePct: glucoseValues.length > 0 ? (inRange.length / glucoseValues.length) * 100 : null,
    hypoCount: glucoseValues.filter((v) => v < GLUCOSE_TARGET_RANGE.min).length,
    hyperCount: glucoseValues.filter((v) => v > GLUCOSE_TARGET_RANGE.max).length,
    bpAvg: bpValues.length > 0
      ? { sys: average(bpValues.map((bp) => bp.sys)), dia: average(bpValues.map((bp) => bp.dia)) }
      : null,
    insulinTotal: insulinValues.length > 0 ? insulinValues.reduce((a, b) => a + b, 0) : null,
  };

  const fmtDate = (d) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

  return {
    patientName: patient.name,
    profile,
    periodLabel: `Período: ${fmtDate(start)} al ${fmtDate(end)}`,
    generatedAt: `${fmtDate(end)}, ${end.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`,
    rows,
    stats,
    glucoseRange: GLUCOSE_TARGET_RANGE,
    startKey,
    endKey,
  };
}

const sanitizeFilename = (name) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9_-]+/g, '_');

// Genera el reporte y abre la hoja de compartir del sistema.
// `format`: 'pdf' | 'html'. `rangeDays`: 7 (semanal) o 30 (mensual).
export async function exportReport({ patient, profile, rangeDays, format }) {
  const report = buildReportData({ patient, profile, rangeDays });
  const html = buildReportHtml(report);

  const baseName = `Reporte_${sanitizeFilename(patient.name)}_${report.startKey}_al_${report.endKey}`;

  let fileUri;
  let mimeType;
  let UTI;

  if (format === 'pdf') {
    const { uri } = await Print.printToFileAsync({ html });
    mimeType = 'application/pdf';
    UTI = 'com.adobe.pdf';
    // Renombrar el archivo temporal para que el PDF compartido tenga un nombre legible.
    // move() es asíncrono en la API de expo-file-system de SDK 57; sin await se
    // compartiría el destino antes de que existan los bytes.
    try {
      const dest = new File(Paths.cache, `${baseName}.pdf`);
      if (dest.exists) dest.delete();
      const temp = new File(uri);
      await temp.move(dest);
      fileUri = temp.uri;
    } catch {
      fileUri = uri;
    }
  } else {
    const file = new File(Paths.cache, `${baseName}.html`);
    file.create({ intermediates: true, overwrite: true });
    file.write(html);
    fileUri = file.uri;
    mimeType = 'text/html';
    UTI = 'public.html';
  }

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(fileUri, {
      mimeType,
      UTI,
      dialogTitle: `Reporte de ${patient.name}`,
    });
  }

  return { uri: fileUri, totalReadings: report.stats.totalReadings };
}
