import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';
import { GameCanvas, GameHud, StartScreen, GameOverScreen, type GameControls } from '../components';
import type { HudState } from '../game/types';

const INITIAL_HUD: HudState = {
  status: 'ready',
  eliminationsPlayerTeam: 0,
  eliminationsAiTeam: 0,
  timeRemaining: 90,
  activePowerUp: null,
};

const DodgeballGame: React.FC = () => {
  usePageTitle('Dodgeball 2D');
  const controlsRef = useRef<GameControls | null>(null);
  const [hud, setHud] = useState<HudState>(INITIAL_HUD);

  const handleHudChange = useCallback((next: HudState) => {
    setHud(next);
  }, []);

  const handleStart = () => {
    controlsRef.current?.start();
  };

  return (
    <div className="py-4">
      <Link to="/minijuegos" className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-700">
        ← Minijuegos
      </Link>

      <div className="relative">
        <GameHud hud={hud} />
        <GameCanvas onHudChange={handleHudChange} controlsRef={controlsRef} />

        <StartScreen isOpen={hud.status === 'ready'} onStart={handleStart} />
        <GameOverScreen isOpen={hud.status === 'gameover'} hud={hud} onRestart={handleStart} />
      </div>
    </div>
  );
};

export default DodgeballGame;
