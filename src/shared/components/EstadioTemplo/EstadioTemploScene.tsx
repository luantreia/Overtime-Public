import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COURT_WIDTH = 9;
const COURT_LENGTH = 18;
const LINE_THICKNESS = 0.08;

// Cancha: dos mitades de color + línea central + borde
const Cancha: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[-COURT_WIDTH / 4, 0, 0]}>
      <planeGeometry args={[COURT_WIDTH / 2, COURT_LENGTH]} />
      <meshStandardMaterial color="#1f3188" roughness={0.85} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[COURT_WIDTH / 4, 0, 0]}>
      <planeGeometry args={[COURT_WIDTH / 2, COURT_LENGTH]} />
      <meshStandardMaterial color="#2b45db" roughness={0.85} />
    </mesh>
    {/* Línea central */}
    <mesh position={[0, 0.01, 0]}>
      <boxGeometry args={[LINE_THICKNESS, 0.01, COURT_LENGTH]} />
      <meshStandardMaterial color="#f5f7ff" />
    </mesh>
    {/* Borde de la cancha */}
    {[
      [0, 0.01, COURT_LENGTH / 2, COURT_WIDTH, LINE_THICKNESS],
      [0, 0.01, -COURT_LENGTH / 2, COURT_WIDTH, LINE_THICKNESS],
    ].map(([x, y, z, w, d], i) => (
      <mesh key={i} position={[x as number, y as number, z as number]}>
        <boxGeometry args={[w as number, 0.01, d as number]} />
        <meshStandardMaterial color="#f5f7ff" />
      </mesh>
    ))}
    {[
      [COURT_WIDTH / 2, 0.01, 0, LINE_THICKNESS, COURT_LENGTH],
      [-COURT_WIDTH / 2, 0.01, 0, LINE_THICKNESS, COURT_LENGTH],
    ].map(([x, y, z, w, d], i) => (
      <mesh key={`v-${i}`} position={[x as number, y as number, z as number]}>
        <boxGeometry args={[w as number, 0.01, d as number]} />
        <meshStandardMaterial color="#f5f7ff" />
      </mesh>
    ))}
  </group>
);

// Tribunas: filas escalonadas a cada lado de la cancha
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

  const colorAcento = lado === 1 ? '#7a90ff' : '#ff8a5b';
  const ultimaFila = bloques[bloques.length - 1];

  return (
    <group>
      {bloques.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, b.z]} castShadow receiveShadow>
          <boxGeometry args={[0.9, b.h, COURT_LENGTH + 2]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#1e293b' : '#334155'} roughness={0.85} metalness={0.1} />
        </mesh>
      ))}
      {/* Franja de luz decorativa al pie de la tribuna */}
      <mesh position={[lado * (COURT_WIDTH / 2 + 0.7), 0.06, 0]}>
        <boxGeometry args={[0.18, 0.1, COURT_LENGTH + 2]} />
        <meshStandardMaterial color={colorAcento} emissive={colorAcento} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      {/* Franja de luz decorativa en la fila más alta */}
      <mesh position={[ultimaFila.x, ultimaFila.y + ultimaFila.h / 2 + 0.06, 0]}>
        <boxGeometry args={[0.95, 0.1, COURT_LENGTH + 2]} />
        <meshStandardMaterial color={colorAcento} emissive={colorAcento} emissiveIntensity={3} toneMapped={false} />
      </mesh>
      {/* Luces de acento que bañan la tribuna de color */}
      {[-6, 0, 6].map((z, i) => (
        <pointLight
          key={i}
          position={[lado * (COURT_WIDTH / 2 + 2.5), 3.2, z]}
          color={colorAcento}
          intensity={18}
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

// Pelota rodando de un lado a otro de la cancha
const PelotaRodando: React.FC = () => {
  const ref = useRef<THREE.Mesh>(null);
  const radio = 0.28;

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const rango = COURT_LENGTH / 2 - 1;
    const z = Math.sin(t * 0.6) * rango;
    ref.current.position.set(0, radio, z);
    // Rotación proporcional al desplazamiento (efecto "rodando")
    const velocidadZ = Math.cos(t * 0.6) * 0.6 * rango;
    ref.current.rotation.x += (velocidadZ / radio) * 0.016;
  });

  return (
    <mesh ref={ref} castShadow position={[0, radio, 0]}>
      <sphereGeometry args={[radio, 32, 32]} />
      <meshStandardMaterial color="#ff6b35" roughness={0.4} metalness={0.05} />
    </mesh>
  );
};

// Cámara con órbita lenta y automática alrededor del estadio
const CamaraOrbital: React.FC = () => {
  useFrame(({ clock, camera }) => {
    const t = clock.getElapsedTime() * 0.08;
    const radio = 16;
    camera.position.set(Math.sin(t) * radio, 7.5, Math.cos(t) * radio);
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
      camera={{ fov: 45, position: [0, 7.5, 16] }}
    >
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 22, 48]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#6b82ff', '#0b1020', 0.65]} />
      <LucesEstadio />
      <Cancha />
      <Tribuna lado={1} />
      <Tribuna lado={-1} />
      <PelotaRodando />
      <CamaraOrbital />
    </Canvas>
  );
};

export default EstadioTemploScene;
