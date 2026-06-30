import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { api } from '../../../shared/api/client';
import {
  MapPinIcon, TrophyIcon, UserGroupIcon, BoltIcon,
  ShieldCheckIcon, StarIcon, ArrowRightIcon,
  UserIcon, MagnifyingGlassIcon, EnvelopeIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';

const STEPS_PLAZA = [
  { n: '01', icon: MapPinIcon,    title: 'Encontrá un partido',      desc: 'Explorá los lobbies abiertos cerca tuyo. Ves la distancia, modalidad, categoría y cuántos jugadores faltan.' },
  { n: '02', icon: UserGroupIcon, title: 'Unite y confirmá llegada',  desc: 'Con un perfil de jugador te unís al lobby. Al llegar a la cancha confirmás tu presencia con GPS.' },
  { n: '03', icon: BoltIcon,      title: 'Jugá',                     desc: 'El host registra los sets en vivo. Al terminar, ambos capitanes confirman el marcador final.' },
  { n: '04', icon: TrophyIcon,    title: 'Sumá puntos al ranking',   desc: 'El resultado mueve tu ELO global. Con Oficial: ×0.5 · Sin Oficial: ×0.3.' },
];

const STEPS_COMPETENCIA = [
  { n: '01', icon: MagnifyingGlassIcon, title: 'Encontrá una competencia LoD',  desc: 'Explorá las competencias con el sello LoD habilitado. Podés filtrar por modalidad y categoría.' },
  { n: '02', icon: EnvelopeIcon,        title: 'Encontrá tu competencia',        desc: 'Entrá a Competencias LoD, buscá la de tu club y contactá al organizador desde ahí para inscribirte o unirte a un equipo.' },
  { n: '03', icon: UserIcon,            title: 'Reclamá o creá tu perfil',       desc: 'Si ya participaste en competencias registradas, tu perfil puede estar en la plataforma. Buscalo y asocialo a tu cuenta.' },
  { n: '04', icon: BoltIcon,            title: 'Jugá los partidos',              desc: 'Los partidos son registrados por el organizador. Los resultados quedan guardados en la plataforma.' },
  { n: '05', icon: ChartBarIcon,        title: 'ELO completo (×1)',              desc: 'Los partidos de Competencias LoD suman ELO con el coeficiente completo — sin reducción, el máximo valor posible.' },
  { n: '06', icon: TrophyIcon,          title: 'Seguí tu progreso',              desc: 'Mirá tu posición en el ranking global y comparás tu rendimiento frente a toda la comunidad.' },
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
    icon: ShieldCheckIcon,
    color: 'indigo',
    title: 'Competencias LoD',
    sub: 'Torneos con ranking verificado',
    desc: 'Las competencias con el sello LoD tienen ranking habilitado. Participar en ellas suma el máximo ELO al ranking global.',
    ctas: [
      { label: 'Ver competencias LoD', to: '/lod/competencias' },
      { label: '¿Estás participando? Reclamá tu perfil', to: '/jugadores' },
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
];

const ONBOARDING = [
  {
    n: '1',
    icon: UserIcon,
    title: 'Creá tu cuenta',
    desc: 'Registrate en Overtime con tu email. Es gratis y te lleva menos de un minuto.',
    actions: [
      { label: 'Crear cuenta gratis', to: '/register', primary: true },
      { label: 'Ya tengo cuenta, iniciar sesión', to: '/login' },
    ],
  },
  {
    n: '2',
    icon: MagnifyingGlassIcon,
    title: 'Reclamá o creá tu perfil de jugador',
    desc: 'Si ya jugaste en alguna competencia registrada, tu perfil puede estar en la plataforma. Buscalo por nombre y asocialo a tu cuenta. Si no, creás un perfil nuevo.',
    actions: [
      { label: 'Buscar mi perfil', to: '/jugadores', primary: true },
    ],
  },
  {
    n: '3',
    icon: MapPinIcon,
    title: 'Empezá a jugar',
    desc: 'Unite a una Competencia LoD de tu club, o buscá un lobby en La Plaza para jugar un partido informal cerca tuyo.',
    actions: [
      { label: 'Ver Competencias LoD', to: '/lod/competencias', primary: true },
      { label: 'Ir a La Plaza', to: '/plaza' },
    ],
  },
];

export default function LoDLandingPage() {
  usePageTitle('League of Dodgeball');
  const [showProfileFlow, setShowProfileFlow] = useState(false);
  const [howTab, setHowTab] = useState<'plaza' | 'competencia'>('plaza');

  const { data: insights } = useQuery({
    queryKey: ['lod-insights'],
    queryFn: api.insights,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="space-y-0 -mt-6 -mx-4">

      {/* ── Hero ── */}
      <section className="relative bg-slate-900 text-white overflow-hidden">
        <img src="/dodgeball-hero.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-brand-900/70 to-brand-800/60" />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-brand-600/30 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest uppercase text-brand-200">
            League of Dodgeball
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight tracking-tight">
            En el club.<br />
            <span className="text-brand-300">En la calle.</span><br />
            Rankeado.
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Encontrá competencias y partidos cerca tuyo, sumá puntos al ranking global y formá parte de la comunidad de dodgeball más activa.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowProfileFlow(v => !v)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand-500 hover:bg-brand-400 text-white font-black rounded-xl transition-colors shadow-lg shadow-brand-900/50 text-sm"
            >
              <UserIcon className="h-4 w-4" /> ¿Ya jugaste? Buscá tu perfil
            </button>
            <Link to="/ranking" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-colors text-sm">
              <TrophyIcon className="h-4 w-4" /> Ver el ranking global
            </Link>
          </div>

          {showProfileFlow && (
            <div className="mx-auto max-w-sm bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 space-y-3 text-left">
              <p className="text-sm font-bold text-white">¿Participaste en alguna competencia registrada?</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Tu Perfil de Jugador puede ya estar en la plataforma. Buscalo por nombre, asocialo a tu cuenta y empezá a acumular puntos.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <Link to="/jugadores" className="text-sm font-bold text-center py-2.5 px-4 rounded-xl bg-white text-brand-700 hover:bg-brand-50 transition-colors">
                  Buscar mi perfil de jugador
                </Link>
                <Link to="/login" className="text-sm font-bold text-center py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors">
                  Ya tengo cuenta, iniciar sesión
                </Link>
                <Link to="/register" className="text-xs text-slate-400 hover:text-white text-center transition-colors py-1">
                  No tengo cuenta → Registrarme gratis
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2">
            <Link to="/jugadores" className="hover:text-white transition-colors flex items-center gap-1">Ver jugadores <ArrowRightIcon className="h-3 w-3" /></Link>
            <span className="text-slate-600">·</span>
            <Link to="/competencias" className="hover:text-white transition-colors flex items-center gap-1">Ver competencias <ArrowRightIcon className="h-3 w-3" /></Link>
            <span className="text-slate-600">·</span>
            <Link to="/equipos" className="hover:text-white transition-colors flex items-center gap-1">Ver equipos <ArrowRightIcon className="h-3 w-3" /></Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      {insights?.totals && insights.totals.partidos > 0 && <div className="bg-brand-600 px-6 py-5">
        <div className="mx-auto max-w-4xl grid grid-cols-3 gap-4 text-center text-white">
          {[
            { label: 'Jugadores registrados', value: insights?.totals.jugadores },
            { label: 'Partidos jugados',       value: insights?.totals.partidos },
            { label: 'Equipos activos',        value: insights?.totals.equipos },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-2xl sm:text-3xl font-black">
                {value != null ? value.toLocaleString('es-AR') : '—'}
              </p>
              <p className="text-xs text-brand-200 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>}

      {/* ── Los tres pilares ── */}
      <section className="bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900">¿Qué es League of Dodgeball?</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Un sistema pensado para que el dodgeball tenga estructura, competencia y comunidad.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title} className={`rounded-2xl border-2 p-6 space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${
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
                    <Link key={cta.to + cta.label} to={cta.to} className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
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
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-slate-900">Cómo funciona</h2>
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
              <button
                onClick={() => setHowTab('plaza')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  howTab === 'plaza' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                La Plaza
              </button>
              <button
                onClick={() => setHowTab('competencia')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  howTab === 'competencia' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Competencias LoD
              </button>
            </div>
            <p className="text-slate-500 text-sm">
              {howTab === 'plaza'
                ? 'De encontrar el lobby a ganar puntos de ranking en 6 pasos.'
                : 'Cómo participar en una competencia y sumar ELO completo.'
              }
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(howTab === 'plaza' ? STEPS_PLAZA : STEPS_COMPETENCIA).map((s) => (
              <div key={s.n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-black text-slate-400 tracking-widest">{s.n}</span>
                  <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center">
                    <s.icon className={`h-4 w-4 ${howTab === 'plaza' ? 'text-brand-600' : 'text-indigo-600'}`} />
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
              {howTab === 'plaza' ? (
                <>
                  <Link to="/plaza" className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm">
                    <MapPinIcon className="h-4 w-4" /> Explorar La Plaza
                  </Link>
                  <Link to="/register" className="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                    Crear mi cuenta
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/lod/competencias" className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-sm">
                    <TrophyIcon className="h-4 w-4" /> Ver Competencias LoD
                  </Link>
                  <Link to="/jugadores" className="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                    Buscar mi perfil
                  </Link>
                </>
              )}
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
              <p className="text-slate-500 leading-relaxed">No todos los partidos valen lo mismo. El ELO sube o baja según el nivel de tu rival y el tipo de partido. El Karma refleja cómo jugaste como persona.</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <TrophyIcon className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">ELO por modalidad y categoría</p>
                    <p className="text-xs text-slate-500 mt-0.5">Tenés un rating independiente por Foam/Cloth y por Masculino/Femenino/Mixto/Libre. Cada combinación es su propio ranking.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <ChartBarIcon className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Coeficiente según el partido</p>
                    <div className="mt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">La Plaza sin Oficial</span>
                        <span className="font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md">×0.3</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">La Plaza con Oficial</span>
                        <span className="font-bold text-brand-700 bg-brand-100 px-2 py-0.5 rounded-md">×0.5</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Competencias LoD</span>
                        <span className="font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">×1 (máximo)</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <StarIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Karma de conducta <span className="font-normal text-amber-600">(La Plaza)</span></p>
                    <p className="text-xs text-slate-500 mt-0.5">Post-partido votás la conducta de cada jugador en La Plaza. El Karma bajo puede restringir tu acceso a lobbies de alto nivel.</p>
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
                <p className="text-[11px] text-slate-500 text-center">Plaza sin Oficial ×0.3 · Plaza con Oficial ×0.5 · Competencias LoD ×1</p>
              </div>
              <Link to="/lod/competencias" className="flex items-center justify-between w-full px-4 py-3 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors">
                <div>
                  <p className="text-sm font-bold text-indigo-900">¿Querés el máximo ELO posible?</p>
                  <p className="text-xs text-indigo-600">Jugá en una Competencia LoD verificada</p>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-indigo-600 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Los 3 niveles de ranking ── */}
      <section className="bg-slate-50 px-6 py-16 border-t border-slate-100">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900">Tu ELO, en 3 niveles</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Cada partido rankeado actualiza los tres simultáneamente.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border-2 border-brand-200 p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-brand-600 flex items-center justify-center">
                  <ChartBarIcon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-black text-brand-600 bg-brand-50 px-2 py-1 rounded-full">Más visitado</span>
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg">Temporada</p>
                <p className="text-xs text-brand-600 font-bold mt-0.5">Esta edición de tu competencia</p>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Tu rendimiento en la temporada actual. Se resetea con cada nueva edición del torneo.</p>
              <Link to="/competencias" className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
                Ver mi temporada <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border-2 border-indigo-200 p-6 space-y-3 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <ShieldCheckIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg">Competencia</p>
                <p className="text-xs text-indigo-600 font-bold mt-0.5">Todo el historial del torneo</p>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Acumula partidos de todas las temporadas. Refleja tu trayectoria completa en el torneo.</p>
              <Link to="/lod/competencias" className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
                Ver competencias <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border-2 border-amber-200 p-6 space-y-3 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <TrophyIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-black text-slate-900 text-lg">Global</p>
                <p className="text-xs text-amber-600 font-bold mt-0.5">Frente a toda la comunidad</p>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">Suma todos tus partidos rankeados: La Plaza y competencias. Tu ELO histórico completo.</p>
              <Link to="/ranking" className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors">
                Ver ranking global <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
              <BoltIcon className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Cada partido rankeado suma a los 3 niveles a la vez</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Jugás en la Temporada 2 de tu club → actualiza tu posición en esa temporada, en el historial de la competencia, y en el ranking global. Un solo partido, tres rankings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Por dónde empezás ── */}
      <section className="bg-slate-50 px-6 py-16 border-t border-slate-100">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-slate-900">¿Por dónde empezás?</h2>
            <p className="text-slate-500">Tres pasos para ser parte de la comunidad.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {ONBOARDING.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full bg-brand-600 text-white text-sm font-black flex items-center justify-center shrink-0">{step.n}</span>
                  <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center">
                    <step.icon className="h-4 w-4 text-brand-600" />
                  </div>
                </div>
                <div>
                  <p className="font-black text-slate-900">{step.title}</p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{step.desc}</p>
                </div>
                <div className="flex flex-col gap-2 mt-auto pt-1">
                  {step.actions.map((action) => (
                    <Link
                      key={action.to + action.label}
                      to={action.to}
                      className={`text-center px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        action.primary
                          ? 'bg-brand-600 text-white hover:bg-brand-700'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs'
                      }`}
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-20 text-white text-center">
        <div className="mx-auto max-w-2xl space-y-6">
          <h2 className="text-4xl font-black leading-tight">¿Listo para jugar?</h2>
          <p className="text-brand-200 text-lg">Unite a una competencia de tu club o encontrá un partido cerca tuyo.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/lod/competencias" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-brand-700 font-black rounded-xl hover:bg-brand-50 transition-colors shadow-lg text-sm">
              <ShieldCheckIcon className="h-4 w-4" /> Ver Competencias LoD
            </Link>
            <Link to="/plaza" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 font-bold rounded-xl transition-colors text-sm">
              <MapPinIcon className="h-4 w-4" /> Explorar La Plaza
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
