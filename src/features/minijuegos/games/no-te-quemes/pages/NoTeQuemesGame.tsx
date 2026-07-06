import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../../../shared/hooks/usePageTitle';
import { StartScreen, GameOverScreen } from '../../../shared/components';
import { NoTeQuemesCanvas, NoTeQuemesHud, type NoTeQuemesControls } from '../components';
import type { NoTeQuemesHudState } from '../engine/types';

const INITIAL_HUD: NoTeQuemesHudState = {
  status: 'ready',
  score: 0,
  highScore: 0,
  isNewHighScore: false,
};

const NoTeQuemesGame: React.FC = () => {
  usePageTitle('No Te Quemes');
  const controlsRef = useRef<NoTeQuemesControls | null>(null);
  const [hud, setHud] = useState<NoTeQuemesHudState>(INITIAL_HUD);

  const handleHudChange = useCallback((next: NoTeQuemesHudState) => {
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
        <NoTeQuemesHud hud={hud} />
        <NoTeQuemesCanvas onHudChange={handleHudChange} controlsRef={controlsRef} />

        <StartScreen isOpen={hud.status === 'ready'} title="No Te Quemes" subtitle="Esquivá los pelotazos el mayor tiempo posible" onStart={handleStart}>
          <ul className="space-y-1.5">
            <li><span className="font-semibold">Tocá la mitad izquierda o derecha</span> de la pantalla para cambiar de carril</li>
            <li>En escritorio también podés usar las flechas ← →</li>
            <li>Las pelotas caen cada vez más rápido y más seguido — aguantá lo más que puedas.</li>
            <li>Tu puntaje es el tiempo sobrevivido. Hay un récord guardado en este dispositivo.</li>
          </ul>
        </StartScreen>

        <GameOverScreen
          isOpen={hud.status === 'gameover'}
          title="¡Te quemaron!"
          subtitle={`Puntaje: ${hud.score}`}
          onRestart={handleStart}
        >
          {hud.isNewHighScore ? (
            <p className="text-sm font-semibold text-amber-600">¡Nuevo récord! 🎉</p>
          ) : (
            <p className="text-sm text-slate-500">Récord: {hud.highScore}</p>
          )}
        </GameOverScreen>
      </div>
    </div>
  );
};

export default NoTeQuemesGame;
