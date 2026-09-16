import React, { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../../../../shared/hooks/usePageTitle';
import { StartScreen, GameOverScreen } from '../../../shared/components';
import { JuntaPelotasCanvas, JuntaPelotasHud, type JuntaPelotasControls } from '../components';
import { CAPACIDAD, SUMINISTRO_MAX } from '../engine/constants';
import type { JuntaHudState } from '../engine/types';

const INITIAL_HUD: JuntaHudState = {
  status: 'ready',
  score: 0,
  highScore: 0,
  carga: 0,
  suministro: SUMINISTRO_MAX,
  entregadas: 0,
  segundos: 0,
  isNewHighScore: false,
};

const JuntaPelotasGame: React.FC = () => {
  usePageTitle('Junta Pelotas');
  const controlsRef = useRef<JuntaPelotasControls | null>(null);
  const [hud, setHud] = useState<JuntaHudState>(INITIAL_HUD);

  const handleHudChange = useCallback((next: JuntaHudState) => {
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
        <JuntaPelotasHud hud={hud} />
        <JuntaPelotasCanvas onHudChange={handleHudChange} controlsRef={controlsRef} />

        <StartScreen
          isOpen={hud.status === 'ready'}
          title="Junta Pelotas"
          subtitle="Sos el shagger: sin vos, el equipo se queda sin pelotas"
          onStart={handleStart}
        >
          <ul className="space-y-1.5">
            <li>
              <span className="font-semibold">Arrastrá el dedo</span> para caminar por el pasillo de afuera. En
              escritorio, ← y →.
            </li>
            <li>
              Pasá por encima de una pelota para juntarla. Llevás hasta {CAPACIDAD}; entregar las {CAPACIDAD} juntas da
              bonus.
            </li>
            <li>
              Para devolverlas, volvé a la <span className="font-semibold text-emerald-700">franja verde</span>, detrás
              de tu línea de ataque. Es el único lugar desde donde se puede.
            </li>
            <li>
              <span className="font-semibold">No podés pasar la línea del medio</span>: las pelotas grises son del lado
              rival y las junta su shagger, no vos.
            </li>
            <li>La barra de abajo es el suministro del equipo y baja sola. Si llega a cero, se terminó.</li>
          </ul>
        </StartScreen>

        <GameOverScreen
          isOpen={hud.status === 'gameover'}
          title="El equipo se quedó sin pelotas"
          subtitle={`Puntaje: ${hud.score}`}
          onRestart={handleStart}
        >
          <div className="space-y-1 text-sm text-slate-600">
            <p>
              Devueltas: <span className="font-semibold">{hud.entregadas}</span> · Aguantaste{' '}
              <span className="font-semibold">{hud.segundos}s</span>
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

export default JuntaPelotasGame;
