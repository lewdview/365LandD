import { create } from 'zustand';
import type { Release } from '../types';
import { getAudioUrl } from '../services/releaseStorage';

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
    
    const primaryUrl = getAudioUrl(release.day, release.title);
    audioElement.src = primaryUrl;
    audioElement.load();
    
    // Play once loaded
    const handleCanPlay = () => {
      audioElement.play().catch(() => set({ hasError: true }));
      audioElement.removeEventListener('canplaythrough', handleCanPlay);
    };
    audioElement.addEventListener('canplaythrough', handleCanPlay);
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
