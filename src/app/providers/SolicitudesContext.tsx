import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
    SolicitudEdicion, 
    SolicitudOpciones, 
    SolicitudContexto, 
    SolicitudCrearPayload 
} from '../../types/solicitudesEdicion';
import { getSolicitudOpciones, crearSolicitudEdicion } from '../../features/solicitudes/services/solicitudesEdicionService';

interface SolicitudesContextType {
  solicitudActual: { opciones: SolicitudOpciones[] };
  cargarOpciones: (contexto: SolicitudContexto) => Promise<void>;
  crearSolicitud: (payload: SolicitudCrearPayload) => Promise<void>;
  creandoSolicitud: boolean;
  error: string | null;
  limpiarError: () => void;
  pendientesCount: number;
  cargarSolicitudes: () => Promise<void>;
}

const SolicitudesContext = createContext<SolicitudesContextType | undefined>(undefined);

export const SolicitudesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [solicitudActual, setSolicitudActual] = useState<{ opciones: SolicitudOpciones[] }>({ opciones: [] });
  const [creandoSolicitud, setCreandoSolicitud] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendientesCount, setPendientesCount] = useState(0);

  const limpiarError = useCallback(() => setError(null), []);

  const cargarOpciones = useCallback(async (contexto: SolicitudContexto) => {
    try {
      limpiarError();
      const res = await getSolicitudOpciones(contexto);
      setSolicitudActual({ opciones: res.tiposDisponibles });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar opciones');
    }
  }, [limpiarError]);

  const crearSolicitud = useCallback(async (payload: SolicitudCrearPayload) => {
    try {
      setCreandoSolicitud(true);
      limpiarError();
      await crearSolicitudEdicion(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear solicitud');
      throw err;
    } finally {
      setCreandoSolicitud(false);
    }
  }, [limpiarError]);

  const cargarSolicitudes = useCallback(async () => {
    // Dummy implementation
    setPendientesCount(0);
  }, []);

  const value: SolicitudesContextType = {
    solicitudActual,
    cargarOpciones,
    crearSolicitud,
    creandoSolicitud,
    error,
    limpiarError,
    pendientesCount,
    cargarSolicitudes,
  };

  return <SolicitudesContext.Provider value={value}>{children}</SolicitudesContext.Provider>;
};

export const useSolicitudes = () => {
  const context = useContext(SolicitudesContext);
  if (!context) {
    throw new Error('useSolicitudes must be used within a SolicitudesProvider');
  }
  return context;
};