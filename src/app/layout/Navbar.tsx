import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../providers/AuthContext';
// removed feature flag usage

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/jugadores', label: 'Jugadores' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/competencias', label: 'Competencias' },
  { to: '/organizaciones', label: 'Organizaciones' },
  { to: '/partidos', label: 'Partidos' },
];

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  // feature flags removed

  return (
    <header className="border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow">
            OTV
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Overtime Public (TS)</p>
            <p className="text-xs text-slate-500">Exploración pública</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 transition-colors ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'
                }`
              }
            >
              {label}
            </NavLink>
          ))}

          {isAuthenticated ? (
            <>
              <NavLink
                to="/perfil"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition-colors ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'
                  }`
                }
              >
                {user?.nombre || 'Perfil'}
              </NavLink>
              <button
                onClick={logout}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Iniciar sesión
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
              >
                Registrarse
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
