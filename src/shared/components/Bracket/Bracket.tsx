import React, { useMemo } from 'react';
import { Partido } from '../../../features/partidos/services/partidoService';
import { formatDate } from '../../utils/formatDate';
import { derivarRondas, extraerTercerPuesto, construirEnlaces } from './derivarRondas';
import { useConectoresLlave } from './useConectoresLlave';

interface BracketProps {
  matches: Partido[];
}

/** `derivarRondas`/`construirEnlaces` necesitan el id de cada equipo en un campo plano
 * (`equipoLocalId`), no anidado (`equipoLocal.id`). Se arma acá, sin tocar el tipo real de Partido. */
type PartidoConIds = Partido & { equipoLocalId?: string; equipoVisitanteId?: string };
const conIds = (matches: Partido[]): PartidoConIds[] =>
  matches.map((m) => ({ ...m, equipoLocalId: m.equipoLocal?.id, equipoVisitanteId: m.equipoVisitante?.id }));

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
const TarjetaCruce = React.forwardRef<HTMLDivElement, { match: PartidoConIds }>(({ match }, ref) => {
  const localGana = match.estado === 'finalizado' && (match.marcadorLocal ?? 0) > (match.marcadorVisitante ?? 0);
  const visitaGana = match.estado === 'finalizado' && (match.marcadorVisitante ?? 0) > (match.marcadorLocal ?? 0);

  return (
    <div ref={ref} className="relative z-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        <LineaEquipo nombre={match.equipoLocal?.nombre || 'Local'} marcador={match.marcadorLocal} gano={localGana} />
        <LineaEquipo nombre={match.equipoVisitante?.nombre || 'Visitante'} marcador={match.marcadorVisitante} gano={visitaGana} />
      </div>
      <div className="border-t border-slate-100 bg-slate-50/60 px-2.5 py-1 text-center text-[10px] text-slate-400">
        {match.fecha ? formatDate(match.fecha) : 'Fecha por definir'}
      </div>
    </div>
  );
});

export const Bracket: React.FC<BracketProps> = ({ matches }) => {
  const matchesConIds = useMemo(() => conIds(matches), [matches]);
  const rondas = useMemo(() => derivarRondas(matchesConIds), [matchesConIds]);
  const tercerPuesto = extraerTercerPuesto(matchesConIds);
  // De qué partido de la ronda anterior salió cada equipo — lo que conecta la llave como árbol
  // en vez de columnas sueltas. Ver el comentario de `useConectoresLlave` sobre por qué esto se
  // MIDE después de pintar en vez de calcularse a mano.
  const enlaces = useMemo(() => construirEnlaces(rondas), [rondas]);
  const { containerRef, registrarTarjeta, conectores } = useConectoresLlave(enlaces);

  if (rondas.length === 0 && !tercerPuesto) {
    return (
      <div className="text-center p-8 text-slate-500">
        No hay partidos de playoff configurados con etapas estándar (Octavos, Cuartos, Semifinal, Final).
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-2">
      <div ref={containerRef} className="relative flex min-w-max gap-6">
        {/* Las líneas de la llave: un partido conectado con el que le dio cada uno de sus dos
            equipos. Sin esto son columnas sueltas; con esto se lee como un árbol que termina en
            la final. */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {conectores.map((c) => {
            const xMedio = c.x1 + (c.x2 - c.x1) / 2;
            return (
              <path
                key={c.id}
                d={`M ${c.x1} ${c.y1} C ${xMedio} ${c.y1}, ${xMedio} ${c.y2}, ${c.x2} ${c.y2}`}
                fill="none"
                stroke="#cbd5e1"
                strokeWidth={2}
              />
            );
          })}
        </svg>
        {rondas.map((ronda) => (
          <div key={ronda.etapa} className="flex min-w-[176px] flex-1 flex-col">
            <h3 className="mb-3 rounded-md bg-slate-100 py-1.5 text-center text-[9.5px] font-extrabold uppercase tracking-wide text-slate-500">
              {ronda.label}
            </h3>
            <div className="flex flex-1 flex-col justify-around gap-3">
              {ronda.partidos.map((match) => (
                <TarjetaCruce key={match.id} match={match} ref={registrarTarjeta(match.id)} />
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
