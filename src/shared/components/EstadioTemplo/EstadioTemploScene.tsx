import React, { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

const COURT_WIDTH = 9; // ancho (x)
const COURT_LENGTH = 18; // largo total (z)
const HALF = COURT_LENGTH / 2; // 9 -> cada mitad es un cuadrado 9x9
const HABILITACION_DIST = 3; // línea de habilitación, a 3m de la central
const LINE_THICKNESS = 0.08;

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
const RADIO_PELOTA = 0.28;
// Distancias medidas desde un extremo de la línea central (0 a 9m); se centran restando la mitad del ancho
const DISTANCIAS_PELOTAS = [1, 2.8, 3, 6, 6.2, 8];

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

// Tribunas: filas escalonadas a cada lado de la cancha, con acento de luz sutil
const Tribuna: React.FC<{ lado: 1 | -1 }> = ({ lado }) => {
  const filas = 5;
  const bloques = useMemo(() => {
    const arr: { x: number; y: number; z: number; h: number }[] = [];
    for (let i = 0; i < filas; i++) {
      arr.push({
        x: lado * (COURT_WIDTH / 2 + 1.2 + i * 0.9),
        y: 0.35 + i * 0.7,
        z: 0,
        h: 0.7 + i * 0.05,
      });
    }
    return arr;
  }, [lado]);

  const colorAcento = lado === 1 ? '#4b5a8f' : '#8a5a45';
  const ultimaFila = bloques[bloques.length - 1];

  return (
    <group>
      {bloques.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} castShadow receiveShadow>
          <boxGeometry args={[0.9, b.h, COURT_LENGTH + 2]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#1e293b' : '#334155'} roughness={0.85} metalness={0.1} />
        </mesh>
      ))}
      {/* Franja de luz decorativa, sutil, al pie de la tribuna */}
      <mesh position={[lado * (COURT_WIDTH / 2 + 0.7), 0.06, 0]}>
        <boxGeometry args={[0.18, 0.1, COURT_LENGTH + 2]} />
        <meshStandardMaterial color={colorAcento} emissive={colorAcento} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      {/* Franja de luz decorativa en la fila más alta */}
      <mesh position={[ultimaFila.x, ultimaFila.y + ultimaFila.h / 2 + 0.06, 0]}>
        <boxGeometry args={[0.95, 0.1, COURT_LENGTH + 2]} />
        <meshStandardMaterial color={colorAcento} emissive={colorAcento} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      {/* Luz de acento tenue */}
      {[-6, 0, 6].map((z, i) => (
        <pointLight
          key={i}
          position={[lado * (COURT_WIDTH / 2 + 2.5), 3.2, z]}
          color={colorAcento}
          intensity={6}
          distance={7}
        />
      ))}
    </group>
  );
};

// Reflectores de estadio en las 4 esquinas
const LucesEstadio: React.FC = () => {
  const posiciones: [number, number, number][] = [
    [COURT_WIDTH / 2 + 5, 9, COURT_LENGTH / 2 + 2],
    [-(COURT_WIDTH / 2 + 5), 9, COURT_LENGTH / 2 + 2],
    [COURT_WIDTH / 2 + 5, 9, -(COURT_LENGTH / 2 + 2)],
    [-(COURT_WIDTH / 2 + 5), 9, -(COURT_LENGTH / 2 + 2)],
  ];

  return (
    <>
      {posiciones.map((pos, i) => (
        <spotLight
          key={i}
          position={pos}
          angle={0.65}
          penumbra={0.7}
          intensity={110}
          distance={32}
          color="#f5f7ff"
          castShadow={i === 0}
          target-position={[0, 0, 0]}
        />
      ))}
    </>
  );
};

// Cámara con órbita lenta y automática alrededor del estadio
const CamaraOrbital: React.FC = () => {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime() * 0.06;
    const radio = 17;
    camera.position.set(Math.sin(t) * radio, 8, Math.cos(t) * radio);
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
      camera={{ fov: 45, position: [0, 8, 17] }}
    >
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 22, 48]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#6b82ff', '#0b1020', 0.65]} />
      <LucesEstadio />
      <Cancha />
      <Pelotas />
      <Tribuna lado={1} />
      <Tribuna lado={-1} />
      <CamaraOrbital />
    </Canvas>
  );
};

export default EstadioTemploScene;
