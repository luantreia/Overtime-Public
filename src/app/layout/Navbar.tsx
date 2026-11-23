import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDownIcon, HomeIcon, CalendarDaysIcon, MapPinIcon, TrophyIcon, Bars3Icon } from '@heroicons/react/24/outline';
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
  { to: '/tv', label: 'TV' },
  { to: '/como-se-juega', label: 'Cómo se juega' },
];

// Barra inferior mobile: lo que se usa en la cancha. "Más" abre el mismo menú del header.
const BOTTOM_LINKS = [
  { to: '/', label: 'Inicio', Icon: HomeIcon, end: true },
  { to: '/partidos', label: 'Partidos', Icon: CalendarDaysIcon, end: false },
  { to: '/plaza', label: 'La Plaza', Icon: MapPinIcon, end: false },
  { to: '/ranking', label: 'Ranking', Icon: TrophyIcon, end: false },
];

const Navbar: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoDOpen, setIsLoDOpen] = useState(false);
  const [isMobileLoDOpen, setIsMobileLoDOpen] = useState(false);
  const location = useLocation();
  const lodRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const masRef = useRef<HTMLButtonElement>(null);

  // Cierre explícito (Escape, botón Cerrar, fondo): devuelve el foco a "Más".
  // Al navegar no se devuelve: de eso se encarga RouteFocus.
  const cerrarMenu = () => {
    setIsMenuOpen(false);
    masRef.current?.focus();
  };

  const isLoDActive = LOD_PATHS.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Focus trap del panel "Más": al abrir enfoca el primer control, Tab/Shift+Tab ciclan adentro.
  useEffect(() => {
    if (!isMenuOpen) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cerrarMenu();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const els = focusables();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      const dentro = panel.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !dentro)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !dentro)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMenuOpen]);

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
    <>
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6 sm:py-4">
        <NavLink to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <img src="/logo.png" alt="Overtime Logo" className="h-8 w-auto sm:h-10" />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">Overtime Dodgeball</p>
            <p className="text-xs text-slate-500">Comunidad de Dodgeball</p>
          </div>
        </NavLink>


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

      </div>
    </header>

    <nav
      aria-label="Navegación rápida"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {BOTTOM_LINKS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2 text-2xs font-semibold ${isActive ? 'text-brand-600' : 'text-slate-600'}`
              }
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <button
            type="button"
            ref={masRef}
            onClick={() => (isMenuOpen ? cerrarMenu() : setIsMenuOpen(true))}
            aria-expanded={isMenuOpen}
            aria-controls="menu-mas"
            className={`flex w-full flex-col items-center gap-0.5 py-2 text-2xs font-semibold ${isMenuOpen ? 'text-brand-600' : 'text-slate-600'}`}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            Más
          </button>
        </li>
      </ul>
    </nav>

          {/* Menú móvil */}
          {isMenuOpen && (
            <>
              {/* Fondo para cerrar con el mouse/toque. Con teclado se cierra con Escape o con el botón Cerrar,
                  así que no hace falta que esto sea interactivo (y no debe recibir foco). */}
              {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
              <div
                aria-hidden="true"
                className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
                onClick={cerrarMenu}
              />
              <div ref={panelRef} id="menu-mas" role="dialog" aria-modal="true" aria-label="Más secciones" className="fixed inset-x-0 bottom-0 z-40 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white px-4 pt-2 pb-[calc(4.5rem+env(safe-area-inset-bottom))] shadow-2xl lg:hidden">
                <div className="mx-auto mb-1 h-1 w-10 rounded-full bg-slate-300" aria-hidden="true" />
                <div className="mb-2 flex justify-end">
                  <button type="button" onClick={cerrarMenu} className="rounded-md px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                    Cerrar
                  </button>
                </div>
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
    </>
  );
};

export default Navbar;
