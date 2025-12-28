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
      
      console.log('[Store] Fetching data from releases.json...');
      
      // Use releases.json as primary source (contains curated 365-day track list)
      const response = await fetch('/releases.json');
      if (response.ok) {
        const data: ReleaseData = await response.json();
        console.log('[Store] Loaded releases:', data.releases?.length || 0);
        set({ data, loading: false });
        get().calculateCurrentDay();
        return;
      }
      
      // Fallback to Supabase if releases.json fails
      console.log('[Store] releases.json failed, trying Supabase...');
      const supabaseData = await buildReleaseData();
      
      if (supabaseData.releases && supabaseData.releases.length > 0) {
        set({ data: supabaseData, loading: false });
        get().calculateCurrentDay();
        return;
      }
      
      throw new Error('No data available');
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
