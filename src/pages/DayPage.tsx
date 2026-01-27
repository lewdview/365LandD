import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import DOMPurify from 'dompurify';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Clock, 
  Music, 
  Home, 
  Activity, 
  Maximize2, 
  Info, 
  Minimize2,
  Sparkles,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { useAudioStore } from '../store/useAudioStore';
import { KaraokeLyrics } from '../components/KaraokeLyrics';
import { CoverImage } from '../components/GenerativeCover';
import { Navigation } from '../components/Navigation';
import { ThemeChanger } from '../components/ThemeChanger';
import { ManifestoModal } from '../components/ManifestoModal';
import { ConnectModal } from '../components/ConnectModal';
import { getCoverUrl } from '../services/releaseStorage';
import type { Release } from '../types';

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

// Basic HTML sanitizer
function sanitizeHtml(html: string) {
  if (!html) return '';
  return DOMPurify.sanitize(html);
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Bold Text Style for readability over images
const BOLD_TEXT_STYLE = {
  textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
};

const BOLD_TEXT_STYLE_SMALL = {
  textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
};

// --- Visual Components ---

function TechBadge({ children, color, label }: { children: React.ReactNode, color: string, label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-[10px] font-mono tracking-wider opacity-90 uppercase font-bold" style={{ color: color }}>{label}</span>}
      <div 
        className="px-3 py-1.5 rounded border flex items-center gap-2 font-mono text-xs font-bold backdrop-blur-md transition-colors duration-300"
        style={{ 
          borderColor: hexToRgba(color, 0.5),
          backgroundColor: hexToRgba(color, 0.1),
          color: color,
          boxShadow: `0 4px 6px ${hexToRgba(color, 0.1)}`
        }}
      >
        {children}
      </div>
    </div>
  );
}

function StatModule({ label, value, color, max = 100 }: { label: string, value: number, color: string, max?: number }) {
  return (
    <div className="relative group p-4 border rounded-lg overflow-hidden backdrop-blur-sm transition-colors duration-300" style={{ borderColor: hexToRgba(color, 0.2), backgroundColor: hexToRgba(color, 0.05) }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-mono tracking-widest opacity-60 uppercase">{label}</span>
        <Activity className="w-3 h-3 opacity-40" />
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-black tabular-nums transition-colors duration-300" style={{ color }}>{Math.round(value)}</span>
        <span className="text-xs font-mono opacity-50 mb-1">/ {max}</span>
      </div>
      {/* Progress Bar */}
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: hexToRgba(color, 0.2) }}>
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full transition-colors duration-300"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// Theme-aware Reactor Button
function ReactorPlayButton({ isPlaying, onClick, color, textColor }: { isPlaying: boolean, onClick: () => void, color: string, textColor: string }) {
  return (
    <button 
      onClick={onClick}
      className="group relative w-20 h-20 md:w-32 md:h-32 flex items-center justify-center focus:outline-none z-30"
    >
      {/* Outer Rotating Ring */}
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-dashed opacity-100 transition-colors duration-300"
        style={{ borderColor: color, filter: `drop-shadow(0 0 5px ${color})` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner Glow Pulse */}
      <motion.div 
        className="absolute inset-2 rounded-full opacity-60 blur-md transition-colors duration-300"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Core */}
      <div 
        className="absolute inset-4 rounded-full backdrop-blur-xl border-2 shadow-inner flex items-center justify-center transition-transform group-hover:scale-95 group-active:scale-90 duration-300"
        style={{ 
          borderColor: hexToRgba(textColor, 0.6),
          background: `linear-gradient(135deg, ${hexToRgba(color, 0.8)}, ${hexToRgba(color, 0.4)})`,
          boxShadow: `0 0 30px ${hexToRgba(color, 0.5)}, inset 0 0 10px ${hexToRgba(textColor, 0.5)}`
        }}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 md:w-12 md:h-12 drop-shadow-md" style={{ color: textColor, fill: textColor }} />
        ) : (
          <Play className="w-8 h-8 md:w-12 md:h-12 ml-2 drop-shadow-md" style={{ color: textColor, fill: textColor }} />
        )}
      </div>
    </button>
  );
}

export function DayPage() {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const { data, fetchData, currentDay } = useStore();
  const { currentTheme } = useThemeStore();
  const { primary, secondary, accent, background, text } = currentTheme.colors;
  
  // Global audio store
  const {
    currentRelease: playingRelease,
    isPlaying,
    currentTime,
    duration,
    loadAndPlay,
    togglePlay: globalTogglePlay,
    seek,
  } = useAudioStore();
  
  const [release, setRelease] = useState<Release | null>(null);
  const [showManifesto, setShowManifesto] = useState(false);
  const [showConnect, setShowConnect] = useState(false);
  const [lyricsExpanded, setLyricsExpanded] = useState(false);

  const dayNum = parseInt(day || '1', 10);
  const hasPoetryData = release?.lyricsWords && release.lyricsWords.length > 0;
  
  const isThisPlaying = playingRelease?.day === release?.day && playingRelease?.title === release?.title;
  const isThisReleaseActive = isThisPlaying && isPlaying;
  
  const playingHasPoetryData = playingRelease?.lyricsWords && playingRelease.lyricsWords.length > 0;
  const lyricsWordsToShow = playingHasPoetryData ? playingRelease!.lyricsWords : (hasPoetryData ? release!.lyricsWords : []);
  const lyricsSegmentsToShow = playingHasPoetryData ? playingRelease!.lyricsSegments : (hasPoetryData ? release!.lyricsSegments : undefined);
  const currentTimeForLyrics = playingHasPoetryData ? currentTime : (isThisPlaying ? currentTime : 0);

  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, [data, fetchData]);

  useEffect(() => {
    if (data?.releases) {
      const found = data.releases.find(r => r.day === dayNum);
      setRelease(found || null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [data, dayNum]);

  // GATING LOGIC
  useEffect(() => {
    if (data && currentDay && dayNum > currentDay) {
      navigate(`/day/${currentDay}`, { replace: true });
    }
  }, [data, currentDay, dayNum, navigate]);

  useEffect(() => {
    const handleOpenManifesto = () => setShowManifesto(true);
    const handleOpenConnect = () => setShowConnect(true);
    window.addEventListener('openManifesto', handleOpenManifesto);
    window.addEventListener('openConnect', handleOpenConnect);
    return () => {
      window.removeEventListener('openManifesto', handleOpenManifesto);
      window.removeEventListener('openConnect', handleOpenConnect);
    };
  }, []);

  const handlePlay = useCallback(() => {
    if (!release) return;
    if (isThisPlaying) {
      globalTogglePlay();
    } else {
      loadAndPlay(release);
    }
  }, [release, isThisPlaying, globalTogglePlay, loadAndPlay]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  }, [seek]);

  const handleWordClick = useCallback((time: number) => {
    if (!release) return;
    if (!isThisPlaying) {
      loadAndPlay(release);
    }
    setTimeout(() => seek(time), isThisPlaying ? 0 : 100);
  }, [release, isThisPlaying, loadAndPlay, seek]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const goToDay = (d: number) => {
    if (d >= 1 && d <= 365) {
      navigate(`/day/${d}`);
    }
  };

  const prevDay = data?.releases.filter(r => r.day < dayNum && r.day >= 1).sort((a, b) => b.day - a.day)[0];
  const nextDay = data?.releases.filter(r => r.day > dayNum && r.day <= currentDay).sort((a, b) => a.day - b.day)[0];

  const moodColor = (release?.mood === 'light') ? accent : primary;

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevDay) {
        goToDay(prevDay.day);
      } else if (e.key === 'ArrowRight' && nextDay) {
        goToDay(nextDay.day);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevDay, nextDay, navigate]);

  if (!data) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-t-transparent rounded-full"
          style={{ borderColor: primary, borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-64 relative overflow-hidden transition-colors duration-500" style={{ backgroundColor: background, color: text }}>
      <Navigation />
      <ThemeChanger />

      {/* 2030 Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
        <div 
          className="absolute inset-0 transition-colors duration-500"
          style={{
            backgroundImage: `linear-gradient(${primary}20 1px, transparent 1px), linear-gradient(90deg, ${primary}20 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-8 pt-32 md:pt-40">
        {release ? (
          <>
            {/* --- HERO CARD (Adaptive Layout) --- */}
            {/* Mobile: Flex Column. Desktop: Block aspect-video */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={`
                relative w-full rounded-[2rem] overflow-hidden shadow-2xl border mb-12 group
                flex flex-col lg:block lg:aspect-video
              `}
              style={{ borderColor: hexToRgba(text, 0.1), backgroundColor: hexToRgba(background, 0.5) }}
            >
              {/* ARTWORK CONTAINER */}
              {/* Mobile: Full Width Image. Desktop: Absolute Fill */}
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
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                
                {/* Theme Masks */}
                <div 
                  className="absolute inset-0 z-10 mix-blend-overlay opacity-40 pointer-events-none transition-colors duration-500"
                  style={{ backgroundColor: primary }} 
                />
                
                {/* Desktop Overlay Gradient only */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10 opacity-60 lg:opacity-100" />
                
                {/* Scanline Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay z-10" />

                {/* PLAY BUTTON - MOBILE: CENTER / DESKTOP: BOTTOM RIGHT */}
                <div className="absolute inset-0 flex items-center justify-center lg:items-end lg:justify-end z-20 pointer-events-none lg:p-16">
                   <div className="pointer-events-auto transform scale-90 md:scale-100">
                     <ReactorPlayButton 
                        isPlaying={isThisReleaseActive} 
                        onClick={handlePlay} 
                        color={moodColor}
                        textColor={text}
                     />
                   </div>
                </div>
              </div>

              {/* CONTENT OVERLAY / STACK */}
              <div className={`
                 relative z-20 flex flex-col justify-between 
                 p-6 md:p-8 lg:p-16 
                 lg:absolute lg:inset-0 lg:bg-transparent
                 pointer-events-none
              `}>
                
                {/* Top Bar: Breadcrumbs & Log */}
                <div className="flex justify-between items-start mb-6 lg:mb-0 pointer-events-auto">
                   <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border hover:bg-white/10 transition-colors"
                      style={{ backgroundColor: hexToRgba(background, 0.4), borderColor: hexToRgba(text, 0.2) }}
                   >
                      <Home className="w-4 h-4" style={{ color: text }} />
                      <span className="text-xs font-mono font-bold tracking-widest" style={{ color: text }}>HOME</span>
                   </Link>

                   <div className="flex flex-col items-end">
                     <span className="text-[10px] font-mono tracking-[0.3em] uppercase opacity-90 font-bold" style={{ color: text }}>Transmission Log</span>
                     <span className="text-4xl font-black tracking-tighter transition-colors duration-300" style={{ textShadow: `0 0 20px ${moodColor}`, color: text }}>
                       {String(dayNum).padStart(3, '0')}
                     </span>
                   </div>
                </div>

                {/* Bottom Content Area */}
                <div className="flex flex-col justify-end mt-auto">
                  <div className="grid lg:grid-cols-12 gap-8 items-end pointer-events-auto">
                    
                    {/* Text Block */}
                    <div className="lg:col-span-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded border backdrop-blur-md flex items-center gap-2 shadow-lg"
                              style={{ backgroundColor: hexToRgba(background, 0.6), borderColor: hexToRgba(text, 0.3) }}
                        >
                          <span className="w-2 h-2 rounded-full animate-pulse transition-colors duration-300" style={{ backgroundColor: moodColor, boxShadow: `0 0 10px ${moodColor}` }} />
                          <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: text }}>{release.mood}</span>
                        </div>
                        <span className="text-xs font-mono font-bold px-2 py-1 rounded backdrop-blur-md" 
                              style={{ color: text, backgroundColor: hexToRgba(background, 0.4) }}>
                              {release.date}
                        </span>
                      </div>

                      <div>
                        <motion.h1 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="text-4xl md:text-7xl lg:text-9xl font-black uppercase leading-[0.9] tracking-tighter break-words drop-shadow-2xl mb-4"
                          style={{ ...BOLD_TEXT_STYLE, color: text }}
                        >
                          {release.title}
                        </motion.h1>
                        
                        {/* DESCRIPTION */}
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-lg md:text-xl font-medium max-w-2xl leading-relaxed"
                          style={{ ...BOLD_TEXT_STYLE_SMALL, color: text }}
                        >
                          {release.description}
                        </motion.p>
                      </div>

                      <div className="flex flex-wrap gap-4 pt-4">
                        <TechBadge color={moodColor} label="TEMPO">
                          <Clock className="w-3 h-3" /> {release.tempo} BPM
                        </TechBadge>
                        <TechBadge color={moodColor} label="KEY">
                          <Music className="w-3 h-3" /> {release.key}
                        </TechBadge>
                        <TechBadge color={moodColor} label="DURATION">
                          <Maximize2 className="w-3 h-3" /> {release.durationFormatted}
                        </TechBadge>
                      </div>
                    </div>

                    {/* Status Label (Desktop Only - Mobile handles play button differently) */}
                    <div className="hidden lg:flex lg:col-span-4 flex-col items-end justify-center pb-4">
                      <div className="mt-4 text-xs font-mono font-bold tracking-widest uppercase px-3 py-1 rounded border backdrop-blur-sm"
                            style={{ borderColor: hexToRgba(text, 0.1), backgroundColor: hexToRgba(background, 0.4), color: text }}
                      >
                          {isThisReleaseActive ? 'Sequence Active' : 'Initiate Sequence'}
                      </div>
                    </div>
                  </div>

                  {/* ADDITIONAL INTEL - LIMITED WIDTH TO AVOID PLAY BUTTON */}
                  {release.customInfo && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mt-8 pointer-events-auto w-full lg:w-3/4"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4" style={{ color: text }} />
                        <span className="text-xs font-mono uppercase font-bold" style={{ ...BOLD_TEXT_STYLE_SMALL, color: text }}>Additional Intel</span>
                      </div>
                      <div 
                        className="prose prose-invert prose-sm leading-relaxed opacity-90 font-medium text-sm w-full max-w-none"
                        style={{ ...BOLD_TEXT_STYLE_SMALL, color: text }}
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(release.customInfo) }}
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* --- DASHBOARD SECTION --- */}
            <div className="relative z-10">
              
              {/* Audio Player Strip */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 p-6 rounded-xl border backdrop-blur-xl relative overflow-hidden shadow-2xl transition-colors duration-500"
                style={{ 
                  backgroundColor: hexToRgba(background, 0.8),
                  borderColor: hexToRgba(text, 0.1)
                }}
              >
                 {/* Progress Bar Overlay */}
                 <div className="absolute bottom-0 left-0 h-1 w-full" style={{ backgroundColor: hexToRgba(text, 0.1) }}>
                   <motion.div 
                     className="h-full transition-colors duration-300" 
                     style={{ backgroundColor: moodColor, width: `${(currentTime / (duration || 1)) * 100}%` }}
                   />
                 </div>
                 
                 <div className="flex items-center justify-between gap-6 relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Current Position</span>
                      <span className="text-xl font-mono font-bold tabular-nums">{isThisPlaying ? formatTime(currentTime) : '0:00'}</span>
                    </div>

                    <div className="flex-1 hidden md:block px-8">
                       <div className="h-12 w-full flex items-center gap-1 opacity-30">
                          {Array.from({ length: 40 }).map((_, i) => (
                            <div 
                              key={i} 
                              className="flex-1 rounded-full transition-all duration-300"
                              style={{ 
                                height: `${20 + Math.random() * 80}%`,
                                backgroundColor: isThisPlaying && (i / 40) < (currentTime / (duration || 1)) ? moodColor : text
                              }} 
                            />
                          ))}
                       </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">Total Duration</span>
                      <span className="text-xl font-mono font-bold tabular-nums">{formatTime((isThisPlaying && duration) || release.duration)}</span>
                    </div>
                 </div>
                 
                 <input 
                   type="range" 
                   min={0} 
                   max={duration || 100} 
                   value={currentTime} 
                   onChange={handleSeek} 
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                 />
              </motion.div>

              {/* Main Grid: Info & Lyrics */}
              <div className="grid lg:grid-cols-3 gap-8 mb-20">
                
                {/* 1. Mission Data */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-1 space-y-6"
                >
                   <div className="p-6 rounded-xl border backdrop-blur-sm transition-colors duration-500" 
                        style={{ borderColor: hexToRgba(text, 0.1), backgroundColor: hexToRgba(background, 0.4) }}
                   >
                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                       <Activity className="w-5 h-5 transition-colors duration-300" style={{ color: moodColor }} /> Mission Data
                     </h3>
                     <div className="flex flex-wrap gap-2">
                       {release.tags.map(tag => (
                         <span key={tag} className="px-2 py-1 text-[10px] font-mono border rounded transition-colors duration-500" 
                               style={{ borderColor: hexToRgba(text, 0.1), backgroundColor: hexToRgba(background, 0.6) }}>
                           #{tag}
                         </span>
                       ))}
                     </div>
                   </div>

                   <div className="space-y-3">
                      <StatModule label="Energy Output" value={release.energy * 100} color={primary} />
                      <StatModule label="Valence Level" value={release.valence * 100} color={accent} />
                      <StatModule label="Danceability" value={(release.danceability || 0) * 100} color={secondary} />
                   </div>
                </motion.div>

                {/* 2. Lyrics / Poetry */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`lg:col-span-2 transition-all duration-500 ${lyricsExpanded ? 'fixed inset-0 z-50 bg-black/95 p-6 overflow-hidden flex flex-col' : 'relative h-full'}`}
                >
                   <div className={`flex items-center justify-between mb-4 ${lyricsExpanded ? 'container mx-auto max-w-4xl pt-12' : ''}`}>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 transition-colors duration-300" style={{ color: moodColor }} />
                      <h3 className="font-bold text-lg">Poetry Stream</h3>
                    </div>
                    <button 
                      onClick={() => setLyricsExpanded(!lyricsExpanded)}
                      className="p-2 rounded hover:bg-white/5 transition-colors"
                    >
                      {lyricsExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                  </div>

                  <div 
                    className={`rounded-xl border relative overflow-hidden transition-all duration-500 ${lyricsExpanded ? 'flex-1 container mx-auto max-w-4xl' : 'min-h-[500px]'}`}
                    style={{ 
                      backgroundColor: hexToRgba(background, 0.3),
                      borderColor: hexToRgba(text, 0.1)
                    }}
                  >
                    {(playingHasPoetryData || hasPoetryData) ? (
                       <div className="h-full w-full overflow-y-auto custom-scrollbar">
                         <KaraokeLyrics
                            words={lyricsWordsToShow || []}
                            segments={lyricsSegmentsToShow}
                            currentTime={currentTimeForLyrics}
                            onWordClick={handleWordClick}
                            isPlaying={isPlaying}
                            fullHeight
                          />
                       </div>
                    ) : (
                      <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                         <pre className="font-mono text-sm leading-loose whitespace-pre-wrap opacity-80">
                           {release.lyrics || "No lyrical data available for this transmission."}
                         </pre>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* 3. Video Section */}
              {release.videoUrl && (
                <motion.section 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-20"
                >
                  <div className="w-full max-w-5xl mx-auto p-1 rounded-2xl bg-gradient-to-br from-white/10 to-transparent">
                    <div className="rounded-xl overflow-hidden shadow-2xl bg-black aspect-video relative group">
                      <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur rounded text-xs font-mono border border-white/10">VISUAL_LOG</div>
                      {isYouTube(release.videoUrl) ? (
                          <iframe
                            src={release.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video className="absolute inset-0 w-full h-full" src={release.videoUrl} controls playsInline />
                        )}
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Footer Nav (Desktop) */}
              <div className="hidden lg:flex border-t pt-8 justify-between items-center transition-colors duration-500" style={{ borderColor: hexToRgba(text, 0.1) }}>
                 <button 
                   onClick={() => prevDay && goToDay(prevDay.day)} 
                   disabled={!prevDay}
                   className="flex items-center gap-4 group disabled:opacity-30 disabled:cursor-not-allowed"
                 >
                   <div className="w-12 h-12 rounded-full border flex items-center justify-center group-hover:bg-white/5 transition-colors duration-500" style={{ borderColor: hexToRgba(text, 0.2) }}>
                     <ChevronLeft className="w-5 h-5" />
                   </div>
                   <div className="text-left hidden md:block">
                     <div className="text-[10px] font-mono opacity-50 uppercase">Previous Transmission</div>
                     <div className="font-bold">Day {prevDay?.day || '000'}</div>
                   </div>
                 </button>

                 <button 
                   onClick={() => nextDay && goToDay(nextDay.day)} 
                   disabled={!nextDay}
                   className="flex items-center gap-4 group text-right disabled:opacity-30 disabled:cursor-not-allowed"
                   >
                   <div className="text-right hidden md:block">
                     <div className="text-[10px] font-mono opacity-50 uppercase">Next Transmission</div>
                     <div className="font-bold">Day {nextDay?.day || '000'}</div>
                   </div>
                   <div className="w-12 h-12 rounded-full border flex items-center justify-center group-hover:bg-white/5 transition-colors duration-500" style={{ borderColor: hexToRgba(text, 0.2) }}>
                     <ChevronRight className="w-5 h-5" />
                   </div>
                 </button>
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-[50vh] flex items-center justify-center">
            <p className="font-mono text-xl opacity-50">INITIALIZING_DATA_STREAM...</p>
          </div>
        )}
      </div>

      {/* --- STICKY MOBILE FOOTER (Dynamic Skip) --- */}
      {release && (
        <div className="lg:hidden fixed bottom-0 left-0 w-full z-50 p-4 border-t backdrop-blur-xl transition-transform duration-300"
             style={{ backgroundColor: hexToRgba(background, 0.9), borderColor: hexToRgba(text, 0.1) }}>
           <div className="flex items-center justify-between gap-4">
              <button 
                onClick={() => prevDay && goToDay(prevDay.day)} 
                disabled={!prevDay}
                className="flex flex-col items-center gap-1 p-2 disabled:opacity-30"
              >
                <SkipBack className="w-6 h-6" style={{ color: text }} />
                <span className="text-[10px] font-mono font-bold">PREV</span>
              </button>

              <div className="flex flex-col items-center">
                 <span className="text-xs font-mono font-bold opacity-60">DAY {release.day}</span>
                 <div className="text-sm font-bold truncate max-w-[150px]">{release.title}</div>
              </div>

              <button 
                onClick={() => nextDay && goToDay(nextDay.day)} 
                disabled={!nextDay}
                className="flex flex-col items-center gap-1 p-2 disabled:opacity-30"
              >
                <SkipForward className="w-6 h-6" style={{ color: text }} />
                <span className="text-[10px] font-mono font-bold">NEXT</span>
              </button>
           </div>
        </div>
      )}

      {/* Modals */}
      <ManifestoModal isOpen={showManifesto} onClose={() => setShowManifesto(false)} />
      <ConnectModal isOpen={showConnect} onClose={() => setShowConnect(false)} />
    </div>
  );
}