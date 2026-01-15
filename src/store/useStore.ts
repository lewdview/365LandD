import { create } from 'zustand';
import type { ReleaseData, Release } from '../types';
import { getReleases } from '../services/supabaseClient';

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

export const useStore = create<AppState>((set, get) => ({
  data: null,
  loading: true,
  error: null,
  currentDay: 0,
  selectedRelease: null,

  fetchData: async () => {
    try {
      set({ loading: true, error: null });
      const releases = await getReleases();

      const releaseData: ReleaseData = {
        project: {
          title: '365 Days of Light and Dark: Poetry in Motion',
          artist: 'th3scr1b3',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          description: 'One poetic entry a day. 365 days. One year of sonic exploration through the spectrum of light and dark.',
          totalDays: 365,
        },
        socials: {
          youtube: 'https://youtube.com/@th3scr1b3',
          audius: 'https://audius.co/th3scr1b3',
          instagram: 'https://instagram.com/th3scr1b3',
          twitter: 'https://twitter.com/th3scr1b3',
          tiktok: 'https://tiktok.com/@th3scr1b3',
          spotify: 'https://open.spotify.com/artist/th3scr1b3',
        },
        releases,
        stats: {
          totalReleases: releases.length,
          lightTracks: releases.filter(r => r.mood === 'light').length,
          darkTracks: releases.filter(r => r.mood === 'dark').length,
          totalListens: 0,
          lastUpdated: new Date().toISOString(),
        },
        announcements: [],
        upcomingMilestones: [],
        monthThemes: [],
      };

      set({ data: releaseData, loading: false });
      get().calculateCurrentDay();
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

    const localStart = new Date(`${data.project.startDate}T00:00:00`);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const elapsedDays = Math.floor((now.getTime() - localStart.getTime()) / msPerDay);
    const dayNumber = elapsedDays + 1;

    const currentDay = Math.max(1, Math.min(dayNumber, 365));
    set({ currentDay });
  },
}));
