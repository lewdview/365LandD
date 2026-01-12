import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/useThemeStore';
import { useRef, useEffect } from 'react';
import { X, Terminal, Cpu, Zap, Lock, Fingerprint, ArrowRight } from 'lucide-react';
import { GlitchText } from './GlitchText'; // Assuming you have this from previous steps

// --- Reusable Text Reveal Component (Terminal Style) ---
function TypewriterText({ text, delay = 0, className = "" }: { text: string, delay?: number, className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  const sentence = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { 
        delayChildren: delay,
        staggerChildren: 0.03
      }
    }
  };

  const letter = {
    hidden: { opacity: 0, display: 'none' },
    visible: { opacity: 1, display: 'inline' }
  };

  return (
    <motion.div ref={ref} variants={sentence} initial="hidden" animate={isInView ? "visible" : "hidden"} className={className}>
      {text.split("").map((char, index) => (
        <motion.span key={index} variants={letter}>
          {char}
        </motion.span>
      ))}
      <motion.span 
        animate={{ opacity: [0, 1, 0] }} 
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-2 h-4 bg-primary ml-1 align-middle"
      />
    </motion.div>
  );
}

// --- Main Modal ---
interface ManifestoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManifestoModal({ isOpen, onClose }: ManifestoModalProps) {
  const { currentTheme } = useThemeStore();
  const { primary, accent } = currentTheme.colors;
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Only track scroll when modal is open and ref is mounted
  const { scrollYProgress } = useScroll({
    target: isOpen ? containerRef : undefined
  });

  const scanlineY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  
  // Only render the scanline when modal is actually open AND ref is attached
  const shouldRenderScanline = isOpen && containerRef.current !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-void-black/95 backdrop-blur-xl"
        >
          {/* CRT/Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none z-[10000] opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
          {shouldRenderScanline && (
            <motion.div 
              className="absolute left-0 w-full h-1 bg-white/10 z-[10000] pointer-events-none blur-sm"
              style={{ top: scanlineY }}
            />
          )}

          {/* Close Button (Fixed) */}
          <button
            onClick={onClose}
            className="fixed top-6 right-6 z-[10001] w-12 h-12 flex items-center justify-center border border-white/20 bg-black hover:bg-white/10 transition-colors group"
          >
            <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>

          {/* Progress Bar (Fixed) */}
          <motion.div 
            className="fixed top-0 left-0 h-1 z-[10001]"
            style={{ 
              width: '100%',
              scaleX: scrollYProgress,
              transformOrigin: '0%',
              background: `linear-gradient(90deg, ${primary}, ${accent})`
            }}
          />

          {/* SCROLL CONTAINER */}
          <div 
            ref={containerRef}
            className="w-full h-full overflow-y-auto overflow-x-hidden scrollbar-none"
            onClick={(e) => e.target === containerRef.current && onClose()}
          >
            <div className="max-w-4xl mx-auto py-32 px-6">
              
              {/* HEADER: BOOT SEQUENCE */}
              <div className="mb-32 border-b border-white/10 pb-12">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-6 font-mono text-xs text-primary/70"
                >
                  <Terminal className="w-4 h-4" />
                  <span>EXECUTING: MANIFESTO_PROTOCOL.v365</span>
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8">
                  <span className="block text-white mix-blend-difference">Reality Is</span>
                  <span className="block" style={{ color: primary }}>A Construct.</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Rewrite It.</span>
                </h1>

                <p className="text-xl md:text-2xl font-mono text-light-cream/60 max-w-2xl leading-relaxed">
                  <span className="text-accent">&gt;_</span> You are running on outdated firmware. The world demands perfection, but perfection is a glitch.
                </p>
              </div>

              {/* SECTION 1: THE OS METAPHOR */}
              <section className="mb-40 grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 relative">
                  <div className="absolute inset-0 bg-primary/20 blur-[100px] opacity-20" />
                  <div className="relative border border-white/10 bg-white/5 p-8 font-mono text-sm leading-loose text-light-cream/80">
                    <p className="mb-4 text-white/30">// SYSTEM_LOG: DAY_001</p>
                    <TypewriterText 
                      text="Most artists wait for the perfect signal. I am broadcasting the noise. This is not just an album. It is a real-time operating system update for the human experience."
                      className="mb-4"
                    />
                    <TypewriterText 
                      text="365 Patches. 365 Vulnerabilities exposed. 365 Days of raw input/output."
                      delay={3}
                      className="text-primary"
                    />
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <h2 className="text-4xl font-bold mb-6">
                    <GlitchText text="THE NEW OS" />
                  </h2>
                  <p className="text-light-cream/60 text-lg">
                    We process Light and Dark like binary code. 
                    <br/><br/>
                    <strong className="text-white">Light (1)</strong>: clarity, impulse, manic creation.
                    <br/>
                    <strong className="text-white">Dark (0)</strong>: doubt, shadow, the void between notes.
                    <br/><br/>
                    You need both to compile the source code of a life worth living.
                  </p>
                </div>
              </section>

              {/* SECTION 2: THE PROTOCOL (Mission) */}
              <section className="mb-40 relative">
                <div className="absolute top-0 right-0 p-4 border border-accent/30 text-accent font-mono text-xs">
                  SECURE_CONNECTION
                </div>
                
                <h3 className="text-sm font-mono text-light-cream/30 tracking-[0.5em] uppercase mb-12 text-center">
                  // THE_PROTOCOL
                </h3>

                <div className="grid gap-6">
                  {[
                    { title: "NO BUFFERS", desc: "No holding back songs for 'later'. If it's made today, it exists today." },
                    { title: "ERROR TOLERANCE", desc: "Flaws are not bugs. They are features of the human condition." },
                    { title: "DAILY COMPILATION", desc: "Consistency overrides inspiration. The algorithm must be fed." },
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                      className="group flex items-center gap-8 p-8 border-l-2 border-white/10 hover:border-primary bg-gradient-to-r from-transparent to-white/[0.02] transition-colors"
                    >
                      <span className="text-6xl font-black text-white/5 group-hover:text-primary/20 transition-colors">
                        0{i+1}
                      </span>
                      <div>
                        <h4 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h4>
                        <p className="font-mono text-sm text-light-cream/60">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* SECTION 3: UPGRADE HARDWARE (Support) */}
              <section className="mb-32">
                 <div className="bg-void-black border border-white/10 relative overflow-hidden">
                    {/* Background Grid */}
                    <div 
                      className="absolute inset-0 opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: `linear-gradient(${primary} 1px, transparent 1px), linear-gradient(90deg, ${primary} 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                      }}
                    />

                    <div className="p-12 md:p-16 relative z-10 text-center">
                       <Cpu className="w-16 h-16 mx-auto mb-8 text-primary animate-pulse" />
                       <h2 className="text-4xl md:text-5xl font-black mb-6">UPGRADE YOUR REALITY</h2>
                       <p className="text-xl text-light-cream/70 max-w-2xl mx-auto mb-12">
                         This project consumes massive processing power. Studio time, production assets, and existence costs.
                         <br/>
                         <span className="text-accent">Become a kernel-level supporter.</span>
                       </p>

                       <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                          <a 
                            href="https://ko-fi.com" 
                            target="_blank"
                            className="group p-6 border border-white/20 hover:border-accent hover:bg-accent/10 transition-all text-left"
                          >
                            <div className="flex justify-between mb-4">
                              <Zap className="w-6 h-6 text-accent" />
                              <span className="font-mono text-xs opacity-50">INPUT_STREAM</span>
                            </div>
                            <h4 className="text-xl font-bold mb-2">Fund the Loop</h4>
                            <p className="text-sm opacity-60 mb-4">Keep the daily cycle running. Buy the system a coffee.</p>
                            <div className="flex items-center gap-2 text-accent font-bold text-sm">
                              INITIATE <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </a>

                          <a 
                            href="https://gumroad.com" 
                            target="_blank"
                            className="group p-6 border border-white/20 hover:border-primary hover:bg-primary/10 transition-all text-left"
                          >
                            <div className="flex justify-between mb-4">
                              <Lock className="w-6 h-6 text-primary" />
                              <span className="font-mono text-xs opacity-50">ROOT_ACCESS</span>
                            </div>
                            <h4 className="text-xl font-bold mb-2">Unlock the Archives</h4>
                            <p className="text-sm opacity-60 mb-4">Get raw files, stems, and forbidden cuts.</p>
                            <div className="flex items-center gap-2 text-primary font-bold text-sm">
                              DECRYPT <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </a>
                       </div>
                    </div>
                 </div>
              </section>

              {/* FOOTER */}
              <div className="text-center opacity-40 font-mono text-xs pb-12">
                <Fingerprint className="w-8 h-8 mx-auto mb-4" />
                <p>SYSTEM_ID: TH3SCR1B3</p>
                <p>STATUS: ONLINE</p>
                <p className="mt-4">END_OF_FILE</p>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}