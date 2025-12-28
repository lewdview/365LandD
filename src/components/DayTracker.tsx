import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, ChevronDown, Play, Clock, Music, Calendar } from 'lucide-react';
import { CoverImage } from './GenerativeCover';
import { getCoverUrl } from '../services/releaseStorage';

// Custom SVG Icons
function WaveformIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <rect x="2" y="12" width="3" height="8" rx="1" fill="currentColor" opacity="0.6">
        <animate attributeName="height" values="8;16;8" dur="0.8s" repeatCount="indefinite" />
        <animate attributeName="y" values="12;8;12" dur="0.8s" repeatCount="indefinite" />
      </rect>
      <rect x="7" y="8" width="3" height="16" rx="1" fill="currentColor" opacity="0.8">
        <animate attributeName="height" values="16;8;16" dur="0.6s" repeatCount="indefinite" />
        <animate attributeName="y" values="8;12;8" dur="0.6s" repeatCount="indefinite" />
      </rect>
      <rect x="12" y="4" width="3" height="24" rx="1" fill="currentColor">
        <animate attributeName="height" values="24;12;24" dur="0.7s" repeatCount="indefinite" />
        <animate attributeName="y" values="4;10;4" dur="0.7s" repeatCount="indefinite" />
      </rect>
      <rect x="17" y="6" width="3" height="20" rx="1" fill="currentColor" opacity="0.9">
        <animate attributeName="height" values="20;10;20" dur="0.5s" repeatCount="indefinite" />
        <animate attributeName="y" values="6;11;6" dur="0.5s" repeatCount="indefinite" />
      </rect>
      <rect x="22" y="10" width="3" height="12" rx="1" fill="currentColor" opacity="0.7">
        <animate attributeName="height" values="12;18;12" dur="0.9s" repeatCount="indefinite" />
        <animate attributeName="y" values="10;7;10" dur="0.9s" repeatCount="indefinite" />
      </rect>
      <rect x="27" y="13" width="3" height="6" rx="1" fill="currentColor" opacity="0.5">
        <animate attributeName="height" values="6;14;6" dur="0.7s" repeatCount="indefinite" />
        <animate attributeName="y" values="13;9;13" dur="0.7s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

function SunburstIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="6" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="16" y1="2" x2="16" y2="6">
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="16" y1="26" x2="16" y2="30">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </line>
        <line x1="2" y1="16" x2="6" y2="16">
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.25s" />
        </line>
        <line x1="26" y1="16" x2="30" y2="16">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.25s" />
        </line>
        <line x1="6.1" y1="6.1" x2="8.9" y2="8.9">
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </line>
        <line x1="23.1" y1="23.1" x2="25.9" y2="25.9">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.5s" />
        </line>
        <line x1="6.1" y1="25.9" x2="8.9" y2="23.1">
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" begin="0.75s" />
        </line>
        <line x1="23.1" y1="8.9" x2="25.9" y2="6.1">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" begin="0.75s" />
        </line>
      </g>
    </svg>
  );
}

function MoonPhaseIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <mask id="moonMask">
          <circle cx="16" cy="16" r="12" fill="white" />
          <circle cx="22" cy="14" r="10" fill="black">
            <animate attributeName="cx" values="22;20;22" dur="4s" repeatCount="indefinite" />
          </circle>
        </mask>
      </defs>
      <circle cx="16" cy="16" r="12" fill="currentColor" mask="url(#moonMask)" />
      <circle cx="10" cy="12" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="14" cy="18" r="1" fill="currentColor" opacity="0.2" />
      <circle cx="18" cy="20" r="0.8" fill="currentColor" opacity="0.25" />
    </svg>
  );
}

function HourglassIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className}>
      <path 
        d="M8 4h16v6c0 2-2 4-4 6l-4 3 4 3c2 2 4 4 4 6v6H8v-6c0-2 2-4 4-6l4-3-4-3c-2-2-4-4-4-6V4z" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none"
      />
      <line x1="6" y1="4" x2="26" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="28" x2="26" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Sand particles */}
      <g fill="currentColor">
        <circle cx="16" cy="14" r="1">
          <animate attributeName="cy" values="14;22;22" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;1;0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="14" cy="12" r="0.8">
          <animate attributeName="cy" values="12;21;21" dur="2s" repeatCount="indefinite" begin="0.3s" />
          <animate attributeName="opacity" values="1;1;0" dur="2s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <circle cx="18" cy="13" r="0.8">
          <animate attributeName="cy" values="13;23;23" dur="2s" repeatCount="indefinite" begin="0.6s" />
          <animate attributeName="opacity" values="1;1;0" dur="2s" repeatCount="indefinite" begin="0.6s" />
        </circle>
      </g>
      {/* Bottom sand pile */}
      <path d="M12 24 Q16 20, 20 24 L20 26 L12 26 Z" fill="currentColor" opacity="0.6">
        <animate attributeName="d" values="M12 26 Q16 26, 20 26 L20 26 L12 26 Z;M12 24 Q16 20, 20 24 L20 26 L12 26 Z;M12 24 Q16 20, 20 24 L20 26 L12 26 Z" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

export function DayTracker() {
  const { data, currentDay } = useStore();
  const { currentTheme } = useThemeStore();
  const navigate = useNavigate();
  const progressRef = useRef<SVGCircleElement>(null);
  const [expandedInfo, setExpandedInfo] = useState(false);
  
  const { primary, accent, background } = currentTheme.colors;
  const totalDays = data?.project.totalDays || 365;
  const progress = (currentDay / totalDays) * 100;
  const circumference = 2 * Math.PI * 45; // Smaller ring
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        strokeDashoffset,
        duration: 2,
        ease: 'power3.out',
      });
    }
  }, [strokeDashoffset]);

  // Get today's release and navigation
  const todaysRelease = data?.releases.find(r => r.day === currentDay);
  const prevRelease = data?.releases.filter(r => r.day < currentDay).sort((a, b) => b.day - a.day)[0];
  const nextDay = currentDay + 1;
  const hasNextRelease = data?.releases.some(r => r.day === nextDay);
  
  // Calculate current month theme
  const currentMonthTheme = data?.monthThemes?.find(
    m => currentDay >= m.dayStart && currentDay <= m.dayEnd
  );

  // Format date for display
  const formatDisplayDate = (dayNum: number) => {
    const startDate = new Date(data?.project.startDate || '2026-01-01');
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + dayNum - 1);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isLight = todaysRelease?.mood === 'light';

  return (
    <section id="tracker" className="py-16 md:py-24 px-6 md:px-12 lg:px-16 relative overflow-hidden">
      <div className="w-full">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-8 md:mb-12 text-center"
        >
          <span className="text-sm font-mono tracking-[0.3em] uppercase mb-4 block" style={{ color: accent }}>
            The Journey
          </span>
          <h2 className="text-3xl md:text-5xl font-bold">
            <span className="gradient-text">TODAY'S RELEASE</span>
          </h2>
          <div className="w-24 h-1 mt-4 mx-auto" style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }} />
        </motion.div>

        {/* Main calendar card layout */}
        <div className="grid lg:grid-cols-12 gap-6">
          
          {/* Previous Day Shortcut - Left side */}
          {prevRelease && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 order-2 lg:order-1"
            >
              <button
                onClick={() => navigate(`/day/${prevRelease.day}`)}
                className="w-full h-full min-h-[120px] p-4 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 group"
                style={{
                  background: `linear-gradient(135deg, ${prevRelease.mood === 'light' ? accent : primary}15 0%, transparent 100%)`,
                  border: `1px solid ${prevRelease.mood === 'light' ? accent : primary}30`,
                }}
              >
                <ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" style={{ color: prevRelease.mood === 'light' ? accent : primary }} />
                <span className="text-xs font-mono text-light-cream/50">YESTERDAY</span>
                <span className="text-sm font-bold text-light-cream text-center line-clamp-2">{prevRelease.title}</span>
                <span className="text-xs font-mono" style={{ color: prevRelease.mood === 'light' ? accent : primary }}>
                  DAY {prevRelease.day}
                </span>
              </button>
            </motion.div>
          )}

          {/* Main Today Card - Center */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`${prevRelease ? 'lg:col-span-8' : 'lg:col-span-10'} order-1 lg:order-2`}
          >
            <div
              className="relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(45,48,72,0.7) 0%, rgba(26,28,46,0.9) 100%)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${isLight ? accent : primary}40`,
                boxShadow: `0 20px 60px rgba(0,0,0,0.4), 0 0 40px ${isLight ? accent : primary}10`,
              }}
            >
              {/* Top accent bar */}
              <div 
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${isLight ? accent : primary}, ${isLight ? primary : accent})` }}
              />

              {/* Header with date and progress */}
              <div className="p-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5">
                <div className="flex items-center gap-4">
                  {/* Mini progress ring */}
                  <div className="relative">
                    <svg width="60" height="60" className="transform -rotate-90">
                      <circle cx="30" cy="30" r="25" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                      <circle
                        ref={progressRef}
                        cx="30" cy="30" r="25"
                        fill="none"
                        stroke={isLight ? accent : primary}
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: isLight ? accent : primary }}>
                      {currentDay}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-light-cream/40" />
                      <span className="font-mono text-light-cream/60 text-sm">
                        {formatDisplayDate(currentDay)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span 
                        className="px-2 py-0.5 text-xs font-mono font-bold"
                        style={{ 
                          background: `${isLight ? accent : primary}30`,
                          color: isLight ? accent : primary,
                        }}
                      >
                        DAY {String(currentDay).padStart(3, '0')}
                      </span>
                      {currentMonthTheme && (
                        <span className="text-xs text-light-cream/40">
                          {currentMonthTheme.emoji} {currentMonthTheme.theme}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress stats */}
                <div className="flex items-center gap-6 text-sm font-mono">
                  <div className="text-center">
                    <span className="block text-2xl font-bold" style={{ color: accent }}>{data?.stats.lightTracks || 0}</span>
                    <span className="text-light-cream/40 text-xs">LIGHT</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold" style={{ color: primary }}>{data?.stats.darkTracks || 0}</span>
                    <span className="text-light-cream/40 text-xs">DARK</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-2xl font-bold text-light-cream/70">{totalDays - currentDay}</span>
                    <span className="text-light-cream/40 text-xs">LEFT</span>
                  </div>
                </div>
              </div>

              {/* Song content */}
              {todaysRelease ? (
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Cover art with generative fallback */}
                    <div 
                      className="relative w-full md:w-48 h-48 flex-shrink-0 overflow-hidden cursor-pointer group"
                      onClick={() => navigate(`/day/${currentDay}`)}
                    >
                      <CoverImage
                        day={todaysRelease.day}
                        title={todaysRelease.title}
                        mood={todaysRelease.mood}
                        energy={todaysRelease.energy}
                        valence={todaysRelease.valence}
                        tempo={todaysRelease.tempo}
                        coverUrl={getCoverUrl(todaysRelease.day, todaysRelease.title)}
                        className="w-full h-full object-cover"
                        showColorVeil
                      />
                      
                      {/* Play overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: isLight ? accent : primary }}
                        >
                          <Play className="w-8 h-8 ml-1" style={{ color: background }} />
                        </div>
                      </div>

                      {/* Mood badge */}
                      <span 
                        className="absolute top-3 right-3 px-2 py-1 text-xs font-mono font-bold"
                        style={{ 
                          backgroundColor: isLight ? accent : primary,
                          color: background,
                        }}
                      >
                        {todaysRelease.mood.toUpperCase()}
                      </span>
                    </div>

                    {/* Song info */}
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-2xl md:text-3xl font-black mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => navigate(`/day/${currentDay}`)}
                        style={{ color: isLight ? accent : primary }}
                      >
                        {todaysRelease.title}
                      </h3>
                      
                      <p className="text-light-cream/60 mb-4 line-clamp-2">
                        {todaysRelease.description}
                      </p>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-light-cream/50 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {todaysRelease.durationFormatted}
                        </span>
                        <span className="flex items-center gap-1">
                          <Music className="w-4 h-4" />
                          {todaysRelease.tempo} BPM
                        </span>
                        <span>{todaysRelease.key}</span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {todaysRelease.tags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs"
                            style={{
                              background: `${isLight ? accent : primary}15`,
                              color: isLight ? accent : primary,
                              border: `1px solid ${isLight ? accent : primary}30`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Expandable more info */}
                      <button
                        onClick={() => setExpandedInfo(!expandedInfo)}
                        className="flex items-center gap-2 text-sm font-mono transition-colors"
                        style={{ color: isLight ? accent : primary }}
                      >
                        <span>{expandedInfo ? 'LESS INFO' : 'MORE INFO'}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${expandedInfo ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {expandedInfo && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <span className="text-xs font-mono text-light-cream/40 block">ENERGY</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1.5 bg-void-black rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full"
                                      style={{ 
                                        width: `${todaysRelease.energy * 100}%`,
                                        backgroundColor: primary,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-mono" style={{ color: primary }}>
                                    {Math.round(todaysRelease.energy * 100)}%
                                  </span>
                                </div>
                              </div>
                              <div className="p-3" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                <span className="text-xs font-mono text-light-cream/40 block">VALENCE</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1.5 bg-void-black rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full"
                                      style={{ 
                                        width: `${todaysRelease.valence * 100}%`,
                                        backgroundColor: accent,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs font-mono" style={{ color: accent }}>
                                    {Math.round(todaysRelease.valence * 100)}%
                                  </span>
                                </div>
                              </div>
                              {todaysRelease.genre && todaysRelease.genre.length > 0 && (
                                <div className="p-3 col-span-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                                  <span className="text-xs font-mono text-light-cream/40 block">GENRE</span>
                                  <span className="text-sm text-light-cream/80 mt-1 block">
                                    {todaysRelease.genre.join(' / ')}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* View full page button */}
                            <button
                              onClick={() => navigate(`/day/${currentDay}`)}
                              className="mt-4 w-full py-3 font-mono text-sm font-bold transition-all hover:opacity-90"
                              style={{ 
                                background: `linear-gradient(90deg, ${isLight ? accent : primary}, ${isLight ? primary : accent})`,
                                color: background,
                              }}
                            >
                              VIEW FULL PAGE →
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ) : (
                /* No release yet */
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">🎵</div>
                  <h3 className="text-2xl font-bold text-light-cream mb-2">Day {currentDay}</h3>
                  <p className="text-light-cream/50">No release yet. Check back soon!</p>
                </div>
              )}

              {/* Coming Tomorrow Banner - Bottom right */}
              <div 
                className="absolute bottom-0 right-0 p-4 flex items-center gap-3"
                style={{
                  background: `linear-gradient(135deg, transparent 0%, ${hasNextRelease ? accent : primary}20 100%)`,
                }}
              >
                <div className="text-right">
                  <span className="text-xs font-mono text-light-cream/40 block">COMING TOMORROW</span>
                  <span className="text-sm font-bold" style={{ color: hasNextRelease ? accent : primary }}>
                    DAY {nextDay}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: hasNextRelease ? accent : primary }} />
              </div>
            </div>
          </motion.div>

          {/* Empty right column for grid balance when no prev */}
          {!prevRelease && <div className="hidden lg:block lg:col-span-2 order-3" />}
        </div>

        {/* Stats row below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard
            label="Releases"
            value={data?.stats.totalReleases || 0}
            icon={<WaveformIcon className="w-8 h-8 text-neon-orange" />}
            delay={0}
          />
          <StatCard
            label="Light Tracks"
            value={data?.stats.lightTracks || 0}
            icon={<SunburstIcon className="w-8 h-8 text-neon-yellow" />}
            delay={0.1}
            color="yellow"
          />
          <StatCard
            label="Dark Tracks"
            value={data?.stats.darkTracks || 0}
            icon={<MoonPhaseIcon className="w-8 h-8 text-neon-red" />}
            delay={0.2}
            color="red"
          />
          <StatCard
            label="Days Left"
            value={totalDays - currentDay}
            icon={<HourglassIcon className="w-8 h-8 text-neon-yellow-matte" />}
            delay={0.3}
          />
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-1/2 -right-32 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: `${primary}10` }} />
      <div className="absolute bottom-0 -left-32 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: `${accent}10` }} />
    </section>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  delay, 
  color = 'default' 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  delay: number;
  color?: 'default' | 'red' | 'yellow';
}) {
  const borderClass = color === 'red' 
    ? 'border-neon-red-matte' 
    : color === 'yellow' 
      ? 'border-neon-yellow-matte' 
      : 'border-void-lighter';
  
  const glowClass = color === 'red'
    ? 'group-hover:shadow-[0_0_30px_var(--color-neon-red)]'
    : color === 'yellow'
      ? 'group-hover:shadow-[0_0_30px_var(--color-neon-yellow)]'
      : 'group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`group relative p-6 border-2 ${borderClass} ${glowClass} transition-all duration-300 overflow-hidden`}
      style={{
        background: 'linear-gradient(135deg, rgba(45,48,72,0.4) 0%, rgba(26,28,46,0.6) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Animated corner accent */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-current opacity-30 group-hover:opacity-60 transition-opacity" 
        style={{ borderColor: color === 'red' ? 'var(--color-neon-red)' : color === 'yellow' ? 'var(--color-neon-yellow)' : 'var(--color-void-lighter)' }}
      />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-current opacity-30 group-hover:opacity-60 transition-opacity"
        style={{ borderColor: color === 'red' ? 'var(--color-neon-red)' : color === 'yellow' ? 'var(--color-neon-yellow)' : 'var(--color-void-lighter)' }}
      />
      
      {/* Icon with glow effect on hover */}
      <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      
      {/* Value with animated counter effect */}
      <motion.span
        key={value}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-black gradient-text block mb-1"
      >
        {value}
      </motion.span>
      
      {/* Label */}
      <span className="text-light-cream/60 text-sm font-mono tracking-widest uppercase">{label}</span>
      
      {/* Subtle scan line effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"
        initial={{ y: '-100%' }}
        animate={{ y: '100%' }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'linear' }}
        style={{ opacity: 0.3 }}
      />
    </motion.div>
  );
}
