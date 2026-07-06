import React from 'react';
import type { NoTeQuemesHudState } from '../engine/types';

interface NoTeQuemesHudProps {
  hud: NoTeQuemesHudState;
}

const NoTeQuemesHud: React.FC<NoTeQuemesHudProps> = ({ hud }) => (
  <div className="mx-auto flex max-w-[380px] items-center justify-between rounded-lg bg-slate-900 px-4 py-2 text-white text-sm font-semibold mb-3">
    <div>Score: <span className="text-lg">{hud.score}</span></div>
    <div className="text-amber-300">Récord: {hud.highScore}</div>
  </div>
);

export default NoTeQuemesHud;
