import { create } from 'zustand';
import type { Release } from '../types';
import { getReleaseAudioUrlVariations, getLocalAudioUrls } from '../services/releaseStorage';

interface AudioState {
  // Current track
  currentRelease: Release | null;
  
  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  hasError: boolean;
  
  // The actual audio element (set from component)
  audioElement: HTMLAudioElement | null;
  
  // Actions
  setAudioElement: (el: HTMLAudioElement | null) => void;
  loadAndPlay: (release: Release) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  stop: () => void;
  
  // Internal state updates (called from audio events)
  _setCurrentTime: (time: number) => void;
  _setDuration: (duration: number) => void;
  _setIsPlaying: (playing: boolean) => void;
  _setIsLoading: (loading: boolean) => void;
  _setHasError: (error: boolean) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentRelease: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  isLoading: false,
  hasError: false,
  audioElement: null,

  setAudioElement: (el) => set({ audioElement: el }),

  loadAndPlay: (release) => {
    const { audioElement, currentRelease, isPlaying } = get();
    
    // If same release and already playing, just continue
    if (currentRelease?.day === release.day && currentRelease?.title === release.title) {
      if (!isPlaying && audioElement) {
        audioElement.play().catch(() => set({ hasError: true }));
      }
      return;
    }
    
    // New track - load it
    if (!audioElement) return;
    
    set({ 
      currentRelease: release, 
      isLoading: true, 
      hasError: false,
      currentTime: 0,
      duration: 0,
    });
    
    const title = release.storageTitle || release.title;
    
    // Build URL list: prioritize manifestAudioPath if available, then try variations
    const urlsToTry: string[] = [];
    
    // If release has a manifest audio path (from fallback data), use it first
    if (release.manifestAudioPath) {
      urlsToTry.push(`/music/${release.manifestAudioPath}`);
      console.log(`[Audio] Using manifest path: ${release.manifestAudioPath}`);
    }
    
    // Then add remote variations (releaseready bucket)
    urlsToTry.push(...getReleaseAudioUrlVariations(release.day, title));
    
    // Finally add local file variations as fallback
    urlsToTry.push(...getLocalAudioUrls(release.day, title));
    
    console.log(`[Audio] Loading: ${release.title}, trying ${urlsToTry.length} sources`);
    
    let currentUrlIndex = 0;
    let playAttempted = false;
    
    const tryNextUrl = () => {
      if (currentUrlIndex >= urlsToTry.length) {
        console.error(`[Audio] All formats failed for: ${release.title}`);
        set({ hasError: true, isLoading: false });
        return;
      }
      
      const url = urlsToTry[currentUrlIndex];
      console.log(`[Audio] Trying (${currentUrlIndex + 1}/${urlsToTry.length}): ${url}`);
      audioElement.src = url;
      audioElement.currentTime = 0;
      audioElement.load();
      currentUrlIndex++;
    };
    
    const attemptPlay = () => {
      if (!playAttempted) {
        playAttempted = true;
        audioElement.play().catch(() => {
          if (currentUrlIndex < urlsToTry.length) {
            console.warn('[Audio] Play failed, trying next format');
            tryNextUrl();
          } else {
            set({ hasError: true });
          }
        });
      }
    };
    
    const handleError = () => {
      audioElement.removeEventListener('canplay', attemptPlay);
      audioElement.removeEventListener('error', handleError);
      if (currentUrlIndex < urlsToTry.length) {
        tryNextUrl();
      } else {
        set({ hasError: true, isLoading: false });
      }
    };
    
    audioElement.addEventListener('canplay', attemptPlay, { once: true });
    audioElement.addEventListener('error', handleError, { once: true });
    
    const timeout = setTimeout(() => {
      audioElement.removeEventListener('canplay', attemptPlay);
      audioElement.removeEventListener('error', handleError);
      if (currentUrlIndex < urlsToTry.length) {
        tryNextUrl();
      } else {
        set({ hasError: true, isLoading: false });
      }
    }, 2000);
    
    audioElement.addEventListener('canplay', () => clearTimeout(timeout), { once: true });
    
    tryNextUrl();
  },

  play: () => {
    const { audioElement, hasError } = get();
    if (audioElement && !hasError) {
      audioElement.play().catch(() => set({ hasError: true }));
    }
  },

  pause: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
    }
  },

  togglePlay: () => {
    const { isPlaying, play, pause } = get();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  },

  seek: (time) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },

  setVolume: (vol) => {
    const { audioElement, isMuted } = get();
    set({ volume: vol });
    if (audioElement && !isMuted) {
      audioElement.volume = vol;
    }
  },

  toggleMute: () => {
    const { audioElement, isMuted, volume } = get();
    const newMuted = !isMuted;
    set({ isMuted: newMuted });
    if (audioElement) {
      audioElement.volume = newMuted ? 0 : volume;
    }
  },

  stop: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    set({ 
      isPlaying: false, 
      currentTime: 0,
      currentRelease: null,
    });
  },

  // Internal setters for audio events
  _setCurrentTime: (time) => set({ currentTime: time }),
  _setDuration: (duration) => set({ duration }),
  _setIsPlaying: (playing) => set({ isPlaying: playing }),
  _setIsLoading: (loading) => set({ isLoading: loading }),
  _setHasError: (error) => set({ hasError: error, isLoading: false }),
}));
