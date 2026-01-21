import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { useAudioStore } from '../store/useAudioStore';
import { useState, useCallback, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  Clock, 
  Music, 
  Activity, 
  Disc} from 'lucide-react';
import { CoverImage } from './GenerativeCover';
import { getCoverUrl } from '../services/releaseStorage';

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// 2030 "Reactor" Play Button (Duplicated for standalone component use)
function ReactorPlayButton({ isPlaying, onClick, color }: { isPlaying: boolean, onClick: (e: any) => void, color: string }) {
  return (
    <button 
      onClick={onClick}
      className="group relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center focus:outline-none z-30"
    >
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-dashed opacity-80"
        style={{ borderColor: color }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute inset-2 rounded-full opacity-40 blur-md"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div 
        className="absolute inset-3 rounded-full backdrop-blur-xl border border-white/40 shadow-inner flex items-center justify-center transition-transform group-hover:scale-95 group-active:scale-90"
        style={{ 
          background: `linear-gradient(135deg, ${hexToRgba(color, 0.6)}, ${hexToRgba('#000000', 0.8)})`,
          boxShadow: `0 0 20px ${hexToRgba(color, 0.5)}, inset 0 0 10px rgba(255,255,255,0.5)`
        }}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 md:w-10 md:h-10 text-white fill-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        ) : (
          <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
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
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r transition-colors" style={{ borderColor: hexToRgba(text, 0.2) }} />
      <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full blur-[40px] opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ background: color }} />

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

// --- Icons ---
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
  const [] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { primary, secondary, accent, background, text } = currentTheme.colors;
  const totalDays = data?.project.totalDays || 365;
  const progress = (currentDay / totalDays) * 100;

  const todaysRelease = data?.releases.find(r => r.day === currentDay);
  const prevRelease = data?.releases.filter(r => r.day < currentDay).sort((a, b) => b.day - a.day)[0];
  const nextDay = currentDay + 1;
  const hasNextRelease = data?.releases.some(r => r.day === nextDay);
  const isLight = todaysRelease?.mood === 'light';
  
  // Is this specific day playing?
  const isThisPlaying = currentRelease?.day === currentDay;
  const isThisReleaseActive = isThisPlaying && isPlaying;

  const handlePlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isThisPlaying) {
      togglePlay();
    } else if (todaysRelease) {
      loadAndPlay(todaysRelease);
    }
  }, [isThisPlaying, togglePlay, todaysRelease, loadAndPlay]);

  const moodColor = isLight ? accent : primary;

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
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Header HUD */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 border-b pb-6" style={{ borderColor: hexToRgba(text, 0.1) }}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: accent }} />
              <span className="text-xs font-mono tracking-[0.4em]" style={{ color: hexToRgba(text, 0.4) }}>SYSTEM_TRACKER.v3</span>
            </div>
            <div className="flex items-end gap-3 mb-2">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${text}, ${hexToRgba(text, 0.5)})` }}>
                  Daily Transmission
                </span>
              </h2>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-right hidden md:block">
            <div className="text-xs font-mono mb-1" style={{ color: hexToRgba(text, 0.4) }}>GLOBAL_PROGRESS</div>
            <div className="text-3xl font-mono font-bold" style={{ color: accent }}>
              {Math.round(progress)}<span className="text-sm opacity-50">%</span>
            </div>
          </motion.div>
        </div>

        {/* MAIN INTERFACE GRID */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Previous Log */}
          <div className="lg:col-span-2 hidden lg:flex flex-col justify-center">
            {prevRelease && (
              <motion.button
                initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                onClick={() => navigate(`/day/${prevRelease.day}`)}
                className="group relative h-48 w-full border backdrop-blur-sm rounded-lg overflow-hidden transition-all"
                style={{ backgroundColor: hexToRgba(background, 0.5), borderColor: hexToRgba(text, 0.1) }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundImage: `linear-gradient(135deg, ${primary}20 0%, ${accent}15 100%)` }} />
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

          {/* CENTER: The "Reactor Card" (Redesigned) */}
          <motion.div 
            className="lg:col-span-8 relative group"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
             <div 
               className="relative rounded-xl overflow-hidden border h-[500px] flex flex-col justify-end p-8"
               style={{ 
                 borderColor: hexToRgba(text, 0.1),
                 boxShadow: `0 0 50px -10px ${moodColor}20` 
               }}
             >
                {todaysRelease ? (
                  <>
                     {/* FULL BACKGROUND COVER */}
                     <div className="absolute inset-0 z-0">
                        <CoverImage
                          day={todaysRelease.day}
                          title={todaysRelease.title}
                          mood={todaysRelease.mood}
                          energy={todaysRelease.energy}
                          valence={todaysRelease.valence}
                          tempo={todaysRelease.tempo}
                          coverUrl={getCoverUrl(todaysRelease.day, todaysRelease.storageTitle || todaysRelease.title)}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
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
                     <div className="relative z-10 pointer-events-none">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="px-2 py-0.5 rounded border bg-black/40 border-white/20 text-[10px] font-mono font-bold uppercase text-white backdrop-blur-md">
                             {todaysRelease.mood}
                           </span>
                           <span className="text-xs font-mono text-white/70">{formatDisplayDate(currentDay)}</span>
                        </div>

                        <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2 drop-shadow-lg leading-none">
                           {todaysRelease.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-white/80">
                           <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {todaysRelease.durationFormatted}</span>
                           <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {todaysRelease.tempo} BPM</span>
                        </div>
                        
                        <div className="mt-6 pointer-events-auto">
                           <button 
                             onClick={() => navigate(`/day/${currentDay}`)}
                             className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white hover:text-accent transition-colors"
                           >
                             Full Transmission Data <ChevronRight className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 bg-black/40">
                     <Disc className="w-12 h-12 mb-4 animate-spin-slow opacity-50" />
                     <h3 className="text-xl font-bold mb-2">SIGNAL_LOST</h3>
                     <p className="font-mono text-sm opacity-50">No transmission found for Day {currentDay}</p>
                  </div>
                )}
             </div>
          </motion.div>

          {/* RIGHT: Next Log */}
          <div className="lg:col-span-2 hidden lg:flex flex-col justify-center">
             <div 
               className="h-48 w-full border rounded-lg p-4 flex flex-col justify-center items-end opacity-50 relative overflow-hidden"
               style={{ backgroundColor: hexToRgba(background, 0.2), borderColor: hexToRgba(text, 0.05) }}
             >
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
                <ChevronRight className="w-6 h-6 mb-auto" style={{ color: hexToRgba(text, 0.2) }} />
                <div className="text-right">
                  <div className="text-xs font-mono mb-1" style={{ color: hexToRgba(text, 0.2) }}>INCOMING</div>
                  <div className="font-bold text-sm" style={{ color: hexToRgba(text, 0.4) }}>{hasNextRelease ? `Day ${nextDay}` : 'END_OF_LINE'}</div>
                </div>
             </div>
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