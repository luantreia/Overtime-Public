import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './app/layout/Navbar';
import ProtectedRoute from './app/routes/ProtectedRoute';
import { FeatureFlagsProvider } from './shared/config/featureFlags';

// Lazy load components
const LandingPage = lazy(() => import('./features/dashboard/pages/LandingPage'));
const Jugadores = lazy(() => import('./features/jugadores/pages/Jugadores'));
const JugadorDetalle = lazy(() => import('./features/jugadores/pages/JugadorDetalle'));
const Equipos = lazy(() => import('./features/equipos/pages/Equipos'));
const EquipoDetalle = lazy(() => import('./features/equipos/pages/EquipoDetalle'));
const Competencias = lazy(() => import('./features/competencias/pages/Competencias'));
const CompetenciaDetalle = lazy(() => import('./features/competencias/pages/CompetenciaDetalle'));
const Partidos = lazy(() => import('./features/partidos/pages/Partidos'));
const PartidoDetalle = lazy(() => import('./features/partidos/pages/PartidoDetalle'));
const SolicitudesPage = lazy(() => import('./features/solicitudes/pages/SolicitudesPage'));
const Perfil = lazy(() => import('./features/perfil/pages/PerfilPage'));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));

const App: React.FC = () => (
  <FeatureFlagsProvider>
  <div className="App">
    <Navbar />
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-center"><div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div><p className="text-slate-600">Cargando...</p></div></div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/jugadores" element={<Jugadores />} />
          <Route path="/jugadores/:id" element={<JugadorDetalle />} />
          <Route path="/equipos" element={<Equipos />} />
          <Route path="/equipos/:id" element={<EquipoDetalle />} />
          <Route path="/competencias" element={<Competencias />} />
          <Route path="/competencias/:id" element={<CompetenciaDetalle />} />
          <Route path="/partidos" element={<Partidos />} />
          <Route path="/partidos/:id" element={<PartidoDetalle />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  </div>
  </FeatureFlagsProvider>
);export default App;
