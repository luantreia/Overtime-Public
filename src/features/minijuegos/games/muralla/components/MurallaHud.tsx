import React from 'react';
import { VIDAS_INICIALES } from '../engine/constants';
import type { MurallaHudState } from '../engine/types';

interface MurallaHudProps {
  hud: MurallaHudState;
}

const MurallaHud: React.FC<MurallaHudProps> = ({ hud }) => {
  const noBlocking = hud.fase === 'no-blocking';
  return (
    <div className="mx-auto mb-3 max-w-[380px] space-y-1.5">
      <div className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
        <div>
          Score: <span className="text-lg">{hud.score}</span>
        </div>
        <div className="text-emerald-300" title="Bloqueos completados">
          🛡️ {hud.bloqueos}
        </div>
        <div aria-label={`${hud.vidas} vidas`}>
          {'❤️'.repeat(hud.vidas)}
          <span className="opacity-30">{'🖤'.repeat(Math.max(0, VIDAS_INICIALES - hud.vidas))}</span>
        </div>
      </div>
      <div
        className={`rounded-lg px-4 py-1.5 text-center text-xs font-bold uppercase tracking-wide ${
          noBlocking ? 'bg-orange-100 text-orange-800' : 'bg-emerald-100 text-emerald-800'
        }`}
      >
        {noBlocking ? 'No-Blocking · solo esquivar' : 'Bloqueo habilitado'}
      </div>
    </div>
  );
};

export default MurallaHud;
