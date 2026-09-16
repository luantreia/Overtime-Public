import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../../../shared/hooks/usePageTitle';
import { StartScreen, GameOverScreen } from '../../../shared/components';
import { LaArrancadaCanvas, LaArrancadaHud, type LaArrancadaControls } from '../components';
import { DURACION_PARTIDA, VIDAS_INICIALES } from '../engine/constants';
import type { ArrancadaHudState } from '../engine/types';

const INITIAL_HUD: ArrancadaHudState = {
  status: 'ready',
  score: 0,
  highScore: 0,
  vidas: VIDAS_INICIALES,
  activadas: 0,
  llevaPelota: false,
  segundosRestantes: DURACION_PARTIDA,
  isNewHighScore: false,
};

const LaArrancadaGame: React.FC = () => {
  usePageTitle('La Arrancada');
  const controlsRef = useRef<LaArrancadaControls | null>(null);
  const [hud, setHud] = useState<ArrancadaHudState>(INITIAL_HUD);

  const handleHudChange = useCallback((next: ArrancadaHudState) => {
    setHud(next);
  }, []);

  const handleStart = () => {
    controlsRef.current?.start();
  };

  const seAcaboElTiempo = hud.status === 'gameover' && hud.vidas > 0;

  return (
    <div className="py-4">
      <Link to="/minijuegos" className="mb-4 inline-block text-sm text-slate-500 hover:text-slate-700">
        ← Minijuegos
      </Link>

      <div className="relative">
        <LaArrancadaHud hud={hud} />
        <LaArrancadaCanvas onHudChange={handleHudChange} controlsRef={controlsRef} />

        <StartScreen
          isOpen={hud.status === 'ready'}
          title="La Arrancada"
          subtitle="Robá pelotas del medio y volvé con ellas"
          onStart={handleStart}
        >
          <ul className="space-y-1.5">
            <li>
              <span className="font-semibold">Arrastrá el dedo</span> por la cancha para mover tu jugador. En
              escritorio, las flechas o WASD.
            </li>
            <li>Subí a la línea del medio y pasá por encima de una pelota para levantarla.</li>
            <li>
              Levantarla no alcanza: <span className="font-semibold">una pelota agarrada en la arrancada no vale</span>{' '}
              hasta que la cruzás por tu línea de activación. Volvé a la franja verde para activarla.
            </li>
            <li>
              Los rivales con <span className="font-semibold text-red-600">anillo rojo</span> ya activaron y te están
              por tirar. Si te pegan con la pelota en la mano, perdés el viaje entero.
            </li>
            <li>No podés cruzar a la mitad rival. Tenés {DURACION_PARTIDA} segundos y 3 vidas.</li>
          </ul>
        </StartScreen>

        <GameOverScreen
          isOpen={hud.status === 'gameover'}
          title={seAcaboElTiempo ? 'Se acabó el tiempo' : 'Te quedaste sin vidas'}
          subtitle={`Puntaje: ${hud.score}`}
          onRestart={handleStart}
        >
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              Pelotas activadas: <span className="font-semibold">{hud.activadas}</span>
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

export default LaArrancadaGame;
