import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlazaService } from '../services/plazaService';
import { Lobby } from '../types';
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner';
import { ErrorMessage } from '../../../shared/components/ErrorMessage';
import { 
  UsersIcon, MapPinIcon, ClockIcon, TrophyIcon, 
  UserGroupIcon, ShieldCheckIcon, CheckCircleIcon,
  ExclamationCircleIcon, UserIcon, TrashIcon
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { getAuthTokens } from '../../../utils/apiClient';

const PlazaLobby: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState<boolean>(true);
  const [ratingData, setRatingData] = useState<Record<string, string>>({});

  const fetchLobby = useCallback(async () => {
    if (!id) return;
    try {
      const data = await PlazaService.getLobbyById(id);
      setLobby(data);
      
      // Consultar si el usuario tiene perfil si está logueado
      try {
        await PlazaService.getMyProfile();
        setHasProfile(true);
      } catch (e) {
        setHasProfile(false);
      }
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

  const handleRate = async () => {
    if (!id || !lobby) return;
    const ratings = Object.entries(ratingData).map(([playerId, type]) => ({
      playerId,
      type
    }));
    
    if (ratings.length === 0) {
      alert("Por favor califica al menos a un jugador.");
      return;
    }

    setActionLoading(true);
    try {
      await PlazaService.submitRatings(id, ratings);
      alert("¡Gracias por tu feedback! Tu karma ayuda a mantener una comunidad sana.");
      await fetchLobby();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
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

  const handleKickOfficial = async (officialUid: string) => {
    if (!id || !window.confirm("¿Expulsar a este oficial del lobby?")) return;
    try {
      setActionLoading(true);
      await PlazaService.kickOfficial(id, officialUid);
      await fetchLobby();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm("¿Estás seguro de que quieres eliminar este lobby? Se cancelará el partido.")) return;
    try {
      setActionLoading(true);
      await PlazaService.deleteLobby(id);
      navigate('/plaza');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    const isHost = userUid === lobby?.host;
    const msg = isHost 
      ? '¿Solicitar la cancelación del partido? Esto requiere confirmación del Capitán Rival.' 
      : '¿Confirmar la cancelación del partido solicitada por el Host?';
      
    if (!id || !window.confirm(msg)) return;
    
    setActionLoading(true);
    try {
      const response = await PlazaService.requestCancel(id);
      if (response.cancelled) {
        alert('Partido cancelado con éxito.');
        navigate('/plaza');
      } else {
        await fetchLobby();
      }
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

  const confirmedA = teamA.filter(p => p.confirmed);
  const confirmedB = teamB.filter(p => p.confirmed);
  const canStart = confirmedA.length >= 1 && confirmedB.length >= 1;

  // Determinar quién es el Capitán Rival (para el consenso)
  // Si ya empezó, usamos el guardado. Si no, mostramos al de mejor Karma del equipo contrario al host.
  const hostEntry = lobby.players.find(p => p.userUid === lobby.host);
  const hostTeam = hostEntry ? hostEntry.team : (teamA.some(p => p.userUid === lobby.host) ? 'A' : 'B');
  const rivalPlayers = hostTeam === 'A' ? teamB : teamA;
  
  const suggestedCaptainUid = rivalPlayers.length > 0 
    ? [...rivalPlayers].sort((a,b) => (b.player.karma || 0) - (a.player.karma || 0))[0]?.userUid 
    : null;

  const effectiveRivalCaptainUid = lobby.rivalCaptainUid || suggestedCaptainUid;

  const PlayerSlot = ({ player, index }: { player?: any, index: number }) => {
    const isLobbyHost = player && player.userUid === lobby.host;
    const isRivalCaptain = player && player.userUid === effectiveRivalCaptainUid;

    return (
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium border-2 ${
            isLobbyHost ? 'border-brand-500 bg-brand-50' : 
            isRivalCaptain ? 'border-indigo-500 bg-indigo-50' :
            player ? 'border-slate-100 bg-brand-100 text-brand-700' : 
            'border-dashed border-slate-200 bg-slate-50 text-slate-400'
          }`}>
            {player?.player?.foto ? (
              <img 
                src={player.player.foto} 
                alt={typeof player.player !== 'string' ? player.player.nombre : ''} 
                className="h-full w-full rounded-full object-cover" 
              />
            ) : (index + 1)}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${(player && typeof player.player !== 'string') ? 'font-medium text-slate-900' : 'text-slate-400 italic'}`}>
                {(player && typeof player.player !== 'string') ? (player.player.nombre || player.player.alias) : 'Slot vacío'}
              </span>
              {isLobbyHost && (
                <span className="px-1.5 py-0.5 bg-brand-600 text-[8px] text-white font-black rounded uppercase tracking-tighter">HOST</span>
              )}
              {isRivalCaptain && (
                <span className="px-1.5 py-0.5 bg-indigo-600 text-[8px] text-white font-black rounded uppercase tracking-tighter">CAPITÁN</span>
              )}
            </div>
            {(player && typeof player.player !== 'string' && player.player.elo !== undefined) && (
            <div className="flex gap-2">
              <span className="text-[10px] text-slate-400 font-bold">ELO: {player.player.elo}</span>
              {player.player.karma !== undefined && (
                <span className="text-[10px] text-orange-400 font-bold flex items-center gap-0.5">
                  <StarIcon className="h-2 w-2" /> {player.player.karma}
                </span>
              )}
            </div>
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
  };

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
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><MapPinIcon className="h-4 w-4" />{lobby.location.address || lobby.location.name}</span>
                <span className="flex items-center gap-1.5"><ClockIcon className="h-4 w-4" />{new Date(lobby.scheduledDate).toLocaleString()}</span>
                <span className="flex items-center gap-1.5"><UsersIcon className="h-4 w-4" />Modo: {lobby.modalidad} - {lobby.categoria}</span>
                {lobby.averageElo && (
                   <span className="flex items-center gap-1.5 font-bold text-brand-700">
                     <TrophyIcon className="h-4 w-4" />ELO Promedio: {lobby.averageElo}
                   </span>
                )}
              </div>

              {lobby.hostInfo && (
                <div className="mt-4 flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 max-w-fit">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <UserIcon className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Host del Lobby</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{lobby.hostInfo.nombre}</span>
                      <div className="flex items-center gap-1 bg-brand-100 px-1.5 py-0.5 rounded text-[10px] font-black text-brand-700">
                         {lobby.hostInfo.elo} ELO
                      </div>
                      <div className="flex items-center gap-1 bg-orange-100 px-1.5 py-0.5 rounded text-[10px] font-black text-orange-700">
                         <StarIcon className="h-2.5 w-2.5" /> {lobby.hostInfo.karma} Karma
                      </div>
                    </div>
                  </div>
                </div>
              )}
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

          <div className="mt-8 flex flex-col gap-4">
            {lobby.result && lobby.result.submittedBy && !lobby.result.confirmedByOpponent && (
              <div className="w-full bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg border border-brand-200">
                    <TrophyIcon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-brand-600 font-bold uppercase tracking-wider">Resultado Pendiente</p>
                    <p className="text-xl font-black text-slate-900">
                      Rojo <span className="text-brand-600">{lobby.result.scoreA}</span> - <span className="text-brand-600">{lobby.result.scoreB}</span> Azul
                    </p>
                  </div>
                </div>
                {isHost && lobby.result.submittedBy === userUid && (
                  <button 
                    onClick={() => navigate(`/plaza/lobby/${id}/report`)}
                    className="text-xs font-bold text-brand-700 bg-white border border-brand-200 px-3 py-1.5 rounded-lg hover:bg-brand-100 transition-colors"
                  >
                    CORREGIR
                  </button>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {!hasProfile && !isJoined && (
              <div className="w-full bg-orange-50 border border-orange-200 rounded-xl p-6 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <ExclamationCircleIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black text-orange-900 uppercase tracking-wider">Perfil de Atleta Requerido</h4>
                    <p className="mt-1 text-sm text-orange-800 leading-relaxed">
                      Para participar en La Plaza, necesitas tener un perfil de jugador vinculado. 
                      Si ya has jugado antes, búscalo y reclámalo para continuar.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => navigate('/jugadores')}
                    className="flex items-center justify-center gap-2 bg-orange-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 text-sm"
                  >
                    🔍 Buscar y Reclamar mi Perfil
                  </button>
                </div>
                <p className="text-[10px] text-orange-600 italic text-center">
                  * Si no encuentras tu perfil, contacta con las ligas oficiales para que se te asigne uno.
                </p>
              </div>
            )}

            {!isJoined && hasProfile && (lobby.status === 'open' || lobby.status === 'full') && (
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
                disabled={actionLoading || !canStart}
                className={`flex-1 min-w-[200px] font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 ${
                  canStart 
                    ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-100' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {canStart ? 'EMPEZAR PARTIDO' : 'FALTA CHECK-IN RIVAL'}
              </button>
            )}

            {isHost && (lobby.status === 'open' || lobby.status === 'full') && (
              <button 
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 min-w-[200px] bg-red-50 text-red-600 border border-red-100 font-bold py-3 px-6 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
              >
                ELIMINAR LOBBY
              </button>
            )}

            {lobby.status === 'playing' && lobby.result?.submittedBy && (isHost || isOfficial) && lobby.result.submittedBy === userUid && !lobby.result.confirmedByOpponent && (
              <div className="flex-1 min-w-[200px] bg-slate-50 text-slate-400 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 border border-slate-100 italic text-sm">
                ESPERANDO CONFIRMACIÓN...
              </div>
            )}

            {lobby.status === 'playing' && lobby.result?.submittedBy && !lobby.result.confirmedByOpponent && (userUid === lobby.rivalCaptainUid || isOfficial) && (
              <button 
                onClick={() => PlazaService.confirmResult(id!).then(fetchLobby)}
                disabled={actionLoading}
                className="flex-1 min-w-[200px] bg-brand-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-700 transition-all disabled:opacity-50"
              >
                CONFIRMAR RESULTADO
              </button>
            )}

            {lobby.status === 'playing' && (isHost || isOfficial) && !lobby.result?.submittedBy && (
              <button 
                onClick={() => navigate(`/plaza/lobby/${id}/report`)}
                className="flex-1 min-w-[200px] bg-brand-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-brand-700 transition-all"
              >
                SUBIR RESULTADO
              </button>
            )}

            {/* Cancelación Mutua durante el juego */}
            {lobby.status === 'playing' && (
              <>
                {isHost && !lobby.cancelRequest?.hostRequested && (
                  <button 
                    onClick={handleCancelRequest}
                    disabled={actionLoading}
                    className="flex-1 min-w-[200px] bg-red-50 text-red-600 border border-red-100 font-bold py-3 px-6 rounded-xl hover:bg-red-100 transition-all disabled:opacity-50"
                  >
                    SOLICITAR CANCELACIÓN
                  </button>
                )}
                
                {lobby.cancelRequest?.hostRequested && (
                  <>
                    {userUid === lobby.rivalCaptainUid ? (
                      <button 
                        onClick={handleCancelRequest}
                        disabled={actionLoading}
                        className="flex-1 min-w-[200px] bg-red-600 text-white font-bold py-3 px-6 rounded-xl animate-pulse hover:bg-red-700 transition-all disabled:opacity-50"
                      >
                        CONFIRMAR CANCELACIÓN (RIVAL)
                      </button>
                    ) : (
                      <div className="flex-1 min-w-[200px] border-red-200 bg-red-50 text-red-700 font-bold py-3 px-3 rounded-xl border text-center text-[10px] flex items-center justify-center uppercase">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1 shrink-0" />
                        Cancelación solicitada por Host. Esperando rival.
                      </div>
                    )}
                  </>
                )}
              </>
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
                   <span key={u.userUid} className="px-2 py-1 bg-white border border-yellow-200 rounded text-xs text-yellow-700 font-medium">
                     {(typeof u.player !== 'string') ? (u.player.nombre || u.player.alias) : 'Jugador'}
                   </span>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Sistema de Karma 2.0: Votación Post-partido */}
      {lobby.status === 'finished' && !lobby.votedUsers?.includes(userUid || '') && isJoined && (
        <div className="bg-white rounded-2xl border-2 border-brand-100 shadow-xl p-6 mb-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <StarIcon className="h-24 w-24 text-brand-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">¡Califica la conducta!</h2>
          <p className="text-sm text-slate-500 mb-6">Tu voto ayuda a mantener una comunidad sana y justa.</p>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {lobby.players.filter(p => p.player._id !== (hasProfile ? userUid : '') && p.userUid !== userUid).map(p => (
              <div key={p.userUid} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold overflow-hidden border border-slate-200">
                    {p.player.foto ? <img src={p.player.foto} alt="foto" className="h-full w-full object-cover" /> : (p.player.alias?.[0] || p.player.nombre?.[0])}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">{p.player.alias || p.player.nombre}</div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-tighter">Equipo {p.team}</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'positive', label: '👍 Bien', colorClass: 'hover:border-green-400 hover:bg-green-50', activeClass: 'bg-green-600 text-white' },
                    { id: 'fair-play', label: '🤝 Pro', colorClass: 'hover:border-blue-400 hover:bg-blue-50', activeClass: 'bg-blue-600 text-white' },
                    { id: 'mvp', label: '⭐ MVP', colorClass: 'hover:border-yellow-400 hover:bg-yellow-50', activeClass: 'bg-yellow-600 text-white' },
                    { id: 'negative', label: '👎 Mal', colorClass: 'hover:border-red-400 hover:bg-red-50', activeClass: 'bg-red-600 text-white' },
                    { id: 'no-show', label: '🚫 AFK', colorClass: 'hover:border-slate-400 hover:bg-slate-50', activeClass: 'bg-slate-700 text-white' }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      onClick={() => setRatingData(prev => ({ ...prev, [p.player._id]: btn.id }))}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                        ratingData[p.player._id] === btn.id 
                          ? btn.activeClass
                          : `bg-white text-slate-600 border-slate-200 ${btn.colorClass}`
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
             <button 
               onClick={handleRate}
               disabled={actionLoading}
               className="bg-brand-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-100 hover:bg-brand-700 transition-all disabled:opacity-50"
             >
               {actionLoading ? 'Enviando...' : 'Enviar Calificaciones'}
             </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <TeamBox title="Equipo A (Rojo)" players={teamA} color="red" />
        <TeamBox title="Equipo B (Azul)" players={teamB} color="blue" />
      </div>

      {lobby.officials.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-4 py-2 text-sm font-bold border-b bg-slate-50 text-slate-700">Oficiales ({lobby.officials.length})</div>
          <div className="divide-y divide-slate-100">
            {lobby.officials.map((o, i) => {
              const name = typeof o.player === 'object' ? (o.player.alias || o.player.nombre) : 'Oficial';
              const karma = typeof o.player === 'object' ? o.player.karma : 0;
              const elo = typeof o.player === 'object' ? o.player.elo : 1500;
              
              return (
                <div key={i} className="px-4 py-3 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">
                      {o.type.toUpperCase()}: {o.userUid === userUid ? 'Tú' : name}
                    </span>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-medium text-slate-600">{elo} ELO</span>
                      <span className="text-[10px] bg-orange-50 px-1.5 py-0.5 rounded font-bold text-orange-600 flex items-center gap-0.5">
                        <StarIcon className="h-2 w-2" /> {karma} Karma
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isHost && o.userUid !== userUid && lobby.status === 'open' && (
                      <button 
                        onClick={() => handleKickOfficial(o.userUid)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Expulsar Oficial"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                    {o.confirmed ? <ShieldCheckIcon className="h-5 w-5 text-green-500" /> : <ClockIcon className="h-5 w-5 text-slate-300" />}
                  </div>
                </div>
              );
            })}
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
              <p className="text-sm font-bold text-slate-900">Multiplicador {lobby.requireOfficial ? '0.5x' : '0.3x'}</p>
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
