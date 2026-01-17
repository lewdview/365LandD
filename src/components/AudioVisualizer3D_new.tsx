import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useThemeStore } from '../store/useThemeStore';

// Helper to convert hex to normalized RGB array [0-1, 0-1, 0-1]
const hexToRgbArray = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
};

// Custom shader for light/dark split parabola
const parabolaVertexShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uDistort;
  
  // Noise function for organic movement
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
    vUv = uv;
    vNormal = normal;
    
    // Create parabola-like distortion
    vec3 pos = position;
    
    // Add organic noise-based distortion
    float noise = snoise(pos * 1.5 + uTime * 0.3) * uDistort;
    float noise2 = snoise(pos * 3.0 - uTime * 0.2) * uDistort * 0.5;
    
    // Parabolic stretching - stretch along Y axis based on X position
    float parabolicFactor = 1.0 + (pos.x * pos.x) * 0.3;
    pos.y *= parabolicFactor;
    
    // Apply noise distortion
    pos += normal * (noise + noise2);
    
    vPosition = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const parabolaFragmentShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec2 vUv;
  uniform vec3 uLightColor;
  uniform vec3 uDarkColor;
  uniform vec3 uAccentColor;
  uniform float uTime;
  
  void main() {
    // Use X position to determine light/dark split
    float splitFactor = smoothstep(-0.3, 0.3, vPosition.x);
    
    // Add some variation based on normal for depth
    float normalInfluence = dot(vNormal, vec3(1.0, 0.5, 0.3)) * 0.5 + 0.5;
    
    // Mix between dark and light sides
    vec3 baseColor = mix(uDarkColor, uLightColor, splitFactor);
    
    // Add accent glow at the split line (center)
    float splitGlow = 1.0 - abs(vPosition.x) * 2.0;
    splitGlow = pow(max(0.0, splitGlow), 3.0);
    
    // Add pulsing glow
    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
    splitGlow *= (0.7 + pulse * 0.3);
    
    // Fresnel effect for edge glow
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDir)), 3.0);
    
    // Combine colors
    vec3 finalColor = baseColor;
    finalColor = mix(finalColor, uAccentColor, splitGlow * 0.6);
    finalColor += uAccentColor * fresnel * 0.3;
    
    // Add subtle metallic sheen
    float sheen = normalInfluence * 0.2;
    finalColor += vec3(sheen);
    
    gl_FragColor = vec4(finalColor, 0.95);
  }
`;

function DualityParabola({ lightColor, darkColor, accentColor }: { 
  lightColor: string; 
  darkColor: string; 
  accentColor: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Convert hex to vec3
  const hexToVec3 = (hex: string) => {
    const rgb = hexToRgbArray(hex);
    return new THREE.Vector3(rgb[0], rgb[1], rgb[2]);
  };
  
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDistort: { value: 0.25 },
    uLightColor: { value: hexToVec3(lightColor) },
    uDarkColor: { value: hexToVec3(darkColor) },
    uAccentColor: { value: hexToVec3(accentColor) },
  }), []);
  
  // Update colors when theme changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uLightColor.value = hexToVec3(lightColor);
      materialRef.current.uniforms.uDarkColor.value = hexToVec3(darkColor);
      materialRef.current.uniforms.uAccentColor.value = hexToVec3(accentColor);
    }
  }, [lightColor, darkColor, accentColor]);
  
  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      // Slow rotation to show both sides
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.08) * 0.1;
      
      // Update time uniform
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
      <mesh ref={meshRef} scale={2.8}>
        <icosahedronGeometry args={[1, 32]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={parabolaVertexShader}
          fragmentShader={parabolaFragmentShader}
          uniforms={uniforms}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>
    </Float>
  );
}

function ParticleRing({ startColor, endColor }: { startColor: string; endColor: string }) {
  const points = useRef<THREE.Points>(null);
  const particleCount = 2000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 3 + Math.random() * 0.5;
      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return pos;
  }, []);

  const colors = useMemo(() => {
    const cols = new Float32Array(particleCount * 3);
    const start = hexToRgbArray(startColor);
    const end = hexToRgbArray(endColor);

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount;
      // Interpolate between start and end theme colors
      cols[i * 3] = start[0] + t * (end[0] - start[0]); // R
      cols[i * 3 + 1] = start[1] + t * (end[1] - start[1]); // G
      cols[i * 3 + 2] = start[2] + t * (end[2] - start[2]); // B
    }
    return cols;
  }, [startColor, endColor]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.2;
      points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function EnergyWaves({ primaryColor, accentColor }: { primaryColor: string; accentColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const waveCount = 5;

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, index) => {
        const mesh = child as THREE.Mesh;
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + index * 0.5) * 0.1;
        mesh.scale.set(scale, scale, scale);
        mesh.rotation.z = state.clock.elapsedTime * 0.1 * (index % 2 === 0 ? 1 : -1);
      });
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: waveCount }).map((_, i) => (
        <mesh key={i} position={[0, 0, -i * 0.1]} scale={1 + i * 0.3}>
          <torusGeometry args={[2, 0.01, 16, 100]} />
          <meshBasicMaterial
            color={i % 2 === 0 ? primaryColor : accentColor}
            transparent
            opacity={0.3 - i * 0.05}
          />
        </mesh>
      ))}
    </group>
  );
}

function LightBeams({ primaryColor, accentColor }: { primaryColor: string; accentColor: string }) {
  const beamsRef = useRef<THREE.Group>(null);
  const beamCount = 8;

  useFrame((state) => {
    if (beamsRef.current) {
      beamsRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={beamsRef}>
      {Array.from({ length: beamCount }).map((_, i) => {
        const angle = (i / beamCount) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 4, Math.sin(angle) * 4, -2]}
            rotation={[0, 0, angle + Math.PI / 2]}
          >
            <planeGeometry args={[0.05, 8]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? primaryColor : accentColor}
              transparent
              opacity={0.15}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Scene() {
  const { currentTheme } = useThemeStore();
  const { primary, secondary, accent } = currentTheme.colors;
  
  return (
    <>
      <ambientLight intensity={0.3} />
      {/* Light side illumination */}
      <pointLight position={[10, 5, 5]} intensity={1.2} color={accent} />
      {/* Dark side subtle fill */}
      <pointLight position={[-10, -5, 5]} intensity={0.3} color={primary} />
      {/* Top rim light */}
      <pointLight position={[0, 10, 0]} intensity={0.5} color={secondary} />
      
      {/* Main duality parabola - light on one side, dark on other */}
      <DualityParabola 
        lightColor={accent} 
        darkColor={primary} 
        accentColor={secondary} 
      />
      
      {/* Update ParticleRing to use dynamic theme colors instead of hardcoded steel-blue/lime */}
      <ParticleRing startColor={primary} endColor={accent} />
      
      <EnergyWaves primaryColor={secondary} accentColor={accent} />
      <LightBeams primaryColor={primary} accentColor={accent} />
      
      <Environment preset="night" />
    </>
  );
}

export function AudioVisualizer3D() {
  return (
    <div className="absolute inset-0 z-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}