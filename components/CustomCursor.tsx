// components/CustomCursor.tsx
'use client' // Important for client-side functionality in Next.js App Router

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const throttle = <T extends (...args: any[]) => any>(func: T, limit: number): ((this: ThisParameterType<T>, ...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const throttledMouseMove = throttle(handleMouseMove, 16); // Throttle to ~60 FPS

    window.addEventListener('mousemove', throttledMouseMove);
    return () => window.removeEventListener('mousemove', throttledMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed w-7 h-7 bg-blue-500 rounded-full pointer-events-none z-50 mix-blend-difference"
      style={{
        left: mousePosition.x - 12,
        top: mousePosition.y - 12,
      }}
      animate={{
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 0.5, repeat: Infinity }}
    />
  );
}