import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../../../shared/hooks/usePageTitle';
import { StartScreen, GameOverScreen } from '../../../shared/components';
import { DodgeballCanvas, DodgeballHud, type GameControls } from '../components';
import type { HudState } from '../engine/types';

const INITIAL_HUD: HudState = {
  status: 'ready',
  eliminationsPlayerTeam: 0,
  eliminationsAiTeam: 0,
  timeRemaining: 90,
  activePowerUp: null,
};

const RESULT_LABEL: Record<string, string> = {
  player: '¡Ganaste! 🏆',
  ai: 'Perdiste',
  draw: 'Empate',
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
        <DodgeballHud hud={hud} />
        <DodgeballCanvas onHudChange={handleHudChange} controlsRef={controlsRef} />

        <StartScreen isOpen={hud.status === 'ready'} title="Dodgeball 2D" subtitle="Vos y dos compañeros IA contra un equipo rival" onStart={handleStart}>
          <ul className="space-y-1.5">
            <li><span className="font-semibold">WASD / Flechas</span> — moverte</li>
            <li><span className="font-semibold">Espacio</span> — tirar (apunta automático al rival más cercano)</li>
            <li><span className="font-semibold">Shift (mantené)</span> — intentar atajar una pelota que viene hacia vos</li>
            <li>Caminá sobre una pelota suelta para recogerla, y sobre los power-ups (⚡🔥🛡️⚽) para activarlos.</li>
            <li>Ganás eliminando a todo el equipo rival, o teniendo más eliminaciones cuando se acabe el tiempo (90s).</li>
          </ul>
        </StartScreen>

        <GameOverScreen
          isOpen={hud.status === 'gameover'}
          title={hud.winner ? RESULT_LABEL[hud.winner] : ''}
          subtitle={`${hud.eliminationsPlayerTeam} - ${hud.eliminationsAiTeam}`}
          onRestart={handleStart}
        />
      </div>
    </div>
  );
};

export default DodgeballGame;
