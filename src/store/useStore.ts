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

export const useStore = create<AppState>((set, get) => ({
  data: null,
  loading: true,
  error: null,
  currentDay: 0,
  selectedRelease: null,

  fetchData: async () => {
    try {
      set({ loading: true, error: null });
      
      console.log('[Store] Fetching data from Supabase...');
      
      // Fetch directly from Supabase
      const data = await buildReleaseData();
      
      console.log('[Store] Received data:', { 
        releases: data.releases?.length || 0,
        project: data.project?.title
      });
      
      if (!data.releases || data.releases.length === 0) {
        console.log('[Store] No releases from Supabase, trying fallback...');
        // Fallback to static JSON if Supabase fails
        const response = await fetch('/releases.json');
        if (response.ok) {
          const fallbackData: ReleaseData = await response.json();
          console.log('[Store] Fallback data:', fallbackData.releases?.length || 0);
          set({ data: fallbackData, loading: false });
          get().calculateCurrentDay();
          return;
        }
      }
      
      set({ data, loading: false });
      get().calculateCurrentDay();
    } catch (error) {
      console.error('Error fetching data:', error);
      // Try fallback to static JSON
      try {
        const response = await fetch('/releases.json');
        if (response.ok) {
          const fallbackData: ReleaseData = await response.json();
          set({ data: fallbackData, loading: false });
          get().calculateCurrentDay();
          return;
        }
      } catch {
        // Ignore fallback error
      }
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
    
    const startDate = new Date(data.project.startDate);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If before start date or day 0, show Day 1
    // Clamp between 1 and 365
    const currentDay = Math.max(1, Math.min(diffDays, 365));
    set({ currentDay });
  },
}));
