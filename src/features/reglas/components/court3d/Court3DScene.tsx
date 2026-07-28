import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Mesh } from 'three';
import { COURT_WIDTH, HALF, LINE_THICKNESS, RED_Z, BLUE_Z, type CourtMode } from './constants';

const HABILITACION_DIST = 3;

// Cámara ortográfica fija, mirando derecho hacia abajo -> vista "de arriba", cancha en vertical
// (X = ancho de 9m en horizontal de pantalla, Z = largo de 18m en vertical de pantalla).
const CamaraTopDown: React.FC = () => {
  const { camera } = useThree();
  useEffect(() => {
    camera.position.set(0, 20, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
};

const Linea: React.FC<{ x?: number; z?: number; ancho: number; profundidad: number; color?: string; dashed?: boolean }> = ({
  x = 0,
  z = 0,
  ancho,
  profundidad,
  color = '#f8fafc',
}) => (
  <mesh position={[x, 0.01, z]}>
    <boxGeometry args={[ancho, 0.01, profundidad]} />
    <meshBasicMaterial color={color} />
  </mesh>
);

const ColaBox: React.FC<{ x: number; zMin: number; zMax: number; color: string }> = ({ x, zMin, zMax, color }) => (
  <mesh position={[x, 0.005, (zMin + zMax) / 2]}>
    <boxGeometry args={[1.2, 0.005, Math.abs(zMax - zMin) - 0.6]} />
    <meshBasicMaterial color={color} transparent opacity={0.35} />
  </mesh>
);

// Sin distanceFactor: ese modo de drei calcula la escala a partir de camera.fov, que no
// existe en una cámara ortográfica (rompía el render de toda la escena). Sin él, el Html
// queda en tamaño de pantalla fijo (screen-space), que es justo lo que queremos acá.
const Emoji: React.FC<{ x: number; z: number; children: string; size?: number }> = ({ x, z, children, size = 20 }) => (
  <Html position={[x, 0.5, z]} center style={{ fontSize: size, pointerEvents: 'none', userSelect: 'none' }}>
    {children}
  </Html>
);

const Etiqueta: React.FC<{ x: number; z: number; children: React.ReactNode; className?: string }> = ({ x, z, children, className }) => (
  <Html position={[x, 0.5, z]} center style={{ pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>
    <span className={className}>{children}</span>
  </Html>
);

const CourtBase: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, RED_Z]}>
      <planeGeometry args={[COURT_WIDTH, HALF]} />
      <meshBasicMaterial color="#fecaca" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, BLUE_Z]}>
      <planeGeometry args={[COURT_WIDTH, HALF]} />
      <meshBasicMaterial color="#bfdbfe" />
    </mesh>
    <Linea z={0} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS * 2} color="#4338ca" />
    <Linea z={HALF} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    <Linea z={-HALF} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} />
    <Linea x={COURT_WIDTH / 2} ancho={LINE_THICKNESS} profundidad={HALF * 2} />
    <Linea x={-COURT_WIDTH / 2} ancho={LINE_THICKNESS} profundidad={HALF * 2} />

    <Etiqueta x={0} z={HALF + 1.4} className="text-xs font-black text-red-700">EQUIPO ROJO</Etiqueta>
    <Etiqueta x={0} z={-HALF - 1.4} className="text-xs font-black text-blue-700">EQUIPO AZUL</Etiqueta>

    <ColaBox x={COURT_WIDTH / 2 + 1} zMin={0.5} zMax={HALF - 0.5} color="#ef4444" />
    <ColaBox x={-COURT_WIDTH / 2 - 1} zMin={-HALF + 0.5} zMax={-0.5} color="#3b82f6" />
  </group>
);

const MedidasOverlay: React.FC = () => (
  <group>
    <Etiqueta x={COURT_WIDTH / 2 + 2.4} z={0} className="text-[11px] font-bold text-slate-600 [writing-mode:vertical-rl]">18 metros</Etiqueta>
    <Etiqueta x={0} z={HALF + 2.6} className="text-[11px] font-bold text-slate-600">9 metros de ancho</Etiqueta>
    <Etiqueta x={0} z={RED_Z} className="text-[10px] font-bold text-red-800">9m x 9m</Etiqueta>
    <Etiqueta x={0} z={BLUE_Z} className="text-[10px] font-bold text-blue-800">9m x 9m</Etiqueta>
  </group>
);

const EquiposOverlay: React.FC = () => {
  const xs = [-3.2, -1.9, -0.6, 0.6, 1.9, 3.2];
  return (
    <group>
      {xs.map((x, i) => <Emoji key={`r${i}`} x={x} z={HALF - 1.6}>🙋‍♂️</Emoji>)}
      {xs.map((x, i) => <Emoji key={`b${i}`} x={x} z={-HALF + 1.6}>🙋‍♀️</Emoji>)}
      {[-2.5, 0, 2.5].map((x, i) => <Emoji key={`sr${i}`} x={x} z={HALF + 1} size={16}>🏃</Emoji>)}
      {[-2.5, 0, 2.5].map((x, i) => <Emoji key={`sb${i}`} x={x} z={-HALF - 1} size={16}>🏃</Emoji>)}
      <Etiqueta x={0} z={HALF + 2.6} className="text-[10px] font-bold text-slate-500">6 en cancha · 3 shaggers afuera por equipo</Etiqueta>
    </group>
  );
};

// Pelota que flota suavemente arriba/abajo -> sugiere que está "viva", a la espera de que
// alguien la agarre (usado en la arrancada).
const BolaFlotante: React.FC<{ x: number; color: string; phase?: number }> = ({ x, color, phase = 0 }) => {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 0.22 + Math.sin(clock.elapsedTime * 2.2 + phase) * 0.07;
    }
  });
  return (
    <mesh ref={ref} position={[x, 0.22, 0]}>
      <sphereGeometry args={[0.28, 16, 16]} />
      <meshStandardMaterial color="#f59e0b" emissive={color} emissiveIntensity={0.35} />
    </mesh>
  );
};

// Pelota que pulsa (crece/achica) -> remarca el instante del impacto en la eliminación.
const BolaPulsante: React.FC<{ x: number; z: number }> = ({ x, z }) => {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 6) * 0.18;
      ref.current.scale.set(s, s, s);
    }
  });
  return (
    <mesh ref={ref} position={[x, 0.25, z]}>
      <sphereGeometry args={[0.25, 16, 16]} />
      <meshStandardMaterial color="#f59e0b" />
    </mesh>
  );
};

const AperturaOverlay: React.FC<{ formato: 'foam' | 'cloth' }> = ({ formato }) => {
  const total = formato === 'foam' ? 6 : 5;
  const spread = COURT_WIDTH - 1.6;
  const balls = useMemo(
    () => Array.from({ length: total }, (_, i) => -spread / 2 + (i * spread) / (total - 1)),
    [total, spread]
  );
  const mitad = Math.floor(total / 2);

  return (
    <group>
      <Linea z={HABILITACION_DIST} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} color="#b91c1c" />
      <Linea z={-HABILITACION_DIST} ancho={COURT_WIDTH} profundidad={LINE_THICKNESS} color="#1d4ed8" />
      <Etiqueta x={0} z={HABILITACION_DIST + 0.6} className="text-[9px] font-bold text-red-700">línea de habilitación</Etiqueta>
      <Etiqueta x={0} z={-HABILITACION_DIST - 0.6} className="text-[9px] font-bold text-blue-700">línea de habilitación</Etiqueta>

      {balls.map((x, i) => {
        const contested = total % 2 === 1 && i === mitad;
        const esDeRojo = i < mitad;
        const color = contested ? '#64748b' : esDeRojo ? '#b91c1c' : '#1d4ed8';
        return <BolaFlotante key={i} x={x} color={color} phase={i * 0.6} />;
      })}
      <Etiqueta x={0} z={HALF + 1.6} className="text-[10px] font-bold text-slate-600">
        {formato === 'foam' ? '6 pelotas de espuma' : '5 pelotas de tela'} sobre la línea central
      </Etiqueta>
    </group>
  );
};

const EliminadoOverlay: React.FC = () => (
  <group>
    <Emoji x={-2} z={RED_Z}>🙋‍♂️</Emoji>
    <Emoji x={2} z={BLUE_Z}>🙋‍♀️</Emoji>
    <BolaPulsante x={0} z={0} />
    <Etiqueta x={-2} z={RED_Z + 1.4} className="text-[10px] font-black text-red-700 animate-pulse">✗ eliminado</Etiqueta>
  </group>
);

const VolverOverlay: React.FC = () => (
  <group>
    <Emoji x={-2} z={RED_Z}>🙌</Emoji>
    <Emoji x={2} z={BLUE_Z}>🙋‍♀️</Emoji>
    <Etiqueta x={-2} z={RED_Z + 1.4} className="text-[10px] font-black text-blue-700 animate-pulse">¡atajada!</Etiqueta>
    <Emoji x={COURT_WIDTH / 2 + 1} z={HALF - 2}>🙋‍♂️</Emoji>
    <Etiqueta x={COURT_WIDTH / 2 + 1} z={HALF - 3.2} className="text-[9px] font-bold text-red-700 animate-bounce">vuelve ↩</Etiqueta>
  </group>
);

const GanaOverlay: React.FC = () => {
  const xsRojo = [-3, -1.5, 0, 1.5, 3];
  const xsAzul = [0];
  return (
    <group>
      {xsRojo.map((x, i) => <Emoji key={i} x={x} z={RED_Z}>🙋‍♂️</Emoji>)}
      {xsAzul.map((x, i) => <Emoji key={i} x={x} z={BLUE_Z}>🙋‍♀️</Emoji>)}
      <Etiqueta x={0} z={HALF + 1.6} className="text-[10px] font-black text-red-700 animate-bounce">🏆 Gana Rojo: más jugadores en cancha</Etiqueta>
    </group>
  );
};

interface Court3DSceneProps {
  mode: CourtMode;
  formato: 'foam' | 'cloth';
}

export const Court3DScene: React.FC<Court3DSceneProps> = ({ mode, formato }) => {
  const showMedidas = mode === 'inicio' || mode === 'cancha';
  return (
    <Canvas orthographic camera={{ zoom: 26, position: [0, 20, 0] }} dpr={[1, 1.5]}>
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={1} />
      <directionalLight position={[4, 10, 4]} intensity={0.4} />
      <CamaraTopDown />
      <CourtBase />
      {showMedidas && <MedidasOverlay />}
      {mode === 'equipos' && <EquiposOverlay />}
      {mode === 'apertura' && <AperturaOverlay formato={formato} />}
      {mode === 'eliminado' && <EliminadoOverlay />}
      {mode === 'volver' && <VolverOverlay />}
      {mode === 'gana' && <GanaOverlay />}
    </Canvas>
  );
};

export default Court3DScene;
