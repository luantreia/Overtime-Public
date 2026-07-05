import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EquipoService, type Equipo } from '../services/equipoService';
import { CompetenciaService } from '../../competencias/services/competenciaService';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { useAuth } from '../../../app/providers/AuthContext';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { crearSolicitudEdicion } from '../../solicitudes/services/solicitudesEdicionService';

const EquipoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'actual' | 'historial'>('actual');
  const [actionLoading, setActionLoading] = useState(false);
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [showAdminRequest, setShowAdminRequest] = useState(false);

  const MAX_ADMINS = 3;

  const { data: equipo, isLoading: loading, error: equipoQueryError } = useQuery<Equipo>({
    queryKey: ['equipo', id],
    queryFn: () => {
      if (!id) throw new Error('ID de equipo no proporcionado');
      return EquipoService.getById(id);
    },
    enabled: !!id,
  });
  const error = equipoQueryError instanceof Error ? equipoQueryError.message : equipoQueryError ? String(equipoQueryError) : null;

  usePageTitle(equipo?.nombre);
  const { jugadoresActivos, jugadoresHistorial } = useMemo(() => {
    if (!equipo?.jugadoresEquipos) return { jugadoresActivos: [], jugadoresHistorial: [] };

    const hoy = new Date();
    
    const activos = equipo.jugadoresEquipos.filter(je => {
      if (je.estado !== 'aceptado') return false;
      if (!je.hasta) return true;
      return new Date(je.hasta) >= hoy;
    });

    const historial = equipo.jugadoresEquipos.filter(je => {
      if (je.estado === 'baja') return true;
      if (je.estado === 'aceptado' && je.hasta && new Date(je.hasta) < hoy) return true;
      return false;
    });

    return { jugadoresActivos: activos, jugadoresHistorial: historial };
  }, [equipo]);

  const competenciaIds = useMemo(() => {
    const ids = (equipo?.participaciontemporadas || [])
      .map((p: any) => p?.temporada?.competencia)
      .filter(Boolean)
      .map((c: any) => (typeof c === 'string' ? c : c?._id || c?.id));
    return Array.from(new Set(ids));
  }, [equipo]);

  const { data: competenciasMap = {} } = useQuery({
    queryKey: ['equipo-competencias-info', competenciaIds.join(',')],
    queryFn: async () => {
      const results = await Promise.all(
        competenciaIds.map((cid: string) => CompetenciaService.getById(cid).catch(() => null))
      );
      const map: Record<string, any> = {};
      results.forEach((comp, i) => {
        if (comp) map[competenciaIds[i]] = comp;
      });
      return map;
    },
    enabled: competenciaIds.length > 0,
  });

  const competenciasAgrupadas = useMemo(() => {
    const groups = new Map<string, { cid: string | undefined; comp: any; temporadas: any[] }>();
    (equipo?.participaciontemporadas || []).forEach((p: any) => {
      const cid = typeof p?.temporada?.competencia === 'string'
        ? p.temporada.competencia
        : (p?.temporada?.competencia?._id || p?.temporada?.competencia?.id);
      const key = cid || 'sin-competencia';
      if (!groups.has(key)) {
        groups.set(key, { cid, comp: cid ? competenciasMap[cid] : null, temporadas: [] });
      }
      groups.get(key)!.temporadas.push(p);
    });
    return Array.from(groups.values());
  }, [equipo, competenciasMap]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600 mx-auto"></div>
          <p className="text-slate-600">Cargando detalles del equipo...</p>
        </div>
      </div>
    );
  }

  if (error || !equipo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-600">Error al cargar equipo: {error || 'No encontrado'}</p>
          <button 
            onClick={() => navigate('/equipos')} 
            className="text-brand-600 hover:underline"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  const escudo = equipo.escudo || equipo.imagen;
  const equipoId = equipo._id || equipo.id;
  const esAdmin = user && (
    equipo.administradores?.some(a => a?.toString() === user.id) ||
    equipo.creadoPor?.toString() === user.id
  );

  const handleRequestAdmin = async () => {
    if (!user || !equipoId) return;
    try {
      setActionLoading(true);
      await crearSolicitudEdicion({
        tipo: 'usuario-solicitar-admin-equipo',
        entidad: equipoId,
        datosPropuestos: { equipoId },
      });
      setSolicitudEnviada(true);
      addToast({
        type: 'success',
        title: 'Solicitud enviada',
        message: 'Tu solicitud para administrar este equipo fue enviada. Un administrador la revisará pronto.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <button 
          onClick={() => navigate('/equipos')} 
          className="mb-6 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          ← Volver a equipos
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header/Cover color */}
          <div className="h-40 bg-gradient-to-r from-slate-800 to-slate-900 flex items-end justify-end p-6">
             {(!equipo.fechaDisolucion) && (
               <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                 Activo
               </span>
             )}
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-16 mb-6">
              <div className="p-2 bg-white rounded-3xl shadow-md border border-slate-100">
                <div className="h-32 w-32 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl font-bold text-slate-300 overflow-hidden border border-slate-100">
                  {escudo ? (
                    <img src={escudo} alt={equipo.nombre} className="h-full w-full object-cover" />
                  ) : (
                    equipo.nombre.charAt(0)
                  )}
                </div>
              </div>

              {!esAdmin && (equipo.administradores?.length ?? 0) < MAX_ADMINS && (
                <div className="flex flex-col items-end gap-2">
                  {solicitudEnviada ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      <span className="text-xs font-semibold text-green-700">Solicitud enviada</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowAdminRequest(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all text-xs"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Datos desactualizados
                      </button>

                      {showAdminRequest && (
                        <div className="w-full sm:w-72 p-4 bg-white border border-slate-200 rounded-xl shadow-lg text-sm text-slate-600 space-y-3">
                          <p>Si sos responsable de este equipo, podés solicitar administración para mantener el perfil actualizado.</p>
                          {user ? (
                            <button
                              onClick={handleRequestAdmin}
                              disabled={actionLoading}
                              className="w-full py-2 bg-brand-600 text-white rounded-lg font-semibold text-xs hover:bg-brand-700 transition-all disabled:opacity-50"
                            >
                              {actionLoading ? 'Enviando...' : 'Solicitar administración'}
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/register?redirect=/equipos/${id}`)}
                              className="w-full py-2 bg-brand-600 text-white rounded-lg font-semibold text-xs hover:bg-brand-700 transition-all"
                            >
                              Registrate para solicitarlo
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mb-8">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">{equipo.nombre}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg text-slate-500 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  {equipo.ciudad || 'Sede no especificada'}
                </span>
                {equipo.pais && (
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                    {equipo.pais}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900">{equipo.participaciontemporadas?.length || 0}</div>
                <div className="text-sm text-slate-500">Comp. Jugadas</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900">{equipo.competenciasGanadas || 0}</div>
                <div className="text-sm text-slate-500">Comp. Ganadas</div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center">
                <div className="text-2xl font-bold text-slate-900">{equipo.equipopartido?.length || 0}</div>
                <div className="text-sm text-slate-500">Partidos Registrados</div>
              </div>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="h-8 w-1 bg-brand-600 rounded-full"></span>
                  Competencias
                </h2>
                {(equipo.participaciontemporadas?.length || 0) === 0 ? (
                  <div className="bg-white rounded-xl p-6 border border-slate-200">
                    <p className="text-slate-500 italic">Este equipo aún no participa en ninguna competencia registrada.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {competenciasAgrupadas.map(({ cid, comp, temporadas }) => {
                      const organizacion = comp?.organizacion;

                      return (
                        <div key={cid || 'sin-competencia'} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-brand-200 transition-colors">
                          <div className="flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate">
                                {comp ? (
                                  <Link to={`/competencias/${cid}`} className="hover:text-brand-600 hover:underline">
                                    {comp.nombre}
                                  </Link>
                                ) : (
                                  <span>Competencia</span>
                                )}
                              </div>
                              {organizacion?.nombre && (
                                <Link
                                  to={`/organizaciones/${organizacion._id || organizacion.id}`}
                                  className="text-xs text-slate-500 hover:text-brand-600 hover:underline"
                                >
                                  {organizacion.nombre}
                                </Link>
                              )}
                            </div>
                            <span className="flex-shrink-0 text-xs text-slate-400">
                              {temporadas.length} temporada{temporadas.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {temporadas.map((p: any) => {
                              const gano = p?.temporada?.ganador && String(p.temporada.ganador) === String(equipoId);
                              return (
                                <span
                                  key={p._id}
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700"
                                >
                                  {p.temporada?.nombre}
                                  {gano && <span title="Campeón de esta temporada">🏆</span>}
                                  <span className="text-slate-400 capitalize">· {p.estado || 'activo'}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="h-8 w-1 bg-indigo-600 rounded-full"></span>
                    Plantel
                  </h2>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab('actual')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'actual' 
                          ? 'bg-white text-indigo-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Actual
                    </button>
                    <button
                      onClick={() => setActiveTab('historial')}
                      className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                        activeTab === 'historial' 
                          ? 'bg-white text-indigo-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      Historial
                    </button>
                  </div>
                </div>

                {activeTab === 'actual' ? (
                  jugadoresActivos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {jugadoresActivos.map((je: any) => (
                        <Link
                          key={je.id || je._id}
                          to={`/jugadores/${je.jugador?._id || je.jugador?.id}`}
                          className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-200 transition-colors"
                        >
                          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                            {je.jugador?.foto ? (
                              <img src={je.jugador.foto} alt={je.jugador.nombre} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xl font-bold text-slate-300">{je.jugador?.nombre?.charAt(0) || '?'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 truncate">{je.jugador?.nombre}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-2">
                              {je.numeroCamiseta && (
                                <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">#{je.numeroCamiseta}</span>
                              )}
                              <span className="capitalize">{je.rol || 'Jugador'}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-2xl p-12 border border-slate-100 text-center">
                      <div className="mx-auto h-12 w-12 text-slate-300 mb-4 text-center flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.998 5.998 0 00-12 0m12 0c0-1.657-1.343-3-3-3m-3 3c0-1.657-1.343-3-3-3m-3 3c0-1.657-1.343-3-3-3m-3 3a5.998 5.998 0 0112 0" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">Sin jugadores activos</h3>
                      <p className="text-sm text-slate-500 mt-2">No se encontraron jugadores con contrato vigente en este equipo.</p>
                    </div>
                  )
                ) : (
                  jugadoresHistorial.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {jugadoresHistorial.map((je: any) => (
                        <Link
                          key={je.id || je._id}
                          to={`/jugadores/${je.jugador?._id || je.jugador?.id}`}
                          className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm opacity-75 hover:opacity-100 transition-opacity"
                        >
                          <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden grayscale">
                            {je.jugador?.foto ? (
                              <img src={je.jugador.foto} alt={je.jugador.nombre} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xl font-bold text-slate-300">{je.jugador?.nombre?.charAt(0) || '?'}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 truncate">{je.jugador?.nombre}</div>
                            <div className="text-xs text-slate-500">
                              {je.hasta ? `Hasta: ${new Date(je.hasta).toLocaleDateString()}` : 'Contrato finalizado'}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-2xl p-12 border border-slate-100 text-center">
                      <p className="text-slate-500">No hay historial de antiguos jugadores disponible.</p>
                    </div>
                  )
                )}
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipoDetalle;
