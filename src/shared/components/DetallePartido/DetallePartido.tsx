import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PartidoService } from '../../../features/partidos/services/partidoService';
import { formatDate, formatDateTime } from '../../../shared/utils/formatDate';
import { PlayerRankedHistoryModal } from '../../../features/competencias/components/PlayerRankedHistoryModal';
import { SharePartidoModal } from '../SharePartidoModal/SharePartidoModal';

interface DetallePartidoProps {
  partidoId: string;
}

interface SetData {
  numeroSet: number;
  marcadorLocal: number;
  marcadorVisitante: number;
  tiempo?: string;
  ganador?: 'local' | 'visitante';
}

interface JugadorPartido {
  id: string;
  nombre: string;
  foto?: string;
  equipo: 'local' | 'visitante';
  posicion?: string;
  stats?: {
    puntos?: number;
    asistencias?: number;
    rebotes?: number;
    delta?: number;
  };
}

const DetallePartido: React.FC<DetallePartidoProps> = ({ partidoId }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showShare, setShowShare] = useState(false);
  
  const { data: partido, isLoading: loading, error } = useQuery({
    queryKey: ['partido-detalle', partidoId],
    queryFn: async () => {
      const p = await PartidoService.getById(partidoId) as any;
      if (!p) return null;

      // Extract competencia ID
      p.competenciaId = p.competencia?._id || p.competencia?.id || (typeof p.competencia === 'string' ? p.competencia : undefined);

      // Detectar si es ranked
      const isRanked = p.isRanked || p.esRanked || p.tipo === 'ranked' || (p.competencia && p.competencia.rankedEnabled);
      p.esRanked = !!isRanked;

      // Cargar sets si no vienen poblados
      if (!p.sets || p.sets.length === 0) {
        const rawSets = await PartidoService.getSets(partidoId);
        p.sets = rawSets.map((s: any) => ({
          numeroSet: s.numeroSet,
          marcadorLocal: s.ganadorSet === 'local' ? 1 : 0,
          marcadorVisitante: s.ganadorSet === 'visitante' ? 1 : 0,
          ganador: s.ganadorSet === 'local' ? 'local' : s.ganadorSet === 'visitante' ? 'visitante' : undefined,
          tiempo: s.duracionSetTimer ? `${Math.floor(s.duracionSetTimer / 60)}:${(s.duracionSetTimer % 60).toString().padStart(2, '0')}` : undefined
        }));
      }

      if (p.esRanked) {
        const mp = await PartidoService.getMatchPlayers(partidoId);
        const jugadoresMap = new Map();
        mp.forEach((m: any) => {
          const pid = m.playerId?._id || m.playerId;
          const current = jugadoresMap.get(pid);
          if (!current || m.temporadaId) jugadoresMap.set(pid, m);
        });

        const localColor = p.rankedMeta?.teamColors?.local || 'rojo';
        p.jugadores = Array.from(jugadoresMap.values()).map((m: any) => ({
          id: m.playerId?._id || m.playerId,
          nombre: m.playerId?.nombre || 'Desconocido',
          foto: m.playerId?.foto,
          equipo: m.teamColor === localColor ? 'local' : 'visitante',
          stats: { delta: m.delta }
        }));
      } else {
        const jp = await PartidoService.getJugadorPartido(partidoId);
        const localId = p.equipoLocal?._id || p.equipoLocal;

        p.jugadores = jp.map((j: any) => ({
          id: j.jugador?._id || j.jugador,
          nombre: j.jugador?.nombre || 'Jugador',
          foto: j.jugador?.foto,
          equipo: (j.equipo?._id || j.equipo) === localId ? 'local' : 'visitante',
          posicion: j.numero ? `#${j.numero}` : undefined,
          stats: j.stats || {
            puntos: j.puntos,
            asistencias: j.asistencias,
            rebotes: j.rebotes
          }
        }));
      }

      return p;
    },
    refetchInterval: (query) => {
      // El primer argumento en v5 es el objeto Query, los datos están en query.state.data
      const data = query.state.data as any;
      const estado = data?.estado?.toLowerCase() || '';
      return (estado.includes('curso') || estado.includes('activa') || estado.includes('vivo')) ? 30000 : false;
    },
    refetchIntervalInBackground: false,
    staleTime: 5000,
  });

  const handlePlayerClick = (id: string, name: string) => {
    setSearchParams(prev => {
      prev.set('player', id);
      prev.set('playerName', name);
      return prev;
    }, { replace: true });
  };

  const closePlayerModal = () => {
    setSearchParams(prev => {
      prev.delete('player');
      prev.delete('playerName');
      return prev;
    }, { replace: true });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando detalles del partido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error al cargar partido: {errorMsg}</p>
        </div>
      </div>
    );
  }

  if (!partido) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">No se encontró la información del partido.</p>
        </div>
      </div>
    );
  }

  const fechaTexto = partido.fecha && partido.hora
    ? formatDateTime(`${partido.fecha}T${partido.hora}`)
    : partido.fecha
    ? formatDate(partido.fecha)
    : 'Fecha no disponible';

  const sets = (partido as any).sets || [];
  const jugadores = (partido as any).jugadores || [] as JugadorPartido[];
  const localJugadores = jugadores.filter((j: any) => j.equipo === 'local');
  const visitanteJugadores = jugadores.filter((j: any) => j.equipo === 'visitante');

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 p-3 sm:p-6">
      {/* Header del Partido */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="text-center flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 leading-tight">
              {partido.nombre || `${partido.equipoLocal?.nombre || 'Local'} vs ${partido.equipoVisitante?.nombre || 'Visitante'}`}
            </h1>
            <p className="text-sm sm:text-base text-slate-600">{fechaTexto}</p>
          </div>
          <button
            onClick={() => setShowShare(true)}
            title="Compartir"
            className="flex-shrink-0 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M15.75 4.5a3 3 0 1 1 .825 2.066l-8.421 4.679a3.002 3.002 0 0 1 0 1.51l8.421 4.679a3 3 0 1 1-.729 1.31l-8.421-4.678a3 3 0 1 1 0-4.132l8.421-4.679a3 3 0 0 1-.096-.755Z" clipRule="evenodd" />
            </svg>
            Compartir
          </button>
        </div>
        <div className="text-center">
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs sm:text-sm font-medium text-blue-700">
              {partido.estado || 'Programado'}
            </span>
          </div>
        </div>

        {/* Marcador Principal */}
        <div className="flex items-center justify-center gap-4 sm:gap-12">
          <Link to={`/equipos/${partido.equipoLocal?._id || partido.equipoLocal?.id}`} className="text-center flex flex-col items-center flex-1 group">
            {/* Logo Local */}
            <div className="mb-2 h-16 w-16 sm:h-24 sm:w-24 flex items-center justify-center bg-slate-50 rounded-xl p-1.5 sm:p-2 border border-slate-100 shadow-sm relative overflow-hidden group-hover:border-brand-200 transition-colors">
              <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold text-xl sm:text-3xl z-0">
                {partido.equipoLocal?.nombre?.charAt(0) || 'L'}
              </div>
              {partido.equipoLocal?.escudo && (
                <img
                  src={partido.equipoLocal.escudo}
                  alt={partido.equipoLocal.nombre}
                  className="relative z-10 max-h-full max-w-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                />
              )}
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-slate-900">{partido.marcadorLocal ?? 0}</div>
            <div className="text-sm sm:text-lg font-semibold text-slate-700 line-clamp-1 group-hover:text-brand-600 group-hover:underline">{partido.equipoLocal?.nombre || 'Local'}</div>
          </Link>

          <div className="text-lg sm:text-3xl font-bold text-slate-300 mt-0 sm:mt-10 self-center">VS</div>

          <Link to={`/equipos/${partido.equipoVisitante?._id || partido.equipoVisitante?.id}`} className="text-center flex flex-col items-center flex-1 group">
            {/* Logo Visitante */}
            <div className="mb-2 h-16 w-16 sm:h-24 sm:w-24 flex items-center justify-center bg-slate-50 rounded-xl p-1.5 sm:p-2 border border-slate-100 shadow-sm relative overflow-hidden group-hover:border-brand-200 transition-colors">
              <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold text-xl sm:text-3xl z-0">
                {partido.equipoVisitante?.nombre?.charAt(0) || 'V'}
              </div>
              {partido.equipoVisitante?.escudo && (
                <img
                  src={partido.equipoVisitante.escudo}
                  alt={partido.equipoVisitante.nombre}
                  className="relative z-10 max-h-full max-w-full object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                />
              )}
            </div>
            <div className="text-2xl sm:text-4xl font-bold text-slate-900">{partido.marcadorVisitante ?? 0}</div>
            <div className="text-sm sm:text-lg font-semibold text-slate-700 line-clamp-1 group-hover:text-brand-600 group-hover:underline">{partido.equipoVisitante?.nombre || 'Visitante'}</div>
          </Link>
        </div>
      </div>

      {/* Resultados por Set */}
      {sets.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">Resultados por Set</h2>
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Set</th>
                    <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{partido.equipoLocal?.nombre || 'Local'}</th>
                    <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{partido.equipoVisitante?.nombre || 'Visitante'}</th>
                    <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ganador</th>
                    {sets.some((s: SetData) => s.tiempo) && (
                      <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tiempo</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {sets.map((set: SetData) => (
                    <tr key={set.numeroSet} className="hover:bg-slate-50">
                      <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm font-medium text-slate-900">
                        {set.numeroSet}
                      </td>
                      <td className={`px-3 py-4 sm:px-6 whitespace-nowrap text-sm font-bold ${
                        set.ganador === 'local' ? 'text-green-600 bg-green-50' : 'text-slate-900'
                      }`}>
                        {set.marcadorLocal}
                      </td>
                      <td className={`px-3 py-4 sm:px-6 whitespace-nowrap text-sm font-bold ${
                        set.ganador === 'visitante' ? 'text-green-600 bg-green-50' : 'text-slate-900'
                      }`}>
                        {set.marcadorVisitante}
                      </td>
                      <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-slate-500">
                        <span className="max-w-[100px] block truncate text-xs sm:text-sm">
                          {set.ganador === 'local' ? partido.equipoLocal?.nombre : set.ganador === 'visitante' ? partido.equipoVisitante?.nombre : '-'}
                        </span>
                      </td>
                      {sets.some((s: SetData) => s.tiempo) && (
                        <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-slate-500">
                          {set.tiempo || '-'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Jugadores por Equipo */}
      {(localJugadores.length > 0 || visitanteJugadores.length > 0) && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">Jugadores</h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {/* Equipo Local */}
            {localJugadores.length > 0 && (
              <div>
                <Link to={`/equipos/${partido.equipoLocal?._id || partido.equipoLocal?.id}`} className="flex items-center gap-2 mb-2 group w-fit">
                  {partido.equipoLocal?.escudo && (
                    <img
                      src={partido.equipoLocal.escudo}
                      alt=""
                      className="h-6 w-6 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                    />
                  )}
                  <h3 className="text-base sm:text-lg font-medium text-slate-900 truncate group-hover:text-brand-600 group-hover:underline">{partido.equipoLocal?.nombre || 'Local'}</h3>
                </Link>
                <div className="space-y-1.5 sm:space-y-2">
                  {localJugadores.map((jugador: JugadorPartido) => (
                    <div 
                      key={jugador.id} 
                      onClick={() => partido.esRanked && handlePlayerClick(jugador.id, jugador.nombre)}
                      className={`flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg transition-all ${
                        partido.esRanked ? 'cursor-pointer hover:bg-brand-50 hover:border-brand-100 border border-transparent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 relative bg-brand-100 rounded-full overflow-hidden border border-brand-200">
                          <img 
                            src={jugador.foto || ''} 
                            alt={jugador.nombre} 
                            className="absolute inset-0 h-full w-full object-cover z-10" 
                            onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                          />
                          <div className="absolute inset-0 h-full w-full flex items-center justify-center text-brand-700">
                            <span className="text-xs sm:text-sm font-bold">
                              {(jugador.nombre || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-medium text-slate-900 text-sm sm:text-base truncate">{jugador.nombre}</div>
                          {jugador.posicion && <div className="text-[10px] sm:text-sm text-slate-500 truncate">{jugador.posicion}</div>}
                        </div>
                      </div>
                      {jugador.stats && (
                        <div className="text-[10px] sm:text-sm text-slate-600 ml-2 whitespace-nowrap">
                          {partido.esRanked && jugador.stats.delta !== undefined ? (
                            <span className={`font-bold ${jugador.stats.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {jugador.stats.delta > 0 ? `+${Number(jugador.stats.delta).toFixed(3)}` : Number(jugador.stats.delta).toFixed(3)} ELO
                            </span>
                          ) : (
                            <>
                              {jugador.stats.puntos !== undefined && `PTS: ${jugador.stats.puntos}`}
                              {jugador.stats.asistencias !== undefined && ` | AST: ${jugador.stats.asistencias}`}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipo Visitante */}
            {visitanteJugadores.length > 0 && (
              <div className="mt-4 sm:mt-0">
                <Link to={`/equipos/${partido.equipoVisitante?._id || partido.equipoVisitante?.id}`} className="flex items-center gap-2 mb-2 group w-fit">
                  {partido.equipoVisitante?.escudo && (
                    <img
                      src={partido.equipoVisitante.escudo}
                      alt=""
                      className="h-6 w-6 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                    />
                  )}
                  <h3 className="text-base sm:text-lg font-medium text-slate-900 truncate group-hover:text-brand-600 group-hover:underline">{partido.equipoVisitante?.nombre || 'Visitante'}</h3>
                </Link>
                <div className="space-y-1.5 sm:space-y-2">
                  {visitanteJugadores.map((jugador: JugadorPartido) => (
                    <div 
                      key={jugador.id} 
                      onClick={() => partido.esRanked && handlePlayerClick(jugador.id, jugador.nombre)}
                      className={`flex items-center justify-between p-2 sm:p-3 bg-slate-50 rounded-lg transition-all ${
                        partido.esRanked ? 'cursor-pointer hover:bg-brand-50 hover:border-brand-100 border border-transparent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 relative bg-brand-100 rounded-full overflow-hidden border border-brand-200">
                          <img 
                            src={jugador.foto || ''} 
                            alt={jugador.nombre} 
                            className="absolute inset-0 h-full w-full object-cover z-10" 
                            onError={(e) => { (e.target as HTMLImageElement).classList.add('hidden'); }}
                          />
                          <div className="absolute inset-0 h-full w-full flex items-center justify-center text-brand-700">
                            <span className="text-xs sm:text-sm font-bold">
                              {(jugador.nombre || 'P').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-medium text-slate-900 text-sm sm:text-base truncate">{jugador.nombre}</div>
                          {jugador.posicion && <div className="text-[10px] sm:text-sm text-slate-500 truncate">{jugador.posicion}</div>}
                        </div>
                      </div>
                      {jugador.stats && (
                        <div className="text-[10px] sm:text-sm text-slate-600 ml-2 whitespace-nowrap">
                          {partido.esRanked && jugador.stats.delta !== undefined ? (
                            <span className={`font-bold ${jugador.stats.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {jugador.stats.delta > 0 ? `+${Number(jugador.stats.delta).toFixed(3)}` : Number(jugador.stats.delta).toFixed(3)} ELO
                            </span>
                          ) : (
                            <>
                              {jugador.stats.puntos !== undefined && `PTS: ${jugador.stats.puntos}`}
                              {jugador.stats.asistencias !== undefined && ` | AST: ${jugador.stats.asistencias}`}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Información Adicional */}
      <div className="border-t border-slate-200 pt-4 sm:pt-6">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">Información del Partido</h2>
        <dl className="grid grid-cols-2 gap-x-2 gap-y-4 sm:gap-x-4 sm:gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase">Competencia</dt>
            <dd className="mt-0.5 text-xs sm:text-sm font-medium truncate">
              {partido.competenciaId ? (
                <Link to={`/competencias/${partido.competenciaId}`} className="text-brand-600 hover:underline">
                  {partido.competencia?.nombre || 'Ver competencia'}
                </Link>
              ) : (
                <span className="text-slate-900">{partido.competencia?.nombre || 'N/A'}</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase">Fase</dt>
            <dd className="mt-0.5 text-xs sm:text-sm text-slate-900 font-medium truncate">{partido.fase?.nombre || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase">Escenario</dt>
            <dd className="mt-0.5 text-xs sm:text-sm text-slate-900 font-medium truncate">{partido.escenario || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-[10px] sm:text-sm font-medium text-slate-500 uppercase">Estado</dt>
            <dd className="mt-0.5 text-xs sm:text-sm text-slate-900 font-medium capitalize">{partido.estado?.replace('_', ' ') || 'N/A'}</dd>
          </div>
        </dl>
      </div>

      {/* Modal de Historial del Jugador */}
      {searchParams.get('player') && (
        <PlayerRankedHistoryModal
          isOpen={!!searchParams.get('player')}
          onClose={closePlayerModal}
          playerId={searchParams.get('player') || ''}
          playerName={searchParams.get('playerName') || ''}
          modalidad={partido.rankedMeta?.modalidad || partido.modalidad || 'Foam'}
          categoria={partido.rankedMeta?.categoria || partido.categoria || 'Libre'}
          competenciaId={partido.competenciaId || ''}
          seasonId={partido.rankedMeta?.temporadaId || (partido as any).temporadaId}
        />
      )}

      <SharePartidoModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        partido={partido}
      />
    </div>
  );
};

export default DetallePartido;