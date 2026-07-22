import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import Navbar from './app/layout/Navbar';
import ProtectedRoute from './app/routes/ProtectedRoute';
import { FeatureFlagsProvider } from './shared/config/featureFlags';
import ErrorBoundary from './shared/components/ui/Error/ErrorBoundary';
import FeedbackWidget from './shared/components/FeedbackWidget';
import { minijuegosRoutes } from './features/minijuegos/routes';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours (for offline first)
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Configure Persister (LocalStorage)
const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

// Lazy load components
const LandingPage = lazy(() => import('./features/dashboard/pages/LandingPage'));
const Jugadores = lazy(() => import('./features/jugadores/pages/Jugadores'));
const JugadorDetalle = lazy(() => import('./features/jugadores/pages/JugadorDetalle'));
const Equipos = lazy(() => import('./features/equipos/pages/Equipos'));
const EquipoDetalle = lazy(() => import('./features/equipos/pages/EquipoDetalle'));
const Competencias = lazy(() => import('./features/competencias/pages/Competencias'));
const CompetenciaDetalle = lazy(() => import('./features/competencias/pages/CompetenciaDetalle'));
const OrganizacionDetalle = lazy(() => import('./features/competencias/pages/OrganizacionDetalle'));
const Partidos = lazy(() => import('./features/partidos/pages/Partidos'));
const PartidoDetalle = lazy(() => import('./features/partidos/pages/PartidoDetalle'));
const PlazaExplorar = lazy(() => import('./features/leagueofdodgeball/pages/PlazaExplorar'));
const PlazaLobby = lazy(() => import('./features/leagueofdodgeball/pages/PlazaLobby'));
const PlazaCrear = lazy(() => import('./features/leagueofdodgeball/pages/PlazaCrear'));
const PlazaReportResult = lazy(() => import('./features/leagueofdodgeball/pages/PlazaReportResult'));
const RankingGlobal = lazy(() => import('./features/leagueofdodgeball/pages/RankingGlobalPage'));
const CompetenciasLoD = lazy(() => import('./features/leagueofdodgeball/pages/CompetenciasLoDPage'));
const LoDLanding = lazy(() => import('./features/leagueofdodgeball/pages/LoDLandingPage'));
const SolicitudesPage = lazy(() => import('./features/solicitudes/pages/SolicitudesPage'));
const Perfil = lazy(() => import('./features/perfil/pages/PerfilPage'));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const ClaimPage = lazy(() => import('./features/auth/pages/ClaimPage'));
const NotificacionesPage = lazy(() => import('./features/notificaciones/pages/NotificacionesPage'));
const NotFoundPage = lazy(() => import('./features/error/pages/NotFoundPage'));
const ComoSeJuegaPage = lazy(() => import('./features/reglas/pages/ComoSeJuegaPage'));
const ReglamentoPage = lazy(() => import('./features/reglas/pages/ReglamentoPage'));

const App: React.FC = () => (
  <PersistQueryClientProvider 
    client={queryClient} 
    persistOptions={{ persister }}
  >
    <FeatureFlagsProvider>
    <div className="App">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <ErrorBoundary>
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-center"><div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div><p className="text-slate-600">Cargando...</p></div></div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/claim/:token" element={<ClaimPage />} />
            <Route path="/jugadores" element={<Jugadores />} />
            <Route path="/jugadores/:id" element={<JugadorDetalle />} />
            <Route path="/equipos" element={<Equipos />} />
            <Route path="/equipos/:id" element={<EquipoDetalle />} />
            <Route path="/competencias" element={<Competencias />} />
            <Route path="/competencias/:id" element={<CompetenciaDetalle />} />
            <Route path="/organizaciones/:id" element={<OrganizacionDetalle />} />
            <Route path="/partidos" element={<Partidos />} />
            <Route path="/partidos/:id" element={<PartidoDetalle />} />
            <Route path="/como-se-juega" element={<ComoSeJuegaPage />} />
            <Route path="/reglamento" element={<ReglamentoPage />} />
            
            {minijuegosRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}

            <Route path="/ranking" element={<RankingGlobal />} />
            <Route path="/lod" element={<LoDLanding />} />
            <Route path="/lod/competencias" element={<CompetenciasLoD />} />

            {/* La Plaza Routes */}
            <Route path="/plaza" element={<PlazaExplorar />} />
            <Route path="/plaza/crear" element={
              <ProtectedRoute>
                <PlazaCrear />
              </ProtectedRoute>
            } />
            <Route path="/plaza/lobby/:id" element={
              <ProtectedRoute>
                <PlazaLobby />
              </ProtectedRoute>
            } />
            <Route path="/plaza/lobby/:id/report" element={
              <ProtectedRoute>
                <PlazaReportResult />
              </ProtectedRoute>
            } />

            <Route path="/solicitudes" element={
              <ProtectedRoute>
                <SolicitudesPage />
              </ProtectedRoute>
            } />
            <Route path="/perfil" element={
              <ProtectedRoute>
                <Perfil />
              </ProtectedRoute>
            } />
            <Route path="/notificaciones" element={
              <ProtectedRoute>
                <NotificacionesPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </div>
    </div>
      <FeedbackWidget />
    </FeatureFlagsProvider>
  </PersistQueryClientProvider>
);export default App;
