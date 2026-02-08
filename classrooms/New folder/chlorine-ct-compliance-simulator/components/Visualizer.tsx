
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { SimulationParams, SimulationResult } from '../types';

const WaterVolume = ({ params, result }: { params: SimulationParams, result: SimulationResult }) => {
  // Scale tank based on volume (normalized 10k to 1M)
  const volumeScale = 1 + (params.tankVolume - 10000) / 1000000 * 2;
  
  // Color based on compliance and pH/Temp
  const waterColor = useMemo(() => {
    if (!result.isCompliant) return '#ef4444'; // Red for failure
    if (params.pH > 9) return '#a78bfa'; // Purple-ish for high pH
    if (params.temperature < 5) return '#60a5fa'; // Brighter blue for cold
    return '#3b82f6'; // Standard blue
  }, [result.isCompliant, params.pH, params.temperature]);

  return (
    <group>
      {/* Tank Wireframe - Outer boundary */}
      <mesh scale={[3 * volumeScale, 2, 2]}>
        <boxGeometry />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
      </mesh>

      {/* The Water Volume */}
      <mesh scale={[2.95 * volumeScale, 1.9, 1.9]}>
        <boxGeometry />
        <MeshDistortMaterial
          color={waterColor}
          speed={2}
          distort={0.1}
          radius={1}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Baffles visualization */}
      {Array.from({ length: Math.floor(params.baffleFactor * 10) }).map((_, i) => (
        <mesh key={i} position={[(i - (params.baffleFactor * 5)) * 0.5, 0, 0]} scale={[0.05, 1.8, 1.8]}>
          <boxGeometry />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
        </mesh>
      ))}
    </group>
  );
};

const FlowParticles = ({ flowRate, volumeScale }: { flowRate: number, volumeScale: number }) => {
  const particlesCount = Math.floor(flowRate * 30);
  const boundaryX = (3 * volumeScale) / 2;
  
  const points = useMemo(() => {
    const p = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      p[i * 3] = (Math.random() - 0.5) * (boundaryX * 2);
      p[i * 3 + 1] = (Math.random() - 0.5) * 1.8;
      p[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
    }
    return p;
  }, [particlesCount, boundaryX]);

  const ref = useRef<THREE.Points>(null);
  
  useFrame((state) => {
    if (ref.current && ref.current.geometry.attributes.position) {
      const positions = ref.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particlesCount; i++) {
        // Move particles along X axis
        positions[i * 3] += 0.02 * (flowRate / 5);
        
        // Reset if out of bounds
        if (positions[i * 3] > boundaryX) {
          positions[i * 3] = -boundaryX;
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry key={particlesCount}>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#bae6fd" size={0.08} transparent opacity={0.6} />
    </points>
  );
};

export const Visualizer: React.FC<{ params: SimulationParams, result: SimulationResult }> = ({ params, result }) => {
  const volumeScale = 1 + (params.tankVolume - 10000) / 1000000 * 2;

  return (
    <div className="w-full h-full bg-slate-900 rounded-2xl shadow-2xl overflow-hidden relative border border-slate-700">
      <div className="absolute top-6 left-6 z-10 bg-slate-800/80 backdrop-blur-md p-4 rounded-lg border border-slate-700/50">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Visual Status</h3>
        <p className={`text-xl font-black ${result.isCompliant ? 'text-emerald-400' : 'text-rose-400'}`}>
          {result.isCompliant ? 'SYSTEM COMPLIANT' : 'FAILURE DETECTED'}
        </p>
      </div>
      
      <Canvas shadowMap>
        <PerspectiveCamera makeDefault position={[4, 3, 6]} fov={45} />
        <OrbitControls 
          enablePan={false} 
          maxDistance={20} 
          minDistance={2} 
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 4}
        />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />

        <WaterVolume params={params} result={result} />
        <FlowParticles flowRate={params.flowRate} volumeScale={volumeScale} />
        
        <gridHelper args={[30, 30, 0x334155, 0x0f172a]} position={[0, -2, 0]} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};
