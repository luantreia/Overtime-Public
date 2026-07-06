import React, { useEffect, useRef } from 'react';
import { NoTeQuemesEngine } from '../engine/engine';
import { GameAudio } from '../../../shared/audio';
import { TouchZoneInput } from '../../../shared/input/TouchZoneInput';
import { renderGame } from '../engine/renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../engine/constants';
import type { NoTeQuemesHudState } from '../engine/types';

export interface NoTeQuemesControls {
  start: () => void;
}

interface NoTeQuemesCanvasProps {
  onHudChange: (hud: NoTeQuemesHudState) => void;
  controlsRef: React.MutableRefObject<NoTeQuemesControls | null>;
}

const NoTeQuemesCanvas: React.FC<NoTeQuemesCanvasProps> = ({ onHudChange, controlsRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastHudKeyRef = useRef<string>('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const audio = new GameAudio();
    const engine = new NoTeQuemesEngine(audio);
    const touchInput = new TouchZoneInput(canvas);

    controlsRef.current = {
      start: () => {
        audio.unlock();
        engine.start();
      },
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') engine.requestLaneMove(-1);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') engine.requestLaneMove(1);
    };
    window.addEventListener('keydown', handleKeyDown);

    let raf = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const zone = touchInput.consumeZone();
      if (zone === 'left') engine.requestLaneMove(-1);
      if (zone === 'right') engine.requestLaneMove(1);

      engine.update(dt);
      const snapshot = engine.getSnapshot();
      renderGame(ctx, snapshot);

      const hud: NoTeQuemesHudState = {
        status: snapshot.status,
        score: snapshot.score,
        highScore: snapshot.highScore,
        isNewHighScore: engine.isNewHighScore,
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
      window.removeEventListener('keydown', handleKeyDown);
      touchInput.destroy();
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', maxWidth: CANVAS_WIDTH, aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`, touchAction: 'none' }}
      className="mx-auto block rounded-xl border border-slate-700 bg-black shadow-inner"
    />
  );
};

export default NoTeQuemesCanvas;
