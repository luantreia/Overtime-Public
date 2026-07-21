import React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const COURT_WIDTH = 9; // ancho (x)
const COURT_LENGTH = 18; // largo total (z)
const HALF = COURT_LENGTH / 2; // 9 -> cada mitad es un cuadrado 9x9
const HABILITACION_DIST = 3; // línea de habilitación, a 3m de la central
const LINE_THICKNESS = 0.08;

// Piso de la plaza/club alrededor de la cancha (simple, sin tribunas)
const PISO_ANCHO = COURT_WIDTH + 14;
const PISO_LARGO = COURT_LENGTH + 14;

// Línea blanca de cancha (una caja fina)
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

// Cancha: rectángulo 18x9 -> dos cuadrados 9x9 + línea central + líneas de habilitación (3m) + borde
const Cancha: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, HALF / 2]}>
      <planeGeometry args={[COURT_WIDTH, HALF]} />
      <meshStandardMaterial color="#1f3188" roughness={0.85} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, -HALF / 2]}>
      <planeGeometry args={[COURT_WIDTH, HALF]} />
      <meshStandardMaterial color="#2b45db" roughness={0.85} />
    </mesh>

    {/* Línea central */}
    <Linea z={0} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    {/* Líneas de habilitación, a 3m de la central a cada lado */}
    <Linea z={HABILITACION_DIST} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    <Linea z={-HABILITACION_DIST} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    {/* Borde perimetral */}
    <Linea z={HALF} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    <Linea z={-HALF} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    <Linea x={COURT_WIDTH / 2} ancho={LINE_THICKNESS} profundidad={COURT_LENGTH} />
    <Linea x={-COURT_WIDTH / 2} ancho={LINE_THICKNESS} profundidad={COURT_LENGTH} />
  </group>
);

// 6 pelotas estáticas sobre la línea central, en las distancias reglamentarias
const RADIO_PELOTA = 0.09; // diámetro real 18cm
// Distancias medidas desde un extremo de la línea central (0 a 9m); se centran restando la mitad del ancho
const DISTANCIAS_PELOTAS = [1, 2.7, 3, 6, 6.3, 8];

const Pelotas: React.FC = () => (
  <group>
    {DISTANCIAS_PELOTAS.map((d, i) => (
      <mesh key={i} castShadow receiveShadow position={[d - COURT_WIDTH / 2, RADIO_PELOTA, 0]}>
        <sphereGeometry args={[RADIO_PELOTA, 24, 24]} />
        <meshStandardMaterial color="#ff6b35" roughness={0.45} metalness={0.05} />
      </mesh>
    ))}
  </group>
);

// Piso simple de la plaza/club, sin tribunas: un rectángulo de tierra/cemento alrededor de la cancha
const Piso: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 0]}>
    <planeGeometry args={[PISO_ANCHO, PISO_LARGO]} />
    <meshStandardMaterial color="#7a6a52" roughness={0.95} />
  </mesh>
);

// Poste de luz simple, como los que iluminan una cancha de barrio/club (no un reflector de estadio)
const PosteDeLuz: React.FC<{ x: number; z: number }> = ({ x, z }) => (
  <group position={[x, 0, z]}>
    <mesh position={[0, 2.4, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.08, 4.8, 8]} />
      <meshStandardMaterial color="#4b4238" roughness={0.7} metalness={0.2} />
    </mesh>
    <mesh position={[0, 4.85, 0]} castShadow>
      <sphereGeometry args={[0.18, 12, 12]} />
      <meshStandardMaterial color="#ffe0a3" emissive="#ffcf7a" emissiveIntensity={1.4} toneMapped={false} />
    </mesh>
    <pointLight position={[0, 4.7, 0]} color="#ffcf8a" intensity={12} distance={16} decay={2} castShadow={false} />
  </group>
);

// Postes en las 4 esquinas del terreno, apenas fuera del piso
const POSTES: [number, number][] = [
  [PISO_ANCHO / 2 - 0.6, PISO_LARGO / 2 - 0.6],
  [-(PISO_ANCHO / 2 - 0.6), PISO_LARGO / 2 - 0.6],
  [PISO_ANCHO / 2 - 0.6, -(PISO_LARGO / 2 - 0.6)],
  [-(PISO_ANCHO / 2 - 0.6), -(PISO_LARGO / 2 - 0.6)],
];

const PostesDeLuz: React.FC = () => (
  <>
    {POSTES.map(([x, z], i) => (
      <PosteDeLuz key={i} x={x} z={z} />
    ))}
  </>
);

// Cámara con órbita lenta y automática, más cerca de la cancha ahora que no hay tribunas de fondo que mostrar
const CamaraOrbital: React.FC = () => {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime() * 0.06;
    const radio = 15;
    camera.position.set(Math.sin(t) * radio, 6, Math.cos(t) * radio);
    camera.lookAt(0, 0.5, 0);
  });
  return null;
};

const EstadioTemploScene: React.FC = () => {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, powerPreference: 'low-power' }}
      camera={{ fov: 46, position: [0, 6, 15] }}
    >
      <color attach="background" args={['#241e18']} />
      <fog attach="fog" args={['#241e18', 14, 34]} />
      <ambientLight intensity={0.5} color="#ffe3bb" />
      <hemisphereLight args={['#ffcf8a', '#1a140f', 0.55]} />
      <Piso />
      <Cancha />
      <Pelotas />
      <PostesDeLuz />
      <CamaraOrbital />
    </Canvas>
  );
};

export default EstadioTemploScene;
