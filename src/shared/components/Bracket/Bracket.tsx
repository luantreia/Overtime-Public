import React from 'react';
import { Partido } from '../../../features/partidos/services/partidoService';

interface BracketProps {
  matches: Partido[];
}

const STAGE_ORDER = ['octavos', 'cuartos', 'semifinal', 'final'];
const STAGE_LABELS: Record<string, string> = {
  octavos: 'Octavos de Final',
  cuartos: 'Cuartos de Final',
  semifinal: 'Semifinales',
  final: 'Final',
};

export const Bracket: React.FC<BracketProps> = ({ matches }) => {
  // Group matches by stage
  const matchesByStage = matches.reduce((acc, match) => {
    const stage = match.etapa || 'otro';
    if (!acc[stage]) acc[stage] = [];
    acc[stage].push(match);
    return acc;
  }, {} as Record<string, Partido[]>);

  // Filter only valid bracket stages and sort them
  const activeStages = STAGE_ORDER.filter(stage => matchesByStage[stage] && matchesByStage[stage].length > 0);

  if (activeStages.length === 0) {
    return (
      <div className="text-center p-8 text-slate-500">
        No hay partidos de playoff configurados con etapas estándar (Octavos, Cuartos, Semifinal, Final).
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-8">
      <div className="flex min-w-max space-x-12 px-4">
        {activeStages.map((stage, index) => (
          <div key={stage} className="flex flex-col min-w-[280px]">
            <h3 className="text-center font-bold text-slate-700 mb-6 bg-slate-100 py-2 rounded-lg border border-slate-200 shadow-sm">
              {STAGE_LABELS[stage]}
            </h3>
            <div className="flex flex-col justify-around flex-grow space-y-8">
              {matchesByStage[stage].map((match) => (
                <div key={match.id} className="relative bg-white border border-slate-200 rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
                  <div className="text-xs text-slate-400 mb-2 text-center">
                    {match.fecha ? new Date(match.fecha).toLocaleDateString() : 'Fecha por definir'}
                  </div>
                  
                  {/* Local Team */}
                  <div className={`flex justify-between items-center p-2 rounded ${match.marcadorLocal > match.marcadorVisitante ? 'bg-green-50 font-bold' : ''}`}>
                    <span className="truncate mr-2 text-sm">{match.equipoLocal?.nombre || 'Local'}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">{match.marcadorLocal ?? '-'}</span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 my-1"></div>

                  {/* Visitor Team */}
                  <div className={`flex justify-between items-center p-2 rounded ${match.marcadorVisitante > match.marcadorLocal ? 'bg-green-50 font-bold' : ''}`}>
                    <span className="truncate mr-2 text-sm">{match.equipoVisitante?.nombre || 'Visitante'}</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-sm font-mono">{match.marcadorVisitante ?? '-'}</span>
                  </div>

                  {/* Connector lines (visual only, simplified) */}
                  {index < activeStages.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 w-6 h-0.5 bg-slate-300 z-[-1]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
