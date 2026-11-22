import { useState, useCallback, useEffect, type FC, type ReactNode } from 'react';
import { Overlay } from 'overtime-kit';
import { renderEstadisticasGenerales } from './EstadisticasGenerales';
import { renderEstadisticasEquipos } from './EstadisticasEquipos';
import { renderEstadisticasJugadores } from './EstadisticasJugadores';
import {
  getResumenEstadisticasAutomaticas,
  getResumenEstadisticasManual,
} from './estadisticasService';
import type {

  EstadisticaManualEquipo,
  EstadisticaManualJugador,
  EstadisticaSetResumen,
  ResumenEstadisticasAutomaticas,
  ResumenEstadisticasManual,
  ModoEstadisticas,
  EstadisticasGeneralesData,
  EstadisticasEquiposData,
  EstadisticasJugadoresData,
} from './types';

type VistaEstadisticas = 'general' | 'equipos' | 'jugadores';

interface EstadisticasPartidoModalProps {
  isOpen: boolean;
  onClose: () => void;
  partidoId: string;
  partido?: {
    _id: string;
    modoEstadisticas?: ModoEstadisticas;
    modoVisualizacion?: ModoEstadisticas;
  };
}

interface EstadisticasData {
  jugadores: (EstadisticaManualJugador & { fuente?: string; setInfo?: Pick<EstadisticaSetResumen, 'numeroSet' | 'estadoSet' | 'ganadorSet'> })[];
  equipos: EstadisticaManualEquipo[];
  setsInfo?: EstadisticaSetResumen[];
  mensaje?: string;
  tipo?: string;
}

export const EstadisticasPartidoModal: FC<EstadisticasPartidoModalProps> = ({
  isOpen,
  onClose,
  partidoId,
  partido,
}) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData>({ jugadores: [], equipos: [] });
  const [loading, setLoading] = useState<boolean>(true);
  /**
   * Que la carga haya fallado NO es lo mismo que que el partido no tenga estadísticas, y antes
   * se veían igual: el `catch` sólo hacía `console.error` y la pantalla terminaba mostrando
   * "sin datos". Con las llamadas rotas, eso hizo que el bug pasara años como si fuera un
   * partido sin cargar.
   */
  const [error, setError] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaEstadisticas>('general');
  const [modoEstadisticasUI, setModoEstadisticasUI] = useState<ModoEstadisticas>(
    partido?.modoEstadisticas ?? 'automatico',
  );

  const cargarEstadisticas = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      let data: EstadisticasData = { jugadores: [], equipos: [] };

      if (modoEstadisticasUI === 'automatico') {
        const dataSets: ResumenEstadisticasAutomaticas = await getResumenEstadisticasAutomaticas(partidoId);
        data = {
          jugadores: (dataSets.sets ?? []).flatMap(set =>
            (set.estadisticas ?? []).map(stat => ({
              ...stat,
              fuente: 'automatica',
              setInfo: { numeroSet: set.numeroSet, estadoSet: set.estadoSet, ganadorSet: set.ganadorSet },
            }))
          ),
          equipos: [], // Calcular agregados si es necesario
          setsInfo: dataSets.sets,
        };
      } else {
        const dataManual: ResumenEstadisticasManual = await getResumenEstadisticasManual(partidoId);
        data = {
          jugadores: (dataManual.jugadores ?? []).map(j => ({ ...j, fuente: 'manual' })),
          equipos: dataManual.equipos ?? [],
          mensaje: dataManual.mensaje,
          tipo: dataManual.tipo,
        };
      }

      setEstadisticas(data);
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
      setEstadisticas({ jugadores: [], equipos: [] });
      setError('No pudimos cargar las estadísticas de este partido. Probá de nuevo en un rato.');
    } finally {
      setLoading(false);
    }
  }, [modoEstadisticasUI, partidoId]);

  useEffect(() => {
    if (isOpen) {
      void cargarEstadisticas();
    }
  }, [isOpen, cargarEstadisticas]);

  const renderVistaActual = (): ReactNode => {
    if (loading) {
      return <div className="text-center py-8">Cargando estadísticas...</div>;
    }

    if (error) {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-900">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => void cargarEstadisticas()}
            className="mt-3 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100"
          >
            Reintentar
          </button>
        </div>
      );
    }

    switch (vista) {
      case 'general':
        return renderEstadisticasGenerales(estadisticas as EstadisticasGeneralesData, partido, modoEstadisticasUI);
      case 'equipos':
        return renderEstadisticasEquipos(estadisticas as EstadisticasEquiposData, partido);
      case 'jugadores':
        return renderEstadisticasJugadores(estadisticas as EstadisticasJugadoresData, partido);
      default:
        return null;
    }
  };

  return (
    <Overlay
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      title="Estadísticas del Partido"
      bodyScroll={false}
    >
      {/* Controles */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setVista('general')}
            className={`px-4 py-2 rounded ${vista === 'general' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            General
          </button>
          <button
            onClick={() => setVista('equipos')}
            className={`px-4 py-2 rounded ${vista === 'equipos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Por Equipos
          </button>
          <button
            onClick={() => setVista('jugadores')}
            className={`px-4 py-2 rounded ${vista === 'jugadores' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Por Jugadores
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="modo"
              checked={modoEstadisticasUI === 'automatico'}
              onChange={() => setModoEstadisticasUI('automatico')}
              className="mr-2"
            />
            Automático
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="modo"
              checked={modoEstadisticasUI === 'manual'}
              onChange={() => setModoEstadisticasUI('manual')}
              className="mr-2"
            />
            Manual
          </label>
        </div>
      </div>

      {/* Contenido */}
      <div className="overflow-y-auto max-h-[60vh]">
        {renderVistaActual()}
      </div>
    </Overlay>
  );
};
