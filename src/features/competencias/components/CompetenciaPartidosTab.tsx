import React from 'react';
import { type Temporada } from '../services/temporadaService';
import { type Fase } from '../services/faseService';
import { type Partido } from '../../partidos/services/partidoService';
import PartidoCard from '../../../shared/components/PartidoCard/PartidoCard';

interface CompetenciaPartidosTabProps {
  temporadas: Temporada[];
  selectedTemporada: string;
  onTemporadaChange: (id: string) => void;
  fases: Fase[];
  selectedFase: string;
  onFaseChange: (id: string) => void;
  loading: boolean;
  partidos: Partido[];
  onPartidoClick: (id: string) => void;
}

export const CompetenciaPartidosTab: React.FC<CompetenciaPartidosTabProps> = ({
  temporadas,
  selectedTemporada,
  onTemporadaChange,
  fases,
  selectedFase,
  onFaseChange,
  loading,
  partidos,
  onPartidoClick,
}) => {
  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-1/3">
          <label htmlFor="temporada-partidos" className="block text-sm font-medium text-slate-700 mb-1">Temporada</label>
          <select
            id="temporada-partidos"
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
          <label htmlFor="fase-partidos" className="block text-sm font-medium text-slate-700 mb-1">Fase</label>
          <select
            id="fase-partidos"
            value={selectedFase}
            onChange={(e) => onFaseChange(e.target.value)}
            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-2 border"
            disabled={!selectedTemporada || fases.length === 0}
          >
            <option value="">Todas las fases</option>
            {fases.map((f) => (
              <option key={f._id} value={f._id}>{f.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-slate-500">Cargando partidos...</p>
        </div>
      ) : !selectedFase && !selectedTemporada ? (
        <div className="p-12 text-center text-slate-500">
          Selecciona una temporada para ver los partidos.
        </div>
      ) : partidos.length === 0 ? (
        <div className="p-12 text-center text-slate-500">
          No hay partidos registrados.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {partidos.map((partido) => (
            <PartidoCard 
              key={partido.id} 
              partido={partido} 
              onClick={() => onPartidoClick(partido.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
