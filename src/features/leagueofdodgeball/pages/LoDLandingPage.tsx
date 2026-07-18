import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import {
  MapPinIcon, TrophyIcon, BoltIcon,
  ShieldCheckIcon, StarIcon, ArrowRightIcon,
  UserIcon, MagnifyingGlassIcon, ChartBarIcon,
} from '@heroicons/react/24/outline';

const STEPS_PLAZA = [
  { n: '01', icon: UserIcon,        title: 'Creá tu cuenta y perfil de jugador',  desc: 'Registrate gratis y buscá tu perfil en el directorio. Si ya jugaste en una competencia registrada, reclamalo y tus stats se vinculan automáticamente.' },
  { n: '02', icon: MapPinIcon,      title: 'Creá un partido e invitá a tus amigos', desc: 'Abrí un lobby en La Plaza, elegí el lugar y horario, y compartí el link para que se sumen.' },
  { n: '03', icon: TrophyIcon,      title: 'Jugá y competí por los puntos',        desc: 'El resultado mueve tu ELO global. Cada partido te acerca o te aleja del top del ranking.' },
];

const STEPS_COMPETENCIA = [
  { n: '01', icon: MagnifyingGlassIcon, title: 'Buscá una competencia',             desc: 'Explorá las Competencias LoD disponibles y encontrá la de tu club o zona.' },
  { n: '02', icon: MapPinIcon,          title: 'Acercate',                           desc: 'Contactá al organizador y unite a un equipo. Si ya jugaste, tu perfil puede estar esperándote en la plataforma.' },
  { n: '03', icon: TrophyIcon,          title: 'Jugá, competí y divertite',          desc: 'Los partidos suman al ranking de tu temporada, de la competencia y al global — todo a la vez.' },
];

export default function LoDLandingPage() {
  usePageTitle('League of Dodgeball');
  const [showProfileFlow, setShowProfileFlow] = useState(false);
  const [howTab, setHowTab] = useState<'plaza' | 'competencia'>('plaza');

  return (
    <div className="space-y-0 -mt-6 -mx-4">

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-slate-900 via-brand-900 to-brand-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-brand-600/30 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-widest uppercase text-brand-200">
            League of Dodgeball
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight tracking-tight">
            El deporte en<br />
            <span className="text-brand-300">modo competitivo.</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-xl mx-auto leading-relaxed">
            Jugá, ganá y subí en el ranking.
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
              <Link to="/lod/competencias" className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-bold bg-brand-600 text-white hover:bg-brand-700 transition-colors">
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

      {/* ── ¿Qué es LoD? + Cómo funciona + Por dónde empezás ── */}
      <section className="bg-white px-6 py-16 border-t border-slate-100">
        <div className="mx-auto max-w-5xl space-y-10">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-slate-900">¿Qué es League of Dodgeball?</h2>
            <p className="text-slate-500 max-w-lg mx-auto">Dos formas de jugar dodgeball rankeado. Elegí la tuya.</p>
            <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-sm">
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
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {(howTab === 'plaza' ? STEPS_PLAZA : STEPS_COMPETENCIA).map((s) => (
              <div key={s.n} className={`rounded-2xl border p-6 space-y-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${
                howTab === 'plaza' ? 'border-brand-100 bg-brand-50' : 'border-indigo-100 bg-indigo-50'
              }`}>
                <div className="flex items-center gap-3">
                  <span className={`h-8 w-8 rounded-full text-white text-sm font-black flex items-center justify-center shrink-0 ${
                    howTab === 'plaza' ? 'bg-brand-600' : 'bg-indigo-600'
                  }`}>{s.n}</span>
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    howTab === 'plaza' ? 'bg-brand-100' : 'bg-indigo-100'
                  }`}>
                    <s.icon className={`h-4 w-4 ${howTab === 'plaza' ? 'text-brand-600' : 'text-indigo-600'}`} />
                  </div>
                </div>
                <p className="font-black text-slate-900">{s.title}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">¿Quién puede participar?</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Cualquiera. No hace falta pertenecer a un club ni tener experiencia previa — te registrás gratis y ya podés sumarte a un lobby de La Plaza o buscar la Competencia LoD de tu zona.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">¿Dónde?</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                La Plaza es geolocalizada: vos elegís el lugar real al crear o sumarte a un partido. Las Competencias LoD las organizan clubes y ligas ya registrados — buscás la de tu zona en el listado.
              </p>
            </div>
          </div>

          <div className="text-center">
            {howTab === 'plaza' ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register" className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors text-sm">
                  <UserIcon className="h-4 w-4" /> Crear mi cuenta gratis
                </Link>
                <Link to="/plaza" className="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  <MapPinIcon className="h-4 w-4" /> Explorar La Plaza
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/lod/competencias" className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-sm">
                  <ShieldCheckIcon className="h-4 w-4" /> Ver Competencias LoD
                </Link>
                <Link to="/jugadores" className="inline-flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-sm">
                  Buscar mi perfil
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── ELO y Karma ── */}
      <section className="bg-slate-50 px-6 py-16 border-t border-slate-100">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-black text-slate-900">Un sistema de puntos que tiene sentido</h2>
              <p className="text-slate-500 leading-relaxed">No todos los partidos valen lo mismo. El ELO sube o baja según el nivel de tu rival y el tipo de partido. El Karma refleja cómo jugaste como persona.</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200">
                  <TrophyIcon className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 text-sm">ELO por modalidad y categoría</p>
                    <p className="text-xs text-slate-500 mt-0.5">Tenés un rating independiente por Foam/Cloth y por Masculino/Femenino/Mixto/Libre. Cada combinación es su propio ranking.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-xl bg-white border border-slate-200">
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
