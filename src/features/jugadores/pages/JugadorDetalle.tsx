import React, { useCallback, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { useQuery } from '@tanstack/react-query';
import { JugadorService } from '../services/jugadorService';
import { CompetenciaService } from '../../competencias/services/competenciaService';
import { JugadorCompetenciaService } from '../../competencias/services/jugadorCompetenciaService';
import { PlayerRankedHistoryModal, JugadorCompetenciaModal, RankedEvolutionChartModal, CompareVSModal } from '../../competencias/components';
import { RankedService, type LeaderboardItem } from '../../competencias/services/rankedService';
import { type RankingScope } from '../../competencias/components/RankingCardHeader';
import { DashboardMaestro } from '../components/DashboardMaestro';
import { PartidosHistorial } from '../components/PartidosHistorial';
import { useAuth } from '../../../app/providers/AuthContext';
import { useToast } from '../../../shared/components/Toast/ToastProvider';

type Tab = 'partidos' | 'torneos' | 'lod';

interface TemporadaBadge {
  _id: string;
  nombre: string;
}

const JugadorDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();


  const { data: jugador, isLoading: loading, error } = useQuery({
    queryKey: ['jugador', id],
    queryFn: () => {
      if (!id) throw new Error('ID de jugador no proporcionado');
      return JugadorService.getById(id);
    },
    enabled: !!id,
  });

  const { data: competenciasData = [], isLoading: loadingComps } = useQuery({
    queryKey: ['jugador-competencias-detalle', id],
    queryFn: async () => {
      if (!id) return [];

      // Intentar obtener de ambas fuentes para máxima cobertura
      const [jcArray, allComps] = await Promise.all([
        JugadorCompetenciaService.getByJugador(id),
        JugadorService.getCompetencias(id)
      ]);

      // Mapa auxiliar por ID de competencia con los datos ya enriquecidos
      // (matchCount, playedSeasonIds) que devuelve el endpoint unificado.
      const enrichedByCompId = new Map<string, any>();
      if (Array.isArray(allComps)) {
        allComps.forEach((comp: any) => {
          const cid = (comp?._id || comp?.id)?.toString();
          if (cid) enrichedByCompId.set(cid, comp);
        });
      }

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

        const compId = (comp._id || comp.id)?.toString();
        const enriched = compId ? enrichedByCompId.get(compId) : null;
        const isRanked = fullComp.rankedEnabled === true;
        const playedSeasonIds: TemporadaBadge[] = enriched?.playedSeasonIds || [];

        return {
          competencia: {
            ...fullComp,
            matchCount: enriched?.matchCount ?? comp.matchCount ?? 0,
          },
          relacion: rel,
          isRanked,
          playedSeasonIds,
        };
      });

      const results = await Promise.all(compsPromises);
      return results
        .filter((r): r is any => r !== null)
        .sort((a, b) => {
          // Prioridad: 1. Por matchCount, 2. Ranked primero si tienen mismo count
          const countDiff = (b.competencia.matchCount || 0) - (a.competencia.matchCount || 0);
          if (countDiff !== 0) return countDiff;
          if (a.isRanked !== b.isRanked) return a.isRanked ? -1 : 1;
          return 0;
        });
    },
    enabled: !!id && !!jugador,
  });

  const { data: equiposData = [] } = useQuery({
    queryKey: ['jugador-equipos', id],
    queryFn: () => JugadorService.getEquipos(id!),
    enabled: !!id,
  });

  const equiposActivos = useMemo(() => {
    const hoy = new Date();
    return equiposData.filter((je: any) => {
      if (je.estado !== 'aceptado') return false;
      if (!je.hasta) return true;
      return new Date(je.hasta) >= hoy;
    });
  }, [equiposData]);

  const groupByEquipo = (list: any[]) => {
    const map = new Map<string, { equipo: any; contratos: any[] }>();
    list.forEach((je: any) => {
      const eid = je.equipo?._id || je.equipo?.id;
      if (!eid) return;
      if (!map.has(eid)) map.set(eid, { equipo: je.equipo, contratos: [] });
      map.get(eid)!.contratos.push(je);
    });
    return Array.from(map.values()).map(g => ({
      ...g,
      contratos: g.contratos.sort((a, b) => new Date(b.desde || 0).getTime() - new Date(a.desde || 0).getTime()),
    }));
  };

  const equiposActivosAgrupados = useMemo(() => groupByEquipo(equiposActivos), [equiposActivos]);

  usePageTitle(jugador?.nombre);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAllComps, setShowAllComps] = useState(false);
  const activeTab = (searchParams.get('tab') as Tab) || 'partidos';
  const setActiveTab = useCallback((tab: Tab) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === 'partidos') next.delete('tab');
      else next.set('tab', tab);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  // Modal de historial ranked (temporada puntual)
  const [rankedModalData, setRankedModalData] = useState<{
    competencia: any;
    seasonId: string;
  } | null>(null);

  // Modal de competencia no-ranked (Posiciones/Bracket + Partidos)
  const [compModalData, setCompModalData] = useState<{
    competenciaId: string;
    temporadas: TemporadaBadge[];
    initialTemporadaId: string;
  } | null>(null);

  // Evolución de ELO / Comparación VS por competencia+temporada (desde el perfil del jugador)
  const [evolutionModalData, setEvolutionModalData] = useState<{
    competenciaId: string;
    seasonId: string;
    scope: RankingScope;
  } | null>(null);

  const [vsModalData, setVsModalData] = useState<{
    competenciaId: string;
    seasonId: string;
    modalidad: string;
    categoria: string;
    scope: RankingScope;
  } | null>(null);

  const { data: vsLeaderboard = [] } = useQuery<LeaderboardItem[]>({
    queryKey: ['jugador-vs-leaderboard', vsModalData?.competenciaId, vsModalData?.seasonId],
    queryFn: async () => {
      if (!vsModalData) return [];
      const res = await RankedService.getLeaderboard({
        modalidad: vsModalData.modalidad,
        categoria: vsModalData.categoria,
        competition: vsModalData.competenciaId,
        season: vsModalData.seasonId === 'global' ? undefined : vsModalData.seasonId,
        limit: 500,
      });
      return res.items || [];
    },
    enabled: !!vsModalData,
  });

  const buildScope = (data: any, season: TemporadaBadge): RankingScope => ({
    tipo: 'competencia-temporada',
    competenciaNombre: data.competencia.nombre,
    organizacionNombre: data.competencia.organizacion?.nombre,
    temporadaNombre: season.nombre,
    modalidad: data.competencia.modalidad || 'Foam',
  });

  const handleShowEvolution = (data: any, season: TemporadaBadge) => {
    const compId = data.competencia._id || data.competencia.id;
    setEvolutionModalData({ competenciaId: compId, seasonId: season._id, scope: buildScope(data, season) });
  };

  const handleShowVS = (data: any, season: TemporadaBadge) => {
    const compId = data.competencia._id || data.competencia.id;
    setVsModalData({
      competenciaId: compId,
      seasonId: season._id,
      modalidad: data.competencia.modalidad || 'Foam',
      categoria: data.competencia.categoria || 'Libre',
      scope: buildScope(data, season),
    });
  };

  const handleBadgeClick = (data: any, season: TemporadaBadge) => {
    const compId = data.competencia._id || data.competencia.id;
    if (data.isRanked) {
      setRankedModalData({ competencia: data.competencia, seasonId: season._id });
    } else {
      setCompModalData({
        competenciaId: compId,
        temporadas: data.playedSeasonIds,
        initialTemporadaId: season._id,
      });
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
          <p className="mb-4 text-red-600">
            Error al cargar jugador: {error instanceof Error ? error.message : (error || 'No encontrado')}
          </p>
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
    <div className="min-h-screen bg-slate-50 sm:py-8">
      <div className="mx-auto max-w-4xl sm:px-4 sm:px-6 lg:px-8">
        <div className="bg-white sm:rounded-2xl shadow-none sm:shadow-sm border-0 sm:border sm:border-slate-200 overflow-hidden">
          {/* Header/Cover color */}
          <div className="h-24 sm:h-32 bg-gradient-to-r from-brand-600 to-indigo-600"></div>

          <div className="px-4 sm:px-6 pb-6 sm:pb-8">
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

              {!jugador.userId && !jugador.perfilReclamado && (
                user ? (
                  <button
                    onClick={handleClaim}
                    disabled={actionLoading}
                    className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all disabled:opacity-50"
                  >
                    {actionLoading ? 'Enviando...' : 'Reclamar este Perfil'}
                  </button>
                ) : (
                  <button
                    onClick={() => navigate(`/register?redirect=/jugadores/${id}`)}
                    className="flex flex-col items-center bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all"
                  >
                    <span>Administrar Jugador</span>
                    <span className="text-xs font-normal opacity-80">Registrate para reclamar el perfil</span>
                  </button>
                )
              )}

              {jugador.userId && (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-xl">
                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Perfil Verificado</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-8 text-center sm:text-left">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 leading-tight">{jugador.nombre}</h1>
              {jugador.alias && (
                <p className="text-lg sm:text-xl text-brand-600 font-bold italic">@{jugador.alias}</p>
              )}
            </div>

            {equiposActivosAgrupados.length > 0 && (
              <section className="mb-8">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {equiposActivosAgrupados.map(({ equipo }) => (
                    <Link
                      key={equipo?._id || equipo?.id}
                      to={`/equipos/${equipo?._id || equipo?.id}`}
                      title={equipo?.nombre}
                      className="h-12 w-12 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-sm font-bold text-slate-400 flex-shrink-0 border border-slate-200 hover:border-brand-300 transition-colors"
                    >
                      {equipo?.escudo ? (
                        <img src={equipo.escudo} alt={equipo.nombre} className="h-full w-full object-cover" />
                      ) : (
                        equipo?.nombre?.charAt(0)
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Navigation Tabs - Full width, sin scroll */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100/50 rounded-2xl border border-slate-100 mt-8 mb-8">
                 <button
                  onClick={() => setActiveTab('partidos')}
                  className={`px-2 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wide sm:tracking-widest transition-all text-center ${
                    activeTab === 'partidos' ? 'bg-white text-brand-700 shadow-sm shadow-brand-100 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                  }`}
                 >
                   Partidos
                 </button>
                 <button
                  onClick={() => setActiveTab('torneos')}
                  className={`px-2 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wide sm:tracking-widest transition-all text-center ${
                    activeTab === 'torneos' ? 'bg-white text-brand-700 shadow-sm shadow-brand-100 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                  }`}
                 >
                   Torneos
                 </button>
                 <button
                  onClick={() => setActiveTab('lod')}
                  className={`px-2 py-2.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wide sm:tracking-widest transition-all text-center ${
                    activeTab === 'lod' ? 'bg-white text-brand-700 shadow-sm shadow-brand-100 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'
                  }`}
                 >
                   LoD
                 </button>
            </div>

            {/* TAB CONTENT: PARTIDOS */}
            {activeTab === 'partidos' && (
              <PartidosHistorial jugadorId={id!} />
            )}

            {/* TAB CONTENT: TORNEOS */}
            {activeTab === 'torneos' && (
              <div className="mt-4">
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">Participación en Torneos</h2>
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
                <div className="space-y-3">
                  {competenciasData.slice(0, showAllComps ? undefined : 3).map((data, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-200 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div
                          className="min-w-0 flex items-center gap-3 cursor-pointer"
                          onClick={() => navigate(`/competencias/${data.competencia._id || data.competencia.id}`)}
                        >
                          <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 font-bold overflow-hidden border border-brand-100 flex-shrink-0">
                            {data.competencia.imagen ? (
                              <img src={data.competencia.imagen} alt={data.competencia.nombre} className="h-full w-full object-cover" />
                            ) : (
                              data.competencia.nombre.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate hover:text-brand-600">
                              {data.competencia.nombre}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
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
                      </div>

                      {data.playedSeasonIds && data.playedSeasonIds.length > 0 ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          {data.playedSeasonIds.map((season: TemporadaBadge) => (
                            <div key={season._id} className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleBadgeClick(data, season)}
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                              >
                                {season.nombre}
                              </button>
                              {data.isRanked && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleShowEvolution(data, season)}
                                    title="Ver evolución"
                                    className="text-[10px] px-1.5 py-1 rounded-full text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                  >
                                    📈
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleShowVS(data, season)}
                                    title="Comparar"
                                    className="text-[10px] px-1.5 py-1 rounded-full text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                                  >
                                    ⚔️
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-[11px] text-slate-400 italic">Sin temporadas jugadas registradas.</p>
                      )}
                    </div>
                  ))}

                  {!showAllComps && competenciasData.length > 3 && (
                    <button
                      onClick={() => setShowAllComps(true)}
                      className="group w-full py-4 bg-white hover:bg-brand-50 text-slate-500 hover:text-brand-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-slate-200 hover:border-brand-200 shadow-sm flex items-center justify-center gap-2"
                    >
                      Ver {competenciasData.length - 3} competencias más
                      <svg className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
              </div>
            )}

            {/* TAB CONTENT: LOD */}
            {activeTab === 'lod' && (
              <DashboardMaestro jugadorId={id!} jugador={jugador} />
            )}
          </div>
        </div>
      </div>

      {rankedModalData && (
        <PlayerRankedHistoryModal
          isOpen={!!rankedModalData}
          onClose={() => setRankedModalData(null)}
          playerId={id!}
          playerName={jugador.nombre}
          modalidad={rankedModalData.competencia.modalidad || 'Foam'}
          categoria={rankedModalData.competencia.categoria || 'Libre'}
          competenciaId={rankedModalData.competencia._id || rankedModalData.competencia.id}
          seasonId={rankedModalData.seasonId}
        />
      )}

      {compModalData && (
        <JugadorCompetenciaModal
          isOpen={!!compModalData}
          onClose={() => setCompModalData(null)}
          jugador={{ _id: id!, nombre: jugador.nombre, foto: jugador.foto }}
          competenciaId={compModalData.competenciaId}
          temporadas={compModalData.temporadas}
          initialTemporadaId={compModalData.initialTemporadaId}
        />
      )}

      {evolutionModalData && (
        <RankedEvolutionChartModal
          isOpen={!!evolutionModalData}
          onClose={() => setEvolutionModalData(null)}
          competenciaId={evolutionModalData.competenciaId}
          defaultSeasonId={evolutionModalData.seasonId === 'global' ? undefined : evolutionModalData.seasonId}
          initialPlayerIds={[id!]}
          scope={evolutionModalData.scope}
        />
      )}

      {vsModalData && (
        <CompareVSModal
          isOpen={!!vsModalData}
          onClose={() => setVsModalData(null)}
          players={vsLeaderboard}
          initialPlayerIds={[id!]}
          modalidad={vsModalData.modalidad}
          categoria={vsModalData.categoria}
          competition={vsModalData.competenciaId}
          season={vsModalData.seasonId === 'global' ? undefined : vsModalData.seasonId}
          scope={vsModalData.scope}
        />
      )}
    </div>
  );
};

export default JugadorDetalle;
