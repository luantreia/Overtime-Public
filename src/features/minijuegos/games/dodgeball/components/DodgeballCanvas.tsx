import React, { useEffect, useRef } from 'react';
import { DodgeballEngine } from '../engine/engine';
import { GameAudio } from '../../../shared/audio';
import { KeyboardInputManager } from '../../../shared/input/KeyboardInputManager';
import { renderGame } from '../engine/renderer';
import { COURT_WIDTH, COURT_HEIGHT } from '../engine/constants';
import type { HudState, InputSnapshot } from '../engine/types';

export interface GameControls {
  start: () => void;
}

interface GameCanvasProps {
  onHudChange: (hud: HudState) => void;
  controlsRef: React.MutableRefObject<GameControls | null>;
}

const readInputSnapshot = (keyboard: KeyboardInputManager): InputSnapshot => {
  let moveX = 0;
  let moveY = 0;
  if (keyboard.isDown('ArrowLeft') || keyboard.isDown('KeyA')) moveX -= 1;
  if (keyboard.isDown('ArrowRight') || keyboard.isDown('KeyD')) moveX += 1;
  if (keyboard.isDown('ArrowUp') || keyboard.isDown('KeyW')) moveY -= 1;
  if (keyboard.isDown('ArrowDown') || keyboard.isDown('KeyS')) moveY += 1;

  const throwPressed = keyboard.consumeJustPressed('Space');
  const catchHeld = keyboard.isDown('ShiftLeft') || keyboard.isDown('ShiftRight');

  return { moveX, moveY, throwPressed, catchHeld };
};

const DodgeballCanvas: React.FC<GameCanvasProps> = ({ onHudChange, controlsRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastHudKeyRef = useRef<string>('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = COURT_WIDTH * dpr;
    canvas.height = COURT_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const audio = new GameAudio();
    const keyboard = new KeyboardInputManager(window);
    const engine = new DodgeballEngine(audio);

    controlsRef.current = {
      start: () => {
        audio.unlock();
        engine.start();
      },
    };

    let raf = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      engine.setUserInput(readInputSnapshot(keyboard));
      engine.update(dt);

      const snapshot = engine.getSnapshot();
      renderGame(ctx, snapshot);

      const hud: HudState = {
        status: snapshot.status,
        eliminationsPlayerTeam: snapshot.eliminationsPlayerTeam,
        eliminationsAiTeam: snapshot.eliminationsAiTeam,
        timeRemaining: Math.ceil(snapshot.timeRemaining),
        activePowerUp: snapshot.activePowerUp,
        winner: snapshot.winner,
      };
      const hudKey = JSON.stringify(hud);
      if (hudKey !== lastHudKeyRef.current) {
        lastHudKeyRef.current = hudKey;
        onHudChange(hud);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      keyboard.destroy();
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', maxWidth: COURT_WIDTH, aspectRatio: `${COURT_WIDTH} / ${COURT_HEIGHT}` }}
      className="mx-auto block rounded-xl border border-slate-700 bg-black shadow-inner"
    />
  );
};

export default DodgeballCanvas;
