// Medidas reales de la cancha (mismas que EstadioTemploScene: 18x9m, mitades de 9x9, habilitación a 3m)
export const COURT_WIDTH = 9;
export const COURT_LENGTH = 18;
export const HALF = COURT_LENGTH / 2;
export const HABILITACION_DIST = 3;
export const LINE_THICKNESS = 0.08;

// Zona donde pueden aparecer los objetivos: la mitad lejana de la cancha, con margen del borde
export const ZONA_OBJETIVOS = {
  xMin: -COURT_WIDTH / 2 + 0.6,
  xMax: COURT_WIDTH / 2 - 0.6,
  zMin: 1.5,
  zMax: HALF - 1,
  yMin: 1,
  yMax: 3,
};

export const TARGET_RADIUS = 0.55; // más grande que un aro "real" a propósito: apuntar en 3D con drag 2D es impreciso
export const MAX_TARGETS = 2;

// Pelota (radio real es 0.09m/18cm, la agrandamos un poco para que sea jugable a esta escala de cámara)
export const BALL_RADIUS = 0.13;
export const BALL_READY_POSITION: [number, number, number] = [0, 1.1, -HALF + 2.5];
// Masa realista (~0.5kg, como una pelota de dodgeball) -> density derivada del volumen de la esfera.
// Sin esto Rapier usa densidad 1 por defecto, que con este radio da una pelota de ~9g: cualquier impulso
// (como el de la fuerza de Magnus) le cambia la velocidad de forma exagerada.
export const BALL_MASS = 0.5;
export const BALL_DENSITY = BALL_MASS / ((4 / 3) * Math.PI * BALL_RADIUS ** 3);

// Cámara: fija, elevada y retrasada (vista "por encima del hombro") para que la pelota en reposo
// y su arco de vuelo entren cómodos en cuadro — pegarla al ras de la pelota la deja fuera de la vista.
export const CAMERA_POSITION: [number, number, number] = [0, 1.8, -HALF - 2.5];
export const CAMERA_LOOK_AT: [number, number, number] = [0, 1, HALF * 0.3];

// Timer / score
export const INITIAL_TIME = 30;
export const TIME_BONUS_PER_HIT = 2;
export const POINTS_PER_HIT = 1;

// Tiro: mapeo del arrastre en pantalla (px) a velocidad inicial (m/s)
export const MAX_DRAG_DISTANCE = 220; // px
export const THROW_POWER_SCALE = 0.055; // (px de arrastre) * escala -> m/s
export const MIN_THROW_SPEED = 4;
export const MAX_ARC = 0.45; // cuánto del arrastre vertical se convierte en ángulo de elevación

// Efecto (spin): curvatura del gesto de arrastre -> velocidad angular inicial
export const MAX_SPIN = 8; // rad/s
export const SPIN_FROM_DEVIATION_SCALE = 0.15;

// Fuerza de Magnus aplicada en vuelo: F = MAGNUS_COEFFICIENT * (angularVelocity x linearVelocity)
export const MAGNUS_COEFFICIENT = 0.008;

// Si la pelota no impacta nada en este tiempo, se resetea
export const MAX_FLIGHT_TIME = 2.5;
