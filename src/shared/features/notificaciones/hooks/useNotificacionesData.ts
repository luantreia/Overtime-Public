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
  entityType,
}: UseNotificacionesDataProps = {}): UseNotificacionesDataResult => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solicitudes, setSolicitudes] = useState<SolicitudEdicion[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        filteredSolicitudes = filteredSolicitudes.filter(s => 
          allowedTipos.includes(s.tipo as SolicitudEdicionTipo)
        );
      }
      
      setSolicitudes(filteredSolicitudes);
    } catch (err: any) {
      setError(err.message || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, [scope, allowedTipos, entityType, refreshTrigger]);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const aprobar = useCallback(async (solicitud: SolicitudEdicion) => {
    try {
      await aprobarSolicitud(solicitud._id);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      throw new Error(`Error al aprobar: ${err.message}`);
    }
  }, []);

  const rechazar = useCallback(async (solicitud: SolicitudEdicion) => {
    try {
      await rechazarSolicitud(solicitud._id);
      setRefreshTrigger(prev => prev + 1);
    } catch (err: any) {
      throw new Error(`Error al rechazar: ${err.message}`);
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return {
    loading,
    error,
    solicitudes,
    aprobar,
    rechazar,
    refresh,
  };
};
