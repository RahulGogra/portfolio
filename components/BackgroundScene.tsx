"use client";

import { Stars } from "@react-three/drei";

export default function BackgroundScene({ accentHex = "#a855f7" }: { accentHex?: string }) {
  return (
    <group>
      <Stars 
        radius={50} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />
      {/* Optional: Add a very subtle ambient colored glow based on the accent */}
      <ambientLight color={accentHex} intensity={0.1} />
    </group>
  );
}
