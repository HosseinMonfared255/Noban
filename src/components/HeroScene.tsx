"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* Heartbeat envelope — two thumps (lub-dub) per ~1.3s cycle */
function beat(t: number) {
  const p = (t % 1.3) / 1.3;
  const lub = 0.3 * Math.exp(-Math.pow((p - 0.06) / 0.05, 2));
  const dub = 0.18 * Math.exp(-Math.pow((p - 0.24) / 0.05, 2));
  return 1 + lub + dub;
}

/* Expanding pulse ring — heartbeat ripple */
function PulseRing({
  position,
  color,
  delay = 0,
  duration = 2.6,
}: {
  position: [number, number, number];
  color: string;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = ((state.clock.elapsedTime + delay) % duration) / duration;
    if (ref.current) {
      const s = 0.5 + t * 5;
      ref.current.scale.set(s, s, s);
      (ref.current.material as THREE.MeshBasicMaterial).opacity =
        (1 - t) * 0.34;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <ringGeometry args={[0.6, 0.7, 24]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* Glowing medical cross (＋) that drifts, rotates and pulses with the heartbeat */
function Cross({
  position,
  color,
  scale = 1,
  speed = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const mat = useMemo(
    () => ({
      color,
      emissive: color,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.85,
    }),
    [color]
  );
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const b = beat(t * speed * 0.9 + position[0]);
    if (ref.current) {
      ref.current.rotation.y = t * 0.4 * speed;
      ref.current.rotation.z = Math.sin(t * 0.6 * speed) * 0.5;
      ref.current.position.y = position[1] + Math.sin(t * 0.5 * speed) * 0.6;
      ref.current.scale.setScalar(scale * b);
    }
  });
  return (
    <group ref={ref} position={position}>
      <mesh>
        <boxGeometry args={[0.24, 0.85, 0.24]} />
        <meshStandardMaterial {...mat} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.85, 0.24, 0.24]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  );
}

/* Simple sphere (replaced expensive MeshDistortMaterial) */
function Cell({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        transparent
        opacity={0.5}
      />
    </mesh>
  );
}

/* Gentle drifting particles — reduced count */
function Particles({ count = 24 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 24;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16;
    }
    return arr;
  }, [count]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.015;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color="#0891b2"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/**
 * Ambient, blurred medical background — PERFORMANCE OPTIMIZED.
 * - Removed MeshDistortMaterial (was the #1 perf killer — custom vertex shader)
 * - Reduced particle count 64 → 24
 * - Reduced sphere segments 32 → 16
 * - Reduced ring segments 48 → 24
 * - Removed 1 point light (2 → 1)
 * - Lowered DPR cap 1.1 → 0.8
 * - Reduced Cross count 4 → 2
 * - frameloop pauses when off-screen / scrolling (handled by parent)
 */
export default function HeroScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 9], fov: 45 }}
      dpr={[0.5, 0.8]}
      frameloop={active ? "always" : "never"}
      gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
    >
      <fog attach="fog" args={["#eef6fb", 9, 22]} />
      <ambientLight intensity={1} />
      <hemisphereLight args={["#ffffff", "#bae6fd", 0.8]} />
      <directionalLight position={[4, 6, 5]} intensity={1.3} color="#ffffff" />
      <pointLight position={[-6, -2, 3]} intensity={20} color="#67e8f9" />

      <PulseRing position={[1.5, -0.4, -0.6]} color="#22d3ee" delay={0} />
      <PulseRing position={[-1.7, 0.9, -1.1]} color="#3b82f6" delay={0.9} />

      <Cross position={[-3.4, 1.6, -0.8]} color="#22d3ee" scale={0.95} speed={1.0} />
      <Cross position={[3.7, -1.1, -1.1]} color="#3b82f6" scale={0.75} speed={1.3} />

      <Cell position={[-2.6, 0.3, -3]} color="#bae6fd" scale={1.5} />

      <Particles />
    </Canvas>
  );
}
