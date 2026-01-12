import { motion, useScroll, useTransform } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { useRef, useState } from 'react';
import { GlitchText } from './GlitchText';
import { ChevronRight, Cpu, Activity, Database, Cloud } from 'lucide-react';

export function MonthThemes() {
  const { data, currentDay } = useStore();
  const { currentTheme } = useThemeStore();
  const { primary, accent } = currentTheme.colors;
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [0.95, 1]);

  if (!data?.monthThemes) return null;

  const currentMonthTheme = data.monthThemes.find(
    m => currentDay >= m.dayStart && currentDay <= m.dayEnd
  );

  // Helper to determine color based on theme intensity
  const getThemeColor = (pattern: string = '') => {
    const highIntensity = ['surge', 'chaos', 'storm', 'shadow', 'shedding'];
    return highIntensity.some(k => pattern.toLowerCase().includes(k)) ? primary : accent;
  };

  return (
    <section 
      ref={sectionRef}
      id="themes" 
      className="py-32 relative overflow-hidden min-h-screen flex flex-col justify-center"
    >
      {/* Dynamic Background Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${primary} 1px, transparent 1px),
            linear-gradient(to bottom, ${primary} 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
        }}
      />

      {/* Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-void-black rounded-full blur-[100px] opacity-50 z-0" />
      
      {/* Content Container */}
      <motion.div 
        className="relative z-10 container mx-auto px-6 md:px-12"
        style={{ opacity, scale }}
      >
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-12 mb-24 border-b border-white/5 pb-12">
          <div className="relative">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              className="absolute -top-6 left-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50"
            />
            <span className="font-mono text-xs tracking-[0.5em] text-light-cream/40 mb-4 block">
              // SYSTEM_ARCHITECTURE
            </span>
            <GlitchText 
              text="THE 12 PHASES" 
              className="text-6xl md:text-8xl font-black tracking-tighter mb-2 block"
            />
            <div className="flex items-center gap-4 text-light-cream/60 font-mono text-sm">
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded">V.2030.X</span>
              <span>SEQUENCE_ACTIVE</span>
            </div>
          </div>

          {/* Mini Year Visualizer */}
          <div className="flex gap-px h-16 items-end opacity-80">
            {data.monthThemes.map((m, i) => {
               const isCurrent = currentDay >= m.dayStart && currentDay <= m.dayEnd;
               const color = getThemeColor(m.pattern);
               return (
                 <motion.div
                    key={m.month}
                    initial={{ height: 0 }}
                    whileInView={{ height: isCurrent ? '100%' : '30%' }}
                    transition={{ delay: i * 0.05, duration: 0.5 }}
                    className="w-2 md:w-3 rounded-t-xs"
                    style={{ 
                      background: isCurrent ? color : `${color}40`,
                      boxShadow: isCurrent ? `0 0 10px ${color}` : 'none'
                    }}
                 />
               )
            })}
          </div>
        </div>

        {/* CURRENT PHASE HUD */}
        {currentMonthTheme && (
          <div className="mb-32 relative group">
            <div className="absolute -inset-8 bg-gradient-to-r from-void-black via-white/5 to-void-black blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative grid lg:grid-cols-12 gap-8 border border-white/10 bg-void-black/80 backdrop-blur-md p-8 md:p-12 rounded-lg overflow-hidden">
              {/* HUD Decoration Lines */}
              <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-primary/30 rounded-tl-3xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-accent/30 rounded-br-3xl" />
              
              {/* Left Col: Status */}
              <div className="lg:col-span-5 flex flex-col justify-between h-full min-h-[300px]">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: getThemeColor(currentMonthTheme.pattern) }}></span>
                      <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: getThemeColor(currentMonthTheme.pattern) }}></span>
                    </span>
                    <span className="font-mono text-xs tracking-widest text-light-cream/50">EXECUTING_PHASE_{String(currentMonthTheme.month).padStart(2,'0')}</span>
                  </div>
                  
                  <h3 className="text-5xl md:text-7xl font-black mb-6 uppercase leading-[0.9]">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-light-cream to-white/50">
                      {currentMonthTheme.theme}
                    </span>
                  </h3>
                  
                  <div className="flex gap-4">
                     <span className="px-3 py-1 text-xs font-mono border border-white/10 rounded bg-white/5 text-primary">
                        {currentMonthTheme.pattern || 'UNKNOWN_PATTERN'}
                     </span>
                     <span className="px-3 py-1 text-xs font-mono border border-white/10 rounded bg-white/5 text-accent">
                        {currentMonthTheme.emoji} ENTITY
                     </span>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-lg text-light-cream/70 border-l-2 border-white/10 pl-4">
                    {currentMonthTheme.description}
                  </p>
                </div>
              </div>

              {/* Right Col: Data Viz */}
              <div className="lg:col-span-7 flex flex-col justify-end">
                <div className="bg-white/5 rounded p-6 border border-white/5 relative overflow-hidden">
                   {/* Scanline */}
                   <motion.div 
                     className="absolute top-0 left-0 right-0 h-full bg-gradient-to-b from-transparent via-white/5 to-transparent z-0 pointer-events-none"
                     animate={{ top: ['-100%', '100%'] }}
                     transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   />
                   
                   <div className="relative z-10">
                     <div className="flex justify-between items-end mb-4">
                       <div className="text-4xl font-mono font-bold tabular-nums">
                         {Math.round(((currentDay - currentMonthTheme.dayStart) / (currentMonthTheme.dayEnd - currentMonthTheme.dayStart)) * 100)}
                         <span className="text-sm text-light-cream/30 ml-2">% COMPLETED</span>
                       </div>
                       <div className="text-right">
                         <div className="text-xs font-mono text-light-cream/40">DAYS REMAINING</div>
                         <div className="text-2xl font-mono text-accent">{currentMonthTheme.dayEnd - currentDay}</div>
                       </div>
                     </div>

                     {/* High Tech Progress Bar */}
                     <div className="h-4 bg-black/50 rounded overflow-hidden relative border border-white/10">
                       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                       <motion.div 
                          className="h-full relative"
                          style={{ 
                            width: `${((currentDay - currentMonthTheme.dayStart) / (currentMonthTheme.dayEnd - currentMonthTheme.dayStart)) * 100}%`,
                            background: `linear-gradient(90deg, ${getThemeColor(currentMonthTheme.pattern)} 0%, ${accent} 100%)`
                          }}
                       >
                         <div className="absolute right-0 top-0 bottom-0 w-px bg-white/50 shadow-[0_0_10px_white]" />
                       </motion.div>
                     </div>
                     
                     <div className="flex justify-between mt-2 font-mono text-[10px] text-light-cream/20">
                       <span>START: DAY {currentMonthTheme.dayStart}</span>
                       <span>END: DAY {currentMonthTheme.dayEnd}</span>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HORIZONTAL SCROLL STRIP */}
        <div className="relative mb-24">
          <div className="flex items-center justify-between mb-8 px-2">
            <h4 className="font-mono text-sm tracking-[0.3em] opacity-50">FULL_YEAR_OVERVIEW</h4>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-primary opacity-50"></span>
              <span className="w-2 h-2 rounded-full bg-accent opacity-50"></span>
            </div>
          </div>
          
          <div className="overflow-x-auto pb-12 -mx-6 px-6 scrollbar-none mask-fade-sides">
            <motion.div className="flex gap-6 w-max">
              {data.monthThemes.map((month, idx) => (
                <MonthCard 
                  key={month.month}
                  month={month}
                  index={idx}
                  isCurrent={currentDay >= month.dayStart && currentDay <= month.dayEnd}
                  isPast={currentDay > month.dayEnd}
                  isFuture={currentDay < month.dayStart}
                  color={getThemeColor(month.pattern)}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* SYSTEM BOOT PROGRESS (Bottom Timeline) */}
        <div className="max-w-4xl mx-auto border-t border-white/10 pt-16">
          <div className="grid grid-cols-4 gap-4 text-center">
             {[
               { icon: <Database className="w-4 h-4" />, label: "BOOT", range: "Q1" },
               { icon: <Activity className="w-4 h-4" />, label: "CRASH", range: "Q2" },
               { icon: <Cpu className="w-4 h-4" />, label: "RECOVER", range: "Q3" },
               { icon: <Cloud className="w-4 h-4" />, label: "TRANSCEND", range: "Q4" },
             ].map((phase, i) => {
               const isActive = currentDay > (i * 91); // Rough approximation
               return (
                 <div key={i} className={`relative group ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                   <div className="flex justify-center mb-4">
                     <div 
                       className="w-10 h-10 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 transition-colors duration-300 group-hover:border-primary/50 group-hover:bg-primary/10"
                     >
                       {phase.icon}
                     </div>
                   </div>
                   <div className="h-1 w-full bg-white/5 mb-4 overflow-hidden rounded-full">
                     <motion.div 
                       className="h-full bg-primary"
                       initial={{ width: 0 }}
                       whileInView={{ width: isActive ? '100%' : '0%' }}
                       transition={{ duration: 1, delay: 0.5 + (i * 0.2) }}
                     />
                   </div>
                   <div className="font-mono text-xs tracking-widest">{phase.label}</div>
                 </div>
               )
             })}
          </div>
        </div>

      </motion.div>
    </section>
  );
}

function MonthCard({ month, index, isCurrent, isPast, isFuture, color }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-72 h-80 flex-shrink-0 group ${isFuture ? 'opacity-40 grayscale' : ''}`}
    >
      <div 
        className="absolute inset-0 bg-void-black border border-white/10 transition-all duration-300"
        style={{
          borderColor: isCurrent || isHovered ? color : 'rgba(255,255,255,0.1)',
          boxShadow: isCurrent || isHovered ? `0 0 20px -5px ${color}40` : 'none',
          transform: isHovered ? 'translateY(-4px)' : 'none'
        }}
      >
        {/* Card Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
          <span className="font-black text-4xl opacity-20 font-mono select-none">
            {String(month.month).padStart(2, '0')}
          </span>
          <span className="text-2xl filter drop-shadow-glow">{month.emoji}</span>
        </div>

        {/* Card Body */}
        <div className="p-6 h-full flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-xl mb-2 uppercase tracking-tight" style={{ color: isCurrent || isHovered ? color : 'white' }}>
              {month.theme}
            </h4>
            <div className="w-8 h-px bg-white/20 mb-4 group-hover:w-full transition-all duration-500" style={{ background: color }} />
            <p className="text-xs text-light-cream/60 leading-relaxed line-clamp-3">
              {month.description}
            </p>
          </div>

          <div className="mt-8 flex justify-between items-end font-mono text-[10px] text-light-cream/30 uppercase tracking-widest">
            <span>{month.pattern || 'STABLE'}</span>
            <div className="flex items-center gap-1">
               {isPast && <span className="text-primary">COMPLETED</span>}
               {isCurrent && <span className="text-accent animate-pulse">ACTIVE</span>}
               {isFuture && <span>LOCKED</span>}
               <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Holographic Overlay Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </motion.div>
  )
}