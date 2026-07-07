import React, { lazy } from 'react';
import type { ReactNode } from 'react';

const MinijuegosHub = lazy(() => import('./pages/Minijuegos'));
const DodgeballGame = lazy(() => import('./games/dodgeball/pages/DodgeballGame'));
const NoTeQuemesGame = lazy(() => import('./games/no-te-quemes/pages/NoTeQuemesGame'));
const CabezonesGame = lazy(() => import('./games/cabezones/pages/CabezonesGame'));

export interface MinijuegoRoute {
  path: string;
  element: ReactNode;
}

/**
 * Central route list for the whole minijuegos feature. `App.tsx` imports
 * this once and expands it with `.map()` — adding a new game only means
 * adding one lazy() + one entry here (and to registry.ts for the hub card),
 * App.tsx itself never needs to change again.
 */
export const minijuegosRoutes: MinijuegoRoute[] = [
  { path: '/minijuegos', element: <MinijuegosHub /> },
  { path: '/minijuegos/dodgeball', element: <DodgeballGame /> },
  { path: '/minijuegos/no-te-quemes', element: <NoTeQuemesGame /> },
  { path: '/minijuegos/cabezones', element: <CabezonesGame /> },
];
