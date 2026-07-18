import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import Cancha3D from './Cancha3D';
import Pelota, { type ThrowRequest } from './Pelota';
import Objetivo from './Objetivo';
import { spawnTarget } from '../engine/targets';
import type { Target } from '../engine/types';
import { CAMERA_LOOK_AT, CAMERA_POSITION, MAX_TARGETS } from '../engine/constants';

const CamaraFija: React.FC = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(...CAMERA_POSITION);
    camera.lookAt(...CAMERA_LOOK_AT);
  }, [camera]);
  return null;
};

const Reloj: React.FC<{ onTick: (delta: number) => void }> = ({ onTick }) => {
  useFrame((_, delta) => onTick(delta));
  return null;
};

interface PunteriaSceneProps {
  activo: boolean;
  throwRequestRef: React.MutableRefObject<ThrowRequest | null>;
  onTick: (delta: number) => void;
  onScore: () => void;
}

const PunteriaScene: React.FC<PunteriaSceneProps> = ({ activo, throwRequestRef, onTick, onScore }) => {
  const [targets, setTargets] = useState<Target[]>(() => Array.from({ length: MAX_TARGETS }, () => spawnTarget()));
  const hitSignalRef = useRef(0);

  const handleHit = useCallback(
    (id: string) => {
      setTargets((prev) => prev.map((t) => (t.id === id ? spawnTarget() : t)));
      hitSignalRef.current += 1;
      onScore();
    },
    [onScore]
  );

  return (
    <Canvas shadows dpr={[1, 1.5]} gl={{ antialias: true, powerPreference: 'low-power' }} camera={{ fov: 55 }}>
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 18, 40]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[6, 10, 4]} intensity={0.75} castShadow />
      <CamaraFija />
      <Reloj onTick={onTick} />
      <Physics gravity={[0, -9.81, 0]}>
        <Cancha3D />
        <Pelota activo={activo} throwRequestRef={throwRequestRef} hitSignalRef={hitSignalRef} />
        {targets.map((t) => (
          <Objetivo key={t.id} target={t} onHit={handleHit} />
        ))}
      </Physics>
    </Canvas>
  );
};

export default PunteriaScene;
