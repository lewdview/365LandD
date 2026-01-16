import { create } from 'zustand';
import type { ReleaseData, Release } from '../types';
import { buildReleaseData } from '../services/supabase';

interface AppState {
  data: ReleaseData | null;
  loading: boolean;
  error: string | null;
  currentDay: number;
  selectedRelease: Release | null;
  
  // Actions
  fetchData: () => Promise<void>;
  setSelectedRelease: (release: Release | null) => void;
  calculateCurrentDay: () => void;
}

// Ensure this line starts with 'export const'
export const useStore = create<AppState>((set, get) => ({
  data: null,
  loading: true,
  error: null,
  currentDay: 0,
  selectedRelease: null,

  fetchData: async () => {
    try {
      set({ loading: true, error: null });

      // 1) Load manifest (defines audio + order from local 365-releases)
      let manifest: { items: Array<{ month: string; index: number; storageTitle: string; ext: string; audioPath: string }> } | null = null;
      try {
        const mres = await fetch('/release-manifest.json');
        if (mres.ok) {
          manifest = await mres.json();
          console.log('[Store] Loaded release-manifest with', manifest?.items?.length || 0, 'items');
        }
      } catch (e) {
        console.warn('[Store] Failed to load manifest:', e);
      }
      
      // 2) Remote analyzer metadata
      console.log('[Store] Fetching data from Supabase (remote)…');
      const supabaseData = await buildReleaseData();
      let dataToUse: ReleaseData | null = null;
      
      // LOGIC FIX: Always prioritize Manifest if available.
      if (manifest && manifest.items?.length) {
          // Manifest-first: build the releases in EXACT manifest order, enriching with analyzer data when possible
          const remoteReleases = supabaseData.releases || [];
          
      // AGGRESSIVE normalization: removes spaces, apostrophes, dashes, everything.
      // "We're" becomes "were", matching the manifest's "Were".
          const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          const byTitle = new Map(remoteReleases.map(r => [normalize(r.storageTitle || r.title), r]));
          const byFile = new Map(remoteReleases.map(r => {
            const fn = r.storedAudioUrl ? decodeURIComponent(r.storedAudioUrl.split('/').pop() || '') : '';
            const base = fn.replace(/\.(wav|mp3|m4a|flac)$/i, '');
            return [normalize(base), r];
          }));
          const offsets: Record<string, number> = { january:0,february:31,march:59,april:90,may:120,june:151,july:181,august:212,september:243,october:273,november:304,december:334 };

          const remapped = manifest.items.map((it) => {
            const keyTitle = normalize(it.storageTitle);
            const keyFile = normalize(String(it.index).padStart(2,'0') + ' - ' + it.storageTitle);
            const match = byFile.get(keyFile) || byTitle.get(keyTitle);
            const absDay = (offsets[it.month] ?? 0) + it.index;

            if (match) {
              const merged = {
                ...match,
                day: absDay,
                title: it.storageTitle,
                storageTitle: it.storageTitle,
                manifestAudioPath: it.audioPath,
              } as Release;
              
              if (match.lyrics || match.lyricsWords?.length) {
                console.log(`[Store] Day ${absDay} (${it.storageTitle}): matched analyzer with lyrics`);
              }
              
              return merged;
            }
            // Fallback minimal entry when analyzer hasn't produced metadata yet
            const startDate = new Date('2026-01-01');
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + absDay - 1);
            return {
              id: `${it.month}-${it.index}`,
              day: absDay,
              date: d.toISOString().split('T')[0],
              fileName: `${String(it.index).padStart(2,'0')} - ${it.storageTitle}.${it.ext}`,
              title: it.storageTitle,
              storageTitle: it.storageTitle,
              manifestAudioPath: it.audioPath,
              mood: 'light',
              description: '',
              duration: 0,
              durationFormatted: '0:00',
              tempo: 0,
              key: 'C major',
              energy: 0.5,
              valence: 0.5,
              genre: [],
              tags: [],
            } as Release;
          });

          dataToUse = { 
            ...supabaseData, 
            releases: remapped,
            stats: {
                ...supabaseData.stats,
                totalReleases: remapped.length
            }
          };
      } else if (supabaseData.releases && supabaseData.releases.length > 0) {
        // No manifest found, but we have remote data, so use that
        dataToUse = supabaseData;
      }
      
      if (dataToUse) {
        set({ data: dataToUse, loading: false });
        get().calculateCurrentDay();
        return;
      }
      
      console.log('[Store] Remote returned no data and no manifest, checking local preview…');
      let response = await fetch('/releases.local.json');
      if (!response.ok) {
        response = await fetch('/releases.json');
      }
      if (response.ok) {
        const data: ReleaseData = await response.json();
        console.log('[Store] Loaded local/static releases:', data.releases?.length || 0);
        set({ data, loading: false });
        get().calculateCurrentDay();
        return;
      }

      throw new Error('No data available from remote or local sources');
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        loading: false 
      });
    }
  },

  setSelectedRelease: (release) => set({ selectedRelease: release }),

  calculateCurrentDay: () => {
    const { data } = get();
    if (!data) return;

    // Interpret project.startDate as LOCAL midnight
    const localStart = new Date(`${data.project.startDate}T00:00:00`);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const elapsedDays = Math.floor((now.getTime() - localStart.getTime()) / msPerDay);
    const dayNumber = elapsedDays + 1;

    const currentDay = Math.max(1, Math.min(dayNumber, 365));
    set({ currentDay });
  },
}));