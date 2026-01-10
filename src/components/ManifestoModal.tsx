import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/useThemeStore';
import { useRef, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { GlowingOrbs, RisingParticles } from './FloatingParticles';

// --- Utility Components for Text Reveal ---

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
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  
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
  const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const words = text.split(' ');
  
  return (
    <span ref={ref} className={className} style={style}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden mr-[0.25em] align-top">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0, rotate: 3 }}
            animate={isInView ? { y: 0, opacity: 1, rotate: 0 } : { y: '110%', opacity: 0, rotate: 3 }}
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

// --- Main Component ---

interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManifestoModal({ isOpen, onClose }: ManifestoModalProps) {
  const { currentTheme } = useThemeStore();
  const { primary, accent } = currentTheme.colors;
  
  // Ref for the scrollable container (the modal overlay itself)
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);
  
  // Only track scroll when modal is open
  const { scrollYProgress } = useScroll({
    container: isOpen ? containerRef : undefined,
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center bg-void-black/98 backdrop-blur-xl"
        >
          {/* Scrollable Container */}
          <div 
            ref={containerRef}
            className="w-full h-full overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-primary/50 transition-colors"
            onClick={(e) => e.target === containerRef.current && onClose()}
          >
            
            {/* Close button - Fixed to viewport */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.5 }}
              onClick={onClose}
              className="fixed top-6 right-6 z-[10000] group"
            >
              <div 
                className="w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300"
                style={{ 
                  background: `${primary}10`,
                  border: `1px solid ${primary}40`,
                }}
              >
                <X 
                  className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" 
                  style={{ color: primary }} 
                />
              </div>
            </motion.button>

            {/* Parallax Background Elements */}
            <motion.div 
              className="absolute inset-0 pointer-events-none w-full h-[200vh] overflow-hidden"
              style={{ y: backgroundY }}
            >
              <div className="absolute -left-20 top-20 text-[20vw] font-black leading-none select-none opacity-[0.02] blur-sm">
                365
              </div>
              <div 
                className="absolute -right-32 top-[40vh] text-[30vw] font-black leading-none select-none opacity-[0.02] blur-sm" 
                style={{ color: primary }}
              >
                ◐
              </div>
            </motion.div>

            {/* Progress Bar (Top) */}
            <motion.div 
              className="fixed top-0 left-0 h-1 z-[10000]"
              style={{ 
                width: '100%',
                scaleX: scrollYProgress,
                transformOrigin: '0%',
                background: `linear-gradient(90deg, ${primary}, ${accent})`
              }}
            />

            {/* CONTENT WRAPPER */}
            <div className="relative w-full max-w-7xl mx-auto py-24 px-6 md:px-12">
              
              {/* Particles constrained to container */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <GlowingOrbs count={8} />
                <RisingParticles count={20} />
              </div>

              {/* 1. HERO SECTION */}
              <div className="min-h-[80vh] flex flex-col justify-center mb-32 relative">
                <div className="grid lg:grid-cols-12 gap-12">
                  <motion.div 
                    className="lg:col-span-8"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="relative border-l-2 pl-8 md:pl-12" style={{ borderColor: `${primary}40` }}>
                      <motion.span 
                        className="text-sm font-mono tracking-[0.5em] uppercase block mb-6" 
                        style={{ color: accent }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        The Manifesto
                      </motion.span>
                      
                      <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tighter mb-8">
                        <AnimatedLine delay={0.1} style={{ WebkitTextStroke: `1px ${primary}`, color: 'transparent' }}>
                          365 DAYS
                        </AnimatedLine>
                        <AnimatedLine delay={0.2} className="text-light-cream">OF</AnimatedLine>
                        <AnimatedLine delay={0.3} style={{ color: accent }}>LIGHT</AnimatedLine>
                        <AnimatedLine delay={0.4} style={{ color: primary }}>& DARK</AnimatedLine>
                      </h1>
                      
                      <motion.p 
                        className="text-xl md:text-2xl text-light-cream/60 font-light max-w-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                      >
                        A new song every day. No skips. No excuses. <br/>
                        <span className="text-light-cream">Just raw creation.</span>
                      </motion.p>
                    </div>
                  </motion.div>
                  
                  {/* Scroll Hint */}
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full flex justify-center pb-12 pointer-events-none"
                    style={{ opacity: opacityFade }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.3em] text-light-cream/30">Scroll to read</span>
                      <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-primary to-transparent" />
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* 2. THE WHY (Philosophy) */}
              <section className="mb-40 relative">
                <div 
                  className="absolute inset-0 -skew-y-2 opacity-50"
                  style={{ 
                    background: `linear-gradient(90deg, transparent 0%, ${primary}05 50%, transparent 100%)`,
                  }}
                />
                <div className="relative py-16 text-center max-w-5xl mx-auto">
                  <div className="text-2xl md:text-4xl lg:text-5xl font-light leading-relaxed">
                    <AnimatedWords 
                      text="Most people only hear the polished moments." 
                      className="text-light-cream/40"
                    />
                    <br className="hidden md:block" />
                    <AnimatedWords 
                      text="They never hear the doubt," 
                      style={{ color: primary }}
                      staggerDelay={0.08}
                    />
                    <AnimatedWords 
                      text=" the grind," 
                      className="text-light-cream"
                    />
                    <AnimatedWords 
                      text=" or the dark that gives meaning to the light." 
                      style={{ color: accent }}
                      staggerDelay={0.08}
                    />
                  </div>
                </div>
              </section>

              {/* 3. THE COMMITMENT CARDS */}
              <section className="grid md:grid-cols-3 gap-6 mb-40">
                {[
                  { num: "365", label: "ENTRIES", sub: "One song, every single day." },
                  { num: "RAW", label: "HONESTY", sub: "Unfiltered. Unmastered. Real." },
                  { num: "∞", label: "SPECTRUM", sub: "From deepest void to blinding light." },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8, delay: i * 0.15 }}
                    className="group relative h-full"
                  >
                    <div 
                      className="p-8 h-full border border-white/5 bg-white/[0.02] backdrop-blur-sm transition-all duration-500 group-hover:border-primary/30 group-hover:bg-white/[0.04]"
                    >
                      <span 
                        className="text-7xl font-black block mb-4"
                        style={{ 
                          color: i === 1 ? 'transparent' : (i === 0 ? accent : primary),
                          WebkitTextStroke: i === 1 ? `2px ${primary}` : 'none'
                        }}
                      >
                        {item.num}
                      </span>
                      <span className="text-xs font-mono tracking-[0.3em] text-light-cream/40 block mb-2">{item.label}</span>
                      <span className="text-lg text-light-cream/80">{item.sub}</span>
                    </div>
                  </motion.div>
                ))}
              </section>

              {/* 4. PERFECTION VS PRESENCE */}
              <section className="mb-40">
                <div className="grid md:grid-cols-2 border-t border-b border-white/10">
                  <motion.div 
                    className="p-16 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 bg-void-black"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    <div className="text-center opacity-40 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
                      <span className="text-xs font-mono tracking-[0.3em] block mb-4">KILL</span>
                      <span className="text-5xl md:text-6xl font-black block line-through decoration-4 decoration-red-500/50">
                        PERFECTION
                      </span>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="p-16 flex items-center justify-center relative overflow-hidden"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                     <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at center, ${accent}, transparent 70%)` }} />
                    <div className="text-center relative z-10">
                      <span className="text-xs font-mono tracking-[0.3em] text-accent block mb-4">EMBRACE</span>
                      <span className="text-5xl md:text-6xl font-black block text-light-cream">
                        PRESENCE
                      </span>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* 5. SUPPORT / CALL TO ACTION */}
              <section className="grid lg:grid-cols-2 gap-8 mb-32">
                {/* Ko-Fi / Donate */}
                <motion.a
                  href="https://ko-fi.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-sm block"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg, ${accent}20, transparent)` }} 
                  />
                  <div className="p-10 border border-white/10 h-full bg-[#111]">
                    <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                      <span style={{ color: accent }}>Fund the Journey</span>
                    </h4>
                    <p className="text-light-cream/60 mb-8 leading-relaxed">
                      This project is self-funded. Your support covers production tools and keeps the daily streak alive.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest" style={{ color: accent }}>
                      Donate via Ko-Fi <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.a>

                {/* Gumroad / Purchase */}
                <motion.a
                  href="https://gumroad.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden rounded-sm block"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg, ${primary}20, transparent)` }} 
                  />
                  <div className="p-10 border border-white/10 h-full bg-[#111]">
                    <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                      <span style={{ color: primary }}>Unlock All 365</span>
                    </h4>
                    <p className="text-light-cream/60 mb-8 leading-relaxed">
                      Get early access, high-quality downloads, demos, and the stories behind every single track.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-mono uppercase tracking-widest" style={{ color: primary }}>
                      Get Access <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.a>
              </section>

              {/* 6. SIGNATURE */}
              <motion.div 
                className="text-center pb-24 opacity-50"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 0.5 }}
                viewport={{ once: true }}
              >
                <p className="font-mono text-sm tracking-[0.2em] mb-4">TH3SCR1B3.ART</p>
                <div className="w-12 h-[1px] bg-white/20 mx-auto" />
              </motion.div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}