import React from 'react';
import { useEntity } from '../../hooks';
import { PartidoService, type Partido } from '../../../features/partidos/services/partidoService';
import { formatDate, formatDateTime } from '../../../shared/utils copy/formatDate';

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
  const { data: partido, loading, error } = useEntity<Partido & {
    sets?: SetData[];
    jugadores?: JugadorPartido[];
    estadisticas?: any;
    esRanked?: boolean;
  }>(
    React.useCallback(async () => {
      const p = await PartidoService.getById(partidoId) as any;
      if (!p) return null;

      // Detectar si es ranked (usando isRanked del backend o esRanked si ya viene mapeado)
      const isRanked = p.isRanked || p.esRanked || p.tipo === 'ranked' || (p.competencia && p.competencia.rankedEnabled);
      p.esRanked = isRanked;

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

      if (isRanked) {
        const mp = await PartidoService.getMatchPlayers(partidoId);
        
        // Deduplicar jugadores: El sistema guarda deltas para Rank Global (temporadaId: null) 
        // y para Rank de Temporada. Priorizamos el de temporada si existe.
        const jugadoresMap = new Map();
        mp.forEach((m: any) => {
          const pid = m.playerId?._id || m.playerId;
          const current = jugadoresMap.get(pid);
          // Si no existe o si el nuevo tiene temporadaId, lo guardamos
          if (!current || m.temporadaId) {
            jugadoresMap.set(pid, m);
          }
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
    }, [partidoId])
  );

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

  if (error || !partido) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error al cargar partido: {error || 'No encontrado'}</p>
        </div>
      </div>
    );
  }

  const fechaTexto = partido.fecha && partido.hora
    ? formatDateTime(`${partido.fecha}T${partido.hora}`)
    : partido.fecha
    ? formatDate(partido.fecha)
    : 'Fecha no disponible';

  const sets = partido.sets || [];
  const jugadores = partido.jugadores || [];
  const localJugadores = jugadores.filter(j => j.equipo === 'local');
  const visitanteJugadores = jugadores.filter(j => j.equipo === 'visitante');

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      {/* Header del Partido */}
      <div className="mb-8">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {partido.nombre || `${partido.equipoLocal?.nombre || 'Local'} vs ${partido.equipoVisitante?.nombre || 'Visitante'}`}
          </h1>
          <p className="text-slate-600">{fechaTexto}</p>
          <div className="mt-2">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {partido.estado || 'Programado'}
            </span>
          </div>
        </div>

        {/* Marcador Principal */}
        <div className="flex items-center justify-center gap-12">
          <div className="text-center flex flex-col items-center">
            {/* Logo Local */}
            <div className="mb-4 h-24 w-24 flex items-center justify-center bg-slate-50 rounded-xl p-2 border border-slate-100 shadow-sm">
              {partido.equipoLocal?.escudo ? (
                <img src={partido.equipoLocal.escudo} alt={partido.equipoLocal.nombre} className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-slate-300 font-bold text-3xl">
                  {partido.equipoLocal?.nombre?.charAt(0) || 'L'}
                </div>
              )}
            </div>
            <div className="text-4xl font-bold text-slate-900">{partido.marcadorLocal ?? 0}</div>
            <div className="text-lg font-semibold text-slate-700">{partido.equipoLocal?.nombre || 'Local'}</div>
          </div>

          <div className="text-3xl font-bold text-slate-300 mt-10">VS</div>

          <div className="text-center flex flex-col items-center">
            {/* Logo Visitante */}
            <div className="mb-4 h-24 w-24 flex items-center justify-center bg-slate-50 rounded-xl p-2 border border-slate-100 shadow-sm">
              {partido.equipoVisitante?.escudo ? (
                <img src={partido.equipoVisitante.escudo} alt={partido.equipoVisitante.nombre} className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-slate-300 font-bold text-3xl">
                  {partido.equipoVisitante?.nombre?.charAt(0) || 'V'}
                </div>
              )}
            </div>
            <div className="text-4xl font-bold text-slate-900">{partido.marcadorVisitante ?? 0}</div>
            <div className="text-lg font-semibold text-slate-700">{partido.equipoVisitante?.nombre || 'Visitante'}</div>
          </div>
        </div>
      </div>

      {/* Resultados por Set */}
      {sets.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Resultados por Set</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Set</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{partido.equipoLocal?.nombre || 'Local'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{partido.equipoVisitante?.nombre || 'Visitante'}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Ganador</th>
                  {sets.some(s => s.tiempo) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Tiempo</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sets.map((set) => (
                  <tr key={set.numeroSet} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      Set {set.numeroSet}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                      set.ganador === 'local' ? 'text-green-600 bg-green-50' : 'text-slate-900'
                    }`}>
                      {set.marcadorLocal}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                      set.ganador === 'visitante' ? 'text-green-600 bg-green-50' : 'text-slate-900'
                    }`}>
                      {set.marcadorVisitante}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {set.ganador === 'local' ? partido.equipoLocal?.nombre : set.ganador === 'visitante' ? partido.equipoVisitante?.nombre : '-'}
                    </td>
                    {sets.some(s => s.tiempo) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {set.tiempo || '-'}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jugadores por Equipo */}
      {(localJugadores.length > 0 || visitanteJugadores.length > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Jugadores</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Equipo Local */}
            {localJugadores.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {partido.equipoLocal?.escudo && (
                    <img src={partido.equipoLocal.escudo} alt="" className="h-8 w-8 object-contain" />
                  )}
                  <h3 className="text-lg font-medium text-slate-900">{partido.equipoLocal?.nombre || 'Local'}</h3>
                </div>
                <div className="space-y-2">
                  {localJugadores.map((jugador) => (
                    <div key={jugador.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 bg-slate-200 rounded-full overflow-hidden border border-slate-200">
                          {jugador.foto ? (
                            <img src={jugador.foto} alt={jugador.nombre} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                              <span className="text-xs font-bold">{jugador.nombre.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{jugador.nombre}</div>
                          {jugador.posicion && <div className="text-sm text-slate-500">{jugador.posicion}</div>}
                        </div>
                      </div>
                      {jugador.stats && (
                        <div className="text-sm text-slate-600">
                          {partido.esRanked && jugador.stats.delta !== undefined ? (
                            <span className={`font-bold ${jugador.stats.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {jugador.stats.delta > 0 ? `+${jugador.stats.delta}` : jugador.stats.delta} ELO
                            </span>
                          ) : (
                            <>
                              {jugador.stats.puntos !== undefined && `PTS: ${jugador.stats.puntos}`}
                              {jugador.stats.asistencias !== undefined && ` | AST: ${jugador.stats.asistencias}`}
                              {jugador.stats.rebotes !== undefined && ` | REB: ${jugador.stats.rebotes}`}
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
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {partido.equipoVisitante?.escudo && (
                    <img src={partido.equipoVisitante.escudo} alt="" className="h-8 w-8 object-contain" />
                  )}
                  <h3 className="text-lg font-medium text-slate-900">{partido.equipoVisitante?.nombre || 'Visitante'}</h3>
                </div>
                <div className="space-y-2">
                  {visitanteJugadores.map((jugador) => (
                    <div key={jugador.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 bg-slate-200 rounded-full overflow-hidden border border-slate-200">
                          {jugador.foto ? (
                            <img src={jugador.foto} alt={jugador.nombre} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                              <span className="text-xs font-bold">{jugador.nombre.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{jugador.nombre}</div>
                          {jugador.posicion && <div className="text-sm text-slate-500">{jugador.posicion}</div>}
                        </div>
                      </div>
                      {jugador.stats && (
                        <div className="text-sm text-slate-600">
                          {partido.esRanked && jugador.stats.delta !== undefined ? (
                            <span className={`font-bold ${jugador.stats.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {jugador.stats.delta > 0 ? `+${jugador.stats.delta}` : jugador.stats.delta} ELO
                            </span>
                          ) : (
                            <>
                              {jugador.stats.puntos !== undefined && `PTS: ${jugador.stats.puntos}`}
                              {jugador.stats.asistencias !== undefined && ` | AST: ${jugador.stats.asistencias}`}
                              {jugador.stats.rebotes !== undefined && ` | REB: ${jugador.stats.rebotes}`}
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
      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Información del Partido</h2>
        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-slate-500">Competencia</dt>
            <dd className="mt-1 text-sm text-slate-900">{partido.competencia?.nombre || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Fase</dt>
            <dd className="mt-1 text-sm text-slate-900">{partido.fase?.nombre || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Escenario</dt>
            <dd className="mt-1 text-sm text-slate-900">{partido.escenario || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-slate-500">Estado</dt>
            <dd className="mt-1 text-sm text-slate-900 capitalize">{partido.estado?.replace('_', ' ') || 'N/A'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default DetallePartido;