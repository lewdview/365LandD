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
  Home, 
  Sparkles, 
  Activity, 
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
      {label && <span className="text-[10px] font-mono tracking-wider opacity-90 uppercase text-white font-bold" style={BOLD_TEXT_STYLE_SMALL}>{label}</span>}
      <div 
        className="px-3 py-1.5 rounded border flex items-center gap-2 font-mono text-xs font-bold backdrop-blur-md transition-colors duration-300"
        style={{ 
          borderColor: hexToRgba(color, 0.5),
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: color,
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
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
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
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

// 2030 "Reactor" Play Button
function ReactorPlayButton({ isPlaying, onClick, color }: { isPlaying: boolean, onClick: () => void, color: string }) {
  return (
    <button 
      onClick={onClick}
      className="group relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center focus:outline-none z-30"
    >
      {/* Outer Rotating Ring */}
      <motion.div 
        className="absolute inset-0 rounded-full border-2 border-dashed opacity-100 transition-colors duration-300"
        style={{ borderColor: color, filter: 'drop-shadow(0 0 5px black)' }}
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
      
      {/* Glass Core */}
      <div 
        className="absolute inset-4 rounded-full backdrop-blur-xl border-2 border-white/60 shadow-inner flex items-center justify-center transition-transform group-hover:scale-95 group-active:scale-90 duration-300"
        style={{ 
          background: `linear-gradient(135deg, ${hexToRgba(color, 0.8)}, ${hexToRgba('#000000', 0.9)})`,
          boxShadow: `0 0 30px ${hexToRgba(color, 0.5)}, inset 0 0 10px rgba(255,255,255,0.5)`
        }}
      >
        {isPlaying ? (
          <Pause className="w-10 h-10 md:w-12 md:h-12 text-white fill-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
        ) : (
          <Play className="w-10 h-10 md:w-12 md:h-12 text-white fill-white ml-2 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]" />
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
    <div className="min-h-screen pb-48 relative overflow-hidden transition-colors duration-500" style={{ backgroundColor: background, color: text }}>
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

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 md:px-8 pt-24">
        {release ? (
          <>
            {/* --- HERO CARD (Rectangle Encapsulation) --- */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="relative w-full aspect-video rounded-[2rem] overflow-hidden shadow-2xl border mb-12 group flex flex-col"
              style={{ borderColor: hexToRgba(text, 0.1) }}
            >
              {/* FULL BACKGROUND COVER */}
              <div className="absolute inset-0 z-0">
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
                
                {/* THEME COLOR INJECTION OVERLAY */}
                <div 
                  className="absolute inset-0 z-10 mix-blend-overlay opacity-40 pointer-events-none transition-colors duration-500"
                  style={{ backgroundColor: primary }} 
                />

                {/* Gradient Overlays for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 opacity-60 z-10" />
                
                {/* Scanline Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay z-10" />
              </div>

              {/* HERO CONTENT OVERLAY */}
              <div className="relative z-20 flex flex-col justify-between p-6 md:p-12 lg:p-16 h-full">
                
                {/* Top Bar: Breadcrumbs & Log */}
                <div className="flex justify-between items-start">
                   <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-black/40 border border-white/20 hover:bg-white/10 transition-colors">
                      <Home className="w-4 h-4 text-white" />
                      <span className="text-xs font-mono font-bold text-white tracking-widest" style={BOLD_TEXT_STYLE_SMALL}>HOME</span>
                   </Link>

                   <div className="flex flex-col items-end">
                     <span className="text-[10px] font-mono tracking-[0.3em] uppercase opacity-90 text-white font-bold" style={BOLD_TEXT_STYLE_SMALL}>Transmission Log</span>
                     <span className="text-4xl font-black text-white tracking-tighter transition-colors duration-300" style={{ textShadow: `0 0 20px ${moodColor}` }}>
                       {String(dayNum).padStart(3, '0')}
                     </span>
                   </div>
                </div>

                {/* Center/Bottom Content */}
                <div className="grid lg:grid-cols-12 gap-8 items-end mt-auto">
                  
                  {/* Left: Metadata & Title */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex items-center gap-3">
                       <div className="px-3 py-1 rounded border backdrop-blur-md bg-black/60 border-white/30 flex items-center gap-2 shadow-lg">
                         <span className="w-2 h-2 rounded-full animate-pulse transition-colors duration-300" style={{ backgroundColor: moodColor, boxShadow: `0 0 10px ${moodColor}` }} />
                         <span className="text-xs font-mono font-bold uppercase text-white tracking-widest">{release.mood}</span>
                       </div>
                       <span className="text-xs font-mono text-white font-bold bg-black/40 px-2 py-1 rounded" style={BOLD_TEXT_STYLE_SMALL}>{release.date}</span>
                    </div>

                    <div>
                      <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-7xl lg:text-9xl font-black uppercase leading-[0.85] tracking-tighter text-white break-words drop-shadow-2xl mb-4"
                        style={BOLD_TEXT_STYLE}
                      >
                        {release.title}
                      </motion.h1>
                      
                      {/* HERO DESCRIPTION */}
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/90 text-lg md:text-xl font-medium max-w-2xl leading-relaxed"
                        style={BOLD_TEXT_STYLE_SMALL}
                      >
                        {release.description}
                      </motion.p>

                      {/* HERO CUSTOM INFO (ADDITIONAL INTEL) */}
                      {release.customInfo && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="mt-4"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Info className="w-4 h-4 text-white/80" />
                            <span className="text-xs font-mono uppercase font-bold text-white/80">Additional Intel</span>
                          </div>
                          <div 
                            className="prose prose-invert prose-sm leading-relaxed opacity-90 font-medium text-sm max-w-2xl"
                            style={BOLD_TEXT_STYLE_SMALL}
                            dangerouslySetInnerHTML={{ __html: release.customInfo }}
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
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

                  {/* Right: Reactor Play Button */}
                  <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center pb-4">
                     <motion.div
                       initial={{ scale: 0, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ delay: 0.3, type: "spring" }}
                     >
                       <ReactorPlayButton 
                          isPlaying={isThisReleaseActive} 
                          onClick={handlePlay} 
                          color={moodColor} 
                       />
                     </motion.div>
                     <div className="mt-4 text-xs font-mono text-white font-bold tracking-widest uppercase bg-black/40 px-3 py-1 rounded border border-white/10 backdrop-blur-sm">
                        {isThisReleaseActive ? 'Sequence Active' : 'Initiate Sequence'}
                     </div>
                  </div>
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
                 <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full">
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
                              className="flex-1 bg-current rounded-full transition-all duration-300"
                              style={{ 
                                height: `${20 + Math.random() * 80}%`,
                                color: isThisPlaying && (i / 40) < (currentTime / (duration || 1)) ? moodColor : text
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
                
                {/* 1. Mission Data (Cleaned up) */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="lg:col-span-1 space-y-6"
                >
                   <div className="p-6 rounded-xl border bg-white/5 backdrop-blur-sm transition-colors duration-500" style={{ borderColor: hexToRgba(text, 0.1) }}>
                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                       <Activity className="w-5 h-5 transition-colors duration-300" style={{ color: moodColor }} /> Mission Data
                     </h3>
                     
                     <div className="flex flex-wrap gap-2">
                       {release.tags.map(tag => (
                         <span key={tag} className="px-2 py-1 text-[10px] font-mono border rounded bg-black/20 transition-colors duration-500" style={{ borderColor: hexToRgba(text, 0.1) }}>
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

              {/* Footer Nav */}
              <div className="border-t pt-8 flex justify-between items-center transition-colors duration-500" style={{ borderColor: hexToRgba(text, 0.1) }}>
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

      {/* Modals */}
      <ManifestoModal isOpen={showManifesto} onClose={() => setShowManifesto(false)} />
      <ConnectModal isOpen={showConnect} onClose={() => setShowConnect(false)} />
    </div>
  );
}