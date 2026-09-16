import React from 'react';
import { VIDAS_INICIALES } from '../engine/constants';
import type { ArrancadaHudState } from '../engine/types';

interface LaArrancadaHudProps {
  hud: ArrancadaHudState;
}

const LaArrancadaHud: React.FC<LaArrancadaHudProps> = ({ hud }) => (
  <div className="mx-auto mb-3 max-w-[380px] space-y-1.5">
    <div className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
      <div>
        Score: <span className="text-lg">{hud.score}</span>
      </div>
      <div className={hud.segundosRestantes <= 10 ? 'text-red-400' : 'text-slate-300'}>⏱ {hud.segundosRestantes}s</div>
      <div aria-label={`${hud.vidas} vidas`}>
        {'❤️'.repeat(hud.vidas)}
        <span className="opacity-30">{'🖤'.repeat(Math.max(0, VIDAS_INICIALES - hud.vidas))}</span>
      </div>
    </div>
    <div
      className={`rounded-lg px-4 py-1.5 text-center text-xs font-bold ${
        hud.llevaPelota ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
      }`}
    >
      {hud.llevaPelota ? '🟡 Pelota sin activar — volvé y cruzá tu línea' : `Activadas: ${hud.activadas}`}
    </div>
  </div>
);

export default LaArrancadaHud;
