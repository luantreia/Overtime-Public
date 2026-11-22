import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { RankedService } from '../../competencias/services/rankedService';
import { CompetenciaLeaderboardTab } from '../../competencias/components/CompetenciaLeaderboardTab';
import { PlayerRankedHistoryModal } from '../../competencias/components/PlayerRankedHistoryModal';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';

// Para figurar hace falta al menos un partido rankeado: el backend guarda filas con 0 PJ.
const MIN_PARTIDOS = 1;

const MODALIDADES = ['Foam', 'Cloth'] as const;
const CATEGORIAS = ['Masculino', 'Femenino', 'Mixto', 'Libre'] as const;

type Modalidad = (typeof MODALIDADES)[number];
type Categoria = (typeof CATEGORIAS)[number];

// Los filtros viven en la URL (/ranking?modalidad=Cloth&categoria=Mixto) para poder compartir un ranking puntual.
const leer = <T extends string>(valor: string | null, opciones: readonly T[], porDefecto: T): T =>
  (opciones as readonly string[]).includes(valor ?? '') ? (valor as T) : porDefecto;

export default function RankingGlobalPage() {
  usePageTitle('Ranking ELO de dodgeball', { description: 'Ranking ELO de jugadores de dodgeball en foam y cloth: rating, partidos jugados, victorias y derrotas según los partidos rankeados.' });
  const [params, setParams] = useSearchParams();
  const modalidad = leer<Modalidad>(params.get('modalidad'), MODALIDADES, 'Foam');
  const categoria = leer<Categoria>(params.get('categoria'), CATEGORIAS, 'Libre');
  const setFiltro = (clave: 'modalidad' | 'categoria', valor: string) => {
    const sig = new URLSearchParams(params);
    sig.set(clave, valor);
    setParams(sig, { replace: true });
  };
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string } | null>(null);

  // useQuery: estado de error real, sin parpadeo de "sin resultados" al entrar, y sin carreras al
  // cambiar filtros rápido. keepPreviousData deja la tabla anterior visible mientras llega la nueva.
  const { data, isPending, isFetching, isError, refetch } = useQuery({
    queryKey: ['ranking-global', modalidad, categoria, MIN_PARTIDOS],
    queryFn: () => RankedService.getLeaderboard({ modalidad, categoria, minMatches: MIN_PARTIDOS, limit: 200 }),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
  const leaderboard = data?.items ?? [];
  const loading = isPending;

  return (
    <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Ranking ELO de dodgeball</h1>
          <p className="hidden sm:block text-sm text-slate-500 mt-0.5">Rating de jugadores según sus partidos rankeados, por modalidad y categoría.</p>
          <p className="hidden sm:block text-xs text-slate-500 mt-1">Figuran quienes tienen al menos {MIN_PARTIDOS} partido rankeado en {modalidad} · {categoria}.</p>
        </div>

        <div className="flex gap-3 sm:ml-auto w-full sm:w-auto">
          <div className="space-y-1 flex-1 sm:flex-none">
            <label htmlFor="rankingglobalpage-modalidad" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Modalidad</label>
            <select id="rankingglobalpage-modalidad"
              value={modalidad}
              onChange={(e) => setFiltro('modalidad', e.target.value)}
              className="w-full sm:w-auto rounded-md border border-slate-300 bg-white pl-3 pr-9 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              {MODALIDADES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1 flex-1 sm:flex-none">
            <label htmlFor="rankingglobalpage-categoria" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
            <select id="rankingglobalpage-categoria"
              value={categoria}
              onChange={(e) => setFiltro('categoria', e.target.value)}
              className="w-full sm:w-auto rounded-md border border-slate-300 bg-white pl-3 pr-9 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isError && !data ? (
        <ErrorMessage
          title="No pudimos cargar el ranking"
          message="Puede que el servidor esté arrancando. Probá de nuevo en unos segundos."
          onRetry={() => refetch()}
        />
      ) : (
      <div className={`space-y-6 transition-opacity ${isFetching && !isPending ? 'opacity-60' : ''}`} aria-busy={isFetching}>
      {!loading && leaderboard.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <TrophyIcon className="h-12 w-12 text-muted" />
          <div>
            <p className="text-base font-semibold text-slate-700">Sin resultados para {modalidad} · {categoria}</p>
            <p className="mt-1 text-sm text-muted">Todavía no hay jugadores rankeados en esta categoría. ¡Jugá el primer partido!</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <CompetenciaLeaderboardTab
            temporadas={[]}
            selectedTemporada="global"
            onTemporadaChange={() => {}}
            loading={loading}
            leaderboard={leaderboard}
            jugadoresComp={[]}
            onPlayerClick={setSelectedPlayer}
            competenciaId=""
            scope={{ tipo: 'global', categoria, modalidad }}
            modalidad={modalidad}
            categoria={categoria}
          />
        </div>
      )}
      </div>
      )}

      {selectedPlayer && (
        <PlayerRankedHistoryModal
          isOpen={!!selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          playerId={selectedPlayer.id}
          playerName={selectedPlayer.name}
          modalidad={modalidad}
          categoria={categoria}
          competenciaId=""
          scope={{ tipo: 'global', categoria, modalidad }}
        />
      )}
    </div>
  );
}
