import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function ParticleNetwork({ activeColor = '#00f3ff' }) {
  const pointsRef = useRef();

  // Generate 1200 3D particle coordinates in a sphere
  const [positions, colors] = useMemo(() => {
    const count = 1200;
    const pos = new Float32Array(count * 3);
    const cols = new Float32Array(count * 3);
    const baseColor = new THREE.Color(activeColor);

    for (let i = 0; i < count; i++) {
      // Sphere distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 3 + Math.random() * 3.5;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      cols[i * 3] = baseColor.r;
      cols[i * 3 + 1] = baseColor.g;
      cols[i * 3 + 2] = baseColor.b;
    }
    return [pos, cols];
  }, [activeColor]);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x += delta * 0.08;
      pointsRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          vertexColors
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
}

function FloatingNodes() {
  const groupRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t / 4) * 0.3;
      groupRef.current.position.y = Math.sin(t / 2) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Central Cyber Core Wireframe Sphere */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.8, 2]} />
        <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.25} />
      </mesh>
      {/* Inner Glowing Core */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

export default function HeroCanvas({ activeColor = '#00f3ff' }) {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'auto' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={activeColor} />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <FloatingNodes />
        </Float>
        
        <ParticleNetwork activeColor={activeColor} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  );
}
