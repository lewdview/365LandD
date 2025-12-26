import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hero } from '../components/Hero';
import { DayTracker } from '../components/DayTracker';
import { MonthThemes } from '../components/MonthThemes';
import { SocialLinks } from '../components/SocialLinks';
import { Footer } from '../components/Footer';
import { Navigation } from '../components/Navigation';
import { ThemeChanger } from '../components/ThemeChanger';
import { CursorEffect } from '../components/CursorEffect';
import { ManifestoModal } from '../components/ManifestoModal';
import { ReleasesModal } from '../components/ReleasesModal';
import { useThemeStore } from '../store/useThemeStore';
import { useStore } from '../store/useStore';
import { FileText, Music, ChevronRight } from 'lucide-react';

export function HomePage() {
  const [showManifesto, setShowManifesto] = useState(false);
  const [showReleases, setShowReleases] = useState(false);
  const { currentTheme } = useThemeStore();
  const { data } = useStore();
  const { primary, accent } = currentTheme.colors;

  // Listen for navigation events to open modals
  useEffect(() => {
    const handleOpenManifesto = () => setShowManifesto(true);
    const handleOpenReleases = () => setShowReleases(true);
    
    window.addEventListener('openManifesto', handleOpenManifesto);
    window.addEventListener('openReleases', handleOpenReleases);
    
    return () => {
      window.removeEventListener('openManifesto', handleOpenManifesto);
      window.removeEventListener('openReleases', handleOpenReleases);
    };
  }, []);

  return (
    <div className="min-h-screen bg-void-black text-light-cream noise-overlay">
      {/* Custom cursor effect */}
      <CursorEffect />

      {/* Theme changer */}
      <ThemeChanger />

      {/* Navigation */}
      <Navigation />

      {/* Main content */}
      <main>
        {/* Hero section with 3D visualization */}
        <Hero />
        
        {/* Day progress tracker */}
        <DayTracker />

        {/* Quick access buttons - Manifesto & Releases */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Manifesto Button */}
              <motion.button
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowManifesto(true)}
                className="group relative p-8 text-left overflow-hidden transition-all"
                style={{
                  background: `linear-gradient(135deg, ${primary}15 0%, transparent 100%)`,
                  border: `2px solid ${primary}40`,
                }}
              >
                {/* Glow effect */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `radial-gradient(circle at center, ${primary}20, transparent 70%)` }}
                />
                
                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 opacity-50" style={{ borderColor: primary }} />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 opacity-50" style={{ borderColor: primary }} />
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${primary}30` }}
                    >
                      <FileText className="w-6 h-6" style={{ color: primary }} />
                    </div>
                    <span className="text-xs font-mono tracking-[0.3em] uppercase" style={{ color: primary }}>Read</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black mb-2" style={{ color: primary }}>THE MANIFESTO</h3>
                  <p className="text-light-cream/50 text-sm mb-4">365 days. Raw truth. The mission behind the music.</p>
                  
                  <div className="flex items-center gap-2 font-mono text-sm transition-all group-hover:gap-4" style={{ color: primary }}>
                    <span>EXPLORE</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>

              {/* Releases Button */}
              <motion.button
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowReleases(true)}
                className="group relative p-8 text-left overflow-hidden transition-all"
                style={{
                  background: `linear-gradient(135deg, ${accent}15 0%, transparent 100%)`,
                  border: `2px solid ${accent}40`,
                }}
              >
                {/* Glow effect */}
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `radial-gradient(circle at center, ${accent}20, transparent 70%)` }}
                />
                
                {/* Corner accent */}
                <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 opacity-50" style={{ borderColor: accent }} />
                <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 opacity-50" style={{ borderColor: accent }} />
                
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${accent}30` }}
                    >
                      <Music className="w-6 h-6" style={{ color: accent }} />
                    </div>
                    <span className="text-xs font-mono tracking-[0.3em] uppercase" style={{ color: accent }}>Browse</span>
                  </div>
                  
                  <h3 className="text-2xl md:text-3xl font-black mb-2" style={{ color: accent }}>ALL RELEASES</h3>
                  <p className="text-light-cream/50 text-sm mb-4">
                    {data?.stats.totalReleases || 0} tracks released • {365 - (data?.stats.totalReleases || 0)} to go
                  </p>
                  
                  <div className="flex items-center gap-2 font-mono text-sm transition-all group-hover:gap-4" style={{ color: accent }}>
                    <span>VIEW ALL</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            </div>
          </div>
        </section>

        {/* Month themes arc timeline */}
        <MonthThemes />

        {/* Social links */}
        <SocialLinks />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ManifestoModal isOpen={showManifesto} onClose={() => setShowManifesto(false)} />
      <ReleasesModal isOpen={showReleases} onClose={() => setShowReleases(false)} />
    </div>
  );
}
