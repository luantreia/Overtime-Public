import React from 'react';
import type { PunteriaHudState } from '../engine/types';

interface PunteriaHudProps {
  hud: PunteriaHudState;
}

const PunteriaHud: React.FC<PunteriaHudProps> = ({ hud }) => (
  <div className="mx-auto flex max-w-2xl items-center justify-between rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white mb-3">
    <div className="flex items-center gap-2">
      <span className="text-amber-400">⏱</span>
      <span className={hud.timeLeft <= 5 ? 'text-rose-400' : 'text-white'}>{hud.timeLeft}s</span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-brand-400">🎯</span>
      <span>{hud.score}</span>
    </div>
  </div>
);

export default PunteriaHud;
