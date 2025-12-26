import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/useThemeStore';
import { X } from 'lucide-react';
import { ReleasesFeed } from './ReleasesFeed';
import { FloatingParticles } from './FloatingParticles';

interface ReleasesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReleasesModal({ isOpen, onClose }: ReleasesModalProps) {
  const { currentTheme } = useThemeStore();
  const { primary, accent } = currentTheme.colors;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] overflow-y-auto bg-void-black/98 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Particles */}
          <FloatingParticles count={20} />
          
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

          {/* Top accent line */}
          <motion.div 
            className="fixed top-0 left-0 w-full h-1 z-[10000]"
            style={{ background: `linear-gradient(90deg, ${primary}, ${accent})` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative min-h-screen"
          >
            {/* Render the full ReleasesFeed */}
            <ReleasesFeed />
          </motion.div>

          {/* Bottom accent line */}
          <motion.div 
            className="fixed bottom-0 left-0 w-full h-1 z-[10000]"
            style={{ background: `linear-gradient(90deg, ${accent}, ${primary})` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
