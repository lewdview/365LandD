import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useThemeStore } from '../store/useThemeStore';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchIntensity?: 'low' | 'medium' | 'high';
}

export function GlitchText({ text, className = '', glitchIntensity = 'medium' }: GlitchTextProps) {
  const { currentTheme } = useThemeStore();
  const { primary, accent } = currentTheme.colors;
  const [isGlitching, setIsGlitching] = useState(false);

  const config = {
    low: { interval: 4000, duration: 0.2 },
    medium: { interval: 2500, duration: 0.3 },
    high: { interval: 1000, duration: 0.4 },
  }[glitchIntensity];

  useEffect(() => {
    const triggerGlitch = () => {
      if (Math.random() > 0.2) { 
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), config.duration * 1000);
      }
    };

    const intervalId = setInterval(triggerGlitch, config.interval);
    return () => clearInterval(intervalId);
  }, [config.interval, config.duration]);

  return (
    <div className="relative inline-block">
      {/* 1. BASE TEXT - Solid, visible */}
      <span className={`relative z-10 block ${className}`}>
        {text}
      </span>

      {/* 2. GLITCH LAYER - PRIMARY COLOR (Left Shift) */}
      <motion.span
        className="absolute top-0 left-0 z-20 opacity-0 select-none pointer-events-none font-black"
        style={{ 
          color: primary, // Dynamic Primary Color
          clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
          mixBlendMode: 'screen' 
        }}
        animate={isGlitching ? {
          opacity: [0, 1, 1, 0],
          x: [-3, -6, 3, 0],
          y: [0, 2, -2, 0],
        } : { opacity: 0 }}
        transition={{ duration: config.duration, ease: "easeInOut" }}
      >
        {text}
      </motion.span>

      {/* 3. GLITCH LAYER - ACCENT COLOR (Right Shift) */}
      <motion.span
        className="absolute top-0 left-0 z-20 opacity-0 select-none pointer-events-none font-black"
        style={{ 
          color: accent, // Dynamic Accent Color
          clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
          mixBlendMode: 'screen'
        }}
        animate={isGlitching ? {
          opacity: [0, 1, 1, 0],
          x: [3, 6, -3, 0],
          y: [0, -2, 2, 0],
        } : { opacity: 0 }}
        transition={{ duration: config.duration, ease: "easeInOut" }}
      >
        {text}
      </motion.span>

      {/* 4. FLASH LAYER - Pure White */}
      <motion.span
        className="absolute top-0 left-0 z-30 text-white opacity-0 select-none pointer-events-none font-black"
        style={{ textShadow: '0 0 20px white' }}
        animate={isGlitching ? {
          opacity: [0, 1, 0],
          scale: [1, 1.1, 1],
        } : { opacity: 0 }}
        transition={{ duration: 0.1, delay: 0.1 }}
      >
        {text}
      </motion.span>
    </div>
  );
}