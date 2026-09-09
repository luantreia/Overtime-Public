import React from 'react';
import { Partido } from '../../../features/partidos/services/partidoService';
import { formatDate } from '../../utils/formatDate';
import { derivarRondas, extraerTercerPuesto } from './derivarRondas';

interface BracketProps {
  matches: Partido[];
}

/** Una línea de equipo dentro de un cruce: nombre + marcador, resaltada si ganó. */
const LineaEquipo: React.FC<{ nombre: string; marcador: number | undefined; gano: boolean }> = ({ nombre, marcador, gano }) => (
  <div className={`flex items-center justify-between gap-2 px-2.5 py-1.5 text-[12px] ${gano ? 'bg-emerald-50 font-bold text-slate-900' : 'text-slate-600'}`}>
    <span className="truncate">{nombre}</span>
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[11.5px] font-extrabold [font-variant-numeric:tabular-nums] ${
        gano ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {marcador ?? '–'}
    </span>
  </div>
);

/** Tarjeta de un cruce: dos líneas de equipo, el ganador resaltado. */
const TarjetaCruce: React.FC<{ match: Partido }> = ({ match }) => {
  const localGana = match.estado === 'finalizado' && (match.marcadorLocal ?? 0) > (match.marcadorVisitante ?? 0);
  const visitaGana = match.estado === 'finalizado' && (match.marcadorVisitante ?? 0) > (match.marcadorLocal ?? 0);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        <LineaEquipo nombre={match.equipoLocal?.nombre || 'Local'} marcador={match.marcadorLocal} gano={localGana} />
        <LineaEquipo nombre={match.equipoVisitante?.nombre || 'Visitante'} marcador={match.marcadorVisitante} gano={visitaGana} />
      </div>
      <div className="border-t border-slate-100 bg-slate-50/60 px-2.5 py-1 text-center text-[10px] text-slate-400">
        {match.fecha ? formatDate(match.fecha) : 'Fecha por definir'}
      </div>
    </div>
  );
};

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
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-max gap-6">
        {rondas.map((ronda) => (
          <div key={ronda.etapa} className="flex min-w-[176px] flex-1 flex-col">
            <h3 className="mb-3 rounded-md bg-slate-100 py-1.5 text-center text-[9.5px] font-extrabold uppercase tracking-wide text-slate-500">
              {ronda.label}
            </h3>
            <div className="flex flex-1 flex-col justify-around gap-3">
              {ronda.partidos.map((match) => (
                <TarjetaCruce key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}

        {/* El tercer puesto va aparte: es un partido en paralelo a la final, no la ronda que
            sigue después. Antes esta pantalla no lo mostraba en absoluto. */}
        {tercerPuesto && (
          <div className="flex min-w-[176px] flex-1 flex-col">
            <h3 className="mb-3 rounded-md bg-amber-100 py-1.5 text-center text-[9.5px] font-extrabold uppercase tracking-wide text-amber-700">
              3er Puesto
            </h3>
            <div className="flex flex-1 flex-col justify-around gap-3">
              <TarjetaCruce match={tercerPuesto} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
