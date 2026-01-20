import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntity } from '../../../shared/hooks';
import { CompetenciaService, type Competencia } from '../services/competenciaService';
import { RankedService, type LeaderboardItem } from '../services/rankedService';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';
import { TemporadaService, type Temporada } from '../services/temporadaService';
import { FaseService, type Fase } from '../services/faseService';
import { JugadorCompetenciaService, type JugadorCompetencia } from '../services/jugadorCompetenciaService';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';
import { TablaPosiciones } from '../../../shared/components/TablaPosiciones/TablaPosiciones';
import { Bracket } from '../../../shared/components/Bracket/Bracket';
import { EloExplanationModal } from '../../../shared/components/EloExplanationModal';

const CompetenciaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'leaderboard' | 'partidos' | 'resultados'>('info');
  
  // State for Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [jugadoresComp, setJugadoresComp] = useState<JugadorCompetencia[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // State for Resultados (Temporadas/Fases)
  const [temporadas, setTemporadas] = useState<Temporada[]>([]);
  const [selectedTemporada, setSelectedTemporada] = useState<string>('');
  const [fases, setFases] = useState<Fase[]>([]);
  const [selectedFase, setSelectedFase] = useState<string>('');
  const [faseDetails, setFaseDetails] = useState<Fase | null>(null);
  const [fasePartidos, setFasePartidos] = useState<Partido[]>([]);
  const [loadingResultados, setLoadingResultados] = useState(false);

  const { data: competencia, loading, error } = useEntity<Competencia>(
    useCallback(() => {
      if (!id) throw new Error('ID de competencia no proporcionado');
      return CompetenciaService.getById(id);
    }, [id])
  );

  const isRanked = competencia ? (competencia as any).rankedEnabled === true : false;

  const loadLeaderboard = useCallback(async () => {
    if (!competencia) return;
    setLoadingLeaderboard(true);
    try {
      // Defaulting to Foam/Libre if not specified in competencia, or using competencia properties
      const modalidad = (competencia as any).modalidad || 'Foam';
      const categoria = (competencia as any).categoria || 'Libre';
      
      const [leaderboardRes, jugadoresCompRes] = await Promise.all([
        RankedService.getLeaderboard({
          modalidad,
          categoria,
          competition: competencia.id,
          season: selectedTemporada || undefined,
          limit: 50
        }),
        JugadorCompetenciaService.getByCompetencia(competencia.id)
      ]);

      setLeaderboard(leaderboardRes.items);
      setJugadoresComp(jugadoresCompRes);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  }, [competencia, selectedTemporada]);

  const loadTemporadas = useCallback(async () => {
    if (!competencia) return;
    setLoadingResultados(true);
    try {
      const res = await TemporadaService.getByCompetencia(competencia.id);
      setTemporadas(res);
      // Select the last one by default (assuming chronological order or creation order)
      if (res.length > 0) {
        setSelectedTemporada(res[res.length - 1]._id);
      }
    } catch (err) {
      console.error('Error loading temporadas:', err);
    } finally {
      setLoadingResultados(false);
    }
  }, [competencia]);

  const loadFases = useCallback(async (temporadaId: string) => {
    setLoadingResultados(true);
    try {
      const res = await FaseService.getByTemporada(temporadaId);
      setFases(res);
      // Select the last one by default
      if (res.length > 0) {
        setSelectedFase(res[res.length - 1]._id);
      } else {
        setSelectedFase('');
      }
    } catch (err) {
      console.error('Error loading fases:', err);
    } finally {
      setLoadingResultados(false);
    }
  }, []);

  const loadFaseData = useCallback(async (faseId: string) => {
    setLoadingResultados(true);
    try {
      // Load phase details to know the type
      const fase = fases.find(f => f._id === faseId);
      setFaseDetails(fase || null);

      // Load matches for this phase (needed for playoffs/brackets)
      const matches = await PartidoService.getByFaseId(faseId);
      setFasePartidos(matches);
    } catch (err) {
      console.error('Error loading fase data:', err);
    } finally {
      setLoadingResultados(false);
    }
  }, [fases]);

  const loadTemporadaMatches = useCallback(async (temporadaId: string) => {
    if (!competencia) return;
    setLoadingResultados(true);
    try {
      setFaseDetails(null);
      const matches = await PartidoService.getAll({ 
        temporadaId,
        competencia: competencia.id 
      });
      setFasePartidos(matches);
    } catch (err) {
      console.error('Error loading temporada matches:', err);
    } finally {
      setLoadingResultados(false);
    }
  }, [competencia]);

  useEffect(() => {
    if (competencia && (competencia as any).rankedEnabled && activeTab === 'leaderboard') {
      void loadTemporadas();
    }
    if (competencia && (activeTab === 'partidos' || activeTab === 'resultados')) {
      void loadTemporadas();
    }
  }, [competencia, activeTab, loadTemporadas]);

  // Effect to reset activeTab if 'resultados' is selected but competition is ranked
  useEffect(() => {
    if (isRanked && activeTab === 'resultados') {
      setActiveTab('info');
    }
  }, [isRanked, activeTab]);

  // Effect to load phases or leaderboard when season changes
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      void loadLeaderboard();
    } else if (selectedTemporada) {
      void loadFases(selectedTemporada);
    } else {
      setFases([]);
      setSelectedFase('');
    }
  }, [selectedTemporada, activeTab, loadLeaderboard, loadFases]);

  // Effect to load phase details and matches when phase changes
  useEffect(() => {
    if (selectedFase) {
      void loadFaseData(selectedFase);
    } else if (selectedTemporada && activeTab === 'partidos') {
      void loadTemporadaMatches(selectedTemporada);
    } else {
      setFaseDetails(null);
      setFasePartidos([]);
    }
  }, [selectedFase, selectedTemporada, activeTab, loadFaseData, loadTemporadaMatches]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando competencia...</p>
        </div>
      </div>
    );
  }

  if (error || !competencia) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error al cargar competencia: {error || 'No encontrada'}</p>
          <button onClick={() => navigate('/competencias')} className="text-brand-600 hover:underline">
            Volver a competencias
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6 border border-slate-200">
          <button onClick={() => navigate('/competencias')} className="mb-4 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
            ← Volver
          </button>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{competencia.nombre}</h1>
              <p className="mt-1 text-slate-600">{competencia.descripcion || 'Sin descripción'}</p>
              <div className="mt-2 flex gap-2">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {(competencia as any).modalidad || 'General'}
                </span>
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                  {(competencia as any).categoria || 'General'}
                </span>
                {isRanked && (
                  <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                    🏆 Ranked
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Estado</div>
              <div className="font-medium capitalize text-slate-900">{competencia.estado?.replace('_', ' ') || 'Desconocido'}</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('info')}
              className={`${
                activeTab === 'info'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab('partidos')}
              className={`${
                activeTab === 'partidos'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Partidos
            </button>
            {!isRanked && (
              <button
                onClick={() => setActiveTab('resultados')}
                className={`${
                  activeTab === 'resultados'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
              >
                Resultados
              </button>
            )}
            {isRanked && (
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`${
                  activeTab === 'leaderboard'
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
              >
                Leaderboard
              </button>
            )}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 min-h-[400px]">
          {activeTab === 'info' && (
            <div className="p-6">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Detalles de la Competencia</h3>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-slate-500">Fecha de Inicio</dt>
                  <dd className="mt-1 text-sm text-slate-900">{competencia.fechaInicio ? new Date(competencia.fechaInicio).toLocaleDateString() : '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Fecha de Fin</dt>
                  <dd className="mt-1 text-sm text-slate-900">{competencia.fechaFin ? new Date(competencia.fechaFin).toLocaleDateString() : '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-500">Organización</dt>
                  <dd className="mt-1 text-sm text-slate-900">{(competencia as any).organizacion?.nombre || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          )}

          {activeTab === 'partidos' && (
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="w-full sm:w-1/3">
                  <label htmlFor="temporada-partidos" className="block text-sm font-medium text-slate-700 mb-1">Temporada</label>
                  <select
                    id="temporada-partidos"
                    value={selectedTemporada}
                    onChange={(e) => setSelectedTemporada(e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
                  >
                    {temporadas.length === 0 && <option value="">No hay temporadas</option>}
                    {temporadas.map((t) => (
                      <option key={t._id} value={t._id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-1/3">
                  <label htmlFor="fase-partidos" className="block text-sm font-medium text-slate-700 mb-1">Fase</label>
                  <select
                    id="fase-partidos"
                    value={selectedFase}
                    onChange={(e) => setSelectedFase(e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
                    disabled={!selectedTemporada || fases.length === 0}
                  >
                    <option value="">Todas las fases</option>
                    {fases.map((f) => (
                      <option key={f._id} value={f._id}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingResultados ? (
                <div className="p-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
                  <p className="mt-2 text-sm text-slate-500">Cargando partidos...</p>
                </div>
              ) : !selectedFase && !selectedTemporada ? (
                <div className="p-12 text-center text-slate-500">
                  Selecciona una temporada para ver los partidos.
                </div>
              ) : fasePartidos.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  No hay partidos registrados.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {fasePartidos.map((partido) => (
                    <PartidoCard 
                      key={partido.id} 
                      partido={partido} 
                      onClick={() => navigate(`/partidos/${partido.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'resultados' && (
            <div className="p-6">
              {/* Selectors */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="w-full sm:w-1/3">
                  <label htmlFor="temporada" className="block text-sm font-medium text-slate-700 mb-1">Temporada</label>
                  <select
                    id="temporada"
                    value={selectedTemporada}
                    onChange={(e) => setSelectedTemporada(e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
                  >
                    {temporadas.length === 0 && <option value="">No hay temporadas</option>}
                    {temporadas.map((t) => (
                      <option key={t._id} value={t._id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full sm:w-1/3">
                  <label htmlFor="fase" className="block text-sm font-medium text-slate-700 mb-1">Fase</label>
                  <select
                    id="fase"
                    value={selectedFase}
                    onChange={(e) => setSelectedFase(e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
                    disabled={!selectedTemporada || fases.length === 0}
                  >
                    {fases.length === 0 && <option value="">No hay fases</option>}
                    {fases.map((f) => (
                      <option key={f._id} value={f._id}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Content based on Phase Type */}
              {loadingResultados ? (
                <div className="p-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
                  <p className="mt-2 text-sm text-slate-500">Cargando resultados...</p>
                </div>
              ) : !selectedFase ? (
                <div className="p-12 text-center text-slate-500">
                  Selecciona una temporada y una fase para ver los resultados.
                </div>
              ) : (
                <div>
                  {faseDetails?.tipo === 'grupo' || faseDetails?.tipo === 'liga' ? (
                    <TablaPosiciones faseId={selectedFase} />
                  ) : faseDetails?.tipo === 'playoff' ? (
                    <Bracket matches={fasePartidos} />
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium text-slate-900 mb-4">Partidos de la Fase</h3>
                      {fasePartidos.length === 0 ? (
                        <p className="text-slate-500">No hay partidos registrados en esta fase.</p>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {fasePartidos.map((partido) => (
                            <PartidoCard 
                              key={partido.id} 
                              partido={partido} 
                              onClick={() => navigate(`/partidos/${partido.id}`)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="p-6">
              <div className="flex items-end justify-between mb-6 gap-4">
                <div className="w-full sm:w-1/3">
                  <label htmlFor="temporada-leaderboard" className="block text-sm font-medium text-slate-700 mb-1">Temporada</label>
                  <select
                    id="temporada-leaderboard"
                    value={selectedTemporada}
                    onChange={(e) => setSelectedTemporada(e.target.value)}
                    className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
                  >
                    <option value="">Histórico Global</option>
                    {temporadas.map((t) => (
                      <option key={t._id} value={t._id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-1">
                  <EloExplanationModal 
                    trigger={
                      <button className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        ¿Cómo funciona el ranking?
                      </button>
                    }
                  />
                </div>
              </div>

              {loadingLeaderboard ? (
                <div className="p-12 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
                  <p className="mt-2 text-sm text-slate-500">Cargando ranking...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  No hay datos de ranking disponibles para esta selección.
                </div>
              ) : (
                <>
                  {/* Vista de tabla para desktop */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">#</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jugador</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rating (ELO)</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Partidos</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tendencia</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {leaderboard.map((item, index) => {
                          const playerId = typeof item.playerId === 'object' ? (item.playerId as any)._id : item.playerId;
                          
                          // Buscar info extra del jugador en la lista de jugadores de la competencia
                          const jugadorCompInfo = jugadoresComp.find(jc => {
                            const jcPlayerId = typeof jc.jugador === 'object' ? jc.jugador._id : jc.jugador;
                            return jcPlayerId === playerId;
                          });

                          const playerFoto = (typeof item.playerId === 'object' ? (item.playerId as any).foto : (item as any).foto) 
                                           || (typeof jugadorCompInfo?.jugador === 'object' ? jugadorCompInfo.jugador.foto : undefined)
                                           || jugadorCompInfo?.foto;
                          
                          const initials = (item.playerName || 'PJ')
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase();
                            
                          return (
                            <tr key={playerId} className="hover:bg-slate-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{index + 1}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-8 h-8 flex-shrink-0">
                                    <img 
                                      src={playerFoto || `https://api.deportes.puebla.gob.mx/images/players/${playerId}.jpg`}
                                      alt={item.playerName || 'Jugador'}
                                      className="absolute inset-0 w-8 h-8 rounded-full object-cover bg-slate-100 border border-slate-200 shadow-sm z-10"
                                      onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                                    />
                                    <div className="absolute inset-0 w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold border border-brand-200">
                                      {initials}
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium text-slate-900">{item.playerName || playerId}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{item.rating.toFixed(3)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.matchesPlayed}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {item.lastDelta !== undefined ? (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                    item.lastDelta > 0 ? 'bg-green-100 text-green-800' : item.lastDelta < 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                                  }`}>
                                    {item.lastDelta > 0 ? '+' : ''}{Number(item.lastDelta).toFixed(3)}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-4">
                    {leaderboard.map((item, index) => {
                      const playerId = typeof item.playerId === 'object' ? (item.playerId as any)._id : item.playerId;
                      
                      // Buscar info extra del jugador en la lista de jugadores de la competencia
                      const jugadorCompInfo = jugadoresComp.find(jc => {
                        const jcPlayerId = typeof jc.jugador === 'object' ? jc.jugador._id : jc.jugador;
                        return jcPlayerId === playerId;
                      });

                      const playerFoto = (typeof item.playerId === 'object' ? (item.playerId as any).foto : (item as any).foto) 
                                       || (typeof jugadorCompInfo?.jugador === 'object' ? jugadorCompInfo.jugador.foto : undefined)
                                       || jugadorCompInfo?.foto;
                      
                      const initials = (item.playerName || 'PJ')
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();
                        
                      return (
                        <div key={playerId} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-600 rounded-full text-sm font-bold">
                                {index + 1}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className="relative w-8 h-8 flex-shrink-0">
                                  <img 
                                    src={playerFoto || `https://api.deportes.puebla.gob.mx/images/players/${playerId}.jpg`}
                                    alt={item.playerName || 'Jugador'}
                                    className="absolute inset-0 w-8 h-8 rounded-full object-cover bg-slate-100 border border-slate-200 shadow-sm z-10"
                                    onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                                  />
                                  <div className="absolute inset-0 w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold border border-brand-200">
                                    {initials}
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-slate-900">{item.playerName || playerId}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-slate-900">{item.rating.toFixed(3)}</div>
                              <div className="text-xs text-slate-500">ELO</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-slate-500">Partidos: {item.matchesPlayed}</span>
                              {item.lastDelta !== undefined ? (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  item.lastDelta > 0 ? 'bg-green-100 text-green-800' : item.lastDelta < 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                  Tendencia: {item.lastDelta > 0 ? '+' : ''}{Number(item.lastDelta).toFixed(3)}
                                </span>
                              ) : (
                                <span className="text-slate-400">Sin cambios</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetenciaDetalle;
