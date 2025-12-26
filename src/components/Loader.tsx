import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';

export function Loader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'revealing' | 'done'>('loading');
  const { currentTheme, applyTheme } = useThemeStore();
  const { primary, secondary, accent } = currentTheme.colors;
  
  // Apply theme on mount
  useEffect(() => {
    applyTheme();
  }, [applyTheme]);

  useEffect(() => {
    // Simulate loading
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase('revealing');
          setTimeout(() => {
            setPhase('done');
            onComplete();
          }, 1000);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[10000] bg-void-black flex items-center justify-center"
        >
          <div className="relative">
            {/* Central element */}
            <motion.div
              animate={{
                rotate: phase === 'revealing' ? 180 : 0,
                scale: phase === 'revealing' ? 0 : 1,
              }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Outer ring */}
              <svg width="200" height="200" className="transform -rotate-90">
                <circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="#1e1e24"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="90"
                  fill="none"
                  stroke="url(#loaderGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={565}
                  strokeDashoffset={565 - (progress / 100) * 565}
                  className="drop-shadow-[0_0_10px_var(--theme-secondary-20)]"
                />
                <defs>
                  <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={primary} />
                    <stop offset="50%" stopColor={secondary} />
                    <stop offset="100%" stopColor={accent} />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-5xl font-bold gradient-text"
                >
                  {Math.min(Math.round(progress), 100)}
                </motion.span>
                <span className="text-neon-yellow text-xs font-mono tracking-widest mt-2">
                  LOADING
                </span>
              </div>
            </motion.div>

            {/* Orbiting particles */}
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                style={{
                  background: i === 0 ? primary : i === 1 ? secondary : accent,
                  boxShadow: `0 0 20px ${i === 0 ? primary : i === 1 ? secondary : accent}`,
                }}
                animate={{
                  rotate: 360,
                  x: Math.cos((i * 2 * Math.PI) / 3) * 120 - 6,
                  y: Math.sin((i * 2 * Math.PI) / 3) * 120 - 6,
                }}
                transition={{
                  rotate: {
                    duration: 2 + i * 0.5,
                    repeat: Infinity,
                    ease: 'linear',
                  },
                }}
              />
            ))}

            {/* Text below */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
            >
              <p className="text-light-cream/50 font-mono text-sm tracking-wider">
                th3scr1b3 • 365 DAYS
              </p>
            </motion.div>
          </div>

          {/* Background grid */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(${secondary} 1px, transparent 1px),
                linear-gradient(90deg, ${secondary} 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />

          {/* Scanline */}
          <motion.div
            className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-neon-red to-transparent opacity-30"
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
