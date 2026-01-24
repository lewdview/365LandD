import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { useAudioStore } from '../store/useAudioStore';
import { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Clock, 
  Music, 
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

const BOLD_TEXT_STYLE = {
  textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
};

const BOLD_TEXT_STYLE_SMALL = {
  textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
};

// Theme-aware Reactor Button
function ReactorPlayButton({ isPlaying, onClick, color, textColor }: { isPlaying: boolean, onClick: (e: any) => void, color: string, textColor: string }) {
  return (
    <button 
      onClick={onClick}
      className="group relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center focus:outline-none z-30"
    >
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-dashed opacity-100 transition-colors duration-300"
        style={{ borderColor: color, filter: `drop-shadow(0 0 3px ${color})` }}
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
        className="absolute inset-3 rounded-full backdrop-blur-xl border-2 shadow-inner flex items-center justify-center transition-transform group-hover:scale-95 group-active:scale-90 duration-300"
        style={{ 
          borderColor: hexToRgba(textColor, 0.6),
          background: `linear-gradient(135deg, ${hexToRgba(color, 0.8)}, ${hexToRgba(color, 0.4)})`,
          boxShadow: `0 0 20px ${hexToRgba(color, 0.5)}, inset 0 0 10px ${hexToRgba(textColor, 0.5)}`
        }}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 md:w-8 md:h-8 drop-shadow-md" style={{ color: textColor, fill: textColor }} />
        ) : (
          <Play className="w-6 h-6 md:w-8 md:h-8 ml-1 drop-shadow-md" style={{ color: textColor, fill: textColor }} />
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
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-md">
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
      <motion.svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-md"
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
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-md">
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
      <motion.svg viewBox="0 0 32 32" fill="none" className="w-full h-full drop-shadow-md"
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
  const [focusedIndex, setFocusedIndex] = useState(0);

  const { primary, secondary, accent, text, background } = currentTheme.colors;
  const totalDays = data?.project.totalDays || 365;
  const progress = (currentDay / totalDays) * 100;

  // Initialize focus index once data loads
  useEffect(() => {
    if (data?.releases) {
      if (currentRelease) {
        const idx = data.releases.findIndex(r => r.day === currentRelease.day);
        if (idx !== -1) setFocusedIndex(idx);
      } else {
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
        setFocusedIndex(idx);
      }
    }
  }, [currentRelease, data?.releases]);

  const handleNext = () => {
    if (!data?.releases) return;
    const nextIndex = focusedIndex + 1;
    // Bounds check
    if (nextIndex >= data.releases.length) return;

    // GATING Check: Do not proceed if next day is in future
    if (data.releases[nextIndex].day > currentDay) return;

    setFocusedIndex(nextIndex);
  };

  const handlePrev = () => {
    if (!data?.releases) return;
    if (focusedIndex > 0) {
      setFocusedIndex(prev => prev - 1);
    }
  };

  const activeRelease = data?.releases[focusedIndex];

  const formatDisplayDate = (dayNum: number) => {
    const startDate = new Date(data?.project.startDate || '2026-01-01');
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + dayNum - 1);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper to render a single card
  const renderCard = (index: number, position: 'center' | 'left' | 'right') => {
    const release = data?.releases[index];
    if (!release) return null;

    const isCenter = position === 'center';
    const isThisPlaying = currentRelease?.day === release.day;
    const isThisReleaseActive = isThisPlaying && isPlaying;
    const moodColor = release.mood === 'light' ? accent : primary;

    const handleCardClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isCenter) {
        if (isThisReleaseActive) {
          togglePlay();
        } else {
          loadAndPlay(release);
        }
      } else {
        // Gating Check on Click
        if (release.day <= currentDay) {
           setFocusedIndex(index);
        }
      }
    };

    return (
      <motion.div
        key={release.day}
        layout
        initial={false}
        animate={{
          scale: isCenter ? 1 : 0.85,
          opacity: isCenter ? 1 : 0.4,
          x: position === 'left' ? '-60%' : position === 'right' ? '60%' : '0%',
          zIndex: isCenter ? 10 : 0,
          rotateY: position === 'left' ? 15 : position === 'right' ? -15 : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        // MOBILE: Flex column to stack image and text separate.
        // DESKTOP: Absolute positioning for 3D effect.
        className={`
          w-full rounded-2xl overflow-hidden border shadow-2xl cursor-pointer
          flex flex-col
          lg:absolute lg:max-w-4xl lg:aspect-video lg:block
        `}
        style={{ 
          // Dynamic background based on theme to ensure readability on mobile stack
          backgroundColor: hexToRgba(background, 0.95),
          borderColor: hexToRgba(text, isCenter ? 0.2 : 0.05),
          boxShadow: isCenter ? `0 0 50px -10px ${moodColor}30` : 'none'
        }}
        onClick={handleCardClick}
      >
        {/* --- ARTWORK CONTAINER --- */}
        <div className="relative w-full aspect-video lg:absolute lg:inset-0 z-0">
          <CoverImage
            key={release.day}
            day={release.day}
            title={release.title}
            mood={release.mood}
            energy={release.energy}
            valence={release.valence}
            tempo={release.tempo}
            coverUrl={getCoverUrl(release.day, release.storageTitle || release.title)}
            className="w-full h-full object-cover"
          />
          {/* Theme Mask */}
          <div 
            className="absolute inset-0 z-10 mix-blend-overlay opacity-40 pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: primary }} 
          />
          
          {/* Desktop Overlay Gradient only */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10 hidden lg:block" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay z-10" />

           {/* PLAY BUTTON (Floating on Image) */}
           <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
              <div className="pointer-events-auto transform scale-75 md:scale-100">
                <ReactorPlayButton 
                  isPlaying={isThisReleaseActive} 
                  onClick={() => isThisReleaseActive ? togglePlay() : loadAndPlay(release)} 
                  color={moodColor}
                  textColor={text}
                />
              </div>
            </div>
        </div>

        {/* --- TEXT CONTENT --- */}
        {/* Mobile: Padded block below image. Desktop: Absolute overlay on image */}
        <div className={`
           relative z-20 flex flex-col justify-end
           p-8 pb-12 gap-4
           lg:absolute lg:bottom-0 lg:left-0 lg:w-full lg:h-full lg:p-8 lg:bg-transparent
        `}>
          {/* Header Row */}
          <div className="flex items-center gap-3 mb-2">
             <span className="px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase backdrop-blur-md"
                   style={{ borderColor: hexToRgba(text, 0.2), backgroundColor: hexToRgba(background, 0.4), color: text }}>
               {release.mood}
             </span>
             <span className="text-xs font-mono opacity-70" style={{ color: text }}>{formatDisplayDate(release.day)}</span>
          </div>

          {/* Title */}
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-2 leading-none" 
              style={{ ...BOLD_TEXT_STYLE, color: text }}>
             {release.title}
          </h3>
          
          {/* Description */}
          <p className="text-sm md:text-base font-medium mb-3 line-clamp-2 lg:line-clamp-1 max-w-2xl opacity-90" 
             style={{ ...BOLD_TEXT_STYLE_SMALL, color: text }}>
            {release.description}
          </p>

          {/* Custom Info */}
          {release.customInfo && (
             <div className="mb-3 hidden md:block">
               <div className="flex items-center gap-2 mb-1">
                  <Info className="w-3 h-3" style={{ color: text }} /> 
                  <span className="text-[10px] font-mono uppercase font-bold" style={{ color: text }}>Additional Intel</span>
               </div>
               <div 
                  className="prose prose-invert prose-sm leading-tight opacity-80 font-medium text-xs line-clamp-2 max-w-xl"
                  style={{ ...BOLD_TEXT_STYLE_SMALL, color: text }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(release.customInfo) }}
               />
             </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold opacity-90 mt-auto" style={{ color: text }}>
             <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {release.durationFormatted}</span>
             <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {release.tempo} BPM</span>
          </div>
          
          <div className="mt-4 pointer-events-auto">
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 navigate(`/day/${release.day}`);
               }}
               className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-80 transition-colors duration-300"
               style={{ color: text }}
             >
               Full Transmission Data <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section 
      id="tracker" 
      ref={containerRef}
      className="py-24 px-6 md:px-12 lg:px-16 relative overflow-hidden min-h-[90vh] flex flex-col justify-center transition-colors duration-500"
      style={{ color: text }}
    >
      {/* Background Grid */}
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
        {/* Desktop: h-[60vh] for perspective. 
            Mobile: Auto height for stacking.
        */}
        <div className="relative w-full lg:h-[60vh] min-h-[400px] flex items-center justify-center lg:perspective-[1000px] mb-24 lg:mb-0">
          
          {/* Navigation Buttons (Desktop) */}
          <button 
            onClick={handlePrev}
            disabled={focusedIndex === 0}
            className="hidden lg:flex absolute left-0 z-30 h-full w-24 items-center justify-center group disabled:opacity-0 transition-opacity focus:outline-none"
          >
             <div className="p-4 rounded-full border backdrop-blur-md transition-colors duration-300 group-hover:bg-white/10" 
                  style={{ borderColor: hexToRgba(text, 0.2), backgroundColor: hexToRgba(background, 0.5) }}>
                <ChevronLeft className="w-8 h-8" style={{ color: text }} />
             </div>
          </button>

          <button 
            onClick={handleNext}
            // GATING Check here as well for visual disable state
            disabled={!data?.releases || focusedIndex === data.releases.length - 1 || (data.releases[focusedIndex + 1]?.day > currentDay)}
            className="hidden lg:flex absolute right-0 z-30 h-full w-24 items-center justify-center group disabled:opacity-0 transition-opacity focus:outline-none"
          >
             <div className="p-4 rounded-full border backdrop-blur-md transition-colors duration-300 group-hover:bg-white/10"
                  style={{ borderColor: hexToRgba(text, 0.2), backgroundColor: hexToRgba(background, 0.5) }}>
                <ChevronRight className="w-8 h-8" style={{ color: text }} />
             </div>
          </button>

          {/* Cards Container */}
          <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
            {/* MOBILE: Just show active card stacked */}
            <div className="lg:hidden w-full space-y-8">
               {renderCard(focusedIndex, 'center')}
               
               {/* Mobile Nav */}
               <div className="flex justify-between items-center px-4">
                  <button onClick={handlePrev} disabled={focusedIndex === 0} className="p-3 border rounded-full disabled:opacity-30" style={{ borderColor: text }}>
                     <ChevronLeft className="w-6 h-6" style={{ color: text }} />
                  </button>
                  <span className="font-mono text-sm" style={{ color: text }}>DAY {activeRelease?.day}</span>
                  <button onClick={handleNext} disabled={!data?.releases || focusedIndex === data.releases.length - 1 || (data.releases[focusedIndex + 1]?.day > currentDay)} className="p-3 border rounded-full disabled:opacity-30" style={{ borderColor: text }}>
                     <ChevronRight className="w-6 h-6" style={{ color: text }} />
                  </button>
               </div>
            </div>

            {/* DESKTOP: AnimatePresence 3D Carousel */}
            <div className="hidden lg:block w-full h-full">
              <AnimatePresence initial={false} mode="popLayout">
                 {/* Left Card (Distance) */}
                 {focusedIndex > 0 && renderCard(focusedIndex - 1, 'left')}
                 
                 {/* Center Card (Focus) */}
                 {renderCard(focusedIndex, 'center')}
                 
                 {/* Right Card (Distance) - Only if exists AND is allowed (gating) */}
                 {data?.releases && 
                  focusedIndex < data.releases.length - 1 && 
                  data.releases[focusedIndex + 1].day <= currentDay && 
                  renderCard(focusedIndex + 1, 'right')}
              </AnimatePresence>
            </div>
            
            {/* Fallback for empty/loading state */}
            {!activeRelease && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                 <Disc className="w-12 h-12 mb-4 animate-spin-slow opacity-50" style={{ color: text }} />
                 <h3 className="text-xl font-bold mb-2" style={{ color: text }}>SIGNAL_LOST</h3>
                 <p className="font-mono text-sm opacity-50" style={{ color: text }}>No transmission found.</p>
              </div>
            )}
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