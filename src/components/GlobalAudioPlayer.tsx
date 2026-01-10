import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, X, SkipBack, SkipForward } from 'lucide-react';
import { useAudioStore } from '../store/useAudioStore';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { CoverImage } from './GenerativeCover';
import { getLocalAudioUrl, getCoverUrl } from '../services/releaseStorage';

export function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { data } = useStore();
  const { currentTheme } = useThemeStore();
  const { primary, secondary, background } = currentTheme.colors;
  
  // Text shadow for visibility across themes
  const textShadow = `
    -1px -1px 0 ${background},
    1px -1px 0 ${background},
    -1px 1px 0 ${background},
    1px 1px 0 ${background}
  `;
  
  const {
    currentRelease,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoading,
    hasError,
    setAudioElement,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    stop,
    _setCurrentTime,
    _setDuration,
    _setIsPlaying,
    _setIsLoading,
    _setHasError,
    loadAndPlay,
  } = useAudioStore();

  // Register audio element with store
  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current);
      audioRef.current.volume = volume;
    }
    return () => setAudioElement(null);
  }, [setAudioElement, volume]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => _setCurrentTime(audio.currentTime);
    const handleDurationChange = () => _setDuration(audio.duration);
    const handlePlay = () => { _setIsPlaying(true); _setIsLoading(false); };
    const handlePause = () => _setIsPlaying(false);
    const handleEnded = () => { _setIsPlaying(false); _setCurrentTime(0); };
    const handleError = () => {
      // Try fallback to local /music symlink (dev only, points to /Volumes/extremeDos/temp music)
      if (currentRelease && audio.src && !audio.src.includes('/music/')) {
        const fallbackUrl = getLocalAudioUrl(currentRelease.day, currentRelease.storageTitle || currentRelease.title);
        console.log('Global player: bucket failed, trying local fallback:', fallbackUrl);
        audio.src = fallbackUrl;
        audio.load();
        audio.play().catch(() => _setHasError(true));
      } else {
        console.error('Global player: all sources exhausted');
        _setHasError(true);
      }
    };
    const handleCanPlay = () => { _setHasError(false); _setIsLoading(false); };
    const handleLoadStart = () => _setIsLoading(true);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
    };
  }, [currentRelease, _setCurrentTime, _setDuration, _setIsPlaying, _setIsLoading, _setHasError]);

  // Skip to prev/next release
  const skipTo = (direction: 'prev' | 'next') => {
    if (!currentRelease || !data?.releases) return;
    const currentIndex = data.releases.findIndex(r => r.day === currentRelease.day);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < data.releases.length) {
      loadAndPlay(data.releases[newIndex]);
    }
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Don't render if no track is loaded
  if (!currentRelease) return <audio ref={audioRef} preload="none" />;

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        preload="none"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />
      
      {/* Footer player */}
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          {/* Progress bar - full width at top of footer */}
          <div 
            className="h-1 bg-void-gray/50 cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              seek(percent * duration);
            }}
          >
            <motion.div
              className="h-full relative"
              style={{ 
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${primary}, ${secondary})`,
              }}
            >
              {/* Seek handle on hover */}
              <div 
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: secondary }}
              />
            </motion.div>
          </div>

          {/* Main footer content */}
          <div 
            className="backdrop-blur-xl border-t-2"
            style={{ 
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              borderColor: `${primary}40`,
            }}
          >
            <div className="w-full px-4 md:px-8 py-2 md:py-3">
              <div className="flex items-center gap-3 md:gap-4">
                {/* Cover art - clickable to go to day page */}
                <Link to={`/day/${currentRelease.day}`} className="flex-shrink-0">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded overflow-hidden border-2 hover:scale-105 transition-transform"
                    style={{ borderColor: `${primary}60` }}
                  >
                    <CoverImage 
                      day={currentRelease.day}
                      title={currentRelease.title}
                      mood={currentRelease.mood}
                      energy={currentRelease.energy}
                      valence={currentRelease.valence}
                      tempo={currentRelease.tempo}
coverUrl={getCoverUrl(currentRelease.day, currentRelease.storageTitle || currentRelease.title)}
                      className="w-full h-full"
                      showColorVeil 
                    />
                  </div>
                </Link>

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/day/${currentRelease.day}`}
                    className="block hover:underline"
                  >
                    <p 
                      className="font-bold text-sm md:text-base truncate"
                      style={{ color: currentTheme.colors.text, textShadow }}
                    >
                      {currentRelease.title}
                    </p>
                  </Link>
                  <p 
                    className="text-xs md:text-sm truncate" 
                    style={{ color: `${currentTheme.colors.text}99`, textShadow }}
                  >
                    Day {currentRelease.day} • {formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1 md:gap-2">
                  {/* Skip back - hidden on mobile */}
                  <button
                    onClick={() => skipTo('prev')}
                    className="hidden md:flex p-2 rounded-full hover:bg-white/10 transition-colors"
                    style={{ color: currentTheme.colors.text }}
                    disabled={!data?.releases || data.releases.findIndex(r => r.day === currentRelease.day) === 0}
                  >
                    <SkipBack size={18} />
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-2 md:p-3 rounded-full transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: primary,
                      color: currentTheme.colors.background,
                    }}
                    disabled={hasError}
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-5 h-5 md:w-6 md:h-6 border-2 border-current border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : isPlaying ? (
                      <Pause size={20} className="md:w-6 md:h-6" />
                    ) : (
                      <Play size={20} className="md:w-6 md:h-6 ml-0.5" />
                    )}
                  </button>

                  {/* Skip forward - hidden on mobile */}
                  <button
                    onClick={() => skipTo('next')}
                    className="hidden md:flex p-2 rounded-full hover:bg-white/10 transition-colors"
                    style={{ color: currentTheme.colors.text }}
                    disabled={!data?.releases || data.releases.findIndex(r => r.day === currentRelease.day) === data.releases.length - 1}
                  >
                    <SkipForward size={18} />
                  </button>

                  {/* Volume - hidden on mobile */}
                  <div className="hidden md:flex items-center gap-2 ml-2">
                    <button
                      onClick={toggleMute}
                      className="p-2 rounded-full hover:bg-white/10 transition-colors"
                      style={{ color: currentTheme.colors.text }}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-20 h-1 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${primary} ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`,
                      }}
                    />
                  </div>

                  {/* Close button */}
                  <button
                    onClick={stop}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors ml-1"
                    style={{ color: `${currentTheme.colors.text}60` }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
