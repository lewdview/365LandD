import { useMemo, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform, LayoutGroup } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';

// --- VISUAL CONFIGURATION ---
const SYSTEM_CONFIG: Record<number, { 
  tagline: string; 
  synopsis: string;
  stability: 'stable' | 'unstable' | 'critical' | 'corrupted';
  fracture?: boolean;
}> = {
  1: { 
    tagline: 'Boot Sequence: Light Online', 
    synopsis: 'Hope initializes. Everything feels possible because nothing has failed yet. The system believes itself.',
    stability: 'stable' 
  },
  2: { 
    tagline: 'Desire Compiles', 
    synopsis: 'Connection, longing, and projection accelerate. Want is mistaken for truth. The system leans outward.',
    stability: 'stable' 
  },
  3: { 
    tagline: 'Velocity Without Direction', 
    synopsis: 'Momentum replaces intention. Movement feels like purpose. Cracks are ignored because speed feels alive.',
    stability: 'stable' 
  },
  4: { 
    tagline: 'First Contact With the Self', 
    synopsis: 'Reflection enters. Identity questions surface. Light still dominates, but doubt now exists.',
    stability: 'unstable' 
  },
  5: { 
    tagline: 'Overclocked Heart', 
    synopsis: 'Emotion exceeds capacity. Love, ambition, and belief push past safe limits. Warning signs flicker.',
    stability: 'unstable' 
  },
  6: { 
    tagline: 'Instability Detected', 
    synopsis: '—\n(No synopsis. This absence is intentional.)',
    stability: 'unstable', 
    fracture: true 
  },
  7: { 
    tagline: 'Heat Without Shelter', 
    synopsis: 'Survival mode. The system adapts instead of heals. Joy appears briefly, but it burns fast.',
    stability: 'unstable' 
  },
  8: { 
    tagline: 'Corruption Event', 
    synopsis: '—\n(No synopsis. This month resists explanation.)',
    stability: 'critical', 
    fracture: true 
  },
  9: { 
    tagline: 'Memory Leak', 
    synopsis: 'Past and present blur. Old truths resurface distorted. The system attempts repair by remembering.',
    stability: 'unstable' 
  },
  10: { 
    tagline: 'Rituals of Repair', 
    synopsis: 'Patterns form. Repetition becomes grounding. Meaning is rebuilt from fragments, not certainty.',
    stability: 'stable' 
  },
  11: { 
    tagline: 'Acceptance Without Resolution', 
    synopsis: 'Peace arrives unevenly. The system no longer fights its scars. Stability is provisional, but real.',
    stability: 'stable' 
  },
  12: { 
    tagline: 'SYSTEM RESET (Incomplete)', 
    synopsis: '—\n(Silence again. The listener must decide what reset means.)',
    stability: 'corrupted', 
    fracture: true 
  },
};

// --- HELPER COMPONENTS ---

const StabilityMeter = ({ status, color }: { status: string, color: string }) => {
  const getPattern = () => {
    switch(status) {
      case 'stable': return [1,1,1,1,1];
      case 'unstable': return [1,1,1,0,0];
      case 'critical': return [1,0,0,0,0];
      case 'corrupted': return [0,1,0,1,0];
      default: return [1,1,1,1,1];
    }
  };

  return (
    <div className="flex gap-1">
      {getPattern().map((fill, i) => (
        <div 
          key={i}
          className={`w-1.5 h-1.5 ${status === 'corrupted' ? 'animate-pulse' : ''}`}
          style={{ 
            backgroundColor: fill ? color : 'transparent',
            border: `1px solid ${color}`,
            opacity: fill ? 1 : 0.3
          }}
        />
      ))}
    </div>
  );
};

// NEW: Animated Background Component
const BubblingBackground = ({ primary, accent }: { primary: string, accent: string }) => {
  const blobVariants = {
    animate: {
      scale: [1, 1.2, 0.9, 1.1, 1],
      x: [0, 100, -50, 20, 0],
      y: [0, -50, 100, -20, 0],
      transition: {
        duration: 20,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const // FIX: Added 'as const' to fix TypeScript error
      }
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-black/60 z-10" /> {/* Darkener */}
      
      {/* Primary Blob */}
      <motion.div
        variants={blobVariants}
        animate="animate"
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 mix-blend-screen"
        style={{ backgroundColor: primary }}
      />
       {/* Accent Blob */}
      <motion.div
        variants={blobVariants}
        animate="animate"
        transition={{ delay: 5 }} // Offset animation
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 mix-blend-screen"
        style={{ backgroundColor: accent }}
      />
      {/* Secondary Primary Blob */}
       <motion.div
        variants={blobVariants}
        animate="animate"
        transition={{ delay: 10 }}
        className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full blur-3xl opacity-15 mix-blend-screen"
        style={{ backgroundColor: primary }}
      />
    </div>
  );
};


// --- 3D CARD COMPONENT ---

const ThemeCard = ({ 
  item, 
  index, 
  isActive, 
  onClick,
  primary, 
  accent, 
  text 
}: { 
  item: any, 
  index: number, 
  isActive: boolean,
  onClick: () => void,
  primary: string, 
  accent: string, 
  text: string 
}) => {
  const { config, stats } = item;
  
  // Motion Values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], isActive ? ["5deg", "-5deg"] : ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], isActive ? ["-5deg", "5deg"] : ["-10deg", "10deg"]);
  
  const brightness = useTransform(mouseY, [-0.5, 0.5], [1.1, 0.9]);

  function onMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const fractureVariants = {
    idle: { x: 0, opacity: isActive ? 1 : 0.8 },
    hover: config.fracture ? { 
      x: [-1, 1, -1, 0],
      opacity: [0.8, 0.6, 0.9, 0.8],
      transition: { duration: 0.2, repeat: Infinity, repeatType: "mirror" as const }
    } : { opacity: 1 }
  };

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.4, type: "spring", bounce: 0.2 } }}
      onClick={onClick}
      // UPDATED SIZING:
      // Inactive: h-[120px] (Smaller)
      // Active: row-span-4 (to maintain large size against smaller rows)
      className={`relative w-full ${isActive ? 'row-span-4 md:col-span-2 md:row-span-4 z-20 h-[550px]' : 'col-span-1 h-[120px] z-0'}`}
      style={{ perspective: 1000 }}
    >
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: "preserve-3d",
          filter: `brightness(${brightness})`
        }}
        initial="idle"
        whileHover="hover"
        className="w-full h-full relative cursor-pointer"
      >
        {/* -- BACK LAYER -- */}
        <motion.div 
          className="absolute inset-0 bg-black/40 backdrop-blur-md border overflow-hidden rounded-xl transition-all duration-300"
          style={{ 
            transform: 'translateZ(0px)',
            borderColor: isActive ? accent : (config.fracture ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'),
            backgroundColor: isActive ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.3)' // Slightly more transparent inactive state
          }}
          variants={fractureVariants}
        >
          {config.fracture && (
             <div className="absolute inset-0 border-l-2 opacity-50" style={{ borderColor: accent }} />
          )}
          
          {/* UPDATED GRID OPACITY: Lowered to opacity-[0.07] */}
          <div 
             className="absolute inset-0 opacity-[0.07]"
             style={{
                backgroundImage: `linear-gradient(${text} 1px, transparent 1px), linear-gradient(90deg, ${text} 1px, transparent 1px)`,
                backgroundSize: isActive ? '40px 40px' : '10px 10px'
             }} 
          />

          {isActive && (
            <div className="absolute inset-0 opacity-20" 
              style={{ background: `radial-gradient(circle at center, ${primary} 0%, transparent 70%)` }} 
            />
          )}
        </motion.div>

        {/* -- CONTENT LAYER -- */}
        {/* Tighter padding for inactive state (p-3) */}
        <div className={`absolute inset-0 flex flex-col justify-between ${isActive ? 'p-6' : 'p-3'}`} style={{ transform: 'translateZ(20px)' }}>
          
          {/* Top Section */}
          <div>
            <div className="flex justify-between items-start mb-1">
               <div className="flex flex-col">
                 {/* Smaller inactive title text (text-lg) */}
                 <h3 className={`${isActive ? 'text-4xl md:text-5xl mb-2' : 'text-lg'} font-bold uppercase tracking-tighter shadow-black drop-shadow-lg transition-all duration-300 leading-none`} style={{ color: text }}>
                   {item.name}
                 </h3>
                 {isActive && (
                   <span className="text-xs font-mono opacity-50 uppercase tracking-widest">
                     Days {item.dayStart} - {item.dayEnd}
                   </span>
                 )}
               </div>
               <span className={`font-mono opacity-30 ${isActive ? 'text-4xl font-bold opacity-10' : 'text-[9px]'}`}>
                 {String(index + 1).padStart(2, '0')}
               </span>
            </div>
            
            <div className={`font-mono uppercase tracking-widest truncate ${isActive ? 'text-sm mt-2 opacity-80' : 'text-[8px] opacity-40'}`} style={{ color: primary }}>
              {'>'} {config.tagline}
            </div>

            {/* Expanded Description */}
            {isActive && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.2 }}
                className="mt-6 text-sm leading-relaxed max-w-md"
                style={{ color: text }}
              >
                <p className="whitespace-pre-line">{config.synopsis}</p>
                <br />
                <span className="opacity-50 font-mono text-xs">
                  // SYSTEM NOTE: {config.stability === 'stable' ? 'All systems nominal.' : 'Performance degradation expected.'}
                </span>
              </motion.div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="space-y-4">
             <div className="flex justify-between items-end">
               <div className="flex flex-col gap-1">
                 {isActive && <span className="text-[9px] font-mono opacity-40 uppercase">System Stability</span>}
                 <StabilityMeter status={config.stability} color={text} />
               </div>
               
               <span className={`font-mono opacity-40 uppercase ${isActive ? 'text-[10px]' : 'text-[8px]'}`}>
                 SYS_{config.stability.substring(0,3)}
               </span>
             </div>

             {isActive && (
                <div className="border-t border-white/5 pt-2 flex flex-wrap gap-2">
                    {stats.motifs.map((motif: string) => (
                      <span 
                        key={motif} 
                        className="text-[9px] font-mono lowercase opacity-50 px-2 py-1 border border-white/5 bg-black/20 rounded-sm"
                      >
                        {motif}
                      </span>
                    ))}
                </div>
             )}
          </div>
        </div>

        {/* -- FRONT LAYER: EMOTIONAL BAR -- */}
        <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(40px)' }}>
           
           <div className={`absolute left-0 right-0 h-1 bg-white/5 overflow-hidden transition-all duration-500 ${isActive ? 'bottom-28 left-6 right-6' : 'bottom-0'}`}>
              <div 
                className="absolute inset-y-0 left-0 right-0 opacity-80"
                style={{
                  background: `linear-gradient(90deg, 
                    rgba(0,0,0,0) 0%, 
                    ${primary} ${stats.lightRatio * 100}%, 
                    rgba(255,255,255,0.1) 100%)`
                }}
              />
           </div>

           <div className={`absolute top-2 right-2 transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}>
               <span className="text-[9px] font-mono text-white/60 bg-black/80 px-2 py-1 rounded border border-white/10">
                 REL: {item.releases.length}
               </span>
           </div>

           {config.fracture && (
             <div className="absolute inset-0 bg-white/5 mix-blend-overlay opacity-0 hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
           )}
        </div>

      </motion.div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---

export function MonthThemes() {
  const { data, currentDay } = useStore();
  const { currentTheme } = useThemeStore();
  const { primary, accent, text } = currentTheme.colors;
  
  const [activeMonth, setActiveMonth] = useState<number | null>(null);

  useEffect(() => {
    if (data?.monthThemes && activeMonth === null) {
       const current = data.monthThemes.find(t => currentDay >= t.dayStart && currentDay <= t.dayEnd);
       setActiveMonth(current ? current.month : 1);
    }
  }, [data, currentDay, activeMonth]);

  const processedMonths = useMemo(() => {
    if (!data?.monthThemes) return [];
    
    const sortedThemes = [...data.monthThemes].sort((a, b) => a.dayStart - b.dayStart);
    const allReleases = data.releases || [];

    return sortedThemes.map((theme) => {
      const monthReleases = allReleases.filter(r => 
        r.day >= theme.dayStart && r.day <= theme.dayEnd
      );

      const total = monthReleases.length || 1;
      const lightCount = monthReleases.filter(r => r.mood === 'light').length;
      const lightRatio = lightCount / total;

      const tagCounts: Record<string, number> = {};
      monthReleases.forEach(r => {
        r.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      const motifs = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5) 
        .map(([tag]) => tag);

      const config = SYSTEM_CONFIG[theme.month] || { 
        tagline: 'System Idle', 
        synopsis: 'No data available.', 
        stability: 'stable' 
      };

      return {
        ...theme,
        releases: monthReleases,
        stats: {
          lightRatio,
          motifs: motifs.length ? motifs : ['void', 'signal', 'null'],
        },
        config
      };
    });
  }, [data]);

  if (!processedMonths.length) return null;

  return (
    <section className="py-24 px-4 md:px-8 relative overflow-hidden min-h-screen">
      {/* Insert Animated Background */}
      <BubblingBackground primary={primary} accent={accent} />

      <div className="max-w-7xl mx-auto relative z-10">
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12 border-b border-white/10 pb-4 flex justify-between items-end"
        >
          <h2 className="text-xl md:text-2xl font-mono tracking-tighter uppercase" style={{ color: text }}>
            System_Roadmap_v1.0
          </h2>
          <div className="text-xs font-mono opacity-50 hidden md:block">
            STATUS: INTERACTIVE // SELECT_NODE_FOR_DETAILS
          </div>
        </motion.div>

        <LayoutGroup>
          <motion.div 
            layout 
            // UPDATED GRID: auto-rows-[120px] for much smaller markers
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[120px] grid-flow-dense"
          >
            {processedMonths.map((item, index) => (
               <ThemeCard 
                 key={item.month}
                 item={item} 
                 index={index}
                 isActive={activeMonth === item.month}
                 onClick={() => setActiveMonth(item.month)}
                 primary={primary}
                 accent={accent}
                 text={text}
               />
            ))}
          </motion.div>
        </LayoutGroup>
      </div>
    </section>
  );
}