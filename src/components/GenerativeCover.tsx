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

  // RECTANGLE UPDATE: Using 16:9 aspect ratio (160x90 units)
  const width = 160;
  const height = 90;

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
      x: rand(10 + i) * width,
      y: rand(20 + i) * height,
      size: 10 + rand(30 + i) * 60, // Larger shapes for wider canvas
      rotation: rand(40 + i) * 360,
      opacity: 0.1 + rand(50 + i) * 0.4,
      type: Math.floor(rand(60 + i) * 3), // 0: circle, 1: rect, 2: triangle
    }));

    // Waveform based on tempo (stretched for width)
    const wavePoints = Array.from({ length: 30 }, (_, i) => {
      const x = (i / 29) * width;
      const y = (height / 2) + Math.sin((i / 29) * Math.PI * (tempo / 40)) * (20 + energy * 20) * rand(70 + i);
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
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ background: '#0a0a0f' }}
      preserveAspectRatio="xMidYMid slice"
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
      <rect width={width} height={height} fill={`url(#grad-${seed})`} />

      {/* Grid lines */}
      <g opacity="0.1" stroke={baseColor} strokeWidth="0.2">
        {Array.from({ length: gridLines }, (_, i) => (
          <line
            key={`h-${i}`}
            x1="0"
            y1={(i + 1) * (height / (gridLines + 1))}
            x2={width}
            y2={(i + 1) * (height / (gridLines + 1))}
          />
        ))}
        {Array.from({ length: gridLines }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={(i + 1) * (width / (gridLines + 1))}
            y1="0"
            x2={(i + 1) * (width / (gridLines + 1))}
            y2={height}
          />
        ))}
      </g>

      {/* Pattern based on type */}
      {patternType === 0 && (
        // Concentric circles (centered)
        <g transform={`rotate(${rotation} ${width/2} ${height/2})`}>
          {[1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={width/2}
              cy={height/2}
              r={10 + i * 15}
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
          {Array.from({ length: 15 }, (_, i) => (
            <line
              key={i}
              x1={i * 20 - 40}
              y1="0"
              x2={i * 20 + 20}
              y2={height}
              stroke={i % 2 === 0 ? baseColor : secondaryColor}
              strokeWidth="1"
            />
          ))}
        </g>
      )}

      {patternType === 2 && (
        // Radial burst
        <g transform={`translate(${width/2} ${height/2})`} opacity="0.3">
          {Array.from({ length: 16 }, (_, i) => (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={Math.cos((i * 22.5 * Math.PI) / 180) * 80}
              y2={Math.sin((i * 22.5 * Math.PI) / 180) * 80}
              stroke={baseColor}
              strokeWidth="0.5"
            />
          ))}
        </g>
      )}

      {patternType === 3 && (
        // Hexagon grid
        <g opacity="0.15">
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3, 4].map((col) => (
              <polygon
                key={`${row}-${col}`}
                points="10,0 20,5 20,15 10,20 0,15 0,5"
                transform={`translate(${col * 35 + (row % 2) * 17.5} ${row * 25})`}
                fill="none"
                stroke={baseColor}
                strokeWidth="0.5"
              />
            ))
          )}
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
        x={width / 2}
        y={height / 2 + 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="60"
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
        width={width - 4}
        height={height - 4}
        fill="none"
        stroke={baseColor}
        strokeWidth="0.5"
        opacity="0.3"
      />

      {/* Scanlines overlay */}
      <g opacity="0.03">
        {Array.from({ length: 45 }, (_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 2}
            x2={width}
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
  
  const [currentSrc, setCurrentSrc] = useState<string | null>(coverUrl || null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrentSrc(coverUrl || null);
    setFailed(false);
  }, [coverUrl]);

  const handleError = () => {
    if (!currentSrc) return;
    
    // Fallback order: png -> jpg -> jpeg -> gif
    const extensions = ['png', 'jpg', 'jpeg', 'gif'];
    const match = currentSrc.match(/\.(png|jpg|jpeg|gif)(?=\?|$)/i);
    
    if (match && match.index !== undefined) {
      const currentExt = match[1].toLowerCase();
      const currentIndex = extensions.indexOf(currentExt);
      
      if (currentIndex !== -1 && currentIndex < extensions.length - 1) {
        const nextExt = extensions[currentIndex + 1];
        const prefix = currentSrc.substring(0, match.index);
        const suffix = currentSrc.substring(match.index + match[0].length);
        const nextSrc = `${prefix}.${nextExt}${suffix}`;
        setCurrentSrc(nextSrc);
        return;
      }
    }
    setFailed(true);
  };

  if (!coverUrl || failed || !currentSrc) {
    return (
      <div className={`relative ${className} overflow-hidden`}>
        <GenerativeCover
          day={day}
          title={title}
          mood={mood}
          energy={energy}
          valence={valence}
          tempo={tempo}
          className="w-full h-full object-cover"
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

  return (
    <div className={`relative ${className} overflow-hidden`}>
      <GenerativeCover
        day={day}
        title={title}
        mood={mood}
        energy={energy}
        valence={valence}
        tempo={tempo}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <img
        src={currentSrc}
        alt={`${title} cover`}
        className="relative z-10 w-full h-full object-cover"
        onError={handleError}
        loading="eager"
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