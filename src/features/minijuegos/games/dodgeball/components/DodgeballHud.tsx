import React from 'react';
import { POWERUP_GLYPHS } from '../engine/constants';
import type { HudState } from '../engine/types';

const POWERUP_LABELS: Record<string, string> = {
  speed: 'Velocidad',
  power: 'Tiro potente',
  shield: 'Escudo',
  multiball: 'Multi-pelota',
};

interface GameHudProps {
  hud: HudState;
}

const DodgeballHud: React.FC<GameHudProps> = ({ hud }) => {
  const minutes = Math.floor(hud.timeRemaining / 60);
  const seconds = hud.timeRemaining % 60;

  return (
    <div className="mx-auto flex max-w-[800px] items-center justify-between rounded-lg bg-slate-900 px-4 py-2 text-white text-sm font-semibold mb-3">
      <div className="flex items-center gap-2">
        <span className="text-blue-400">Vos</span>
        <span className="text-lg">{hud.eliminationsPlayerTeam}</span>
        <span className="text-slate-500">–</span>
        <span className="text-lg">{hud.eliminationsAiTeam}</span>
        <span className="text-red-400">IA</span>
      </div>
      <div className="tabular-nums">{minutes}:{seconds.toString().padStart(2, '0')}</div>
      <div className="min-w-[120px] text-right text-xs text-amber-300">
        {hud.activePowerUp && (
          <span>{POWERUP_GLYPHS[hud.activePowerUp as keyof typeof POWERUP_GLYPHS]} {POWERUP_LABELS[hud.activePowerUp]}</span>
        )}
      </div>
    </div>
  );
};

export default DodgeballHud;
