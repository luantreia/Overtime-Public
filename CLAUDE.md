# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

**Overtime-Public** is the public-facing portal for the Overtime dodgeball platform. It serves fans and community members with read-only league/player/team data, plus authenticated features for "La Plaza" (local pickup games), player profile management, and the edit-request workflow.

## Commands

```bash
npm start       # Dev server (no backend proxy in package.json; uses REACT_APP_API_URL directly)
npm run build
npm test
```

No lint script is configured. TypeScript is checked during build (`react-scripts build`), with `strict: true` in tsconfig.

## Environment

`.env` at the project root:
```env
REACT_APP_API_URL=https://overtime-ddyl.onrender.com/api
REACT_APP_ENABLE_GPT5=...
REACT_APP_GPT_MODEL=...
```

In production, `vercel.json` rewrites `/api/*` to the Render backend. In dev, all API calls go directly to `REACT_APP_API_URL` — change it to `http://localhost:5000/api` to point at a local backend.

## Architecture

### Provider Chain

`index.tsx` wraps the app in:
```
GlobalErrorBoundary → BrowserRouter → AuthProvider → ToastProvider → SolicitudesProvider → App
```

`App.tsx` adds `PersistQueryClientProvider → FeatureFlagsProvider` around the route tree.

`index.tsx` also manages **cache versioning**: on startup it reads `APP_VERSION` from localStorage, clears all persisted TanStack Query caches and unregisters any service workers if the version changed (prevents blank-screen issues after deploys).

### Data Fetching

TanStack Query v5 is configured in `App.tsx` with:
- `staleTime: 24 hours`, `gcTime: 7 days` (offline-first)
- `createSyncStoragePersister` backed by `localStorage`
- `refetchOnWindowFocus: false`, `retry: 1`

Each feature has a **service class** with static methods that call either:
- `authFetch<T>(endpoint, options)` (`src/shared/utils/authFetch.ts`) — for authenticated requests
- `src/shared/api/client.ts` — for unauthenticated public endpoints

`authFetch` handles token refresh automatically: on 401 it POSTs to `/auth/refresh`, updates localStorage tokens, and retries the original request. If refresh fails it clears tokens.

Token keys: `overtime_token` (access), `overtime_refresh_token` (refresh) — managed in `src/utils/apiClient.ts`.

### Routing

`App.tsx` lazy-loads all routes via `React.lazy()`. Protected routes use `ProtectedRoute` (`src/app/routes/ProtectedRoute.tsx`) which checks `useAuth().isAuthenticated` and redirects to `/login` on failure.

**Public routes:** `/`, `/jugadores`, `/jugadores/:id`, `/equipos`, `/equipos/:id`, `/competencias`, `/competencias/:id`, `/partidos`, `/partidos/:id`, `/ranking`, `/lod`, `/lod/competencias`, `/login`, `/register`, `/plaza`

**Protected routes:** `/plaza/crear`, `/plaza/lobby/:id`, `/plaza/lobby/:id/report`, `/solicitudes`, `/perfil`, `/notificaciones`

### Feature Domains

| Feature | Purpose |
|---------|---------|
| `auth` | Login, register, session restore via stored token |
| `competencias` | Leagues/tournaments with 6 service files (competencia, fase, temporada, jugadorCompetencia, organizacion, ranked) |
| `dashboard` | Landing/home page |
| `equipos` | Team listing and detail pages |
| `error` | 404/error pages |
| `jugadores` | Player listing with client-side infinite scroll; player detail with radar stats and history |
| `leagueofdodgeball` | "La Plaza" — geo-filtered pickup game lobbies with team balancing and result reporting. Uses Socket.IO for real-time lobby sync |
| `notificaciones` | User notification center |
| `partidos` | Match listing and detail; `EstadisticasPartidoModal` is a complex multi-tab component |
| `perfil` | User account settings |
| `solicitudes` | Edit-request (SolicitudEdicion) approval workflow |

### Shared Code Layout

```
src/shared/
  api/client.ts             # Unauthenticated API calls (register, public listings, insights)
  components/               # ~40 reusable components; atomic UI in components/ui/
  config/featureFlags.tsx   # Feature flags loaded from /api/config, defaults from REACT_APP_* env vars
  hooks/useEntity.ts        # Generic fetch hook: useEntity<T>(fetchFn) → { data, loading, error, refetch }
  types/index.ts            # Core domain types (Usuario, Jugador, Equipo, Partido, …)
  types/solicitudesEdicion.ts  # Edit-request types and custom error classes
  utils/authFetch.ts        # Authenticated HTTP client with auto token refresh
  utils/socket.ts           # Socket.IO client (Render prod or localhost:5000)
  utils/constants/          # PAGINATION (20 items/page), VALIDATION_RULES, API_CONFIG, ROUTES, PARTIDO_ESTADOS, etc.
```

**Duplication note:** `src/utils/` and `src/types/` at the root overlap with `src/shared/utils/` and `src/shared/types/`. Always prefer the `src/shared/` versions — they are the primary source.

### Key Contexts

- `AuthContext` — `useAuth()`: user, login/logout, `isAuthenticated`, session restoration
- `JugadorContext` — `useJugador()`: stores the currently selected/viewed player across navigation
- `SolicitudesContext` — `useSolicitudes()`: `cargarOpciones(contexto)`, `crearSolicitud(payload)` for the edit-request flow
- Feature flags — `useFeatureFlags()`: flags loaded from `/api/config` (`enableGpt5`, `model`)

### Jugadores Infinite Scroll Pattern

`Jugadores.tsx` fetches all players at once (up to the backend's 1000-item cap), applies client-side filtering, sorts by a daily seed-based "discovery score" (rotates every 24h), and exposes more items in batches of 24 using an `IntersectionObserver`. There is no server-side pagination for the player list.

### Edit-Request (SolicitudEdicion) Workflow

Sensitive mutations don't call APIs directly — they create `SolicitudEdicion` records that go through an approval flow. The UI entry points are `SolicitudButton` and `SolicitudModal` in `src/shared/components/`. Custom typed errors (`SolicitudValidationError`, `SolicitudPermissionError`, `SolicitudBusinessError`) are defined in `src/shared/types/solicitudesEdicion.ts`.

### Tailwind Theme

Custom `brand` color palette in `tailwind.config.js` (9-shade blue, `brand-50: #f5f7ff` → `brand-900: #1f2c6d`). Custom breakpoint: `xs: 440px`. Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`.

### Notable Dependencies

- **Maps:** `leaflet` + `react-leaflet` — used in La Plaza geo-filtering
- **Charts:** `recharts` — used in stats/ranking views
- **Image export:** `html-to-image` — used for sharing/exporting scorecards
- **Real-time:** `socket.io-client` — La Plaza lobby sync
