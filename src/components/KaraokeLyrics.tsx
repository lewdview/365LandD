import { useEffect, useMemo, useRef, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LyricWord, LyricSegment } from '../types';
import { useThemeStore } from '../store/useThemeStore';

interface KaraokeLyricsProps {
  words: LyricWord[];
  segments?: LyricSegment[];
  currentTime: number;
  onWordClick?: (time: number) => void;
  isPlaying?: boolean;
  fullHeight?: boolean; // When true, expands to fill available viewport height
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Epic animated word component
function AnimatedLyricWord({
  word,
  isActive,
  isPast,
  currentTime,
  onClick,
  refCallback,
  wordIndex,
  colors,
}: {
  word: LyricWord;
  isActive: boolean;
  isPast: boolean;
  currentTime: number;
  onClick: () => void;
  refCallback: (el: HTMLSpanElement | null) => void;
  wordIndex: number;
  colors: { active: string; past: string; activeGlow: string; pastGlow: string };
}) {
  const { active: ACTIVE_COLOR, past: PAST_COLOR, activeGlow: ACTIVE_GLOW, pastGlow: PAST_GLOW } = colors;
  
  const fillProgress = useMemo(() => {
    if (!isActive) return isPast ? 1 : 0;
    const duration = word.end - word.start;
    if (duration <= 0) return 1;
    return Math.min(1, Math.max(0, (currentTime - word.start) / duration));
  }, [isActive, isPast, currentTime, word.start, word.end]);

  return (
    <motion.span
      ref={refCallback}
      onClick={onClick}
      className="relative inline-block cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isActive ? 1.15 : 1,
        rotate: isActive ? [0, -1, 1, 0] : 0,
      }}
      transition={{ 
        opacity: { duration: 0.3, delay: wordIndex * 0.02 },
        y: { duration: 0.3, delay: wordIndex * 0.02 },
        scale: { duration: 0.15 },
        rotate: { duration: 0.3, repeat: isActive ? Infinity : 0 },
      }}
      whileHover={{ scale: 1.1 }}
    >
      {/* Pulse ring for active word */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            className="absolute -inset-2 rounded-lg pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.6, 0.2, 0.6],
              scale: [1, 1.2, 1],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{
              background: `radial-gradient(ellipse, ${ACTIVE_GLOW} 0%, transparent 70%)`,
              boxShadow: `0 0 30px ${ACTIVE_COLOR}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Glitch effect container */}
      <span className="relative inline-flex items-baseline">
        {/* Base text */}
        <span
          className="font-black uppercase tracking-wider text-xl md:text-2xl lg:text-3xl"
          style={{
            color: isPast ? PAST_COLOR : isActive ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.25)',
            textShadow: isPast 
              ? `0 0 20px ${PAST_GLOW}, 0 0 40px ${PAST_GLOW}, 0 2px 0 rgba(0,0,0,0.5)` 
              : isActive 
                ? '0 2px 0 rgba(0,0,0,0.5)'
                : 'none',
            WebkitTextStroke: isPast ? `0.5px ${PAST_COLOR}` : 'none',
          }}
        >
          {word.word}
        </span>

        {/* Fill overlay with clip animation */}
        {isActive && (
          <motion.span
            className="absolute left-0 top-0 bottom-0 overflow-hidden whitespace-nowrap font-black uppercase tracking-wider text-xl md:text-2xl lg:text-3xl pointer-events-none flex items-baseline"
            initial={{ width: '0%' }}
            animate={{ width: `${fillProgress * 100}%` }}
            transition={{ duration: 0.05 }}
            style={{
              color: ACTIVE_COLOR,
              textShadow: `0 0 20px ${ACTIVE_GLOW}, 0 0 40px ${ACTIVE_GLOW}, 0 0 60px ${ACTIVE_GLOW}`,
              WebkitTextStroke: `1px ${ACTIVE_COLOR}`,
            }}
          >
            {word.word}
          </motion.span>
        )}

        {/* Glitch layers for active word */}
        {isActive && (
          <>
            <motion.span
              className="absolute left-0 top-0 bottom-0 font-black uppercase tracking-wider text-xl md:text-2xl lg:text-3xl pointer-events-none opacity-50 flex items-baseline"
              animate={{
                x: [0, -2, 2, 0],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 0.1, repeat: Infinity }}
              style={{ color: '#00ffff', mixBlendMode: 'screen' }}
            >
              {word.word}
            </motion.span>
            <motion.span
              className="absolute left-0 top-0 bottom-0 font-black uppercase tracking-wider text-xl md:text-2xl lg:text-3xl pointer-events-none opacity-50 flex items-baseline"
              animate={{
                x: [0, 2, -2, 0],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 0.1, repeat: Infinity, delay: 0.05 }}
              style={{ color: '#ff00ff', mixBlendMode: 'screen' }}
            >
              {word.word}
            </motion.span>
          </>
        )}
      </span>
    </motion.span>
  );
}

export function KaraokeLyrics({
  words,
  segments,
  currentTime,
  onWordClick,
  isPlaying = false,
  fullHeight = false,
}: KaraokeLyricsProps) {
  const { currentTheme } = useThemeStore();
  const ACTIVE_COLOR = currentTheme.colors.secondary;
  const PAST_COLOR = currentTheme.colors.accent;
  const ACTIVE_GLOW = hexToRgba(currentTheme.colors.secondary, 0.8);
  const PAST_GLOW = hexToRgba(currentTheme.colors.accent, 0.5);
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Find current word index
  const currentIndex = useMemo(() => {
    if (!words || words.length === 0) return -1;
    let lo = 0, hi = words.length - 1, ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (words[mid].start <= currentTime) { ans = mid; lo = mid + 1; } 
      else { hi = mid - 1; }
    }
    return ans;
  }, [words, currentTime]);

  // Find current line/segment index
  const currentLineIndex = useMemo(() => {
    if (!segments || segments.length === 0 || currentIndex < 0) return -1;
    const currentWord = words[currentIndex];
    return segments.findIndex(
      (seg) => currentWord.start >= seg.start && currentWord.end <= seg.end
    );
  }, [segments, words, currentIndex]);

  // Auto-scroll - contained within the lyrics container only
  useEffect(() => {
    if (currentIndex < 0 || !containerRef.current) return;
    const el = wordRefs.current[currentIndex];
    const container = containerRef.current;
    
    if (el && container) {
      // Calculate scroll position to center the element within the container
      const containerRect = container.getBoundingClientRect();
      const elementRect = el.getBoundingClientRect();
      
      // Get the element's position relative to the container
      const elementTop = elementRect.top - containerRect.top + container.scrollTop;
      const elementCenter = elementTop - (containerRect.height / 2) + (elementRect.height / 2);
      
      // Scroll the container, not the page
      container.scrollTo({
        top: elementCenter,
        behavior: 'smooth',
      });
    }
  }, [currentIndex]);

  // Bucket words by segment
  const lines = useMemo(() => {
    if (!segments || segments.length === 0) return [words];
    return segments.map((seg) =>
      words.filter((w) => w.start >= seg.start && w.end <= seg.end)
    );
  }, [segments, words]);

  // Progress percentage
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / words.length) * 100 : 0;

  // Check if lyrics have started (with 0.5s lead-in)
  // Only show lyrics if playing AND time has reached the start
  const firstWordStart = words.length > 0 ? words[0].start : 0;
  const hasStarted = isPlaying && words.length > 0 && currentTime >= firstWordStart - 0.5;

  return (
    <div className="relative w-full">
      {/* Main container with bold border */}
      <div className="relative bg-void-black overflow-hidden border-4 border-neon-red-matte">
        {/* Corner accents - smaller on mobile */}
        <div className="absolute top-0 left-0 w-4 h-4 md:w-8 md:h-8 border-t-2 md:border-t-4 border-l-2 md:border-l-4 border-neon-yellow" />
        <div className="absolute top-0 right-0 w-4 h-4 md:w-8 md:h-8 border-t-2 md:border-t-4 border-r-2 md:border-r-4 border-neon-yellow" />
        <div className="absolute bottom-0 left-0 w-4 h-4 md:w-8 md:h-8 border-b-2 md:border-b-4 border-l-2 md:border-l-4 border-neon-yellow" />
        <div className="absolute bottom-0 right-0 w-4 h-4 md:w-8 md:h-8 border-b-2 md:border-b-4 border-r-2 md:border-r-4 border-neon-yellow" />

        {/* Scan lines overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] z-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }}
        />

        {/* Animated background layers */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-void-black via-void-gray/20 to-void-black" />
          
          {/* Falling calendar pages with emotions - smaller with fade */}
          {isPlaying && Array.from({ length: 8 }).map((_, i) => {
            const emotions = ['JOY', 'RAGE', 'LOVE', 'FEAR', 'HOPE', 'PAIN', 'PEACE', 'CHAOS'];
            const days = [7, 14, 23, 42, 99, 128, 256, 365];
            const isLight = i % 2 === 0;
            const emotion = emotions[i % emotions.length];
            const day = days[i % days.length];
            
            return (
              <motion.div
                key={`calendar-${i}`}
                className="absolute pointer-events-none"
                style={{
                  left: `${10 + (i * 10)}%`,
                  width: '40px',
                  height: '48px',
                  perspective: '500px',
                  zIndex: 5,
                }}
                initial={{ y: '-100%', opacity: 0 }}
                animate={{
                  y: ['0%', '120%'],
                  opacity: [0, 0.7, 0.5, 0.3, 0],
                  rotateX: [0, -15, 30, -20, 45],
                  rotateY: [0, 10, -15, 20, -10],
                  rotateZ: [0, 5, -8, 12, -5],
                  x: [0, 20, -15, 30, -10],
                }}
                transition={{
                  duration: 6 + (i * 0.5),
                  repeat: Infinity,
                  delay: i * 1.2,
                  ease: 'easeInOut',
                }}
              >
                {/* Calendar page */}
                <motion.div
                  className="relative w-full h-full"
                  style={{
                    transformStyle: 'preserve-3d',
                    background: isLight 
                      ? `linear-gradient(135deg, ${hexToRgba(PAST_COLOR, 0.15)} 0%, ${hexToRgba(PAST_COLOR, 0.05)} 100%)`
                      : `linear-gradient(135deg, ${hexToRgba(ACTIVE_COLOR, 0.15)} 0%, ${hexToRgba(ACTIVE_COLOR, 0.05)} 100%)`,
                    border: `1px solid ${isLight ? hexToRgba(PAST_COLOR, 0.4) : hexToRgba(ACTIVE_COLOR, 0.4)}`,
                    borderRadius: '2px',
                    backdropFilter: 'blur(2px)',
                    boxShadow: `0 4px 20px ${isLight ? hexToRgba(PAST_COLOR, 0.2) : hexToRgba(ACTIVE_COLOR, 0.2)}`,
                  }}
                >
                  {/* Torn edge at top */}
                  <div 
                    className="absolute -top-1 left-0 right-0 h-1.5"
                    style={{
                      background: isLight ? PAST_COLOR : ACTIVE_COLOR,
                      clipPath: 'polygon(0% 100%, 5% 60%, 10% 100%, 15% 50%, 20% 100%, 25% 70%, 30% 100%, 35% 40%, 40% 100%, 45% 60%, 50% 100%, 55% 50%, 60% 100%, 65% 70%, 70% 100%, 75% 40%, 80% 100%, 85% 60%, 90% 100%, 95% 50%, 100% 100%)',
                      opacity: 0.8,
                    }}
                  />
                  
                  {/* Day number */}
                  <div className="absolute top-1 left-0 right-0 text-center">
                    <span 
                      className="font-black text-lg"
                      style={{ 
                        color: isLight ? PAST_COLOR : ACTIVE_COLOR,
                        textShadow: `0 0 10px ${isLight ? PAST_COLOR : ACTIVE_COLOR}`,
                      }}
                    >
                      {day}
                    </span>
                  </div>
                  
                  {/* Emotion text */}
                  <div className="absolute bottom-1 left-0 right-0 text-center">
                    <span 
                      className="font-mono text-[6px] uppercase tracking-wider"
                      style={{ 
                        color: isLight ? hexToRgba(PAST_COLOR, 0.9) : hexToRgba(ACTIVE_COLOR, 0.9),
                      }}
                    >
                      {emotion}
                    </span>
                  </div>

                  {/* Subtle grid lines */}
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        linear-gradient(${hexToRgba(isLight ? PAST_COLOR : ACTIVE_COLOR, 0.3)} 1px, transparent 1px),
                        linear-gradient(90deg, ${hexToRgba(isLight ? PAST_COLOR : ACTIVE_COLOR, 0.3)} 1px, transparent 1px)
                      `,
                      backgroundSize: '8px 8px',
                    }}
                  />
                </motion.div>

                {/* Shadow beneath falling page */}
                <motion.div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full"
                  style={{
                    background: `radial-gradient(ellipse, ${hexToRgba(isLight ? PAST_COLOR : ACTIVE_COLOR, 0.3)} 0%, transparent 70%)`,
                    filter: 'blur(4px)',
                  }}
                />
              </motion.div>
            );
          })}

          {/* Emotion particles released from pages */}
          {isPlaying && Array.from({ length: 10 }).map((_, i) => {
            const emotionSymbols = ['♡', '✦', '◇', '☆', '◈', '❋', '✧', '♢', '◎', '✴'];
            const isLight = i % 2 === 0;
            const color = isLight ? PAST_COLOR : ACTIVE_COLOR;
            
            return (
              <motion.div
                key={`emotion-particle-${i}`}
                className="absolute font-mono text-xs pointer-events-none"
                style={{ 
                  color,
                  left: `${8 + (i * 8)}%`,
                  textShadow: `0 0 8px ${color}`,
                  zIndex: 4,
                }}
                animate={{
                  y: ['40%', '-20%'],
                  x: [0, (i % 2 === 0 ? 20 : -20), 0],
                  opacity: [0, 0.6, 0.4, 0],
                  scale: [0.4, 1, 0.6],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 4 + (i % 2),
                  repeat: Infinity,
                  delay: 0.5 + (i * 0.4),
                  ease: 'easeOut',
                }}
              >
                {emotionSymbols[i % emotionSymbols.length]}
              </motion.div>
            );
          })}

          {/* Beat pulse effect */}
          {isPlaying && (
            <motion.div
              className="absolute inset-0"
              animate={{
                backgroundColor: ['rgba(255,45,85,0)', 'rgba(255,45,85,0.05)', 'rgba(255,45,85,0)'],
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </div>

        {/* Header bar */}
        <div className="relative z-20 px-6 py-3 border-b-2 border-neon-red-matte/50 bg-void-black/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Animated equalizer bars */}
              <div className="flex items-end gap-0.5 h-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-neon-red"
                    animate={isPlaying ? {
                      height: ['30%', '100%', '50%', '80%', '30%'],
                    } : { height: '30%' }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                    style={{ minHeight: 4 }}
                  />
                ))}
              </div>
              <span className="font-mono text-xs text-neon-red uppercase tracking-widest">
                Poetry in Motion
              </span>
            </div>
            <div className="font-mono text-xs text-light-cream/50">
              {segments && currentLineIndex >= 0 && (
                <span className="text-neon-yellow">{currentLineIndex + 1}</span>
              )}
              {segments && <span> / {segments.length} LINES</span>}
            </div>
          </div>
        </div>

        {/* Lyrics container */}
        <div
          ref={containerRef}
          className={`relative z-10 overflow-y-auto overflow-x-hidden scroll-smooth px-8 ${
            fullHeight 
              ? 'h-[40vh] md:h-[44vh] lg:h-[48vh]' 
              : 'h-32 md:h-36 lg:h-40'
          }`}
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}
        >
          {/* Top spacer to center first line */}
          <div className="h-[45%]" />
          
          {/* Waiting state - show before lyrics start */}
          {words.length > 0 && !hasStarted && (
            <motion.div 
              className="flex flex-col items-center justify-center h-[50%] gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="text-5xl"
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🎧
              </motion.div>
              <span className="font-mono text-light-cream/50 uppercase tracking-widest text-sm">
                Waiting for lyrics...
              </span>
              <span className="font-mono text-light-cream/30 text-xs">
                Press play to begin
              </span>
            </motion.div>
          )}

          {/* Actual lyrics - only show after hasStarted */}
          {hasStarted && (
            <AnimatePresence mode="sync">
              {lines.map((lineWords, li) => {
                const isCurrentLine = li === currentLineIndex;
                const isPastLine = currentLineIndex >= 0 && li < currentLineIndex;
                const isFutureLine = currentLineIndex >= 0 && li > currentLineIndex + 2;

                return (
                  <motion.div
                    key={li}
                    className="mb-6 text-center"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{
                      opacity: isFutureLine ? 0.2 : isCurrentLine ? 1 : isPastLine ? 0.3 : 0.5,
                      x: 0,
                      scale: isCurrentLine ? 1 : 0.9,
                      filter: isPastLine ? 'blur(1px)' : 'none',
                      y: isCurrentLine ? 0 : isPastLine ? -5 : 5,
                    }}
                    transition={{ 
                      duration: 0.5, 
                      ease: 'easeOut',
                    }}
                  >
                    {/* Line accent for current line */}
                    {isCurrentLine && (
                      <motion.div
                        className="absolute left-0 w-1 bg-gradient-to-b from-neon-red via-neon-yellow to-neon-red"
                        style={{ height: '100%', top: 0 }}
                        layoutId="lineAccent"
                        transition={{ duration: 0.3 }}
                      />
                    )}

                    <span className="inline leading-relaxed">
                      {lineWords.map((w, wi) => {
                        const gi = words.indexOf(w);
                        const isActive = currentTime >= w.start && currentTime < w.end;
                        const isPast = currentTime >= w.end;

                        return (
                          <Fragment key={`word-${li}-${wi}-${gi}`}>
                            <AnimatedLyricWord
                              word={w}
                              isActive={isActive}
                              isPast={isPast}
                              currentTime={currentTime}
                              onClick={() => onWordClick?.(w.start)}
                              refCallback={(el) => (wordRefs.current[gi] = el)}
                              wordIndex={wi}
                              colors={{ active: ACTIVE_COLOR, past: PAST_COLOR, activeGlow: ACTIVE_GLOW, pastGlow: PAST_GLOW }}
                            />
                            {wi < lineWords.length - 1 && (
                              <span className="inline-block w-2 md:w-3" />
                            )}
                          </Fragment>
                        );
                      })}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}

          {/* Bottom spacer to allow last line to center */}
          {words.length > 0 && hasStarted && <div className="h-[45%]" />}

          {/* Empty state - no lyrics data at all */}
          {words.length === 0 && (
            <motion.div 
              className="flex flex-col items-center justify-center h-full gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                className="text-6xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎤
              </motion.div>
              <span className="font-mono text-light-cream/40 uppercase tracking-widest">
                No Lyrics Available
              </span>
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="relative z-20 h-2 bg-void-gray border-t-2 border-neon-red-matte/50">
          <motion.div
            className="h-full relative"
            style={{
              background: `linear-gradient(90deg, ${ACTIVE_COLOR}, ${PAST_COLOR})`,
            }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          >
            {/* Glow effect on progress edge */}
            <motion.div
              className="absolute right-0 top-0 bottom-0 w-4"
              style={{
                background: `linear-gradient(90deg, transparent, ${PAST_COLOR})`,
                boxShadow: `0 0 20px ${PAST_COLOR}, 0 0 40px ${PAST_COLOR}`,
              }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          </motion.div>
          
          {/* Progress percentage */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-light-cream/50">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
    </div>
  );
}
