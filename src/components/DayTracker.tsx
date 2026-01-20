import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { useAudioStore } from '../store/useAudioStore';
import { useState, useCallback, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Play, 
  Clock, 
  Music, 
  Calendar, 
  Activity, 
  Disc,
  Info 
} from 'lucide-react';
import { CoverImage } from './GenerativeCover';
import { getCoverUrl } from '../services/releaseStorage';

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// --- Custom Animated Icons ---

function WaveformIcon({ className = '', color }: { className?: string, color: string }) {
  return (
    <div className={`relative ${className}`} style={{ color }}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_0_8px_currentColor]">
        {[2, 7, 12, 17, 22, 27].map((x, i) => (
          <motion.rect
            key={i}
            x={x} width="3" rx="1" fill="currentColor"
            initial={{ height: 8, y: 12, opacity: 0.5 }}
            animate={{ height: [8, 24, 8], y: [12, 4, 12], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8 + (i * 0.1), repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </svg>
    </div>
  );
}

function SunburstIcon({ className = '', color }: { className?: string, color: string }) {
  return (
    <div className={`relative ${className}`} style={{ color }}>
      <motion.svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_0_8px_currentColor]"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <circle cx="16" cy="16" r="6" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <motion.line 
              key={i} x1="16" y1="2" x2="16" y2="6" 
              transform={`rotate(${deg} 16 16)`}
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
            />
          ))}
        </g>
      </motion.svg>
    </div>
  );
}

function MoonPhaseIcon({ className = '', color }: { className?: string, color: string }) {
  return (
    <div className={`relative ${className}`} style={{ color }}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_0_8px_currentColor]">
        <mask id="moonMask">
          <circle cx="16" cy="16" r="12" fill="white" />
          <motion.circle 
            cy="16" r="12" fill="black"
            initial={{ cx: 28 }}
            animate={{ cx: [28, -4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </mask>
        <circle cx="16" cy="16" r="12" fill="currentColor" mask="url(#moonMask)" />
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  );
}

function HourglassIcon({ className = '', color }: { className?: string, color: string }) {
  return (
    <div className={`relative ${className}`} style={{ color }}>
      <motion.svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_0_8px_currentColor]"
        animate={{ rotate: [0, 180, 180] }}
        transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 1], ease: "easeInOut" }}
      >
        <path d="M8 4h16v6c0 2-2 4-4 6l-4 3 4 3c2 2 4 4 4 6v6H8v-6c0-2 2-4 4-6l4-3-4-3c-2-2-4-4-4-6V4z" stroke="currentColor" strokeWidth="2" />
        <motion.circle 
          cx="16" fill="currentColor" 
          initial={{ cy: 14, r: 2 }}
          animate={{ cy: [14, 24], r: [2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.svg>
    </div>
  );
}

// --- Main Component ---

export function DayTracker() {
  const { data, currentDay } = useStore();
  const { currentTheme } = useThemeStore();
  const { loadAndPlay } = useAudioStore();
  const navigate = useNavigate();
  const [expandedInfo, setExpandedInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (data?.releases && currentDay) {
      const release = data.releases.find(r => r.day === currentDay);
      if (release) loadAndPlay(release);
    }
  }, [data, currentDay, loadAndPlay]);
  
  const { primary, secondary, accent, background, text } = currentTheme.colors;
  const totalDays = data?.project.totalDays || 365;
  const progress = (currentDay / totalDays) * 100;

  // Navigation Logic
  const todaysRelease = data?.releases.find(r => r.day === currentDay);
  const prevRelease = data?.releases.filter(r => r.day < currentDay).sort((a, b) => b.day - a.day)[0];
  const nextDay = currentDay + 1;
  const hasNextRelease = data?.releases.some(r => r.day === nextDay);
  const isLight = todaysRelease?.mood === 'light';
  
  // Get current month theme
  const currentMonthTheme = data?.monthThemes.find(
    m => currentDay >= m.dayStart && currentDay <= m.dayEnd
  );

  // Format Date
  const formatDisplayDate = (dayNum: number) => {
    const startDate = new Date(data?.project.startDate || '2026-01-01');
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + dayNum - 1);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <section 
      id="tracker" 
      ref={containerRef}
      className="py-24 px-6 md:px-12 lg:px-16 relative overflow-hidden min-h-[90vh] flex flex-col justify-center"
      style={{ color: text }}
    >
      {/* 2030 Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${primary}20 1px, transparent 1px), linear-gradient(90deg, ${primary}20 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
          }}
        />
        <motion.div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent, ${hexToRgba(primary, 0.05)}, transparent)`
          }}
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Header HUD */}
        <div 
          className="flex flex-col md:flex-row items-end justify-between mb-12 border-b pb-6"
          style={{ borderColor: hexToRgba(text, 0.1) }}
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
              <span className="text-xs font-mono tracking-[0.4em]" style={{ color: hexToRgba(text, 0.4) }}>SYSTEM_TRACKER.v3</span>
            </div>
            <div className="flex items-end gap-3 mb-2">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
                <span 
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: `linear-gradient(to right, ${text}, ${hexToRgba(text, 0.5)})` }}
                >
                  Daily Transmission
                </span>
              </h2>
              {currentMonthTheme && (
                <div className="text-xl md:text-2xl" title={currentMonthTheme.arc}>
                  {currentMonthTheme.emoji}
                </div>
              )}
            </div>
            {currentMonthTheme && (
              <div className="text-xs font-mono tracking-wider" style={{ color: hexToRgba(text, 0.5) }}>
                {currentMonthTheme.theme}
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-right hidden md:block"
          >
            <div className="text-xs font-mono mb-1" style={{ color: hexToRgba(text, 0.4) }}>GLOBAL_PROGRESS</div>
            <div className="text-3xl font-mono font-bold" style={{ color: accent }}>
              {Math.round(progress)}<span className="text-sm opacity-50">%</span>
            </div>
          </motion.div>
        </div>

        {/* MAIN INTERFACE GRID */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Previous Log (History) */}
          <div className="lg:col-span-2 hidden lg:flex flex-col justify-center">
            {prevRelease && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                onClick={() => navigate(`/day/${prevRelease.day}`)}
                className="group relative h-48 w-full border backdrop-blur-sm rounded-lg overflow-hidden transition-all"
                style={{
                  backgroundColor: hexToRgba(background, 0.5),
                  borderColor: hexToRgba(text, 0.1)
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${primary}20 0%, ${accent}15 100%)`
                  }}
                />
                <div className="p-4 h-full flex flex-col justify-between relative z-10">
                  <ChevronLeft className="w-6 h-6 transition-colors" style={{ color: hexToRgba(text, 0.4) }} />
                  <div>
                    <div className="text-xs font-mono mb-1" style={{ color: hexToRgba(text, 0.3) }}>PREVIOUS_LOG</div>
                    <div className="font-bold text-sm leading-tight text-left" style={{ color: hexToRgba(text, 0.8) }}>{prevRelease.title}</div>
                  </div>
                </div>
              </motion.button>
            )}
          </div>

          {/* CENTER: The "Hyper-Card" */}
          <motion.div 
            className="lg:col-span-8 relative group"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            {/* Glow Halo */}
            <div 
              className="absolute -inset-1 rounded-xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-700" 
              style={{ background: `linear-gradient(to right, ${primary}, ${accent})` }}
            />
            
            <div 
              className="relative rounded-xl overflow-hidden border"
              style={{ 
                backgroundColor: hexToRgba(background, 0.6),
                borderColor: hexToRgba(text, 0.1),
                boxShadow: `0 0 50px -10px ${isLight ? accent : primary}20` 
              }}
            >
              {todaysRelease ? (
                <div className="flex flex-col md:flex-row">
                  
                  {/* COVER ART SECTION */}
                  <div className="md:w-1/2 relative h-64 md:h-auto min-h-[350px] overflow-hidden">
                     {/* Dynamic Cover */}
                     <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                        <CoverImage
                          day={todaysRelease.day}
                          title={todaysRelease.title}
                          mood={todaysRelease.mood}
                          energy={todaysRelease.energy}
                          valence={todaysRelease.valence}
                          tempo={todaysRelease.tempo}
                          coverUrl={getCoverUrl(todaysRelease.day, todaysRelease.storageTitle || todaysRelease.title)}
                          className="w-full h-full object-cover"
                          showColorVeil
                        />
                     </div>
                     
                     {/* Interactive Overlay */}
                     <div className="absolute inset-0 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center" style={{ backgroundColor: hexToRgba(background, 0.4) }}>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handlePlayClick}
                          className="w-20 h-20 rounded-full flex items-center justify-center border backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] group/btn"
                          style={{
                            borderColor: hexToRgba(text, 0.2),
                            backgroundColor: hexToRgba(text, 0.1)
                          }}
                        >
                          <Play className="w-8 h-8 ml-1 group-hover/btn:scale-110 transition-transform" style={{ fill: text, color: text }} />
                        </motion.button>
                     </div>

                     {/* Image Tech Overlay */}
                     <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                       <span 
                         className="text-[10px] font-mono backdrop-blur px-2 py-1 rounded border"
                         style={{ 
                           backgroundColor: hexToRgba(background, 0.5),
                           color: hexToRgba(text, 0.7),
                           borderColor: hexToRgba(text, 0.1)
                         }}
                       >
                         IMG_SRC: GEN_ART_V2
                       </span>
                       <span 
                         className="text-[10px] font-mono px-2 py-1 rounded font-bold border border-white/10"
                         style={{ background: isLight ? accent : primary, color: background }}
                       >
                         {todaysRelease.mood.toUpperCase()}
                       </span>
                     </div>
                  </div>

                  {/* DATA SECTION */}
                  <div 
                    className="md:w-1/2 p-8 flex flex-col justify-between relative bg-gradient-to-b"
                    style={{
                      backgroundImage: `linear-gradient(180deg, ${primary}08 0%, ${accent}05 100%)`
                    }}
                  >
                    {/* Scanline Texture */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
                    
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Calendar className="w-4 h-4" style={{ color: hexToRgba(text, 0.3) }} />
                        <span className="font-mono text-xs" style={{ color: hexToRgba(text, 0.5) }}>{formatDisplayDate(currentDay)}</span>
                        <div className="h-px w-8" style={{ backgroundColor: hexToRgba(text, 0.1) }} />
                        <span className="font-mono text-xs" style={{ color: primary }}>DAY {String(currentDay).padStart(3, '0')}</span>
                      </div>

                      <h3 className="text-3xl md:text-4xl font-black mb-3 leading-tight" style={{ color: isLight ? accent : primary }}>
                        {todaysRelease.title}
                      </h3>
                      
                      <p className="text-sm leading-relaxed mb-6 border-l-2 pl-4" style={{ color: hexToRgba(text, 0.6), borderColor: hexToRgba(text, 0.1) }}>
                        {todaysRelease.description}
                      </p>

                      {/* --- CUSTOM INFO INJECTION --- */}
                      {todaysRelease.customInfo && (
                        <div className="mb-6 p-3 rounded border bg-black/10 backdrop-blur-sm" style={{ borderColor: hexToRgba(isLight ? accent : primary, 0.2) }}>
                          <div className="flex items-center gap-2 mb-2 opacity-80" style={{ color: isLight ? accent : primary }}>
                            <Info className="w-3 h-3" />
                            <span className="text-[10px] font-mono uppercase tracking-wider">Intel</span>
                          </div>
                          <div 
                            className="text-xs prose prose-invert prose-p:my-1 max-h-32 overflow-y-auto custom-scrollbar"
                            dangerouslySetInnerHTML={{ __html: todaysRelease.customInfo }} 
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="rounded p-3 border" style={{ backgroundColor: hexToRgba(text, 0.05), borderColor: hexToRgba(text, 0.05) }}>
                            <div className="flex items-center gap-2 text-xs font-mono mb-1" style={{ color: hexToRgba(text, 0.4) }}>
                              <Clock className="w-3 h-3" /> DURATION
                            </div>
                            <div className="font-bold">{todaysRelease.durationFormatted}</div>
                         </div>
                         <div className="rounded p-3 border" style={{ backgroundColor: hexToRgba(text, 0.05), borderColor: hexToRgba(text, 0.05) }}>
                            <div className="flex items-center gap-2 text-xs font-mono mb-1" style={{ color: hexToRgba(text, 0.4) }}>
                              <Music className="w-3 h-3" /> BPM / KEY
                            </div>
                            <div className="font-bold">{todaysRelease.tempo} <span style={{ color: hexToRgba(text, 0.2) }}>|</span> {todaysRelease.key}</div>
                         </div>
                      </div>
                    </div>

                    <div>
                      {/* Technical Detail Expander */}
                      <button 
                        onClick={() => setExpandedInfo(!expandedInfo)}
                        className="w-full py-3 border-t flex items-center justify-between text-xs font-mono tracking-widest hover:opacity-80 transition-opacity"
                        style={{ borderColor: hexToRgba(text, 0.1), color: isLight ? accent : primary }}
                      >
                        <span>{expandedInfo ? 'COLLAPSE_DATA' : 'ANALYZE_AUDIO_DATA'}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedInfo ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {expandedInfo && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                             <div className="pt-4 grid grid-cols-2 gap-2 text-[10px] font-mono">
                                {['Energy', 'Valence', 'Danceability', 'Acousticness'].map((metric, i) => {
                                  const val = i === 0 ? todaysRelease.energy : i === 1 ? todaysRelease.valence : 0.5;
                                  return (
                                    <div key={metric} className="flex flex-col gap-1">
                                      <span className="uppercase" style={{ color: hexToRgba(text, 0.3) }}>{metric}</span>
                                      <div className="h-1 w-full rounded-full overflow-hidden" style={{ backgroundColor: hexToRgba(text, 0.1) }}>
                                        <motion.div 
                                          className="h-full" 
                                          style={{ background: isLight ? accent : primary }}
                                          initial={{ width: 0 }}
                                          animate={{ width: `${val * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  )
                                })}
                             </div>
                             <div className="mt-4 pt-4 border-t" style={{ borderColor: hexToRgba(text, 0.1) }}>
                               <button 
                                 onClick={() => navigate(`/day/${currentDay}`)}
                                 className="w-full py-2 border rounded text-xs font-bold transition-colors"
                                 style={{ 
                                   backgroundColor: hexToRgba(text, 0.05),
                                   borderColor: hexToRgba(text, 0.1),
                                   color: text 
                                 }}
                               >
                                 INITIALIZE FULL SEQUENCE →
                               </button>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex flex-col items-center justify-center text-center p-12">
                   <div className="w-20 h-20 border-2 border-dashed rounded-full flex items-center justify-center mb-6 animate-spin-slow" style={{ borderColor: hexToRgba(text, 0.2) }}>
                     <Disc className="w-10 h-10" style={{ color: hexToRgba(text, 0.2) }} />
                   </div>
                   <h3 className="text-2xl font-bold mb-2">SIGNAL_LOST</h3>
                   <p className="font-mono text-sm" style={{ color: hexToRgba(text, 0.4) }}>No transmission found for Day {currentDay}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT: Next Log (Future) */}
          <div className="lg:col-span-2 hidden lg:flex flex-col justify-center">
             <div 
               className="h-48 w-full border rounded-lg p-4 flex flex-col justify-center items-end opacity-50 relative overflow-hidden"
               style={{
                 backgroundColor: hexToRgba(background, 0.2),
                 borderColor: hexToRgba(text, 0.05)
               }}
             >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <ChevronRight className="w-6 h-6 mb-auto" style={{ color: hexToRgba(text, 0.2) }} />
                <div className="text-right">
                  <div className="text-xs font-mono mb-1" style={{ color: hexToRgba(text, 0.2) }}>INCOMING</div>
                  <div className="font-bold text-sm" style={{ color: hexToRgba(text, 0.4) }}>
                    {hasNextRelease ? `Day ${nextDay}` : 'END_OF_LINE'}
                  </div>
                  {hasNextRelease && <div className="text-[10px] mt-1 animate-pulse" style={{ color: primary }}>LOCKED</div>}
                </div>
             </div>
          </div>
        </div>

        {/* PHASE CONTEXT BADGE */}
        {currentMonthTheme && (
          <motion.div 
            className="mt-12 flex items-center gap-4 px-6 py-4 rounded-lg border"
            style={{
              background: `linear-gradient(135deg, ${primary}15 0%, ${accent}12 100%)`,
              borderColor: `${primary}40`
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="text-2xl">{currentMonthTheme.emoji}</div>
            <div className="flex-1">
              <div className="text-xs font-mono uppercase tracking-wider" style={{ color: hexToRgba(text, 0.5) }}>CURRENT_PHASE</div>
              <div className="text-sm font-bold" style={{ color: primary }}>{currentMonthTheme.arc}</div>
              <div className="text-[10px] font-mono mt-1" style={{ color: hexToRgba(text, 0.4) }}>Days {currentMonthTheme.dayStart}–{currentMonthTheme.dayEnd}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono mb-1" style={{ color: hexToRgba(text, 0.5) }}>PROGRESS</div>
              <div className="text-lg font-bold" style={{ color: accent }}>
                {Math.round(((currentDay - currentMonthTheme.dayStart) / (currentMonthTheme.dayEnd - currentMonthTheme.dayStart)) * 100)}%
              </div>
            </div>
          </motion.div>
        )}

        {/* STATS MODULES (Bottom Row) */}
        <motion.div 
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <StatModule 
            icon={<WaveformIcon className="w-6 h-6" color={secondary} />}
            label="RELEASES"
            value={data?.stats.totalReleases || 0}
            color={secondary}
          />
           <StatModule 
            icon={<SunburstIcon className="w-6 h-6" color={accent} />}
            label="LIGHT_SIDE"
            value={data?.stats.lightTracks || 0}
            color={accent}
          />
           <StatModule 
            icon={<MoonPhaseIcon className="w-6 h-6" color={primary} />}
            label="DARK_SIDE"
            value={data?.stats.darkTracks || 0}
            color={primary}
          />
           <StatModule 
            icon={<HourglassIcon className="w-6 h-6" color={hexToRgba(text, 0.7)} />}
            label="REMAINING"
            value={totalDays - currentDay}
            color={hexToRgba(text, 0.7)}
          />
        </motion.div>

      </div>
    </section>
  );
}

// --- Sub-components ---

function StatModule({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  const { currentTheme } = useThemeStore();
  const { background, text } = currentTheme.colors;
  
  return (
    <div 
      className="group relative border p-5 rounded-lg overflow-hidden transition-all duration-300"
      style={{ 
        backgroundColor: hexToRgba(background, 0.6),
        borderColor: hexToRgba(text, 0.05)
      }}
    >
      {/* Active Corner */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r transition-colors" style={{ borderColor: hexToRgba(text, 0.2) }} />
      
      {/* Background Glow */}
      <div 
        className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: color }}
      />

      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-md border transition-colors" style={{ backgroundColor: hexToRgba(text, 0.05), borderColor: hexToRgba(text, 0.05) }}>
          {icon}
        </div>
        <Activity className="w-4 h-4" style={{ color: hexToRgba(text, 0.1) }} />
      </div>

      <div>
        <div className="text-3xl font-black tabular-nums tracking-tight mb-1" style={{ textShadow: `0 0 20px ${color}40`, color: text }}>
           {value}
        </div>
        <div className="text-[10px] font-mono tracking-widest transition-colors" style={{ color: hexToRgba(text, 0.4) }}>
          {label}
        </div>
      </div>
    </div>
  )
} 