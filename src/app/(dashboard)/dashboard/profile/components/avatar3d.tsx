'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={ref}>
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
          camera={{ position: [0, 1, 3], fov: 35 }}
          style={{ background: 'transparent' }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-3, 3, -3]} intensity={0.3} color="#a78bfa" />
          <Model url={modelUrl} />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2.2}
          />
        </Canvas>
      </Suspense>
    </div>
  );
}

useGLTF.preload('/models/boy.glb');
useGLTF.preload('/models/girl.glb');
