import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../providers/AuthContext';

const LOD_LINKS = [
  { to: '/lod', label: '¿Qué es LoD?' },
  { to: '/plaza', label: 'La Plaza' },
  { to: '/ranking', label: 'Ranking Global' },
  { to: '/lod/competencias', label: 'Competencias LoD' },
];

const LOD_PATHS = ['/plaza', '/ranking', '/lod'];

const links = [
  { to: '/jugadores', label: 'Jugadores' },
  { to: '/equipos', label: 'Equipos' },
  { to: '/competencias', label: 'Competencias' },
  { to: '/partidos', label: 'Partidos' },
  { to: '/como-se-juega', label: 'Reglas' },
];

const Navbar: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoDOpen, setIsLoDOpen] = useState(false);
  const [isMobileLoDOpen, setIsMobileLoDOpen] = useState(false);
  const location = useLocation();
  const lodRef = useRef<HTMLDivElement>(null);

  const isLoDActive = LOD_PATHS.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (lodRef.current && !lodRef.current.contains(e.target as Node)) {
        setIsLoDOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur">
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
          {/* LoD dropdown */}
          <div className="relative" ref={lodRef}>
            <button
              onClick={() => setIsLoDOpen((v) => !v)}
              className={`flex items-center gap-1 rounded-lg px-3 py-2 transition-colors ${
                isLoDActive ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100'
              }`}
            >
              LoD
              <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-150 ${isLoDOpen ? 'rotate-180' : ''}`} />
            </button>
            {isLoDOpen && (
              <div className="absolute left-0 top-full mt-1 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg z-50">
                {LOD_LINKS.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setIsLoDOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2 text-sm transition-colors ${
                        isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 transition-colors ${
                  isActive ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100'
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
                    isActive ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100'
                  }`
                }
              >
                Mis Solicitudes
              </NavLink>
              <NavLink
                to="/perfil"
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition-colors ${
                    isActive ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100'
                  }`
                }
              >
                {user?.nombre || 'Perfil'}
              </NavLink>
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
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
              >
                Registrarse
              </NavLink>
            </>
          )}
        </nav>

        {/* Menú móvil */}
        {isMenuOpen && (
          <>
            <div
              className="fixed inset-0 top-[73px] z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute top-full left-0 right-0 z-50 border-t border-slate-200 bg-white px-4 py-3 shadow-xl lg:hidden">
              <div className="flex flex-col gap-2">
                {/* LoD expandable en móvil */}
                <div>
                  <button
                    onClick={() => setIsMobileLoDOpen((v) => !v)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                      isLoDActive ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span>LoD</span>
                    <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform duration-150 ${isMobileLoDOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isMobileLoDOpen && (
                    <div className="mt-1 ml-3 flex flex-col gap-1 border-l-2 border-brand-200 pl-3">
                      {LOD_LINKS.map(({ to, label }) => (
                        <NavLink
                          key={to}
                          to={to}
                          className={({ isActive }) =>
                            `rounded-lg px-3 py-2 text-sm transition-colors ${
                              isActive ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100'
                            }`
                          }
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>

                {links.map(({ to, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2 transition-colors ${
                        isActive ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100'
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
                          isActive ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100'
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
                          isActive ? 'bg-brand-100 text-brand-700' : 'hover:bg-slate-100'
                        }`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {user?.nombre || 'Perfil'}
                    </NavLink>
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
                      className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-brand-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrarse
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
