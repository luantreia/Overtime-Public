import React, { useEffect, useRef } from 'react';
import { MurallaEngine } from '../engine/engine';
import { GameAudio } from '../../../shared/audio';
import { TouchZoneInput } from '../../../shared/input/TouchZoneInput';
import { renderGame } from '../engine/renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../engine/constants';
import type { MurallaHudState } from '../engine/types';

export interface MurallaControls {
  start: () => void;
}

interface MurallaCanvasProps {
  onHudChange: (hud: MurallaHudState) => void;
  controlsRef: React.MutableRefObject<MurallaControls | null>;
}

const MurallaCanvas: React.FC<MurallaCanvasProps> = ({ onHudChange, controlsRef }) => {
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
    const engine = new MurallaEngine(audio);
    // Mitad izquierda = bloquear, mitad derecha = esquivar. Es exactamente el reparto que
    // TouchZoneInput ya resuelve, y el pie del canvas lo rotula.
    const touchInput = new TouchZoneInput(canvas);

    controlsRef.current = {
      start: () => {
        audio.unlock();
        engine.start();
      },
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') engine.requestAccion('bloquear');
      if (e.code === 'ArrowRight' || e.code === 'KeyD') engine.requestAccion('esquivar');
    };
    window.addEventListener('keydown', handleKeyDown);

    let raf = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const zone = touchInput.consumeZone();
      if (zone === 'left') engine.requestAccion('bloquear');
      if (zone === 'right') engine.requestAccion('esquivar');

      engine.update(dt);
      const snapshot = engine.getSnapshot();
      renderGame(ctx, snapshot);

      const hud: MurallaHudState = {
        status: snapshot.status,
        fase: snapshot.fase,
        score: snapshot.score,
        highScore: snapshot.highScore,
        vidas: snapshot.vidas,
        combo: snapshot.combo,
        bloqueos: snapshot.bloqueos,
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

export default MurallaCanvas;
