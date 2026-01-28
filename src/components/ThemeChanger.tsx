// type: uploaded file
// fileName: src/components/ThemeChanger.tsx

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore, themes } from '../store/useThemeStore';
import { Palette, Check, X } from 'lucide-react';

export function ThemeChanger() {
  const { currentTheme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
      className="w-5 h-5 rounded-full border shadow-sm" 
      style={{ backgroundColor: color, borderColor: 'rgba(255,255,255,0.1)' }} 
    />
  );

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 p-3 rounded-full shadow-2xl backdrop-blur-md border transition-all duration-300 group"
        style={{ 
          backgroundColor: hexToRgba(currentTheme.colors.background, 0.8), // Glass effect
          borderColor: currentTheme.colors.primary,
          boxShadow: `0 8px 32px ${hexToRgba(currentTheme.colors.primary, 0.3)}`
        }}
      >
        <Palette size={24} style={{ color: currentTheme.colors.primary }} />
        <span className="absolute left-full ml-3 px-2 py-1 rounded bg-black/80 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Change Theme
        </span>
      </motion.button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Transparent Backdrop to allow seeing through */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0"
              style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} // Very light dim
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl shadow-2xl border overflow-hidden"
              // Glassmorphism Styles
              style={{ 
                backgroundColor: hexToRgba(currentTheme.colors.background, 0.75), // 75% opacity
                backdropFilter: 'blur(20px)', // Strong blur
                borderColor: hexToRgba(currentTheme.colors.text, 0.1),
                color: currentTheme.colors.text,
                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5)`
              }}
            >
              {/* Header */}
              <div className="p-6 border-b shrink-0 flex flex-col gap-4" style={{ borderColor: hexToRgba(currentTheme.colors.text, 0.1) }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: hexToRgba(currentTheme.colors.primary, 0.1) }}>
                      <Palette className="w-6 h-6" style={{ color: currentTheme.colors.primary }} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold tracking-tight">System Appearance</h2>
                      <p className="text-xs opacity-60">Select a color protocol ({themes.length} available)</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Categories Tabs */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                        selectedCategory === cat 
                          ? 'opacity-100 shadow-lg' 
                          : 'opacity-50 hover:opacity-80 hover:border-white/20'
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
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredThemes.map((theme) => (
                    <motion.button
                      key={theme.id}
                      onClick={() => setTheme(theme.id)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group p-4 rounded-xl border text-left transition-all flex flex-col gap-3 overflow-hidden"
                      style={{ 
                        backgroundColor: hexToRgba(theme.colors.background, 0.8), // Slightly transparent card
                        borderColor: currentTheme.id === theme.id ? theme.colors.accent : hexToRgba(theme.colors.text, 0.1),
                        boxShadow: currentTheme.id === theme.id ? `0 0 0 2px ${theme.colors.accent}` : 'none'
                      }}
                    >
                      {/* Theme Preview Header */}
                      <div className="flex justify-between items-start z-10">
                        <div>
                          <h3 className="font-bold text-sm" style={{ color: theme.colors.text }}>{theme.name}</h3>
                          <span className="text-[10px] uppercase opacity-50 tracking-widest" style={{ color: theme.colors.text }}>
                            {theme.category || 'Vibrant'}
                          </span>
                        </div>
                        {currentTheme.id === theme.id && (
                          <div className="p-1 rounded-full bg-white text-black shadow-sm">
                            <Check size={12} strokeWidth={4} />
                          </div>
                        )}
                      </div>

                      {/* Swatches */}
                      <div className="flex items-center gap-2 z-10">
                        <ColorSwatch color={theme.colors.primary} />
                        <ColorSwatch color={theme.colors.secondary} />
                        <ColorSwatch color={theme.colors.accent} />
                        <div className="h-4 w-[1px] bg-white/10 mx-1" />
                        <ColorSwatch color={theme.colors.background} />
                        <ColorSwatch color={theme.colors.text} />
                      </div>

                      {/* Hover Gradient Overlay */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                        style={{ background: `linear-gradient(45deg, ${theme.colors.primary}, ${theme.colors.secondary})` }}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t text-center text-xs opacity-40 font-mono" style={{ borderColor: hexToRgba(currentTheme.colors.text, 0.1) }}>
                 {filteredThemes.length} PROTOCOLS FOUND
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}