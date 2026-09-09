import React from 'react';
import { Partido } from '../../../features/partidos/services/partidoService';
import { formatDate } from '../../utils/formatDate';
import { derivarRondas, extraerTercerPuesto } from './derivarRondas';

interface BracketProps {
  matches: Partido[];
}

const TarjetaPartido: React.FC<{ match: Partido }> = ({ match }) => (
  <div className="relative bg-white border border-slate-200 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
    <div className="text-xs text-slate-400 mb-2 text-center">
      {match.fecha ? formatDate(match.fecha) : 'Fecha por definir'}
    </div>

    <div className={`flex justify-between items-center p-2 rounded ${(match.marcadorLocal ?? 0) > (match.marcadorVisitante ?? 0) ? 'bg-green-50 font-bold' : ''}`}>
      <span className="truncate mr-2 text-sm">{match.equipoLocal?.nombre || 'Local'}</span>
      <span className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">{match.marcadorLocal ?? '-'}</span>
    </div>

    <div className="h-px bg-slate-100 my-1"></div>

    <div className={`flex justify-between items-center p-2 rounded ${(match.marcadorVisitante ?? 0) > (match.marcadorLocal ?? 0) ? 'bg-green-50 font-bold' : ''}`}>
      <span className="truncate mr-2 text-sm">{match.equipoVisitante?.nombre || 'Visitante'}</span>
      <span className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">{match.marcadorVisitante ?? '-'}</span>
    </div>
  </div>
);

export const Bracket: React.FC<BracketProps> = ({ matches }) => {
  const rondas = derivarRondas(matches);
  const tercerPuesto = extraerTercerPuesto(matches);

  if (rondas.length === 0 && !tercerPuesto) {
    return (
      <div className="text-center p-8 text-slate-500">
        No hay partidos de playoff configurados con etapas estándar (Octavos, Cuartos, Semifinal, Final).
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-8">
      <div className="flex min-w-max space-x-12 px-4">
        {rondas.map((ronda, index) => (
          <div key={ronda.etapa} className="flex flex-col min-w-[280px]">
            <h3 className="text-center font-bold text-slate-700 mb-6 bg-slate-100 py-2 rounded-lg border border-slate-200 shadow-sm">
              {ronda.label}
            </h3>
            <div className="flex flex-col justify-around flex-grow space-y-8">
              {ronda.partidos.map((match) => (
                <div key={match.id} className="relative">
                  <TarjetaPartido match={match} />
                  {/* Connector lines (visual only, simplified) */}
                  {index < rondas.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 w-6 h-0.5 bg-slate-300 z-[-1]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* El tercer puesto va aparte: es un partido en paralelo a la final, no la ronda que
            sigue después. Antes esta pantalla no lo mostraba en absoluto. */}
        {tercerPuesto && (
          <div className="flex flex-col min-w-[280px]">
            <h3 className="text-center font-bold text-amber-700 mb-6 bg-amber-50 py-2 rounded-lg border border-amber-200 shadow-sm">
              3er Puesto
            </h3>
            <div className="flex flex-col justify-around flex-grow space-y-8">
              <TarjetaPartido match={tercerPuesto} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
