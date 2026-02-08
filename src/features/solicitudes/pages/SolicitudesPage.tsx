import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getSolicitudesEdicion, cancelarSolicitudEdicion } from '../services/solicitudesEdicionService';
import { useToast } from '../../../shared/components/Toast/ToastProvider';
import { useAuth } from '../../../app/providers/AuthContext';
import type { 
  SolicitudEdicion, 
  SolicitudEdicionEstado,
  SolicitudEdicionTipo
} from '../../../shared/types/solicitudesEdicion';
import { ChevronDownIcon, CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

const estadoBadgeConfig: Record<SolicitudEdicionEstado, { bg: string; text: string; icon: React.ReactNode }> = {
  pendiente: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: <ClockIcon className="h-5 w-5" /> },
  aceptado: { bg: 'bg-green-50', text: 'text-green-700', icon: <CheckCircleIcon className="h-5 w-5" /> },
  rechazado: { bg: 'bg-red-50', text: 'text-red-700', icon: <XCircleIcon className="h-5 w-5" /> },
  cancelado: { bg: 'bg-gray-50', text: 'text-gray-700', icon: <XCircleIcon className="h-5 w-5" /> },
};

const tipoLabels: Partial<Record<SolicitudEdicionTipo, string>> = {
  'usuario-crear-jugador': 'Crear Jugador',
  'usuario-crear-equipo': 'Crear Equipo',
  'usuario-crear-organizacion': 'Crear Organización',
  'usuario-solicitar-admin-jugador': 'Solicitar Admin de Jugador',
  'usuario-solicitar-admin-equipo': 'Solicitar Admin de Equipo',
  'usuario-solicitar-admin-organizacion': 'Solicitar Admin de Organización',
  'jugador-claim': 'Reclamar Perfil de Jugador',
  'jugador-equipo-crear': 'Contrato Jugador-Equipo (crear)',
  'jugador-equipo-eliminar': 'Contrato Jugador-Equipo (eliminar)',
  'jugador-equipo-editar': 'Contrato Jugador-Equipo (editar)',
  'participacion-temporada-crear': 'Participación Temporada (crear)',
  'participacion-temporada-actualizar': 'Participación Temporada (actualizar)',
  'participacion-temporada-eliminar': 'Participación Temporada (eliminar)',
  'jugador-temporada-crear': 'Participación Jugador-Temporada (crear)',
  'jugador-temporada-actualizar': 'Participación Jugador-Temporada (actualizar)',
  'jugador-temporada-eliminar': 'Participación Jugador-Temporada (eliminar)',
  resultadoPartido: 'Resultado Partido',
  resultadoSet: 'Resultado Set',
  estadisticasJugadorSet: 'Estadísticas Jugador Set',
  estadisticasJugadorPartido: 'Estadísticas Jugador Partido',
  estadisticasEquipoPartido: 'Estadísticas Equipo Partido',
  estadisticasEquipoSet: 'Estadísticas Equipo Set',
};

const getLabelTipo = (tipo: SolicitudEdicionTipo): string => {
  return tipoLabels[tipo] ?? tipo;
};

const formatDate = (date: string | Date | undefined) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', { 
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function SolicitudesPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solicitudes, setSolicitudes] = useState<SolicitudEdicion[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Filtro de estado
  const [fEstado, setFEstado] = useState<SolicitudEdicionEstado | 'todos'>(
    (searchParams.get('estado') as SolicitudEdicionEstado) || 'todos'
  );

  const cargar = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        creadoPor: user.id,
      };

      if (fEstado !== 'todos') {
        params.estado = fEstado;
      }

      const data = await getSolicitudesEdicion(params);
      setSolicitudes(data.solicitudes.map(s => ({ ...s, id: s._id })));
    } catch (e: any) {
      setError(e?.message || 'Error al cargar solicitudes');
      addToast({
        title: 'Error',
        message: e?.message || 'Error al cargar solicitudes',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, fEstado, addToast]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  // Sync URL
  useEffect(() => {
    const sp = new URLSearchParams();
    if (fEstado !== 'todos') sp.set('estado', fEstado);
    setSearchParams(sp, { replace: true });
  }, [fEstado, setSearchParams]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) return;

    try {
      await cancelarSolicitudEdicion(id);
      addToast({
        title: 'Éxito',
        message: 'Solicitud cancelada correctamente',
        type: 'success',
      });
      cargar(); // Recargar lista
    } catch (e: any) {
      addToast({
        title: 'Error',
        message: e.message,
        type: 'error',
      });
    }
  };

  const estadoStats = {
    pendiente: solicitudes.filter(s => s.estado === 'pendiente').length,
    aceptado: solicitudes.filter(s => s.estado === 'aceptado').length,
    rechazado: solicitudes.filter(s => s.estado === 'rechazado').length,
  };

  const filtradas = fEstado === 'todos' 
    ? solicitudes 
    : solicitudes.filter(s => s.estado === fEstado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Solicitudes</h1>
        <p className="mt-2 text-gray-600">
          Visualiza el estado de todas tus solicitudes de edición
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg bg-yellow-50 p-4">
          <div className="flex items-center">
            <ClockIcon className="h-6 w-6 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">{estadoStats.pendiente}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Aceptadas</p>
              <p className="text-2xl font-bold text-green-900">{estadoStats.aceptado}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-6 w-6 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Rechazadas</p>
              <p className="text-2xl font-bold text-red-900">{estadoStats.rechazado}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        <select
          value={fEstado}
          onChange={(e) => setFEstado(e.target.value as any)}
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aceptado">Aceptado</option>
          <option value="rechazado">Rechazado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtradas.length === 0 && (
        <div className="rounded-lg border border-dashed border-gray-300 py-12 text-center">
          <p className="text-gray-600">
            {solicitudes.length === 0 
              ? 'No tienes solicitudes aún'
              : `No hay solicitudes ${fEstado !== 'todos' ? 'con este estado' : ''}`
            }
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && filtradas.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Fecha Creación
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtradas.map((solicitud) => {
                const isExpanded = expanded[solicitud._id];
                const config = estadoBadgeConfig[solicitud.estado];

                return (
                  <React.Fragment key={solicitud._id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {getLabelTipo(solicitud.tipo)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${config.bg}`}>
                          {config.icon}
                          <span className={`font-medium capitalize ${config.text}`}>
                            {solicitud.estado}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(solicitud.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleExpand(solicitud._id)}
                            className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-gray-700 hover:bg-gray-200"
                          >
                            <ChevronDownIcon 
                              className={`h-4 w-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            />
                            Detalles
                          </button>
                          {solicitud.estado === 'pendiente' && (
                            <button
                              onClick={() => handleCancel(solicitud._id)}
                              className="inline-flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-red-700 hover:bg-red-200"
                            >
                              <XCircleIcon className="h-4 w-4" />
                              Cancelar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="px-4 py-3">
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium uppercase text-gray-600">Datos Propuestos:</p>
                              <pre className="mt-1 max-h-64 overflow-auto rounded bg-white p-2 text-xs text-gray-700">
                                {JSON.stringify(solicitud.datosPropuestos, null, 2)}
                              </pre>
                            </div>
                            {solicitud.motivoRechazo && (
                              <div>
                                <p className="text-xs font-medium uppercase text-red-600">Motivo del Rechazo:</p>
                                <p className="mt-1 text-sm text-red-700">{solicitud.motivoRechazo}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
