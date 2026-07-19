import React from 'react';
import type { Clausula } from '../types';

interface ClausulaItemProps {
  clausula: Clausula;
  profundidad?: number;
}

const ClausulaItem: React.FC<ClausulaItemProps> = ({ clausula, profundidad = 0 }) => (
  <div className={profundidad > 0 ? 'mt-2 border-l-2 border-slate-100 pl-4' : 'mt-3'}>
    <p className="text-sm leading-relaxed text-slate-700">
      {clausula.numero && <span className="mr-2 font-semibold text-slate-500">{clausula.numero}</span>}
      {clausula.texto}
    </p>
    {clausula.hijos && clausula.hijos.length > 0 && (
      <div>
        {clausula.hijos.map((hijo, i) => (
          <ClausulaItem key={`${hijo.numero}-${i}`} clausula={hijo} profundidad={profundidad + 1} />
        ))}
      </div>
    )}
  </div>
);

export default ClausulaItem;
