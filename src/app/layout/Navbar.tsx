import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../providers/AuthContext';
// removed feature flag usage

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/plaza', label: 'League of Dodgeball' },
  { to: '/jugadores', label: 'Jugadores' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/competencias', label: 'Competencias' },
  { to: '/partidos', label: 'Partidos' },
];

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // feature flags removed

  return (
    <header className="relative border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="Overtime Logo" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">Overtime Dodgeball</p>
            <p className="text-xs text-slate-500">Comunidad de Dodgeball</p>
          </div>
        </NavLink>

        {/* Botón hamburguesa para móviles */}
        <button
          className="inline-flex items-center rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
          onClick={() => setIsMenuOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5h14a1 1 0 100-2H3a1 1 0 000 2zm14 4H3a1 1 0 000 2h14a1 1 0 100-2zm0 6H3a1 1 0 000 2h14a1 1 0 100-2z" clipRule="evenodd"/>
          </svg>
        </button>

        {/* Nav desktop */}
        <nav className="hidden flex-1 items-center justify-center gap-2 text-sm font-medium text-slate-600 lg:flex">
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

          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200"></div>
          ) : isAuthenticated ? (
            <>
              <NavLink
                to="/solicitudes"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition-colors ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'
                  }`
                }
              >
                Mis Solicitudes
              </NavLink>
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

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-2">
                {links.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 transition-colors ${
                        isActive ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'
                      }`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </NavLink>
                ))}

                {isLoading ? (
                  <div className="h-9 w-24 animate-pulse rounded-lg bg-slate-200"></div>
                ) : isAuthenticated ? (
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <NavLink
                      to="/solicitudes"
                      className={({ isActive }) =>
                        `rounded-lg px-3 py-2 transition-colors ${
                          isActive ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'
                        }`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mis Solicitudes
                    </NavLink>
                    <NavLink
                      to="/perfil"
                      className={({ isActive }) =>
                        `rounded-lg px-3 py-2 transition-colors ${
                          isActive ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-slate-100'
                        }`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {user?.nombre || 'Perfil'}
                    </NavLink>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
                    >
                      Cerrar sesión
                    </button>
                  </div>
              ) : (
                <div className="mt-2 flex items-center gap-3">
                  <NavLink
                    to="/login"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Iniciar sesión
                  </NavLink>
                  <NavLink
                    to="/register"
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrarse
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
