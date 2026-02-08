import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlazaService } from '../services/plazaService';
import { Lobby, LobbySlot } from '../types';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../shared/components/ErrorMessage';
import { 
  UsersIcon, MapPinIcon, ClockIcon, TrophyIcon, 
  UserGroupIcon, ShieldCheckIcon, CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { getAuthTokens } from '../../../utils/apiClient';

const PlazaLobby: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);

  const fetchLobby = useCallback(async () => {
    if (!id) return;
    try {
      const data = await PlazaService.getLobbyById(id);
      setLobby(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLobby();
    const { accessToken } = getAuthTokens();
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        setUserUid(payload.uid || payload.userId || payload.sub);
      } catch (e) {
        console.error("Error decoding token", e);
      }
    }
    const interval = setInterval(fetchLobby, 30000);
    return () => clearInterval(interval);
  }, [fetchLobby]);

  const handleJoin = async (team: 'A' | 'B' | 'none' = 'none') => {
    if (!id) return;
    try {
      setActionLoading(true);
      await PlazaService.joinLobby(id); // Backend will auto-assign if team not provided or full
      await fetchLobby();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinOfficial = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await PlazaService.joinOfficial(id);
      await fetchLobby();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!id) return;
    if (!navigator.geolocation) return alert("Tu dispositivo no soporta geolocalización");
    
    setActionLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await PlazaService.checkIn(id, pos.coords.latitude, pos.coords.longitude);
          alert("¡Check-in realizado con éxito!");
          await fetchLobby();
        } catch (err: any) {
          alert(err.message);
        } finally {
          setActionLoading(false);
        }
      },
      (err) => {
        alert("Error de ubicación: " + err.message);
        setActionLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleBalance = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await PlazaService.balanceTeams(id);
      await fetchLobby();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    if (!id) return;
    try {
      setActionLoading(true);
      await PlazaService.startMatch(id);
      await fetchLobby();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error || !lobby) return <ErrorMessage message={error || "Lobby no encontrado"} />;

  const isHost = userUid === lobby.host;
  const playerEntry = lobby.players.find(p => p.userUid === userUid);
  const isPlayer = !!playerEntry;
  const isOfficial = lobby.officials.some(o => o.userUid === userUid);
  const isJoined = isPlayer || isOfficial;
  const canCheckIn = isPlayer && !playerEntry.confirmed && (lobby.status === 'open' || lobby.status === 'full');
  const isConfirmed = playerEntry?.confirmed;

  const teamA = lobby.players.filter(p => p.team === 'A');
  const teamB = lobby.players.filter(p => p.team === 'B');
  const unassigned = lobby.players.filter(p => p.team === 'none');

  const PlayerSlot = ({ player, index }: { player?: any, index: number }) => (
    <div className="px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
          player ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-400'
        }`}>
          {player?.player?.foto ? <img src={player.player.foto} className="h-full w-full rounded-full object-cover" /> : (index + 1)}
        </div>
        <div className="flex flex-col">
          <span className={`text-sm ${player ? 'font-medium text-slate-900' : 'text-slate-400 italic'}`}>
            {player?.player?.nombre || player?.player?.alias || 'Slot vacío'}
          </span>
          {player?.player?.elo !== undefined && (
            <span className="text-[10px] text-slate-400">ELO: {player.player.elo}</span>
          )}
        </div>
      </div>
      {player && (
        <div className="flex items-center gap-1">
          {player.confirmed ? (
            <ShieldCheckIcon className="h-5 w-5 text-green-500" title="Check-in completado" />
          ) : (
            <ClockIcon className="h-5 w-5 text-slate-300" title="Pendiente de llegada" />
          )}
        </div>
      )}
    </div>
  );

  const TeamBox = ({ title, players, color }: { title: string, players: any[], color: string }) => (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className={`px-4 py-2 text-sm font-bold border-b bg-${color}-50 text-${color}-700`}>
        {title} ({players.length}/9)
      </div>
      <div className="divide-y divide-slate-100">
        {players.map((p, i) => <PlayerSlot key={p._id || i} player={p} index={i} />)}
        {Array.from({ length: Math.max(0, 6 - players.length) }).map((_, i) => (
          <PlayerSlot key={`empty-${i}`} index={players.length + i} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-3 bg-brand-600" />
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{lobby.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><MapPinIcon className="h-4 w-4" />{lobby.location.address || lobby.location.name}</span>
                <span className="flex items-center gap-1.5"><ClockIcon className="h-4 w-4" />{new Date(lobby.scheduledDate).toLocaleString()}</span>
                <span className="flex items-center gap-1.5"><UsersIcon className="h-4 w-4" />Modo: {lobby.modalidad} - {lobby.categoria}</span>
              </div>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-sm font-bold ${
              lobby.status === 'open' ? 'bg-green-100 text-green-700' : 
              lobby.status === 'playing' ? 'bg-orange-100 text-orange-700 animate-pulse' :
              lobby.status === 'finished' ? 'bg-slate-100 text-slate-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {lobby.status.toUpperCase()}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {!isJoined && (lobby.status === 'open' || lobby.status === 'full') && (
              <>
                <button 
                  onClick={() => handleJoin()}
                  disabled={actionLoading}
                  className="flex-1 min-w-[200px] bg-brand-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all disabled:opacity-50"
                >
                  Unirse al Lobby
                </button>
                <button 
                  onClick={handleJoinOfficial}
                  disabled={actionLoading}
                  className="flex-1 min-w-[200px] bg-slate-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-slate-900 transition-all disabled:opacity-50"
                >
                  Unirse como Oficial
                </button>
              </>
            )}

            {canCheckIn && (
              <button 
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="flex-1 min-w-[200px] bg-green-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <MapPinIcon className="h-5 w-5" />
                Validar mi GPS (Check-in)
              </button>
            )}

            {isHost && (lobby.status === 'open' || lobby.status === 'full') && (
              <button 
                onClick={handleBalance}
                disabled={actionLoading}
                className="flex-1 min-w-[200px] bg-indigo-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                Auto-Equilibrar Teams (ELO)
              </button>
            )}

            {isHost && (lobby.status === 'open' || lobby.status === 'full') && teamA.length > 0 && teamB.length > 0 && (
              <button 
                onClick={handleStart}
                disabled={actionLoading}
                className="flex-1 min-w-[200px] bg-brand-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50"
              >
                EMPEZAR PARTIDO
              </button>
            )}

            {lobby.status === 'playing' && (isHost || isOfficial) && (
              <button 
                onClick={() => navigate(`/plaza/lobby/${id}/report`)}
                className="flex-1 min-w-[200px] bg-brand-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-700 transition-all"
              >
                SUBIR RESULTADO
              </button>
            )}

            {lobby.status === 'finished' && lobby.result && !lobby.result.confirmedByOpponent && 
             (userUid === lobby.rivalCaptainUid || isOfficial) && (
              <button 
                onClick={() => PlazaService.confirmResult(id!).then(fetchLobby)}
                className="flex-1 min-w-[200px] bg-brand-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-700 transition-all"
              >
                Confirmar Resultado
              </button>
            )}
          </div>
          
          {isConfirmed && lobby.status === 'open' && (
             <p className="mt-3 text-sm text-green-600 font-medium flex items-center gap-1.5">
               <CheckCircleIcon className="h-5 w-5" /> 
               ¡Ya estás confirmado! Solo falta que el resto llegue al lugar.
             </p>
          )}

          {unassigned.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
               <p className="text-xs font-bold text-yellow-800 mb-2 uppercase">Pendientes de Asignación:</p>
               <div className="flex flex-wrap gap-2">
                 {unassigned.map(u => (
                   <span key={u._id} className="px-2 py-1 bg-white border border-yellow-200 rounded text-xs text-yellow-700 font-medium">
                     {u.player?.nombre || u.player?.alias || 'Jugador'}
                   </span>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <TeamBox title="Equipo A (Rojo)" players={teamA} color="red" />
        <TeamBox title="Equipo B (Azul)" players={teamB} color="blue" />
      </div>

      {lobby.officials.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-2 text-sm font-bold border-b bg-slate-50 text-slate-700">Oficiales ({lobby.officials.length})</div>
          <div className="divide-y divide-slate-100">
            {lobby.officials.map((o, i) => (
              <div key={i} className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium">{o.type.toUpperCase()}: {o.userUid === userUid ? 'Tú' : 'Oficial'}</span>
                {o.confirmed ? <ShieldCheckIcon className="h-5 w-5 text-green-500" /> : <ClockIcon className="h-5 w-5 text-slate-300" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logistics/Rules info */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Información de La Plaza</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex gap-3">
            <TrophyIcon className="h-6 w-6 text-brand-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900">Multiplicador {lobby.config.requireOfficial ? '0.5x' : '0.3x'}</p>
              <p className="text-xs text-slate-500">Este partido cuenta para el ranking global.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ShieldCheckIcon className="h-6 w-6 text-brand-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900">Validación GPS</p>
              <p className="text-xs text-slate-500">Debes estar a menos de 150m para confirmar asistencia.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <UserGroupIcon className="h-6 w-6 text-brand-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900">Matchmaking Equitativo</p>
              <p className="text-xs text-slate-500">Se usará el algoritmo ELO para nivelar los equipos.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <ExclamationCircleIcon className="h-6 w-6 text-red-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-900">Penalización AFK</p>
              <p className="text-xs text-slate-500">Unirte y no asistir baja drásticamente tu Karma.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlazaLobby;
