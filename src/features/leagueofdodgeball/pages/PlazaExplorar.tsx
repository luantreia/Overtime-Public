import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PlazaService } from '../services/plazaService';
import { Lobby } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';
import { getAuthTokens } from '../../../utils/apiClient';
import {
  MapPinIcon, CalendarIcon, UsersIcon, TrophyIcon, ListBulletIcon, MapIcon,
  InformationCircleIcon, XMarkIcon, ShieldCheckIcon, ArrowPathIcon,
  LinkIcon, CheckIcon, FunnelIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open:      { label: 'Buscando jugadores',  className: 'bg-green-100 text-green-700' },
  full:      { label: 'Completo · ¡listo!',  className: 'bg-blue-100 text-blue-700' },
  playing:   { label: '🔴 En juego',         className: 'bg-orange-100 text-orange-700' },
  finished:  { label: 'Finalizado',          className: 'bg-slate-100 text-slate-500' },
  cancelled: { label: 'Cancelado',           className: 'bg-red-50 text-red-400' },
};

type Modalidad = 'all' | 'Foam' | 'Cloth';
type Categoria = 'all' | 'Masculino' | 'Femenino' | 'Mixto' | 'Libre';
type StatusFilter = 'all' | 'open' | 'full' | 'playing';
type SortBy = 'distance' | 'date' | 'slots';

const RADIUS_OPTIONS = [5, 10, 20, 50];

const PlazaExplorar: React.FC = () => {
  const navigate = useNavigate();

  // Core data
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [recentFinished, setRecentFinished] = useState<Lobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Location
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(20);

  // UI
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showInfo, setShowInfo] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // User
  const [userUid, setUserUid] = useState<string | null>(null);
  const [myStats, setMyStats] = useState<any>(null);
  const [showEloBreakdown, setShowEloBreakdown] = useState(false);
  const eloRef = useRef<HTMLDivElement>(null);

  // Filters & sort
  const [filterModalidad, setFilterModalidad] = useState<Modalidad>('all');
  const [filterCategoria, setFilterCategoria] = useState<Categoria>('all');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('distance');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Decode JWT for userUid
  useEffect(() => {
    const { accessToken } = getAuthTokens();
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        setUserUid(payload.uid || payload.userId || payload.sub);
      } catch {}
    }
  }, []);

  // Fetch ELO/Karma stats
  useEffect(() => {
    PlazaService.getMyStats()
      .then(setMyStats)
      .catch(() => {});
  }, []);

  // Close ELO breakdown on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (eloRef.current && !eloRef.current.contains(e.target as Node)) {
        setShowEloBreakdown(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // GPS
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: -34.6037, lng: -58.3816 }),
        { timeout: 10000 }
      );
    } else {
      setLocation({ lat: -34.6037, lng: -58.3816 });
    }
  }, []);

  const fetchLobbies = useCallback(async (showSpinner = false) => {
    if (!location) return;
    if (showSpinner) setLoading(true);
    try {
      const [active, finished] = await Promise.all([
        PlazaService.getLobbies(location.lat, location.lng, radius),
        PlazaService.getRecentFinished(5),
      ]);
      setLobbies(active);
      setRecentFinished(finished);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [location, radius]);

  // Fetch on location/radius change
  useEffect(() => {
    fetchLobbies(true);
  }, [fetchLobbies]);

  // Poll every 30s
  useEffect(() => {
    intervalRef.current = setInterval(() => fetchLobbies(false), 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchLobbies]);

  // Computed
  const myActiveLobby = lobbies.find(l =>
    l.players.some(p => p.userUid === userUid) ||
    l.officials.some(o => o.userUid === userUid)
  );

  const filteredLobbies = lobbies
    .filter(l => filterModalidad === 'all' || l.modalidad === filterModalidad)
    .filter(l => filterCategoria === 'all' || l.categoria === filterCategoria)
    .filter(l => filterStatus === 'all' || l.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'distance') return (a.distance ?? 999) - (b.distance ?? 999);
      if (sortBy === 'date') return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      if (sortBy === 'slots') return (a.maxPlayers - a.players.length) - (b.maxPlayers - b.players.length);
      return 0;
    });

  const activeFiltersCount = [
    filterModalidad !== 'all',
    filterCategoria !== 'all',
    filterStatus !== 'all',
    radius !== 20,
    sortBy !== 'distance',
  ].filter(Boolean).length;

  const handleCopyLink = async (lobbyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText(`${window.location.origin}/plaza/lobby/${lobbyId}`);
    setCopiedId(lobbyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const secondsAgo = lastUpdated ? Math.round((Date.now() - lastUpdated.getTime()) / 1000) : null;

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="space-y-6">

      {/* Info modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowInfo(false)}>
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">¿Cómo funciona La Plaza?</h2>
                <p className="text-xs text-slate-500 mt-0.5">Dodgeball callejero rankeado</p>
              </div>
              <button onClick={() => setShowInfo(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">El flujo de un partido</h3>
                <ol className="space-y-3">
                  {[
                    { n: '1', title: 'Creá o unite a un lobby', desc: 'El host crea el lobby con fecha, lugar y modalidad. Cualquier jugador con perfil puede unirse.' },
                    { n: '2', title: 'Check-in GPS', desc: 'Cuando llegás a la cancha, validás tu presencia. Tenés que estar a menos de 150m del lugar.' },
                    { n: '3', title: 'Equilibrio de equipos', desc: 'El host puede usar "Auto-Equilibrar" para balancear los teams por ELO automáticamente.' },
                    { n: '4', title: 'Jugá el partido', desc: 'El host o el Oficial registran los sets en tiempo real desde el panel de control.' },
                    { n: '5', title: 'Confirmá el resultado', desc: 'El host y el capitán rival deben confirmar el marcador. Si hay desacuerdo, se puede corregir antes.' },
                    { n: '6', title: 'Karma post-partido', desc: 'Votás la conducta de cada jugador. Esos votos afectan el Karma de todos.' },
                  ].map(step => (
                    <li key={step.n} className="flex gap-3">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-brand-600 text-white text-xs font-black flex items-center justify-center">{step.n}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{step.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <TrophyIcon className="h-4 w-4" /> Puntos de ranking
                </h3>
                <div className="flex gap-3">
                  <div className="flex-1 rounded-lg bg-white border border-slate-200 p-3 text-center">
                    <p className="text-2xl font-black text-slate-700">0.3×</p>
                    <p className="text-[10px] text-slate-500 mt-1">Sin oficial</p>
                  </div>
                  <div className="flex-1 rounded-lg bg-brand-50 border border-brand-200 p-3 text-center">
                    <p className="text-2xl font-black text-brand-700">0.5×</p>
                    <p className="text-[10px] text-brand-600 mt-1 font-medium flex items-center justify-center gap-1">
                      <ShieldCheckIcon className="h-3 w-3" /> Con oficial
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">El multiplicador se aplica sobre el delta ELO. Sin oficial los partidos valen menos para desincentivar el auto-reporte.</p>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
                <h3 className="text-xs font-black text-amber-700 uppercase tracking-wider mb-2">Auto-gobernanza</h3>
                <p className="text-xs text-amber-800">Si el host, el capitán rival o un oficial están inactivos, cualquier jugador puede reportar su ausencia. Si más del 50% vota, el rol se reasigna automáticamente al jugador con más karma.</p>
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Requisitos para jugar</h3>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />Necesitás un perfil de jugador vinculado a tu cuenta.</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />Tenés que habilitar el GPS para el check-in y ver lobbies cercanos.</li>
                  <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-brand-500 flex-shrink-0" />No asistir después de unirte baja drásticamente tu Karma.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            Dodgeball Calle
            <span className="px-2 py-1 text-xs font-semibold bg-brand-100 text-brand-700 rounded-full">Beta</span>
            <button onClick={() => setShowInfo(true)} className="text-slate-400 hover:text-brand-600 transition-colors" aria-label="Cómo funciona">
              <InformationCircleIcon className="h-6 w-6" />
            </button>
          </h1>
          <p className="text-slate-600 mt-1">Crea o únete a partidos rankeados en tu zona.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* ELO / Karma widget */}
          {myStats && (
            <div className="relative" ref={eloRef}>
              <button
                onClick={() => setShowEloBreakdown(v => !v)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs hover:bg-slate-100 transition-colors"
                title="Ver ELO por categoría"
              >
                <span className="font-black text-brand-700">{myStats.eloGlobal} ELO</span>
                <span className="text-slate-300">·</span>
                <span className="font-black text-orange-500 flex items-center gap-0.5">
                  <StarIcon className="h-3 w-3" />{myStats.karma}
                </span>
              </button>

              {showEloBreakdown && (
                <div className="absolute right-0 top-full mt-2 z-30 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">ELO por categoría</p>
                      <div className="group relative">
                        <InformationCircleIcon className="h-3.5 w-3.5 text-slate-400 cursor-default" />
                        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 rounded-xl bg-slate-900 text-white text-[11px] leading-relaxed px-3 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
                          El ELO se calcula combinando tus partidos de <span className="font-bold">La Plaza</span> y los de <span className="font-bold">competencias rankeadas</span>. Cada modalidad y categoría tiene su propio rating independiente.
                          <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-900" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Plaza + competencias rankeadas</p>
                  </div>
                  {myStats.breakdown.length === 0 ? (
                    <div className="px-4 py-4 text-xs text-slate-400 text-center">
                      Todavía no jugaste partidos rankeados.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {myStats.breakdown.map((b: any, i: number) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2.5">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{b.modalidad} · {b.categoria}</p>
                            <p className="text-[10px] text-slate-400">{b.matchesPlayed} partidos · {b.wins}G {b.losses}P</p>
                          </div>
                          <span className="text-sm font-black text-brand-700">{b.rating}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Promedio global</span>
                    <span className="text-sm font-black text-brand-700">{myStats.eloGlobal}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Last updated + refresh */}
          <div className="flex items-center gap-1">
            {secondsAgo !== null && (
              <span className="text-[11px] text-slate-400">hace {secondsAgo}s</span>
            )}
            <button
              onClick={() => fetchLobbies(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
              title="Actualizar"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
          </div>

          {/* View mode */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <ListBulletIcon className="h-4 w-4" /> Lista
            </button>
            <button onClick={() => setViewMode('map')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <MapIcon className="h-4 w-4" /> Mapa
            </button>
          </div>

          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors ${showFilters ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            <FunnelIcon className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-brand-500 text-white text-[9px] font-black flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <Link to="/plaza/crear" className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors">
            Crear Lobby
          </Link>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-wrap gap-4">
          <div className="flex flex-col gap-1 min-w-[120px]">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Modalidad</label>
            <select value={filterModalidad} onChange={e => setFilterModalidad(e.target.value as Modalidad)} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-400">
              <option value="all">Todas</option>
              <option value="Foam">Foam</option>
              <option value="Cloth">Cloth</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Categoría</label>
            <select value={filterCategoria} onChange={e => setFilterCategoria(e.target.value as Categoria)} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-400">
              <option value="all">Todas</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Mixto">Mixto</option>
              <option value="Libre">Libre</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Estado</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as StatusFilter)} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-400">
              <option value="all">Todos</option>
              <option value="open">Buscando jugadores</option>
              <option value="full">Completos</option>
              <option value="playing">En juego</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[110px]">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Radio</label>
            <select value={radius} onChange={e => setRadius(Number(e.target.value))} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-400">
              {RADIUS_OPTIONS.map(r => <option key={r} value={r}>{r} km</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Ordenar por</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-400">
              <option value="distance">Distancia</option>
              <option value="date">Fecha</option>
              <option value="slots">Slots disponibles</option>
            </select>
          </div>
          {activeFiltersCount > 0 && (
            <div className="flex items-end">
              <button
                onClick={() => { setFilterModalidad('all'); setFilterCategoria('all'); setFilterStatus('all'); setRadius(20); setSortBy('distance'); }}
                className="text-xs text-red-500 hover:text-red-700 font-bold underline"
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* Banner: ya estás en un lobby */}
      {myActiveLobby && (
        <div
          className="flex items-center justify-between gap-4 bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl px-5 py-4 shadow-lg cursor-pointer"
          onClick={() => navigate(`/plaza/lobby/${myActiveLobby._id}`)}
        >
          <div>
            <p className="text-[10px] font-black text-brand-200 uppercase tracking-widest">Ya estás en un lobby</p>
            <p className="text-white font-black text-lg leading-tight">{myActiveLobby.title}</p>
            <p className="text-brand-200 text-xs mt-0.5">
              {myActiveLobby.players.length}/{myActiveLobby.maxPlayers} jugadores ·{' '}
              {STATUS_CONFIG[myActiveLobby.status]?.label}
            </p>
          </div>
          <div className="flex-shrink-0 px-4 py-2 bg-white/20 text-white font-black text-sm rounded-xl hover:bg-white/30 transition-colors">
            IR AL LOBBY →
          </div>
        </div>
      )}

      {/* Lobby list / map */}
      {filteredLobbies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-slate-200">
          <MapPinIcon className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">
            {activeFiltersCount > 0 ? 'Sin resultados para estos filtros' : 'No hay partidos cerca'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {activeFiltersCount > 0 ? 'Probá cambiando los filtros o aumentando el radio.' : '¡Sé el primero en crear uno en tu zona!'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLobbies.map((lobby) => {
            const status = STATUS_CONFIG[lobby.status] ?? STATUS_CONFIG.open;
            const slotsLeft = lobby.maxPlayers - lobby.players.length;
            const isMyLobby = lobby._id === myActiveLobby?._id;
            return (
              <Link
                key={lobby._id}
                to={`/plaza/lobby/${lobby._id}`}
                className={`group bg-white rounded-xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${isMyLobby ? 'border-brand-400 ring-2 ring-brand-200' : 'border-slate-200'}`}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${isMyLobby ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white'}`}>
                      {lobby.title.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                      {isMyLobby && <span className="text-[9px] font-black text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded uppercase">Tu lobby</span>}
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.className} ${lobby.status === 'playing' ? 'animate-pulse' : ''}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 mb-2 truncate">{lobby.title}</h3>

                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 shrink-0" />
                      <span>{new Date(lobby.scheduledDate).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{lobby.location.address || lobby.location.name}</span>
                      {lobby.distance !== undefined && (
                        <span className="text-brand-600 font-medium shrink-0">({lobby.distance.toFixed(1)} km)</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-medium text-slate-900">
                        <UsersIcon className="h-4 w-4 shrink-0" />
                        <span>{lobby.players.length} / {lobby.maxPlayers}</span>
                        {lobby.categoria && lobby.categoria !== 'Libre' && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 rounded border border-indigo-100 uppercase font-bold">
                            {lobby.categoria === 'Masculino' ? '♂' : lobby.categoria === 'Femenino' ? '♀' : '🚻'} {lobby.categoria}
                          </span>
                        )}
                      </div>
                      {/* Slots bar */}
                      <div className="flex gap-0.5">
                        {Array.from({ length: Math.min(lobby.maxPlayers, 10) }).map((_, i) => (
                          <div key={i} className={`h-2 w-1.5 rounded-sm ${i < lobby.players.length ? 'bg-brand-500' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                    {(lobby.officials.length > 0 || lobby.requireOfficial) && (
                      <div className="flex items-center gap-2 text-brand-700">
                        <TrophyIcon className="h-4 w-4 shrink-0" />
                        <span>{lobby.officials.length > 0 ? 'Con Oficial (+50% ranking)' : 'Requiere Oficial ⚠️'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-brand-50 transition-colors">
                  <span className="text-xs text-slate-400">{lobby.modalidad} · {slotsLeft > 0 ? `${slotsLeft} slots libres` : 'completo'}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => handleCopyLink(lobby._id, e)}
                      className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                      title="Copiar link"
                    >
                      {copiedId === lobby._id ? <CheckIcon className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
                    </button>
                    <span className="text-xs font-bold text-brand-600">VER →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm h-[600px] relative z-0">
          <MapContainer center={location ? [location.lat, location.lng] : [-34.6037, -58.3816]} zoom={13} scrollWheelZoom className="h-full w-full">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {location && (
              <Marker position={[location.lat, location.lng]} icon={L.divIcon({ className: '', html: `<div style="width:14px;height:14px;background:#4f46e5;border:2px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(79,70,229,0.3)"></div>` })}>
                <Popup>Estás aquí</Popup>
              </Marker>
            )}
            {filteredLobbies.map((lobby) => (
              <Marker key={lobby._id} position={[lobby.location.coordinates.lat, lobby.location.coordinates.lng]}>
                <Popup minWidth={200}>
                  <div className="p-1">
                    <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-2">{lobby.title}</h3>
                    <div className="space-y-1.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5"><CalendarIcon className="h-3 w-3 text-brand-600" />{new Date(lobby.scheduledDate).toLocaleString()}</div>
                      <div className="flex items-center gap-1.5"><UsersIcon className="h-3 w-3 text-brand-600" />{lobby.players.length} / {lobby.maxPlayers} Jugadores</div>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${STATUS_CONFIG[lobby.status]?.className}`}>{STATUS_CONFIG[lobby.status]?.label}</span>
                    </div>
                    <button onClick={() => navigate(`/plaza/lobby/${lobby._id}`)} className="mt-3 w-full py-2 bg-brand-600 text-white rounded-lg text-xs font-bold hover:bg-brand-700 transition-colors">VER LOBBY</button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Historial reciente */}
      {recentFinished.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-wider">Últimos partidos</h2>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {recentFinished.map(lobby => (
              <div key={lobby._id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/plaza/lobby/${lobby._id}`)}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 shrink-0">
                    {lobby.title.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{lobby.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(lobby.scheduledDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · {lobby.modalidad} · {lobby.players.length} jugadores
                    </p>
                  </div>
                </div>
                {lobby.result && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-black text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                      {lobby.result.scoreA} – {lobby.result.scoreB}
                    </span>
                    {lobby.appliedMultiplier && (
                      <span className="text-[10px] text-brand-600 font-bold">{lobby.appliedMultiplier}×</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default PlazaExplorar;
