import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Clock, 
  Music, 
  ExternalLink, 
  Home, 
  Sparkles, 
  Activity, 
  Disc, 
  Share2, 
  Maximize2, 
  Info, 
  Minimize2 
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
function isVimeo(url: string) {
  return /vimeo\.com/.test(url);
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// --- Visual Components ---

function TechBadge({ children, color, label }: { children: React.ReactNode, color: string, label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-[10px] font-mono tracking-wider opacity-50 uppercase">{label}</span>}
      <div 
        className="px-3 py-1.5 rounded border flex items-center gap-2 font-mono text-xs font-bold backdrop-blur-sm"
        style={{ 
          borderColor: hexToRgba(color, 0.3),
          backgroundColor: hexToRgba(color, 0.05),
          color: color
        }}
      >
        {children}
      </div>
    </div>
  );
}

function StatModule({ label, value, color, max = 100 }: { label: string, value: number, color: string, max?: number }) {
  return (
    <div className="relative group p-4 border rounded-lg overflow-hidden backdrop-blur-sm" style={{ borderColor: hexToRgba(color, 0.2), backgroundColor: hexToRgba(color, 0.05) }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-mono tracking-widest opacity-60 uppercase">{label}</span>
        <Activity className="w-3 h-3 opacity-40" />
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-2xl font-black tabular-nums" style={{ color }}>{Math.round(value)}</span>
        <span className="text-xs font-mono opacity-50 mb-1">/ {max}</span>
      </div>
      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${(value / max) * 100}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// 2030 "Reactor" Play Button
function ReactorPlayButton({ isPlaying, onClick, color }: { isPlaying: boolean, onClick: () => void, color: string }) {
  return (
    <button 
      onClick={onClick}
      className="group relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center focus:outline-none z-30" // Added z-30 to ensure clickability
    >
      {/* Outer Rotating Ring */}
      <motion.div 
        className="absolute inset-0 rounded-full border border-dashed opacity-60"
        style={{ borderColor: color }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Inner Glow Pulse */}
      <motion.div 
        className="absolute inset-2 rounded-full opacity-30 blur-md"
        style={{ backgroundColor: color }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Glass Core */}
      <div 
        className="absolute inset-3 rounded-full backdrop-blur-xl border border-white/20 shadow-inner flex items-center justify-center transition-transform group-hover:scale-95 group-active:scale-90"
        style={{ 
          background: `linear-gradient(135deg, ${hexToRgba(color, 0.4)}, ${hexToRgba('#000000', 0.8)})`,
          boxShadow: `0 0 20px ${hexToRgba(color, 0.3)}, inset 0 0 10px rgba(255,255,255,0.2)`
        }}
      >
        {isPlaying ? (
          <Pause className="w-8 h-8 md:w-10 md:h-10 text-white fill-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
        ) : (
          <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
        )}
      </div>
    </button>
  );
}

export function DayPage() {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const { data, fetchData } = useStore();
  const { currentTheme } = useThemeStore();
  const { primary, secondary, accent, background, text } = currentTheme.colors;
  
  // Global audio store
  const {
    currentRelease: playingRelease,
    isPlaying,
    currentTime,
    duration,
    hasError: audioError,
    isLoading,
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
  
  // Check if THIS release is the one currently playing
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
  const nextDay = data?.releases.filter(r => r.day > dayNum).sort((a, b) => a.day - b.day)[0];

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
    // PADDING INCREASED: pt-32 mobile (was pt-24), md:pt-48 (was md:pt-40) to clear fixed header
    <div className="min-h-screen pb-48 relative overflow-hidden" style={{ backgroundColor: background, color: text }}>
      <Navigation />
      <ThemeChanger />

      {/* 2030 Background Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
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
          style={{ background: `linear-gradient(to bottom, transparent, ${hexToRgba(primary, 0.05)}, transparent)` }}
          animate={{ y: ['-100%', '100%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* HERO SECTION */}
      <section className="relative pt-32 md:pt-48 pb-4 px-4 md:px-12 lg:px-16 z-10 min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center">
        
        {/* Breadcrumbs (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-mono tracking-widest opacity-60 mb-8 max-w-7xl mx-auto w-full">
          <Link to="/" className="hover:text-primary transition-colors flex items-center gap-2">
            <Home className="w-3 h-3" /> HOME
          </Link>
          <span>/</span>
          <span style={{ color: moodColor }}>LOG_{String(dayNum).padStart(3, '0')}</span>
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* COVER ART & MOBILE CONTROLS (First on Mobile) */}
          <div className="lg:col-span-5 relative order-first lg:order-last">
             {release && (
               <div className="flex flex-col gap-6">
                 
                 {/* MOBILE BREADCRUMBS & NAV ROW */}
                 {/* Added z-30 relative to ensure clickability over potential overlaps */}
                 <div className="flex lg:hidden items-center justify-between gap-4 relative z-30">
                    {/* Home Link */}
                    <Link to="/" className="p-2 rounded hover:bg-white/10 text-xs font-mono tracking-widest opacity-80 flex items-center gap-2">
                      <Home className="w-3 h-3" /> HOME
                    </Link>

                    {/* Compact Arrows */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => prevDay && goToDay(prevDay.day)}
                        disabled={!prevDay}
                        className="p-2 border rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        style={{ borderColor: hexToRgba(text, 0.2) }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => nextDay && goToDay(nextDay.day)}
                        disabled={!nextDay}
                        className="p-2 border rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        style={{ borderColor: hexToRgba(text, 0.2) }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                 </div>

                 {/* Art Container */}
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }} 
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.2 }}
                   className="relative aspect-square rounded-xl overflow-hidden shadow-2xl group mx-auto w-full max-w-md lg:max-w-none border border-white/10"
                   style={{ boxShadow: `0 0 40px -10px ${moodColor}30` }}
                 >
                   <CoverImage
                      day={release.day}
                      title={release.title}
                      mood={release.mood}
                      energy={release.energy}
                      valence={release.valence}
                      tempo={release.tempo}
                      coverUrl={getCoverUrl(release.day, release.storageTitle || release.title)}
                      className="w-full h-full object-cover"
                      showColorVeil
                    />
                    
                    {/* NEW REACTOR PLAY BUTTON (Centered) */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <ReactorPlayButton 
                        isPlaying={isThisReleaseActive} 
                        onClick={handlePlay}
                        color={moodColor}
                      />
                    </div>

                    {/* Corner Accents */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t border-l opacity-50" style={{ borderColor: text }} />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r opacity-50" style={{ borderColor: text }} />
                 </motion.div>

                 {/* MOBILE CONTROL BAR (Tactile Navigation - Bottom of Art) */}
                 <div className="flex lg:hidden items-center justify-between gap-4 p-4 rounded-xl border backdrop-blur-md bg-white/5" style={{ borderColor: hexToRgba(text, 0.1) }}>
                    <div className="flex flex-col items-center px-4 w-full text-center">
                      <span className="text-xs font-bold" style={{ color: moodColor }}>DAY {String(dayNum).padStart(3, '0')}</span>
                      <span className="text-[10px] opacity-50 font-mono">TRANSMISSION LOG</span>
                    </div>
                 </div>
               </div>
             )}
          </div>

          {/* TEXT INFO (Second on Mobile) */}
          <div className="lg:col-span-7 relative z-10 order-last lg:order-first text-center lg:text-left">
            {release ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                
                {/* Meta Header */}
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-4 lg:mb-6">
                  <span className="px-3 py-1 text-xs font-bold bg-white/5 border border-white/10 rounded uppercase backdrop-blur-sm" style={{ color: moodColor }}>
                    {release.mood}
                  </span>
                  <span className="h-px w-8 bg-white/20" />
                  <span className="text-xs font-mono opacity-60">{release.date}</span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter mb-6 text-transparent bg-clip-text break-words drop-shadow-sm" 
                    style={{ backgroundImage: `linear-gradient(to bottom right, ${text}, ${hexToRgba(text, 0.5)})` }}>
                  {release.title}
                </h1>

                {/* Description */}
                <p className="text-base md:text-xl leading-relaxed opacity-80 max-w-2xl mx-auto lg:mx-0 font-medium" >
                  {release.description}
                </p>

                {/* CUSTOM INFO / ABOUT SECTION INJECTION - FIXED VISIBILITY */}
                {/* Check directly if release.customInfo exists */}
                {release.customInfo && (
                  <div 
                    className="mt-6 mx-auto lg:mx-0 p-5 text-left rounded-lg border backdrop-blur-sm bg-white/10 border-white/20 max-w-2xl shadow-lg"
                  >
                    <div className="flex items-center gap-2 mb-3 opacity-90 text-white">
                      <Info className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase tracking-widest font-bold">Additional Intel</span>
                    </div>
                    
                    {/* Enforced text colors and prose override */}
                    <div 
                      className="prose prose-invert prose-sm max-w-none text-white leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: release.customInfo }}
                    />
                  </div>
                )}

                {/* Quick Stats Row */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mt-8">
                  <TechBadge color={text} label="TEMPO">
                    <Clock className="w-3 h-3" /> {release.tempo} BPM
                  </TechBadge>
                  <TechBadge color={text} label="KEY">
                    <Music className="w-3 h-3" /> {release.key}
                  </TechBadge>
                  <TechBadge color={text} label="DURATION">
                    <Maximize2 className="w-3 h-3" /> {release.durationFormatted}
                  </TechBadge>
                </div>
              </motion.div>
            ) : (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                <p className="text-2xl font-mono opacity-50">DATA_CORRUPTED: NO_ENTRY_FOUND</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {release && (
        <div className="max-w-7xl mx-auto px-4 md:px-12 lg:px-16 z-10 relative">
          
          {/* AUDIO PLAYER MODULE (Desktop mostly, but simplified for mobile) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="hidden md:block my-12 p-8 rounded-2xl border backdrop-blur-xl relative overflow-hidden"
            style={{ 
              backgroundColor: hexToRgba(background, 0.7),
              borderColor: hexToRgba(text, 0.1),
              boxShadow: isThisReleaseActive ? `0 0 40px -10px ${moodColor}30` : 'none'
            }}
          >
            {isThisReleaseActive && (
              <motion.div layoutId="activeLine" className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: moodColor }} />
            )}

            <div className="flex items-center gap-8">
              <button
                onClick={handlePlay}
                disabled={audioError && isThisPlaying}
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-all"
                style={{ backgroundColor: isThisPlaying ? moodColor : hexToRgba(text, 0.1) }}
              >
                 {isLoading && isThisPlaying ? (
                    <div className="w-6 h-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
                 ) : isThisReleaseActive ? (
                    <Pause className="fill-white" /> 
                 ) : ( 
                    <Play className="fill-white ml-1" />
                 )}
              </button>

              {/* Scrubber Area */}
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs font-mono opacity-60">
                   <span>{isThisPlaying ? formatTime(currentTime) : '0:00'}</span>
                   <span>Audio Sequence</span>
                   <span>{formatTime((isThisPlaying && duration) || release.duration)}</span>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="absolute top-0 left-0 bottom-0 bg-current opacity-80" style={{ width: `${(currentTime / (duration || 1)) * 100}%`, color: moodColor }} />
                  <input type="range" min={0} max={duration || 100} value={currentTime} onChange={handleSeek} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* DASHBOARD GRID */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            
            {/* 1. AUDIO ANALYSIS */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-1 space-y-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5" style={{ color: moodColor }} />
                <h3 className="font-mono text-sm tracking-widest uppercase">Signal Analysis</h3>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <StatModule label="Energy Output" value={release.energy * 100} color={primary} />
                <StatModule label="Valence Level" value={release.valence * 100} color={accent} />
                <StatModule label="Danceability" value={(release.danceability || 0) * 100} color={secondary} />
                {release.loudness && (
                  <div className="p-4 border rounded-lg bg-white/5 border-white/10 flex justify-between items-center backdrop-blur-sm">
                    <span className="text-[10px] font-mono uppercase opacity-60">Loudness</span>
                    <span className="font-mono font-bold">{release.loudness.toFixed(1)} dB</span>
                  </div>
                )}
              </div>

              {/* Tags Cloud */}
              <div className="mt-8">
                 <h4 className="font-mono text-xs opacity-50 mb-3 uppercase">Classifications</h4>
                 <div className="flex flex-wrap gap-2">
                   {release.tags.map(tag => (
                     <span key={tag} className="px-2 py-1 text-[10px] font-mono border rounded hover:bg-white/5 cursor-default transition-colors" style={{ borderColor: hexToRgba(text, 0.2) }}>
                       #{tag}
                     </span>
                   ))}
                 </div>
              </div>
            </motion.div>

            {/* 2. LYRICS / POETRY (Mobile-First Fix) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`lg:col-span-2 transition-all duration-500 ${lyricsExpanded ? 'fixed inset-0 z-50 bg-black/95 p-6 overflow-hidden' : 'relative'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: moodColor }} />
                  <h3 className="font-mono text-sm tracking-widest uppercase">Poetry Stream</h3>
                </div>
                
                {/* Mobile Expand Toggle */}
                <button 
                  onClick={() => setLyricsExpanded(!lyricsExpanded)}
                  className="lg:hidden p-2 rounded border border-white/10 bg-white/5"
                >
                  {lyricsExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>

              <div 
                className={`rounded-2xl border relative overflow-hidden transition-all duration-500 ${lyricsExpanded ? 'h-full pb-20' : 'h-[400px] md:h-[500px]'}`}
                style={{ 
                  backgroundColor: hexToRgba(background, 0.4),
                  borderColor: hexToRgba(text, 0.1)
                }}
              >
                {/* Background Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }} />

                {(playingHasPoetryData || hasPoetryData) ? (
                   <div className="h-full w-full overflow-y-auto custom-scrollbar touch-pan-y">
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
                  <div className="p-6 md:p-8 h-full overflow-y-auto custom-scrollbar touch-pan-y">
                     <pre className="font-mono text-sm leading-loose whitespace-pre-wrap opacity-80">
                       {release.lyrics || "No lyrical data available for this transmission."}
                     </pre>
                  </div>
                )}
                
                {/* Fade indicator for mobile if not expanded */}
                {!lyricsExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none lg:hidden" />
                )}
              </div>
            </motion.div>
          </div>

          {/* 3. VIDEO / ABOUT SECTION */}
          {release.videoUrl && (
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-20"
            >
              <div className="flex items-center gap-2 mb-6 justify-center">
                 <Disc className="w-5 h-5 animate-spin-slow" style={{ color: moodColor }} />
                 <h3 className="font-mono text-sm tracking-widest uppercase">Visual Log</h3>
              </div>
              
              <div className="w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                <div className="aspect-video relative">
                  {isYouTube(release.videoUrl) ? (
                      <iframe
                        src={release.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : isVimeo(release.videoUrl) ? (
                      <iframe
                        src={release.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video className="absolute inset-0 w-full h-full" src={release.videoUrl} controls playsInline />
                    )}
                </div>
              </div>
            </motion.section>
          )}

          {/* FOOTER NAVIGATION (Desktop Only - Mobile uses control bar) */}
          <div className="hidden lg:flex items-center justify-between border-t py-8" style={{ borderColor: hexToRgba(text, 0.1) }}>
             {prevDay ? (
               <button onClick={() => goToDay(prevDay.day)} className="group text-left">
                  <div className="text-[10px] font-mono opacity-50 mb-1 group-hover:text-primary transition-colors">PREV_LOG</div>
                  <div className="flex items-center gap-2 text-sm font-bold opacity-80 group-hover:opacity-100">
                    <ChevronLeft className="w-4 h-4" /> Day {prevDay.day}
                  </div>
               </button>
             ) : <div />}

             <div className="flex gap-4">
                {(release.youtubeUrl || release.audiusUrl) && (
                  <div className="flex gap-2">
                     {release.youtubeUrl && (
                       <a href={release.youtubeUrl} target="_blank" rel="noopener noreferrer" 
                          className="p-3 rounded-full bg-white/5 hover:bg-red-600 hover:text-white transition-colors">
                          <ExternalLink className="w-4 h-4" />
                       </a>
                     )}
                     <button className="p-3 rounded-full bg-white/5 hover:bg-white/20 transition-colors">
                       <Share2 className="w-4 h-4" />
                     </button>
                  </div>
                )}
             </div>

             {nextDay ? (
               <button onClick={() => goToDay(nextDay.day)} className="group text-right">
                  <div className="text-[10px] font-mono opacity-50 mb-1 group-hover:text-primary transition-colors">NEXT_LOG</div>
                  <div className="flex items-center gap-2 text-sm font-bold opacity-80 group-hover:opacity-100">
                    Day {nextDay.day} <ChevronRight className="w-4 h-4" />
                  </div>
               </button>
             ) : <div />}
          </div>

        </div>
      )}

      {/* Modals */}
      <ManifestoModal isOpen={showManifesto} onClose={() => setShowManifesto(false)} />
      <ConnectModal isOpen={showConnect} onClose={() => setShowConnect(false)} />
    </div>
  );
}