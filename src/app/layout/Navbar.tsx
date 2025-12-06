import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../providers/AuthContext';
// removed feature flag usage

const links = [
  { to: '/', label: 'Inicio' },
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

        {/* Botón hamburguesa para móviles */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <XMarkIcon className="h-6 w-6 text-slate-600" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-slate-600" />
          )}
        </button>

        {/* Nav desktop */}
        <nav className="hidden md:flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
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
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsMenuOpen(false)}></div>
            <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg">
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <span className="font-semibold text-slate-900">Menú</span>
                <button onClick={() => setIsMenuOpen(false)}>
                  <XMarkIcon className="h-6 w-6 text-slate-600" />
                </button>
              </div>
              <nav className="flex flex-col p-4 space-y-2">
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
                  <>
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
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900 text-left"
                    >
                      Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
