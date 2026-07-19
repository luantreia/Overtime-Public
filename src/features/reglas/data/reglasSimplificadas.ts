import type { SeccionSimplificada, DiferenciaFormato } from '../types';

// Explicación de las reglas del dodgeball en lenguaje simple, redactada a partir del reglamento
// oficial WDBF 2026 (ver data/reglamentoCloth.ts y data/reglamentoFoam.ts para el texto completo).

export const seccionesSimplificadas: SeccionSimplificada[] = [
  {
    emoji: '🎯',
    titulo: '¿Cuál es el objetivo?',
    parrafos: [
      'Dos equipos se enfrentan en una cancha dividida al medio. Ganás un punto (eliminando a todo el equipo rival, o teniendo más jugadores en cancha cuando se acaba el tiempo) para llevarte el "set". El partido son varios sets seguidos, y gana quien sume más puntos.',
    ],
  },
  {
    emoji: '🏟️',
    titulo: 'La cancha',
    parrafos: [
      'Es un rectángulo de 18 x 9 metros, dividido por una línea central en dos mitades iguales de 9x9m: una para cada equipo. Al lado de cada mitad hay una "cola" donde esperan los jugadores eliminados para volver a entrar.',
    ],
  },
  {
    emoji: '🙋',
    titulo: 'Los equipos',
    parrafos: [
      'Cada equipo tiene una plantilla de hasta 12 jugadores, pero solo 6 juegan en cancha por vez. El resto espera para entrar (por sustitución o porque atraparon una pelota) o cumple sanciones.',
    ],
  },
  {
    emoji: '🏁',
    titulo: 'Así arranca un set',
    parrafos: [
      'Las pelotas se colocan sobre la línea central. Al silbato, ambos equipos corren a buscarlas — esto se llama la "arrancada" (opening rush). Cada equipo puede agarrar primero solo las pelotas más cercanas a su lado; recién después puede ir por las del medio o las del rival.',
    ],
  },
  {
    emoji: '🔥',
    titulo: '¿Cómo quedás eliminado?',
    parrafos: [
      'Te eliminan si una pelota tirada por el equipo rival te toca directamente (sin picar antes en el piso ni en otra cosa) — incluye el pelo o la ropa. También quedás eliminado si pisás fuera de la cancha, si tirás una pelota fuera del área del rival sin intención real de darle a alguien, o por algunas faltas de conducta.',
    ],
    bullets: [
      'Podés bloquear un tiro con otra pelota que tengas en la mano — la pelota que bloqueaste sigue "viva" y puede seguir jugándose.',
      'Si atajás una pelota en el aire antes de que toque el piso, quien la tiró queda eliminado — y además, un compañero tuyo que estaba eliminado vuelve a entrar a la cancha.',
    ],
  },
  {
    emoji: '↩️',
    titulo: 'Volver a la cancha',
    parrafos: [
      'Cada vez que tu equipo atrapa una pelota en el aire, el primer jugador de la cola (el que lleva más tiempo eliminado) vuelve a entrar. Es la única forma de recuperar jugadores durante un set — por eso atajar es tan valioso como eliminar.',
    ],
  },
  {
    emoji: '🏆',
    titulo: '¿Cómo se gana un set y el partido?',
    parrafos: [
      'Un set dura como máximo 3 minutos y termina cuando un equipo elimina a todos los jugadores del rival, o cuando se acaba el tiempo (gana quien tenga más jugadores en cancha en ese momento). El partido se juega en dos tiempos de 20 minutos, encadenando todos los sets que entren en ese tiempo. Gana el equipo que sumó más puntos.',
    ],
  },
  {
    emoji: '🚩',
    titulo: 'Juego limpio',
    parrafos: [
      'Los árbitros pueden sancionar con tarjetas (azul, amarilla o roja según la gravedad) por contacto físico entre jugadores, hacer perder tiempo a propósito, o conductas antideportivas. Las sanciones más graves pueden hacer que tu equipo juegue con menos jugadores o hasta pierda el set.',
    ],
  },
];

export const diferenciasFormato: DiferenciaFormato[] = [
  { aspecto: 'Pelotas', cloth: '5 pelotas de tela con relleno de espuma', foam: '6 pelotas de espuma recubierta' },
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
