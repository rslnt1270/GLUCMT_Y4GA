// Clave de fecha LOCAL (YYYY-MM-DD). Usar toISOString() aquí marcaría las tomas
// nocturnas en el día siguiente (UTC), corrompiendo el registro diario.
export const getLocalDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Registros antiguos no tienen 'dateKey'; caemos a la fecha UTC como aproximación
export const recordDateKey = (record) => record.dateKey || record.date.split('T')[0];
