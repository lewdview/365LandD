import { motion, useInView } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { useRef } from 'react';
import { GlitchText } from './GlitchText';

export function MonthThemes() {
  const { data, currentDay } = useStore();
  const { currentTheme } = useThemeStore();
  const { primary, accent, background } = currentTheme.colors;

  if (!data?.monthThemes) return null;

  const currentMonthTheme = data.monthThemes.find(
    m => currentDay >= m.dayStart && currentDay <= m.dayEnd
  );

  return (
    <section 
      id="themes" 
      className="py-24 px-6 md:px-12 lg:px-16 relative overflow-hidden"
    >
      {/* Scanlines overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        }}
      />

      {/* Glitch lines - like footer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px"
            style={{
              top: `${10 + i * 12}%`,
              left: 0,
              right: 0,
              background: `linear-gradient(90deg, transparent, ${i % 2 === 0 ? primary : accent}, transparent)`,
            }}
            animate={{
              opacity: [0, 0.4, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 2.5,
              delay: i * 0.4,
              repeat: Infinity,
              repeatDelay: 4,
            }}
          />
        ))}
      </div>

      {/* Giant scrolling background text - like footer */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 overflow-hidden pointer-events-none">
        <motion.p
          initial={{ x: '0%' }}
          animate={{ x: '-50%' }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="text-[20vw] font-black whitespace-nowrap leading-none"
          style={{
            color: primary,
            opacity: 0.03,
          }}
        >
          LIGHT→DARK→LIGHT • LIGHT→DARK→LIGHT • LIGHT→DARK→LIGHT •
        </motion.p>
      </div>

      <div className="relative z-10 w-full">
        {/* Header with code-style comment */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="font-mono text-sm mb-4 block" style={{ color: accent }}>
            // THE_EMOTIONAL_ARC
          </span>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <GlitchText
                text="12 MONTHS"
                className="text-5xl md:text-7xl lg:text-8xl font-black"
                glitchIntensity="low"
              />
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black -mt-2" style={{ color: primary }}>
                12 THEMES
              </h2>
            </div>
            
            {/* Mini visualizer - like footer */}
            <div className="flex items-end gap-1 h-16">
              {data.monthThemes.map((month, i) => {
                const isPast = currentDay > month.dayEnd;
                const isCurrent = currentDay >= month.dayStart && currentDay <= month.dayEnd;
                const progress = isCurrent 
                  ? ((currentDay - month.dayStart) / (month.dayEnd - month.dayStart))
                  : isPast ? 1 : 0;
                
                return (
                  <motion.div
                    key={month.month}
                    className="w-3 md:w-4 rounded-t-sm relative group cursor-pointer"
                    style={{
                      background: `linear-gradient(to top, ${month.arc.includes('DARK') ? primary : accent}, transparent)`,
                      height: `${30 + progress * 70}%`,
                    }}
                    whileHover={{ scaleY: 1.2 }}
                    initial={{ height: 0 }}
                    animate={{ height: `${30 + progress * 70}%` }}
                    transition={{ duration: 0.8, delay: i * 0.05 }}
                  >
                    {isCurrent && (
                      <motion.div
                        className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                        style={{ background: month.arc.includes('DARK') ? primary : accent }}
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div 
                        className="px-2 py-1 text-xs font-mono whitespace-nowrap"
                        style={{ background: background, border: `1px solid ${month.arc.includes('DARK') ? primary : accent}` }}
                      >
                        {month.name}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Current phase - prominent display */}
        {currentMonthTheme && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-20 relative"
          >
            {/* Decorative brackets */}
            <div className="absolute -left-4 top-0 bottom-0 w-1 flex flex-col justify-between">
              <div className="w-4 h-8 border-l-2 border-t-2" style={{ borderColor: primary }} />
              <div className="w-4 h-8 border-l-2 border-b-2" style={{ borderColor: primary }} />
            </div>
            <div className="absolute -right-4 top-0 bottom-0 w-1 flex flex-col justify-between items-end">
              <div className="w-4 h-8 border-r-2 border-t-2" style={{ borderColor: accent }} />
              <div className="w-4 h-8 border-r-2 border-b-2" style={{ borderColor: accent }} />
            </div>

            <div className="p-8 md:p-12 relative">
              {/* Phase indicator */}
              <div className="flex items-center gap-4 mb-6">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ background: currentMonthTheme.arc.includes('DARK') ? primary : accent }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="font-mono text-xs tracking-[0.3em] uppercase text-light-cream/50">
                  CURRENT_PHASE.execute()
                </span>
              </div>

              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="text-8xl md:text-9xl mb-4 opacity-80">
                    {currentMonthTheme.emoji}
                  </div>
                  <h3 
                    className="text-4xl md:text-6xl font-black mb-4"
                    style={{ color: currentMonthTheme.arc.includes('DARK') ? primary : accent }}
                  >
                    {currentMonthTheme.theme}
                  </h3>
                  <p className="text-xl text-light-cream/60 leading-relaxed">
                    {currentMonthTheme.description}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Progress visualization */}
                  <div className="p-6" style={{ background: `${currentMonthTheme.arc.includes('DARK') ? primary : accent}10` }}>
                    <div className="flex justify-between text-xs font-mono text-light-cream/40 mb-2">
                      <span>DAY {currentMonthTheme.dayStart}</span>
                      <span>DAY {currentMonthTheme.dayEnd}</span>
                    </div>
                    <div className="h-2 bg-void-black/50 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0"
                        style={{ background: currentMonthTheme.arc.includes('DARK') ? primary : accent }}
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentDay - currentMonthTheme.dayStart) / (currentMonthTheme.dayEnd - currentMonthTheme.dayStart)) * 100}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                      />
                      {/* Glitch effect on progress bar */}
                      <motion.div
                        className="absolute inset-0"
                        style={{ background: `linear-gradient(90deg, transparent 40%, ${currentMonthTheme.arc.includes('DARK') ? primary : accent}50 50%, transparent 60%)` }}
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-2xl font-black" style={{ color: currentMonthTheme.arc.includes('DARK') ? primary : accent }}>
                        {Math.round(((currentDay - currentMonthTheme.dayStart) / (currentMonthTheme.dayEnd - currentMonthTheme.dayStart)) * 100)}%
                      </span>
                      <span className="font-mono text-sm text-light-cream/40">
                        {currentMonthTheme.dayEnd - currentDay} days remaining
                      </span>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4" style={{ borderLeft: `2px solid ${currentMonthTheme.arc.includes('DARK') ? primary : accent}` }}>
                      <span className="text-xs font-mono text-light-cream/30 block">MONTH</span>
                      <span className="text-2xl font-black">{currentMonthTheme.name}</span>
                    </div>
                    <div className="p-4" style={{ borderLeft: `2px solid ${currentMonthTheme.arc.includes('DARK') ? primary : accent}` }}>
                      <span className="text-xs font-mono text-light-cream/30 block">ARC</span>
                      <span className="text-2xl font-black" style={{ color: currentMonthTheme.arc.includes('DARK') ? primary : accent }}>
                        {currentMonthTheme.arc}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Horizontal scrolling month strip */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-void-black to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-void-black to-transparent z-10 pointer-events-none" />
          
          <div className="overflow-x-auto scrollbar-hide pb-4">
            <div className="flex gap-4 min-w-max px-8">
              {data.monthThemes.map((month, index) => {
                const isPast = currentDay > month.dayEnd;
                const isCurrent = currentDay >= month.dayStart && currentDay <= month.dayEnd;
                const isFuture = currentDay < month.dayStart;

                return (
                  <MonthCard 
                    key={month.month}
                    month={month}
                    index={index}
                    isPast={isPast}
                    isCurrent={isCurrent}
                    isFuture={isFuture}
                    primary={primary}
                    accent={accent}
                    currentDay={currentDay}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Arc visualization - reimagined */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 relative"
        >
          <div className="text-center mb-8">
            <span className="font-mono text-xs text-light-cream/30">// LIGHT_DARK_SPECTRUM</span>
          </div>

          <div className="relative h-32 max-w-5xl mx-auto">
            {/* Animated arc path */}
            <svg viewBox="0 0 500 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={accent} />
                  <stop offset="20%" stopColor={accent} />
                  <stop offset="50%" stopColor={primary} />
                  <stop offset="80%" stopColor={accent} />
                  <stop offset="100%" stopColor={accent} />
                </linearGradient>
              </defs>
              
              {/* Background grid lines */}
              {Array.from({ length: 13 }).map((_, i) => (
                <line
                  key={i}
                  x1={i * (500 / 12)}
                  y1="0"
                  x2={i * (500 / 12)}
                  y2="100"
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
              ))}
              
              {/* The curve - representing emotional journey */}
              <motion.path
                d="M 0 70 C 40 70, 80 60, 120 45 C 160 30, 200 15, 250 10 C 300 15, 340 35, 380 55 C 420 70, 460 75, 500 70"
                fill="none"
                stroke="url(#arcGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2.5, ease: 'easeOut' }}
              />

              {/* Month markers */}
              {data.monthThemes.map((month, i) => {
                const x = (i / 11) * 500;
                const y = (() => {
                  // Approximate curve position
                  if (i < 3) return 70 - (i * 8);
                  if (i < 6) return 45 - ((i - 3) * 10);
                  if (i < 9) return 15 + ((i - 6) * 15);
                  return 55 + ((i - 9) * 5);
                })();
                const isCurrentMonth = currentDay >= month.dayStart && currentDay <= month.dayEnd;
                
                return (
                  <g key={month.month}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isCurrentMonth ? 8 : 4}
                      fill={month.arc.includes('DARK') ? primary : accent}
                      opacity={isCurrentMonth ? 1 : 0.5}
                    />
                    {isCurrentMonth && (
                      <circle
                        cx={x}
                        cy={y}
                        r="12"
                        fill="none"
                        stroke={month.arc.includes('DARK') ? primary : accent}
                        strokeWidth="2"
                        opacity="0.3"
                      >
                        <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Labels */}
            <div className="absolute inset-x-0 bottom-0 flex justify-between text-xs font-mono px-4">
              <span style={{ color: accent }}>☀ LIGHT</span>
              <span className="text-light-cream/20">|</span>
              <span style={{ color: primary }}>◐ DARK</span>
              <span className="text-light-cream/20">|</span>
              <span style={{ color: accent }}>☀ LIGHT</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom decorative element */}
        <motion.div 
          className="mt-16 flex justify-center items-center gap-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="h-px flex-1 max-w-32" style={{ background: `linear-gradient(90deg, transparent, ${primary})` }} />
          <span className="font-mono text-xs text-light-cream/30">365_DAYS</span>
          <div className="h-px flex-1 max-w-32" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
        </motion.div>
      </div>
    </section>
  );
}

// Individual month card component
function MonthCard({
  month,
  index,
  isPast,
  isCurrent,
  isFuture,
  primary,
  accent,
  currentDay,
}: {
  month: any;
  index: number;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  primary: string;
  accent: string;
  currentDay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const themeColor = month.arc.includes('DARK') ? primary : accent;
  const progress = isCurrent 
    ? ((currentDay - month.dayStart) / (month.dayEnd - month.dayStart)) * 100
    : isPast ? 100 : 0;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative w-64 flex-shrink-0 cursor-pointer group ${isFuture ? 'opacity-40' : ''}`}
    >
      {/* Card */}
      <div 
        className="p-5 h-full relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(45,48,72,0.5) 0%, rgba(26,28,46,0.8) 100%)`,
          border: isCurrent ? `2px solid ${themeColor}` : '1px solid rgba(255,255,255,0.05)',
          boxShadow: isCurrent ? `0 0 30px ${themeColor}30` : 'none',
        }}
      >
        {/* Progress bar */}
        <div 
          className="absolute bottom-0 left-0 h-1 transition-all"
          style={{ 
            width: `${progress}%`,
            background: themeColor,
          }}
        />

        {/* Glitch line on hover */}
        <motion.div
          className="absolute inset-x-0 h-px top-1/2 opacity-0 group-hover:opacity-100"
          style={{ background: themeColor }}
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
        />

        {/* Number badge */}
        <div className="flex items-start justify-between mb-3">
          <span 
            className="text-5xl font-black opacity-20"
            style={{ color: themeColor }}
          >
            {String(month.month).padStart(2, '0')}
          </span>
          <span className="text-3xl">{month.emoji}</span>
        </div>

        {/* Theme name */}
        <h4 
          className="text-lg font-bold mb-1 line-clamp-1"
          style={{ color: isFuture ? 'rgba(255,255,255,0.4)' : themeColor }}
        >
          {month.theme}
        </h4>

        {/* Month name */}
        <p className="text-xs font-mono text-light-cream/40 mb-2">{month.name}</p>

        {/* Description */}
        <p className="text-xs text-light-cream/50 line-clamp-2 mb-3">
          {month.description}
        </p>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span 
            className="px-2 py-0.5"
            style={{ 
              background: `${themeColor}20`,
              color: themeColor,
            }}
          >
            {month.arc}
          </span>
          <span className="text-light-cream/30">
            {month.dayStart}-{month.dayEnd}
          </span>
        </div>

        {/* Status indicator */}
        {isCurrent && (
          <div className="absolute top-3 right-3">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ background: themeColor }}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        )}
        {isPast && (
          <div className="absolute top-3 right-3 text-xs font-mono" style={{ color: accent }}>
            ✓
          </div>
        )}
      </div>
    </motion.div>
  );
}
