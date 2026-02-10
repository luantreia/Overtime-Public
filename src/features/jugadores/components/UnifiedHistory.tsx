import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrophyIcon, 
  MapPinIcon, 
  ChevronRightIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  BuildingLibraryIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { JugadorService } from '../services/jugadorService';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';

interface UnifiedHistoryProps {
  jugadorId: string;
}

export const UnifiedHistory: React.FC<UnifiedHistoryProps> = ({ jugadorId }) => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalidad, setModalidad] = useState<string>('');
  const [categoria, setCategoria] = useState<string>('');
  
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await JugadorService.getHistory(jugadorId, {
        modalidad: modalidad || undefined,
        categoria: categoria || undefined
      });
      setHistory(data);
    } catch (err) {
      console.error("Error fetching history", err);
    } finally {
      setLoading(false);
    }
  }, [jugadorId, modalidad, categoria]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <CalendarDaysIcon className="h-6 w-6 text-brand-600" />
          Historial Unificado
        </h3>

        <div className="flex gap-2">
          <select 
            value={modalidad}
            onChange={(e) => setModalidad(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 py-1"
          >
            <option value="">Filtro Modalidad</option>
            <option value="Foam">Foam</option>
            <option value="Cloth">Cloth</option>
          </select>
          <select 
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="text-xs font-bold bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 py-1"
          >
            <option value="">Filtro Categoría</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Mixto">Mixto</option>
            <option value="Libre">Libre</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <LoadingSpinner />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
          <TrophyIcon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-medium">No se encontraron partidos en este historial.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {history.map((match) => (
            <button
              key={match.id} 
              onClick={() => navigate(`/partidos/${match.id}`)}
              className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:border-brand-200 transition-all group overflow-hidden relative"
            >
              {/* Background gradient for Win/Loss */}
              {match.win && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4 relative">
                {/* Visual Label (Liga vs Plaza) */}
                <div className={`shrink-0 h-14 w-14 rounded-xl flex items-center justify-center border ${
                  match.type === 'league' 
                    ? 'bg-amber-50 border-amber-200 text-amber-600' 
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                }`}>
                  {match.type === 'league' ? (
                    match.logo ? <img src={match.logo} alt="org" className="h-full w-full object-contain p-1" /> : <BuildingLibraryIcon className="h-8 w-8" />
                  ) : (
                    <MapPinIcon className="h-8 w-8" />
                  )}
                </div>

                {/* Match Details */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">{formatDate(match.date)}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                      match.type === 'league' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {match.type === 'league' ? 'PARTIDO DE LIGA' : 'PARTIDO PLAZA'}
                    </span>
                    {!match.isRanked && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-slate-100 text-slate-500">
                        Amistoso / No ELO
                      </span>
                    )}
                    {match.isVerified && (
                      <CheckBadgeIcon className="h-4 w-4 text-blue-500" title="Verificado" />
                    )}
                  </div>
                  <h4 className="font-black text-slate-900 leading-tight">
                    {match.type === 'league' ? match.competition : `Encuentro en ${match.organization}`}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                    {match.modality} • {match.category}
                  </p>
                </div>

                {/* Result & ELO Delta */}
                <div className="flex items-center gap-6 sm:border-l sm:pl-6 border-slate-100">
                  <div className="text-center">
                    <p className={`text-xl font-black ${match.win ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {match.score.own} - {match.score.opponent}
                    </p>
                    <p className={`text-[10px] font-black uppercase tracking-tighter ${match.win ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {match.win ? 'VICTORIA' : 'DERROTA'}
                    </p>
                  </div>

                  <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 min-w-[70px] text-center">
                    <p className={`text-sm font-black ${match.delta > 0 ? 'text-emerald-600' : (match.delta < 0 ? 'text-rose-600' : 'text-slate-500')}`}>
                       {match.delta > 0 ? `+${match.delta}` : match.delta}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter flex items-center justify-center gap-0.5">
                      <BoltIcon className="h-2 w-2" /> ELO (x{match.multiplier || '1.0'})
                    </p>
                  </div>

                  <div className="p-2 bg-slate-50 text-slate-300 rounded-full hover:bg-brand-50 hover:text-brand-500 transition-colors hidden sm:block">
                    <ChevronRightIcon className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
