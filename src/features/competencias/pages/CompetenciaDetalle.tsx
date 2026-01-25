import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEntity } from '../../../shared/hooks';
import { CompetenciaService, type Competencia } from '../services/competenciaService';
import { RankedService, type LeaderboardItem } from '../services/rankedService';
import { PartidoService, type Partido } from '../../partidos/services/partidoService';
import { TemporadaService, type Temporada } from '../services/temporadaService';
import { FaseService, type Fase } from '../services/faseService';
import { JugadorCompetenciaService, type JugadorCompetencia } from '../services/jugadorCompetenciaService';
import {
  PlayerRankedHistoryModal,
  CompetenciaHeader,
  CompetenciaInfoTab,
  CompetenciaPartidosTab,
  CompetenciaResultadosTab,
  CompetenciaLeaderboardTab
} from '../components';

const CompetenciaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'info' | 'leaderboard' | 'partidos' | 'resultados'>('info');
  
  // State for Leaderboard
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [jugadoresComp, setJugadoresComp] = useState<JugadorCompetencia[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

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
    setSearchParams(prev => {
      prev.set('player', player.id);
      prev.set('playerName', player.name);
      return prev;
    });
  };

  const closeModal = () => {
    setSearchParams(prev => {
      prev.delete('player');
      prev.delete('playerName');
      return prev;
    });
  };

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
        <CompetenciaHeader 
          competencia={competencia} 
          isRanked={isRanked} 
          onBack={() => navigate('/competencias')} 
        />

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
          {activeTab === 'info' && <CompetenciaInfoTab competencia={competencia} />}

          {activeTab === 'partidos' && (
            <CompetenciaPartidosTab
              temporadas={temporadas}
              selectedTemporada={selectedTemporada}
              onTemporadaChange={setSelectedTemporada}
              fases={fases}
              selectedFase={selectedFase}
              onFaseChange={setSelectedFase}
              loading={loadingResultados}
              partidos={fasePartidos}
              onPartidoClick={(partidoId) => navigate(`/partidos/${partidoId}`)}
            />
          )}

          {activeTab === 'resultados' && (
            <CompetenciaResultadosTab
              temporadas={temporadas}
              selectedTemporada={selectedTemporada}
              onTemporadaChange={setSelectedTemporada}
              fases={fases}
              selectedFase={selectedFase}
              onFaseChange={setSelectedFase}
              loading={loadingResultados}
              faseDetails={faseDetails}
              fasePartidos={fasePartidos}
              onPartidoClick={(partidoId) => navigate(`/partidos/${partidoId}`)}
            />
          )}

          {activeTab === 'leaderboard' && (
            <CompetenciaLeaderboardTab
              temporadas={temporadas}
              selectedTemporada={selectedTemporada}
              onTemporadaChange={setSelectedTemporada}
              loading={loadingLeaderboard}
              leaderboard={leaderboard}
              jugadoresComp={jugadoresComp}
              onPlayerClick={handlePlayerClick}
            />
          )}
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
