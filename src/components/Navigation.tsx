import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Journey', href: '#tracker' },
  { label: 'Manifesto', href: '#manifesto', isModal: true },
  { label: 'Releases', href: '#releases', isModal: true },
  { label: 'Connect', href: '#connect' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-void-black/70 backdrop-blur-xl border-b border-neon-red/20 shadow-[0_4px_30px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.a
              href="#"
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              <span className="text-2xl md:text-3xl font-bold gradient-text">
                th3scr1b3
              </span>
              {/* Underline effect */}
              <motion.span
                className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-neon-red to-neon-yellow"
                initial={{ width: 0 }}
                whileHover={{ width: '100%' }}
                transition={{ duration: 0.3 }}
              />
            </motion.a>

            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <NavLink key={link.href} {...link} index={index} isModal={link.isModal} />
              ))}
              {/* CTA */}
              <motion.button
                onClick={() => window.dispatchEvent(new CustomEvent('openReleases'))}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-neon-red-matte text-void-black font-bold text-sm uppercase tracking-wider transition-all hover:bg-neon-red"
              >
                Listen Now
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-light-cream"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar />
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu
            links={navLinks}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({
  label,
  href,
  index,
  isModal,
  onClick,
}: {
  label: string;
  href: string;
  index: number;
  isModal?: boolean;
  onClick?: () => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (isModal) {
      e.preventDefault();
      // Dispatch custom event to open modal
      const eventName = href === '#manifesto' ? 'openManifesto' : 'openReleases';
      window.dispatchEvent(new CustomEvent(eventName));
      onClick?.();
    }
  };

  return (
    <motion.a
      href={isModal ? undefined : href}
      onClick={handleClick}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative group text-light-cream/70 hover:text-light-cream transition-colors font-mono text-sm uppercase tracking-wider cursor-pointer"
    >
      <span className="relative z-10">{label}</span>
      {/* Hover background */}
      <motion.span
        className="absolute inset-0 -z-10 bg-gradient-to-r from-neon-red/20 to-neon-yellow/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"
        style={{ padding: '4px 8px', margin: '-4px -8px' }}
      />
      {/* Number indicator */}
      <span className="absolute -top-2 -right-3 text-[10px] text-neon-yellow opacity-0 group-hover:opacity-100 transition-opacity">
        0{index + 1}
      </span>
    </motion.a>
  );
}

function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      setProgress(scrollPercent);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="h-0.5 bg-void-gray">
      <motion.div
        className="h-full bg-gradient-to-r from-neon-red via-neon-orange to-neon-yellow"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function MobileMenu({
  links,
  onClose,
}: {
  links: typeof navLinks;
  onClose: () => void;
}) {
  const handleLinkClick = (link: typeof navLinks[0]) => {
    if (link.isModal) {
      const eventName = link.href === '#manifesto' ? 'openManifesto' : 'openReleases';
      window.dispatchEvent(new CustomEvent(eventName));
    }
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-40 bg-void-black md:hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-40 h-40 bg-neon-red/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-40 h-40 bg-neon-yellow/10 rounded-full blur-3xl" />
      </div>

      <div className="relative h-full flex flex-col justify-center items-center gap-8 p-8">
        {links.map((link, index) => (
          <motion.a
            key={link.href}
            href={link.isModal ? undefined : link.href}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            onClick={() => handleLinkClick(link)}
            className="text-4xl font-bold text-light-cream hover:text-neon-yellow transition-colors cursor-pointer"
          >
            <span className="text-sm font-mono text-neon-red mr-4">0{index + 1}</span>
            {link.label}
          </motion.a>
        ))}

        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          onClick={() => {
            window.dispatchEvent(new CustomEvent('openReleases'));
            onClose();
          }}
          className="mt-8 px-8 py-4 bg-neon-red-matte text-void-black font-bold text-lg uppercase tracking-wider"
        >
          Listen Now
        </motion.button>
      </div>
    </motion.div>
  );
}
