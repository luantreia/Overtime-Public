import React, { useEffect, useRef } from 'react';
import { ArrancadaEngine } from '../engine/engine';
import { GameAudio } from '../../../shared/audio';
import { KeyboardInputManager } from '../../../shared/input/KeyboardInputManager';
import { renderGame } from '../engine/renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT, PLAYER_SPEED } from '../engine/constants';
import type { ArrancadaHudState } from '../engine/types';

export interface LaArrancadaControls {
  start: () => void;
}

interface LaArrancadaCanvasProps {
  onHudChange: (hud: ArrancadaHudState) => void;
  controlsRef: React.MutableRefObject<LaArrancadaControls | null>;
}

const LaArrancadaCanvas: React.FC<LaArrancadaCanvasProps> = ({ onHudChange, controlsRef }) => {
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
    const engine = new ArrancadaEngine(audio);
    const keyboard = new KeyboardInputManager();

    controlsRef.current = {
      start: () => {
        audio.unlock();
        engine.start();
      },
    };

    // El canvas se muestra escalado por CSS, así que hay que pasar de píxeles de pantalla a
    // coordenadas del mundo del juego antes de dárselas al engine.
    const aCoordenadasJuego = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
        y: ((e.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
      };
    };

    let arrastrando = false;
    const handlePointerDown = (e: PointerEvent) => {
      e.preventDefault();
      arrastrando = true;
      canvas.setPointerCapture(e.pointerId);
      engine.setDestino(aCoordenadasJuego(e));
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!arrastrando) return;
      engine.setDestino(aCoordenadasJuego(e));
    };
    const handlePointerUp = (e: PointerEvent) => {
      arrastrando = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      engine.setDestino(null);
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

      // El teclado empuja un destino un paso por delante del jugador, así el engine solo
      // necesita entender "andá hacia este punto" sea cual sea el input.
      if (!arrastrando) {
        const ejeX = (keyboard.isDown('ArrowRight') || keyboard.isDown('KeyD') ? 1 : 0)
          - (keyboard.isDown('ArrowLeft') || keyboard.isDown('KeyA') ? 1 : 0);
        const ejeY = (keyboard.isDown('ArrowDown') || keyboard.isDown('KeyS') ? 1 : 0)
          - (keyboard.isDown('ArrowUp') || keyboard.isDown('KeyW') ? 1 : 0);
        if (ejeX !== 0 || ejeY !== 0) {
          const { jugador } = engine.getSnapshot();
          const largo = Math.hypot(ejeX, ejeY);
          engine.setDestino({
            x: jugador.x + (ejeX / largo) * PLAYER_SPEED,
            y: jugador.y + (ejeY / largo) * PLAYER_SPEED,
          });
        } else {
          engine.setDestino(null);
        }
      }

      engine.update(dt);
      const snapshot = engine.getSnapshot();
      renderGame(ctx, snapshot);

      const hud: ArrancadaHudState = {
        status: snapshot.status,
        score: snapshot.score,
        highScore: snapshot.highScore,
        vidas: snapshot.vidas,
        activadas: snapshot.activadas,
        llevaPelota: snapshot.llevaPelota,
        segundosRestantes: Math.ceil(snapshot.segundosRestantes),
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

export default LaArrancadaCanvas;
