'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url }: { url: string }) {
  const { scene, animations } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(animations, scene);

  useEffect(() => {
    if (names.length > 0) {
      const idleAnim = names.find(n => n.toLowerCase().includes('idle'))
        || names.find(n => n.toLowerCase().includes('breath'))
        || names.find(n => n.toLowerCase().includes('stand'))
        || names[0];
      if (idleAnim && actions[idleAnim]) {
        actions[idleAnim].play();
      }
    }
  }, [actions, names]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    // Floating / bobbing
    groupRef.current.position.y = -0.8 + Math.sin(t * 1.2) * 0.04;

    // Subtle breathing scale
    const breathe = 1 + Math.sin(t * 1.8) * 0.008;
    groupRef.current.scale.set(breathe, breathe, breathe);

    // Very subtle tilt
    groupRef.current.rotation.z = Math.sin(t * 0.7) * 0.015;
  });

  return (
    <group ref={groupRef} position={[0, -0.8, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function Loader() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="avatar3d-spinner" />
      <style>{`.avatar3d-spinner { width: 32px; height: 32px; border-radius: 50%; border: 3px solid #f0f0f0; border-top-color: #FF385C; animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
}

interface Avatar3DProps {
  gender: string | null;
  className?: string;
}

export function Avatar3D({ gender, className }: Avatar3DProps) {
  const modelUrl = gender === 'female' ? '/models/girl.glb' : '/models/boy.glb';

  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Suspense fallback={<Loader />}>
        <Canvas
          camera={{ position: [0, 0.5, 3.5], fov: 35 }}
          style={{ background: 'transparent' }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={1.0} />
          <directionalLight position={[5, 5, 5]} intensity={1.2} />
          <directionalLight position={[-3, 3, -3]} intensity={0.5} color="#a78bfa" />
          <directionalLight position={[0, -2, 3]} intensity={0.4} />
          <pointLight position={[0, 2, 2]} intensity={0.6} color="#ffffff" />
          <Model url={modelUrl} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            minPolarAngle={Math.PI / 2.2}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

useGLTF.preload('/models/boy.glb');
useGLTF.preload('/models/girl.glb');
