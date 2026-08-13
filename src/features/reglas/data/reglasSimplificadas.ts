import type { EscenaExplicada, DiferenciaFormato } from '../types';

// Explicación del dodgeball a partir del reglamento oficial WDBF 2026 (ver data/reglamentoCloth.ts
// y data/reglamentoFoam.ts para el texto completo). El peso de la explicación lo lleva la animación
// 3D de cada escena: acá va solo el titular. Las notas paso a paso viven en court3d/escenas.ts.

export const escenasExplicadas: EscenaExplicada[] = [
  {
    id: 'posiciones',
    emoji: '🧍',
    titulo: 'Las posiciones',
    resumen: 'Seis por equipo en cancha, hasta tres shaggers afuera y las pelotas sobre la línea del medio.',
  },
  {
    id: 'apertura',
    emoji: '🏁',
    titulo: 'La arrancada',
    resumen: 'Al silbato todos corren al centro. Cada formato reparte las pelotas distinto.',
  },
  {
    id: 'lanzamiento',
    emoji: '🔥',
    titulo: 'El tiro',
    resumen: 'Si la pelota te pega directo, sin picar antes, quedás eliminado y vas a la cola.',
  },
  {
    id: 'catch',
    emoji: '🙌',
    titulo: 'La atajada',
    resumen: 'Agarrarla en el aire elimina al que tiró y te devuelve un compañero a la cancha.',
  },
  {
    id: 'bloqueo',
    emoji: '🛡️',
    titulo: 'El bloqueo',
    resumen: 'Con otra pelota en la mano podés frenar el tiro sin quedar afuera.',
  },
  {
    id: 'linea',
    emoji: '🚫',
    titulo: 'Las líneas',
    resumen: 'Pisar la mitad del rival o salirte de la cancha también te elimina.',
  },
  {
    id: 'gana',
    emoji: '🏆',
    titulo: 'Cómo se gana',
    resumen: 'Ganás el set limpiando la cancha, o llegando al final del tiempo con más jugadores.',
  },
];

export const diferenciasFormato: DiferenciaFormato[] = [
  { aspecto: 'Pelotas', cloth: '5 pelotas de tela con relleno de espuma', foam: '6 pelotas de espuma recubierta' },
  {
    aspecto: 'Reparto en la arrancada',
    cloth: '2 propias por equipo + 1 en el medio, disputada por ambos desde el silbato',
    foam: '3 propias por equipo — ninguna pelota está en disputa',
  },
  {
    aspecto: 'Dónde se activa la pelota',
    cloth: 'Línea de ataque, a 5.5 m del centro',
    foam: 'Línea de activación, a 3 m del centro',
  },
  {
    aspecto: 'Evitar que un equipo se quede con todas las pelotas',
    cloth: '"Advantage": si tenés la mayoría de las pelotas por más de 5 segundos, el árbitro te obliga a tirar ("play n balls")',
    foam: '"Burden": el equipo con más pelotas tiene 10 segundos para hacer un intento válido de tiro, o las pierde todas',
  },
  {
    aspecto: 'Puntos por set',
    cloth: '2 puntos por ganar, 1 punto si empatan (puede haber empate)',
    foam: '1 punto por ganar un set (no hay empate: siempre gana alguien)',
  },
  {
    aspecto: 'Cerca del final del tiempo',
    cloth: 'Si quedan menos de 2 minutos en el reloj de partido, el set final dura 90 segundos',
    foam: 'Si el set termina sin decidirse, se pasa a "No-Blocking": ya no se puede bloquear tiros con otra pelota',
  },
];
