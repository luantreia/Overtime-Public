import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CompetenciaService, type Competencia } from '../services/competenciaService';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { RankedService } from '../services/rankedService';
import { PartidoService } from '../../partidos/services/partidoService';
import { TemporadaService } from '../services/temporadaService';
import { FaseService } from '../services/faseService';
import { JugadorCompetenciaService } from '../services/jugadorCompetenciaService';
import {
  PlayerRankedHistoryModal,
  CompetenciaHeader,
  CompetenciaInfoTab,
  CompetenciaPartidosTab,
  CompetenciaResultadosTab
} from '../components';
import { CompetenciaLeaderboardTab } from '../components/CompetenciaLeaderboardTab';
import { type RankingScope } from '../components/RankingCardHeader';

const CompetenciaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tabs and Selections from URL
  const activeTab = (searchParams.get('tab') as 'info' | 'leaderboard' | 'partidos' | 'resultados') || 'info';
  const selectedTemporada = searchParams.get('temporada') || '';
  const selectedFase = searchParams.get('fase') || '';
  const selectedJugadorFilter = searchParams.get('jugadorFilter') || '';

  const updateParams = useCallback((params: Record<string, string | null>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      });
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const { data: competencia, isLoading: loading, error: competenciaQueryError } = useQuery<Competencia>({
    queryKey: ['competencia', id],
    queryFn: () => {
      if (!id) throw new Error('ID de competencia no proporcionado');
      return CompetenciaService.getDetalle(id);
    },
    enabled: !!id,
  });
  const error = competenciaQueryError instanceof Error ? competenciaQueryError.message : competenciaQueryError ? String(competenciaQueryError) : null;
  usePageTitle((competencia as any)?.nombre);

  const isRanked = competencia ? (competencia as any).rankedEnabled === true : false;

  // React Query for Leaderboard (season-filtered) — used in the leaderboard tab
  const {
    data: leaderboardData,
    isLoading: loadingLeaderboard
  } = useQuery({
    queryKey: ['leaderboard', id, selectedTemporada],
    queryFn: async () => {
      if (!competencia) return null;
      const modalidad = (competencia as any).modalidad || 'Foam';
      const categoria = (competencia as any).categoria || 'Libre';
      return RankedService.getLeaderboard({
        modalidad,
        categoria,
        competition: competencia.id,
        season: selectedTemporada || undefined,
        limit: 500
      });
    },
    enabled: !!competencia && isRanked && activeTab === 'leaderboard',
    staleTime: 0,
  });

  // React Query for global historical top-3 — used only in the info tab vitrina
  const {
    data: top3Data,
    isLoading: loadingTop3
  } = useQuery({
    queryKey: ['leaderboard-top3-global', id],
    queryFn: async () => {
      if (!competencia) return null;
      const modalidad = (competencia as any).modalidad || 'Foam';
      const categoria = (competencia as any).categoria || 'Libre';
      return RankedService.getLeaderboard({
        modalidad,
        categoria,
        competition: competencia.id,
        limit: 3
      });
    },
    enabled: !!competencia && isRanked && activeTab === 'info',
    staleTime: 5 * 60 * 1000,
  });

  // React Query for Jugadores Competencia
  const {
    data: jugadoresComp = []
  } = useQuery({
    queryKey: ['jugadores-competencia', id],
    queryFn: () => JugadorCompetenciaService.getByCompetencia(id!),
    enabled: !!id && !!competencia,
  });

  const leaderboard = leaderboardData?.items || [];
  const top3Leaderboard = top3Data?.items || [];

  // React Query for Temporadas
  const { data: temporadas = [] } = useQuery({
    queryKey: ['temporadas', id],
    queryFn: () => TemporadaService.getByCompetencia(id!),
    enabled: !!id && !!competencia,
  });

  // React Query for Fases
  const { data: fases = [] } = useQuery({
    queryKey: ['fases', selectedTemporada],
    queryFn: () => FaseService.getByTemporada(selectedTemporada),
    enabled: !!selectedTemporada && selectedTemporada !== 'global' && (activeTab === 'partidos' || activeTab === 'resultados'),
  });

  // React Query for Partidos
  const { data: fasePartidos = [], isLoading: loadingPartidos } = useQuery({
    queryKey: ['partidos', id, selectedTemporada, selectedFase, selectedJugadorFilter],
    queryFn: async () => {
      const extraFilters: Record<string, string> = {};
      if (selectedJugadorFilter) extraFilters.jugador = selectedJugadorFilter;

      if (selectedFase) {
        return PartidoService.getAll({ fase: selectedFase, ...extraFilters });
      }
      if (selectedTemporada && selectedTemporada !== 'global') {
        return PartidoService.getAll({
          temporadaId: selectedTemporada,
          competencia: id!,
          ...extraFilters
        });
      }
      return [];
    },
    enabled: !!id && !!competencia && (activeTab === 'partidos' || activeTab === 'resultados'),
  });

  // React Query for Fase Details (Brackets/Playoffs)
  const faseDetails = useMemo(() => {
    return fases.find(f => f._id === selectedFase) || null;
  }, [fases, selectedFase]);

  // Modal Detail state
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string, name: string } | null>(null);

  // Sync selectedPlayer with URL param
  useEffect(() => {
    const playerId = searchParams.get('player');
    const playerName = searchParams.get('playerName');
    if (playerId && playerName) {
      setSelectedPlayer({ id: playerId, name: playerName });
    } else {
      setSelectedPlayer(null);
    }
  }, [searchParams]);

  const handlePlayerClick = (player: { id: string, name: string }) => {
    updateParams({ player: player.id, playerName: player.name });
  };

  const closeModal = () => {
    updateParams({ player: null, playerName: null });
  };

  // Pick last season by default if none selected
  useEffect(() => {
    if (temporadas.length > 0) {
      const current = searchParams.get('temporada');
      if (!current || (current === 'global' && activeTab !== 'leaderboard')) {
        updateParams({ temporada: temporadas[temporadas.length - 1]._id });
      }
    }
  }, [temporadas, activeTab, searchParams, updateParams]);

  // Effect to reset activeTab if 'resultados' is selected but competition is ranked
  useEffect(() => {
    if (isRanked && activeTab === 'resultados') {
      updateParams({ tab: 'info' });
    }
  }, [isRanked, activeTab, updateParams]);

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
        <CompetenciaHeader
          competencia={competencia}
          isRanked={isRanked}
          onBack={() => navigate('/competencias')}
        />

        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200 overflow-x-auto">
          <nav className="-mb-px flex space-x-8 whitespace-nowrap" aria-label="Tabs">
            <button
              onClick={() => updateParams({ tab: 'info' })}
              className={`${
                activeTab === 'info'
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Información
            </button>
            <button
              onClick={() => updateParams({ tab: 'partidos' })}
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
                onClick={() => updateParams({ tab: 'resultados' })}
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
                onClick={() => updateParams({ tab: 'leaderboard' })}
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
            <CompetenciaInfoTab
              competencia={competencia}
              isRanked={isRanked}
              jugadoresComp={jugadoresComp}
              top3Leaderboard={top3Leaderboard}
              loadingTop3={loadingTop3}
            />
          )}

          {activeTab === 'partidos' && (
            <CompetenciaPartidosTab
              temporadas={temporadas}
              selectedTemporada={selectedTemporada}
              onTemporadaChange={(id) => updateParams({ temporada: id, fase: null, jugadorFilter: null })}
              fases={fases}
              selectedFase={selectedFase}
              onFaseChange={(id) => updateParams({ fase: id })}
              loading={loadingPartidos}
              partidos={fasePartidos}
              onPartidoClick={(partidoId) => navigate(`/partidos/${partidoId}`)}
              isRanked={isRanked}
              jugadoresComp={jugadoresComp}
              selectedJugador={selectedJugadorFilter}
              onJugadorChange={(jid) => updateParams({ jugadorFilter: jid || null })}
            />
          )}

          {activeTab === 'resultados' && (
            <CompetenciaResultadosTab
              temporadas={temporadas}
              selectedTemporada={selectedTemporada}
              onTemporadaChange={(id) => updateParams({ temporada: id, fase: null })}
              fases={fases}
              selectedFase={selectedFase}
              onFaseChange={(id) => updateParams({ fase: id })}
              loading={loadingPartidos}
              faseDetails={faseDetails}
              fasePartidos={fasePartidos}
              onPartidoClick={(partidoId) => navigate(`/partidos/${partidoId}`)}
            />
          )}

          {activeTab === 'leaderboard' && (() => {
            const competenciaNombre = (competencia as any)?.nombre || 'Competencia';
            const organizacionNombre = (competencia as any)?.organizacion?.nombre;
            const modalidad = (competencia as any)?.modalidad || 'Foam';
            const scope: RankingScope =
              selectedTemporada && selectedTemporada !== 'global'
                ? {
                    tipo: 'competencia-temporada',
                    competenciaNombre,
                    organizacionNombre,
                    modalidad,
                    temporadaNombre: temporadas.find((t: any) => t._id === selectedTemporada)?.nombre || 'Temporada',
                  }
                : { tipo: 'competencia', competenciaNombre, organizacionNombre, modalidad };

            return (
              <CompetenciaLeaderboardTab
                temporadas={temporadas}
                selectedTemporada={selectedTemporada}
                onTemporadaChange={(tid: string) => updateParams({ temporada: tid })}
                loading={loadingLeaderboard}
                leaderboard={leaderboard}
                jugadoresComp={jugadoresComp}
                onPlayerClick={handlePlayerClick}
                competenciaId={id!}
                scope={scope}
                modalidad={modalidad}
                categoria={(competencia as any)?.categoria || 'Libre'}
              />
            );
          })()}
        </div>
      </div>

      {selectedPlayer && (
        <PlayerRankedHistoryModal
          isOpen={!!selectedPlayer}
          onClose={closeModal}
          playerId={selectedPlayer.id}
          playerName={selectedPlayer.name}
          modalidad={(competencia as any).modalidad || 'Foam'}
          categoria={(competencia as any).categoria || 'Libre'}
          competenciaId={id!}
          seasonId={selectedTemporada}
        />
      )}
    </div>
  );
};

export default CompetenciaDetalle;
