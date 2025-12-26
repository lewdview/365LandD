import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  glitchIntensity?: 'low' | 'medium' | 'high';
}

export function GlitchText({ text, className = '', glitchIntensity = 'medium' }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, glitchIntensity === 'high' ? 2000 : glitchIntensity === 'medium' ? 4000 : 6000);

    return () => clearInterval(interval);
  }, [glitchIntensity]);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Main text */}
      <span className="relative z-10">{text}</span>
      
      {/* Red glitch layer */}
      <motion.span
        className="absolute top-0 left-0 text-neon-red opacity-80"
        style={{ 
          clipPath: isGlitching ? 'polygon(0 0, 100% 0, 100% 45%, 0 45%)' : 'none',
        }}
        animate={{
          x: isGlitching ? [-2, 2, -1, 0] : 0,
          opacity: isGlitching ? [0.8, 0.9, 0.7, 0] : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {text}
      </motion.span>
      
      {/* Yellow glitch layer */}
      <motion.span
        className="absolute top-0 left-0 text-neon-yellow opacity-80"
        style={{ 
          clipPath: isGlitching ? 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)' : 'none',
        }}
        animate={{
          x: isGlitching ? [2, -2, 1, 0] : 0,
          opacity: isGlitching ? [0.8, 0.9, 0.7, 0] : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        {text}
      </motion.span>
    </div>
  );
}

// Scramble text effect
export function ScrambleText({ text, className = '' }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const chars = '!<>-_\\/[]{}—=+*^?#________';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((_char, index) => {
            if (index < iteration) return text[index];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text]);

  return <span className={`font-mono ${className}`}>{displayText}</span>;
}
