import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function MonthThemes() {
  const { data, currentDay } = useStore();
  const { currentTheme } = useThemeStore();
  const { primary, accent, text } = currentTheme.colors;

  // Filter only current and future themes
  const themes = data?.monthThemes.sort((a, b) => a.dayStart - b.dayStart) || [];
  
  // Find current active theme
  const currentMonthIndex = themes.findIndex(t => currentDay >= t.dayStart && currentDay <= t.dayEnd);
  
  // Only show current + next 2 themes
  const displayThemes = themes.slice(Math.max(0, currentMonthIndex), Math.max(0, currentMonthIndex) + 3);

  if (!displayThemes.length) return null;

  return (
    <section id="themes" className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-mono tracking-[0.3em] uppercase mb-4 block transition-colors duration-500" style={{ color: accent }}>
            System Aesthetics
          </span>
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="text-transparent bg-clip-text transition-colors duration-500" style={{ backgroundImage: `linear-gradient(to right, ${text}, ${hexToRgba(text, 0.5)})` }}>
              MONTHLY PROTOCOLS
            </span>
          </h2>
          <div className="w-24 h-1 mt-4 mx-auto transition-colors duration-500" style={{ background: `linear-gradient(to right, ${primary}, ${accent})` }} />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {displayThemes.map((theme, index) => {
             const isActive = index === 0; // First one in the slice is active/current
             
             return (
               <motion.div
                 key={theme.name}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: index * 0.1 }}
                 className={`relative group rounded-2xl overflow-hidden border transition-all duration-500 ${isActive ? 'ring-2 ring-offset-2 ring-offset-black' : 'opacity-80 hover:opacity-100'}`}
                 style={{ 
                   borderColor: isActive ? accent : hexToRgba(text, 0.1),
                   // Fix: Use CSS variable for Tailwind ring color
                   ['--tw-ring-color' as any]: isActive ? accent : 'transparent',
                   backgroundColor: 'rgba(10,10,15,0.6)'
                 }}
               >
                 {/* Theme Image / Placeholder */}
                 <div className="relative aspect-video overflow-hidden">
                    <div 
                      className="absolute inset-0 z-10 mix-blend-overlay opacity-60 transition-colors duration-500"
                      style={{ backgroundColor: primary }} 
                    />
                    {/* Generative Placeholder since we don't have explicit theme images yet */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black to-gray-900">
                      <div className="absolute inset-0 opacity-20" 
                           // Fix: Fallback to accent color since theme.color might not exist
                           style={{ backgroundImage: `radial-gradient(circle at 50% 50%, ${accent} 0%, transparent 70%)` }} 
                      />
                      {/* Grid overlay */}
                      <div 
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `linear-gradient(${text} 1px, transparent 1px), linear-gradient(90deg, ${text} 1px, transparent 1px)`,
                          backgroundSize: '20px 20px'
                        }}
                      />
                    </div>
                    
                    {/* Month Label */}
                    <div className="absolute bottom-0 left-0 p-6 z-20">
                      <div className="text-xs font-mono mb-1 text-white/60 uppercase tracking-widest">
                         Days {theme.dayStart} - {theme.dayEnd}
                      </div>
                      <h3 className="text-2xl font-bold uppercase text-white shadow-black drop-shadow-md">
                        {theme.name}
                      </h3>
                    </div>
                 </div>

                 {/* Description */}
                 <div className="p-6">
                    <p className="text-sm leading-relaxed opacity-70" style={{ color: text }}>
                       {theme.description}
                    </p>
                 </div>
               </motion.div>
             );
          })}
        </div>
      </div>
    </section>
  );
}