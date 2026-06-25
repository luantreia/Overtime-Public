import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../app/providers/AuthContext';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import api from '../../../shared/api/client';
import { PartidoService } from '../../partidos/services/partidoService';
import { CompetenciaService, type Competencia } from '../../competencias/services/competenciaService';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';
import CompetenciaCard from '../../../shared/components/CompetenciaCard/CompetenciaCard';
import type { Partido } from '../../../types';

const LandingPage: React.FC = () => {
  usePageTitle();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['landing-data-v2'],
    queryFn: async () => {
      const [insights, proximos, competencias] = await Promise.all([
        api.insights().catch(() => null),
        PartidoService.getProximos().catch(() => [] as Partido[]),
        CompetenciaService.getAll().catch(() => [] as Competencia[]),
      ]);
      return { insights, proximos, competencias };
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <img src="/logo.png" alt="Overtime Logo" className="mx-auto mb-6 h-24 w-auto drop-shadow-lg" />
          <h1 className="mb-3 text-4xl font-black tracking-tight sm:text-5xl">Overtime Dodgeball</h1>
          <p className="mb-8 text-xl text-slate-300">Ecosistema competitivo y comunitario de dodgeball</p>

          {totals && (
            <div className="mb-10 flex flex-wrap justify-center gap-4 sm:gap-8">
              {([
                { value: totals.jugadores, label: 'Jugadores' },
                { value: totals.partidos, label: 'Partidos' },
                { value: totals.equipos, label: 'Equipos' },
                { value: totals.organizaciones, label: 'Organizaciones' },
              ] as { value: number; label: string }[]).map(({ value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-3xl font-black text-white">{value.toLocaleString('es-AR')}</p>
                  <p className="text-xs uppercase tracking-widest text-slate-400">{label}</p>
                </div>
              ))}
            </div>
          )}

          {!isAuthenticated ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/register" className="rounded-lg bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700">
                Únete a la comunidad
              </Link>
              <Link to="/login" className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/20">
                Iniciar sesión
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
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-14 px-4 py-14">

        {proximos.length > 0 && (
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

        {recientes.length > 0 && (
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

        {competenciasActivas.length > 0 && (
          <section>
            <SectionHeader title="Competencias en Curso" href="/competencias" />
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
              <span className="text-3xl">{icon}</span>
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
            <h2 className="mb-4 text-3xl font-bold">¿Listo para participar?</h2>
            <p className="mb-8 text-xl text-brand-100">
              Únete a la comunidad de Overtime Dodgeball y forma parte del ecosistema competitivo
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/register" className="rounded-lg bg-white px-8 py-3 font-semibold text-brand-600 transition hover:bg-slate-50">
                Registrarme ahora
              </Link>
              <Link to="/jugadores" className="rounded-lg border border-white/20 bg-white/10 px-8 py-3 font-semibold backdrop-blur transition hover:bg-white/20">
                Explorar primero
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
