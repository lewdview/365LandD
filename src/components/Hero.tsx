import { motion } from 'framer-motion';
import { AudioVisualizer3D } from './AudioVisualizer3D';
import { GlitchText } from './GlitchText';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { ChevronDown } from 'lucide-react';
import { useMemo } from 'react';

// Calendar page data
const EMOTIONS = [
  'JOY', 'RAGE', 'LOVE', 'FEAR', 'HOPE', 'PAIN', 'PEACE', 'CHAOS',
  'BLISS', 'FURY', 'LUST', 'DREAD', 'FAITH', 'GRIEF', 'CALM', 'MADNESS'
];

// Falling calendar page component
function FallingCalendarPage({ 
  index, 
  totalPages,
  primaryColor,
  accentColor,
}: { 
  index: number; 
  totalPages: number;
  primaryColor: string;
  accentColor: string;
}) {
  const config = useMemo(() => {
    const day = Math.floor(Math.random() * 365) + 1;
    const emotion = EMOTIONS[index % EMOTIONS.length];
    const isLight = index % 2 === 0;
    const startX = 5 + (index * (90 / totalPages));
    const duration = 8 + (index % 5) * 2;
    const delay = index * 0.8;
    
    return { day, emotion, isLight, startX, duration, delay };
  }, [index, totalPages]);

  const { day, emotion, isLight, startX, duration, delay } = config;
  const ACTIVE_COLOR = primaryColor;
  const PAST_COLOR = accentColor;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${startX}%`,
        top: '-100px',
        width: '70px',
        height: '85px',
        perspective: '600px',
        zIndex: 15,
      }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: ['0vh', '120vh'],
        opacity: [0, 0.9, 0.9, 0.7, 0],
        rotateX: [0, -20, 40, -30, 60, -15],
        rotateY: [0, 15, -20, 25, -15, 10],
        rotateZ: [0, 8, -12, 18, -8, 5],
        x: [0, 30, -25, 40, -20, 15],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      {/* Calendar page */}
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          background: isLight 
            ? `linear-gradient(145deg, ${PAST_COLOR}33 0%, ${PAST_COLOR}0d 100%)`
            : `linear-gradient(145deg, ${ACTIVE_COLOR}33 0%, ${ACTIVE_COLOR}0d 100%)`,
          border: `2px solid ${isLight ? `${PAST_COLOR}80` : `${ACTIVE_COLOR}80`}`,
          borderRadius: '3px',
          backdropFilter: 'blur(4px)',
          boxShadow: `
            0 8px 32px ${isLight ? `${PAST_COLOR}4d` : `${ACTIVE_COLOR}4d`},
            inset 0 1px 0 ${isLight ? `${PAST_COLOR}4d` : `${ACTIVE_COLOR}4d`}
          `,
        }}
      >
        {/* Torn edge at top */}
        <div 
          className="absolute -top-1 left-0 right-0 h-3"
          style={{
            background: isLight ? PAST_COLOR : ACTIVE_COLOR,
            clipPath: 'polygon(0% 100%, 3% 50%, 6% 100%, 9% 40%, 12% 100%, 15% 60%, 18% 100%, 21% 30%, 24% 100%, 27% 55%, 30% 100%, 33% 45%, 36% 100%, 39% 65%, 42% 100%, 45% 35%, 48% 100%, 51% 55%, 54% 100%, 57% 40%, 60% 100%, 63% 60%, 66% 100%, 69% 30%, 72% 100%, 75% 50%, 78% 100%, 81% 40%, 84% 100%, 87% 60%, 90% 100%, 93% 35%, 96% 100%, 100% 50%)',
            opacity: 0.9,
          }}
        />
        
        {/* Binding holes */}
        <div className="absolute top-1 left-2 w-2 h-2 rounded-full bg-void-black/60" />
        <div className="absolute top-1 right-2 w-2 h-2 rounded-full bg-void-black/60" />
        
        {/* Day number */}
        <div className="absolute top-5 left-0 right-0 text-center">
          <span 
            className="font-black text-3xl"
            style={{ 
              color: isLight ? PAST_COLOR : ACTIVE_COLOR,
              textShadow: `0 0 15px ${isLight ? PAST_COLOR : ACTIVE_COLOR}, 0 2px 4px rgba(0,0,0,0.5)`,
            }}
          >
            {day}
          </span>
        </div>
        
        {/* Emotion text */}
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <span 
            className="font-mono text-[9px] uppercase tracking-wider font-bold"
            style={{ 
              color: isLight ? PAST_COLOR : ACTIVE_COLOR,
              textShadow: `0 0 8px ${isLight ? PAST_COLOR : ACTIVE_COLOR}`,
            }}
          >
            {emotion}
          </span>
        </div>

        {/* Subtle grid lines */}
        <div 
          className="absolute inset-0 opacity-10 rounded"
          style={{
            backgroundImage: `
              linear-gradient(${isLight ? `${PAST_COLOR}80` : `${ACTIVE_COLOR}80`} 1px, transparent 1px),
              linear-gradient(90deg, ${isLight ? `${PAST_COLOR}80` : `${ACTIVE_COLOR}80`} 1px, transparent 1px)
            `,
            backgroundSize: '12px 12px',
          }}
        />
      </div>

      {/* Glow beneath */}
      <motion.div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full"
        style={{
          background: `radial-gradient(ellipse, ${isLight ? `${PAST_COLOR}66` : `${ACTIVE_COLOR}66`} 0%, transparent 70%)`,
          filter: 'blur(6px)',
        }}
      />
    </motion.div>
  );
}

// Emotion particles floating up
function EmotionParticle({ index, primaryColor, accentColor }: { index: number; primaryColor: string; accentColor: string }) {
  const symbols = ['♡', '✦', '◇', '☆', '◈', '❋', '✧', '♢', '◎', '✴', '❂', '✵', '⬡', '❖'];
  const isLight = index % 2 === 0;
  const startX = 8 + (index * 6);
  const color = isLight ? accentColor : primaryColor;
  
  return (
    <motion.div
      className="absolute font-mono text-lg pointer-events-none"
      style={{ 
        color,
        left: `${startX}%`,
        bottom: '10%',
        textShadow: `0 0 15px ${color}`,
        zIndex: 14,
      }}
      animate={{
        y: [0, -400, -800],
        x: [0, (index % 2 === 0 ? 50 : -50), (index % 2 === 0 ? 20 : -20)],
        opacity: [0, 0.9, 0.6, 0],
        scale: [0.3, 1.3, 0.6],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 6 + (index % 3),
        repeat: Infinity,
        delay: 1 + (index * 0.5),
        ease: 'easeOut',
      }}
    >
      {symbols[index % symbols.length]}
    </motion.div>
  );
}

export function Hero() {
  const { data, currentDay } = useStore();
  const { currentTheme } = useThemeStore();
  const primaryColor = currentTheme.colors.primary;
  const accentColor = currentTheme.colors.accent;
  const backgroundColor = currentTheme.colors.background;

  // Responsive text shadow - smaller on mobile to prevent fragmentation
  const getTextShadow = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const px = size === 'sm' ? 1 : size === 'md' ? 2 : 3;
    const px2 = size === 'sm' ? 1 : size === 'md' ? 2 : 3;
    return `
      -${px}px -${px}px 0 ${backgroundColor},
      ${px}px -${px}px 0 ${backgroundColor},
      -${px}px ${px}px 0 ${backgroundColor},
      ${px}px ${px}px 0 ${backgroundColor},
      -${px2}px 0 0 ${backgroundColor},
      ${px2}px 0 0 ${backgroundColor},
      0 -${px2}px 0 ${backgroundColor},
      0 ${px2}px 0 ${backgroundColor}
    `;
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background - contained within hero */}
      <div className="absolute inset-0 z-0">
        <AudioVisualizer3D />
      </div>
      
      {/* Container for centered and constrained content */}
      <div className="relative z-20 w-full px-6 md:px-12 lg:px-16 flex items-center justify-center min-h-screen">
      
      {/* Large day number in background with sheen effect */}
      <div className="absolute inset-0 flex items-center justify-center z-[5] pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="relative select-none"
        >
          {/* Base day number - subtle outline with dark border */}
          <span 
            className="text-[30vw] md:text-[35vw] lg:text-[40vw] font-black leading-none"
            style={{
              color: 'transparent',
              WebkitTextStroke: `2px ${primaryColor}`,
              opacity: 0.08,
              textShadow: `
                -4px -4px 0 ${backgroundColor},
                4px -4px 0 ${backgroundColor},
                -4px 4px 0 ${backgroundColor},
                4px 4px 0 ${backgroundColor},
                -5px 0 0 ${backgroundColor},
                5px 0 0 ${backgroundColor},
                0 -5px 0 ${backgroundColor},
                0 5px 0 ${backgroundColor}
              `,
            }}
          >
            {String(currentDay).padStart(3, '0')}
          </span>
          
          {/* Sheen layer - uses text as clip mask */}
          <motion.span
            className="absolute inset-0 text-[30vw] md:text-[35vw] lg:text-[40vw] font-black leading-none"
            style={{
              backgroundImage: `linear-gradient(105deg, transparent 0%, transparent 40%, ${accentColor} 50%, transparent 60%, transparent 100%)`,
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              opacity: 0.25,
            }}
            animate={{
              backgroundPosition: ['200% 0%', '-100% 0%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 4,
              ease: 'easeInOut',
            }}
          >
            {String(currentDay).padStart(3, '0')}
          </motion.span>
        </motion.div>
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-void-black/50 via-transparent to-void-black z-10" />
      
      {/* Falling calendar pages */}
      <div className="absolute inset-0 z-[12] overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <FallingCalendarPage key={`cal-${i}`} index={i} totalPages={12} primaryColor={primaryColor} accentColor={accentColor} />
        ))}
      </div>

      {/* Emotion particles rising */}
      <div className="absolute inset-0 z-[13] overflow-hidden pointer-events-none">
        {Array.from({ length: 14 }).map((_, i) => (
          <EmotionParticle key={`particle-${i}`} index={i} primaryColor={primaryColor} accentColor={accentColor} />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-20 text-center">
        {/* Artist name */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span className="text-sm md:text-base font-mono text-neon-yellow tracking-[0.3em] uppercase">
            backBEATS PRESENTS
          </span>
        </motion.div>

        {/* Main title with bold static border for contrast */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-7xl lg:text-9xl font-bold mb-6 relative"
        >
          <span 
            className="relative z-10"
            style={{ textShadow: getTextShadow('md') }}
          >
            <GlitchText 
              text="th3scr1b3" 
              className="gradient-text"
              glitchIntensity="medium"
            />
          </span>
        </motion.h1>

        {/* Project title with bold borders */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <h2 
            className="text-2xl md:text-4xl lg:text-5xl font-light text-light-cream"
            style={{ textShadow: getTextShadow('sm') }}
          >
            <span 
              className="text-glow-red font-bold"
              style={{ textShadow: getTextShadow('sm') }}
            >365</span> Days of{' '}
            <span 
              className="text-neon-yellow text-glow-yellow font-bold"
              style={{ textShadow: getTextShadow('sm') }}
            >Light</span>
            {' & '}
            <span 
              className="text-neon-red text-glow-red font-bold"
              style={{ textShadow: getTextShadow('sm') }}
            >Dark</span>
          </h2>
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg md:text-xl text-neon-red font-mono tracking-wider mt-4"
            style={{ textShadow: getTextShadow('sm') }}
          >
            Poetry in Motion
          </motion.p>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="text-lg md:text-xl text-light-cream/70 max-w-2xl mx-auto mb-12 font-light"
          style={{ textShadow: getTextShadow('sm') }}
        >
          One Take. One Moment. Preserved.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.a
            href={data?.releases?.[0] ? `/day/${data.releases[data.releases.length - 1]?.day || 1}` : '/day/1'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-neon-red-matte text-void-black font-bold text-lg uppercase tracking-wider matte-border-thick transition-all duration-300 hover:bg-neon-red hover:shadow-[0_0_30px_var(--color-neon-red)]"
          >
            Today's Entry
          </motion.a>
          <motion.button
            onClick={() => window.dispatchEvent(new CustomEvent('openManifesto'))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-transparent text-light-cream font-bold text-lg uppercase tracking-wider border-3 border-neon-yellow-matte transition-all duration-300 hover:bg-neon-yellow-matte hover:text-void-black"
          >
            The Manifesto
          </motion.button>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
          className="absolute -left-10 top-1/4 w-32 h-32 border-2 border-neon-red-matte/30 rotate-45"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.7 }}
          className="absolute -right-10 bottom-1/4 w-24 h-24 border-2 border-neon-yellow-matte/30 rotate-12"
        />
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ 
          opacity: { delay: 2, duration: 1 },
          y: { repeat: Infinity, duration: 1.5 }
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-xs font-mono text-neon-yellow/70 tracking-widest">SCROLL</span>
        <ChevronDown className="w-6 h-6 text-neon-yellow" />
      </motion.div>

      </div>
      
      {/* Scanline effect */}
      <div className="absolute inset-0 z-30 pointer-events-none scanlines opacity-20" />
    </section>
  );
}
