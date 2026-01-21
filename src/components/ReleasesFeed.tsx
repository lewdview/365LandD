import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { useAudioStore } from '../store/useAudioStore';
import { Play, Pause, ExternalLink, Clock, Music, ChevronLeft, ChevronRight, FileText, ChevronDown, ChevronUp, Sparkles, Volume2 } from 'lucide-react';
import { KaraokeLyrics } from './KaraokeLyrics';
import { CoverImage } from './GenerativeCover';
import { getCoverUrl } from '../services/releaseStorage';
import type { Release } from '../types';

const INITIAL_ITEMS = 12;
const ITEMS_PER_PAGE = 30;

export function ReleasesFeed() {
  const { data, currentDay, selectedRelease, setSelectedRelease } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [isPaginated, setIsPaginated] = useState(false);
  const allReleases = (data?.releases || []).filter(r => r.day <= (currentDay || 1));
  
  // Calculate pagination
  const totalPages = Math.ceil(allReleases.length / ITEMS_PER_PAGE);
  
  // Get releases for current view
  const releases = useMemo(() => {
    if (!isPaginated) {
      // Initial view: show first 12 with animations
      return allReleases.slice(0, INITIAL_ITEMS);
    }
    // Paginated view: show current page with 30 per page
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allReleases.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allReleases, isPaginated, currentPage]);
  
  const hasMore = allReleases.length > INITIAL_ITEMS;

  const handleViewAll = () => {
    setIsPaginated(true);
    setCurrentPage(1);
  };

  const handleShowLess = () => {
    setIsPaginated(false);
    setCurrentPage(1);
  };

  return (
    <section id="releases" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-mono tracking-[0.3em] uppercase mb-4 block text-neon-yellow">
            The Collection
          </span>
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="gradient-text">LATEST DROPS</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-neon-red to-neon-yellow mt-4 mx-auto" />
          <p className="text-light-cream/50 font-mono text-sm mt-4">
            {isPaginated 
              ? `PAGE ${currentPage} OF ${totalPages} • ${allReleases.length} TRACKS`
              : `${allReleases.length} / 365 RELEASED`
            }
          </p>
        </motion.div>

        {/* Releases grid - no AnimatePresence in paginated mode for performance */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isPaginated ? (
            // Paginated view - minimal animations
            releases.map((release) => (
              <ReleaseCardSimple
                key={release.id}
                release={release}
                isSelected={selectedRelease?.id === release.id}
                onSelect={() => setSelectedRelease(selectedRelease?.id === release.id ? null : release)}
              />
            ))
          ) : (
            // Initial view with full animations
            <AnimatePresence>
              {releases.map((release, index) => (
                <ReleaseCard
                  key={release.id}
                  release={release}
                  index={index}
                  isSelected={selectedRelease?.id === release.id}
                  onSelect={() => setSelectedRelease(selectedRelease?.id === release.id ? null : release)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Empty state */}
        {allReleases.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-bold text-light-cream mb-2">Loading Tracks...</h3>
            <p className="text-light-cream/50">Fetching your music library</p>
          </motion.div>
        )}

        {/* Pagination controls */}
        {isPaginated && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-3 border-2 border-neon-yellow-matte text-neon-yellow disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neon-yellow-matte hover:text-void-black transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 font-mono text-sm transition-all ${
                      currentPage === pageNum
                        ? 'bg-neon-yellow text-void-black font-bold'
                        : 'border border-neon-yellow/30 text-neon-yellow hover:border-neon-yellow'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-3 border-2 border-neon-yellow-matte text-neon-yellow disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neon-yellow-matte hover:text-void-black transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* View all / Show less toggle */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={isPaginated ? handleShowLess : handleViewAll}
              className="px-8 py-4 bg-transparent text-neon-yellow font-bold uppercase tracking-wider border-2 border-neon-yellow-matte transition-all hover:bg-neon-yellow-matte hover:text-void-black"
            >
              {isPaginated ? `Show Less` : `View All ${allReleases.length} Releases`}
            </button>
          </div>
        )}
      </div>

      {/* Selected release modal/expanded view */}
      <AnimatePresence>
        {selectedRelease && (
          <ReleaseModal release={selectedRelease} onClose={() => setSelectedRelease(null)} />
        )}
      </AnimatePresence>

      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-void-black to-transparent pointer-events-none" />
    </section>
  );
}

// Custom hook or constant for the "Bold Border" text style
const BOLD_TEXT_STYLE = {
  textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000'
};

// Full animated card for initial view
function ReleaseCard({
  release,
  index,
  isSelected,
  onSelect,
}: {
  release: Release;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isLight = release.mood === 'light';

  return (
    <motion.article
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      onClick={onSelect}
      className={`relative group cursor-pointer overflow-hidden rounded-xl transition-all duration-500 h-[500px] ${
        isSelected ? 'ring-2 ring-neon-yellow' : ''
      }`}
      style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* FULL BACKGROUND COVER */}
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
        />
        {/* Dark gradient overlay for readability at bottom, but keeping image visible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
        
        {/* Play overlay - centered */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className={`w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md ${isLight ? 'bg-neon-yellow/80' : 'bg-neon-red/80'}`}>
              <Play className="w-10 h-10 text-void-black ml-1" />
           </div>
        </div>
      </div>

      {/* Mood indicator bar - Top */}
      <div
        className={`absolute top-0 left-0 w-full h-1 z-20 ${
          isLight
            ? 'bg-gradient-to-r from-neon-yellow to-neon-orange'
            : 'bg-gradient-to-r from-neon-red to-neon-red-dark'
        }`}
      />

      {/* Day badge - Top Right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {release.storedAudioUrl && (
          <span className={`p-1.5 shadow-lg ${isLight ? 'bg-neon-yellow text-void-black' : 'bg-neon-red text-light-cream'}`}>
            <Volume2 className="w-4 h-4" />
          </span>
        )}
        <span
          className={`px-3 py-1 text-sm font-mono font-bold shadow-lg ${
            isLight ? 'bg-neon-yellow text-void-black' : 'bg-neon-red text-light-cream'
          }`}
        >
          DAY {String(release.day).padStart(3, '0')}
        </span>
      </div>

      {/* Content - Bottom Overlay */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end h-full pointer-events-none">
        <div className="transform transition-transform duration-500 group-hover:translate-y-[-10px]">
          <h3 
            className="text-3xl font-black text-white mb-2 uppercase leading-tight tracking-tight"
            style={BOLD_TEXT_STYLE}
          >
            {release.title}
          </h3>
          
          <div className="flex items-center gap-4 text-xs font-mono text-white mb-3" style={{ textShadow: '1px 1px 2px black' }}>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-neon-yellow" />
              {release.durationFormatted}
            </span>
            <span className="flex items-center gap-1">
              <Music className="w-3 h-3 text-neon-yellow" />
              {release.tempo} BPM
            </span>
            <span className="text-neon-yellow">{release.key}</span>
          </div>

          <p className="text-white/90 text-sm mb-4 line-clamp-2 font-medium" style={{ textShadow: '1px 1px 2px black' }}>
            {release.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {release.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`px-2 py-1 text-xs font-bold backdrop-blur-sm ${
                  isLight
                    ? 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/50'
                    : 'bg-neon-red/20 text-neon-red border border-neon-red/50'
                }`}
                style={{ textShadow: '1px 1px 0 #000' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hover border effect */}
      <motion.div
        className={`absolute inset-0 border-2 z-30 rounded-xl ${
          isLight ? 'border-neon-yellow' : 'border-neon-red'
        } opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
      />
    </motion.article>
  );
}

// Simplified card for paginated view - no heavy animations
function ReleaseCardSimple({
  release,
  isSelected,
  onSelect,
}: {
  release: Release;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const isLight = release.mood === 'light';

  return (
    <article
      onClick={onSelect}
      className={`relative group cursor-pointer overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-2 h-[500px] ${
        isSelected ? 'ring-2 ring-neon-yellow' : ''
      }`}
      style={{
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      {/* FULL BACKGROUND COVER */}
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
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80" />
      </div>

      {/* Mood indicator bar */}
      <div
        className={`absolute top-0 left-0 w-full h-1 z-20 ${
          isLight
            ? 'bg-gradient-to-r from-neon-yellow to-neon-orange'
            : 'bg-gradient-to-r from-neon-red to-neon-red-dark'
        }`}
      />

      {/* Day badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {release.storedAudioUrl && (
          <span className={`p-1.5 shadow-lg ${isLight ? 'bg-neon-yellow text-void-black' : 'bg-neon-red text-light-cream'}`}>
            <Volume2 className="w-4 h-4" />
          </span>
        )}
        <span
          className={`px-3 py-1 text-sm font-mono font-bold shadow-lg ${
            isLight ? 'bg-neon-yellow text-void-black' : 'bg-neon-red text-light-cream'
          }`}
        >
          DAY {String(release.day).padStart(3, '0')}
        </span>
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end h-full pointer-events-none">
        <div>
          <h3 
            className="text-3xl font-black text-white mb-2 uppercase leading-tight tracking-tight group-hover:text-neon-yellow transition-colors"
            style={BOLD_TEXT_STYLE}
          >
            {release.title}
          </h3>
          
          <div className="flex items-center gap-4 text-xs font-mono text-white mb-3" style={{ textShadow: '1px 1px 2px black' }}>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-neon-yellow" />
              {release.durationFormatted}
            </span>
            <span className="flex items-center gap-1">
              <Music className="w-3 h-3 text-neon-yellow" />
              {release.tempo} BPM
            </span>
            <span className="text-neon-yellow">{release.key}</span>
          </div>

          <p className="text-white/90 text-sm mb-4 line-clamp-2 font-medium" style={{ textShadow: '1px 1px 2px black' }}>
            {release.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {release.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className={`px-2 py-1 text-xs font-bold backdrop-blur-sm ${
                  isLight
                    ? 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/50'
                    : 'bg-neon-red/20 text-neon-red border border-neon-red/50'
                }`}
                style={{ textShadow: '1px 1px 0 #000' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hover border effect */}
      <div
        className={`absolute inset-0 border-2 z-30 rounded-xl ${
          isLight ? 'border-neon-yellow' : 'border-neon-red'
        } opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
      />
    </article>
  );
}

function ReleaseModal({ release, onClose }: { release: Release; onClose: () => void }) {
  const isLight = release.mood === 'light';
  const { currentTheme } = useThemeStore();
  const { primary, accent } = currentTheme.colors;
  const [showLyrics, setShowLyrics] = useState(false);
  
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
  
  const hasLyrics = release.lyrics && release.lyrics.trim().length > 0;
  const hasPoetryData = release.lyricsWords && release.lyricsWords.length > 0;
  // Poetry in Motion enabled by default when data available
  const [showPoetry, setShowPoetry] = useState(hasPoetryData);
  
  // Check if THIS release is the one currently playing
  const isThisPlaying = playingRelease?.day === release.day && playingRelease?.title === release.title;
  const isThisReleaseActive = isThisPlaying && isPlaying;
  const currentTimeForLyrics = isThisPlaying ? currentTime : 0;

  // Play this release via global player
  const handlePlay = useCallback(() => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Seek to word when clicked in poetry view
  const handleWordClick = useCallback((time: number) => {
    // If this release isn't playing, start it first
    if (!isThisPlaying) {
      loadAndPlay(release);
    }
    // Seek to the word time (with small delay if we just started playback)
    setTimeout(() => seek(time), isThisPlaying ? 0 : 100);
  }, [release, isThisPlaying, loadAndPlay, seek]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-void-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-neon-red/30"
            style={{ left: `${5 + i * 6}%` }}
            animate={{
              y: ['100vh', '-10vh'],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 8 + (i % 4),
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.9, y: 50, rotateX: 10 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.9, y: 50, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto"
        style={{ 
          perspective: '1000px',
          background: 'linear-gradient(145deg, rgba(45,48,72,0.85) 0%, rgba(26,28,46,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3)',
          border: '2px solid rgba(255,255,255,0.1)',
          borderRadius: '2px',
        }}
      >
        {/* Corner accents - smaller on mobile */}
        <div className="absolute top-0 left-0 w-6 h-6 md:w-12 md:h-12 border-t-2 md:border-t-4 border-l-2 md:border-l-4 border-neon-yellow z-20" />
        <div className="absolute top-0 right-0 w-6 h-6 md:w-12 md:h-12 border-t-2 md:border-t-4 border-r-2 md:border-r-4 border-neon-yellow z-20" />
        <div className="absolute bottom-0 left-0 w-6 h-6 md:w-12 md:h-12 border-b-2 md:border-b-4 border-l-2 md:border-l-4 border-neon-yellow z-20" />
        <div className="absolute bottom-0 right-0 w-6 h-6 md:w-12 md:h-12 border-b-2 md:border-b-4 border-r-2 md:border-r-4 border-neon-yellow z-20" />

        {/* Scan lines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02] z-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
          }}
        />

        {/* Header */}
        <div
          className={`relative p-6 md:p-8 border-b-2 border-neon-red-matte/50 ${
            isLight
              ? 'bg-gradient-to-r from-neon-yellow/20 via-neon-orange/10 to-transparent'
              : 'bg-gradient-to-r from-neon-red/20 via-neon-red-dark/10 to-transparent'
          }`}
        >
          {/* Animated header glow */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{
              background: [
                `linear-gradient(90deg, ${isLight ? 'rgba(255,214,10,0.1)' : 'rgba(255,45,85,0.1)'} 0%, transparent 50%)`,
                `linear-gradient(90deg, transparent 0%, ${isLight ? 'rgba(255,214,10,0.1)' : 'rgba(255,45,85,0.1)'} 50%, transparent 100%)`,
                `linear-gradient(90deg, ${isLight ? 'rgba(255,214,10,0.1)' : 'rgba(255,45,85,0.1)'} 0%, transparent 50%)`,
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          <div className="relative flex items-start justify-between">
            <div>
              <motion.span
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className={`inline-block px-4 py-1.5 text-sm font-mono font-bold mb-3 ${
                  isLight ? 'bg-neon-yellow text-void-black' : 'bg-neon-red text-light-cream'
                }`}
              >
                DAY {String(release.day).padStart(3, '0')} • {release.mood.toUpperCase()}
              </motion.span>
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl lg:text-5xl font-black text-light-cream uppercase tracking-tight"
              >
                {release.title}
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-light-cream/50 mt-2 font-mono"
              >
                {release.date}
              </motion.p>
            </div>
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClose();
              }}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className={`relative z-50 w-12 h-12 flex items-center justify-center text-3xl font-bold transition-colors cursor-pointer ${
                isLight ? 'text-neon-yellow hover:bg-neon-yellow/20' : 'text-neon-red hover:bg-neon-red/20'
              }`}
              style={{ pointerEvents: 'auto' }}
            >
              ×
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Custom Audio Player */}
          <div className="mb-6">
            <div className={`p-4 md:p-6 rounded-lg ${
              isLight ? 'bg-neon-yellow/10 border border-neon-yellow/30' : 'bg-neon-red/10 border border-neon-red/30'
            }`}>
              {audioError && isThisPlaying ? (
                <div className="text-center py-4 text-light-cream/50 text-sm font-mono">
                  AUDIO UNAVAILABLE FOR THIS TRACK
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Play button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handlePlay}
                    disabled={audioError && isThisPlaying}
                    className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      audioError && isThisPlaying
                        ? 'bg-void-gray/50 cursor-not-allowed'
                        : isLight 
                          ? 'bg-neon-yellow hover:shadow-[0_0_20px_var(--color-neon-yellow)]' 
                          : 'bg-neon-red hover:shadow-[0_0_20px_var(--color-neon-red)]'
                    }`}
                  >
                    {isLoading && isThisPlaying ? (
                      <motion.div
                        className="w-6 h-6 border-3 border-void-black border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : isThisReleaseActive ? (
                      <Pause className="w-6 h-6 text-void-black" />
                    ) : (
                      <Play className="w-6 h-6 text-void-black ml-0.5" />
                    )}
                  </motion.button>

                  {/* Progress section */}
                  <div className="flex-1 min-w-0">
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
                    <div className="flex justify-between mt-1 text-xs font-mono text-light-cream/50">
                      <span>{isThisPlaying ? formatTime(currentTime) : '0:00'}</span>
                      <span>{formatTime((isThisPlaying && duration) || release.duration)}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Poetry in Motion toggle */}
              {hasPoetryData && !(audioError && isThisPlaying) && (
                <button
                  onClick={() => setShowPoetry(!showPoetry)}
                  className={`mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-mono transition-all rounded ${
                    showPoetry
                      ? isLight
                        ? 'bg-neon-yellow text-void-black'
                        : 'bg-neon-red text-light-cream'
                      : 'bg-void-black/50 text-light-cream/70 hover:text-light-cream'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  {showPoetry ? 'HIDE POETRY IN MOTION' : 'POETRY IN MOTION'}
                </button>
              )}
            </div>
          </div>
          
          {/* Poetry in Motion Lyrics Display */}
          {showPoetry && hasPoetryData && (
            <div className="mb-6">
              <KaraokeLyrics
                words={release.lyricsWords!}
                segments={release.lyricsSegments}
                currentTime={currentTimeForLyrics}
                onWordClick={handleWordClick}
                isPlaying={isThisReleaseActive}
              />
            </div>
          )}

          <p className="text-light-cream/70 mb-6">{release.description}</p>

          {/* Genre */}
          {release.genre && release.genre.length > 0 && (
            <div className="mb-4">
              <span className="text-xs font-mono text-light-cream/40">GENRE: </span>
              <span className="text-light-cream/70">{release.genre.join(' / ')}</span>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-void-lighter">
              <span className="block text-2xl font-bold gradient-text">{release.durationFormatted}</span>
              <span className="text-xs font-mono text-light-cream/50">DURATION</span>
            </div>
            <div className="text-center p-4 bg-void-lighter">
              <span className="block text-2xl font-bold gradient-text">{release.tempo}</span>
              <span className="text-xs font-mono text-light-cream/50">BPM</span>
            </div>
            <div className="text-center p-4 bg-void-lighter">
              <span className="block text-2xl font-bold gradient-text">{release.key}</span>
              <span className="text-xs font-mono text-light-cream/50">KEY</span>
            </div>
          </div>

          {/* Energy/Valence indicators */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 bg-void-lighter">
              <div className="flex justify-between text-xs font-mono text-light-cream/50 mb-1">
                <span>ENERGY</span>
                <span>{Math.round(release.energy * 100)}%</span>
              </div>
              <div className="h-2 bg-void-black rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${release.energy * 100}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-neon-red to-neon-orange"
                />
              </div>
            </div>
            <div className="p-3 bg-void-lighter">
              <div className="flex justify-between text-xs font-mono text-light-cream/50 mb-1">
                <span>VALENCE</span>
                <span>{Math.round(release.valence * 100)}%</span>
              </div>
              <div className="h-2 bg-void-black rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${release.valence * 100}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-neon-yellow to-neon-orange"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {release.tags.map((tag) => (
              <span
                key={tag}
                className={`px-3 py-1 text-sm ${
                  isLight
                    ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30'
                    : 'bg-neon-red/10 text-neon-red border border-neon-red/30'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Static Lyrics Section (fallback when no poetry data or poetry hidden) */}
          {hasLyrics && !showPoetry && (
            <div className="mb-6">
              <button
                onClick={() => setShowLyrics(!showLyrics)}
                className={`w-full flex items-center justify-between p-4 transition-all ${
                  isLight
                    ? 'bg-neon-yellow/10 border border-neon-yellow/30 hover:bg-neon-yellow/20'
                    : 'bg-neon-red/10 border border-neon-red/30 hover:bg-neon-red/20'
                }`}
              >
                <span className="flex items-center gap-2 font-mono text-sm">
                  <FileText className="w-4 h-4" />
                  LYRICS {hasPoetryData ? '(TEXT VIEW)' : ''}
                </span>
                {showLyrics ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
              
              <AnimatePresence>
                {showLyrics && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`p-4 border-x border-b max-h-80 overflow-y-auto ${
                        isLight
                          ? 'border-neon-yellow/30 bg-void-black/50'
                          : 'border-neon-red/30 bg-void-black/50'
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans text-light-cream/80 text-sm leading-relaxed">
                        {release.lyrics}
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* External Links - only show if URLs are available */}
          <div className="flex flex-col sm:flex-row gap-4">
            {release.youtubeUrl && (
              <a
                href={release.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-neon-red text-light-cream font-bold uppercase tracking-wider hover:bg-neon-red-dark transition-colors"
              >
                <Play className="w-5 h-5" />
                YouTube
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {release.audiusUrl && (
              <a
                href={release.audiusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-neon-yellow text-void-black font-bold uppercase tracking-wider hover:bg-neon-yellow-dark transition-colors"
              >
                <Music className="w-5 h-5" />
                Audius
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}