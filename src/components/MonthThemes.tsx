// type: uploaded file
// fileName: src/components/MonthThemes.tsx

import { useMemo, useState, useEffect, useRef } from 'react';
import { motion, LayoutGroup, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';

// --- HELPER: Convert Hex to RGBA ---
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// --- SHADERS ---
const sphereVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uDistort;
  uniform float uFracture;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normal;
    vec3 pos = position;
    // Enhanced fracture distortion
    float noise = snoise(pos * (1.0 + (uFracture * 2.0)) + uTime * 0.5) * (uDistort + (uFracture * 0.5));
    
    // Hard Glitch Geometry Displacement
    if (uFracture > 0.5) {
       float spike = step(0.85, sin(uTime * 15.0 + pos.y * 8.0));
       pos += normal * spike * 0.4;
       pos.x += spike * 0.1 * sin(uTime * 50.0);
    }
    
    pos += normal * noise;
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const sphereFragmentShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uTime;
  uniform float uFracture;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 2.0);
    float noisePattern = sin(vPosition.x * 5.0 + uTime) * 0.5 + 0.5;
    
    // Base gradient between Primary and Accent
    vec3 color = mix(uColorA, uColorB, noisePattern);
    
    // Rim lighting (Fresnel) - strictly uses Accent color, not white
    color += uColorB * fresnel;
    
    // Fracture / Glitch Bands
    if (uFracture > 0.5) {
       float glitch = step(0.9, sin(vPosition.y * 50.0 + uTime * 20.0));
       
       // UPDATED: Instead of inverting to white (1.0 - color), we swap channels or use the opposing theme color
       // This ensures the glitch remains strictly within the theme palette
       vec3 glitchColor = uColorB; // Force Accent color on glitch strips
       
       color = mix(color, glitchColor, glitch);
    }
    
    gl_FragColor = vec4(color, 0.9);
  }
`;

// --- 3D VISUALIZER COMPONENT ---
function MonthOrb({ 
  primary, 
  accent, 
  stability, 
  fracture 
}: { 
  primary: string; 
  accent: string; 
  stability: string; 
  fracture: boolean 
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const hexToVec3 = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return new THREE.Vector3(r, g, b);
  };

  const config = useMemo(() => {
    switch(stability) {
      case 'stable': return { distort: 0.1, speed: 0.2 };
      case 'unstable': return { distort: 0.4, speed: 0.6 };
      case 'critical': return { distort: 0.8, speed: 1.2 };
      case 'corrupted': return { distort: 1.2, speed: 2.0 };
      default: return { distort: 0.1, speed: 0.2 };
    }
  }, [stability]);

  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      meshRef.current.rotation.y += 0.005 * config.speed;
      if (fracture) {
         meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1;
      }
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * config.speed;
    }
  });

  return (
    <Float speed={fracture ? 5 : 2} rotationIntensity={fracture ? 2 : 0.5} floatIntensity={fracture ? 1 : 0.5}>
      <mesh ref={meshRef} scale={1.2}>
        <icosahedronGeometry args={[1, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={sphereVertexShader}
          fragmentShader={sphereFragmentShader}
          uniforms={{
            uTime: { value: 0 },
            uDistort: { value: config.distort },
            uFracture: { value: fracture ? 1.0 : 0.0 },
            uColorA: { value: hexToVec3(primary) },
            uColorB: { value: hexToVec3(accent) },
          }}
          transparent
        />
      </mesh>
    </Float>
  );
}

// --- ANIMATED BACKGROUND ---
const BubblingBackground = ({ primary, secondary, background }: { primary: string, secondary: string, background: string }) => {
  const blobVariants = {
    animate: {
      scale: [1, 1.2, 1],
      x: [0, 50, -50, 0],
      y: [0, -50, 50, 0],
      opacity: [0.2, 0.4, 0.2], 
      transition: {
        duration: 15,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Reduced overlay opacity so bubbles are more visible */}
      <div 
        className="absolute inset-0 z-10" 
        style={{ backgroundColor: hexToRgba(background, 0.5) }} 
      /> 
      
      <motion.div
        variants={blobVariants}
        animate="animate"
        className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] mix-blend-screen"
        style={{ backgroundColor: primary }}
      />
      <motion.div
        variants={blobVariants}
        animate="animate"
        transition={{ delay: 7 }}
        className="absolute bottom-[-10%] right-[-10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full blur-[100px] mix-blend-screen"
        style={{ backgroundColor: secondary }} 
      />
    </div>
  );
};

// --- VISUAL CONFIGURATION ---
const SYSTEM_CONFIG: Record<number, { 
  tagline: string; 
  synopsis: string;
  stability: 'stable' | 'unstable' | 'critical' | 'corrupted';
  fracture?: boolean;
}> = {
  1: { tagline: 'Boot Sequence: Light Online', synopsis: 'Hope initializes. Everything feels possible because nothing has failed yet. The system believes itself.', stability: 'stable' },
  2: { tagline: 'Desire Compiles', synopsis: 'Connection, longing, and projection accelerate. Want is mistaken for truth. The system leans outward.', stability: 'stable' },
  3: { tagline: 'Velocity Without Direction', synopsis: 'Momentum replaces intention. Movement feels like purpose. Cracks are ignored because speed feels alive.', stability: 'stable' },
  4: { tagline: 'First Contact With the Self', synopsis: 'Reflection enters. Identity questions surface. Light still dominates, but doubt now exists.', stability: 'unstable' },
  5: { tagline: 'Overclocked Heart', synopsis: 'Emotion exceeds capacity. Love, ambition, and belief push past safe limits. Warning signs flicker.', stability: 'unstable' },
  6: { tagline: 'ERROR', synopsis: '(silence)', stability: 'unstable', fracture: true },
  7: { tagline: 'Heat Without Shelter', synopsis: 'Survival mode. The system adapts instead of heals. Joy appears briefly, but it burns fast.', stability: 'unstable' },
  8: { tagline: 'ERROR', synopsis: '(silence)', stability: 'critical', fracture: true },
  9: { tagline: 'Memory Leak', synopsis: 'Past and present blur. Old truths resurface distorted. The system attempts repair by remembering.', stability: 'unstable' },
  10: { tagline: 'Rituals of Repair', synopsis: 'Patterns form. Repetition becomes grounding. Meaning is rebuilt from fragments, not certainty.', stability: 'stable' },
  11: { tagline: 'Acceptance Without Resolution', synopsis: 'Peace arrives unevenly. The system no longer fights its scars. Stability is provisional, but real.', stability: 'stable' },
  12: { tagline: 'SYSTEM RESET (Incomplete)', synopsis: '—\n(Silence again. The listener must decide what reset means.)', stability: 'corrupted', fracture: true },
};

// --- HELPER COMPONENTS ---
const StabilityMeter = ({ status, color, activeColor }: { status: string, color: string, activeColor: string }) => {
  const getPattern = () => {
    switch(status) {
      case 'stable': return [1,1,1,1,1];
      case 'unstable': return [1,1,1,0,0];
      case 'critical': return [1,0,0,0,0];
      case 'corrupted': return [0,1,0,1,0];
      default: return [1,1,1,1,1];
    }
  };

  return (
    <div className="flex gap-1">
      {getPattern().map((fill, i) => (
        <div 
          key={i}
          className={`w-1 h-1 rounded-full ${status === 'corrupted' ? 'animate-pulse' : ''}`}
          style={{ 
            backgroundColor: fill ? activeColor : 'transparent',
            border: `1px solid ${fill ? activeColor : color}`,
            opacity: fill ? 1 : 0.2
          }}
        />
      ))}
    </div>
  );
};

// Glitch Filter for Fractured Months
const GlitchFilter = () => (
  <svg style={{ display: 'none' }}>
    <defs>
      <filter id="fracture-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="discrete" tableValues="0 1"/>
        </feComponentTransfer>
      </filter>
    </defs>
  </svg>
);

const ThemeCard = ({ 
  item, 
  index, 
  isActive, 
  onClick,
  primary, 
  secondary, 
  accent, 
  text,
  background
}: { 
  item: any, 
  index: number, 
  isActive: boolean,
  onClick: () => void,
  primary: string, 
  secondary: string,
  accent: string, 
  text: string,
  background: string
}) => {
  const { config, stats } = item;

  // Sheen Animation Variant
  const sheenVariants = {
    hover: {
      x: ['-100%', '200%'],
      transition: { duration: 1.5, ease: "easeInOut" as const, repeat: Infinity, repeatDelay: 1 }
    }
  };

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.5, ease: [0.32, 0.72, 0, 1] } }}
      onClick={onClick}
      initial="idle"
      whileHover="hover"
      animate={isActive ? "hover" : "idle"}
      className={`relative w-full overflow-hidden border cursor-pointer group ${
        isActive 
          ? 'row-span-5 md:col-span-2 md:row-span-5 z-20 h-full min-h-[320px] rounded-2xl' 
          : 'col-span-1 h-[60px] z-0 rounded-lg hover:opacity-100'
      }`}
      style={{ 
        borderColor: isActive ? accent : 'rgba(255,255,255,0.05)',
        backgroundColor: isActive 
          ? hexToRgba(background, 0.90) 
          : hexToRgba(background, 0.40),
        backdropFilter: 'blur(12px)',
        boxShadow: isActive 
          ? `0 0 0 1px ${accent}40, 0 10px 40px -10px ${primary}60, inset 0 1px 0 rgba(255,255,255,0.2)`
          : `0 4px 6px -1px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)`,
        opacity: isActive ? 1 : 0.85
      }}
    >
      {/* 1. SHEEN ANIMATION */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-inherit z-10">
         <motion.div
           variants={sheenVariants}
           className="absolute inset-0 w-1/2 h-full skew-x-[-20deg]"
           style={{
             background: `linear-gradient(90deg, transparent, ${hexToRgba(primary, 0.2)}, transparent)`,
             filter: 'blur(20px)'
           }}
         />
      </div>

      {/* 2. BACKGROUND VISUALIZER */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
             key={`orb-${index}`}
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ delay: 0.3, duration: 0.5 }}
             className="absolute inset-0 z-0 opacity-40 pointer-events-none"
          >
             <Canvas camera={{ position: [0, 0, 5] }} gl={{ alpha: true }}>
               <ambientLight intensity={0.5} />
               <MonthOrb 
                 primary={primary} 
                 accent={accent} 
                 stability={config.stability} 
                 fracture={config.fracture} 
               />
             </Canvas>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. GRADIENT OVERLAY */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-30"
        style={{
          background: isActive 
            ? `radial-gradient(circle at top right, ${primary}20, transparent 70%)`
            : `linear-gradient(to right, transparent, ${primary}05, transparent)`
        }}
      />

      {/* 4. CONTENT */}
      <div className={`relative z-20 h-full flex flex-col justify-between ${isActive ? 'p-6' : 'px-4 py-2'}`}>
        
        {/* Header Section */}
        <div className="flex justify-between items-center h-full">
           <div className={isActive ? "w-full" : "flex items-center w-full gap-3"}>
              <div className="flex items-baseline gap-2">
                 <span className={`font-mono text-[10px] opacity-40 ${isActive ? 'block' : 'hidden'}`}>
                    MNTH_{String(index + 1).padStart(2, '0')}
                 </span>
                 <h3 className={`font-bold uppercase tracking-tighter leading-none transition-all ${
                    isActive ? 'text-3xl md:text-4xl drop-shadow-lg mb-2' : 'text-sm'
                 }`} style={{ color: text }}>
                   {item.name}
                 </h3>
              </div>
              
              <div className={`font-mono uppercase tracking-widest ${isActive ? 'text-xs opacity-70' : 'text-[8px] opacity-40 ml-auto'}`} style={{ color: primary }}>
                 {isActive ? `> ${config.tagline}` : config.stability === 'stable' ? 'NOMINAL' : 'WARNING'}
              </div>
           </div>
        </div>

        {/* Expanded Details */}
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-auto"
          >
            {/* Conditional Rendering: Hide if synopsis is just "(silence)" */}
            {config.synopsis !== '(silence)' && (
                <p className="text-sm leading-relaxed max-w-lg mb-4 whitespace-pre-line font-medium" style={{ color: text, opacity: 0.9 }}>
                {config.synopsis}
                </p>
            )}
            
            {/* Visual spacer for silence */}
            {config.synopsis === '(silence)' && (
                <div className="mb-4 h-8 flex items-center">
                    <span className="font-mono text-xs opacity-30 animate-pulse">{'>'} SILENCE DETECTED</span>
                </div>
            )}

            <div className="flex items-end justify-between border-t border-white/10 pt-3">
               <div>
                  <div className="text-[10px] font-mono opacity-50 uppercase mb-2">System Stability</div>
                  <StabilityMeter status={config.stability} color={text} activeColor={accent} />
               </div>
               
               <div className="text-right">
                  <div className="text-[10px] font-mono opacity-50 uppercase mb-1">Motif Signal</div>
                  <div className="flex gap-2 justify-end">
                    {stats.motifs.slice(0, 3).map((m: string) => (
                      <span 
                        key={m} 
                        className="text-[10px] px-2 py-0.5 rounded backdrop-blur-sm"
                        style={{ backgroundColor: secondary + '40', color: text }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 5. FRACTURE OVERLAY */}
      {config.fracture && (
        <>
          <div className="absolute inset-0 pointer-events-none z-30 mix-blend-overlay opacity-50"
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`
             }}
          />
          {isActive && (
             <motion.div 
               className="absolute inset-0 pointer-events-none z-40 bg-white/5 mix-blend-difference"
               animate={{ opacity: [0, 0.2, 0, 0.1, 0] }}
               transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
             />
          )}
        </>
      )}
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
export function MonthThemes() {
  const { data, currentDay } = useStore();
  const { currentTheme } = useThemeStore();
  const { primary, secondary, accent, text, background } = currentTheme.colors;
  
  const [activeMonth, setActiveMonth] = useState<number | null>(null);

  useEffect(() => {
    if (data?.monthThemes && activeMonth === null) {
       const current = data.monthThemes.find(t => currentDay >= t.dayStart && currentDay <= t.dayEnd);
       setActiveMonth(current ? current.month : 1);
    }
  }, [data, currentDay, activeMonth]);

  const processedMonths = useMemo(() => {
    if (!data?.monthThemes) return [];
    
    const sortedThemes = [...data.monthThemes].sort((a, b) => a.dayStart - b.dayStart);
    const allReleases = data.releases || [];

    return sortedThemes.map((theme) => {
      const monthReleases = allReleases.filter(r => r.day >= theme.dayStart && r.day <= theme.dayEnd);
      
      const tagCounts: Record<string, number> = {};
      monthReleases.forEach(r => {
        r.tags.forEach(tag => { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
      });
      const motifs = Object.entries(tagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5) 
        .map(([tag]) => tag);

      const config = SYSTEM_CONFIG[theme.month] || { 
        tagline: 'System Idle', 
        synopsis: 'No data available.', 
        stability: 'stable' 
      };

      return { ...theme, releases: monthReleases, stats: { motifs }, config };
    });
  }, [data]);

  if (!processedMonths.length) return null;

  return (
    <section className="py-12 px-4 md:px-8 relative min-h-screen overflow-hidden">
      
      {/* Animated Background */}
      <BubblingBackground primary={primary} secondary={secondary} background={background} />

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-8 border-b border-white/10 pb-4 flex justify-between items-end"
        >
          <h2 className="text-xl font-mono tracking-tighter uppercase" style={{ color: text }}>
            System_Roadmap_v2.0 // 3D_VISUALIZATION
          </h2>
        </motion.div>

        <LayoutGroup>
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[60px] grid-flow-dense"
          >
            {processedMonths.map((item, index) => (
               <ThemeCard 
                 key={item.month}
                 item={item} 
                 index={index}
                 isActive={activeMonth === item.month}
                 onClick={() => setActiveMonth(item.month)}
                 primary={primary}
                 secondary={secondary}
                 accent={accent}
                 text={text}
                 background={background}
               />
            ))}
          </motion.div>
        </LayoutGroup>
      </div>
      <GlitchFilter />
    </section>
  );
}