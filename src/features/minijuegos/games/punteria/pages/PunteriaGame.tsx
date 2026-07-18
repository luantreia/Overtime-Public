import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../../../shared/hooks/usePageTitle';
import { StartScreen, GameOverScreen } from '../../../shared/components';
import { PunteriaCanvas, PunteriaHud, type PunteriaControls } from '../components';
import type { PunteriaHudState } from '../engine/types';

const INITIAL_HUD: PunteriaHudState = {
  status: 'ready',
  score: 0,
  timeLeft: 30,
};

const PunteriaGame: React.FC = () => {
  usePageTitle('Puntería 3D');
  const controlsRef = useRef<PunteriaControls | null>(null);
  const [hud, setHud] = useState<PunteriaHudState>(INITIAL_HUD);

  const handleHudChange = useCallback((next: PunteriaHudState) => {
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
        <PunteriaHud hud={hud} />
        <PunteriaCanvas onHudChange={handleHudChange} controlsRef={controlsRef} />

        <StartScreen isOpen={hud.status === 'ready'} title="Puntería 3D" subtitle="Objetivos al vuelo, contrarreloj" onStart={handleStart}>
          <ul className="space-y-1.5">
            <li>Arrastrá hacia atrás y soltá para tirar, como una honda</li>
            <li>Si el arrastre se curva, la pelota sale con <span className="font-semibold">efecto</span> (física real, con fuerza de Magnus)</li>
            <li>Cada aro que acertás suma <span className="font-semibold">1 punto</span> y <span className="font-semibold">+2 segundos</span></li>
            <li>30 segundos para arrancar — si el tiempo llega a 0, se acabó</li>
          </ul>
        </StartScreen>

        <GameOverScreen
          isOpen={hud.status === 'gameover'}
          title="¡Se acabó el tiempo!"
          subtitle={`Puntaje: ${hud.score}`}
          onRestart={handleStart}
        />
      </div>
    </div>
  );
};

export default PunteriaGame;
