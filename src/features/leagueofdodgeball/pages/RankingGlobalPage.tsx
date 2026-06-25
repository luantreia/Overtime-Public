import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RankedService, type LeaderboardItem } from '../../competencias/services/rankedService';
import { CompetenciaLeaderboardTab } from '../../competencias/components/CompetenciaLeaderboardTab';
import { TrophyIcon } from '@heroicons/react/24/outline';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

const MODALIDADES = ['Foam', 'Cloth'] as const;
const CATEGORIAS = ['Masculino', 'Femenino', 'Mixto', 'Libre'] as const;

type Modalidad = (typeof MODALIDADES)[number];
type Categoria = (typeof CATEGORIAS)[number];

export default function RankingGlobalPage() {
  usePageTitle('Ranking Global');
  const navigate = useNavigate();
  const [modalidad, setModalidad] = useState<Modalidad>('Foam');
  const [categoria, setCategoria] = useState<Categoria>('Libre');
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await RankedService.getLeaderboard({ modalidad, categoria, limit: 200 });
      setLeaderboard(res.items ?? []);
    } catch {
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  }, [modalidad, categoria]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Ranking Global</h1>
          <p className="text-sm text-slate-500 mt-0.5">Los mejores jugadores de toda la plataforma</p>
        </div>

        <div className="flex gap-3 sm:ml-auto">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Modalidad</label>
            <select
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value as Modalidad)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              {MODALIDADES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as Categoria)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!loading && leaderboard.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <TrophyIcon className="h-12 w-12 text-slate-300" />
          <div>
            <p className="text-base font-semibold text-slate-700">Sin resultados para {modalidad} · {categoria}</p>
            <p className="mt-1 text-sm text-slate-400">Todavía no hay jugadores rankeados en esta categoría. ¡Jugá el primer partido!</p>
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
            onPlayerClick={({ id }) => navigate(`/jugadores/${id}`)}
            competenciaId=""
            competenciaNombre="Ranking Global"
            modalidad={modalidad}
            categoria={categoria}
          />
        </div>
      )}
    </div>
  );
}
