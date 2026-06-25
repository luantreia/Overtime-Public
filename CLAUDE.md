# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Overtime-Public** is the public-facing portal for the Overtime dodgeball platform. It serves fans and community members with read-only league/player/team data, plus authenticated features for "La Plaza" (local pickup games), player profile management, and the edit-request workflow.

## Commands

```bash
npm start       # Dev server (proxied via vercel.json; no backend proxy in package.json)
npm run build
npm test
```

No lint script is configured. TypeScript is checked during build (`react-scripts build`).

## Environment

`.env` at the project root:
```env
REACT_APP_API_URL=https://overtime-ddyl.onrender.com/api
REACT_APP_ENABLE_GPT5=...
REACT_APP_GPT_MODEL=...
```

In production, `vercel.json` rewrites `/api/*` to the Render backend. In dev, all API calls go directly to the URL in `REACT_APP_API_URL` — there is no local proxy in `package.json`. If you need to point at a local backend, change `REACT_APP_API_URL` to `http://localhost:5000/api`.

## Architecture

### Provider Chain

`index.tsx` wraps the app in: `GlobalErrorBoundary → BrowserRouter → AuthProvider → ToastProvider → SolicitudesProvider → App`

`index.tsx` also manages **cache versioning**: on startup it reads `APP_VERSION` from localStorage, clears all persisted TanStack Query caches and removes any service workers if the version changed (prevents blank-screen issues after deploys).

### Data Fetching

TanStack Query v5 is configured in `App.tsx` with:
- `staleTime: 24 hours`, `gcTime: 7 days` (offline-first)
- `createSyncStoragePersister` backed by `localStorage`
- `refetchOnWindowFocus: false`

Each feature has a **service class** with static methods that call either:
- `authFetch<T>(endpoint, options)` (`src/shared/utils/authFetch.ts`) — for authenticated requests
- `src/shared/api/client.ts` — for unauthenticated public endpoints

`authFetch` handles token refresh automatically: on 401 it POSTs to `/auth/refresh`, updates localStorage tokens, and retries the original request. If refresh fails it clears tokens.

Token keys: `overtime_token` (access), `overtime_refresh_token` (refresh) — managed in `src/utils/apiClient.ts`.

### Routing

`App.tsx` lazy-loads all 15+ routes. Protected routes use `ProtectedRoute` (`src/app/routes/ProtectedRoute.tsx`) which checks `useAuth().isAuthenticated` and redirects to `/login` on failure.

**Public routes:** `/`, `/jugadores`, `/equipos`, `/competencias`, `/partidos`, `/ranking`, `/login`, `/register`, `/plaza`

**Protected routes:** `/plaza/crear`, `/plaza/lobby/:id`, `/plaza/lobby/:id/report`, `/solicitudes`, `/perfil`, `/notificaciones`

### Feature Domains

| Feature | Purpose |
|---------|---------|
| `auth` | Login, register, session restore via stored token |
| `competencias` | Leagues/tournaments with 6 service files (competencia, fase, temporada, jugadorCompetencia, organizacion, ranked) |
| `equipos` | Team listing and detail pages |
| `jugadores` | Player listing with client-side infinite scroll; player detail with radar stats and history |
| `leagueofdodgeball` | "La Plaza" — geo-filtered pickup game lobbies with team balancing and result reporting |
| `partidos` | Match listing and detail |
| `perfil` | User account settings |
| `solicitudes` | Edit-request (SolicitudEdicion) approval workflow |
| `notificaciones` | User notification center |

### Shared Code Layout

```
src/shared/
  api/client.ts          # Unauthenticated API calls (register, public listings, insights)
  components/            # ~40 reusable components; atomic UI in components/ui/
  config/featureFlags.tsx  # Feature flags loaded from /api/config, defaults from env vars
  hooks/useEntity.ts     # Generic fetch hook wrapping authFetch
  types/index.ts         # Core domain types (Usuario, Jugador, Equipo, Partido, …)
  types/solicitudesEdicion.ts  # Edit-request types and custom error classes
  utils/authFetch.ts     # Authenticated HTTP client with auto token refresh
  utils/socket.ts        # Socket.IO client (Render prod or localhost:5000)
  utils/constants/       # ITEMS_PER_PAGE, VALIDATION_RULES, API_CONFIG, ROUTES, etc.
```

Note: `src/utils/` and `src/types/` at the root contain some overlapping files with `src/shared/utils/` and `src/shared/types/`. Prefer the `src/shared/` versions — they are the primary source.

### Jugadores Infinite Scroll Pattern

`Jugadores.tsx` fetches all players at once (up to the backend's 1000-item cap), applies client-side filtering, sorts by a daily seed-based "discovery score" (rotates every 24h), and exposes more items in batches of 24 using an `IntersectionObserver`. There is no server-side pagination for the player list.

### Edit-Request (SolicitudEdicion) Workflow

Sensitive mutations don't call APIs directly — they create `SolicitudEdicion` records that go through an approval flow. `SolicitudesContext` (`src/app/providers/SolicitudesContext.tsx`) exposes `cargarOpciones(contexto)` and `crearSolicitud(payload)`. The UI entry points are `SolicitudButton` and `SolicitudModal` in `src/shared/components/`. Custom typed errors (`SolicitudValidationError`, `SolicitudPermissionError`, `SolicitudBusinessError`) are defined in `src/shared/types/solicitudesEdicion.ts`.

### Tailwind Theme

Custom `brand` color palette defined in `tailwind.config.js` (blue shades, `brand-50` through `brand-900`). Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`.
