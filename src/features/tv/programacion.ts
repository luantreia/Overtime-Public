/**
 * Grilla de Overtime TV: qué se está emitiendo en cada instante, igual para todos.
 *
 * Cada día (hora de Argentina) arranca una programación nueva: el catálogo del canal se
 * mezcla con una semilla fija `<día>|<canal>` y se repite en ciclo hasta medianoche. Como sólo
 * depende del reloj, cualquiera que abra la TV (o vuelva de otra página) cae en el mismo
 * partido y en el mismo segundo.
 */

export interface VideoTv {
  _id: string;
  videoId: string;
  /** Segundo del video donde arranca el partido (el `t=` del link). */
  inicio: number;
  /** Segundos emitibles: desde `inicio` hasta el final. */
  duracion: number;
  fecha?: string;
  marcadorLocal?: number;
  marcadorVisitante?: number;
  equipoLocal?: { _id: string; nombre: string; escudo?: string };
  equipoVisitante?: { _id: string; nombre: string; escudo?: string };
  competencia?: { _id: string; nombre: string };
  fase?: { _id: string; nombre: string };
}

export interface Emision {
  video: VideoTv;
  /** Epoch ms de inicio y fin de esta emisión. */
  desde: number;
  hasta: number;
}

const DIA_MS = 86_400_000;
const ART_OFFSET_MS = -3 * 3_600_000; // Argentina, sin horario de verano

export const nombreCompetencia = (v: VideoTv) => v.competencia?.nombre || 'Amistosos';

/** Inicio (epoch ms) del día de Argentina que contiene `ahora`. */
export const inicioDelDia = (ahora: number) =>
  Math.floor((ahora + ART_OFFSET_MS) / DIA_MS) * DIA_MS - ART_OFFSET_MS;

// Hash de string a 32 bits (FNV-1a) + mulberry32: aleatorio, pero idéntico en todos los clientes.
const hash = (s: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
};

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const mezclarConSemilla = <T,>(arr: T[], semilla: string): T[] => {
  const rnd = mulberry32(hash(semilla));
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Orden del día para un canal. `videos` debe venir en el mismo orden para todos (el backend ordena por _id). */
export const ordenDelDia = (videos: VideoTv[], canal: string, ahora: number): VideoTv[] => {
  const delCanal = videos.filter((v) => !canal || nombreCompetencia(v) === canal);
  const dia = new Date(inicioDelDia(ahora)).toISOString().slice(0, 10);
  return mezclarConSemilla(delCanal, `${dia}|${canal}`);
};

/**
 * Emisiones de la grilla alrededor de `ahora`: `antes` pasadas, la actual y `despues` próximas.
 * La actual es la de índice `antes` (o menor si el día recién arrancó).
 */
export const grilla = (
  videos: VideoTv[],
  canal: string,
  ahora: number,
  antes = 0,
  despues = 0,
): { actual: Emision | null; emisiones: Emision[] } => {
  const orden = ordenDelDia(videos, canal, ahora);
  const ciclo = orden.reduce((s, v) => s + v.duracion * 1000, 0);
  if (orden.length === 0 || ciclo <= 0) return { actual: null, emisiones: [] };

  const dia0 = inicioDelDia(ahora);
  const n = orden.length;
  const vueltas = Math.floor((ahora - dia0) / ciclo);
  let desde = dia0 + vueltas * ciclo;
  let i = 0;
  while (desde + orden[i].duracion * 1000 <= ahora) {
    desde += orden[i].duracion * 1000;
    i++;
  }
  const actualIdx = vueltas * n + i; // índice absoluto en el día

  const emisionEn = (abs: number): Emision | null => {
    if (abs < 0) return null;
    // Recalcular desde el inicio de la vuelta correspondiente.
    const v = Math.floor(abs / n);
    let t = dia0 + v * ciclo;
    for (let k = 0; k < abs % n; k++) t += orden[k].duracion * 1000;
    const video = orden[abs % n];
    return { video, desde: t, hasta: t + video.duracion * 1000 };
  };

  const emisiones: Emision[] = [];
  for (let k = actualIdx - antes; k <= actualIdx + despues; k++) {
    const e = emisionEn(k);
    if (e) emisiones.push(e);
  }
  return { actual: emisionEn(actualIdx), emisiones };
};
