import React from 'react';
import { CAPACIDAD } from '../engine/constants';
import type { JuntaHudState } from '../engine/types';

interface JuntaPelotasHudProps {
  hud: JuntaHudState;
}

const JuntaPelotasHud: React.FC<JuntaPelotasHudProps> = ({ hud }) => (
  <div className="mx-auto mb-3 flex max-w-[380px] items-center justify-between rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
    <div>
      Score: <span className="text-lg">{hud.score}</span>
    </div>
    <div className="text-sky-300" title="Pelotas devueltas a la cancha">
      🏐 {hud.entregadas}
    </div>
    <div className={hud.carga >= CAPACIDAD ? 'text-amber-300' : 'text-slate-300'}>
      Carga {hud.carga}/{CAPACIDAD}
    </div>
  </div>
);

export default JuntaPelotasHud;
