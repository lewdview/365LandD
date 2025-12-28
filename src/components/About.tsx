import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useThemeStore } from '../store/useThemeStore';
import { useRef } from 'react';
import { GlowingOrbs, RisingParticles } from './FloatingParticles';

// Animated text component for line-by-line reveals
function AnimatedLine({ 
  children, 
  delay = 0,
  className = '',
  style = {}
}: { 
  children: React.ReactNode; 
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <span ref={ref} className={`block overflow-hidden ${className}`}>
      <motion.span
        className="block"
        style={style}
        initial={{ y: '100%', opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 }}
        transition={{ 
          duration: 0.8, 
          delay,
          ease: [0.16, 1, 0.3, 1] 
        }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Animated word component for word-by-word reveals
function AnimatedWords({ 
  text, 
  className = '',
  style = {},
  staggerDelay = 0.05
}: { 
  text: string;
  className?: string;
  style?: React.CSSProperties;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const words = text.split(' ');
  
  return (
    <span ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.3em]">
          <motion.span
            className="inline-block"
            initial={{ y: '100%', opacity: 0, rotate: 5 }}
            animate={isInView ? { y: 0, opacity: 1, rotate: 0 } : { y: '100%', opacity: 0, rotate: 5 }}
            transition={{ 
              duration: 0.6, 
              delay: i * staggerDelay,
              ease: [0.16, 1, 0.3, 1] 
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

export function About() {
  const { currentTheme } = useThemeStore();
  const { primary, accent, background } = currentTheme.colors;
  const containerRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <section 
      ref={containerRef}
      id="about" 
      className="relative py-32 overflow-hidden"
    >
      {/* Particle effects */}
      <GlowingOrbs count={6} />
      <RisingParticles count={15} />
      
      {/* Animated background elements */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        {/* Large floating "365" in background */}
        <div className="absolute -left-20 top-20 text-[20rem] font-black leading-none select-none opacity-[0.03]">
          365
        </div>
        <div className="absolute -right-32 bottom-0 text-[25rem] font-black leading-none select-none opacity-[0.02]" style={{ color: primary }}>
          ◐
        </div>
      </motion.div>

      {/* Diagonal stripe accents */}
      <div 
        className="absolute top-0 left-0 w-full h-2"
        style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }}
      />
      
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        
        {/* HERO TITLE - Asymmetric layout */}
        <div className="grid lg:grid-cols-12 gap-8 mb-32">
          <motion.div 
            className="lg:col-span-7 lg:col-start-1"
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative">
              {/* Decorative line */}
              <motion.div 
                className="absolute -left-8 top-0 bottom-0 w-1"
                style={{ background: `linear-gradient(180deg, ${primary}, transparent)` }}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.3 }}
              />
              
              <motion.span 
                className="text-sm font-mono tracking-[0.5em] uppercase block mb-4" 
                style={{ color: accent }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                The Manifesto
              </motion.span>
              
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] mb-6">
                <AnimatedLine 
                  delay={0.1}
                  style={{
                    WebkitTextStroke: `2px ${primary}`,
                    color: 'transparent',
                  }}
                >
                  365 DAYS
                </AnimatedLine>
                <AnimatedLine delay={0.2} className="text-light-cream">OF</AnimatedLine>
                <AnimatedLine delay={0.3} style={{ color: accent }}>LIGHT</AnimatedLine>
                <AnimatedLine delay={0.4} style={{ color: primary }}>&amp; DARK</AnimatedLine>
              </h2>
              
              <motion.p 
                className="text-xl md:text-2xl text-light-cream/60 font-light"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                A new song every day, for one year.
              </motion.p>
            </div>
          </motion.div>
          
          {/* Floating artist tag */}
          <motion.div 
            className="lg:col-span-4 lg:col-start-9 flex items-end"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div 
              className="w-full p-6 relative"
              style={{
                background: `linear-gradient(135deg, ${primary}20 0%, transparent 100%)`,
                borderLeft: `3px solid ${primary}`,
              }}
            >
              <span className="text-xs font-mono text-light-cream/40 uppercase tracking-widest">Artist</span>
              <p className="text-3xl font-black gradient-text mt-2">th3scr1b3</p>
            </div>
          </motion.div>
        </div>

        {/* THE WHY - Full width dramatic statement */}
        <motion.div 
          className="relative mb-32"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div 
            className="absolute inset-0 -skew-y-1"
            style={{ 
              background: `linear-gradient(90deg, ${background} 0%, ${primary}15 50%, ${background} 100%)`,
            }}
          />
          <div className="relative py-16 px-8 md:px-16">
            <p className="text-2xl md:text-4xl lg:text-5xl font-light leading-relaxed text-center max-w-5xl mx-auto">
              <AnimatedWords 
                text="This project exists because most people only hear the" 
                className="text-light-cream/40"
                staggerDelay={0.03}
              />{' '}
              <AnimatedWords 
                text="polished moments" 
                className="text-light-cream font-bold"
                staggerDelay={0.05}
              />
              <AnimatedWords 
                text="—never the" 
                className="text-light-cream/40"
                staggerDelay={0.03}
              />{' '}
              <AnimatedWords 
                text="process" 
                style={{ color: primary }}
                staggerDelay={0.08}
              />
              <AnimatedWords 
                text=", never the" 
                className="text-light-cream/40"
                staggerDelay={0.03}
              />{' '}
              <AnimatedWords 
                text="doubt" 
                style={{ color: primary }}
                staggerDelay={0.08}
              />
              <AnimatedWords 
                text=", never the" 
                className="text-light-cream/40"
                staggerDelay={0.03}
              />{' '}
              <AnimatedWords 
                text="dark" 
                style={{ color: primary }}
                staggerDelay={0.08}
              />{' '}
              <AnimatedWords 
                text="that gives meaning to the" 
                className="text-light-cream/40"
                staggerDelay={0.03}
              />{' '}
              <AnimatedWords 
                text="light." 
                style={{ color: accent }}
                staggerDelay={0.08}
              />
            </p>
          </div>
        </motion.div>

        {/* THE COMMITMENT - Staggered cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {[
            { num: "365", label: "ENTRIES", sub: "One every day" },
            { num: "RAW", label: "HONEST", sub: "Unfiltered expression" },
            { num: "∞", label: "SPECTRUM", sub: "Light to dark" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="group relative"
            >
              <div 
                className="p-8 h-full transition-all duration-500 group-hover:translate-x-2 group-hover:-translate-y-2"
                style={{
                  background: 'linear-gradient(135deg, rgba(45,48,72,0.6) 0%, rgba(26,28,46,0.8) 100%)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${i === 1 ? primary : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <span 
                  className="text-6xl md:text-7xl font-black block mb-2"
                  style={{ color: i === 0 ? accent : i === 1 ? primary : 'transparent', WebkitTextStroke: i === 2 ? `2px ${accent}` : 'none' }}
                >
                  {item.num}
                </span>
                <span className="text-xs font-mono tracking-[0.3em] text-light-cream/50 block mb-1">{item.label}</span>
                <span className="text-light-cream/70">{item.sub}</span>
              </div>
              {/* Shadow element */}
              <div 
                className="absolute inset-0 -z-10 translate-x-2 translate-y-2 transition-all duration-500 group-hover:translate-x-4 group-hover:translate-y-4"
                style={{ background: i === 1 ? `${primary}30` : 'rgba(255,255,255,0.03)' }}
              />
            </motion.div>
          ))}
        </div>

        {/* PERFECTION VS PRESENCE - Split statement */}
        <motion.div 
          className="mb-32 overflow-hidden"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-2">
            <motion.div 
              className="p-12 md:p-16 flex items-center justify-center"
              style={{ background: `${primary}15` }}
              initial={{ x: -100 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center">
                <span className="text-xs font-mono tracking-[0.3em] text-light-cream/30 block mb-4">THIS ISN'T ABOUT</span>
                <span 
                  className="text-5xl md:text-7xl font-black block line-through decoration-4"
                  style={{ color: primary, textDecorationColor: primary }}
                >
                  PERFECTION
                </span>
              </div>
            </motion.div>
            <motion.div 
              className="p-12 md:p-16 flex items-center justify-center"
              style={{ background: `${accent}15` }}
              initial={{ x: 100 }}
              whileInView={{ x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-center">
                <span className="text-xs font-mono tracking-[0.3em] text-light-cream/30 block mb-4">IT'S ABOUT</span>
                <span 
                  className="text-5xl md:text-7xl font-black block"
                  style={{ color: accent }}
                >
                  PRESENCE
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* WHAT I'M PROVING - Diagonal list */}
        <motion.div 
          className="mb-32 relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-mono tracking-[0.3em] text-light-cream/30 uppercase mb-12 text-center">
              I'm doing this to prove—
            </h3>
            <div className="space-y-4">
              {[
                { text: "Consistency beats waiting for inspiration", accent: true },
                { text: "Creativity survives pressure", accent: false },
                { text: "Showing up daily compounds into something meaningful", accent: true },
                { text: "Art doesn't need permission to exist", accent: false },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-6"
                  initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  style={{ marginLeft: i % 2 === 0 ? '0' : '4rem' }}
                >
                  <span 
                    className="text-4xl font-black"
                    style={{ color: item.accent ? accent : primary }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xl md:text-2xl text-light-cream/80">
                    {item.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* MISSION STATEMENT - Full bleed */}
        <motion.div 
          className="relative mb-32 -mx-4 md:-mx-8 lg:-mx-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div 
            className="py-20 px-8 md:px-16 text-center"
            style={{
              background: `linear-gradient(180deg, ${primary}30 0%, transparent 100%)`,
              borderTop: `1px solid ${primary}50`,
              borderBottom: `1px solid ${primary}50`,
            }}
          >
            <motion.h3 
              className="text-3xl md:text-5xl lg:text-6xl font-black mb-8"
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
            >
              THE MISSION IS<br/>
              <span style={{ color: primary }}>BIGGER THAN MUSIC</span>
            </motion.h3>
            <p className="text-xl md:text-2xl text-light-cream/60 max-w-3xl mx-auto">
              If one person decides to start their own daily practice—music, writing, healing, building—because they watched this unfold, <span className="text-light-cream font-bold">then the project succeeds.</span>
            </p>
          </div>
        </motion.div>

        {/* SUPPORT SECTION - Asymmetric cards */}
        <div className="grid lg:grid-cols-12 gap-8 mb-32">
          <motion.div 
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div 
              className="h-full p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(45,48,72,0.6) 0%, rgba(26,28,46,0.8) 100%)',
                borderLeft: `4px solid ${accent}`,
              }}
            >
              <div className="absolute top-4 right-4 text-8xl font-black opacity-10" style={{ color: accent }}>$</div>
              <span className="text-xs font-mono tracking-[0.3em] uppercase block mb-4" style={{ color: accent }}>Support</span>
              <h4 className="text-2xl font-bold text-light-cream mb-4">Fund the Journey</h4>
              <p className="text-light-cream/60 leading-relaxed mb-6">
                This project is self-funded. Every contribution helps cover production tools, distribution, and the time required to sustain a daily release for an entire year.
              </p>
              <p className="text-sm font-medium" style={{ color: accent }}>
                Donations are a vote for independent creation without compromise.
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div 
              className="h-full p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(45,48,72,0.6) 0%, rgba(26,28,46,0.8) 100%)',
                borderLeft: `4px solid ${primary}`,
              }}
            >
              <div className="absolute top-4 right-4 text-8xl font-black opacity-10" style={{ color: primary }}>∞</div>
              <span className="text-xs font-mono tracking-[0.3em] uppercase block mb-4" style={{ color: primary }}>Early Access</span>
              <h4 className="text-2xl font-bold text-light-cream mb-4">Unlock All 365</h4>
              <p className="text-light-cream/60 leading-relaxed mb-6">
                Get access to all poetic entries as they're completed—plus alternate versions, demos, unreleased cuts, and behind-the-scenes context.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Full Catalog", "Demos", "Unreleased", "BTS Content"].map((tag) => (
                  <span 
                    key={tag}
                    className="px-3 py-1 text-xs font-mono uppercase"
                    style={{ background: `${primary}30`, color: primary }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* CLOSING - Dramatic finale */}
        <motion.div 
          className="text-center relative"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="relative inline-block">
            <motion.div
              className="absolute -inset-8 opacity-20 blur-3xl"
              style={{ background: `linear-gradient(90deg, ${accent}, ${primary})` }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <h4 className="text-4xl md:text-6xl lg:text-7xl font-black relative">
              <span style={{ color: accent }}>LIGHT</span>
              <span className="text-light-cream/30 mx-4">&</span>
              <span style={{ color: primary }}>DARK</span>
            </h4>
          </div>
          <p className="text-2xl md:text-3xl text-light-cream/60 mt-8 mb-4">
            both tell the truth.
          </p>
          <p className="text-lg text-light-cream/40 mb-8">
            This year, I'm sharing both—one poetic entry at a time.
          </p>
          <p className="text-sm font-mono" style={{ color: accent }}>— th3scr1b3</p>
        </motion.div>
      </div>
      
      {/* Bottom accent line */}
      <div 
        className="absolute bottom-0 left-0 w-full h-1"
        style={{ background: `linear-gradient(90deg, ${accent}, ${primary})` }}
      />
    </section>
  );
}
