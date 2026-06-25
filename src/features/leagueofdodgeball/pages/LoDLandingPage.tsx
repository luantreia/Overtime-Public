import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import {
  MapPinIcon, TrophyIcon, UserGroupIcon, BoltIcon,
  ShieldCheckIcon, StarIcon, ChevronDownIcon, ArrowRightIcon,
} from '@heroicons/react/24/outline';

const STEPS = [
  { n: '01', icon: MapPinIcon,     title: 'Encontrá un partido',     desc: 'Explorá los lobbies abiertos cerca tuyo. Ves la distancia, modalidad, categoría y cuántos jugadores faltan.' },
  { n: '02', icon: UserGroupIcon,  title: 'Unite al lobby',          desc: 'Con un perfil de jugador te unís al lobby. El host puede equilibrar los equipos por ELO automáticamente.' },
  { n: '03', icon: ShieldCheckIcon,title: 'Check-in GPS',            desc: 'Al llegar a la cancha confirmás tu presencia con GPS. Si hay un Oficial, él valida el partido.' },
  { n: '04', icon: BoltIcon,       title: 'Jugá',                    desc: 'El host o el Oficial registran los sets en vivo. Al terminar, ambos capitanes confirman el marcador.' },
  { n: '05', icon: TrophyIcon,     title: 'Sumá puntos de ranking',  desc: 'El resultado mueve tu ELO. Los partidos con Oficial oficial valen más (0.5×) que sin él (0.3×).' },
  { n: '06', icon: StarIcon,       title: 'Votá la conducta',        desc: 'Post-partido calificás a cada jugador. El Karma acumulado influye en cómo el sistema te trata.' },
];

const PILLARS = [
  {
    icon: MapPinIcon,
    color: 'brand',
    title: 'La Plaza',
    sub: 'Dodgeball callejero rankeado',
    desc: 'Creá o unite a partidos en cualquier cancha de tu ciudad. GPS, matchmaking por ELO y resultados verificados.',
    ctas: [
      { label: 'Explorar partidos', to: '/plaza' },
      { label: 'Crear un lobby', to: '/plaza/crear' },
    ],
  },
  {
    icon: TrophyIcon,
    color: 'amber',
    title: 'Ranking Global',
    sub: 'ELO por modalidad y categoría',
    desc: 'Todos los partidos —de La Plaza y de competencias— suman al mismo ranking. Subí posiciones jugando.',
    ctas: [
      { label: 'Ver el ranking', to: '/ranking' },
      { label: 'Ver jugadores', to: '/jugadores' },
    ],
  },
  {
    icon: ShieldCheckIcon,
    color: 'indigo',
    title: 'Competencias LoD',
    sub: 'Torneos con ranking verificado',
    desc: 'Las competencias con el sello LoD tienen ranking habilitado. Participar en ellas suma más al ELO global.',
    ctas: [
      { label: 'Ver competencias LoD', to: '/lod/competencias' },
      { label: 'Ver todas las competencias', to: '/competencias' },
    ],
  },
];

const PATHS = [
  {
    label: 'Nuevo en el dodgeball',
    emoji: '👋',
    desc: 'Nunca jugaste o recién empezás.',
    actions: [
      { label: 'Ver jugadores de la comunidad', to: '/jugadores' },
      { label: 'Explorar competencias', to: '/competencias' },
      { label: 'Crear tu cuenta', to: '/register', primary: true },
    ],
  },
  {
    label: 'Ya jugás dodgeball',
    emoji: '🏐',
    desc: 'Jugás en tu club o liga y querés sumar al ranking.',
    actions: [
      { label: 'Buscar un partido cerca', to: '/plaza' },
      { label: 'Ver competencias LoD', to: '/lod/competencias' },
      { label: 'Registrate y empezá', to: '/register', primary: true },
    ],
  },
  {
    label: 'Jugador competitivo',
    emoji: '🏆',
    desc: 'Querés subir en el ranking y medir tu nivel.',
    actions: [
      { label: 'Ver el ranking global', to: '/ranking' },
      { label: 'Explorar equipos', to: '/equipos' },
      { label: 'Ir a La Plaza', to: '/plaza', primary: true },
    ],
  },
];

export default function LoDLandingPage() {
  usePageTitle('League of Dodgeball');
  const [openPath, setOpenPath] = useState<number | null>(null);

  return (
    <div className="space-y-0 -mt-6 -mx-4">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-brand-900 to-brand-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest uppercase text-brand-200">
            League of Dodgeball
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight tracking-tight">
            Dodgeball.<br />
            <span className="text-brand-300">En la calle.</span><br />
            Rankeado.
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Encontrá partidos cerca tuyo, sumá puntos al ranking global y formá parte de la comunidad de dodgeball más activa.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/plaza" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-400 text-white font-black rounded-xl transition-colors shadow-lg shadow-brand-900/50 text-sm">
              <MapPinIcon className="h-4 w-4" /> Encontrá un partido cerca
            </Link>
            <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-colors text-sm">
              Crear mi cuenta gratis
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2">
            <Link to="/jugadores" className="hover:text-white transition-colors flex items-center gap-1">Ver jugadores <ArrowRightIcon className="h-3 w-3" /></Link>
            <span className="text-slate-600">·</span>
            <Link to="/ranking" className="hover:text-white transition-colors flex items-center gap-1">Ver el ranking <ArrowRightIcon className="h-3 w-3" /></Link>
            <span className="text-slate-600">·</span>
            <Link to="/equipos" className="hover:text-white transition-colors flex items-center gap-1">Ver equipos <ArrowRightIcon className="h-3 w-3" /></Link>
          </div>
        </div>
      </section>

      {/* ── Los tres pilares ── */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900">¿Qué es League of Dodgeball?</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Un sistema pensado para que el dodgeball callejero tenga estructura, competencia y comunidad.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className={`rounded-2xl border-2 p-6 space-y-4 ${
                p.color === 'brand' ? 'border-brand-100 bg-brand-50' :
                p.color === 'amber' ? 'border-amber-100 bg-amber-50' :
                'border-indigo-100 bg-indigo-50'
              }`}>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  p.color === 'brand' ? 'bg-brand-600' :
                  p.color === 'amber' ? 'bg-amber-500' :
                  'bg-indigo-600'
                }`}>
                  <p.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-lg">{p.title}</p>
                  <p className={`text-xs font-bold mt-0.5 ${
                    p.color === 'brand' ? 'text-brand-600' :
                    p.color === 'amber' ? 'text-amber-600' :
                    'text-indigo-600'
                  }`}>{p.sub}</p>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                <div className="space-y-2 pt-1">
                  {p.ctas.map((cta, i) => (
                    <Link key={cta.to} to={cta.to} className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                      i === 0
                        ? p.color === 'brand' ? 'bg-brand-600 text-white hover:bg-brand-700' :
                          p.color === 'amber' ? 'bg-amber-500 text-white hover:bg-amber-600' :
                          'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-white/70 text-slate-700 hover:bg-white'
                    }`}>
                      {cta.label}
                      <ArrowRightIcon className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="bg-slate-50 px-6 py-16 border-t border-slate-100">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Cómo funciona un partido</h2>
            <p className="text-slate-500">De encontrar el lobby a ganar puntos de ranking en 6 pasos.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <div key={s.n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-slate-400 tracking-widest">{s.n}</span>
                  <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-brand-600" />
                  </div>
                </div>
                <p className="font-black text-slate-900">{s.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-slate-500">¿Querés empezar ya?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/plaza" className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm">
                <MapPinIcon className="h-4 w-4" /> Explorar La Plaza
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                Crear mi cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── ELO y Karma ── */}
      <section className="bg-white px-6 py-16 border-t border-slate-100">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-black text-slate-900">Un sistema de puntos que tiene sentido</h2>
              <p className="text-slate-500 leading-relaxed">No todos los partidos valen lo mismo. El ELO sube o baja según el nivel de tu rival y cómo salió el partido. El Karma refleja cómo jugaste como persona.</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <TrophyIcon className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">ELO por modalidad y categoría</p>
                    <p className="text-xs text-slate-500 mt-0.5">Tenés un rating independiente por Foam/Cloth y por Masculino/Femenino/Mixto/Libre. Cada combinación es su propio ranking.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <ShieldCheckIcon className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Multiplicador por Oficial</p>
                    <p className="text-xs text-slate-500 mt-0.5">Sin Oficial: 0.3× · Con Oficial: 0.5× — Los partidos verificados valen más para mantener la integridad del ranking.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <StarIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Karma de conducta</p>
                    <p className="text-xs text-slate-500 mt-0.5">Post-partido votás la conducta de cada jugador. El Karma bajo puede restringir tu acceso a lobbies de alto nivel.</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/ranking" className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm">
                  <TrophyIcon className="h-4 w-4" /> Ver el ranking global
                </Link>
                <Link to="/jugadores" className="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  Explorar jugadores
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-brand-900 p-6 text-white space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-brand-300">Ejemplo de resultado</p>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-3xl font-black">Equipo A</p>
                    <p className="text-xs text-slate-400 mt-1">ELO prom. 1620</p>
                  </div>
                  <div className="text-center px-4">
                    <p className="text-4xl font-black text-brand-300">3 – 1</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black">Equipo B</p>
                    <p className="text-xs text-slate-400 mt-1">ELO prom. 1480</p>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Ganadores</p>
                    <p className="text-xl font-black text-green-400 mt-1">+18 ELO</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Perdedores</p>
                    <p className="text-xl font-black text-red-400 mt-1">−12 ELO</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 text-center">× 0.5 con Oficial · × 0.3 sin Oficial</p>
              </div>
              <Link to="/lod/competencias" className="flex items-center justify-between w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors">
                <div>
                  <p className="text-sm font-bold text-indigo-900">¿Querés más puntos?</p>
                  <p className="text-xs text-indigo-600">Jugá en una competencia LoD verificada</p>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-indigo-600 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Para qué tipo de jugador sos ── */}
      <section className="bg-slate-50 px-6 py-16 border-t border-slate-100">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900">¿Por dónde empezás?</h2>
            <p className="text-slate-500">Dependiendo de tu experiencia, el camino es distinto.</p>
          </div>

          <div className="space-y-3">
            {PATHS.map((path, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenPath(openPath === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{path.emoji}</span>
                    <div>
                      <p className="font-black text-slate-900">{path.label}</p>
                      <p className="text-xs text-slate-500">{path.desc}</p>
                    </div>
                  </div>
                  <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${openPath === i ? 'rotate-180' : ''}`} />
                </button>

                {openPath === i && (
                  <div className="px-5 pb-5 pt-1 flex flex-col sm:flex-row gap-2 border-t border-slate-100">
                    {path.actions.map((action) => (
                      <Link
                        key={action.to}
                        to={action.to}
                        className={`flex-1 text-center px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                          action.primary
                            ? 'bg-brand-600 text-white hover:bg-brand-700'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {action.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-20 text-white text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-4xl font-black leading-tight">¿Listo para jugar?</h2>
          <p className="text-brand-200 text-lg">Registrate, buscá un lobby cerca tuyo y empezá a sumar puntos al ranking global.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-brand-700 font-black rounded-xl hover:bg-brand-50 transition-colors shadow-lg text-sm">
              Crear mi cuenta gratis
            </Link>
            <Link to="/plaza" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 font-bold rounded-xl transition-colors text-sm">
              <MapPinIcon className="h-4 w-4" /> Explorar sin cuenta
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-brand-300 pt-2">
            <Link to="/jugadores" className="hover:text-white transition-colors">Jugadores</Link>
            <span className="text-brand-700">·</span>
            <Link to="/equipos" className="hover:text-white transition-colors">Equipos</Link>
            <span className="text-brand-700">·</span>
            <Link to="/competencias" className="hover:text-white transition-colors">Competencias</Link>
            <span className="text-brand-700">·</span>
            <Link to="/partidos" className="hover:text-white transition-colors">Partidos</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
