import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RankedService } from '../services/rankedService';

interface PlayerRankedHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerId: string;
  playerName: string;
  modalidad: string;
  categoria: string;
  competenciaId: string;
  seasonId?: string;
}

export const PlayerRankedHistoryModal: React.FC<PlayerRankedHistoryModalProps> = ({
  isOpen,
  onClose,
  playerId,
  playerName,
  modalidad,
  categoria,
  competenciaId,
  seasonId
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [synergy, setSynergy] = useState<any[]>([]);
  const [showAllSynergy, setShowAllSynergy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation and Filtering
  const [activePlayer, setActivePlayer] = useState({ id: playerId, name: playerName });
  const [playerStack, setPlayerStack] = useState<{ id: string; name: string }[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActivePlayer({ id: playerId, name: playerName });
      setPlayerStack([]);
      setSelectedPartnerId(null);
    }
  }, [isOpen, playerId, playerName]);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await RankedService.getPlayerDetail(activePlayer.id, {
        modalidad,
        categoria,
        competition: competenciaId,
        season: seasonId
      });
      setRating(res.rating);
      setHistory(res.history);
      setSynergy(res.synergy || []);
    } catch (e: any) {
      setError(e.message || 'Error al cargar detalles');
    } finally {
      setLoading(false);
    }
  }, [activePlayer.id, modalidad, categoria, competenciaId, seasonId]);

  useEffect(() => {
    if (isOpen && activePlayer.id) {
      fetchDetail();
    }
  }, [isOpen, activePlayer.id, fetchDetail]);

  const navigateToPlayer = (id: string, name: string) => {
    setPlayerStack(prev => [...prev, activePlayer]);
    setActivePlayer({ id, name });
    setSelectedPartnerId(null);
  };

  const goBack = () => {
    const prev = playerStack[playerStack.length - 1];
    if (prev) {
      setPlayerStack(prev => prev.slice(0, -1));
      setActivePlayer(prev);
      setSelectedPartnerId(null);
    }
  };

  if (!isOpen) return null;

  const filteredHistory = selectedPartnerId 
    ? history.filter(h => {
        const partner = synergy.find(s => s.id === selectedPartnerId);
        return partner?.matchIds?.includes(h.partidoId?._id || h.partidoId);
      })
    : history;

  const partnerInfo = selectedPartnerId ? synergy.find(s => s.id === selectedPartnerId) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] flex flex-col border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             {playerStack.length > 0 && (
               <button 
                onClick={goBack}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                 </svg>
               </button>
             )}
             <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold">
                {activePlayer.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
             </div>
             <div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">{activePlayer.name}</h2>
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider">{modalidad} • {categoria}</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto mb-4"></div>
            <p className="text-slate-400 font-medium">Cargando historial...</p>
          </div>
        ) : error ? (
           <div className="py-10 text-center px-4">
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex flex-col items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
                 <p className="text-sm font-bold">{error}</p>
                 <button onClick={fetchDetail} className="mt-2 text-xs bg-red-600 text-white px-4 py-2 rounded-lg font-bold">Reintentar</button>
              </div>
           </div>
        ) : (
          <div className="overflow-auto flex-1 space-y-6 pr-1 custom-scrollbar">
             <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-2 gap-6">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Rating Actual</p>
                   <p className="text-3xl font-black text-brand-600">{Math.round(rating?.rating || 1500)}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Partidos</p>
                   <p className="text-3xl font-black text-slate-800">{history.length}</p>
                </div>
             </div>

             {synergy.length > 0 && (
               <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Sinergia (Winrate con otros)
                    </h3>
                    <div className="flex items-center gap-3">
                      {selectedPartnerId && (
                        <button 
                          onClick={() => setSelectedPartnerId(null)}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-tight"
                        >
                          Quitar filtro
                        </button>
                      )}
                      <button 
                        onClick={() => setShowAllSynergy(!showAllSynergy)}
                        className="text-[10px] font-bold text-brand-600 hover:text-brand-700 uppercase tracking-tight"
                      >
                        {showAllSynergy ? 'Ver menos' : `Ver todos (${synergy.length})`}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {(showAllSynergy ? synergy : synergy.slice(0, 3)).map((s: any) => (
                      <div 
                        key={s.id} 
                        className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                          selectedPartnerId === s.id 
                            ? 'bg-brand-50 border-brand-200 ring-2 ring-brand-100' 
                            : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                        }`}
                        onClick={() => setSelectedPartnerId(s.id === selectedPartnerId ? null : s.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                            {s.name.split(' ').map((n:any) => n[0]).join('').slice(0,2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">{s.name}</span>
                            <span className="text-[9px] text-slate-400 font-medium">{s.matches} PJ</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-500 ${s.winrate >= 50 ? 'bg-emerald-500' : 'bg-red-400'}`}
                                style={{ width: `${s.winrate}%` }}
                              ></div>
                            </div>
                            <span className={`text-[11px] font-black w-10 text-right ${s.winrate >= 50 ? 'text-emerald-600' : 'text-slate-500'}`}>
                              {Math.round(s.winrate)}%
                            </span>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToPlayer(s.id, s.name);
                            }}
                            className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-brand-600 transition-all border border-transparent hover:border-brand-200"
                            title="Ver perfil completo"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
             )}

             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {selectedPartnerId ? 'Partidos con ' + partnerInfo?.name : 'Historial de Partidos'}
                  </h3>
                  {selectedPartnerId && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {partnerInfo?.wins}W - {partnerInfo?.matches - partnerInfo?.wins}L
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                   {filteredHistory.length === 0 ? (
                     <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-400 italic text-sm">No se encontraron registros.</p>
                     </div>
                   ) : (
                     filteredHistory.map((h) => {
                       const isWin = (h.win === true || (h.win === undefined && h.delta > 0));
                       const partidoId = h.partidoId?._id || h.partidoId;
                       
                       return (
                         <div 
                            key={h._id} 
                            onClick={() => partidoId && navigate(`/partidos/${partidoId}`)}
                            className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-brand-400 hover:bg-brand-50/20 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                         >
                            <div className="flex items-center gap-4">
                               <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black transition-transform group-hover:scale-110 ${
                                 isWin ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'
                               }`}>
                                  {isWin ? 'W' : 'L'}
                               </div>
                               <div>
                                  <p className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                                     {new Date(h.partidoId?.fecha || h.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </p>
                                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                     <span className={`w-2 h-2 rounded-full ${h.teamColor === 'rojo' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                     EQUIPO {h.teamColor?.toUpperCase()}
                                  </p>
                               </div>
                            </div>

                            <div className="flex items-center gap-3">
                               <div className="text-right">
                                  <div className={`text-sm font-black ${h.delta > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                     {h.delta > 0 ? `+${h.delta.toFixed(2)}` : h.delta.toFixed(2)}
                                  </div>
                                  <div className="text-[10px] text-slate-500 font-bold">
                                     {h.partidoId?.marcadorLocal !== undefined ? `${h.partidoId.marcadorLocal} - ${h.partidoId.marcadorVisitante}` : 'Ver detalles'}
                                  </div>
                                  {h.isAFK && (
                                    <span className="bg-red-500 text-white text-[7px] px-1 rounded font-bold">AFK</span>
                                  )}
                               </div>
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300 group-hover:text-brand-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                               </svg>
                            </div>
                         </div>
                       );
                     })
                   )}
                </div>
             </div>
          </div>
        )}
        
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
           <p className="text-[9px] text-slate-400 font-medium">Los puntos se calculan dinámicamente según el nivel de los oponentes.</p>
        </div>
      </div>
    </div>
  );
};
