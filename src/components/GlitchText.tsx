import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchIntensity?: 'low' | 'medium' | 'high';
}

export function GlitchText({ text, className = '', glitchIntensity = 'medium' }: GlitchTextProps) {
  const controls = useAnimation();
  const [isGlitching, setIsGlitching] = useState(false);

  // Configuration based on intensity
  const config = {
    low: { interval: 4000, duration: 0.2 },
    medium: { interval: 2500, duration: 0.4 },
    high: { interval: 1000, duration: 0.6 },
  }[glitchIntensity];

  useEffect(() => {
    const triggerGlitch = async () => {
      if (Math.random() > 0.7) { // 30% chance to skip a cycle for randomness
        setIsGlitching(true);
        await controls.start({
          x: [0, -2, 2, -1, 1, 0],
          y: [0, 1, -1, 0],
          transition: { duration: 0.2 }
        });
        setIsGlitching(false);
      }
    };

    const intervalId = setInterval(triggerGlitch, config.interval);
    return () => clearInterval(intervalId);
  }, [config.interval, controls]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* 1. THE BASE TEXT - Always visible, high contrast, solid */}
      <span className="relative z-10 block opacity-100 text-light-cream">
        {text}
      </span>

      {/* 2. GLITCH LAYER - RED (Left Shift) */}
      <motion.span
        className="absolute top-0 left-0 z-0 text-neon-red opacity-0 mix-blend-screen"
        animate={isGlitching ? {
          opacity: [0, 0.8, 0, 0.5, 0],
          x: [-2, -4, 0, -2, 0],
          y: [0, 1, 0]
        } : { opacity: 0 }}
        transition={{ duration: config.duration, ease: "linear" }}
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' }} // Top half only
      >
        {text}
      </motion.span>

      {/* 3. GLITCH LAYER - CYAN/BLUE (Right Shift) */}
      <motion.span
        className="absolute top-0 left-0 z-0 text-neon-cyan opacity-0 mix-blend-screen"
        animate={isGlitching ? {
          opacity: [0, 0.8, 0, 0.5, 0],
          x: [2, 4, 0, 2, 0],
          y: [0, -1, 0]
        } : { opacity: 0 }}
        transition={{ duration: config.duration, delay: 0.05, ease: "linear" }}
        style={{ clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)' }} // Bottom half only
      >
        {text}
      </motion.span>

      {/* 4. GLITCH LAYER - WHITE SLICE (Horizontal Cut) */}
      <motion.span
        className="absolute top-0 left-0 z-20 text-white opacity-0"
        animate={isGlitching ? {
          opacity: [0, 1, 0],
          x: [-5, 5, -5],
        } : { opacity: 0 }}
        transition={{ duration: 0.1, delay: 0.1 }}
        style={{ 
          clipPath: 'polygon(0 40%, 100% 40%, 100% 60%, 0 60%)', // Middle slice
          textShadow: '0 0 5px white'
        }} 
      >
        {text}
      </motion.span>

      {/* 5. BACKGROUND NOISE BAR (Occasional rectangular block) */}
      <motion.div
        className="absolute top-1/2 left-0 w-full h-1 bg-white mix-blend-overlay pointer-events-none"
        animate={isGlitching ? {
          opacity: [0, 0.5, 0],
          scaleX: [0, 1.5, 0],
          y: [-10, 10, 0]
        } : { opacity: 0 }}
        transition={{ duration: 0.15 }}
      />
    </div>
  );
}