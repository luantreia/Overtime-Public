import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { useEntity } from '../../../shared/hooks';
import { JugadorService, type Jugador } from '../services/jugadorService';
import { CompetenciaService } from '../../competencias/services/competenciaService';
import { JugadorCompetenciaService } from '../../competencias/services/jugadorCompetenciaService';
import { RankedService } from '../../competencias/services/rankedService';
import { TemporadaService } from '../../competencias/services/temporadaService';
import { FaseService } from '../../competencias/services/faseService';
import { PartidoService } from '../../partidos/services/partidoService';
import { TablaPosiciones } from '../../../shared/components/TablaPosiciones/TablaPosiciones';
import { Bracket } from '../../../shared/components/Bracket/Bracket';
import { PlayerRankedHistoryModal } from '../../competencias/components';
import { DashboardMaestro } from '../components/DashboardMaestro';
import { UnifiedHistory } from '../components/UnifiedHistory';
import { useAuth } from '../../../app/providers/AuthContext';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { MapPinIcon } from '@heroicons/react/24/outline';

const JugadorDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [competenciasData, setCompetenciasData] = useState<any[]>([]);
  const [loadingComps, setLoadingComps] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAllComps, setShowAllComps] = useState(false);
  const [radarData, setRadarData] = useState<any>(null);
  const [loadingRadar, setLoadingRadar] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'leagues'>('dashboard');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompForModal, setSelectedCompForModal] = useState<any>(null);

  const handleOpenModal = (compData: any) => {
    setSelectedCompForModal(compData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleExportImage = async (idx: number, compName: string) => {
    const node = cardRefs.current[idx];
    if (node) {
      try {
        const dataUrl = await toPng(node, {
          filter: (el: any) => {
            // Ignorar elementos marcados explícitamente, botones y selects
            if (
              el.classList?.contains('no-export') || 
              el.tagName === 'BUTTON' || 
              el.tagName === 'SELECT'
            ) return false;
            return true;
          },
          backgroundColor: '#ffffff',
          style: {
            borderRadius: '16px'
          },
          cacheBust: true,
        });
        
        const link = document.createElement('a');
        const playerName = jugador?.nombre?.replace(/\s+/g, '-') || 'jugador';
        const competitionName = compName.replace(/\s+/g, '-') || 'competencia';
        link.download = `ranking-${playerName}-${competitionName}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Error generating image', err);
      }
    }
  };

  const handleClaim = async () => {
    if (!id || !user) return;
    try {
      setActionLoading(true);
      await JugadorService.claim(id);
      addToast({
        type: 'success',
        title: 'Solicitud enviada',
        message: 'Tu solicitud para reclamar este perfil ha sido enviada con éxito. Un administrador lo validará pronto.'
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error al reclamar',
        message: err.message
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeasonChange = async (compIdx: number, seasonId: string) => {
    const freshData = [...competenciasData];
    const data = freshData[compIdx];
    if (!data) return;

    try {
      if (data.isRanked) {
        const res = await RankedService.getRankContext(id!, {
          modalidad: data.competencia.modalidad || 'Foam',
          categoria: data.competencia.categoria || 'Libre',
          competition: data.competencia._id || data.competencia.id,
          season: seasonId === 'global' ? undefined : seasonId
        });
        
        if (res.ok) {
          freshData[compIdx] = { 
            ...data, 
            rankedData: { ...res, selectedSeasonId: seasonId } 
          };
          setCompetenciasData(freshData);
        }
      } else {
        const selectedSeason = data.allSeasons.find((s: any) => s._id === seasonId);
        if (!selectedSeason) return;

        const fasesRes = await FaseService.getByTemporada(selectedSeason._id);
        let normalData = null;
        if (fasesRes.length > 0) {
          const lastFase = fasesRes[fasesRes.length - 1];
          let matches: any[] = [];
          if (lastFase.tipo === 'playoff') {
            matches = await PartidoService.getByFaseId(lastFase._id);
          }
          normalData = {
            temporada: selectedSeason,
            fase: lastFase,
            matches
          };
        }
        freshData[compIdx] = { ...data, normalData };
        setCompetenciasData(freshData);
      }
    } catch (err) {
      console.error('Error changing season:', err);
    }
  };

  const { data: jugador, loading, error } = useEntity<Jugador>(
    useCallback(() => {
      if (!id) throw new Error('ID de jugador no proporcionado');
      return JugadorService.getById(id);
    }, [id])
  );

  const loadCompetenciasInfo = useCallback(async () => {
    if (!id) return;
    setLoadingComps(true);
    try {
      // Intentar obtener de ambas fuentes para máxima cobertura
      const [jcArray, allComps] = await Promise.all([
        JugadorCompetenciaService.getByJugador(id),
        JugadorService.getCompetencias(id)
      ]);
      
      // Unificar por ID de competencia
      const uniqueCompsMap = new Map();
      
      // Primero meter las de JugadorCompetencia (que tienen la relación manual)
      if (Array.isArray(jcArray)) {
        jcArray.forEach(rel => {
          const comp = rel.competencia as any;
          if (comp) {
            const cid = (typeof comp === 'string' ? comp : (comp._id || comp.id))?.toString();
            if (cid) {
              uniqueCompsMap.set(cid, {
                competencia: typeof comp === 'string' ? { _id: cid, id: cid, nombre: 'Cargando...' } : comp,
                relacion: rel
              });
            }
          }
        });
      }
      
      // Luego meter las del endpoint unificado si no están
      if (Array.isArray(allComps)) {
        allComps.forEach(comp => {
          if (comp) {
            const cid = (comp._id || comp.id)?.toString();
            if (cid && !uniqueCompsMap.has(cid)) {
              uniqueCompsMap.set(cid, {
                competencia: comp,
                relacion: null
              });
            }
          }
        });
      }

      const compsPromises = Array.from(uniqueCompsMap.values()).map(async (item) => {
        const { competencia: comp, relacion: rel } = item;
        
        // Si no tenemos el objeto completo, intentar cargarlo
        let fullComp = comp;
        if (!comp.nombre || comp.nombre === 'Cargando...') {
          try {
            fullComp = await CompetenciaService.getById(comp._id || comp.id);
          } catch (e) {
            console.error('Error fetching comp details', e);
          }
        }

        const isRanked = fullComp.rankedEnabled === true;
        let rankedData = null;
        let normalData = null;
        let allSeasons: any[] = [];
        const compId = comp._id || comp.id;

        // Fetch all available seasons for both types
        try {
          allSeasons = await TemporadaService.getByCompetencia(compId);
        } catch (e) {
          console.error('Error fetching seasons', e);
        }

        if (isRanked) {
          const res = await RankedService.getRankContext(id, {
            modalidad: comp.modalidad || 'Foam',
            categoria: comp.categoria || 'Libre',
            competition: compId,
            season: undefined // Global by default
          });
          if (res.ok) rankedData = { ...res, selectedSeasonId: 'global' };
        } else {
          let selectedSeason = null;
          if (comp.preferredSeasonId) {
            selectedSeason = allSeasons.find(s => s._id === comp.preferredSeasonId);
          }

          if (!selectedSeason && allSeasons.length > 0) {
            selectedSeason = allSeasons[allSeasons.length - 1]; // Fallback to latest
          }

          if (selectedSeason) {
            const fasesRes = await FaseService.getByTemporada(selectedSeason._id || (selectedSeason as any).id);
            if (fasesRes.length > 0) {
              const lastFase = fasesRes[fasesRes.length - 1];
              let matches: any[] = [];
              if (lastFase.tipo === 'playoff') {
                matches = await PartidoService.getByFaseId(lastFase._id);
              }
              normalData = {
                temporada: selectedSeason,
                fase: lastFase,
                matches
              };
            }
          }
        }

        return {
          competencia: { ...fullComp, matchCount: comp.matchCount },
          relacion: rel,
          isRanked,
          rankedData,
          normalData,
          allSeasons
        };
      });

      const results = await Promise.all(compsPromises);
      const sortedResults = results
        .filter((r): r is any => r !== null)
        .sort((a, b) => {
          // Prioridad: 1. Por matchCount, 2. Ranked primero si tienen mismo count
          const countDiff = (b.competencia.matchCount || 0) - (a.competencia.matchCount || 0);
          if (countDiff !== 0) return countDiff;
          if (a.isRanked !== b.isRanked) return a.isRanked ? -1 : 1;
          return 0;
        });
      setCompetenciasData(sortedResults);
    } catch (err) {
      console.error('Error loading player competitions:', err);
    } finally {
      setLoadingComps(false);
    }
  }, [id]);

  useEffect(() => {
    if (jugador && id) {
      void loadCompetenciasInfo();
      
      const loadRadar = async () => {
        setLoadingRadar(true);
        try {
          const res = await JugadorService.getRadarStats(id);
          setRadarData(res);
        } catch (err) {
          console.error('Error loading radar stats:', err);
        } finally {
          setLoadingRadar(false);
        }
      };
      void loadRadar();
    }
  }, [jugador, id, loadCompetenciasInfo]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando perfil del jugador...</p>
        </div>
      </div>
    );
  }

  if (error || !jugador) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error al cargar jugador: {error || 'No encontrado'}</p>
          <button 
            onClick={() => navigate('/jugadores')} 
            className="text-brand-600 hover:underline"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/jugadores')} 
          className="mb-6 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          ← Volver a jugadores
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header/Cover color */}
          <div className="h-32 bg-gradient-to-r from-brand-600 to-indigo-600"></div>
          
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="relative flex flex-col sm:flex-row justify-between items-center sm:items-end -mt-12 mb-6 gap-4">
              <div className="p-1 bg-white rounded-2xl shadow-sm">
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400 overflow-hidden border border-slate-100">
                  {jugador.foto ? (
                    <img src={jugador.foto} alt={jugador.nombre} className="h-full w-full object-cover" />
                  ) : (
                    jugador.nombre.charAt(0)
                  )}
                </div>
              </div>

              {user && !jugador.userId && !jugador.perfilReclamado && (
                <button
                  onClick={handleClaim}
                  disabled={actionLoading}
                  className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all disabled:opacity-50"
                >
                  {actionLoading ? 'Enviando...' : 'Reclamar este Perfil'}
                </button>
              )}

              {jugador.userId && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-xl">
                  <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Perfil Verificado</span>
                </div>
              )}
            </div>

            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">{jugador.nombre}</h1>
              {jugador.alias && (
                <p className="text-lg sm:text-xl text-brand-600 font-bold italic">@{jugador.alias}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
              <section className="sm:col-span-2">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-slate-100">Información</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Género</dt>
                    <dd className="mt-0.5 text-sm text-slate-900 font-semibold capitalize">{jugador.genero || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nacionalidad</dt>
                    <dd className="mt-0.5 text-sm text-slate-900 font-semibold">{jugador.nacionalidad || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Edad</dt>
                    <dd className="mt-0.5 text-sm text-slate-900 font-semibold">{jugador.edad ? `${jugador.edad} años` : 'N/A'}</dd>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pb-2 border-b border-slate-100">Actividad</h2>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-xl p-4 border border-slate-100 flex items-center justify-between sm:flex-col sm:justify-center sm:text-center sm:gap-1">
                  <p className="text-2xl sm:text-3xl font-black text-brand-600 leading-none">{competenciasData.length}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Competencias</p>
                </div>
              </section>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl w-full sm:w-fit mt-8 mb-8 border border-slate-100">
               <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'dashboard' ? 'bg-white text-brand-700 shadow-sm shadow-brand-100 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
               >
                 Dashboard
               </button>
               <button 
                onClick={() => setActiveTab('history')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'history' ? 'bg-white text-brand-700 shadow-sm shadow-brand-100 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
               >
                 Historial
               </button>
               <button 
                onClick={() => setActiveTab('leagues')}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === 'leagues' ? 'bg-white text-brand-700 shadow-sm shadow-brand-100 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
               >
                 Ligas / Torneos
               </button>
            </div>

            {/* TAB CONTENT: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <DashboardMaestro jugadorId={id!} jugador={jugador} />
            )}

            {/* TAB CONTENT: HISTORY */}
            {activeTab === 'history' && (
              <UnifiedHistory jugadorId={id!} />
            )}

            {/* TAB CONTENT: COMPETENCIAS (Original View) */}
            {activeTab === 'leagues' && (
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Participación en Ligas</h2>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>
              
              {loadingComps ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
                </div>
              ) : competenciasData.length === 0 ? (
                <p className="text-slate-500 text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  Este jugador no participa actualmente en ninguna competencia.
                </p>
              ) : (
                <div className="space-y-6">
                  {competenciasData.slice(0, showAllComps ? undefined : 3).map((data, idx) => (
                    <div 
                      key={idx} 
                      ref={el => cardRefs.current[idx] = el}
                      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-brand-200 transition-colors"
                    >
                      {/* Comp Card Header - More Compact */}
                      <div 
                        className="p-4 cursor-pointer flex items-center justify-between bg-slate-50/30"
                        onClick={() => navigate(`/competencias/${data.competencia._id || data.competencia.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold overflow-hidden border border-brand-100">
                            {data.competencia.imagen ? (
                              <img src={data.competencia.imagen} alt={data.competencia.nombre} className="h-full w-full object-cover" />
                            ) : (
                              data.competencia.nombre.charAt(0)
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">{data.competencia.nombre}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                data.isRanked ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {data.isRanked ? 'Ranked' : 'Liga'}
                              </span>
                              {data.competencia.matchCount > 0 && (
                                <span className="text-xs text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                  {data.competencia.matchCount} partidos
                                </span>
                              )}
                              {(data.relacion?.dorsal || data.relacion?.posicion) && (
                                <span className="text-xs text-slate-600 font-medium">
                                  {data.relacion.posicion} {data.relacion.dorsal ? `#${data.relacion.dorsal}` : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-slate-400 no-export">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>

                      {/* Content Area - More Compact */}
                      <div className="px-4 pb-4 border-t border-slate-100 pt-3">
                        {data.isRanked && data.rankedData ? (
                          <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-1">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                 Ranking de Jugador
                               </h4>
                               
                               {data.allSeasons && data.allSeasons.length > 0 && (
                                 <select 
                                   className="text-[10px] bg-slate-100 border-none rounded px-2 py-1 font-bold text-slate-600 focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer"
                                   value={data.rankedData.selectedSeasonId || "global"}
                                   onChange={(e) => handleSeasonChange(idx, e.target.value)}
                                 >
                                   <option value="global">Histórico Global</option>
                                   {data.allSeasons.map((s: any) => (
                                     <option key={s._id} value={s._id}>
                                       {s.nombre}
                                     </option>
                                   ))}
                                 </select>
                               )}
                            </div>

                            <div className="flex items-center justify-around bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                              <div className="text-center">
                                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Rank</p>
                                <p className="text-xl font-black text-indigo-900 leading-none">#{data.rankedData.rank}</p>
                              </div>
                              <div className="h-8 w-px bg-indigo-200"></div>
                              <div className="text-center">
                                <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">ELO</p>
                                <p className="text-xl font-black text-indigo-900 leading-none">
                                  {Number(data.rankedData.context.find((it: any) => it.isCurrent)?.rating || 0).toFixed(3)}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2 no-export">
                              <button
                                onClick={() => handleOpenModal(data)}
                                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                                </svg>
                                Ver Historial Detallado
                              </button>
                              
                              <button
                                onClick={(e) => { e.stopPropagation(); handleExportImage(idx, data.competencia.nombre); }}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors shadow-sm flex items-center justify-center"
                                title="Descargar Ranking como PNG"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>

                            <div className="bg-white rounded-lg border border-slate-100 overflow-hidden shadow-sm">
                              <table className="w-full text-[11px]">
                                <tbody className="divide-y divide-slate-50">
                                  {data.rankedData.context.map((item: any, i: number) => (
                                    <tr 
                                      key={i} 
                                      className={`${item.isCurrent ? 'bg-indigo-50/50' : ''} cursor-pointer hover:bg-slate-50 transition-colors`}
                                      onClick={() => navigate(`/jugadores/${item.playerId?._id || item.playerId}`)}
                                    >
                                      <td className="px-3 py-2 text-slate-400 font-mono w-8 text-center">{item.rank}</td>
                                      <td className="px-2 py-2 flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-full bg-slate-100 flex-shrink-0">
                                           {item.playerId?.foto && <img src={item.playerId.foto} className="h-full w-full rounded-full object-cover" alt="" />}
                                        </div>
                                        <span className={`truncate max-w-[150px] ${item.isCurrent ? 'font-bold text-indigo-700' : 'text-slate-700'}`}>
                                          {item.playerId?.nombre || 'Desconocido'}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-right font-bold text-slate-900 w-16">{item.rating ? Number(item.rating).toFixed(3) : '---'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : data.normalData ? (
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                               <div className="flex items-center gap-2">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                                   {data.normalData.temporada.nombre} • {data.normalData.fase.nombre}
                                 </h4>
                               </div>
                               
                               {data.allSeasons && data.allSeasons.length > 1 && (
                                 <select 
                                   className="text-[10px] bg-slate-100 border-none rounded px-2 py-1 font-bold text-slate-600 focus:ring-1 focus:ring-brand-500 outline-none cursor-pointer"
                                   value={data.normalData.temporada._id}
                                   onChange={(e) => handleSeasonChange(idx, e.target.value)}
                                 >
                                   {data.allSeasons.map((s: any) => (
                                     <option key={s._id} value={s._id}>
                                       {s.nombre}
                                     </option>
                                   ))}
                                 </select>
                               )}
                            </div>
                            
                            <div className="w-full">
                              {data.normalData.fase.tipo === 'playoff' ? (
                                <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                                  <div className="scale-90 origin-left">
                                    <Bracket matches={data.normalData.matches} />
                                  </div>
                                </div>
                              ) : (
                                <TablaPosiciones faseId={data.normalData.fase._id} />
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-slate-400 text-[11px] italic font-medium">Buscando actividad reciente...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {!showAllComps && competenciasData.length > 3 && (
                    <button 
                      onClick={() => setShowAllComps(true)}
                      className="group w-full py-4 bg-white hover:bg-brand-50 text-slate-500 hover:text-brand-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-slate-200 hover:border-brand-200 shadow-sm flex items-center justify-center gap-2"
                    >
                      Ver {competenciasData.length - 3} competencias más
                      <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCompForModal && (
        <PlayerRankedHistoryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          playerId={id!}
          playerName={jugador.nombre}
          modalidad={selectedCompForModal.competencia.modalidad || 'Foam'}
          categoria={selectedCompForModal.competencia.categoria || 'Libre'}
          competenciaId={selectedCompForModal.competencia._id || selectedCompForModal.competencia.id}
          seasonId={selectedCompForModal.rankedData?.selectedSeasonId === 'global' ? undefined : selectedCompForModal.rankedData?.selectedSeasonId}
        />
      )}
    </div>
  );
};

export default JugadorDetalle;
