import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { useAudioStore } from '../store/useAudioStore';
import { useState, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Play, Clock, Music, Calendar, Activity, Disc } from 'lucide-react';
import { CoverImage } from './GenerativeCover';
import { getCoverUrl } from '../services/releaseStorage';

// --- Custom Animated Icons ---

function WaveformIcon({ className = '', color }: { className?: string, color: string }) {
  return (
    <div className={`relative ${className}`} style={{ color }}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_0_8px_currentColor]">
        {[2, 7, 12, 17, 22, 27].map((x, i) => (
          <motion.rect
            key={i}
            x={x} y="12" width="3" height="8" rx="1" fill="currentColor" opacity={0.6 + (i * 0.1)}
            animate={{ 
              height: [8, 24, 8], 
              y: [12, 4, 12],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 0.8 + (i * 0.1), 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
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
          <motion.circle cx="28" cy="16" r="12" fill="black"
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
        <motion.circle cx="16" cy="14" r="2" fill="currentColor" 
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
  
  const { primary, accent, background } = currentTheme.colors;
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
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b border-white/10 pb-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
              <span className="text-xs font-mono tracking-[0.4em] text-light-cream/40">SYSTEM_TRACKER.v3</span>
            </div>
            <div className="flex items-end gap-3 mb-2">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-light-cream to-white/50">
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
              <div className="text-xs font-mono text-light-cream/50 tracking-wider">
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
            <div className="text-xs font-mono text-light-cream/40 mb-1">GLOBAL_PROGRESS</div>
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
                className="group relative h-48 w-full border border-white/10 bg-void-black/50 backdrop-blur-sm rounded-lg overflow-hidden transition-all hover:border-primary/50"
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${primary}20 0%, ${accent}15 100%)`
                  }}
                />
                <div className="p-4 h-full flex flex-col justify-between relative z-10">
                  <ChevronLeft className="w-6 h-6 text-light-cream/40 group-hover:text-primary transition-colors" />
                  <div>
                    <div className="text-xs font-mono text-light-cream/30 mb-1">PREVIOUS_LOG</div>
                    <div className="font-bold text-sm leading-tight text-light-cream/80 group-hover:text-light-cream">{prevRelease.title}</div>
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
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-700" />
            
            <div 
              className="relative rounded-xl overflow-hidden bg-[#0A0A0E] border border-white/10"
              style={{ boxShadow: `0 0 50px -10px ${isLight ? accent : primary}20` }}
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
                          coverUrl={getCoverUrl(todaysRelease.day, todaysRelease.title)}
                          className="w-full h-full object-cover"
                          showColorVeil
                        />
                     </div>
                     
                     {/* Interactive Overlay */}
                     <div className="absolute inset-0 bg-void-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handlePlayClick}
                          className="w-20 h-20 rounded-full flex items-center justify-center border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] group/btn"
                        >
                          <Play className="w-8 h-8 fill-light-cream text-light-cream ml-1 group-hover/btn:scale-110 transition-transform" />
                        </motion.button>
                     </div>

                     {/* Image Tech Overlay */}
                     <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
                       <span className="text-[10px] font-mono bg-black/50 backdrop-blur px-2 py-1 rounded text-light-cream/70 border border-white/10">
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
                        <Calendar className="w-4 h-4 text-light-cream/30" />
                        <span className="font-mono text-xs text-light-cream/50">{formatDisplayDate(currentDay)}</span>
                        <div className="h-px w-8 bg-white/10" />
                        <span className="font-mono text-xs text-primary">DAY {String(currentDay).padStart(3, '0')}</span>
                      </div>

                      <h3 className="text-3xl md:text-4xl font-black mb-3 leading-tight" style={{ color: isLight ? accent : primary }}>
                        {todaysRelease.title}
                      </h3>
                      
                      <p className="text-light-cream/60 text-sm leading-relaxed mb-6 border-l-2 border-white/10 pl-4">
                        {todaysRelease.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                         <div className="bg-white/5 rounded p-3 border border-white/5">
                            <div className="flex items-center gap-2 text-xs font-mono text-light-cream/40 mb-1">
                              <Clock className="w-3 h-3" /> DURATION
                            </div>
                            <div className="font-bold">{todaysRelease.durationFormatted}</div>
                         </div>
                         <div className="bg-white/5 rounded p-3 border border-white/5">
                            <div className="flex items-center gap-2 text-xs font-mono text-light-cream/40 mb-1">
                              <Music className="w-3 h-3" /> BPM / KEY
                            </div>
                            <div className="font-bold">{todaysRelease.tempo} <span className="text-white/20">|</span> {todaysRelease.key}</div>
                         </div>
                      </div>
                    </div>

                    <div>
                      {/* Technical Detail Expander */}
                      <button 
                        onClick={() => setExpandedInfo(!expandedInfo)}
                        className="w-full py-3 border-t border-white/10 flex items-center justify-between text-xs font-mono tracking-widest hover:text-primary transition-colors"
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
                                      <span className="text-light-cream/30 uppercase">{metric}</span>
                                      <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
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
                             <div className="mt-4 pt-4 border-t border-white/10">
                               <button 
                                 onClick={() => navigate(`/day/${currentDay}`)}
                                 className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs font-bold transition-colors"
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
                   <div className="w-20 h-20 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center mb-6 animate-spin-slow">
                     <Disc className="w-10 h-10 text-white/20" />
                   </div>
                   <h3 className="text-2xl font-bold mb-2">SIGNAL_LOST</h3>
                   <p className="font-mono text-sm text-light-cream/40">No transmission found for Day {currentDay}</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT: Next Log (Future) */}
          <div className="lg:col-span-2 hidden lg:flex flex-col justify-center">
             <div className="h-48 w-full border border-white/5 bg-void-black/20 rounded-lg p-4 flex flex-col justify-center items-end opacity-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <ChevronRight className="w-6 h-6 text-light-cream/20 mb-auto" />
                <div className="text-right">
                  <div className="text-xs font-mono text-light-cream/20 mb-1">INCOMING</div>
                  <div className="font-bold text-sm text-light-cream/40">
                    {hasNextRelease ? `Day ${nextDay}` : 'END_OF_LINE'}
                  </div>
                  {hasNextRelease && <div className="text-[10px] text-primary mt-1 animate-pulse">LOCKED</div>}
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
              <div className="text-xs font-mono text-light-cream/50 uppercase tracking-wider">CURRENT_PHASE</div>
              <div className="text-sm font-bold text-light-cream" style={{ color: primary }}>{currentMonthTheme.arc}</div>
              <div className="text-[10px] font-mono text-light-cream/40 mt-1">Days {currentMonthTheme.dayStart}–{currentMonthTheme.dayEnd}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-light-cream/50 mb-1">PROGRESS</div>
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
            icon={<WaveformIcon className="w-6 h-6" color={primary} />}
            label="RELEASES"
            value={data?.stats.totalReleases || 0}
            color={primary}
          />
           <StatModule 
            icon={<SunburstIcon className="w-6 h-6" color="#FFFF00" />}
            label="LIGHT_SIDE"
            value={data?.stats.lightTracks || 0}
            color="#FFFF00"
          />
           <StatModule 
            icon={<MoonPhaseIcon className="w-6 h-6" color="#FF0000" />}
            label="DARK_SIDE"
            value={data?.stats.darkTracks || 0}
            color="#FF0000"
          />
           <StatModule 
            icon={<HourglassIcon className="w-6 h-6" color={accent} />}
            label="REMAINING"
            value={totalDays - currentDay}
            color={accent}
          />
        </motion.div>

      </div>
    </section>
  );
}

// --- Sub-components ---

function StatModule({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  return (
    <div className="group relative bg-[#0F0F13] border border-white/5 p-5 rounded-lg overflow-hidden hover:border-white/20 transition-all duration-300">
      {/* Active Corner */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 group-hover:border-white/50 transition-colors" />
      
      {/* Background Glow */}
      <div 
        className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
        style={{ background: color }}
      />

      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-md border border-white/5 group-hover:border-white/10 transition-colors">
          {icon}
        </div>
        <Activity className="w-4 h-4 text-white/10 group-hover:text-white/30" />
      </div>

      <div>
        <div className="text-3xl font-black tabular-nums tracking-tight mb-1" style={{ textShadow: `0 0 20px ${color}40` }}>
           {value}
        </div>
        <div className="text-[10px] font-mono tracking-widest text-light-cream/40 group-hover:text-light-cream/60 transition-colors">
          {label}
        </div>
      </div>
    </div>
  )
}