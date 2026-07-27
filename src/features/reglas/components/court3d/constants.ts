// Medidas reales de la cancha (mismas que Cancha3D del minijuego de puntería: 18x9m, mitades de 9x9).
// X = ancho (9m), Z = largo (18m) — con X en pantalla-horizontal y Z en pantalla-vertical,
// la cancha se ve "parada" (retrato), tal como pide el diseño.
export const COURT_WIDTH = 9;
export const COURT_LENGTH = 18;
export const HALF = COURT_LENGTH / 2; // 9
export const LINE_THICKNESS = 0.08;

// Equipo rojo ocupa Z positivo (arriba de la pantalla), azul Z negativo (abajo).
export const RED_Z = HALF / 2;
export const BLUE_Z = -HALF / 2;

export type CourtMode = 'inicio' | 'cancha' | 'equipos' | 'apertura' | 'eliminado' | 'volver' | 'gana' | 'limpio';
