import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, OrthographicCamera } from 'three';
import {
  ANCHO,
  FORMATOS,
  GROSOR_LINEA,
  LARGO,
  MEDIO_ANCHO,
  MEDIO_LARGO,
  Z_COLA,
  Z_SHAGGERS,
  DURACIONES,
  type CourtMode,
  type Formato,
} from './constants';
import { calcularFrame, MAX_JUGADORES, MAX_PELOTAS, type JugadorFrame } from './escenas';

// Ancho de mundo (en metros) que entra en la escena. La cámara ajusta el zoom al tamaño real
// del canvas para que el encuadre sea el mismo en cualquier pantalla.
const ANCHO_VISTA = 22.5;

const COLORES = {
  rojo: '#dc2626',
  azul: '#2563eb',
  // Los shaggers llevan el color del equipo en una variante más clara: mismo bando, otro rol.
  shaggerRojo: '#f87171',
  shaggerAzul: '#60a5fa',
  eliminado: '#94a3b8',
  piel: '#e8edf4',
  pelotaActiva: '#f97316',
  pelotaSinActivar: '#fcd34d',
  pelotaMuerta: '#cbd5e1',
};

const colorCuerpo = (j: JugadorFrame) => {
  if (j.estado === 'eliminado') return COLORES.eliminado;
  if (j.estado === 'shagger') return j.equipo === 'rojo' ? COLORES.shaggerRojo : COLORES.shaggerAzul;
  return j.equipo === 'rojo' ? COLORES.rojo : COLORES.azul;
};

const colorMarca = (duenio: 'rojo' | 'azul' | 'libre') =>
  duenio === 'rojo' ? '#ef4444' : duenio === 'azul' ? '#3b82f6' : '#94a3b8';

/**
 * Cámara ortográfica fija, arriba y algo adelante: se ve toda la cancha de una pero con
 * suficiente inclinación para distinguir la cabeza y las manos de cada jugador.
 */
const CamaraFija: React.FC = () => {
  const { camera, size } = useThree();
  useEffect(() => {
    camera.position.set(0, 15.5, 12);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0.6);
    const orto = camera as OrthographicCamera;
    orto.zoom = size.width / ANCHO_VISTA;
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
};

const Linea: React.FC<{ x?: number; z?: number; largoX: number; largoZ: number; color?: string }> = ({
  x = 0,
  z = 0,
  largoX,
  largoZ,
  color = '#ffffff',
}) => (
  <mesh position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[largoX, largoZ]} />
    <meshBasicMaterial color={color} />
  </mesh>
);

const Zona: React.FC<{ x: number; z: number; largoX: number; largoZ: number; color: string }> = ({
  x,
  z,
  largoX,
  largoZ,
  color,
}) => (
  <mesh position={[x, 0.006, z]} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[largoX, largoZ]} />
    <meshBasicMaterial color={color} />
  </mesh>
);

const Rotulo: React.FC<{ x: number; z: number; className: string; children: React.ReactNode }> = ({
  x,
  z,
  className,
  children,
}) => (
  <Html position={[x, 0, z]} center style={{ pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>
    <span className={className}>{children}</span>
  </Html>
);

// Memoizados: la nota cambia varias veces por vuelta y re-renderiza la página entera. Sin memo,
// eso volvería a montar los refs de todas las mallas en cada cambio de texto.
const Cancha: React.FC<{ formato: Formato; mostrarActivacion: boolean }> = React.memo(({ formato, mostrarActivacion }) => {
  const spec = FORMATOS[formato];
  return (
    <group>
      <Zona x={-MEDIO_LARGO / 2} z={0} largoX={MEDIO_LARGO} largoZ={ANCHO} color="#fbdada" />
      <Zona x={MEDIO_LARGO / 2} z={0} largoX={MEDIO_LARGO} largoZ={ANCHO} color="#d9e4fb" />

      <Linea x={-MEDIO_LARGO} largoX={GROSOR_LINEA} largoZ={ANCHO} />
      <Linea x={MEDIO_LARGO} largoX={GROSOR_LINEA} largoZ={ANCHO} />
      <Linea z={-MEDIO_ANCHO} largoX={LARGO} largoZ={GROSOR_LINEA} />
      <Linea z={MEDIO_ANCHO} largoX={LARGO} largoZ={GROSOR_LINEA} />
      <Linea x={0} largoX={GROSOR_LINEA * 1.8} largoZ={ANCHO} color="#312e81" />

      {mostrarActivacion && (
        <>
          <Linea x={-spec.activacion} largoX={GROSOR_LINEA * 1.4} largoZ={ANCHO} color="#b91c1c" />
          <Linea x={spec.activacion} largoX={GROSOR_LINEA * 1.4} largoZ={ANCHO} color="#1d4ed8" />
          {/* Abajo, entre la línea lateral y las colas: arriba chocaban con los shaggers. */}
          <Rotulo x={-spec.activacion} z={MEDIO_ANCHO + 0.5} className="text-[9px] font-bold text-red-700">
            {spec.nombreLinea}
          </Rotulo>
          <Rotulo x={spec.activacion} z={MEDIO_ANCHO + 0.5} className="text-[9px] font-bold text-blue-700">
            {spec.nombreLinea}
          </Rotulo>
        </>
      )}

      {/* Cola de eliminados: una por equipo, las dos del mismo lado de la cancha (Rule 1.4.3). */}
      <Zona x={-6.7} z={Z_COLA} largoX={4.7} largoZ={1.2} color="#fecdd3" />
      <Zona x={6.7} z={Z_COLA} largoX={4.7} largoZ={1.2} color="#c7d8fb" />

      <Rotulo x={-10} z={0} className="text-[10px] font-black tracking-wide text-red-700">
        ROJO
      </Rotulo>
      <Rotulo x={10} z={0} className="text-[10px] font-black tracking-wide text-blue-700">
        AZUL
      </Rotulo>
      <Rotulo x={-6.7} z={Z_COLA + 1.5} className="text-[9px] font-bold text-slate-500">
        cola
      </Rotulo>
      <Rotulo x={6.7} z={Z_COLA + 1.5} className="text-[9px] font-bold text-slate-500">
        cola
      </Rotulo>
      <Rotulo x={0} z={Z_SHAGGERS - 1.1} className="text-[9px] font-bold text-slate-400">
        shaggers
      </Rotulo>
    </group>
  );
});
Cancha.displayName = 'Cancha';

interface SlotJugador {
  grupo: Group | null;
  cuerpo: MeshStandardMaterial | null;
  manoA: Mesh | null;
  manoB: Mesh | null;
}

interface SlotPelota {
  grupo: Group | null;
  esfera: Mesh | null;
  material: MeshStandardMaterial | null;
  marca: MeshBasicMaterial | null;
}

interface ActoresProps {
  mode: CourtMode;
  formato: Formato;
  corriendo: boolean;
  reinicio: number;
  onNota: (nota: string) => void;
}

const Actores: React.FC<ActoresProps> = React.memo(({ mode, formato, corriendo, reinicio, onNota }) => {
  const jugadores = useRef<SlotJugador[]>(
    Array.from({ length: MAX_JUGADORES }, () => ({ grupo: null, cuerpo: null, manoA: null, manoB: null }))
  );
  const pelotas = useRef<SlotPelota[]>(
    Array.from({ length: MAX_PELOTAS }, () => ({ grupo: null, esfera: null, material: null, marca: null }))
  );
  const reloj = useRef(0);
  const ultimaNota = useRef('');

  useEffect(() => {
    reloj.current = 0;
    ultimaNota.current = '';
  }, [mode, formato, reinicio]);

  useFrame((_, delta) => {
    if (corriendo) reloj.current = (reloj.current + delta) % DURACIONES[mode];
    const frame = calcularFrame(mode, reloj.current, formato);

    jugadores.current.forEach((slot, i) => {
      if (!slot.grupo) return;
      const j = frame.jugadores[i];
      if (!j) {
        slot.grupo.visible = false;
        return;
      }
      slot.grupo.visible = true;
      slot.grupo.position.set(j.x, 0, j.z);
      // El grupo rota para que el eje local +Z apunte hacia el rival: así las manos
      // siempre se estiran hacia adelante, sea cual sea el equipo.
      slot.grupo.rotation.y = j.mira === 1 ? Math.PI / 2 : -Math.PI / 2;
      const base = j.estado === 'shagger' ? 0.85 : 1;
      const escala = base * (1 + j.pulso * 0.3);
      slot.grupo.scale.set(escala, escala, escala);
      slot.cuerpo?.color.set(colorCuerpo(j));

      const alcance = 0.24 + j.manos * 0.55;
      const apertura = 0.6 - j.manos * 0.2;
      const alto = 0.62 + j.manos * 0.12;
      slot.manoA?.position.set(-apertura, alto, alcance);
      slot.manoB?.position.set(apertura, alto, alcance);
    });

    pelotas.current.forEach((slot, i) => {
      if (!slot.grupo) return;
      const p = frame.pelotas[i];
      if (!p) {
        slot.grupo.visible = false;
        return;
      }
      slot.grupo.visible = true;
      slot.grupo.position.set(p.x, 0, p.z);
      if (slot.esfera) slot.esfera.position.y = 0.3 + p.y;
      slot.material?.color.set(
        p.muerta ? COLORES.pelotaMuerta : p.activada ? COLORES.pelotaActiva : COLORES.pelotaSinActivar
      );
      slot.marca?.color.set(colorMarca(p.duenio));
    });

    if (frame.nota !== ultimaNota.current) {
      ultimaNota.current = frame.nota;
      onNota(frame.nota);
    }
  });

  return (
    <group>
      {jugadores.current.map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <group key={i} visible={false} ref={(el) => { jugadores.current[i].grupo = el; }}>
          {/* Cuerpo ovalado, pintado con el color del equipo. Las proporciones están exageradas
              a propósito: a escala real un jugador sería de 3 px en una cancha de 18 m. */}
          <mesh position={[0, 0.54, 0]} scale={[0.5, 0.55, 0.5]}>
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial
              roughness={0.55}
              metalness={0.05}
              ref={(el) => { jugadores.current[i].cuerpo = el; }}
            />
          </mesh>
          {/* Cabeza */}
          <mesh position={[0, 1.18, 0.06]}>
            <sphereGeometry args={[0.27, 18, 14]} />
            <meshStandardMaterial color={COLORES.piel} roughness={0.6} />
          </mesh>
          {/* Manos: quedan por fuera del ancho del cuerpo para que se vean desde arriba, y se
              estiran hacia adelante para agarrar, tirar, atajar o bloquear. */}
          <mesh ref={(el) => { jugadores.current[i].manoA = el; }} position={[-0.6, 0.62, 0.24]}>
            <sphereGeometry args={[0.17, 14, 12]} />
            <meshStandardMaterial color={COLORES.piel} roughness={0.6} />
          </mesh>
          <mesh ref={(el) => { jugadores.current[i].manoB = el; }} position={[0.6, 0.62, 0.24]}>
            <sphereGeometry args={[0.17, 14, 12]} />
            <meshStandardMaterial color={COLORES.piel} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {pelotas.current.map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <group key={i} visible={false} ref={(el) => { pelotas.current[i].grupo = el; }}>
          <mesh ref={(el) => { pelotas.current[i].esfera = el; }} position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.3, 18, 14]} />
            <meshStandardMaterial roughness={0.4} ref={(el) => { pelotas.current[i].material = el; }} />
          </mesh>
          {/* Marca en el piso: hace de sombra y dice de qué equipo es esa pelota */}
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.32, 20]} />
            <meshBasicMaterial transparent opacity={0.4} ref={(el) => { pelotas.current[i].marca = el; }} />
          </mesh>
        </group>
      ))}
    </group>
  );
});
Actores.displayName = 'Actores';

interface Court3DSceneProps {
  mode: CourtMode;
  formato: Formato;
  corriendo: boolean;
  reinicio: number;
  onNota: (nota: string) => void;
}

export const Court3DScene: React.FC<Court3DSceneProps> = ({ mode, formato, corriendo, reinicio, onNota }) => (
  <Canvas orthographic camera={{ zoom: 26, position: [0, 15.5, 12] }} dpr={[1, 1.75]}>
    <color attach="background" args={['#ffffff']} />
    <ambientLight intensity={1.15} />
    <directionalLight position={[5, 12, 9]} intensity={0.85} />
    <directionalLight position={[-6, 8, -4]} intensity={0.25} />
    <CamaraFija />
    <Cancha formato={formato} mostrarActivacion={mode === 'apertura'} />
    <Actores mode={mode} formato={formato} corriendo={corriendo} reinicio={reinicio} onNota={onNota} />
  </Canvas>
);

export default Court3DScene;
