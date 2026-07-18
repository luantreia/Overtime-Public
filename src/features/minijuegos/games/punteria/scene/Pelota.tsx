import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { RigidBody, type RapierRigidBody } from '@react-three/rapier';
import {
  BALL_DENSITY,
  BALL_RADIUS,
  BALL_READY_POSITION,
  HALF,
  MAGNUS_COEFFICIENT,
  MAX_FLIGHT_TIME,
  MAX_MAGNUS_FORCE,
  SPIN_ANGULAR_DAMPING,
} from '../engine/constants';

export interface ThrowRequest {
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
}

interface PelotaProps {
  activo: boolean;
  throwRequestRef: React.MutableRefObject<ThrowRequest | null>;
  hitSignalRef: React.MutableRefObject<number>;
}

type Estado = 'ready' | 'flying' | 'resetting';

const FUERA_DE_LIMITES = (p: { x: number; y: number; z: number }): boolean =>
  Math.abs(p.x) > 6 || p.z > HALF + 3 || p.z < -HALF - 3 || p.y < -2;

const Pelota: React.FC<PelotaProps> = ({ activo, throwRequestRef, hitSignalRef }) => {
  const rbRef = useRef<RapierRigidBody>(null);
  const estadoRef = useRef<Estado>('ready');
  const flightStartRef = useRef(0);
  const resetAtRef = useRef(0);
  const lastHitSignalRef = useRef(hitSignalRef.current);
  const relojRef = useRef(0);

  const resetear = () => {
    const rb = rbRef.current;
    if (!rb) return;
    rb.setTranslation({ x: BALL_READY_POSITION[0], y: BALL_READY_POSITION[1], z: BALL_READY_POSITION[2] }, true);
    rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
    rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
    estadoRef.current = 'ready';
  };

  useFrame((_, delta) => {
    const rb = rbRef.current;
    if (!rb) return;
    relojRef.current += delta;

    if (!activo) {
      if (estadoRef.current !== 'ready') resetear();
      return;
    }

    // Consumir un pedido de tiro pendiente (solo si la pelota está lista)
    const pedido = throwRequestRef.current;
    if (pedido && estadoRef.current === 'ready') {
      throwRequestRef.current = null;
      rb.setLinvel({ x: pedido.velocity[0], y: pedido.velocity[1], z: pedido.velocity[2] }, true);
      rb.setAngvel(
        { x: pedido.angularVelocity[0], y: pedido.angularVelocity[1], z: pedido.angularVelocity[2] },
        true
      );
      estadoRef.current = 'flying';
      flightStartRef.current = relojRef.current;
    } else if (pedido) {
      // Había un pedido pero la pelota no estaba lista: se descarta
      throwRequestRef.current = null;
    }

    if (estadoRef.current === 'flying') {
      // Fuerza de Magnus: F = k * (angularVelocity x linearVelocity) -> curva la trayectoria ("efecto").
      // Clampeada a un tope físico: es una desviación sutil, no una fuerza que redirige el tiro.
      const angVel = rb.angvel();
      const linVel = rb.linvel();
      const magnusForce = new THREE.Vector3(angVel.x, angVel.y, angVel.z)
        .cross(new THREE.Vector3(linVel.x, linVel.y, linVel.z))
        .multiplyScalar(MAGNUS_COEFFICIENT);
      if (magnusForce.length() > MAX_MAGNUS_FORCE) {
        magnusForce.setLength(MAX_MAGNUS_FORCE);
      }
      rb.applyImpulse(magnusForce.multiplyScalar(delta), true);

      const pos = rb.translation();
      const tiempoDeVuelo = relojRef.current - flightStartRef.current;
      if (tiempoDeVuelo > MAX_FLIGHT_TIME || FUERA_DE_LIMITES(pos)) {
        estadoRef.current = 'resetting';
        resetAtRef.current = relojRef.current;
      }
    }

    // Un objetivo fue impactado: programar el reseteo (con un pequeño delay para que se vea el acierto)
    if (hitSignalRef.current !== lastHitSignalRef.current) {
      lastHitSignalRef.current = hitSignalRef.current;
      if (estadoRef.current === 'flying') {
        estadoRef.current = 'resetting';
        resetAtRef.current = relojRef.current + 0.18;
      }
    }

    if (estadoRef.current === 'resetting' && relojRef.current >= resetAtRef.current) {
      resetear();
    }
  });

  return (
    <RigidBody
      ref={rbRef}
      colliders="ball"
      density={BALL_DENSITY}
      angularDamping={SPIN_ANGULAR_DAMPING}
      restitution={0.55}
      friction={0.5}
      ccd
      position={BALL_READY_POSITION}
    >
      <mesh castShadow>
        <sphereGeometry args={[BALL_RADIUS, 24, 24]} />
        <meshStandardMaterial color="#ff6b35" roughness={0.45} metalness={0.05} />
      </mesh>
    </RigidBody>
  );
};

export default Pelota;
