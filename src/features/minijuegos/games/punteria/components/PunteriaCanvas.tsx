import React, { Suspense, useEffect, useRef, useState } from 'react';
import type { ThrowRequest } from '../scene/Pelota';
import type { PunteriaHudState } from '../engine/types';
import {
  INITIAL_TIME,
  MAX_DRAG_DISTANCE,
  MAX_ARC,
  MAX_SPIN,
  MIN_THROW_SPEED,
  POINTS_PER_HIT,
  SPIN_FROM_DEVIATION_SCALE,
  THROW_POWER_SCALE,
  TIME_BONUS_PER_HIT,
} from '../engine/constants';

const PunteriaScene = React.lazy(() => import('../scene/PunteriaScene'));

export interface PunteriaControls {
  start: () => void;
}

interface PunteriaCanvasProps {
  onHudChange: (hud: PunteriaHudState) => void;
  controlsRef: React.MutableRefObject<PunteriaControls | null>;
}

interface Punto {
  x: number;
  y: number;
}

// El ancla del "honda" es un punto fijo en pantalla (donde visualmente está la pelota lista),
// no el lugar donde tocás primero — así el gesto siempre significa lo mismo.
const ANCLA_FRACCION = { x: 0.5, y: 0.8 };

/** Misma idea que en Cabezones: el arrastre se estira hacia atrás como una honda, y su curvatura define el efecto. */
const computeSpin = (anchor: Punto, release: Punto, path: Punto[]): number => {
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
  return Math.max(-MAX_SPIN, Math.min(MAX_SPIN, maxDeviation * SPIN_FROM_DEVIATION_SCALE));
};

const computeThrow = (anchor: Punto, release: Punto): ThrowRequest => {
  const dx = anchor.x - release.x;
  const dy = anchor.y - release.y;
  const dragDist = Math.min(MAX_DRAG_DISTANCE, Math.hypot(dx, dy));
  const power = Math.max(MIN_THROW_SPEED, dragDist * THROW_POWER_SCALE);

  const dirX = dragDist > 0 ? (dx / dragDist) * 0.6 : 0;
  const dirY = Math.max(0.15, (dragDist > 0 ? (dy / dragDist) * MAX_ARC : 0) + 0.25);
  const dir = { x: dirX, y: dirY, z: 1 };
  const len = Math.hypot(dir.x, dir.y, dir.z) || 1;

  return {
    velocity: [(dir.x / len) * power, (dir.y / len) * power, (dir.z / len) * power],
    angularVelocity: [0, 0, 0],
  };
};

const FallbackCarga: React.FC = () => (
  <div className="flex h-full w-full items-center justify-center bg-slate-900 text-sm text-slate-400">
    Cargando cancha…
  </div>
);

const PunteriaCanvas: React.FC<PunteriaCanvasProps> = ({ onHudChange, controlsRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const throwRequestRef = useRef<ThrowRequest | null>(null);

  const statusRef = useRef<PunteriaHudState['status']>('ready');
  const scoreRef = useRef(0);
  const timeLeftRef = useRef(INITIAL_TIME);
  const lastHudKeyRef = useRef('');
  // Estado real (no ref) solo para re-renderizar y actualizar la prop `activo` de la escena;
  // score/timer se mantienen en refs para no re-renderizar en cada frame.
  const [activo, setActivo] = useState(false);

  const draggingRef = useRef(false);
  const anchorRef = useRef<Punto>({ x: 0, y: 0 });
  const pathRef = useRef<Punto[]>([]);

  // Feedback visual del arrastre: se mueve por DOM directo (no React state) para no re-renderizar en cada pointermove
  const overlayRef = useRef<SVGSVGElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const anchorDotRef = useRef<SVGCircleElement>(null);
  const pointerDotRef = useRef<SVGCircleElement>(null);

  const emitHud = () => {
    const hud: PunteriaHudState = {
      status: statusRef.current,
      score: scoreRef.current,
      timeLeft: Math.max(0, Math.ceil(timeLeftRef.current)),
    };
    const key = `${hud.status}-${hud.score}-${hud.timeLeft}`;
    if (key !== lastHudKeyRef.current) {
      lastHudKeyRef.current = key;
      onHudChange(hud);
    }
  };

  const handleTick = (delta: number) => {
    if (statusRef.current !== 'playing') return;
    timeLeftRef.current -= delta;
    if (timeLeftRef.current <= 0) {
      timeLeftRef.current = 0;
      statusRef.current = 'gameover';
      setActivo(false);
    }
    emitHud();
  };

  const handleScore = () => {
    if (statusRef.current !== 'playing') return;
    scoreRef.current += POINTS_PER_HIT;
    timeLeftRef.current += TIME_BONUS_PER_HIT;
    emitHud();
  };

  useEffect(() => {
    controlsRef.current = {
      start: () => {
        scoreRef.current = 0;
        timeLeftRef.current = INITIAL_TIME;
        statusRef.current = 'playing';
        setActivo(true);
        emitHud();
      },
    };
    return () => {
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const actualizarLinea = (actual: Punto) => {
      const anchor = anchorRef.current;
      lineRef.current?.setAttribute('x1', String(actual.x));
      lineRef.current?.setAttribute('y1', String(actual.y));
      lineRef.current?.setAttribute('x2', String(anchor.x));
      lineRef.current?.setAttribute('y2', String(anchor.y));
      anchorDotRef.current?.setAttribute('cx', String(anchor.x));
      anchorDotRef.current?.setAttribute('cy', String(anchor.y));
      pointerDotRef.current?.setAttribute('cx', String(actual.x));
      pointerDotRef.current?.setAttribute('cy', String(actual.y));
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (statusRef.current !== 'playing') return;
      const rect = el.getBoundingClientRect();
      draggingRef.current = true;
      anchorRef.current = { x: rect.width * ANCLA_FRACCION.x, y: rect.height * ANCLA_FRACCION.y };
      pathRef.current = [];
      if (overlayRef.current) overlayRef.current.style.opacity = '1';
      actualizarLinea({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const rect = el.getBoundingClientRect();
      const punto = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      pathRef.current.push(punto);
      actualizarLinea(punto);
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      if (overlayRef.current) overlayRef.current.style.opacity = '0';
      const rect = el.getBoundingClientRect();
      const release = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      const throwReq = computeThrow(anchorRef.current, release);
      const spin = computeSpin(anchorRef.current, release, pathRef.current);
      throwReq.angularVelocity = [0, spin, 0];
      throwRequestRef.current = throwReq;
    };

    el.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-inner"
      style={{ touchAction: 'none' }}
    >
      <Suspense fallback={<FallbackCarga />}>
        <PunteriaScene
          activo={activo}
          throwRequestRef={throwRequestRef}
          onTick={handleTick}
          onScore={handleScore}
        />
      </Suspense>

      {/* Indicador de arrastre: línea "honda" desde el punto actual hasta el ancla fija */}
      <svg
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-100"
        style={{ opacity: 0 }}
      >
        <line ref={lineRef} stroke="#ffb020" strokeWidth={3} strokeDasharray="7 7" strokeLinecap="round" />
        <circle ref={anchorDotRef} r={9} fill="#ff6b35" stroke="#0f172a" strokeWidth={2} />
        <circle ref={pointerDotRef} r={7} fill="#f5f7ff" fillOpacity={0.85} />
      </svg>

      {activo && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-semibold text-white/70">
          Arrastrá desde la pelota hacia atrás y soltá para tirar
        </div>
      )}
    </div>
  );
};

export default PunteriaCanvas;
