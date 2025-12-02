import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './app/layout/Navbar';
import LandingPage from './features/dashboard/pages/LandingPage';
import { Jugadores } from './features/jugadores';
import { Equipos } from './features/equipos';
import { Competencias, CompetenciaDetalle } from './features/competencias';
import { Partidos } from './features/partidos';
import { SolicitudesPage } from './features/solicitudes';
import { Perfil } from './features/perfil';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import ProtectedRoute from './app/routes/ProtectedRoute';
import { FeatureFlagsProvider } from './shared/config/featureFlags';

const App: React.FC = () => (
  <FeatureFlagsProvider>
  <div className="App">
    <Navbar />
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jugadores" element={<Jugadores />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/competencias" element={<Competencias />} />
        <Route path="/competencias/:id" element={<CompetenciaDetalle />} />
        <Route path="/partidos" element={<Partidos />} />
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
    </div>
  </div>
  </FeatureFlagsProvider>
);

export default App;
