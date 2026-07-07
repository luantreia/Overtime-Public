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
];
