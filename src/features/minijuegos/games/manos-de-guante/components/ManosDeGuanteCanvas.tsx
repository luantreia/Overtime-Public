import React, { useEffect, useRef } from 'react';
import { ManosDeGuanteEngine } from '../engine/engine';
import { GameAudio } from '../../../shared/audio';
import { renderGame } from '../engine/renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../engine/constants';
import type { ManosHudState } from '../engine/types';

export interface ManosDeGuanteControls {
  start: () => void;
}

interface ManosDeGuanteCanvasProps {
  onHudChange: (hud: ManosHudState) => void;
  controlsRef: React.MutableRefObject<ManosDeGuanteControls | null>;
}

const ManosDeGuanteCanvas: React.FC<ManosDeGuanteCanvasProps> = ({ onHudChange, controlsRef }) => {
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
    const engine = new ManosDeGuanteEngine(audio);

    controlsRef.current = {
      start: () => {
        audio.unlock();
        engine.start();
      },
    };

    // Un solo gesto en todo el juego: tocar para atajar. No hace falta TouchZoneInput, que
    // divide en mitades — acá cualquier punto del canvas es el mismo intento.
    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      engine.requestCatch();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyJ') {
        e.preventDefault();
        engine.requestCatch();
      }
    };
    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    let raf = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      engine.update(dt);
      const snapshot = engine.getSnapshot();
      renderGame(ctx, snapshot);

      const hud: ManosHudState = {
        status: snapshot.status,
        score: snapshot.score,
        highScore: snapshot.highScore,
        vidas: snapshot.vidas,
        combo: snapshot.combo,
        companeros: snapshot.companeros,
        mejorCombo: snapshot.mejorCombo,
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
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
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

export default ManosDeGuanteCanvas;
