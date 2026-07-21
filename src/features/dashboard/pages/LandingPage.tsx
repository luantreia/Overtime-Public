import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../app/providers/AuthContext';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import api from '../../../shared/api/client';
import { PartidoService } from '../../partidos/services/partidoService';
import { CompetenciaService, type Competencia } from '../../competencias/services/competenciaService';
import { PlazaService } from '../../leagueofdodgeball/services/plazaService';
import type { Lobby } from '../../leagueofdodgeball/types';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';
import CompetenciaCard from '../../../shared/components/CompetenciaCard/CompetenciaCard';
import Spinner from '../../../shared/components/ui/Spinner/Spinner';
import EmptyState from '../../../shared/components/EmptyState/EmptyState';
import InstalarAppModal from '../../../shared/components/InstalarAppModal/InstalarAppModal';
import EstadioTemplo from '../../../shared/components/EstadioTemplo/EstadioTemplo';
import type { Partido } from '../../../types';

const esStandalone = (): boolean =>
  window.matchMedia?.('(display-mode: standalone)')?.matches || (window.navigator as any).standalone === true;

const LandingPage: React.FC = () => {
  usePageTitle();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [instalarAppAbierto, setInstalarAppAbierto] = useState(false);
  const [yaInstalada] = useState(esStandalone);

  const { data, isLoading } = useQuery({
    queryKey: ['landing-data-v2'],
    queryFn: async () => {
      const [insights, proximos, finalizados, competencias, lobbies] = await Promise.all([
        api.insights().catch(() => null),
        PartidoService.getProximos().catch(() => [] as Partido[]),
        // insights.destacados.partidosRecientes depende de /public/insights, que hoy 404 en producción —
        // se arma "recientes" directo desde /partidos?estado=finalizado, que sí funciona (mismo patrón que getProximos).
        PartidoService.getFinalizados().catch(() => [] as Partido[]),
        CompetenciaService.getAll().catch(() => [] as Competencia[]),
        PlazaService.getLobbies().catch(() => [] as Lobby[]),
      ]);
      return { insights, proximos, finalizados, competencias, lobbies };
    },
    staleTime: 1000 * 60 * 10,
  });

  const insights = data?.insights;
  const totals = insights?.totals;
  const proximos = ((data?.proximos ?? []) as Partido[]).slice(0, 3);
  const recientes = ((data?.finalizados ?? []) as Partido[])
    .slice()
    .sort((a, b) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime())
    .slice(0, 3);
  const competenciasActivas = (data?.competencias ?? [] as Competencia[])
    .filter((c: Competencia) => {
      const e = String(c.estado || '').toLowerCase();
      return e.includes('curso') || e.includes('activa');
    })
    .slice(0, 3);
  const lobbiesAbiertos = ((data?.lobbies ?? []) as Lobby[])
    .filter((l) => l.status === 'open')
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  const lobbiesPreview = lobbiesAbiertos.slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero — no depende de ningún fetch, renderiza siempre de inmediato. Fondo: estadio 3D "The Temple" */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-10 sm:py-16 text-white">
        <div className="absolute inset-0">
          <EstadioTemplo />
        </div>
        {/* Overlay oscuro para que el texto sea legible sobre la escena 3D */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/90" />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <img src="/logo.png" alt="Overtime Logo" width={96} height={96} className="mx-auto mb-4 sm:mb-6 h-16 w-auto sm:h-24 drop-shadow-lg" />
          <h1 className="mb-3 text-3xl font-black tracking-tight sm:text-5xl">Overtime Dodgeball</h1>
          <p className="mb-6 sm:mb-8 text-base sm:text-xl text-slate-300">Ecosistema competitivo y comunitario de dodgeball</p>

          <div className="mb-8 sm:mb-10 flex min-h-[4.5rem] flex-wrap items-center justify-center gap-x-6 gap-y-3 sm:gap-8">
            {isLoading ? (
              <Spinner size="sm" variant="white" showMessage={false} />
            ) : (
              totals && ([
                { value: totals.jugadores, label: 'Jugadores' },
                { value: totals.partidos, label: 'Partidos' },
                { value: totals.equipos, label: 'Equipos' },
                { value: totals.organizaciones, label: 'Organizaciones' },
              ] as { value: number; label: string }[]).map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-black text-white">{value.toLocaleString('es-AR')}</p>
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-300">{label}</p>
                </div>
              ))
            )}
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/register" className="rounded-lg bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700">
                Empezá a jugar
              </Link>
              <Link to="/login" className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20">
                Ya tengo cuenta
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/perfil" className="rounded-lg bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700">
                Ir a mi perfil
              </Link>
              <Link to="/plaza" className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20">
                Ir a La Plaza
              </Link>
            </div>
          )}

          {!yaInstalada && (
            <button
              type="button"
              onClick={() => setInstalarAppAbierto(true)}
              className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 underline decoration-white/30 underline-offset-4 transition hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
              Descargar la app
            </button>
          )}
        </div>
      </section>

      {instalarAppAbierto && <InstalarAppModal onClose={() => setInstalarAppAbierto(false)} />}

      <div className="mx-auto max-w-6xl space-y-10 sm:space-y-14 px-4 py-10 sm:py-14">

        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" message="Cargando actividad reciente..." />
          </div>
        )}

        {!isLoading && (recientes.length > 0 || proximos.length > 0) && (
          <section>
            <div className="mb-6 sm:mb-10 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Reviví la historia. Jugá tu próximo partido.
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-500">Los resultados que ya se jugaron, y los partidos que todavía podés hacer tuyos.</p>
            </div>

            <div className="grid gap-10 lg:grid-cols-2">
              {recientes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Reviví la historia</p>
                      <h3 className="text-xl font-black text-slate-900">Resultados Recientes</h3>
                    </div>
                    <Link to="/partidos" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                      Ver todos →
                    </Link>
                  </div>
                  <div className="mt-5 space-y-4">
                    {recientes.map((p: any) => (
                      <PartidoCard
                        key={p._id || p.id}
                        partido={p}
                        variante="resultado"
                        onClick={() => navigate(`/partidos/${p._id || p.id}`)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {proximos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Jugá tu próximo partido</p>
                      <h3 className="text-xl font-black text-slate-900">Próximos Partidos</h3>
                    </div>
                    <Link to="/partidos" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                      Ver todos →
                    </Link>
                  </div>
                  <div className="mt-5 space-y-4">
                    {proximos.map((p) => (
                      <PartidoCard
                        key={p._id || p.id}
                        partido={p}
                        variante="proximo"
                        onClick={() => navigate(`/partidos/${p._id || p.id}`)}
                      />
                    ))}
                  </div>
                  <Link
                    to="/plaza"
                    className="mt-5 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-200 px-4 py-4 text-sm font-bold text-brand-700 transition hover:border-brand-300 hover:bg-brand-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    ¿No hay nada cerca? Armá tu propio partido en La Plaza
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}

        {!isLoading && (
          <section>
            <SectionHeader title="Competencias en Curso" href="/competencias" />
            {competenciasActivas.length > 0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {competenciasActivas.map((c) => (
                  <CompetenciaCard
                    key={c.id}
                    competencia={c}
                    variante="en_curso"
                    onClick={() => navigate(`/competencias/${c.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6">
                <EmptyState
                  message="Todavía no hay competencias activas en este momento."
                  icon="🏆"
                  action={{ label: 'Ver todas las competencias', onClick: () => navigate('/competencias') }}
                />
              </div>
            )}
          </section>
        )}

        {!isLoading && lobbiesPreview.length > 0 && (
          <section>
            <SectionHeader title="Plaza cerca tuyo" href="/plaza" />
            <p className="-mt-4 mb-6 text-sm text-slate-500">
              {lobbiesAbiertos.length} {lobbiesAbiertos.length === 1 ? 'partido abierto' : 'partidos abiertos'} esperando jugadores
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {lobbiesPreview.map((lobby) => (
                <button
                  key={lobby._id}
                  onClick={() => navigate('/plaza')}
                  className="flex flex-col items-start gap-1 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-brand-300 hover:shadow-md"
                >
                  <p className="font-bold text-slate-900">{lobby.title}</p>
                  <p className="text-sm text-slate-500">{lobby.location.name}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(lobby.scheduledDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    {' · '}
                    {lobby.players.length}/{lobby.maxPlayers} jugadores
                  </p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Quick nav tiles */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {([
            {
              to: '/jugadores', label: 'Jugadores', desc: 'Directorio completo',
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
            },
            {
              to: '/equipos', label: 'Equipos', desc: 'Todos los equipos',
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />,
            },
            {
              to: '/competencias', label: 'Competencias', desc: 'Ligas y torneos',
              icon: <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />,
            },
            {
              to: '/plaza', label: 'La Plaza', desc: 'Dodgeball de calle',
              icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></>,
            },
          ]).map(({ to, label, desc, icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  {icon}
                </svg>
              </span>
              <div>
                <p className="font-bold text-slate-900 transition-colors group-hover:text-brand-600">{label}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>

      {!isAuthenticated && (
        <section className="bg-brand-600 px-4 py-10 sm:py-16 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-2xl sm:text-3xl font-bold">¿Ya viste la actividad?</h2>
            <p className="mb-6 sm:mb-8 text-base sm:text-xl text-brand-100">
              Creá tu cuenta para sumarte a una liga competitiva, o metete a la Plaza si buscás jugar ya mismo
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/register" className="rounded-lg bg-white px-8 py-3 font-semibold text-brand-600 transition hover:bg-slate-50">
                Crear cuenta gratis
              </Link>
              <Link to="/plaza" className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold backdrop-blur transition hover:bg-white/20">
                Ver la Plaza
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const SectionHeader = ({ title, href }: { title: string; href: string }) => (
  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-black text-slate-900">{title}</h2>
    <Link to={href} className="text-sm font-semibold text-brand-600 hover:text-brand-700">
      Ver todos →
    </Link>
  </div>
);

export default LandingPage;
