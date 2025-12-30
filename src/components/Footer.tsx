import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { GlitchText } from './GlitchText';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const handleNavClick = (section: string) => {
    if (section === 'manifesto') {
      window.dispatchEvent(new CustomEvent('openManifesto'));
    } else if (section === 'releases') {
      window.dispatchEvent(new CustomEvent('openReleases'));
    } else if (section === 'connect') {
      window.dispatchEvent(new CustomEvent('openConnect'));
    } else {
      navigate('/');
    }
  };

  return (
    <footer className="relative py-16 px-6 md:px-12 lg:px-16 border-t border-void-lighter overflow-hidden">
      {/* Glitch lines decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-neon-red to-transparent"
            style={{
              top: `${20 + i * 15}%`,
              left: 0,
              right: 0,
            }}
            animate={{
              opacity: [0, 0.3, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          />
        ))}
      </div>

      <div className="w-full relative z-10">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <GlitchText
              text="th3scr1b3"
              className="text-3xl font-bold gradient-text mb-4"
              glitchIntensity="low"
            />
            <p className="text-light-cream/50 text-sm leading-relaxed">
              365 days of light and dark. A musical journey through the full spectrum
              of human emotion, one song at a time.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-neon-yellow font-mono text-sm tracking-wider mb-4">
              // NAVIGATION
            </h4>
            <ul className="space-y-2">
              {!isHomePage ? (
                <>
                  <motion.li>
                    <button
                      onClick={() => handleNavClick('home')}
                      className="text-light-cream/50 hover:text-neon-yellow transition-colors inline-flex items-center gap-2 group cursor-pointer bg-none border-none"
                    >
                      <span className="text-neon-red font-mono text-xs">01</span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        Home
                      </span>
                    </button>
                  </motion.li>
                  <motion.li>
                    <button
                      onClick={() => handleNavClick('manifesto')}
                      className="text-light-cream/50 hover:text-neon-yellow transition-colors inline-flex items-center gap-2 group cursor-pointer bg-none border-none"
                    >
                      <span className="text-neon-red font-mono text-xs">02</span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        Manifesto
                      </span>
                    </button>
                  </motion.li>
                  <motion.li>
                    <button
                      onClick={() => handleNavClick('connect')}
                      className="text-light-cream/50 hover:text-neon-yellow transition-colors inline-flex items-center gap-2 group cursor-pointer bg-none border-none"
                    >
                      <span className="text-neon-red font-mono text-xs">03</span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        Connect
                      </span>
                    </button>
                  </motion.li>
                </>
              ) : (
                [
                  { label: 'Journey', href: '#tracker' },
                  { label: 'Manifesto', href: '#manifesto', isModal: true },
                  { label: 'Releases', href: '#releases', isModal: true },
                  { label: 'Connect', href: '#connect', isModal: true },
                ].map((item, i) => (
                  <motion.li key={item.label}>
                    {item.isModal ? (
                      <button
                        onClick={() => handleNavClick(item.label.toLowerCase())}
                        className="text-light-cream/50 hover:text-neon-yellow transition-colors inline-flex items-center gap-2 group cursor-pointer bg-none border-none"
                      >
                        <span className="text-neon-red font-mono text-xs">0{i + 1}</span>
                        <span className="group-hover:translate-x-1 transition-transform">
                          {item.label}
                        </span>
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        className="text-light-cream/50 hover:text-neon-yellow transition-colors inline-flex items-center gap-2 group"
                      >
                        <span className="text-neon-red font-mono text-xs">0{i + 1}</span>
                        <span className="group-hover:translate-x-1 transition-transform">
                          {item.label}
                        </span>
                      </a>
                    )}
                  </motion.li>
                ))
              )}
            </ul>
          </div>

          {/* Platforms */}
          <div>
            <h4 className="text-neon-yellow font-mono text-sm tracking-wider mb-4">
              // LISTEN ON
            </h4>
            <div className="flex flex-wrap gap-3">
              {['YouTube', 'Audius', 'Spotify'].map((platform) => (
                <motion.a
                  key={platform}
                  href="#"
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="px-3 py-1 bg-void-lighter text-light-cream/70 text-sm hover:bg-neon-red-matte hover:text-void-black transition-all"
                >
                  {platform}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-void-lighter flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-light-cream/30 text-sm font-mono">
            © {currentYear} th3scr1b3. All rights reserved.
          </p>

          {/* Artistic element - audio visualizer */}
          <div className="flex items-end gap-1 h-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-neon-red to-neon-yellow"
                animate={{
                  height: [
                    `${20 + Math.random() * 30}%`,
                    `${50 + Math.random() * 50}%`,
                    `${20 + Math.random() * 30}%`,
                  ],
                }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>

          <p className="text-light-cream/30 text-sm font-mono">
            <span className="text-neon-red">♪</span> New music daily
          </p>
        </div>

        {/* Large decorative text - barely visible, ghostly */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
          <motion.p
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="text-[150px] font-bold whitespace-nowrap leading-none mix-blend-overlay"
            style={{
              color: 'var(--color-neon-red)',
              opacity: 0.15,
            }}
          >
            365 DAYS OF LIGHT AND DARK • 365 DAYS OF LIGHT AND DARK •
          </motion.p>
        </div>
      </div>
    </footer>
  );
}
