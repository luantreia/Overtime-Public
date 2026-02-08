import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlazaService } from '../services/plazaService';
import { Lobby } from '../types';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';

const PlazaReportResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState([{ teamAScore: 0, teamBScore: 0 }]);
  const [winner, setWinner] = useState<'teamA' | 'teamB' | 'draw'>('draw');

  useEffect(() => {
    if (id) {
      PlazaService.getLobbyById(id)
        .then(setLobby)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleScoreChange = (index: number, team: 'A' | 'B', val: string) => {
    const num = parseInt(val) || 0;
    const newSets = [...sets];
    if (team === 'A') newSets[index].teamAScore = num;
    else newSets[index].teamBScore = num;
    setSets(newSets);
  };

  const addSet = () => setSets([...sets, { teamAScore: 0, teamBScore: 0 }]);
  
  const removeSet = (index: number) => {
    if (sets.length > 1) {
      setSets(sets.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await PlazaService.submitResult(id, { winner, sets });
      navigate(`/plaza/lobby/${id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!lobby) return <ErrorMessage message="No se encontró el lobby" />;

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Reportar Resultado</h2>
          <p className="text-sm text-slate-500 mt-1">{lobby.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Winner Selector */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Ganador Final</label>
            <div className="grid grid-cols-3 gap-3">
              {(['teamA', 'draw', 'teamB'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setWinner(opt)}
                  className={`py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                    winner === opt 
                      ? 'border-brand-600 bg-brand-50 text-brand-700' 
                      : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {opt === 'teamA' ? 'Equipo A' : opt === 'teamB' ? 'Equipo B' : 'Empate'}
                </button>
              ))}
            </div>
          </div>

          {/* Sets Score */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Marcador por Sets</label>
              <button 
                type="button" 
                onClick={addSet}
                className="text-xs font-bold text-brand-600 hover:text-brand-700"
              >
                + AGREGAR SET
              </button>
            </div>

            <div className="space-y-3">
              {sets.map((set, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl">
                  <span className="text-sm font-bold text-slate-400 w-8">#{idx + 1}</span>
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-red-600 uppercase">Team A</span>
                      <input 
                        type="number"
                        value={set.teamAScore}
                        onChange={(e) => handleScoreChange(idx, 'A', e.target.value)}
                        className="w-full border-slate-200 rounded-lg text-center font-bold focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-blue-600 uppercase">Team B</span>
                      <input 
                        type="number"
                        value={set.teamBScore}
                        onChange={(e) => handleScoreChange(idx, 'B', e.target.value)}
                        className="w-full border-slate-200 rounded-lg text-center font-bold focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  {sets.length > 1 && (
                    <button type="button" onClick={() => removeSet(idx)} className="text-slate-300 hover:text-red-500">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-100 transition-all"
            >
              ENVIAR RESULTADO
            </button>
            <p className="mt-4 text-[11px] text-slate-400 text-center leading-relaxed">
              Al enviar, se notificará al capitán rival o al oficial para confirmar. 
              Una vez confirmado, los puntos ELO se aplicarán a todos los perfiles reclamados.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlazaReportResult;
