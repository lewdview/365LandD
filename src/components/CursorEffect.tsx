import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';
import { useThemeStore } from '../store/useThemeStore';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  life: number;
}

export function CursorEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const particleId = useRef(0);
  const { currentTheme } = useThemeStore();

  // Smooth spring animation for cursor
  const springConfig = { damping: 25, stiffness: 300 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const themeColors = Object.values(currentTheme.colors);

  useEffect(() => {
    const colors = themeColors;

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      // Create particles
      if (Math.random() > 0.7) {
        const newParticle: Particle = {
          id: particleId.current++,
          x: e.clientX,
          y: e.clientY,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 1,
        };

        setParticles((prev) => [...prev.slice(-20), newParticle]);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.closest('a') || target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY]);

  // Fade out particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, life: p.life - 0.05 }))
          .filter((p) => p.life > 0)
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Hide on mobile/touch devices
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile('ontouchstart' in window);
  }, []);

  if (isMobile) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9997]">
      {/* Main cursor - tiny dot in center */}
      <motion.div
        className="fixed w-2 h-2 pointer-events-none"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <motion.div
          animate={{
            scale: isHovering ? 1.5 : 1,
            opacity: isHovering ? 0.8 : 0.3,
          }}
          transition={{ duration: 0.2 }}
          className="w-full h-full rounded-full"
          style={{
            background: currentTheme.colors.accent,
            boxShadow: `0 0 4px ${currentTheme.colors.accent}`,
          }}
        />
      </motion.div>

      {/* Outer ring */}
      <motion.div
        className="fixed w-10 h-10 border-2 border-neon-red rounded-full pointer-events-none"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          borderColor: isHovering ? currentTheme.colors.accent : currentTheme.colors.secondary,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed rounded-full pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
}
