# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server (port 3000)
npm run build      # Production build
npm test           # React Testing Library (Jest, no test files currently exist)
```

No lint script is configured. TypeScript errors surface via `react-scripts build`.

## Architecture

### Entry & Providers

`src/index.tsx` wraps the app in: `GlobalErrorBoundary` → `QueryClientProvider` → `PersistQueryClientProvider` → `AuthContext` → `SolicitudesContext` → `FeatureFlagsProvider` → `BrowserRouter` → `App`.

It also runs version-aware cache busting on mount: reads `APP_VERSION` from localStorage, clears React Query's persisted cache (and unregisters the Service Worker) if the stored version mismatches. This prevents stale-cache 404 loops after deploys.

`FeatureFlagsProvider` (`src/shared/config/featureFlags.tsx`) fetches `/api/config` on mount and exposes feature flags (e.g., `enableGPT5`) via context. If a feature is conditionally rendered, this is where to look.

`src/App.tsx` declares all routes. Every page component is `React.lazy`-loaded.

### Data Fetching

TanStack Query v5 is the primary data layer and the correct pattern for new code:
- `staleTime: 24 hours`, `gcTime: 7 days`, `retry: 1`, `refetchOnWindowFocus: false` — intentionally offline-first
- All queries are keyed by domain and entity ID (e.g., `['jugadores', id]`)
- Data is persisted to localStorage via `@tanstack/react-query-persist-client`

Services in `src/features/<domain>/services/` expose **static async methods** (e.g., `JugadorService.getAll()`, `EquipoService.getById(id)`). Components import the service class and pass its methods directly as `queryFn`.

`src/shared/hooks/useEntity.ts` is a legacy hook that fetches data with plain `useState`/`useEffect`. It exists in a few older components but should not be used for new code — use TanStack Query instead.

### Auth

`src/app/providers/AuthContext.tsx` manages session state:
- On mount: reads `overtime_token` from localStorage, calls `authService.getProfile()` to restore session
- `useAuth()` returns `{ user, isAuthenticated, isLoading, login, register, logout, refreshProfile }`
- `src/app/routes/ProtectedRoute.tsx` wraps routes that require login

`src/shared/utils/authFetch.ts` is the core fetch wrapper:
- Attaches Bearer token from localStorage
- Automatically retries with a refreshed token on 401 (calls `/auth/refresh`, stores new tokens)
- Used inside all service classes for authenticated endpoints

### API Client

There are two distinct API layers — they serve different purposes:

**`src/shared/api/client.ts`** — a small collection of public (unauthenticated) endpoints: landing page insights, public player/team lists, and entity creation requests. Only used for those specific cases.

**`src/shared/utils/authFetch.ts`** — the core fetch wrapper used by all feature services. It attaches the Bearer token, and on a 401 it automatically calls `/auth/refresh`, stores the new tokens, and retries the original request. Every service class (`JugadorService`, `PartidoService`, etc.) uses this internally.

`src/utils/apiClient.ts` contains helper functions for reading/writing tokens to localStorage — it is not a fetch client.

The base URL comes from `REACT_APP_API_URL` (set to the production Render backend). In Vercel, `/api/*` is rewritten to the Render backend by `vercel.json`.

### Feature Structure

Each feature under `src/features/<domain>/` contains:
- `pages/` — route-level components
- `services/` — one or more service classes with static methods
- `components/` — feature-local components (when present)

Feature domains: `auth`, `dashboard`, `jugadores`, `equipos`, `competencias`, `partidos`, `leagueofdodgeball`, `solicitudes`, `perfil`, `notificaciones`.

The `leagueofdodgeball/` feature is the most complex: it handles geolocation-based casual match lobbies using Leaflet maps and Socket.IO (`src/shared/utils/socket.ts`).

### Edit Requests (Solicitudes)

The platform has a multi-step approval workflow for sensitive mutations (adding a player to a team, creating a participation, etc.). `SolicitudesContext` wraps the whole app and exposes `useSolicitudes()`:
- `cargarOpciones(contexto)` — loads available request types for the current entity context
- `crearSolicitud(payload)` — submits a new edit request

Types are in `src/shared/types/solicitudesEdicion.ts`. There are 26+ `SolicitudEdicionTipo` values. Custom error subclasses (`SolicitudValidationError`, `SolicitudPermissionError`, `SolicitudBusinessError`) are thrown by the service layer.

### Shared Components

Reusable components live in `src/shared/components/`:
- Card components: `JugadorCard`, `EquipoCard`, `CompetenciaCard`, `PartidoCard`, `OrganizacionCard`
- UI primitives in `src/shared/components/ui/`: `Badge`, `Button`, `Modal`, `Spinner`, `Table`, `FilterControls`, etc.
- Domain modals: `SolicitudModal`, `EstadisticasPartidoModal`, `EloExplanationModal`, `DetallePartido`
- Layout: `TablaPosiciones` (standings table), `Bracket` (tournament bracket), `EmptyState`

### Styling

Tailwind CSS with a custom `brand` color palette (blue scale, `brand-50` through `brand-900`) and an `xs` breakpoint at 440px. Plugins: `@tailwindcss/forms` and `@tailwindcss/typography`.

## Environment

```env
REACT_APP_API_URL=https://overtime-ddyl.onrender.com/api
REACT_APP_GPT_MODEL=         # Optional, for AI features
```

There is no dev proxy in `package.json`. All API calls go directly to the URL in `REACT_APP_API_URL`.
