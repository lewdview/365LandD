import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/useThemeStore';
import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import { GlowingOrbs, RisingParticles } from './FloatingParticles';
import { useStore } from '../store/useStore';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const socialIcons: Record<string, { icon: string; label: string; color: string }> = {
  youtube: { icon: '▶', label: 'YouTube', color: '#ff0000' },
  audius: { icon: '◉', label: 'Audius', color: '#cc0fe0' },
  instagram: { icon: '◫', label: 'Instagram', color: '#e4405f' },
  twitter: { icon: '𝕏', label: 'X / Twitter', color: '#ffffff' },
  tiktok: { icon: '♪', label: 'TikTok', color: '#00f2ea' },
  spotify: { icon: '●', label: 'Spotify', color: '#1db954' },
};

export function ConnectModal({ isOpen, onClose }: ConnectModalProps) {
  const { currentTheme } = useThemeStore();
  const { data } = useStore();
  const { primary, accent, background } = currentTheme.colors;
  const containerRef = useRef<HTMLDivElement>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [newsEmail, setNewsEmail] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const socials = data?.socials;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle contact form submission
    console.log('Contact form:', { email, message });
    setSubmitStatus('success');
    // Reset form
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitStatus('idle'), 3000);
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail.trim()) return;

    setSubmitStatus('loading');
    try {
      const response = await fetch(
        'https://pznmptudgicrmljjafex.supabase.co/functions/v1/subscribe',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: newsEmail }),
        }
      );

      if (response.ok) {
        setSubmitStatus('success');
        setNewsEmail('');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      } else {
        setSubmitStatus('error');
        setTimeout(() => setSubmitStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-void-black/98 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ delay: 0.2 }}
            onClick={onClose}
            className="fixed top-6 right-6 z-[10000] w-12 h-12 flex items-center justify-center rounded-full transition-colors"
            style={{ 
              background: `${primary}30`,
              border: `2px solid ${primary}`,
            }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-6 h-6" style={{ color: primary }} />
          </motion.button>

          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl mx-auto py-16 px-4 md:px-8"
          >
            {/* Particle effects */}
            <GlowingOrbs count={4} />
            <RisingParticles count={10} />

            {/* Top accent line */}
            <motion.div 
              className="absolute top-0 left-0 w-full h-2"
              style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />

            {/* Main content */}
            <div className="relative z-10">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-5xl md:text-7xl font-black mb-4">
                  <span style={{ color: accent }}>STAY</span>
                  <span className="text-light-cream mx-4">CONNECTED</span>
                </h2>
                <p className="text-light-cream/60 text-lg md:text-xl">
                  Get in touch. Share your story. Be part of the journey.
                </p>
              </motion.div>

              {/* Grid layout */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                {/* Contact Form */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="p-8"
                  style={{
                    background: 'linear-gradient(135deg, rgba(45,48,72,0.6) 0%, rgba(26,28,46,0.8) 100%)',
                    borderLeft: `4px solid ${primary}`,
                  }}
                >
                  <h3 className="text-2xl font-bold text-light-cream mb-6">Send a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-mono text-light-cream/60 mb-2">EMAIL</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-void-lighter border border-void-lighter text-light-cream placeholder-light-cream/30 focus:border-current outline-none transition-colors"
                        placeholder="your@email.com"
                        style={{ borderColor: primary }}
                        onFocus={(e) => (e.target.style.borderColor = primary)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-mono text-light-cream/60 mb-2">MESSAGE</label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={6}
                        className="w-full px-4 py-3 bg-void-lighter border border-void-lighter text-light-cream placeholder-light-cream/30 focus:border-current outline-none transition-colors resize-none"
                        placeholder="Tell me what's on your mind..."
                        style={{ borderColor: primary }}
                        onFocus={(e) => (e.target.style.borderColor = primary)}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider transition-all"
                      style={{
                        background: `${primary}30`,
                        color: primary,
                        border: `2px solid ${primary}`,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = `${primary}50`)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = `${primary}30`)}
                    >
                      Send Message →
                    </motion.button>
                  </form>
                </motion.div>

                {/* Social & Info */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Email Contact */}
                  <div
                    className="p-6"
                    style={{
                      background: 'linear-gradient(135deg, rgba(45,48,72,0.4) 0%, rgba(26,28,46,0.6) 100%)',
                      borderLeft: `4px solid ${accent}`,
                    }}
                  >
                    <h4 className="text-lg font-bold text-light-cream mb-2">Direct Email</h4>
                    <a
                      href="mailto:hello@th3scr1b3.art"
                      className="text-light-cream/60 hover:text-accent transition-colors break-all"
                      style={{ color: accent }}
                    >
                      hello@th3scr1b3.art
                    </a>
                  </div>

                  {/* Social Links */}
                  <div>
                    <h4 className="text-lg font-bold text-light-cream mb-4">Connect On Social</h4>
                    <div className="space-y-2">
                      {socials && Object.entries(socials).map(([platform, url], index) => {
                        const iconData = socialIcons[platform] || { icon: '●', label: platform, color: '#fff' };
                        return (
                          <motion.a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 + (index * 0.05) }}
                            className="group flex items-center gap-3 p-3 transition-all"
                            style={{
                              background: 'rgba(255,255,255,0.03)',
                              border: `1px solid ${iconData.color}30`,
                            }}
                            whileHover={{
                              background: `${iconData.color}20`,
                              x: 5,
                            }}
                          >
                            <span className="text-2xl" style={{ color: iconData.color }}>
                              {iconData.icon}
                            </span>
                            <span className="flex-1 text-light-cream/80 group-hover:text-light-cream transition-colors">
                              {iconData.label}
                            </span>
                            <span className="text-light-cream/30 group-hover:text-light-cream/60 transition-colors">
                              →
                            </span>
                          </motion.a>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Newsletter signup */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="p-8 text-center"
                style={{
                  background: `linear-gradient(135deg, ${primary}20 0%, transparent 100%)`,
                  borderTop: `1px solid ${primary}50`,
                  borderBottom: `1px solid ${primary}50`,
                }}
              >
                <h3 className="text-2xl font-bold text-light-cream mb-3">Get Updates</h3>
                <p className="text-light-cream/60 mb-6">
                  Subscribe to get notified when new releases drop.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    value={newsEmail}
                    onChange={(e) => setNewsEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={submitStatus === 'loading'}
                    className="flex-1 px-4 py-3 bg-void-lighter border border-void-lighter text-light-cream placeholder-light-cream/30 focus:border-current outline-none transition-colors font-mono disabled:opacity-50"
                  />
                  <motion.button
                    whileHover={{ scale: submitStatus === 'loading' ? 1 : 1.05 }}
                    whileTap={{ scale: submitStatus === 'loading' ? 1 : 0.95 }}
                    type="submit"
                    disabled={submitStatus === 'loading'}
                    className="px-6 py-3 font-mono font-bold uppercase tracking-wider disabled:opacity-50"
                    style={{
                      background: submitStatus === 'success' ? '#10b981' : submitStatus === 'error' ? '#ef4444' : accent,
                      color: background,
                    }}
                  >
                    {submitStatus === 'loading' ? 'Sending...' : submitStatus === 'success' ? 'Subscribed!' : submitStatus === 'error' ? 'Try Again' : 'Subscribe'}
                  </motion.button>
                </form>
              </motion.div>
            </div>

            {/* Bottom accent line */}
            <motion.div 
              className="absolute bottom-0 left-0 w-full h-1"
              style={{ background: `linear-gradient(90deg, ${accent}, ${primary})` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
