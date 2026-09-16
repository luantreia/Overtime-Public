import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../../../shared/hooks/usePageTitle';
import { StartScreen, GameOverScreen } from '../../../shared/components';
import { ManosDeGuanteCanvas, ManosDeGuanteHud, type ManosDeGuanteControls } from '../components';
import { VIDAS_INICIALES } from '../engine/constants';
import type { ManosHudState } from '../engine/types';

const INITIAL_HUD: ManosHudState = {
  status: 'ready',
  score: 0,
  highScore: 0,
  vidas: VIDAS_INICIALES,
  combo: 0,
  companeros: 0,
  mejorCombo: 0,
  isNewHighScore: false,
};

const ManosDeGuanteGame: React.FC = () => {
  usePageTitle('Manos de Guante');
  const controlsRef = useRef<ManosDeGuanteControls | null>(null);
  const [hud, setHud] = useState<ManosHudState>(INITIAL_HUD);

  const handleHudChange = useCallback((next: ManosHudState) => {
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
        <ManosDeGuanteHud hud={hud} />
        <ManosDeGuanteCanvas onHudChange={handleHudChange} controlsRef={controlsRef} />

        <StartScreen
          isOpen={hud.status === 'ready'}
          title="Manos de Guante"
          subtitle="Atajá al vuelo y traé de vuelta a tus compañeros"
          onStart={handleStart}
        >
          <ul className="space-y-1.5">
            <li>
              <span className="font-semibold">Tocá la pantalla</span> cuando la pelota entre en el anillo. En
              escritorio, la barra espaciadora.
            </li>
            <li>
              El anillo interno es la <span className="font-semibold">atajada perfecta</span>: vale el doble.
            </li>
            <li>
              Las pelotas <span className="font-semibold">grises y punteadas ya picaron</span>. No eliminan a nadie,
              así que atajarlas no sirve: dejalas pasar o te quedás sin manos un rato.
            </li>
            <li>Cada atajada devuelve un compañero a la cancha. Atajadas seguidas multiplican el puntaje.</li>
          </ul>
        </StartScreen>

        <GameOverScreen
          isOpen={hud.status === 'gameover'}
          title="Te quedaste sin vidas"
          subtitle={`Puntaje: ${hud.score}`}
          onRestart={handleStart}
        >
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              Compañeros devueltos: <span className="font-semibold">{hud.companeros}</span> · Mejor racha:{' '}
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

export default ManosDeGuanteGame;
