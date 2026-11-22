const SAFE_FALLBACK = 'Sin fecha';

const parseDate = (isoDate: string | Date | undefined | null): Date | null => {
  if (!isoDate) return null;
  
  // Si ya es Date, retornarlo
  if (isoDate instanceof Date) {
    return Number.isNaN(isoDate.getTime()) ? null : isoDate;
  }
  
  // Si es string, parsearlo
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (isoDate: string | Date | undefined | null, locale: string = 'es-AR'): string => {
  const date = parseDate(isoDate);
  if (!date) return SAFE_FALLBACK;

  // Fechas sin hora (cumpleaños, "desde/hasta" de contratos, fechaInicio/fechaFin, etc.)
  // se guardan y parsean como medianoche UTC. Forzamos timeZone UTC al formatear para
  // mostrar el día calendario original, sin correrlo por la zona horaria del navegador.
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

/**
 * Zona en la que se juega la liga. Los partidos se muestran en esta zona y no en la del
 * navegador, para que quien mire desde otro país vea el día en que realmente se jugó.
 */
export const ZONA_LIGA = 'America/Argentina/Buenos_Aires';

/**
 * `Partido.fecha` mezcla dos convenciones en la base:
 *  - instantes reales (partido de las 21:00 ART → `...T00:00:xx.xxxZ` del día siguiente)
 *  - cargas "solo día" (planillas históricas) guardadas a medianoche UTC exacta.
 * Medianoche UTC exacta se interpreta como "solo día" (se muestra el día UTC, sin hora);
 * todo lo demás es un instante y se muestra en `ZONA_LIGA`.
 */
export const esSoloDia = (date: Date): boolean =>
  date.getUTCHours() === 0 &&
  date.getUTCMinutes() === 0 &&
  date.getUTCSeconds() === 0 &&
  date.getUTCMilliseconds() === 0;

/** Clave `YYYY-MM-DD` del día calendario en que se jugó el partido. */
export const diaPartido = (isoDate: string | Date | undefined | null): string => {
  const date = parseDate(isoDate);
  if (!date) return '';
  // en-CA formatea como YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: esSoloDia(date) ? 'UTC' : ZONA_LIGA,
  }).format(date);
};

/** Fecha de un partido: "21 nov 2026 · 21:00" (o solo el día si se cargó sin hora). */
export const formatFechaPartido = (isoDate: string | Date | undefined | null, locale: string = 'es-AR'): string => {
  const date = parseDate(isoDate);
  if (!date) return SAFE_FALLBACK;
  if (esSoloDia(date)) return formatDate(date, locale);
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: ZONA_LIGA,
  }).format(date);
};

export const formatDateTime = (isoDate: string | Date | undefined | null, locale: string = 'es-AR'): string => {
  const date = parseDate(isoDate);
  if (!date) return SAFE_FALLBACK;

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
