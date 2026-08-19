"use client";

import { useRef, useState, useMemo } from "react";
import { View, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface InteractiveIconProps {
  iconUrl?: string;
  name: string;
  accentHex?: string;
}

export default function InteractiveIcon({ iconUrl, name, accentHex = "#a855f7" }: InteractiveIconProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div ref={containerRef} className="flex flex-col items-center justify-center gap-6 relative group w-32 h-32 md:w-48 md:h-48">
      <View className="absolute inset-0 z-10 w-full h-full pointer-events-auto">
        <Scene iconUrl={iconUrl} name={name} portal={containerRef} accentHex={accentHex} />
      </View>
      <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-2xl tracking-widest text-accent z-20">
        {name}
      </span>
    </div>
  );
}

function Scene({ iconUrl, name, portal, accentHex }: { iconUrl?: string, name: string, portal: React.RefObject<HTMLDivElement | null>, accentHex: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);
  
  const targetScale = hovered ? 1.5 : 1.2;
  const targetRotation = hovered ? [0, Math.PI * 2, 0] : [0, 0, 0];

  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const t = state.clock.getElapsedTime();
    meshRef.current.position.y = Math.sin(t * 2 + offset) * 0.2;
    
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);
    
    meshRef.current.rotation.y = THREE.MathUtils.lerp(
      meshRef.current.rotation.y,
      targetRotation[1] + Math.sin(t + offset) * 0.1,
      delta * 4
    );
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      Math.cos(t + offset) * 0.1,
      delta * 4
    );

    const targetX = hovered ? state.pointer.x * 0.8 : 0;
    const targetZ = hovered ? state.pointer.y * -0.8 : 0;
    
    meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, delta * 3);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, delta * 3);
  });

  // Convert hex to rgb for rgba shadow string
  const r = parseInt(accentHex.slice(1, 3), 16);
  const g = parseInt(accentHex.slice(3, 5), 16);
  const b = parseInt(accentHex.slice(5, 7), 16);

  return (
    <mesh
      ref={meshRef}
      scale={[1.2, 1.2, 1.2]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {/* Invisible hitbox for raycasting */}
      <boxGeometry args={[2.5, 2.5, 0.5]} />
      <meshBasicMaterial visible={false} />
      
      <Html 
        transform 
        center 
        position={[0, 0, 0]} 
        zIndexRange={[100, 0]}
        pointerEvents="none"
        portal={portal}
      >
        <div className="flex flex-col items-center justify-center select-none p-4">
          {iconUrl ? (
              <img 
                src={iconUrl} 
                alt={name} 
                className={`w-20 h-20 md:w-28 md:h-28 object-contain transition-all duration-300 ${hovered ? 'scale-110' : 'opacity-90 grayscale-[20%]'}`} 
                style={hovered ? { filter: `drop-shadow(0 0 25px rgba(${r},${g},${b},0.8))` } : {}}
              />
          ) : (
              <div 
                className={`text-6xl md:text-7xl font-black transition-colors ${hovered ? 'text-white' : 'text-gray-400'}`}
                style={hovered ? { textShadow: `0 0 25px rgba(${r},${g},${b},0.8)` } : {}}
              >
                {name.substring(0, 2).toUpperCase()}
              </div>
          )}
        </div>
      </Html>
    </mesh>
  );
}
