import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore, themes } from '../store/useThemeStore';
import { useAudioStore } from '../store/useAudioStore';
import { Palette, Check, X } from 'lucide-react';

export function ThemeChanger() {
  const { currentTheme, setTheme } = useThemeStore();
  const { currentRelease } = useAudioStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Check if player is active to adjust position
  const isPlayerActive = !!currentRelease;

  function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(themes.map(t => t.category || 'Vibrant')))];

  const filteredThemes = selectedCategory === 'All' 
    ? themes 
    : themes.filter(t => (t.category || 'Vibrant') === selectedCategory);

  const ColorSwatch = ({ color }: { color: string }) => (
    <div 
      className="w-8 h-8 rounded-md border shadow-sm transition-transform hover:scale-110" 
      style={{ backgroundColor: color, borderColor: 'rgba(255,255,255,0.1)' }} 
    />
  );

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        layout
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed left-1/2 transform -translate-x-1/2 z-[9999] p-4 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-500 group"
        style={{ 
          // Dynamic Position: Shifts up when player is active
          bottom: isPlayerActive ? '5.5rem' : '1.5rem', 
          backgroundColor: hexToRgba(currentTheme.colors.background, 0.6),
          borderColor: currentTheme.colors.primary,
          boxShadow: `0 8px 32px ${hexToRgba(currentTheme.colors.primary, 0.3)}`
        }}
      >
        <Palette size={28} style={{ color: currentTheme.colors.primary }} />
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Transparent Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} 
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl h-[85vh] flex flex-col rounded-3xl shadow-2xl border overflow-hidden"
              style={{ 
                // Glassmorphism Styles
                backgroundColor: hexToRgba(currentTheme.colors.background, 0.45),
                backdropFilter: 'blur(40px)',
                borderColor: hexToRgba(currentTheme.colors.text, 0.1),
                color: currentTheme.colors.text,
                boxShadow: `0 40px 80px -20px rgba(0, 0, 0, 0.6)`
              }}
            >
              {/* Header */}
              <div className="p-8 border-b shrink-0 flex flex-col gap-6" style={{ borderColor: hexToRgba(currentTheme.colors.text, 0.1) }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl" style={{ backgroundColor: hexToRgba(currentTheme.colors.primary, 0.2) }}>
                      <Palette className="w-8 h-8" style={{ color: currentTheme.colors.primary }} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">THEME PROTOCOL</h2>
                      <p className="text-sm opacity-60 font-mono mt-1">
                        Select Interface • {themes.length} Presets Available
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-3 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Categories Tabs */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
                        selectedCategory === cat 
                          ? 'opacity-100 shadow-lg scale-105' 
                          : 'opacity-40 hover:opacity-80 hover:border-white/20'
                      }`}
                      style={{ 
                        backgroundColor: selectedCategory === cat ? currentTheme.colors.primary : 'transparent',
                        color: selectedCategory === cat ? currentTheme.colors.background : currentTheme.colors.text,
                        borderColor: selectedCategory === cat ? currentTheme.colors.primary : 'transparent'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Grid */}
              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredThemes.map((theme) => (
                    <motion.button
                      key={theme.id}
                      onClick={() => setTheme(theme.id)}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group p-5 rounded-2xl border text-left transition-all flex flex-col gap-4 overflow-hidden"
                      style={{ 
                        backgroundColor: hexToRgba(theme.colors.background, 0.2),
                        backdropFilter: 'blur(10px)',
                        borderColor: currentTheme.id === theme.id ? theme.colors.accent : hexToRgba(theme.colors.text, 0.05),
                        boxShadow: currentTheme.id === theme.id 
                          ? `0 0 0 2px ${theme.colors.accent}, 0 20px 40px -10px ${hexToRgba(theme.colors.primary, 0.3)}` 
                          : 'none'
                      }}
                    >
                      {/* Theme Preview Header */}
                      <div className="flex justify-between items-start z-10 w-full">
                        <div>
                          <h3 className="font-bold text-lg leading-tight" style={{ color: theme.colors.text }}>{theme.name}</h3>
                          <span className="text-[10px] uppercase opacity-50 tracking-widest font-mono" style={{ color: theme.colors.text }}>
                            {theme.category || 'Vibrant'}
                          </span>
                        </div>
                        {currentTheme.id === theme.id && (
                          <div className="p-1.5 rounded-full bg-white text-black shadow-lg">
                            <Check size={14} strokeWidth={4} />
                          </div>
                        )}
                      </div>

                      {/* Swatches */}
                      <div className="flex items-center gap-3 z-10 mt-2">
                        <ColorSwatch color={theme.colors.primary} />
                        <ColorSwatch color={theme.colors.secondary} />
                        <ColorSwatch color={theme.colors.accent} />
                        <div className="h-6 w-[1px] bg-white/10 mx-1" />
                        <ColorSwatch color={theme.colors.background} />
                        <ColorSwatch color={theme.colors.text} />
                      </div>

                      {/* Hover Gradient Overlay */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                        style={{ background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t text-center text-[10px] opacity-30 font-mono tracking-[0.2em]" style={{ borderColor: hexToRgba(currentTheme.colors.text, 0.1) }}>
                 SYSTEM V2.0 // {filteredThemes.length} PROTOCOLS ONLINE
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}