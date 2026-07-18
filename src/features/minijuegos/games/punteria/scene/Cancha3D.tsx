import React from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { COURT_WIDTH, HALF, HABILITACION_DIST, LINE_THICKNESS } from '../engine/constants';

const Linea: React.FC<{ x?: number; z?: number; ancho: number; profundidad: number }> = ({
  x = 0,
  z = 0,
  ancho,
  profundidad,
}) => (
  <mesh position={[x, 0.01, z]}>
    <boxGeometry args={[ancho, 0.01, profundidad]} />
    <meshStandardMaterial color="#f5f7ff" />
  </mesh>
);

/**
 * Cancha 9x18 (misma medida real que EstadioTemploScene) + piso físico plano.
 * Sin tribunas ni luces de estadio: acá importa el frame rate durante el juego, no la ambientación.
 */
const Cancha3D: React.FC = () => (
  <group>
    {/* Piso físico: un solo collider grande, más allá de los límites visibles de la cancha */}
    <RigidBody type="fixed" colliders={false} friction={0.6} restitution={0.35}>
      <CuboidCollider args={[15, 0.05, 15]} position={[0, -0.05, 0]} />
    </RigidBody>

    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, HALF / 2]}>
      <planeGeometry args={[COURT_WIDTH, HALF]} />
      <meshStandardMaterial color="#1f3188" roughness={0.85} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -HALF / 2]}>
      <planeGeometry args={[COURT_WIDTH, HALF]} />
      <meshStandardMaterial color="#2b45db" roughness={0.85} />
    </mesh>

    <Linea z={0} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    <Linea z={HABILITACION_DIST} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    <Linea z={-HABILITACION_DIST} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    <Linea z={HALF} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    <Linea z={-HALF} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    <Linea x={COURT_WIDTH / 2} ancho={LINE_THICKNESS} profundidad={HALF * 2} />
    <Linea x={-COURT_WIDTH / 2} ancho={LINE_THICKNESS} profundidad={HALF * 2} />
  </group>
);

export default Cancha3D;
