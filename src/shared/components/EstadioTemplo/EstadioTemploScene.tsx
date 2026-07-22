import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const COURT_WIDTH = 9; // ancho (x)
const COURT_LENGTH = 18; // largo total (z)
const HALF = COURT_LENGTH / 2; // 9 -> cada mitad es un cuadrado 9x9
const HABILITACION_DIST = 3; // línea de habilitación, a 3m de la central
const LINE_THICKNESS = 0.08;

// Geometría de las tribunas (usada para armar el anillo completo alrededor de la cancha)
const ANCHO_FILA = 1.0;
const FILAS = 4;
const GROOVE = 0.06; // separación entre escalones, para que se note el corte de cada fila
// Separación cancha -> primera fila: como en un estadio de tenis/vóley, más espacio detrás de las líneas de fondo que a los costados
const GAP_LATERAL = 3;
const GAP_FRONTAL = 5;
const EXTENSION_TRIBUNA = FILAS * ANCHO_FILA;
const ALCANCE_LATERAL = COURT_WIDTH / 2 + GAP_LATERAL + EXTENSION_TRIBUNA; // hasta dónde llegan las tribunas laterales (eje x)
const ALCANCE_FRONTAL = HALF + GAP_FRONTAL + EXTENSION_TRIBUNA; // hasta dónde llegan las tribunas de fondo/frente (eje z)

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

// Textura procedural de gradas (franjas que marcan cada fila de asientos). Se genera una sola vez y se reutiliza.
let texturaGradasCache: THREE.Texture | null = null;
const obtenerTexturaGradas = (): THREE.Texture => {
  if (texturaGradasCache) return texturaGradasCache;
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    const subFilas = 4;
    const alto = 32 / subFilas;
    for (let i = 0; i < subFilas; i++) {
      ctx.fillRect(0, i * alto + alto - 5, 32, 5);
    }
  }
  const textura = new THREE.CanvasTexture(canvas);
  textura.wrapS = THREE.RepeatWrapping;
  textura.wrapT = THREE.RepeatWrapping;
  textura.repeat.set(10, 2);
  texturaGradasCache = textura;
  return textura;
};

// Objeto dummy reutilizado para calcular las matrices de cada instancia (evita crear uno por frame/bloque)
const dummy = new THREE.Object3D();

type OrientacionTribuna = 'lateral' | 'frontal';

// Tribunas: filas escalonadas, reutilizable para los 4 lados de la cancha (anillo completo).
// Los escalones se dibujan con un único InstancedMesh (1 draw call por tribuna en vez de 1 por fila).
const Tribuna: React.FC<{ lado: 1 | -1; orientacion: OrientacionTribuna }> = ({ lado, orientacion }) => {
  const esLateral = orientacion === 'lateral';
  const gap = esLateral ? GAP_LATERAL : GAP_FRONTAL;
  const baseOffset = (esLateral ? COURT_WIDTH : COURT_LENGTH) / 2 + gap;
  const longitudFila = esLateral ? ALCANCE_FRONTAL * 2 : ALCANCE_LATERAL * 2;
  const texturaGradas = useMemo(() => obtenerTexturaGradas(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const bloques = useMemo(() => {
    const arr: { offset: number; y: number; h: number }[] = [];
    let pisoActual = 0;
    for (let i = 0; i < FILAS; i++) {
      const h = 0.75 + i * 0.1;
      const y = pisoActual + h / 2;
      arr.push({ offset: baseOffset + i * ANCHO_FILA, y, h });
      pisoActual += h + GROOVE;
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseOffset]);

  const colorAcento = orientacion === 'lateral' ? (lado === 1 ? '#4b5a8f' : '#8a5a45') : '#5a7a6f';
  const ultimaFila = bloques[bloques.length - 1];
  // Degradé: más oscuro abajo, más claro arriba -> refuerza la lectura de cada escalón
  const paletaFilas = ['#0f172a', '#1e293b', '#334155', '#475569', '#5b6b85'];

  const posicion = (offset: number, y: number): [number, number, number] =>
    esLateral ? [lado * offset, y, 0] : [0, y, lado * offset];
  const tamanoBloque = (h: number): [number, number, number] =>
    esLateral ? [ANCHO_FILA, h, longitudFila] : [longitudFila, h, ANCHO_FILA];

  // Volcamos posición/escala/color de cada fila a la instancia correspondiente del InstancedMesh
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    bloques.forEach((b, i) => {
      dummy.position.set(...posicion(b.offset, b.y));
      dummy.scale.set(...tamanoBloque(b.h));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, new THREE.Color(paletaFilas[i % paletaFilas.length]));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bloques]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, bloques.length]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial map={texturaGradas} roughness={0.8} metalness={0.15} />
      </instancedMesh>
      {/* Franja de luz decorativa, sutil, al pie de la tribuna (pegada a la base del primer escalón) */}
      <mesh position={posicion(baseOffset - ANCHO_FILA / 2, 0.06)}>
        <boxGeometry args={esLateral ? [0.18, 0.1, longitudFila] : [longitudFila, 0.1, 0.18]} />
        <meshStandardMaterial color={colorAcento} emissive={colorAcento} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      {/* Franja de luz decorativa en la fila más alta */}
      <mesh position={posicion(ultimaFila.offset, ultimaFila.y + ultimaFila.h / 2 + 0.06)}>
        <boxGeometry args={esLateral ? [0.95, 0.1, longitudFila] : [longitudFila, 0.1, 0.95]} />
        <meshStandardMaterial color={colorAcento} emissive={colorAcento} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      {/* Luz de acento: una sola point light centrada por tribuna (antes 3) — el brillo extra ahora lo aporta el bloom */}
      <pointLight
        position={posicion(baseOffset + 1.3, 3.2)}
        color={colorAcento}
        intensity={5}
        distance={9}
      />
    </group>
  );
};

// Reflectores de estadio en las 4 esquinas, ahora fuera del anillo de tribunas.
// Cada uno apunta al centro de SU mitad de cancha (no los 4 al mismo punto), para que los haces no se amontonen.
const ANGULO_REFLECTOR = 0.32;
const REFLECTORES: { origen: [number, number, number]; destino: [number, number, number] }[] = [
  { origen: [ALCANCE_LATERAL + 2, 11, ALCANCE_FRONTAL + 2], destino: [0, 0, HALF * 0.4] },
  { origen: [-(ALCANCE_LATERAL + 2), 11, ALCANCE_FRONTAL + 2], destino: [0, 0, HALF * 0.4] },
  { origen: [ALCANCE_LATERAL + 2, 11, -(ALCANCE_FRONTAL + 2)], destino: [0, 0, -HALF * 0.4] },
  { origen: [-(ALCANCE_LATERAL + 2), 11, -(ALCANCE_FRONTAL + 2)], destino: [0, 0, -HALF * 0.4] },
];

const LucesEstadio: React.FC = () => (
  <>
    {REFLECTORES.map(({ origen, destino }, i) => (
      <spotLight
        key={i}
        position={origen}
        target-position={destino}
        angle={ANGULO_REFLECTOR}
        penumbra={0.6}
        intensity={95}
        distance={38}
        color="#f5f7ff"
        castShadow={i === 0}
      />
    ))}
  </>
);

// Haz de luz volumétrico (cono semi-transparente, angosto) desde cada reflector hacia su objetivo
const HazDeLuz: React.FC<{ origen: [number, number, number]; destino: [number, number, number]; color?: string }> = ({
  origen,
  destino,
  color = '#dbe4ff',
}) => {
  const { posicion, cuaternion, altura, radio } = useMemo(() => {
    const o = new THREE.Vector3(...origen);
    const d = new THREE.Vector3(...destino);
    const direccion = new THREE.Vector3().subVectors(d, o);
    const altura = direccion.length();
    const posicion = new THREE.Vector3().addVectors(o, d).multiplyScalar(0.5);
    const arriba = new THREE.Vector3(0, 1, 0);
    const cuaternion = new THREE.Quaternion().setFromUnitVectors(arriba, direccion.clone().normalize().negate());
    // Radio angosto: una fracción del ancho real que ilumina el spotlight en el destino, no el cono completo
    const radio = altura * Math.tan(ANGULO_REFLECTOR) * 0.45;
    return { posicion, cuaternion, altura, radio };
  }, [origen, destino]);

  return (
    <mesh position={posicion} quaternion={cuaternion}>
      <coneGeometry args={[radio, altura, 16, 1, true]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.045}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const HacesDeLuz: React.FC = () => (
  <>
    {REFLECTORES.map(({ origen, destino }, i) => (
      <HazDeLuz key={i} origen={origen} destino={destino} />
    ))}
  </>
);

// Cámara con órbita lenta y automática, + parallax sutil según el mouse + dolly-in según cuánto
// de la escena está visible en el viewport (se acerca cuando el hero está más centrado en pantalla).
const CamaraOrbital: React.FC<{ visibilidadRef: React.MutableRefObject<number> }> = ({ visibilidadRef }) => {
  useFrame(({ clock, camera, pointer }) => {
    const t = clock.getElapsedTime() * 0.06;
    const radio = 22 - visibilidadRef.current * 3.5;
    const parallaxX = pointer.x * 1.5;
    const parallaxY = pointer.y * 0.8;
    camera.position.set(Math.sin(t) * radio + parallaxX, 8.5 + parallaxY, Math.cos(t) * radio);
    camera.lookAt(0, 0.5, 0);
  });
  return null;
};

const EstadioTemploScene: React.FC = () => {
  // dpr adaptativo: PerformanceMonitor (dentro del Canvas) sube/baja la resolución según el FPS real del dispositivo
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const visibilidadRef = useRef(1);

  useEffect(() => {
    const el = canvasElRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibilidadRef.current = entry.intersectionRatio;
      },
      { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Canvas
      ref={canvasElRef}
      shadows
      dpr={dpr}
      gl={{ antialias: true, powerPreference: 'low-power' }}
      camera={{ fov: 46, position: [0, 8.5, 22] }}
    >
      <PerformanceMonitor onIncline={() => setDpr([1, 1.5])} onDecline={() => setDpr([1, 1])} />
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', 26, 58]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#6b82ff', '#0b1020', 0.65]} />
      <LucesEstadio />
      <HacesDeLuz />
      <Cancha />
      <Pelotas />
      <Tribuna lado={1} orientacion="lateral" />
      <Tribuna lado={-1} orientacion="lateral" />
      <Tribuna lado={1} orientacion="frontal" />
      <Tribuna lado={-1} orientacion="frontal" />
      <CamaraOrbital visibilidadRef={visibilidadRef} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.15} luminanceSmoothing={0.9} intensity={0.6} />
      </EffectComposer>
    </Canvas>
  );
};

export default EstadioTemploScene;
