import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../../../shared/hooks/usePageTitle';
import { StartScreen, GameOverScreen } from '../../../shared/components';
import { CabezonesCanvas, CabezonesHud, type CabezonesControls } from '../components';
import type { CabezonesHudState } from '../engine/types';

const INITIAL_HUD: CabezonesHudState = {
  status: 'ready',
  livesLeft: 3,
  livesRight: 3,
};

const RESULT_LABEL: Record<string, string> = {
  left: '¡Ganaste! 🏆',
  right: 'Perdiste',
  draw: 'Empate',
};

const CabezonesGame: React.FC = () => {
  usePageTitle('Cabezones Quemados');
  const controlsRef = useRef<CabezonesControls | null>(null);
  const [hud, setHud] = useState<CabezonesHudState>(INITIAL_HUD);

  const handleHudChange = useCallback((next: CabezonesHudState) => {
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
        <CabezonesHud hud={hud} />
        <CabezonesCanvas onHudChange={handleHudChange} controlsRef={controlsRef} />

        <StartScreen isOpen={hud.status === 'ready'} title="Cabezones Quemados" subtitle="1 vs 1 con físicas de verdad" onStart={handleStart}>
          <ul className="space-y-1.5">
            <li><span className="font-semibold">◀ ▶</span> moverte (o flechas en desktop)</li>
            <li><span className="font-semibold">Saltar</span> para esquivar tiros bajos</li>
            <li>Con una pelota en mano: <span className="font-semibold">arrastrá hacia atrás y soltá</span> para tirar, como una honda — y si el arrastre se curva, sale con efecto</li>
            <li><span className="font-semibold">Atajar</span> mantenido cuando una pelota viene y no tenés ninguna</li>
            <li>Si ya tenés una pelota en mano, un tiro rival rebota en vez de pegarte</li>
            <li>3 vidas cada uno — gana quien deja al otro en 0</li>
          </ul>
        </StartScreen>

        <GameOverScreen
          isOpen={hud.status === 'gameover'}
          title={hud.winner ? RESULT_LABEL[hud.winner] : ''}
          subtitle={`${hud.livesLeft} - ${hud.livesRight}`}
          onRestart={handleStart}
        />
      </div>
    </div>
  );
};

export default CabezonesGame;
