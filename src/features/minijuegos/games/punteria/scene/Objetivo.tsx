import React from 'react';
import { RigidBody } from '@react-three/rapier';
import type { Target } from '../engine/types';

interface ObjetivoProps {
  target: Target;
  onHit: (id: string) => void;
}

/** Aro flotante: collider sensor (esfera aproximada al tamaño del aro) que dispara onHit al primer contacto. */
const Objetivo: React.FC<ObjetivoProps> = ({ target, onHit }) => (
  <RigidBody type="fixed" colliders="ball" sensor position={target.position} onIntersectionEnter={() => onHit(target.id)}>
    <mesh>
      <torusGeometry args={[target.radius, target.radius * 0.16, 12, 28]} />
      <meshStandardMaterial color="#ffb020" emissive="#ffb020" emissiveIntensity={0.55} roughness={0.4} />
    </mesh>
  </RigidBody>
);

export default Objetivo;
