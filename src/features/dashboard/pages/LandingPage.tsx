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
      const [insights, proximos, competencias, lobbies] = await Promise.all([
        api.insights().catch(() => null),
        PartidoService.getProximos().catch(() => [] as Partido[]),
        CompetenciaService.getAll().catch(() => [] as Competencia[]),
        PlazaService.getLobbies().catch(() => [] as Lobby[]),
      ]);
      return { insights, proximos, competencias, lobbies };
    },
    staleTime: 1000 * 60 * 10,
  });

  const insights = data?.insights;
  const totals = insights?.totals;
  const proximos = ((data?.proximos ?? []) as Partido[]).slice(0, 3);
  const recientes = ((insights?.destacados?.partidosRecientes ?? []) as Partido[]).slice(0, 3);
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
      {/* Hero — no depende de ningún fetch, renderiza siempre de inmediato */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <img src="/logo.png" alt="Overtime Logo" width={96} height={96} className="mx-auto mb-6 h-24 w-auto drop-shadow-lg" />
          <h1 className="mb-3 text-4xl font-black tracking-tight sm:text-5xl">Overtime Dodgeball</h1>
          <p className="mb-8 text-xl text-slate-300">Ecosistema competitivo y comunitario de dodgeball</p>

          <div className="mb-10 flex min-h-[4.5rem] flex-wrap items-center justify-center gap-4 sm:gap-8">
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
                  <p className="text-3xl font-black text-white">{value.toLocaleString('es-AR')}</p>
                  <p className="text-xs uppercase tracking-widest text-slate-300">{label}</p>
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
                Plaza Dodgeball
              </Link>
            </div>
          )}

          {!yaInstalada && (
            <button
              type="button"
              onClick={() => setInstalarAppAbierto(true)}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 underline decoration-white/30 underline-offset-4 transition hover:text-white"
            >
              <span aria-hidden="true">📲</span> Descargar la app
            </button>
          )}
        </div>
      </section>

      {instalarAppAbierto && <InstalarAppModal onClose={() => setInstalarAppAbierto(false)} />}

      {/* The Temple — estadio 3D */}
      <section className="bg-slate-900 px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-black text-white">The Temple</h2>
            <p className="text-sm text-slate-400">Así se ve la cancha antes de que empiece el partido</p>
          </div>
          <EstadioTemplo />
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">

        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" message="Cargando actividad reciente..." />
          </div>
        )}

        {!isLoading && proximos.length > 0 && (
          <section>
            <SectionHeader title="Próximos Partidos" href="/partidos" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {proximos.map((p) => (
                <PartidoCard
                  key={p._id || p.id}
                  partido={p}
                  variante="proximo"
                  onClick={() => navigate(`/partidos/${p._id || p.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {!isLoading && recientes.length > 0 && (
          <section>
            <SectionHeader title="Resultados Recientes" href="/partidos" />
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recientes.map((p: any) => (
                <PartidoCard
                  key={p._id || p.id}
                  partido={p}
                  variante="resultado"
                  onClick={() => navigate(`/partidos/${p._id || p.id}`)}
                />
              ))}
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
            { to: '/jugadores', label: 'Jugadores', desc: 'Directorio completo', icon: '👤' },
            { to: '/equipos', label: 'Equipos', desc: 'Todos los equipos', icon: '🛡️' },
            { to: '/competencias', label: 'Competencias', desc: 'Ligas y torneos', icon: '🏆' },
            { to: '/plaza', label: 'Plaza', desc: 'Dodgeball de calle', icon: '🌐' },
          ] as { to: string; label: string; desc: string; icon: string }[]).map(({ to, label, desc, icon }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <span className="text-3xl" aria-hidden="true">{icon}</span>
              <div>
                <p className="font-bold text-slate-900 transition-colors group-hover:text-brand-600">{label}</p>
                <p className="text-sm text-slate-500">{desc}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>

      {!isAuthenticated && (
        <section className="bg-brand-600 px-4 py-16 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold">¿Ya viste la actividad?</h2>
            <p className="mb-8 text-xl text-brand-100">
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
