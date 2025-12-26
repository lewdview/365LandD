import { motion } from 'framer-motion';
import { useThemeStore } from '../store/useThemeStore';
import { useMemo } from 'react';

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export function FloatingParticles({ count = 30, className = '' }: FloatingParticlesProps) {
  const { currentTheme } = useThemeStore();
  const { primary, accent } = currentTheme.colors;

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      color: Math.random() > 0.5 ? primary : accent,
      opacity: Math.random() * 0.3 + 0.1,
      drift: Math.random() * 40 - 20,
    }));
  }, [count, primary, accent]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            background: particle.color,
            opacity: particle.opacity,
            filter: 'blur(0.5px)',
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, particle.drift, 0],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Glowing orbs variant - larger, softer particles
export function GlowingOrbs({ count = 8, className = '' }: FloatingParticlesProps) {
  const { currentTheme } = useThemeStore();
  const { primary, accent } = currentTheme.colors;

  const orbs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 80 + 40,
      duration: Math.random() * 30 + 20,
      delay: Math.random() * 10,
      color: Math.random() > 0.5 ? primary : accent,
    }));
  }, [count, primary, accent]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full"
          style={{
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color}20 0%, transparent 70%)`,
            filter: 'blur(20px)',
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 20, 0],
            scale: [1, 1.3, 0.8, 1],
            opacity: [0.3, 0.5, 0.2, 0.3],
          }}
          transition={{
            duration: orb.duration,
            delay: orb.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// Rising particles - like embers or stars rising
export function RisingParticles({ count = 20, className = '' }: FloatingParticlesProps) {
  const { currentTheme } = useThemeStore();
  const { primary, accent } = currentTheme.colors;

  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 8,
      color: Math.random() > 0.5 ? primary : accent,
      sway: Math.random() * 60 - 30,
    }));
  }, [count, primary, accent]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            bottom: 0,
            width: particle.size,
            height: particle.size,
            background: particle.color,
          }}
          animate={{
            y: [0, -window.innerHeight],
            x: [0, particle.sway],
            opacity: [0, 0.6, 0.6, 0],
            scale: [0.5, 1, 1, 0.3],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

// Constellation - connected dots with lines
export function ConstellationParticles({ count = 12, className = '' }: FloatingParticlesProps) {
  const { currentTheme } = useThemeStore();
  const { primary, accent } = currentTheme.colors;

  const points = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
      color: Math.random() > 0.5 ? primary : accent,
      driftX: Math.random() * 20 - 10,
      driftY: Math.random() * 20 - 10,
    }));
  }, [count, primary, accent]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="w-full h-full absolute inset-0">
        {/* Lines between nearby points */}
        {points.map((p1, i) =>
          points.slice(i + 1).map((p2) => {
            const distance = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            if (distance < 25) {
              return (
                <motion.line
                  key={`${p1.id}-${p2.id}`}
                  x1={`${p1.x}%`}
                  y1={`${p1.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke={primary}
                  strokeWidth="0.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
              );
            }
            return null;
          })
        )}
      </svg>
      {/* Points */}
      {points.map((point) => (
        <motion.div
          key={point.id}
          className="absolute rounded-full"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            width: point.size,
            height: point.size,
            background: point.color,
            boxShadow: `0 0 ${point.size * 2}px ${point.color}`,
          }}
          animate={{
            x: [0, point.driftX, 0],
            y: [0, point.driftY, 0],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: point.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
