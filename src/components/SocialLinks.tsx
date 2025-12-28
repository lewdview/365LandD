import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const socialIcons: Record<string, { icon: string; label: string; color: string }> = {
  youtube: { icon: '▶', label: 'YouTube', color: '#ff0000' },
  audius: { icon: '◉', label: 'Audius', color: '#cc0fe0' },
  instagram: { icon: '◫', label: 'Instagram', color: '#e4405f' },
  twitter: { icon: '𝕏', label: 'X / Twitter', color: '#ffffff' },
  tiktok: { icon: '♪', label: 'TikTok', color: '#00f2ea' },
  spotify: { icon: '●', label: 'Spotify', color: '#1db954' },
};

export function SocialLinks() {
  const { data } = useStore();
  const socials = data?.socials;

  if (!socials) return null;

  const socialEntries = Object.entries(socials);

  return (
    <section id="connect" className="py-24 px-6 md:px-12 lg:px-16 relative overflow-hidden">
      <div className="w-full">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-mono tracking-[0.3em] uppercase mb-4 block text-neon-yellow">
            Stay Connected
          </span>
          <h2 className="text-4xl md:text-6xl font-bold">
            <span className="gradient-text">CONNECT</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-neon-red to-neon-yellow mt-4 mx-auto" />
          <p className="text-light-cream/50 mt-6 max-w-xl mx-auto">
            Follow the journey across all platforms. New music drops daily.
          </p>
        </motion.div>

        {/* Social grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {socialEntries.map(([platform, url], index) => (
            <SocialCard
              key={platform}
              platform={platform}
              url={url}
              index={index}
            />
          ))}
        </div>

        {/* Newsletter signup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 p-8 bg-void-gray/50 matte-border text-center"
        >
          <h3 className="text-2xl font-bold text-light-cream mb-2">Stay Updated</h3>
          <p className="text-light-cream/50 mb-6">Get notified for every release</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 bg-void-lighter border-2 border-void-lighter text-light-cream placeholder-light-cream/30 focus:border-neon-yellow outline-none transition-colors font-mono"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-neon-yellow text-void-black font-bold uppercase tracking-wider hover:bg-neon-yellow-dark transition-colors"
            >
              Subscribe
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Background decoration */}
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-radial from-neon-red/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}

function SocialCard({
  platform,
  url,
  index,
}: {
  platform: string;
  url: string;
  index: number;
}) {
  const { icon, label, color } = socialIcons[platform] || { icon: '●', label: platform, color: '#fff' };

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="group relative p-6 md:p-8 bg-void-gray/30 border-2 border-void-lighter hover:border-current transition-all duration-300 overflow-hidden"
      style={{ color }}
    >
      {/* Glow effect on hover */}
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
        style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
      />

      {/* Icon */}
      <motion.div
        className="text-5xl md:text-6xl mb-4 font-bold"
        whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        {icon}
      </motion.div>

      {/* Label */}
      <h3 className="text-lg md:text-xl font-bold text-light-cream group-hover:text-current transition-colors">
        {label}
      </h3>

      {/* Arrow indicator */}
      <motion.span
        className="absolute bottom-4 right-4 text-light-cream/30 group-hover:text-current transition-colors"
        initial={{ x: 0 }}
        whileHover={{ x: 5 }}
      >
        →
      </motion.span>

      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-l-[40px] border-t-current border-l-transparent opacity-0 group-hover:opacity-30 transition-opacity"
      />
    </motion.a>
  );
}
