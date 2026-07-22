import React from 'react';

export type RankingScope =
  | { tipo: 'global'; categoria: string; modalidad: string }
  | { tipo: 'competencia'; competenciaNombre: string; organizacionNombre?: string; modalidad: string }
  | { tipo: 'competencia-temporada'; competenciaNombre: string; temporadaNombre: string; organizacionNombre?: string; modalidad: string };

const tituloRanking = (scope: RankingScope): string => {
  if (scope.tipo === 'global') return 'Ranking Global';
  if (scope.tipo === 'competencia') return scope.competenciaNombre;
  return `${scope.competenciaNombre} · ${scope.temporadaNombre}`;
};

const organizacionNombre = (scope: RankingScope): string | undefined =>
  scope.tipo === 'global' ? undefined : scope.organizacionNombre;

interface RankingCardHeaderProps {
  scope: RankingScope;
}

const RankingCardHeader: React.FC<RankingCardHeaderProps> = ({ scope }) => {
  const hoy = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const org = organizacionNombre(scope);

  return (
    <div className="text-center">
      <div className="text-[11px] font-black uppercase tracking-[0.25em] opacity-70">LoD</div>
      <div className="text-lg font-bold uppercase tracking-wide mt-0.5">{tituloRanking(scope)}</div>
      {org && <div className="text-xs font-semibold opacity-80 mt-0.5">{org}</div>}
      <div className="text-[10px] uppercase tracking-widest opacity-60 mt-1">
        {scope.tipo === 'global' ? `${scope.categoria} · ` : ''}{scope.modalidad} · {hoy}
      </div>
    </div>
  );
};

export default RankingCardHeader;
