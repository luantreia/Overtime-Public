import React from 'react';
import { type Temporada } from '../services/temporadaService';
import { type Fase } from '../services/faseService';
import { type Partido } from '../../partidos/services/partidoService';
import { TablaPosiciones } from '../../../shared/components/TablaPosiciones/TablaPosiciones';
import { Bracket } from '../../../shared/components/Bracket/Bracket';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';

interface CompetenciaResultadosTabProps {
  temporadas: Temporada[];
  selectedTemporada: string;
  onTemporadaChange: (id: string) => void;
  fases: Fase[];
  selectedFase: string;
  onFaseChange: (id: string) => void;
  loading: boolean;
  faseDetails: Fase | null;
  fasePartidos: Partido[];
  onPartidoClick: (id: string) => void;
}

export const CompetenciaResultadosTab: React.FC<CompetenciaResultadosTabProps> = ({
  temporadas,
  selectedTemporada,
  onTemporadaChange,
  fases,
  selectedFase,
  onFaseChange,
  loading,
  faseDetails,
  fasePartidos,
  onPartidoClick,
}) => {
  return (
    <div className="p-6">
      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-1/3">
          <label htmlFor="temporada" className="block text-sm font-medium text-slate-700 mb-1">Temporada</label>
          <select
            id="temporada"
            value={selectedTemporada}
            onChange={(e) => onTemporadaChange(e.target.value)}
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
          >
            {temporadas.length === 0 && <option value="">No hay temporadas</option>}
            {temporadas.map((t) => (
              <option key={t._id} value={t._id}>{t.nombre}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-1/3">
          <label htmlFor="fase" className="block text-sm font-medium text-slate-700 mb-1">Fase</label>
          <select
            id="fase"
            value={selectedFase}
            onChange={(e) => onFaseChange(e.target.value)}
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
            disabled={!selectedTemporada || fases.length === 0}
          >
            {fases.length === 0 && <option value="">No hay fases</option>}
            {fases.map((f) => (
              <option key={f._id} value={f._id}>{f.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content based on Phase Type */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-slate-500">Cargando resultados...</p>
        </div>
      ) : !selectedFase ? (
        <div className="p-12 text-center text-slate-500">
          Selecciona una temporada y una fase para ver los resultados.
        </div>
      ) : (
        <div>
          {faseDetails?.tipo === 'grupo' || faseDetails?.tipo === 'liga' ? (
            <TablaPosiciones faseId={selectedFase} />
          ) : faseDetails?.tipo === 'playoff' ? (
            <Bracket matches={fasePartidos} />
          ) : (
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-4">Partidos de la Fase</h3>
              {fasePartidos.length === 0 ? (
                <p className="text-slate-500">No hay partidos registrados en esta fase.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {fasePartidos.map((partido) => (
                    <PartidoCard 
                      key={partido.id} 
                      partido={partido} 
                      onClick={() => onPartidoClick(partido.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
