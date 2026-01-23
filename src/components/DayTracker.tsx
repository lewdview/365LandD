import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { useAudioStore } from '../store/useAudioStore';
import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Clock, 
  Music, 
  Activity, 
  Disc,
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

const BOLD_TEXT_STYLE = {
  textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
};

const BOLD_TEXT_STYLE_SMALL = {
  textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
};

// 2030 "Reactor" Play Button
function ReactorPlayButton({ isPlaying, onClick, color }: { isPlaying: boolean, onClick: (e: any) => void, color: string }) {
  return (
    <button 
      onClick={onClick}
      className="group relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center focus:outline-none z-30"
    >
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-dashed opacity-100 transition-colors duration-300"
        style={{ borderColor: color, filter: 'drop-shadow(0 0 3px black)' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute inset-2 rounded-full opacity-60 blur-md transition-colors duration-300"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div 
        className="absolute inset-3 rounded-full backdrop-blur-xl border-2 border-white/60 shadow-inner flex items-center justify-center transition-transform group-hover:scale-95 group-active:scale-90 duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${hexToRgba(color, 0.8)}, ${hexToRgba('#000000', 0.9)})`,
          boxShadow: `0 0 20px ${hexToRgba(color, 0.5)}, inset 0 0 10px rgba(255,255,255,0.5)`
        }}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 md:w-10 md:h-10 text-white fill-white drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]" />
        ) : (
          <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1 drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]" />
        )}
      </div>
    </button>
  );
}

function StatModule({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  const { currentTheme } = useThemeStore();
  const { background, text } = currentTheme.colors;
  
  return (
    <div 
      className="group relative border p-5 rounded-lg overflow-hidden transition-all duration-300 backdrop-blur-sm"
      style={{ 
        backgroundColor: hexToRgba(background, 0.6),
        borderColor: hexToRgba(text, 0.05)
      }}
    >
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r transition-colors duration-300" style={{ borderColor: hexToRgba(text, 0.2) }} />
      <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-all duration-500" style={{ background: color }} />

      <div className="flex justify-between items-start mb-4">
        <div className="p-2 rounded-md border transition-colors duration-300" style={{ backgroundColor: hexToRgba(text, 0.05), borderColor: hexToRgba(text, 0.05) }}>
          {icon}
        </div>
        <Activity className="w-4 h-4" style={{ color: hexToRgba(text, 0.1) }} />
      </div>

      <div>
        <div className="text-3xl font-black tabular-nums tracking-tight mb-1 transition-colors duration-300" style={{ textShadow: `0 0 20px ${color}40`, color: text }}>
           {value}
        </div>
        <div className="text-[10px] font-mono tracking-widest transition-colors duration-300" style={{ color: hexToRgba(text, 0.4) }}>
          {label}
        </div>
      </div>
    </div>
  )
}

function WaveformIcon({ className = '', color }: { className?: string, color: string }) {
  return (
    <div className={`relative ${className}`} style={{ color }}>
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-[0_0_8px_currentColor]">
        {[2, 7, 12, 17, 22, 27].map((x, i) => (
          <motion.rect
            key={i} x={x} width="3" rx="1" fill="currentColor"
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
            <motion.line key={i} x1="16" y1="2" x2="16" y2="6" transform={`rotate(${deg} 16 16)`}
              initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity }}
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
          <motion.circle cy="16" r="12" fill="black" initial={{ cx: 28 }} animate={{ cx: [28, -4] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
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
        animate={{ rotate: [0, 180, 180] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.1, 1], ease: "easeInOut" }}
      >
        <path d="M8 4h16v6c0 2-2 4-4 6l-4 3 4 3c2 2 4 4 4 6v6H8v-6c0-2 2-4 4-6l4-3-4-3c-2-2-4-4-4-6V4z" stroke="currentColor" strokeWidth="2" />
        <motion.circle cx="16" fill="currentColor" initial={{ cy: 14, r: 2 }} animate={{ cy: [14, 24], r: [2, 0] }} transition={{ duration: 2, repeat: Infinity }} />
      </motion.svg>
    </div>
  );
}

export function DayTracker() {
  const { data, currentDay } = useStore();
  const { currentTheme } = useThemeStore();
  const { loadAndPlay, currentRelease, isPlaying, togglePlay } = useAudioStore();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for the Carousel logic
  // Default to URL day, but updates if user slides or global player skips
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);

  // FIXED: Removed 'background' which was unused in this scope
  const { primary, secondary, accent, text } = currentTheme.colors;
  const totalDays = data?.project.totalDays || 365;
  const progress = (currentDay / totalDays) * 100;

  // Initialize focus index once data loads
  useEffect(() => {
    if (data?.releases) {
      // If a song is playing, sync carousel to it initially
      if (currentRelease) {
        const idx = data.releases.findIndex(r => r.day === currentRelease.day);
        if (idx !== -1) setFocusedIndex(idx);
      } else {
        // Otherwise sync to page URL (currentDay)
        const idx = data.releases.findIndex(r => r.day === currentDay);
        if (idx !== -1) setFocusedIndex(idx);
      }
    }
  }, [data, currentDay]);

  // SYNC: When Global Player changes track, update Carousel focus
  useEffect(() => {
    if (currentRelease && data?.releases) {
      const idx = data.releases.findIndex(r => r.day === currentRelease.day);
      if (idx !== -1 && idx !== focusedIndex) {
        setSlideDirection(idx > focusedIndex ? 1 : -1);
        setFocusedIndex(idx);
      }
    }
  }, [currentRelease, data?.releases]);

  const handleNext = () => {
    if (!data?.releases) return;
    if (focusedIndex < data.releases.length - 1) {
      setSlideDirection(1);
      setFocusedIndex(prev => prev + 1);
      loadAndPlay(data.releases[focusedIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!data?.releases) return;
    if (focusedIndex > 0) {
      setSlideDirection(-1);
      setFocusedIndex(prev => prev - 1);
      loadAndPlay(data.releases[focusedIndex - 1]);
    }
  };

  const activeRelease = data?.releases[focusedIndex];
  const isLight = activeRelease?.mood === 'light';
  const moodColor = isLight ? accent : primary;
  
  const isThisPlaying = currentRelease?.day === activeRelease?.day;
  const isThisReleaseActive = isThisPlaying && isPlaying;

  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isThisReleaseActive) {
      togglePlay();
    } else if (activeRelease) {
      loadAndPlay(activeRelease);
    }
  }, [isThisReleaseActive, togglePlay, activeRelease, loadAndPlay]);

  const formatDisplayDate = (dayNum: number) => {
    const startDate = new Date(data?.project.startDate || '2026-01-01');
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + dayNum - 1);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Animation variants for the slide effect
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9
    })
  };

  return (
    <section 
      id="tracker" 
      ref={containerRef}
      className="py-24 px-6 md:px-12 lg:px-16 relative overflow-hidden min-h-[90vh] flex flex-col justify-center transition-colors duration-500"
      style={{ color: text }}
    >
      {/* 2030 Background Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div 
          className="absolute inset-0 transition-colors duration-500"
          style={{
            backgroundImage: `linear-gradient(${primary}20 1px, transparent 1px), linear-gradient(90deg, ${primary}20 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b pb-6 transition-colors duration-500" style={{ borderColor: hexToRgba(text, 0.1) }}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse transition-colors duration-300" style={{ background: accent }} />
              <span className="text-xs font-mono tracking-[0.4em] transition-colors duration-300" style={{ color: hexToRgba(text, 0.4) }}>SYSTEM_TRACKER.v3</span>
            </div>
            <div className="flex items-end gap-3 mb-2">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
                <span className="text-transparent bg-clip-text transition-colors duration-500" style={{ backgroundImage: `linear-gradient(to right, ${text}, ${hexToRgba(text, 0.5)})` }}>
                  Daily Transmission
                </span>
              </h2>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-right hidden md:block">
            <div className="text-xs font-mono mb-1 transition-colors duration-300" style={{ color: hexToRgba(text, 0.4) }}>GLOBAL_PROGRESS</div>
            <div className="text-3xl font-mono font-bold transition-colors duration-300" style={{ color: accent }}>
              {Math.round(progress)}<span className="text-sm opacity-50">%</span>
            </div>
          </motion.div>
        </div>

        {/* CAROUSEL GRID */}
        {/* FIX: aspect-video enforces rectangle */}
        <div className="relative w-full max-w-4xl mx-auto aspect-video flex items-center justify-center">
          
          {/* LEFT BUTTON AREA */}
          <button 
            onClick={handlePrev}
            disabled={focusedIndex === 0}
            className="absolute left-0 z-20 h-full w-24 md:w-32 flex items-center justify-center group disabled:opacity-0 transition-opacity focus:outline-none"
          >
             <div className="p-4 rounded-full border bg-black/50 backdrop-blur-md group-hover:bg-white/10 transition-colors duration-300" style={{ borderColor: hexToRgba(text, 0.2) }}>
                <ChevronLeft className="w-8 h-8 text-white" />
             </div>
          </button>

          {/* RIGHT BUTTON AREA */}
          <button 
            onClick={handleNext}
            disabled={!data?.releases || focusedIndex === data.releases.length - 1}
            className="absolute right-0 z-20 h-full w-24 md:w-32 flex items-center justify-center group disabled:opacity-0 transition-opacity focus:outline-none"
          >
             <div className="p-4 rounded-full border bg-black/50 backdrop-blur-md group-hover:bg-white/10 transition-colors duration-300" style={{ borderColor: hexToRgba(text, 0.2) }}>
                <ChevronRight className="w-8 h-8 text-white" />
             </div>
          </button>

          {/* CENTER CARD (ANIMATED) */}
          <div className="relative w-full h-full overflow-hidden rounded-xl">
            <AnimatePresence initial={false} custom={slideDirection} mode='popLayout'>
              {activeRelease ? (
                <motion.div 
                  key={activeRelease.day}
                  custom={slideDirection}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 w-full h-full rounded-xl overflow-hidden border bg-black transition-colors duration-500"
                  style={{ 
                    borderColor: hexToRgba(text, 0.1),
                    boxShadow: `0 0 50px -10px ${moodColor}20` 
                  }}
                >
                   {/* FULL BACKGROUND COVER */}
                   <div className="absolute inset-0 z-0">
                      <CoverImage
                        key={activeRelease.day}
                        day={activeRelease.day}
                        title={activeRelease.title}
                        mood={activeRelease.mood}
                        energy={activeRelease.energy}
                        valence={activeRelease.valence}
                        tempo={activeRelease.tempo}
                        coverUrl={getCoverUrl(activeRelease.day, activeRelease.storageTitle || activeRelease.title)}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* THEME COLOR INJECTION OVERLAY */}
                      <div 
                        className="absolute inset-0 z-10 mix-blend-overlay opacity-40 pointer-events-none transition-colors duration-500"
                        style={{ backgroundColor: primary }} 
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay z-10" />
                   </div>

                   {/* REACTOR BUTTON (Centered) */}
                   <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="pointer-events-auto">
                        <ReactorPlayButton 
                          isPlaying={isThisReleaseActive} 
                          onClick={handlePlayClick} 
                          color={moodColor}
                        />
                      </div>
                   </div>

                   {/* CONTENT OVERLAY */}
                   <div className="absolute bottom-0 left-0 w-full p-8 z-10 pointer-events-none">
                      <div className="flex items-center gap-3 mb-3">
                         <span className="px-2 py-0.5 rounded border bg-black/40 border-white/20 text-[10px] font-mono font-bold uppercase text-white backdrop-blur-md">
                           {activeRelease.mood}
                         </span>
                         <span className="text-xs font-mono text-white/70">{formatDisplayDate(activeRelease.day)}</span>
                      </div>

                      <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white mb-2 leading-none" style={BOLD_TEXT_STYLE}>
                         {activeRelease.title}
                      </h3>
                      
                      {/* ADDED DESCRIPTION */}
                      <p className="text-white/90 text-sm md:text-base font-medium mb-4 line-clamp-2 max-w-2xl" style={BOLD_TEXT_STYLE_SMALL}>
                        {activeRelease.description}
                      </p>
                      
                      {/* ADDED CUSTOM INFO (Extra Description) */}
                      {activeRelease.customInfo && (
                        <div 
                          className="prose prose-invert prose-sm leading-relaxed opacity-90 mb-4 font-medium text-xs md:text-sm line-clamp-2 max-w-xl"
                          style={BOLD_TEXT_STYLE_SMALL}
                          dangerouslySetInnerHTML={{ __html: activeRelease.customInfo }}
                        />
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/90 font-bold" style={BOLD_TEXT_STYLE_SMALL}>
                         <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {activeRelease.durationFormatted}</span>
                         <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {activeRelease.tempo} BPM</span>
                      </div>
                      
                      <div className="mt-6 pointer-events-auto">
                         <button 
                           onClick={() => navigate(`/day/${activeRelease.day}`)}
                           className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-accent transition-colors duration-300"
                           style={BOLD_TEXT_STYLE_SMALL}
                         >
                           Full Transmission Data <ChevronRight className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                </motion.div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-black/40">
                   <Disc className="w-12 h-12 mb-4 animate-spin-slow opacity-50" />
                   <h3 className="text-xl font-bold mb-2">SIGNAL_LOST</h3>
                   <p className="font-mono text-sm opacity-50">No transmission found.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* STATS MODULES */}
        <motion.div 
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <StatModule icon={<WaveformIcon className="w-6 h-6" color={secondary} />} label="RELEASES" value={data?.stats.totalReleases || 0} color={secondary} />
          <StatModule icon={<SunburstIcon className="w-6 h-6" color={accent} />} label="LIGHT_SIDE" value={data?.stats.lightTracks || 0} color={accent} />
          <StatModule icon={<MoonPhaseIcon className="w-6 h-6" color={primary} />} label="DARK_SIDE" value={data?.stats.darkTracks || 0} color={primary} />
          <StatModule icon={<HourglassIcon className="w-6 h-6" color={hexToRgba(text, 0.7)} />} label="REMAINING" value={totalDays - currentDay} color={hexToRgba(text, 0.7)} />
        </motion.div>

      </div>
    </section>
  );
}