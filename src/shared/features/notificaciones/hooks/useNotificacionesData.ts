import { useState, useEffect, useCallback } from 'react';
import type { SolicitudEdicion, SolicitudEdicionTipo } from '../../../../types/solicitudesEdicion';
import { getSolicitudesEdicion, actualizarSolicitudEdicion } from '../../../../features/solicitudes/services/solicitudesEdicionService';
import type { UseNotificacionesDataResult } from '../types/notificacionesTypes';
import type { Scope } from '../types/notificacionesTypes';

interface UseNotificacionesDataProps {
  scope?: Scope;
  allowedTipos?: readonly SolicitudEdicionTipo[];
  entityType?: string;
}

const aprobarSolicitud = async (id: string): Promise<SolicitudEdicion> => {
  return actualizarSolicitudEdicion(id, { estado: 'aceptado' });
};

const rechazarSolicitud = async (id: string): Promise<SolicitudEdicion> => {
  return actualizarSolicitudEdicion(id, { estado: 'rechazado' });
};

export const useNotificacionesData = ({
  scope = 'mine',
  allowedTipos,
}: UseNotificacionesDataProps = {}): UseNotificacionesDataResult => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solicitudes, setSolicitudes] = useState<SolicitudEdicion[]>([]);

  const fetchSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: Record<string, string> = {};

      if (scope === 'mine') {
        filters.creadoPor = 'me';
      }

      const response = await getSolicitudesEdicion(filters);
      let filteredSolicitudes = response.solicitudes;

      if (allowedTipos && allowedTipos.length > 0) {
        filteredSolicitudes = filteredSolicitudes.filter((s) =>
          allowedTipos.includes(s.tipo as SolicitudEdicionTipo)
        );
      }

      setSolicitudes(filteredSolicitudes);
    } catch (err: any) {
      setError(err.message || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, [scope, allowedTipos]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const aprobar = useCallback(async (solicitud: SolicitudEdicion) => {
    try {
      await aprobarSolicitud(solicitud._id);
      await fetchSolicitudes();
    } catch (err: any) {
      throw new Error(`Error al aprobar: ${err.message}`);
    }
  }, [fetchSolicitudes]);

  const rechazar = useCallback(async (solicitud: SolicitudEdicion) => {
    try {
      await rechazarSolicitud(solicitud._id);
      await fetchSolicitudes();
    } catch (err: any) {
      throw new Error(`Error al rechazar: ${err.message}`);
    }
  }, [fetchSolicitudes]);

  const refresh = useCallback(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  return {
    loading,
    error,
    solicitudes,
    aprobar,
    rechazar,
    refresh,
  };
};
