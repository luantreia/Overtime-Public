import React from 'react';
import { VIDAS_INICIALES } from '../engine/constants';
import type { ManosHudState } from '../engine/types';

interface ManosDeGuanteHudProps {
  hud: ManosHudState;
}

const ManosDeGuanteHud: React.FC<ManosDeGuanteHudProps> = ({ hud }) => (
  <div className="mx-auto mb-3 flex max-w-[380px] items-center justify-between rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
    <div>
      Score: <span className="text-lg">{hud.score}</span>
    </div>
    <div className="text-emerald-300" title="Compañeros que volvieron a la cancha">
      🙌 {hud.companeros}
    </div>
    <div aria-label={`${hud.vidas} vidas`}>
      {'❤️'.repeat(hud.vidas)}
      <span className="opacity-30">{'🖤'.repeat(Math.max(0, VIDAS_INICIALES - hud.vidas))}</span>
    </div>
  </div>
);

export default ManosDeGuanteHud;
