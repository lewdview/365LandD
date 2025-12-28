import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Check } from 'lucide-react';
import { useThemeStore, themes, type Theme } from '../store/useThemeStore';

function ThemeSwatch({ theme, isSelected, onClick }: { 
  theme: Theme; 
  isSelected: boolean; 
  onClick: () => void;
}) {
  const colors = Object.values(theme.colors);
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full p-3 rounded-lg transition-all ${
        isSelected 
          ? 'ring-2 ring-offset-2' 
          : 'hover:bg-white/5'
      }`}
      style={{ 
        // @ts-ignore - ringColor works but isn't in MotionStyle type
        '--tw-ring-color': isSelected ? theme.colors.accent : 'transparent',
        '--tw-ring-offset-color': theme.colors.background,
        background: isSelected ? `${theme.colors.primary}20` : 'transparent',
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-3">
        {/* 5 color segment */}
        <div className="flex rounded-md overflow-hidden shadow-lg">
          {colors.map((color, i) => (
            <div
              key={i}
              className="w-6 h-8 first:rounded-l-md last:rounded-r-md"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        
        {/* Theme name */}
        <span 
          className="text-sm font-medium flex-1 text-left"
          style={{ 
            color: theme.colors.text,
            textShadow: `
              -1px -1px 0 ${theme.colors.background},
              1px -1px 0 ${theme.colors.background},
              -1px 1px 0 ${theme.colors.background},
              1px 1px 0 ${theme.colors.background},
              0 0 4px ${theme.colors.background}
            `,
          }}
        >
          {theme.name}
        </span>
        
        {/* Selected indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.colors.accent }}
          >
            <Check className="w-3 h-3" style={{ color: theme.colors.background }} />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

export function ThemeChanger() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, setTheme } = useThemeStore();

  return (
    <>
      {/* Floating toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 right-4 md:bottom-24 md:right-6 z-[9998] w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.primary}dd, ${currentTheme.colors.secondary}dd)`,
          backdropFilter: 'blur(10px)',
          boxShadow: `0 8px 32px ${currentTheme.colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2), 0 0 20px ${currentTheme.colors.primary}30`,
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <Palette className="w-4 h-4 md:w-5 md:h-5" style={{ color: currentTheme.colors.text }} />
      </motion.button>

      {/* Theme panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            />
            
            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:left-auto z-[9999] w-full md:w-72 rounded-t-xl md:rounded-xl overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${currentTheme.colors.background}ee, ${currentTheme.colors.background}f5)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid rgba(255,255,255,0.1)`,
                boxShadow: `0 25px 50px rgba(0,0,0,0.5), 0 0 40px ${currentTheme.colors.primary}20, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
            >
              {/* Header */}
              <div 
                className="px-4 py-3 flex items-center justify-between"
                style={{
                  background: `linear-gradient(90deg, ${currentTheme.colors.primary}20, transparent)`,
                  borderBottom: `1px solid ${currentTheme.colors.primary}30`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" style={{ color: currentTheme.colors.accent }} />
                  <span 
                    className="font-mono text-xs uppercase tracking-wider"
                    style={{ color: currentTheme.colors.text }}
                  >
                    Theme
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" style={{ color: currentTheme.colors.text }} />
                </button>
              </div>

              {/* Theme list */}
              <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                {themes.map((theme) => (
                  <ThemeSwatch
                    key={theme.id}
                    theme={theme}
                    isSelected={currentTheme.id === theme.id}
                    onClick={() => {
                      setTheme(theme.id);
                    }}
                  />
                ))}
              </div>

              {/* Footer */}
              <div 
                className="px-4 py-2 text-center"
                style={{
                  borderTop: `1px solid ${currentTheme.colors.primary}20`,
                }}
              >
                <span 
                  className="text-xs font-mono opacity-50"
                  style={{ color: currentTheme.colors.text }}
                >
                  {themes.length} THEMES AVAILABLE
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
