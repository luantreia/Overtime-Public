import React from 'react';
import type { CabezonesHudState } from '../engine/types';

interface CabezonesHudProps {
  hud: CabezonesHudState;
}

const Hearts: React.FC<{ count: number }> = ({ count }) => (
  <span>{'❤️'.repeat(Math.max(0, count)) || '—'}</span>
);

const CabezonesHud: React.FC<CabezonesHudProps> = ({ hud }) => (
  <div className="mx-auto flex max-w-[420px] items-center justify-between rounded-lg bg-slate-900 px-4 py-2 text-white text-sm font-semibold mb-3">
    <div className="flex items-center gap-2">
      <span className="text-blue-400">Vos</span>
      <Hearts count={hud.livesLeft} />
    </div>
    <div className="flex items-center gap-2">
      <Hearts count={hud.livesRight} />
      <span className="text-red-400">IA</span>
    </div>
  </div>
);

export default CabezonesHud;
