import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';
import { CompetenciaService, type Competencia } from '../../competencias/services/competenciaService';
import { RankedService, type LeaderboardItem } from '../../competencias/services/rankedService';
import { useEquiposSeguidos } from '../../../shared/hooks/useEquiposSeguidos';
import InstalarAppModal from '../../../shared/components/InstalarAppModal/InstalarAppModal';

/**
 * Home como tablero de acción: qué se juega ahora, dónde sumarse y quién lidera,
 * en ese orden. Las guías (cómo se juega / reglamento) van al pie.
 */

const esStandalone = (): boolean =>
  window.matchMedia?.('(display-mode: standalone)')?.matches || (window.navigator as any).standalone === true;

const idDe = (p: { _id?: string; id?: string }) => p._id || p.id || '';
const esHoy = (iso?: string) => !!iso && new Date(iso).toDateString() === new Date().toDateString();
const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });

const SectionHeader = ({ title, subtitle, href, cta = 'Ver todos' }: { title: string; subtitle?: string; href: string; cta?: string }) => (
  <div className="mb-4 flex items-end justify-between gap-4">
    <div className="min-w-0">
      <h2 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">{title}</h2>
      {subtitle && <p className="truncate text-sm text-slate-500">{subtitle}</p>}
    </div>
    <Link to={href} className="flex-shrink-0 text-sm font-semibold text-brand-600 hover:text-brand-700">
      {cta} →
    </Link>
  </div>
);

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} aria-hidden="true" />
);

// ── Partido (en vivo / hoy / final) ─────────────────────────────────────────
const EstadoBadge = ({ p }: { p: Partido }) => {
  if (p.estado === 'en_juego') {
    return (
      <span className="inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-red-600 px-2 py-0.5 text-2xs font-black uppercase tracking-wider text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden="true" />
        En vivo{setsDe(p).length > 0 && <span className="tabular-nums"> · Set {setsDe(p).length}</span>}
      </span>
    );
  }
  if (p.estado === 'finalizado') {
    return <span className="rounded-full bg-slate-900 px-2 py-0.5 text-2xs font-black uppercase tracking-wider text-white">Final</span>;
  }
  const label = p.fecha ? `${esHoy(p.fecha) ? 'Hoy' : fechaCorta(p.fecha)} ${p.hora || hora(p.fecha)}` : 'Próximo';
  return <span className="rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-slate-700 tabular-nums">{label}</span>;
};

const Escudo = ({ src, nombre }: { src?: string; nombre?: string }) =>
  src ? (
    <img src={src} alt="" className="h-7 w-7 flex-shrink-0 rounded-full object-cover" loading="lazy" />
  ) : (
    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xs font-black text-slate-600" aria-hidden="true">
      {(nombre || '?').slice(0, 2).toUpperCase()}
    </span>
  );

// Un SetPartido sólo guarda quién lo ganó (no puntos), así que el desglose es la secuencia de ganadores.
type SetResumen = { numeroSet: number; ganadorSet?: 'local' | 'visitante' | 'empate' | 'pendiente'; estadoSet?: 'en_juego' | 'finalizado' };
const setsDe = (p: Partido): SetResumen[] =>
  (Array.isArray(p.sets) ? (p.sets as SetResumen[]) : []).slice().sort((a, b) => a.numeroSet - b.numeroSet);

const ETIQUETA_GANADOR = { local: 'local', visitante: 'visitante', empate: 'empate', pendiente: 'en juego' } as const;

const CeldasSets = ({ sets, lado }: { sets: SetResumen[]; lado: 'local' | 'visitante' }) => (
  <span className="flex gap-1" aria-hidden="true">
    {sets.map((s) => {
      const gano = s.ganadorSet === lado;
      const abierto = s.estadoSet === 'en_juego' || s.ganadorSet === 'pendiente' || !s.ganadorSet;
      return (
        <span
          key={s.numeroSet}
          className={`h-2.5 w-2.5 rounded-full ${
            abierto ? 'animate-pulse bg-red-300' : gano ? 'bg-slate-900' : s.ganadorSet === 'empate' ? 'bg-slate-400' : 'border border-slate-300'
          }`}
        />
      );
    })}
  </span>
);

const PartidoTile = ({ p }: { p: Partido }) => {
  const conMarcador = p.estado === 'en_juego' || p.estado === 'finalizado' || p.estado === 'suspendido';
  const sets = conMarcador ? setsDe(p) : [];
  const filas = [
    { eq: p.equipoLocal, pts: p.marcadorLocal, lado: 'local' as const },
    { eq: p.equipoVisitante, pts: p.marcadorVisitante, lado: 'visitante' as const },
  ];
  return (
    <Link
      to={`/partidos/${idDe(p)}`}
      className={`block w-[82%] min-w-0 flex-shrink-0 snap-start rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:w-auto ${
        p.estado === 'en_juego' ? 'border-red-200' : 'border-slate-200 hover:border-brand-300'
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <EstadoBadge p={p} />
        <span className="truncate text-2xs text-muted">{p.competencia?.nombre || p.sede?.nombre || ''}</span>
      </div>
      <ul className="space-y-2">
        {filas.map(({ eq, pts, lado }) => (
          <li key={lado} className="flex items-center gap-2">
            <Escudo src={eq?.escudo} nombre={eq?.nombre} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{eq?.nombre || 'A definir'}</span>
            {sets.length > 0 && sets.length <= 5 && <CeldasSets sets={sets} lado={lado} />}
            {sets.length > 5 && (
              <span className="whitespace-nowrap text-xs tabular-nums text-muted" aria-hidden="true">
                {sets.filter((s) => s.ganadorSet === lado).length} sets
              </span>
            )}
            {conMarcador && <span className="w-7 text-right text-lg font-black tabular-nums text-slate-900">{pts ?? 0}</span>}
          </li>
        ))}
      </ul>
      {sets.length > 0 && (
        <p className="sr-only">
          Sets: {sets.map((s) => `set ${s.numeroSet} ${ETIQUETA_GANADOR[s.ganadorSet ?? 'pendiente']}`).join(', ')}.
        </p>
      )}
      <p className="mt-3 text-xs font-semibold text-brand-600">Ver partido y planilla →</p>
    </Link>
  );
};

// ── Competencias ────────────────────────────────────────────────────────────
const capitalizar = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

const CompetenciaFila = ({ c }: { c: Competencia }) => {
  const img: string | undefined = c.foto || c.imagen || c.organizacion?.logo;
  const chips = [c.modalidad, c.categoria].filter(Boolean).map((v) => capitalizar(String(v)));
  return (
    <li>
      <Link to={`/competencias/${c.id}`} className="flex items-center gap-3 p-3 transition hover:bg-slate-50">
        {img ? (
          <img src={img} alt="" className="h-11 w-11 flex-shrink-0 rounded-xl object-cover" loading="lazy" />
        ) : (
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xs font-black text-brand-700" aria-hidden="true">
            {(c.nombre || '?').slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-slate-900">{c.nombre}</p>
          <p className="truncate text-xs text-slate-500">
            {[c.organizacion?.nombre, ...chips].filter(Boolean).join(' · ')}
          </p>
        </div>
        <span className="flex-shrink-0 text-slate-400" aria-hidden="true">›</span>
      </Link>
    </li>
  );
};

// ── Ranking ─────────────────────────────────────────────────────────────────
const MODALIDADES = ['Foam', 'Cloth'] as const;
type Modalidad = (typeof MODALIDADES)[number];

const Delta = ({ v }: { v?: number }) => {
  if (!v) return <span className="w-10 text-right text-xs text-muted tabular-nums">—</span>;
  return (
    <span className={`w-10 text-right text-xs font-bold tabular-nums ${v > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
      {v > 0 ? '+' : ''}{Math.round(v)}
    </span>
  );
};

const TopRanking = () => {
  const [modalidad, setModalidad] = useState<Modalidad>('Foam');
  const { data, isLoading } = useQuery({
    queryKey: ['home-ranking', modalidad],
    queryFn: () => RankedService.getLeaderboard({ modalidad, categoria: 'Libre', limit: 5 }).then((r) => r.items ?? []).catch(() => [] as LeaderboardItem[]),
    staleTime: 1000 * 60 * 10,
  });
  const items = (data ?? []).slice(0, 5);

  return (
    <section aria-labelledby="home-ranking">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id="home-ranking" className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">Top Ranking ELO</h2>
        <div role="group" aria-label="Modalidad" className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold">
          {MODALIDADES.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={modalidad === m}
              onClick={() => setModalidad(m)}
              className={`rounded-md px-3 py-1 transition ${modalidad === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-2 p-4">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-8" />)}</div>
        ) : items.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">Todavía no hay jugadores rankeados en {modalidad}.</p>
        ) : (
          <ol className="divide-y divide-slate-100 text-sm">
            {items.map((it, i) => (
              <li key={it.playerId} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-5 flex-shrink-0 font-black tabular-nums text-slate-500">{i + 1}</span>
                <Link to={`/jugadores/${it.playerId}`} className="min-w-0 flex-1 truncate font-semibold text-slate-900 hover:text-brand-600">
                  {it.playerName || 'Jugador'}
                </Link>
                <span className="hidden flex-shrink-0 text-xs tabular-nums text-muted sm:inline">{it.matchesPlayed} PJ</span>
                <span className="flex-shrink-0 font-black tabular-nums text-slate-900">{Math.round(it.rating)}</span>
                <Delta v={it.lastDelta} />
              </li>
            ))}
          </ol>
        )}
      </div>
      <Link to="/ranking" className="mt-3 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700">Ver ranking completo →</Link>
    </section>
  );
};

// ── Tus equipos (seguidos desde la página de cada equipo) ──────────────────
/**
 * Un partido por equipo seguido, el más relevante "ahora": en juego > el próximo > el último
 * resultado. No se muestran todos: la home responde "¿qué pasa con los míos?", el calendario
 * completo sigue estando en la página del equipo.
 */
const elegirPartido = (lista: Partido[]): Partido | null => {
  const t = (p: Partido) => new Date(p.fecha || 0).getTime();
  const vivo = lista.find((p) => p.estado === 'en_juego');
  if (vivo) return vivo;
  const prox = lista
    .filter((p) => p.estado === 'programado' && t(p) > Date.now() - 3 * 3600e3)
    .sort((a, b) => t(a) - t(b))[0];
  if (prox) return prox;
  return lista.filter((p) => p.estado === 'finalizado').sort((a, b) => t(b) - t(a))[0] ?? null;
};

const TusEquipos = () => {
  const { seguidos } = useEquiposSeguidos();
  const ids = seguidos.map((e) => e.id);
  const { data, isLoading } = useQuery({
    queryKey: ['home-tus-equipos', ids],
    queryFn: async () =>
      Promise.all(
        seguidos.map(async (eq) => ({
          equipo: eq,
          partido: elegirPartido(await PartidoService.getAll({ equipo: eq.id }).catch(() => [] as Partido[])),
        }))
      ),
    enabled: ids.length > 0,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });

  if (ids.length === 0) return null;

  return (
    <section aria-labelledby="home-tus-equipos">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2 id="home-tus-equipos" className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">Tus equipos</h2>
          <p className="truncate text-sm text-slate-500">Lo último y lo próximo de los equipos que seguís.</p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {seguidos.slice(0, 3).map((e) => <Skeleton key={e.id} className="h-40 w-[82%] flex-shrink-0 sm:w-auto" />)}
        </div>
      ) : (
        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
          {(data ?? []).map(({ equipo, partido }) =>
            partido ? (
              <PartidoTile key={equipo.id} p={partido} />
            ) : (
              <Link
                key={equipo.id}
                to={`/equipos/${equipo.id}`}
                className="flex w-[82%] flex-shrink-0 snap-start items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600 hover:border-brand-600 sm:w-auto"
              >
                <span className="font-bold text-slate-900">{equipo.nombre}</span>
                <span>no tiene partidos cargados.</span>
              </Link>
            )
          )}
        </div>
      )}
    </section>
  );
};

// ── Página ──────────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  usePageTitle();
  const navigate = useNavigate();
  const [instalarAppAbierto, setInstalarAppAbierto] = useState(false);
  const [yaInstalada] = useState(esStandalone);
  const [busqueda, setBusqueda] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['home-tablero-v1'],
    queryFn: async () => {
      const [enJuego, proximos, finalizados, competencias] = await Promise.all([
        PartidoService.getEnCurso().catch(() => [] as Partido[]),
        PartidoService.getProximos().catch(() => [] as Partido[]),
        PartidoService.getFinalizados().catch(() => [] as Partido[]),
        CompetenciaService.getAll().catch(() => [] as Competencia[]),
      ]);
      return { enJuego, proximos, finalizados, competencias };
    },
    // El tablero muestra "ahora": no puede vivir con el staleTime de 24h global.
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });

  // En juego primero, después próximos por fecha; si no alcanza, se completa con los últimos finales.
  const porFecha = (a: Partido, b: Partido) => new Date(a.fecha || 0).getTime() - new Date(b.fecha || 0).getTime();
  const proximos = (data?.proximos ?? []).filter((p) => !p.fecha || new Date(p.fecha).getTime() > Date.now() - 3 * 3600e3).sort(porFecha);
  const finales = (data?.finalizados ?? []).slice().sort((a, b) => porFecha(b, a));
  // Un en_juego sin actividad hace horas es un partido que nadie cerró, no uno en vivo: no se muestra.
  const VIVO_MAX_MS = 6 * 3600e3;
  const enJuego = (data?.enJuego ?? []).filter((p) => {
    const t = new Date(p.updatedAt || p.fecha || 0).getTime();
    return Date.now() - t < VIVO_MAX_MS;
  });
  const partidos = [...enJuego, ...proximos, ...finales].slice(0, 6);

  const competencias = (data?.competencias ?? [])
    .filter((c) => c.estado === 'en_curso')
    .slice(0, 4);

  const hayVivo = enJuego.length > 0;

  const buscar = (e: React.FormEvent) => {
    e.preventDefault();
    const q = busqueda.trim();
    navigate(q ? `/jugadores?q=${encodeURIComponent(q)}` : '/jugadores');
  };

  return (
    // Anula el padding del <main> para que el hero llegue a los bordes.
    <div className="-mx-4 -mt-6 lg:pb-4">
      {/* Hero compacto */}
      {/* En mobile es una sola línea: la barra inferior ya da acceso a Partidos, así que el CTA sólo va en desktop. */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-3 text-white sm:py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <h1 className="text-base font-black tracking-tight sm:text-2xl">
            Dodgeball en vivo: partidos, ligas y ranking.
          </h1>
          <Link to="/partidos" className="hidden flex-shrink-0 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-100 sm:block">
            Explorar partidos
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 pt-6 sm:space-y-10 sm:pt-8">
        <TusEquipos />

        {/* En juego / Próximos */}
        <section aria-label="Partidos">
          <SectionHeader
            title={hayVivo ? 'En juego ahora' : 'Partidos recomendados'}
            subtitle={hayVivo ? 'Lo que se está jugando y lo que viene.' : 'Lo próximo y lo último que se jugó.'}
            href="/partidos"
          />
          {isLoading ? (
            <div className="flex gap-4 overflow-hidden sm:grid sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-[82%] flex-shrink-0 sm:w-auto" />)}
            </div>
          ) : partidos.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No hay partidos cargados todavía.</p>
          ) : (
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3">
              {partidos.map((p) => <PartidoTile key={idDe(p)} p={p} />)}
            </div>
          )}
        </section>

        {/* Competencias 7 / Ranking 5 */}
        <div className="grid gap-6 lg:grid-cols-12">
          <section aria-label="Competencias activas" className="min-w-0 lg:col-span-7">
            <SectionHeader title="Competencias activas" subtitle="Ligas y torneos en curso." href="/competencias" />
            {isLoading ? (
              <div className="space-y-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : competencias.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No hay competencias en curso ahora mismo.</p>
            ) : (
              <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {competencias.map((c) => <CompetenciaFila key={c.id} c={c} />)}
              </ul>
            )}
          </section>
          <div className="min-w-0 lg:col-span-5">
            <TopRanking />
          </div>
        </div>

        {/* Explorador */}
        <section aria-labelledby="home-explorar" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 id="home-explorar" className="mb-3 text-lg font-black tracking-tight text-slate-900">Buscá un jugador o equipo</h2>
          <form onSubmit={buscar} className="flex gap-2" role="search">
            <label htmlFor="home-busqueda" className="sr-only">Nombre del jugador</label>
            <input
              id="home-busqueda"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre del jugador…"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800">Buscar</button>
          </form>
          <div className="mt-3 flex gap-4 text-sm font-semibold">
            <Link to="/jugadores" className="text-brand-600 hover:text-brand-700">Todos los jugadores →</Link>
            <Link to="/equipos" className="text-brand-600 hover:text-brand-700">Todos los equipos →</Link>
          </div>
        </section>

        {/* Onboarding */}
        <section aria-label="Para quienes recién llegan" className="grid gap-4 sm:grid-cols-2">
          <Link to="/como-se-juega" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300">
            <p className="font-bold text-slate-900">Cómo se juega al dodgeball</p>
            <p className="text-sm text-slate-500">Lo básico en dos minutos.</p>
          </Link>
          <Link to="/reglamento" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-300">
            <p className="font-bold text-slate-900">Reglamento oficial</p>
            <p className="text-sm text-slate-500">Reglas Foam y Cloth.</p>
          </Link>
        </section>

        {/* Footer de enlaces */}
        <footer className="border-t border-slate-200 pt-6 text-sm">
          <nav aria-label="Enlaces del sitio" className="flex flex-wrap gap-x-5 gap-y-2 text-slate-600">
            {[
              ['/partidos', 'Partidos'], ['/competencias', 'Competencias'], ['/plaza', 'La Plaza'], ['/ranking', 'Ranking'],
              ['/equipos', 'Equipos'], ['/jugadores', 'Jugadores'], ['/como-se-juega', 'Cómo se juega'], ['/reglamento', 'Reglamento'],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="hover:text-brand-600">{label}</Link>
            ))}
            {!yaInstalada && (
              <button type="button" onClick={() => setInstalarAppAbierto(true)} className="font-semibold text-brand-600 hover:text-brand-700">
                Descargar la app
              </button>
            )}
          </nav>
        </footer>
      </div>

      {instalarAppAbierto && <InstalarAppModal onClose={() => setInstalarAppAbierto(false)} />}
    </div>
  );
};

export default LandingPage;
