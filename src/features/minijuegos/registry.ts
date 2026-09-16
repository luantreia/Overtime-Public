export interface MinijuegoMeta {
  slug: string;
  name: string;
  description: string;
  emoji: string;
  path: string;
}

/**
 * Pure metadata for the minijuegos hub — no JSX/imports here so it can be
 * read cheaply by the hub page. Route wiring (lazy imports + <Route>) lives
 * in `routes.tsx`; add a new game by appending to both files.
 */
export const MINIJUEGOS_REGISTRY: MinijuegoMeta[] = [
  {
    slug: 'dodgeball',
    name: 'Dodgeball 2D',
    description: 'Vos y dos compañeros IA contra un equipo rival. 1 partido, 90 segundos.',
    emoji: '🤾',
    path: '/minijuegos/dodgeball',
  },
  {
    slug: 'no-te-quemes',
    name: 'No Te Quemes',
    description: 'Esquivá pelotazos en 3 carriles. ¿Cuánto aguantás?',
    emoji: '🔥',
    path: '/minijuegos/no-te-quemes',
  },
  {
    slug: 'cabezones',
    name: 'Cabezones Quemados',
    description: '1 vs 1 de costado con físicas de verdad: saltá, tirá con efecto estilo honda y atajá.',
    emoji: '🙃',
    path: '/minijuegos/cabezones',
  },
  {
    slug: 'punteria',
    name: 'Puntería 3D',
    description: 'Cancha en 3D con física real: tirá con efecto a los aros antes de que se acabe el tiempo.',
    emoji: '🎯',
    path: '/minijuegos/punteria',
  },
  {
    slug: 'manos-de-guante',
    name: 'Manos de Guante',
    description: 'Atajá al vuelo en la ventana justa. Ojo: las que ya picaron no se atajan, se dejan pasar.',
    emoji: '🧤',
    path: '/minijuegos/manos-de-guante',
  },
  {
    slug: 'muralla',
    name: 'Muralla',
    description: 'Bloqueá tiro tras tiro… hasta que el árbitro canta No-Blocking y bloquear pasa a eliminarte.',
    emoji: '🧱',
    path: '/minijuegos/muralla',
  },
  {
    slug: 'la-arrancada',
    name: 'La Arrancada',
    description: 'Robá pelotas del medio y volvé a cruzar tu línea de activación antes de que te peguen.',
    emoji: '🏁',
    path: '/minijuegos/la-arrancada',
  },
  {
    slug: 'junta-pelotas',
    name: 'Junta Pelotas',
    description: 'Sos el shagger: juntá lo que sale, devolvelo detrás de tu línea y no dejes al equipo sin pelotas.',
    emoji: '🧺',
    path: '/minijuegos/junta-pelotas',
  },
];
