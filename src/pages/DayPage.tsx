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
  Info
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
        className="px-3 py-1.5 rounded border flex items-center gap-2 font-mono text-xs font-bold"
        style={{ 
          borderColor: hexToRgba(color, 0.3),
          backgroundColor: hexToRgba(color, 0.1),
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
    <div className="relative group p-4 border rounded-lg overflow-hidden" style={{ borderColor: hexToRgba(color, 0.2), backgroundColor: hexToRgba(color, 0.05) }}>
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
      {/* Glow Effect */}
      <div 
        className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: color }}
      />
    </div>
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

  const isLight = release?.mood === 'light';
  const moodColor = isLight ? accent : primary;

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
    <div className="min-h-screen pb-32 relative overflow-hidden" style={{ backgroundColor: background, color: text }}>
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

      {/* HERO SECTION - Responsive padding fix for mobile */}
      <section className="relative pt-24 md:pt-40 pb-12 px-6 md:px-12 lg:px-16 z-10 min-h-[60vh] md:min-h-[70vh] flex flex-col justify-center">
        
        {/* Navigation Arrows (Desktop Only - Absolute) */}
        {prevDay && (
          <motion.button
            whileHover={{ x: -5, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => goToDay(prevDay.day)}
            className="hidden lg:flex absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 items-center justify-center rounded-full border backdrop-blur-md z-30 group"
            style={{ 
              borderColor: hexToRgba(text, 0.1),
              backgroundColor: hexToRgba(background, 0.5),
              boxShadow: `0 4px 30px ${hexToRgba(background, 0.5)}`
            }}
          >
            <ChevronLeft className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: text }} />
            <div className="absolute left-full ml-4 py-1 px-3 rounded bg-black/80 border border-white/10 text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-x-2 group-hover:translate-x-0">
               LOG_{String(prevDay.day).padStart(3, '0')}
            </div>
          </motion.button>
        )}

        {nextDay && (
          <motion.button
            whileHover={{ x: 5, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => goToDay(nextDay.day)}
            className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 items-center justify-center rounded-full border backdrop-blur-md z-30 group"
            style={{ 
              borderColor: hexToRgba(text, 0.1),
              backgroundColor: hexToRgba(background, 0.5),
              boxShadow: `0 4px 30px ${hexToRgba(background, 0.5)}`
            }}
          >
            <ChevronRight className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: text }} />
            <div className="absolute right-full mr-4 py-1 px-3 rounded bg-black/80 border border-white/10 text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none -translate-x-2 group-hover:translate-x-0">
               LOG_{String(nextDay.day).padStart(3, '0')}
            </div>
          </motion.button>
        )}

        <div className="max-w-7xl mx-auto w-full">
          
          {/* Breadcrumbs HUD with Mobile Nav */}
          <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4 text-xs font-mono tracking-widest opacity-60">
              <Link to="/" className="hover:text-primary transition-colors flex items-center gap-2">
                <Home className="w-3 h-3" /> HOME
              </Link>
              <span>/</span>
              <span style={{ color: moodColor }}>LOG_{String(dayNum).padStart(3, '0')}</span>
            </div>

            {/* Mobile Nav Controls - Larger touch targets */}
            <div className="flex lg:hidden gap-3">
              <button 
                onClick={() => prevDay && goToDay(prevDay.day)}
                disabled={!prevDay}
                className="p-3 border rounded-lg hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                style={{ borderColor: hexToRgba(text, 0.2), backgroundColor: hexToRgba(background, 0.5) }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => nextDay && goToDay(nextDay.day)}
                disabled={!nextDay}
                className="p-3 border rounded-lg hover:bg-white/10 active:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                style={{ borderColor: hexToRgba(text, 0.2), backgroundColor: hexToRgba(background, 0.5) }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Right: Cover Art / Visualization (Mobile: First) */}
            <div className="lg:col-span-5 relative order-first lg:order-last">
               {release && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }} 
                   animate={{ opacity: 1, scale: 1 }}
                   transition={{ delay: 0.2 }}
                   className="relative aspect-square rounded-xl overflow-hidden shadow-2xl group mx-auto max-w-sm lg:max-w-none"
                   style={{ boxShadow: `0 0 60px -20px ${moodColor}40` }}
                 >
                   {/* Animated border ring */}
                   <div className="absolute inset-0 border border-white/10 rounded-xl z-20 pointer-events-none" />
                   
                   <CoverImage
                      day={release.day}
                      title={release.title}
                      mood={release.mood}
                      energy={release.energy}
                      valence={release.valence}
                      tempo={release.tempo}
                      coverUrl={getCoverUrl(release.day, release.storageTitle || release.title)}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      showColorVeil
                    />
                    
                    {/* Floating Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm bg-black/20">
                      <button 
                        onClick={handlePlay}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 hover:scale-110 transition-transform shadow-2xl"
                      >
                         {isThisReleaseActive ? (
                            <Pause className="w-8 h-8 md:w-10 md:h-10 fill-current" />
                         ) : (
                            <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />
                         )}
                      </button>
                    </div>

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 z-20" style={{ borderColor: moodColor }} />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 z-20" style={{ borderColor: moodColor }} />
                 </motion.div>
               )}
            </div>

            {/* Left: Content Info (Mobile: Second) */}
            <div className="lg:col-span-7 relative z-10 order-last lg:order-first">
              {release ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <div className="flex items-center gap-3 mb-4 lg:mb-6">
                    <span className="px-3 py-1 text-xs font-bold bg-white/10 border border-white/10 rounded uppercase" style={{ color: moodColor }}>
                      {release.mood}
                    </span>
                    <span className="h-px w-8 bg-white/20" />
                    <span className="text-xs font-mono opacity-60">{release.date}</span>
                  </div>

                  {/* Responsive Title Size */}
                  <h1 className="text-4xl md:text-5xl lg:text-8xl font-black uppercase leading-[0.9] tracking-tighter mb-6 lg:mb-8 text-transparent bg-clip-text break-words" 
                      style={{ backgroundImage: `linear-gradient(to bottom right, ${text}, ${hexToRgba(text, 0.5)})` }}>
                    {release.title}
                  </h1>

                  <p className="text-base md:text-xl leading-relaxed opacity-80 border-l-2 pl-4 lg:pl-6 max-w-2xl" 
                     style={{ borderColor: moodColor }}>
                    {release.description}
                  </p>

                  {/* CUSTOM INFO / ABOUT SECTION INJECTION - FIXED VISIBILITY */}
                  {release.customInfo && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6 p-4 rounded-lg border backdrop-blur-sm"
                      style={{ 
                        backgroundColor: hexToRgba(moodColor, 0.05),
                        borderColor: hexToRgba(moodColor, 0.2)
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3 opacity-80">
                        <Info className="w-4 h-4" />
                        <span className="text-xs font-mono uppercase tracking-widest">Additional Intel</span>
                      </div>
                      
                      {/* Enforce text color to ensure visibility against dark backgrounds */}
                      <div 
                        className="prose prose-invert prose-sm max-w-none text-light-cream/90"
                        dangerouslySetInnerHTML={{ __html: release.customInfo }}
                      />
                    </motion.div>
                  )}

                  {/* Quick Stats Row */}
                  <div className="flex flex-wrap gap-3 lg:gap-4 mt-6 lg:mt-8">
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
        </div>
      </section>

      {release && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 z-10 relative">
          
          {/* AUDIO PLAYER MODULE */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="my-8 lg:my-12 p-6 md:p-8 rounded-2xl border backdrop-blur-xl relative overflow-hidden"
            style={{ 
              backgroundColor: hexToRgba(background, 0.7),
              borderColor: hexToRgba(text, 0.1),
              boxShadow: isThisReleaseActive ? `0 0 40px -10px ${moodColor}30` : 'none'
            }}
          >
            {/* Active glowing line at top */}
            {isThisReleaseActive && (
              <motion.div layoutId="activeLine" className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: moodColor }} />
            )}

            <div className="flex flex-col md:flex-row gap-6 lg:gap-8 items-center">
              {/* Play Button */}
              <button
                onClick={handlePlay}
                disabled={audioError && isThisPlaying}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shrink-0 transition-all hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: isThisPlaying ? moodColor : hexToRgba(text, 0.05),
                  color: isThisPlaying ? background : text,
                  boxShadow: isThisPlaying ? `0 0 30px ${moodColor}60` : 'none'
                }}
              >
                 {isLoading && isThisPlaying ? (
                    <div className="w-6 h-6 md:w-8 md:h-8 border-4 border-current border-t-transparent rounded-full animate-spin" />
                 ) : isThisReleaseActive ? (
                    <Pause className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                 ) : (
                    <Play className="w-6 h-6 md:w-8 md:h-8 fill-current ml-1" />
                 )}
              </button>

              {/* Scrubber Area */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex justify-between text-xs font-mono tracking-wider opacity-60">
                   <span>{isThisPlaying ? formatTime(currentTime) : '0:00'}</span>
                   <span className="hidden md:inline">Audio Sequence Running...</span>
                   <span>{formatTime((isThisPlaying && duration) || release.duration)}</span>
                </div>
                
                <div className="relative w-full h-8 flex items-center group">
                  <div className="absolute inset-0 rounded-full opacity-20" style={{ backgroundColor: text }} />
                  {/* Progress Fill */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 rounded-l-full opacity-80"
                    style={{ 
                      width: isThisPlaying ? `${(currentTime / (duration || 1)) * 100}%` : '0%',
                      backgroundColor: moodColor
                    }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={(isThisPlaying && duration) || release.duration || 100}
                    value={isThisPlaying ? currentTime : 0}
                    onChange={handleSeek}
                    disabled={!isThisPlaying}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {/* Thumb Indicator */}
                  <div 
                    className="absolute h-4 w-1 bg-white shadow-[0_0_10px_white] pointer-events-none transition-all"
                    style={{ 
                      left: isThisPlaying ? `${(currentTime / (duration || 1)) * 100}%` : '0%'
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* DASHBOARD GRID */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            
            {/* 1. AUDIO ANALYSIS (Left Column) */}
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
                  <div className="p-4 border rounded-lg bg-white/5 border-white/10 flex justify-between items-center">
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

            {/* 2. LYRICS / POETRY (Center/Right Wide Column) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: moodColor }} />
                  <h3 className="font-mono text-sm tracking-widest uppercase">Poetry Stream</h3>
                </div>
                {playingHasPoetryData && !isThisPlaying && (
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 animate-pulse">
                    SYNCING_EXTERNAL_SIGNAL
                  </span>
                )}
              </div>

              <div 
                className="min-h-[400px] md:min-h-[500px] rounded-2xl border relative overflow-hidden"
                style={{ 
                  backgroundColor: hexToRgba(background, 0.4),
                  borderColor: hexToRgba(text, 0.1)
                }}
              >
                {/* Background Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                     style={{ backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')` }} />

                {(playingHasPoetryData || hasPoetryData) ? (
                   <KaraokeLyrics
                      words={lyricsWordsToShow || []}
                      segments={lyricsSegmentsToShow}
                      currentTime={currentTimeForLyrics}
                      onWordClick={handleWordClick}
                      isPlaying={isPlaying}
                      fullHeight
                    />
                ) : (
                  <div className="p-6 md:p-8 h-full overflow-y-auto custom-scrollbar">
                     <pre className="font-mono text-sm leading-loose whitespace-pre-wrap opacity-80">
                       {release.lyrics || "No lyrical data available for this transmission."}
                     </pre>
                  </div>
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

          {/* FOOTER NAVIGATION */}
          <div className="flex flex-wrap items-center justify-between border-t py-8 gap-4" style={{ borderColor: hexToRgba(text, 0.1) }}>
             {prevDay ? (
               <button onClick={() => goToDay(prevDay.day)} className="group text-left">
                  <div className="text-[10px] font-mono opacity-50 mb-1 group-hover:text-primary transition-colors">PREV_LOG</div>
                  <div className="flex items-center gap-2 text-sm font-bold opacity-80 group-hover:opacity-100">
                    <ChevronLeft className="w-4 h-4" /> Day {prevDay.day}
                  </div>
               </button>
             ) : <div />}

             <div className="flex gap-4 order-first lg:order-none w-full lg:w-auto justify-center">
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