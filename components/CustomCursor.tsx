// components/CustomCursor.tsx
'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const checkHover = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const isInteractive = 
            target.tagName === 'A' || 
            target.tagName === 'BUTTON' || 
            target.closest('a') !== null || 
            target.closest('button') !== null ||
            window.getComputedStyle(target).cursor === 'pointer';
            
        setIsHovering(isInteractive);
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', checkHover);
    
    const handleMouseOut = (e: MouseEvent) => {
        if (!e.relatedTarget) setIsVisible(false);
    };
    
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseenter', () => setIsVisible(true));

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', checkHover);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseenter', () => setIsVisible(true));
    };
  }, [cursorX, cursorY, isVisible]);

  // Don't render on server or if not visible
  if (typeof window === 'undefined') return null;

  return (
    <>
      {/* Main Dot */}
      <motion.div
        className={`fixed top-0 left-0 w-3 h-3 bg-accent rounded-full pointer-events-none z-9999 mix-blend-difference transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        style={{
          translateX: cursorX,
          translateY: cursorY,
          x: '-50%',
          y: '-50%',
        }}
      />
      
      {/* Trailing Ring */}
      <motion.div
        className={`fixed top-0 left-0 w-8 h-8 border rounded-full pointer-events-none z-9998 mix-blend-difference transition-[opacity,background-color,border-color] duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} ${isHovering ? 'bg-accent/10 border-transparent' : 'border-accent'}`}
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
          x: '-50%',
          y: '-50%',
        }}
        // Colours come from the theme's accent (classes above); only the size animates here.
        animate={{ scale: isHovering ? 1.5 : 1 }}
        transition={{ scale: { duration: 0.2 } }}
      />
    </>
  );
}