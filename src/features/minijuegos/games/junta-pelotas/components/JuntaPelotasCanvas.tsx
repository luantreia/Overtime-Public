import React, { useEffect, useRef } from 'react';
import { JuntaPelotasEngine } from '../engine/engine';
import { GameAudio } from '../../../shared/audio';
import { KeyboardInputManager } from '../../../shared/input/KeyboardInputManager';
import { renderGame } from '../engine/renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT, SHAGGER_SPEED } from '../engine/constants';
import type { JuntaHudState } from '../engine/types';

export interface JuntaPelotasControls {
  start: () => void;
}

interface JuntaPelotasCanvasProps {
  onHudChange: (hud: JuntaHudState) => void;
  controlsRef: React.MutableRefObject<JuntaPelotasControls | null>;
}

const JuntaPelotasCanvas: React.FC<JuntaPelotasCanvasProps> = ({ onHudChange, controlsRef }) => {
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
    const engine = new JuntaPelotasEngine(audio);
    const keyboard = new KeyboardInputManager();

    controlsRef.current = {
      start: () => {
        audio.unlock();
        engine.start();
      },
    };

    // Movimiento en un solo eje: el shagger camina por el pasillo de afuera. Basta con la X
    // del dedo, traducida de píxeles de pantalla a coordenadas del juego.
    const aXJuego = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH;
    };

    let arrastrando = false;
    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      arrastrando = true;
      canvas.setPointerCapture(e.pointerId);
      engine.setDestinoX(aXJuego(e));
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!arrastrando) return;
      engine.setDestinoX(aXJuego(e));
    };
    const handlePointerUp = (e: PointerEvent) => {
      arrastrando = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      engine.setDestinoX(null);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);

    let raf = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      if (!arrastrando) {
        const eje = (keyboard.isDown('ArrowRight') || keyboard.isDown('KeyD') ? 1 : 0)
          - (keyboard.isDown('ArrowLeft') || keyboard.isDown('KeyA') ? 1 : 0);
        engine.setDestinoX(eje === 0 ? null : engine.getSnapshot().shaggerX + eje * SHAGGER_SPEED);
      }

      engine.update(dt);
      const snapshot = engine.getSnapshot();
      renderGame(ctx, snapshot);

      const hud: JuntaHudState = {
        status: snapshot.status,
        score: snapshot.score,
        highScore: snapshot.highScore,
        carga: snapshot.carga,
        suministro: Math.round(snapshot.suministro),
        entregadas: snapshot.entregadas,
        segundos: Math.floor(snapshot.segundos),
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
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      keyboard.destroy();
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

export default JuntaPelotasCanvas;
