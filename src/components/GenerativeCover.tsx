import { useMemo, useState, useEffect } from 'react';
import { useThemeStore } from '../store/useThemeStore';

interface GenerativeCoverProps {
  day: number;
  title: string;
  mood: 'light' | 'dark';
  energy?: number;
  valence?: number;
  tempo?: number;
  className?: string;
}

// Seeded random number generator for consistent results
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate a hash from string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function GenerativeCover({
  day,
  title,
  mood,
  energy = 0.5,
  valence = 0.5,
  tempo = 120,
  className = '',
}: GenerativeCoverProps) {
  const { currentTheme } = useThemeStore();
  const { primary, accent } = currentTheme.colors;

  const coverData = useMemo(() => {
    const seed = hashString(`${day}-${title}`);
    const rand = (offset: number) => seededRandom(seed + offset);

    // Generate unique pattern based on song characteristics
    const patternType = Math.floor(rand(1) * 5); // 0-4 different patterns
    const rotation = rand(2) * 360;
    const scale = 0.5 + rand(3) * 0.5;
    
    // Color variations based on mood
    const baseColor = mood === 'light' ? accent : primary;
    const secondaryColor = mood === 'light' ? primary : accent;
    
    // Generate geometric elements
    const numShapes = 3 + Math.floor(energy * 5);
    const shapes = Array.from({ length: numShapes }, (_, i) => ({
      x: rand(10 + i) * 100,
      y: rand(20 + i) * 100,
      size: 10 + rand(30 + i) * 40,
      rotation: rand(40 + i) * 360,
      opacity: 0.1 + rand(50 + i) * 0.4,
      type: Math.floor(rand(60 + i) * 3), // 0: circle, 1: rect, 2: triangle
    }));

    // Waveform based on tempo
    const wavePoints = Array.from({ length: 20 }, (_, i) => {
      const x = (i / 19) * 100;
      const y = 50 + Math.sin((i / 19) * Math.PI * (tempo / 60)) * (20 + energy * 20) * rand(70 + i);
      return `${x},${y}`;
    }).join(' ');

    // Grid lines based on valence
    const gridLines = Math.floor(3 + valence * 5);

    return {
      patternType,
      rotation,
      scale,
      baseColor,
      secondaryColor,
      shapes,
      wavePoints,
      gridLines,
      seed,
    };
  }, [day, title, mood, energy, valence, tempo, primary, accent]);

  const { patternType, rotation, baseColor, secondaryColor, shapes, wavePoints, gridLines, seed } = coverData;

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={{ background: '#0a0a0f' }}
    >
      <defs>
        {/* Gradient based on mood */}
        <linearGradient id={`grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={baseColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.1" />
        </linearGradient>
        
        {/* Glow filter */}
        <filter id={`glow-${seed}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Noise texture */}
        <filter id={`noise-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
          <feComposite in="SourceGraphic" in2="noise" operator="in" />
        </filter>
      </defs>

      {/* Background gradient */}
      <rect width="100" height="100" fill={`url(#grad-${seed})`} />

      {/* Grid lines */}
      <g opacity="0.1" stroke={baseColor} strokeWidth="0.2">
        {Array.from({ length: gridLines }, (_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={(i + 1) * (100 / (gridLines + 1))}
            x2="100"
            y2={(i + 1) * (100 / (gridLines + 1))}
          />
        ))}
        {Array.from({ length: gridLines }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={(i + 1) * (100 / (gridLines + 1))}
            y1="0"
            x2={(i + 1) * (100 / (gridLines + 1))}
            y2="100"
          />
        ))}
      </g>

      {/* Pattern based on type */}
      {patternType === 0 && (
        // Concentric circles
        <g transform={`rotate(${rotation} 50 50)`}>
          {[1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={10 + i * 12}
              fill="none"
              stroke={i % 2 === 0 ? baseColor : secondaryColor}
              strokeWidth="0.5"
              opacity={0.3 - i * 0.05}
            />
          ))}
        </g>
      )}

      {patternType === 1 && (
        // Diagonal stripes
        <g opacity="0.2">
          {Array.from({ length: 10 }, (_, i) => (
            <line
              key={i}
              x1={i * 15 - 20}
              y1="0"
              x2={i * 15 + 20}
              y2="100"
              stroke={i % 2 === 0 ? baseColor : secondaryColor}
              strokeWidth="1"
            />
          ))}
        </g>
      )}

      {patternType === 2 && (
        // Radial burst
        <g transform="translate(50 50)" opacity="0.3">
          {Array.from({ length: 12 }, (_, i) => (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={Math.cos((i * 30 * Math.PI) / 180) * 50}
              y2={Math.sin((i * 30 * Math.PI) / 180) * 50}
              stroke={baseColor}
              strokeWidth="0.5"
            />
          ))}
        </g>
      )}

      {patternType === 3 && (
        // Hexagon grid
        <g opacity="0.15">
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <polygon
                key={`${row}-${col}`}
                points="10,0 20,5 20,15 10,20 0,15 0,5"
                transform={`translate(${col * 25 + (row % 2) * 12.5 + 10} ${row * 20 + 20})`}
                fill="none"
                stroke={baseColor}
                strokeWidth="0.5"
              />
            ))
          )}
        </g>
      )}

      {patternType === 4 && (
        // Wave pattern
        <g opacity="0.2">
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M 0 ${50 + i * 10} Q 25 ${40 + i * 10} 50 ${50 + i * 10} T 100 ${50 + i * 10}`}
              fill="none"
              stroke={baseColor}
              strokeWidth="0.5"
            />
          ))}
        </g>
      )}

      {/* Geometric shapes */}
      <g filter={`url(#glow-${seed})`}>
        {shapes.map((shape, i) => {
          const color = i % 2 === 0 ? baseColor : secondaryColor;
          switch (shape.type) {
            case 0:
              return (
                <circle
                  key={i}
                  cx={shape.x}
                  cy={shape.y}
                  r={shape.size / 2}
                  fill={color}
                  opacity={shape.opacity}
                />
              );
            case 1:
              return (
                <rect
                  key={i}
                  x={shape.x - shape.size / 2}
                  y={shape.y - shape.size / 2}
                  width={shape.size}
                  height={shape.size}
                  fill={color}
                  opacity={shape.opacity}
                  transform={`rotate(${shape.rotation} ${shape.x} ${shape.y})`}
                />
              );
            case 2:
              const s = shape.size / 2;
              return (
                <polygon
                  key={i}
                  points={`${shape.x},${shape.y - s} ${shape.x - s},${shape.y + s} ${shape.x + s},${shape.y + s}`}
                  fill={color}
                  opacity={shape.opacity}
                  transform={`rotate(${shape.rotation} ${shape.x} ${shape.y})`}
                />
              );
            default:
              return null;
          }
        })}
      </g>

      {/* Waveform visualization */}
      <polyline
        points={wavePoints}
        fill="none"
        stroke={baseColor}
        strokeWidth="1"
        opacity="0.4"
        filter={`url(#glow-${seed})`}
      />

      {/* Day number - large, subtle */}
      <text
        x="50"
        y="55"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="40"
        fontWeight="900"
        fill={baseColor}
        opacity="0.08"
        fontFamily="system-ui, sans-serif"
      >
        {String(day).padStart(2, '0')}
      </text>

      {/* Border frame */}
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        fill="none"
        stroke={baseColor}
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Corner accents */}
      <g stroke={secondaryColor} strokeWidth="1" opacity="0.5">
        <line x1="2" y1="2" x2="12" y2="2" />
        <line x1="2" y1="2" x2="2" y2="12" />
        <line x1="88" y1="2" x2="98" y2="2" />
        <line x1="98" y1="2" x2="98" y2="12" />
        <line x1="2" y1="88" x2="2" y2="98" />
        <line x1="2" y1="98" x2="12" y2="98" />
        <line x1="88" y1="98" x2="98" y2="98" />
        <line x1="98" y1="88" x2="98" y2="98" />
      </g>

      {/* Scanlines overlay */}
      <g opacity="0.03">
        {Array.from({ length: 50 }, (_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 2}
            x2="100"
            y2={i * 2}
            stroke="white"
            strokeWidth="1"
          />
        ))}
      </g>
    </svg>
  );
}

// Wrapper component that tries to load actual cover, falls back to generative
interface CoverImageProps {
  day: number;
  title: string;
  mood: 'light' | 'dark';
  energy?: number;
  valence?: number;
  tempo?: number;
  coverUrl?: string;
  className?: string;
  showColorVeil?: boolean;
}

export function CoverImage({
  day,
  title,
  mood,
  energy,
  valence,
  tempo,
  coverUrl,
  className = '',
  showColorVeil = false,
}: CoverImageProps) {
  const { currentTheme } = useThemeStore();
  const veilColor = mood === 'light' ? currentTheme.colors.accent : currentTheme.colors.primary;
  
  // Initialize state with the prop URL immediately
  const [currentSrc, setCurrentSrc] = useState<string | null>(coverUrl || null);
  const [failed, setFailed] = useState(false);

  // Sync state if prop changes later
  useEffect(() => {
    setCurrentSrc(coverUrl || null);
    setFailed(false);
  }, [coverUrl]);

  // Handle image load error - try next extension
  const handleError = () => {
    if (!currentSrc) return;
    
    // Extensions to try in order
    // CHANGED: Order is now png -> jpg -> jpeg -> gif
    const extensions = ['png', 'jpg', 'jpeg', 'gif'];
    
    // Attempt to parse current extension from URL
    const match = currentSrc.match(/\.(png|jpg|jpeg|gif)(?=\?|$)/i);
    
    if (match && match.index !== undefined) {
      const currentExt = match[1].toLowerCase();
      const currentIndex = extensions.indexOf(currentExt);
      
      // If we found the extension and it's not the last one to try
      if (currentIndex !== -1 && currentIndex < extensions.length - 1) {
        const nextExt = extensions[currentIndex + 1];
        
        // Replace the extension in the URL
        const prefix = currentSrc.substring(0, match.index);
        const suffix = currentSrc.substring(match.index + match[0].length);
        const nextSrc = `${prefix}.${nextExt}${suffix}`;
        
        // Update source to retry
        setCurrentSrc(nextSrc);
        return;
      }
    }
    
    // If we're here, we've run out of options
    setFailed(true);
  };

  // If no URL provided, or all attempts failed, show GenerativeCover
  if (!coverUrl || failed || !currentSrc) {
    return (
      <div className={`relative ${className}`}>
        <GenerativeCover
          day={day}
          title={title}
          mood={mood}
          energy={energy}
          valence={valence}
          tempo={tempo}
          className="w-full h-full"
        />
        {showColorVeil && (
          <div 
            className="absolute inset-0 z-10 pointer-events-none"
            style={{ 
              background: `linear-gradient(135deg, ${veilColor}25 0%, ${veilColor}10 50%, ${veilColor}20 100%)`,
              mixBlendMode: 'overlay',
            }}
          />
        )}
      </div>
    );
  }

  // Try to load actual cover with generative fallback underneath
  return (
    <div className={`relative ${className}`}>
      <GenerativeCover
        day={day}
        title={title}
        mood={mood}
        energy={energy}
        valence={valence}
        tempo={tempo}
        className="absolute inset-0 w-full h-full"
      />
      <img
        src={currentSrc}
        alt={`${title} cover`}
        className="relative z-10 w-full h-full object-cover"
        onError={handleError}
        loading="eager" // Force immediate loading
      />
      {showColorVeil && (
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ 
            background: `linear-gradient(135deg, ${veilColor}25 0%, ${veilColor}10 50%, ${veilColor}20 100%)`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
    </div>
  );
}