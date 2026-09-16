import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../../../shared/hooks/usePageTitle';
import { StartScreen, GameOverScreen } from '../../../shared/components';
import { MurallaCanvas, MurallaHud, type MurallaControls } from '../components';
import { VIDAS_INICIALES } from '../engine/constants';
import type { MurallaHudState } from '../engine/types';

const INITIAL_HUD: MurallaHudState = {
  status: 'ready',
  fase: 'normal',
  score: 0,
  highScore: 0,
  vidas: VIDAS_INICIALES,
  combo: 0,
  bloqueos: 0,
  mejorCombo: 0,
  isNewHighScore: false,
};

const MurallaGame: React.FC = () => {
  usePageTitle('Muralla');
  const controlsRef = useRef<MurallaControls | null>(null);
  const [hud, setHud] = useState<MurallaHudState>(INITIAL_HUD);

  const handleHudChange = useCallback((next: MurallaHudState) => {
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
        <MurallaHud hud={hud} />
        <MurallaCanvas onHudChange={handleHudChange} controlsRef={controlsRef} />

        <StartScreen
          isOpen={hud.status === 'ready'}
          title="Muralla"
          subtitle="Bloqueá todo… hasta que el árbitro diga que no"
          onStart={handleStart}
        >
          <ul className="space-y-1.5">
            <li>
              <span className="font-semibold">Mitad izquierda</span> de la pantalla para bloquear,{' '}
              <span className="font-semibold">mitad derecha</span> para esquivar. En escritorio, ← y →.
            </li>
            <li>Bloquear paga más que esquivar: conservás tu pelota en la mano.</li>
            <li>
              Cada tantos tiros el árbitro canta <span className="font-semibold">No-Blocking</span>. Ahí la pelota que
              tenés en la mano cuenta como tu cuerpo:{' '}
              <span className="font-semibold text-orange-700">bloquear te elimina</span> y solo queda esquivar.
            </li>
            <li>La cancha se tiñe de naranja durante No-Blocking. Tenés 3 vidas.</li>
          </ul>
        </StartScreen>

        <GameOverScreen
          isOpen={hud.status === 'gameover'}
          title="Quedaste afuera"
          subtitle={`Puntaje: ${hud.score}`}
          onRestart={handleStart}
        >
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              Bloqueos: <span className="font-semibold">{hud.bloqueos}</span> · Mejor racha:{' '}
              <span className="font-semibold">{hud.mejorCombo}</span>
            </p>
            {hud.isNewHighScore ? (
              <p className="font-semibold text-amber-600">¡Nuevo récord! 🎉</p>
            ) : (
              <p className="text-slate-500">Récord: {hud.highScore}</p>
            )}
          </div>
        </GameOverScreen>
      </div>
    </div>
  );
};

export default MurallaGame;
