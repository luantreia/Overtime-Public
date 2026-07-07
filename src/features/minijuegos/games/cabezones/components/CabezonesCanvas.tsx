import React, { useEffect, useRef } from 'react';
import { CabezonesEngine, simulateTrajectory, type CabezonesUserInput } from '../engine/engine';
import { GameAudio } from '../../../shared/audio';
import { KeyboardInputManager } from '../../../shared/input/KeyboardInputManager';
import { normalize } from '../../../shared/collisions';
import { renderGame } from '../engine/renderer';
import { COURT_WIDTH, COURT_HEIGHT, MAX_DRAG_DISTANCE, THROW_POWER_SCALE, MAX_SPIN } from '../engine/constants';
import type { CabezonesHudState, Vector2 } from '../engine/types';

export interface CabezonesControls {
  start: () => void;
}

interface CabezonesCanvasProps {
  onHudChange: (hud: CabezonesHudState) => void;
  controlsRef: React.MutableRefObject<CabezonesControls | null>;
}

const toCanvasCoords = (clientX: number, clientY: number, canvas: HTMLCanvasElement): Vector2 => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * COURT_WIDTH,
    y: ((clientY - rect.top) / rect.height) * COURT_HEIGHT,
  };
};

const computeSpin = (anchor: Vector2, release: Vector2, path: Vector2[]): number => {
  const lineDx = release.x - anchor.x;
  const lineDy = release.y - anchor.y;
  const lineLen = Math.hypot(lineDx, lineDy) || 1;
  const nx = -lineDy / lineLen;
  const ny = lineDx / lineLen;

  let maxDeviation = 0;
  for (const p of path) {
    const dev = (p.x - anchor.x) * nx + (p.y - anchor.y) * ny;
    if (Math.abs(dev) > Math.abs(maxDeviation)) maxDeviation = dev;
  }
  return Math.max(-MAX_SPIN, Math.min(MAX_SPIN, maxDeviation / 40));
};

const computeThrow = (anchor: Vector2, release: Vector2): { velocity: Vector2 } => {
  const pull = { x: anchor.x - release.x, y: anchor.y - release.y };
  const dist = Math.min(MAX_DRAG_DISTANCE, Math.hypot(pull.x, pull.y));
  const dir = normalize(pull);
  return { velocity: { x: dir.x * dist * THROW_POWER_SCALE, y: dir.y * dist * THROW_POWER_SCALE } };
};

const ActionButton: React.FC<{
  label: string;
  onPress: () => void;
  onRelease?: () => void;
}> = ({ label, onPress, onRelease }) => (
  <button
    type="button"
    onPointerDown={(e) => {
      e.preventDefault();
      onPress();
    }}
    onPointerUp={onRelease}
    onPointerLeave={onRelease}
    onPointerCancel={onRelease}
    className="select-none rounded-full bg-white/15 px-4 py-3 text-sm font-bold text-white backdrop-blur-sm active:bg-white/30"
    style={{ touchAction: 'none' }}
  >
    {label}
  </button>
);

const CabezonesCanvas: React.FC<CabezonesCanvasProps> = ({ onHudChange, controlsRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastHudKeyRef = useRef<string>('');

  const moveLeftHeldRef = useRef(false);
  const moveRightHeldRef = useRef(false);
  const catchHeldRef = useRef(false);
  const jumpQueuedRef = useRef(false);

  const draggingRef = useRef(false);
  const dragAnchorRef = useRef<Vector2>({ x: 0, y: 0 });
  const dragPathRef = useRef<Vector2[]>([]);
  const aimPreviewRef = useRef<Vector2[] | null>(null);
  const humanHasBallRef = useRef(false);

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
    const engine = new CabezonesEngine(audio);

    controlsRef.current = {
      start: () => {
        audio.unlock();
        engine.start();
      },
    };

    const handlePointerDown = () => {
      if (!humanHasBallRef.current) return;
      const human = engine.players.find((p) => p.isUserControlled);
      if (!human) return;
      draggingRef.current = true;
      dragAnchorRef.current = { ...human.position };
      dragPathRef.current = [];
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const point = toCanvasCoords(e.clientX, e.clientY, canvas);
      dragPathRef.current.push(point);
      const { velocity } = computeThrow(dragAnchorRef.current, point);
      const spin = computeSpin(dragAnchorRef.current, point, dragPathRef.current);
      aimPreviewRef.current = simulateTrajectory(dragAnchorRef.current, velocity, spin);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      aimPreviewRef.current = null;
      const point = toCanvasCoords(e.clientX, e.clientY, canvas);
      const { velocity } = computeThrow(dragAnchorRef.current, point);
      const spin = computeSpin(dragAnchorRef.current, point, dragPathRef.current);
      engine.throwHeldBall(velocity, spin);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    let raf = 0;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const jumpPressed = jumpQueuedRef.current;
      jumpQueuedRef.current = false;

      const moveX = (moveLeftHeldRef.current ? -1 : 0) + (moveRightHeldRef.current ? 1 : 0);
      const userInput: CabezonesUserInput = {
        moveX,
        jumpPressed: jumpPressed || keyboard.consumeJustPressed('ArrowUp') || keyboard.consumeJustPressed('Space'),
        catchHeld: catchHeldRef.current || keyboard.isDown('KeyZ'),
      };

      const keyboardMoveX =
        (keyboard.isDown('ArrowLeft') ? -1 : 0) + (keyboard.isDown('ArrowRight') ? 1 : 0);
      if (keyboardMoveX !== 0) userInput.moveX = keyboardMoveX;

      engine.setUserInput(userInput);
      engine.update(dt);

      const snapshot = engine.getSnapshot();
      const human = snapshot.players.find((p) => p.isUserControlled);
      humanHasBallRef.current = !!human?.hasBallId;

      renderGame(ctx, snapshot, aimPreviewRef.current);

      const hud: CabezonesHudState = {
        status: snapshot.status,
        livesLeft: snapshot.players.find((p) => p.side === 'left')?.lives ?? 0,
        livesRight: snapshot.players.find((p) => p.side === 'right')?.lives ?? 0,
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
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      keyboard.destroy();
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative mx-auto" style={{ width: '100%', maxWidth: COURT_WIDTH }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', maxWidth: COURT_WIDTH, aspectRatio: `${COURT_WIDTH} / ${COURT_HEIGHT}`, touchAction: 'none' }}
        className="mx-auto block rounded-xl border border-slate-700 bg-black shadow-inner"
      />

      <div className="pointer-events-none absolute inset-0 flex items-end justify-between p-3">
        <div className="pointer-events-auto flex gap-2">
          <ActionButton
            label="◀"
            onPress={() => { moveLeftHeldRef.current = true; }}
            onRelease={() => { moveLeftHeldRef.current = false; }}
          />
          <ActionButton
            label="▶"
            onPress={() => { moveRightHeldRef.current = true; }}
            onRelease={() => { moveRightHeldRef.current = false; }}
          />
        </div>
        <div className="pointer-events-auto flex gap-2">
          <ActionButton label="Atajar" onPress={() => { catchHeldRef.current = true; }} onRelease={() => { catchHeldRef.current = false; }} />
          <ActionButton label="Saltar" onPress={() => { jumpQueuedRef.current = true; }} />
        </div>
      </div>
    </div>
  );
};

export default CabezonesCanvas;
