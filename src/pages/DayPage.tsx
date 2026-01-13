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
  Calendar,
  ExternalLink,
  Home,
  Sparkles
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

export function DayPage() {
  const { day } = useParams<{ day: string }>();
  const navigate = useNavigate();
  const { data, fetchData, currentDay } = useStore();
  const { currentTheme } = useThemeStore();
  const { primary, accent, background } = currentTheme.colors;
  
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
  
  // Poetry in Motion should show the PLAYING release's lyrics, not the page's release
  const playingHasPoetryData = playingRelease?.lyricsWords && playingRelease.lyricsWords.length > 0;
  const lyricsWordsToShow = playingHasPoetryData ? playingRelease!.lyricsWords : (hasPoetryData ? release!.lyricsWords : []);
  const lyricsSegmentsToShow = playingHasPoetryData ? playingRelease!.lyricsSegments : (hasPoetryData ? release!.lyricsSegments : undefined);
  const currentTimeForLyrics = playingHasPoetryData ? currentTime : (isThisPlaying ? currentTime : 0);

  // Fetch data if not loaded
  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, [data, fetchData]);

  // Find release for this day and scroll to top
  useEffect(() => {
    if (data?.releases) {
      const found = data.releases.find(r => r.day === dayNum);
      setRelease(found || null);
      // Scroll to top when day changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [data, dayNum]);

  // Listen for manifesto and connect modal events
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

  // Play this release via global player
  const handlePlay = useCallback(() => {
    if (!release) return;
    
    if (isThisPlaying) {
      // Same track - just toggle play/pause
      globalTogglePlay();
    } else {
      // Different track - load and play
      loadAndPlay(release);
    }
  }, [release, isThisPlaying, globalTogglePlay, loadAndPlay]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    seek(newTime);
  }, [seek]);

  const handleWordClick = useCallback((time: number) => {
    if (!release) return;
    
    // If this release isn't playing, start it first
    if (!isThisPlaying) {
      loadAndPlay(release);
    }
    // Seek to the word time (with small delay if we just started playback)
    setTimeout(() => seek(time), isThisPlaying ? 0 : 100);
  }, [release, isThisPlaying, loadAndPlay, seek]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Navigation
  const goToDay = (d: number) => {
    if (d >= 1 && d <= 365) {
      navigate(`/day/${d}`);
    }
  };

  const prevDay = data?.releases.filter(r => r.day < dayNum && r.day >= 1).sort((a, b) => b.day - a.day)[0];
  // PRODUCTION: Only allow access up to current day
  const nextDay = data?.releases.filter(r => r.day > dayNum && r.day <= currentDay).sort((a, b) => a.day - b.day)[0];

  const isLight = release?.mood === 'light';

  // PRODUCTION: Day-gating — redirect to current day if user tries to access the future
  useEffect(() => {
    if (data && currentDay && dayNum > currentDay) {
      navigate(`/day/${currentDay}`);
    }
  }, [data, currentDay, dayNum, navigate]);

  if (!data) {
    return (
      <div className="min-h-screen bg-void-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-neon-red border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void-black text-light-cream pb-80 md:pb-72">
      <Navigation />
      <ThemeChanger />

      {/* Hero section with large day number */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Generative cover art as background */}
        {release && (
          <div className="absolute inset-0 z-0">
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
            {/* Overlay to darken the cover */}
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, ${background}90 0%, ${background}70 40%, ${background}95 100%)`,
              }}
            />
          </div>
        )}

        {/* Background gradient based on mood (fallback when no release) */}
        {!release && (
          <div 
            className="absolute inset-0"
            style={{
              background: isLight
                ? `radial-gradient(ellipse at center, ${hexToRgba(accent, 0.15)} 0%, ${background} 70%)`
                : `radial-gradient(ellipse at center, ${hexToRgba(primary, 0.15)} 0%, ${background} 70%)`,
            }}
          />
        )}

        {/* Large day number background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="text-[40vw] md:text-[35vw] font-black leading-none select-none"
            style={{
              color: 'transparent',
              WebkitTextStroke: `3px ${isLight ? accent : primary}`,
              opacity: 0.1,
            }}
          >
            {String(dayNum).padStart(3, '0')}
          </motion.span>
        </div>

        {/* Content */}
        <div className="relative z-[2] text-center px-4 max-w-4xl mx-auto">
          {/* Navigation breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-8"
            style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}
          >
            <Link 
              to="/" 
              className="flex items-center gap-2 text-light-cream/80 hover:text-neon-yellow transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-mono text-sm font-semibold">HOME</span>
            </Link>
            <span className="text-light-cream/50">/</span>
            <span className="font-mono text-sm font-semibold text-neon-yellow">DAY {dayNum}</span>
          </motion.div>

          {/* Day badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <span 
              className={`inline-block px-6 py-2 text-lg font-mono font-bold ${
                isLight ? 'bg-neon-yellow text-void-black' : 'bg-neon-red text-light-cream'
              }`}
            >
              DAY {String(dayNum).padStart(3, '0')}
            </span>
          </motion.div>

          {release ? (
            <>
              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 uppercase"
                style={{
                  textShadow: `
                    0 0 20px ${background},
                    0 0 40px rgba(0,0,0,0.8),
                    0 4px 12px rgba(0,0,0,0.9),
                    2px 2px 0 rgba(0,0,0,0.5),
                    -2px -2px 0 rgba(0,0,0,0.5),
                    2px -2px 0 rgba(0,0,0,0.5),
                    -2px 2px 0 rgba(0,0,0,0.5)
                  `,
                }}
              >
                {release.title}
              </motion.h1>

              {/* Mood indicator */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-semibold mb-6"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}
              >
                <span className={isLight ? 'text-neon-yellow' : 'text-neon-red'}>
                  {release.mood.toUpperCase()}
                </span>
                <span className="text-light-cream/70"> • {release.date}</span>
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-light-cream max-w-2xl mx-auto font-medium"
                style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8), 0 0 15px rgba(0,0,0,0.6)' }}
              >
                {release.description}
              </motion.p>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-2xl text-light-cream/50">No release for Day {dayNum} yet</p>
              <p className="text-light-cream/30 mt-2">Check back soon!</p>
            </motion.div>
          )}
        </div>

        {/* Day navigation arrows */}
        <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-[5]">
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => prevDay && goToDay(prevDay.day)}
            disabled={!prevDay}
            className={`p-3 md:p-4 rounded-full transition-all ${
              prevDay 
                ? 'bg-void-gray/80 backdrop-blur-sm hover:bg-neon-red/20 text-light-cream' 
                : 'bg-void-gray/30 text-light-cream/20 cursor-not-allowed'
            }`}
            style={{
              boxShadow: prevDay ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
          </motion.button>
          {prevDay && (
            <p className="text-xs font-mono text-light-cream/60 mt-2 text-center font-semibold" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              DAY {prevDay.day}
            </p>
          )}
        </div>

        <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-[5]">
          <motion.button
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => nextDay && goToDay(nextDay.day)}
            disabled={!nextDay}
            className={`p-3 md:p-4 rounded-full transition-all ${
              nextDay 
                ? 'bg-void-gray/80 backdrop-blur-sm hover:bg-neon-yellow/20 text-light-cream' 
                : 'bg-void-gray/30 text-light-cream/20 cursor-not-allowed'
            }`}
            style={{
              boxShadow: nextDay ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
          </motion.button>
          {nextDay && (
            <p className="text-xs font-mono text-light-cream/60 mt-2 text-center font-semibold" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              DAY {nextDay.day}
            </p>
          )}
          {!nextDay && dayNum === currentDay && (
            <p className="text-xs font-mono text-light-cream/40 mt-2 text-center font-semibold" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
              TODAY'S TRANSMISSION
            </p>
          )}
        </div>
      </section>

      {release && (
        <>
          {/* Audio player section */}
          <section className="py-12 px-6 md:px-12 lg:px-16">
            <div className="w-full">
              {audioError && isThisPlaying && (
                <div className="mb-4 p-3 bg-void-gray/30 border border-neon-red/50 rounded text-center">
                  <p className="text-neon-red text-sm font-mono">
                    Audio connection issue. Trying alternative source...
                  </p>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-lg overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, rgba(45,48,72,0.6) 0%, rgba(26,28,46,0.8) 100%)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Controls - no cover art in player, it's now in hero background */}
                <div className="p-6 md:p-8">
                  {/* Play button and progress */}
                  <div className="flex items-center gap-6">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handlePlay}
                      disabled={audioError && isThisPlaying}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        audioError && isThisPlaying
                          ? 'bg-void-gray/50 cursor-not-allowed' 
                          : isLight ? 'bg-neon-yellow hover:shadow-[0_0_30px_var(--color-neon-yellow)]' : 'bg-neon-red hover:shadow-[0_0_30px_var(--color-neon-red)]'
                      }`}
                    >
                      {isLoading && isThisPlaying ? (
                        <motion.div
                          className="w-8 h-8 border-4 border-void-black border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                      ) : isThisReleaseActive ? (
                        <Pause className="w-8 h-8 text-void-black" />
                      ) : (
                        <Play className="w-8 h-8 text-void-black ml-1" />
                      )}
                    </motion.button>

                    <div className="flex-1">
                      {/* Progress bar */}
                      <input
                        type="range"
                        min={0}
                        max={(isThisPlaying && duration) || release.duration || 100}
                        value={isThisPlaying ? currentTime : 0}
                        onChange={handleSeek}
                        disabled={!isThisPlaying}
                        className="w-full h-2 bg-void-lighter rounded-full appearance-none cursor-pointer disabled:opacity-50"
                        style={{
                          background: isThisPlaying 
                            ? `linear-gradient(to right, ${isLight ? accent : primary} ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 1)) * 100}%)`
                            : 'rgba(255,255,255,0.1)',
                        }}
                      />
                      <div className="flex justify-between mt-2 text-xs font-mono text-light-cream/50">
                        <span>{isThisPlaying ? formatTime(currentTime) : '0:00'}</span>
                        <span>{formatTime((isThisPlaying && duration) || release.duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-6 mt-6 text-sm font-mono text-light-cream/50">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {release.durationFormatted}
                    </span>
                    <span className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      {release.tempo} BPM
                    </span>
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      {release.key}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {release.date}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Comprehensive Audio Stats Section */}
          <section className="py-12 px-6 md:px-12 lg:px-16">
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-2xl font-mono text-neon-yellow mb-8 text-center uppercase tracking-wider">
                  Audio Analysis
                </h3>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {/* Energy */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-4 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, rgba(45,48,72,0.5) 0%, rgba(26,28,46,0.7) 100%)' }}
                  >
                    <span className="text-xs font-mono text-light-cream/50 block mb-2">ENERGY</span>
                    <div className="w-full h-2 bg-void-black rounded-full overflow-hidden mb-2">
                      <motion.div className="h-full bg-gradient-to-r from-neon-red to-neon-orange" style={{ width: `${release.energy * 100}%` }} />
                    </div>
                    <span className="text-lg font-bold" style={{ color: primary }}>{Math.round(release.energy * 100)}%</span>
                  </motion.div>

                  {/* Valence */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 }}
                    className="p-4 rounded-lg"
                    style={{ background: 'linear-gradient(135deg, rgba(45,48,72,0.5) 0%, rgba(26,28,46,0.7) 100%)' }}
                  >
                    <span className="text-xs font-mono text-light-cream/50 block mb-2">VALENCE</span>
                    <div className="w-full h-2 bg-void-black rounded-full overflow-hidden mb-2">
                      <motion.div className="h-full bg-gradient-to-r from-neon-yellow to-neon-orange" style={{ width: `${release.valence * 100}%` }} />
                    </div>
                    <span className="text-lg font-bold" style={{ color: accent }}>{Math.round(release.valence * 100)}%</span>
                  </motion.div>

                  {/* Danceability */}
                  {release.danceability !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 }}
                      className="p-4 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, rgba(45,48,72,0.5) 0%, rgba(26,28,46,0.7) 100%)' }}
                    >
                      <span className="text-xs font-mono text-light-cream/50 block mb-2">DANCE</span>
                      <div className="w-full h-2 bg-void-black rounded-full overflow-hidden mb-2">
                        <motion.div className="h-full bg-gradient-to-r from-pink-500 to-pink-400" style={{ width: `${(release.danceability || 0) * 100}%` }} />
                      </div>
                      <span className="text-lg font-bold text-pink-400">{Math.round((release.danceability || 0) * 100)}%</span>
                    </motion.div>
                  )}

                  {/* Acousticness */}
                  {release.acousticness !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 }}
                      className="p-4 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, rgba(45,48,72,0.5) 0%, rgba(26,28,46,0.7) 100%)' }}
                    >
                      <span className="text-xs font-mono text-light-cream/50 block mb-2">ACOUSTIC</span>
                      <div className="w-full h-2 bg-void-black rounded-full overflow-hidden mb-2">
                        <motion.div className="h-full bg-gradient-to-r from-green-500 to-green-400" style={{ width: `${(release.acousticness || 0) * 100}%` }} />
                      </div>
                      <span className="text-lg font-bold text-green-400">{Math.round((release.acousticness || 0) * 100)}%</span>
                    </motion.div>
                  )}

                  {/* Instrumentalness */}
                  {release.instrumentalness !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 }}
                      className="p-4 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, rgba(45,48,72,0.5) 0%, rgba(26,28,46,0.7) 100%)' }}
                    >
                      <span className="text-xs font-mono text-light-cream/50 block mb-2">INST</span>
                      <div className="w-full h-2 bg-void-black rounded-full overflow-hidden mb-2">
                        <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400" style={{ width: `${(release.instrumentalness || 0) * 100}%` }} />
                      </div>
                      <span className="text-lg font-bold text-cyan-400">{Math.round((release.instrumentalness || 0) * 100)}%</span>
                    </motion.div>
                  )}

                  {/* Speechiness */}
                  {release.speechiness !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.25 }}
                      className="p-4 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, rgba(45,48,72,0.5) 0%, rgba(26,28,46,0.7) 100%)' }}
                    >
                      <span className="text-xs font-mono text-light-cream/50 block mb-2">SPEECH</span>
                      <div className="w-full h-2 bg-void-black rounded-full overflow-hidden mb-2">
                        <motion.div className="h-full bg-gradient-to-r from-purple-500 to-purple-400" style={{ width: `${(release.speechiness || 0) * 100}%` }} />
                      </div>
                      <span className="text-lg font-bold text-purple-400">{Math.round((release.speechiness || 0) * 100)}%</span>
                    </motion.div>
                  )}

                  {/* Liveness */}
                  {release.liveness !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 }}
                      className="p-4 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, rgba(45,48,72,0.5) 0%, rgba(26,28,46,0.7) 100%)' }}
                    >
                      <span className="text-xs font-mono text-light-cream/50 block mb-2">LIVE</span>
                      <div className="w-full h-2 bg-void-black rounded-full overflow-hidden mb-2">
                        <motion.div className="h-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: `${(release.liveness || 0) * 100}%` }} />
                      </div>
                      <span className="text-lg font-bold text-blue-400">{Math.round((release.liveness || 0) * 100)}%</span>
                    </motion.div>
                  )}

                  {/* Loudness */}
                  {release.loudness !== undefined && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.35 }}
                      className="p-4 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, rgba(45,48,72,0.5) 0%, rgba(26,28,46,0.7) 100%)' }}
                    >
                      <span className="text-xs font-mono text-light-cream/50 block mb-2">LOUDNESS</span>
                      <span className="text-lg font-bold text-light-cream">{release.loudness.toFixed(1)}dB</span>
                    </motion.div>
                  )}

                  {/* Time Signature */}
                  {release.timeSignature && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                      className="p-4 rounded-lg"
                      style={{ background: 'linear-gradient(135deg, rgba(45,48,72,0.5) 0%, rgba(26,28,46,0.7) 100%)' }}
                    >
                      <span className="text-xs font-mono text-light-cream/50 block mb-2">TIME SIG</span>
                      <span className="text-lg font-bold text-light-cream">{release.timeSignature}</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Lyrics / Poetry in Motion - shows for PLAYING release or current page release */}
          {(playingHasPoetryData || hasPoetryData) && (
            <section className="py-12 px-6 md:px-12 lg:px-16">
              <div className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <h3 className="text-xl font-mono text-neon-yellow mb-6 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    POETRY IN MOTION
                    {playingHasPoetryData && !isThisPlaying && playingRelease && (
                      <span className="text-xs text-light-cream/50 ml-2">
                        (Day {playingRelease.day})
                      </span>
                    )}
                  </h3>
                  <KaraokeLyrics
                    words={lyricsWordsToShow || []}
                    segments={lyricsSegmentsToShow}
                    currentTime={currentTimeForLyrics}
                    onWordClick={handleWordClick}
                    isPlaying={isPlaying}
                    fullHeight
                  />
                </motion.div>
              </div>
            </section>
          )}

          {/* Plain lyrics fallback when no word-level sync */}
          {!hasPoetryData && release.lyrics && release.lyrics.trim().length > 0 && (
            <section className="py-12 px-6 md:px-12 lg:px-16">
              <div className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-6 md:p-8 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,48,72,0.4) 0%, rgba(26,28,46,0.6) 100%)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <h3 className="text-xl font-mono text-neon-yellow mb-6 text-center">LYRICS</h3>
                  <pre className="whitespace-pre-wrap font-mono text-light-cream/80 text-sm leading-relaxed">
                    {release.lyrics}
                  </pre>
                </motion.div>
              </div>
            </section>
          )}

          {/* About Entry - Video */}
          {release.videoUrl && (
            <section className="py-12 px-6 md:px-12 lg:px-16">
              <div className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="p-4 md:p-6 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,48,72,0.4) 0%, rgba(26,28,46,0.6) 100%)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <h3 className="text-xl font-mono text-neon-yellow mb-4 text-center uppercase tracking-wider">About This Entry</h3>
                  <div className="relative w-full max-w-4xl mx-auto aspect-video overflow-hidden bg-void-black">
                    {isYouTube(release.videoUrl) ? (
                      <iframe
                        src={release.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`${release.title} - About video`}
                      />
                    ) : isVimeo(release.videoUrl) ? (
                      <iframe
                        src={release.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={`${release.title} - About video`}
                      />
                    ) : (
                      <video
                        className="absolute inset-0 w-full h-full"
                        src={release.videoUrl}
                        controls
                        playsInline
                      />
                    )}
                  </div>
                </motion.div>
              </div>
            </section>
          )}

          {/* Tags and links */}
          <section className="py-12 px-6 md:px-12 lg:px-16 pb-32">
            <div className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-6 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(45,48,72,0.3) 0%, rgba(26,28,46,0.5) 100%)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
              <div className="flex flex-col gap-6 items-center text-center">
                  {/* Tags */}
                  <div>
                    <h4 className="text-sm font-mono text-light-cream/40 mb-3 uppercase tracking-wider">Tags</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {release.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`px-3 py-1.5 text-sm font-mono ${
                            isLight
                              ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30 hover:bg-neon-yellow/20'
                              : 'bg-neon-red/10 text-neon-red border border-neon-red/30 hover:bg-neon-red/20'
                          } transition-colors cursor-default`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Genre */}
                  {release.genre && release.genre.length > 0 && (
                    <div>
                      <h4 className="text-sm font-mono text-light-cream/40 mb-3 uppercase tracking-wider">Genre</h4>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {release.genre.map((g) => (
                          <span
                            key={g}
                            className="px-3 py-1.5 text-sm font-mono bg-void-lighter/50 text-light-cream/70 border border-void-lighter"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External links */}
                  {(release.youtubeUrl || release.audiusUrl) && (
                    <div>
                      <h4 className="text-sm font-mono text-light-cream/40 mb-3 uppercase tracking-wider">Listen On</h4>
                      <div className="flex flex-wrap gap-3 justify-center">
                        {release.youtubeUrl && (
                          <a
                            href={release.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-void-gray/80 hover:bg-neon-red/30 transition-all text-sm font-mono hover:scale-105"
                          >
                            <ExternalLink className="w-4 h-4" />
                            YouTube
                          </a>
                        )}
                        {release.audiusUrl && (
                          <a
                            href={release.audiusUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-void-gray/80 hover:bg-neon-yellow/30 transition-all text-sm font-mono hover:scale-105"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Audius
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Navigation footer */}
          <section className="py-12 px-6 md:px-12 lg:px-16 border-t border-void-lighter">
            <div className="w-full">
              <div className="flex flex-wrap justify-between items-center gap-4">
                {prevDay ? (
                  <button
                    onClick={() => goToDay(prevDay.day)}
                    className="group flex items-center gap-4 hover:text-neon-yellow transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
                    <div className="text-left">
                      <p className="text-xs font-mono text-light-cream/40">PREVIOUS</p>
                      <p className="font-bold">Day {prevDay.day}: {prevDay.title}</p>
                    </div>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-3">
                  <Link
                    to="/"
                    className="px-4 py-2 bg-void-gray/50 hover:bg-neon-red/20 transition-colors font-mono text-sm"
                  >
                    ALL RELEASES
                  </Link>
                </div>

                {nextDay ? (
                  <button
                    onClick={() => goToDay(nextDay.day)}
                    className="group flex items-center gap-4 hover:text-neon-yellow transition-colors"
                  >
                    <div className="text-right">
                      <p className="text-xs font-mono text-light-cream/40">NEXT</p>
                      <p className="font-bold">Day {nextDay.day}: {nextDay.title}</p>
                    </div>
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
                ) : <div />}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Modals */}
      <ManifestoModal isOpen={showManifesto} onClose={() => setShowManifesto(false)} />
      <ConnectModal isOpen={showConnect} onClose={() => setShowConnect(false)} />
    </div>
  );
}
