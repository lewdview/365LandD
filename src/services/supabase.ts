import type { Release, SongAnalysis, ReleaseData } from '../types';

const SUPABASE_PROJECT_ID = 'pznmptudgicrmljjafex';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6bm1wdHVkZ2ljcm1samphZmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMDE4ODUsImV4cCI6MjA3OTg3Nzg4NX0.syu1bbr9OJ5LxCnTrybLVgsjac4UOkFVdAHuvhKMY2g';

const API_BASE = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-473d7342`;

// Format duration from seconds to MM:SS
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Clean up filename to create a title
function fileNameToTitle(fileName: string): string {
  return fileName
    .replace(/\.(mp3|wav|flac|m4a)$/i, '')
    .replace(/_/g, ' ')
    .replace(/[-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Determine if a track is "light" or "dark" based on valence and mood
function determineMood(analysis: SongAnalysis): 'light' | 'dark' {
  const darkMoods = ['dark', 'melancholic', 'sad', 'introspective', 'intense', 'angry'];
  const lightMoods = ['upbeat', 'happy', 'joyful', 'uplifting', 'hopeful', 'energetic', 'playful'];
  
  // Check mood array
  const moodLower = analysis.mood.map(m => m.toLowerCase());
  const hasDarkMood = moodLower.some(m => darkMoods.some(dm => m.includes(dm)));
  const hasLightMood = moodLower.some(m => lightMoods.some(lm => m.includes(lm)));
  
  // Check lyrics analysis sentiment
  const sentiment = analysis.lyricsAnalysis?.sentiment;
  const valence = analysis.valence;
  
  // Decision logic
  if (sentiment === 'negative' || (hasDarkMood && !hasLightMood)) return 'dark';
  if (sentiment === 'positive' || (hasLightMood && !hasDarkMood)) return 'light';
  if (valence < 0.4) return 'dark';
  if (valence > 0.6) return 'light';
  
  // Default based on valence
  return valence >= 0.5 ? 'light' : 'dark';
}

// Generate a description from lyrics analysis
function generateDescription(analysis: SongAnalysis): string {
  const la = analysis.lyricsAnalysis;
  
  // Helper for a/an grammar
  const aOrAn = (word: string) => {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    return vowels.includes(word.charAt(0).toLowerCase()) ? 'an' : 'a';
  };
  
  if (!la || !la.themes || la.themes.length === 0) {
    const moodWord = analysis.mood?.[0]?.toLowerCase() || 'expressive';
    return `A ${Math.round(analysis.tempo)} BPM ${moodWord} track in ${analysis.key}.`;
  }
  
  const themes = la.themes.slice(0, 2);
  const emotion = la.emotion?.[0]?.toLowerCase() || la.mood?.[0]?.toLowerCase() || 'expressive';
  
  // Description templates for variety
  const templates = [
    () => `${aOrAn(emotion).charAt(0).toUpperCase() + aOrAn(emotion).slice(1)} ${emotion} journey through ${themes.join(' and ')}.`,
    () => `Exploring ${themes[0]}${themes[1] ? ` and ${themes[1]}` : ''} with ${emotion} intensity.`,
    () => `A ${emotion} meditation on ${themes.join(', ')}.`,
    () => `${themes[0].charAt(0).toUpperCase() + themes[0].slice(1)} and ${emotion} collide in this ${Math.round(analysis.tempo)} BPM piece.`,
    () => `Diving deep into ${themes.join(' and ')} with raw ${emotion}.`,
  ];
  
  // Select template based on hash of title for consistency
  const hash = analysis.fileName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const template = templates[hash % templates.length];
  
  return template();
}

// Convert SongAnalysis to Release format
function songAnalysisToRelease(analysis: SongAnalysis, dayNumber: number): Release {
  const mood = determineMood(analysis);
  
  // Extract tags from mood, themes, and genre
  const tags: string[] = [
    ...(analysis.mood || []).slice(0, 2),
    ...(analysis.lyricsAnalysis?.themes || []).slice(0, 2),
    ...(analysis.genre || []).slice(0, 1),
  ].filter(Boolean).map(t => t.toLowerCase());
  
  // Create a date based on day number (starting Jan 1, 2026)
  const startDate = new Date('2026-01-01');
  const releaseDate = new Date(startDate);
  releaseDate.setDate(startDate.getDate() + dayNumber - 1);
  
  return {
    id: analysis.id,
    day: dayNumber,
    date: releaseDate.toISOString().split('T')[0],
    fileName: analysis.fileName,
    title: fileNameToTitle(analysis.fileName),
    mood,
    description: generateDescription(analysis),
    storedAudioUrl: analysis.storedAudioUrl,
    duration: analysis.duration,
    durationFormatted: formatDuration(analysis.duration),
    tempo: Math.round(analysis.tempo),
    key: analysis.key,
    energy: analysis.energy,
    valence: analysis.valence,
    danceability: analysis.danceability,
    acousticness: analysis.acousticness,
    instrumentalness: analysis.instrumentalness,
    loudness: analysis.loudness,
    speechiness: analysis.speechiness,
    liveness: analysis.liveness,
    timeSignature: analysis.timeSignature,
    genre: analysis.genre || [],
    tags: [...new Set(tags)].slice(0, 5),
    lyrics: analysis.lyrics,
    lyricsSegments: analysis.lyricsSegments,
    lyricsWords: analysis.lyricsWords,
    lyricsAnalysis: analysis.lyricsAnalysis,
  };
}

// Cache configuration
const CACHE_KEY = 'th3scr1b3_release_data';
const CACHE_TTL_HOURS = 24; // Cache for 24 hours

// Check if cached data is still valid
function isCacheValid(): boolean {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return false;
    
    const { timestamp } = JSON.parse(cached);
    const now = Date.now();
    const age = (now - timestamp) / (1000 * 60 * 60); // age in hours
    
    const isValid = age < CACHE_TTL_HOURS;
    console.log(`[Cache] Status: ${isValid ? 'VALID' : 'EXPIRED'} (age: ${age.toFixed(1)}h)`);
    return isValid;
  } catch (e) {
    console.log('[Cache] Invalid cache data, will refresh');
    return false;
  }
}

// Get cached release data
function getCachedData(): ReleaseData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data } = JSON.parse(cached);
      console.log('[Cache] Using cached data with', data.releases?.length || 0, 'releases');
      return data as ReleaseData;
    }
  } catch (e) {
    console.log('[Cache] Error reading cache:', e);
  }
  return null;
}

// Store release data in cache
function setCachedData(data: ReleaseData): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data,
    }));
    console.log('[Cache] Stored data with', data.releases?.length || 0, 'releases');
  } catch (e) {
    console.warn('[Cache] Could not store in localStorage:', e);
  }
}

// Fetch all analyses from Supabase
export async function fetchAnalyses(): Promise<SongAnalysis[]> {
  try {
    const response = await fetch(`${API_BASE}/analyses/load`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch analyses: ${response.status}`);
    }
    
    const data = await response.json();
    return data.analyses || [];
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }
}

// Generate minimal release data from manifest alone
function buildReleasesFromManifest(manifest: any[]): Release[] {
  const offsets: Record<string, number> = { 
    january: 0, february: 31, march: 59, april: 90, may: 120, june: 151,
    july: 181, august: 212, september: 243, october: 273, november: 304, december: 334
  };

  return manifest.map((item) => {
    const absDay = (offsets[item.month.toLowerCase()] ?? 0) + item.index;
    const startDate = new Date('2026-01-01');
    const releaseDate = new Date(startDate);
    releaseDate.setDate(startDate.getDate() + absDay - 1);
    
    // Create sample word-level lyrics data for Poetry in Motion to display
    const sampleWords = [
      { word: 'A', start: 0.5, end: 1 },
      { word: 'poetic', start: 1, end: 2 },
      { word: 'moment', start: 2, end: 3 },
      { word: 'in', start: 3, end: 3.5 },
      { word: 'the', start: 3.5, end: 4 },
      { word: 'journey', start: 4, end: 5 },
      { word: 'of', start: 5, end: 5.5 },
      { word: 'sound', start: 5.5, end: 6.5 },
      { word: 'and', start: 6.5, end: 7 },
      { word: 'self', start: 7, end: 8 },
      { word: 'discovery', start: 8, end: 9 },
    ];
    
    return {
      id: `${item.month}-${item.index}`,
      day: absDay,
      date: releaseDate.toISOString().split('T')[0],
      fileName: `${String(item.index).padStart(2, '0')} - ${item.storageTitle}.${item.ext}`,
      title: item.storageTitle,
      storageTitle: item.storageTitle,
      manifestAudioPath: item.audioPath,
      mood: 'light' as const,
      description: `A poetic entry from ${item.month}`,
      duration: 180,
      durationFormatted: '3:00',
      tempo: 100,
      key: 'C major',
      energy: 0.65,
      valence: 0.6,
      danceability: 0.65,
      acousticness: 0.2,
      instrumentalness: 0.15,
      loudness: -7.5,
      speechiness: 0.05,
      liveness: 0.15,
      timeSignature: '4/4',
      genre: ['Ambient', 'Indie'],
      tags: ['poetry', 'sonic', 'narrative'],
      // Sample poetry data with word-level timestamps
      lyrics: 'A poetic moment in the journey of sound and self discovery.',
      lyricsSegments: [
        { start: 0, end: 9, text: 'A poetic moment in the journey of sound and self discovery.' }
      ],
      lyricsWords: sampleWords as any,
    } as Release;
  });
}

// Build full ReleaseData from manifest when Supabase fails
function buildReleaseDataWithManifest(manifestItems: any[]): ReleaseData {
  const releases = buildReleasesFromManifest(manifestItems);
  const lightTracks = releases.filter(r => r.mood === 'light').length;
  const darkTracks = releases.filter(r => r.mood === 'dark').length;

  return {
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
      lightTracks,
      darkTracks,
      totalListens: 0,
      lastUpdated: new Date().toISOString(),
    },
    announcements: [
      {
        id: 'ann-001',
        date: '2026-01-01',
        title: 'The Journey Begins',
        content: releases.length > 0 
          ? `${releases.length} poetic entries and counting. The journey continues.`
          : '365 days. 365 poetic entries. No breaks. No excuses. Day 1 starts now.',
        type: 'milestone',
      },
    ],
    upcomingMilestones: [
      { day: 1, title: 'Day One' },
      { day: 7, title: 'First Week' },
      { day: 30, title: 'Month 1 Complete' },
      { day: 60, title: 'Month 2 Complete' },
      { day: 90, title: 'Month 3 Complete' },
      { day: 120, title: 'Month 4 Complete' },
      { day: 150, title: 'Month 5 Complete' },
      { day: 180, title: 'Halfway Point' },
      { day: 210, title: 'Month 7 Complete' },
      { day: 240, title: 'Month 8 Complete' },
      { day: 270, title: 'Month 9 Complete' },
      { day: 301, title: 'Month 10 Complete' },
      { day: 331, title: 'Month 11 Complete' },
      { day: 365, title: 'The Final Day' },
    ],
    monthThemes: [
      // Phase I: The Ascent — The energy begins to build. The systems turn on.
      {
        month: 1,
        name: 'January',
        dayStart: 1,
        dayEnd: 31,
        theme: 'The Spark',
        arc: 'Inception',
        pattern: 'awakening',
        emoji: '✨',
        description: 'The Spark (Inception) — "Before the fire, there is the thought." This is the awakening. The mood is hopeful, curious, and light. These tracks represent new ideas forming, the first cup of coffee in the morning, and the optimism of a blank page. The sound is crisp and promising.'
      },
      {
        month: 2,
        name: 'February',
        dayStart: 32,
        dayEnd: 60,
        theme: 'The Rush',
        arc: 'Acceleration',
        pattern: 'surge',
        emoji: '🔥',
        description: 'The Rush (Acceleration) — "Full speed ahead." The idea takes flight. Adrenaline kicks in. These are high-tempo tracks (>135 BPM) that feel like driving with the windows down. It represents the honeymoon phase of any journey—pure excitement, velocity, and the blur of motion.'
      },
      {
        month: 3,
        name: 'March',
        dayStart: 61,
        dayEnd: 91,
        theme: 'The Turbulence',
        arc: 'Conflict',
        pattern: 'chaos',
        emoji: '⚡',
        description: 'The Turbulence (Conflict) — "Moving too fast to steer." Speed turns into instability. The energy is still high, but the mood shifts to anxiety and chaos. The rhythms become jagged and the melodies confused. This represents the moment where the plan starts to shake, and the first obstacles appear.'
      },
      // Phase II: The Descent — The system crashes. The internal work begins.
      {
        month: 4,
        name: 'April',
        dayStart: 92,
        dayEnd: 121,
        theme: 'The Void',
        arc: 'Isolation',
        pattern: 'shadow',
        emoji: '🌑',
        description: 'The Void (Isolation) — "The lights go out." The crash. The energy drops to the floor. These tracks are dark, heavy, and isolated. It represents the "Dark Night of the Soul"—confusion, despair, and the feeling of being completely alone in a large room.'
      },
      {
        month: 5,
        name: 'May',
        dayStart: 122,
        dayEnd: 152,
        theme: 'The Echo',
        arc: 'Nostalgia',
        pattern: 'shadow',
        emoji: '👻',
        description: 'The Echo (Nostalgia) — "Looking back at what was lost." We aren\'t moving forward yet; we are looking backward. The mood is longing and regret. These songs act as ghosts of the past, filled with reverb and memories. It is the sound of missing someone or something.'
      },
      {
        month: 6,
        name: 'June',
        dayStart: 153,
        dayEnd: 182,
        theme: 'The Mirror',
        arc: 'Reflection',
        pattern: 'shadow',
        emoji: '🪞',
        description: 'The Mirror (Reflection) — "Facing the self." The sadness settles into something deeper: understanding. This is the largest collection of songs. They are melancholic and mid-tempo. It is the sound of staring in the mirror, analyzing the heartbreak, and beginning to process the grief.'
      },
      // Phase III: The Transformation — The grief turns into power. The fire is lit.
      {
        month: 7,
        name: 'July',
        dayStart: 183,
        dayEnd: 213,
        theme: 'The Burn',
        arc: 'Reaction',
        pattern: 'surge',
        emoji: '🔥',
        description: 'The Burn (Reaction) — "Sadness hardens into armor." The mourning period ends, and the resistance begins. These are the most aggressive, chaotic, and high-energy tracks. It represents anger, grit, and the refusal to stay down. The system fights back against the silence.'
      },
      {
        month: 8,
        name: 'August',
        dayStart: 214,
        dayEnd: 244,
        theme: 'The Drift',
        arc: 'Numbness',
        pattern: 'calm',
        emoji: '💨',
        description: 'The Drift (Numbness) — "Smoke on the water." After the fire burns out, we float. This is the lowest energy point of the year. Ambient, atmospheric, and exhausted. It represents the necessary recovery mode—healing through stillness.'
      },
      {
        month: 9,
        name: 'September',
        dayStart: 245,
        dayEnd: 274,
        theme: 'The Dawn',
        arc: 'Awakening',
        pattern: 'flow',
        emoji: '🌅',
        description: 'The Dawn (Awakening) — "First light." The eyes open again. The tempo stabilizes. The mood is neutral but leaning toward survival. It is the sound of walking out of a cave and seeing the sun for the first time in months. The tentative first steps of a new beginning.'
      },
      // Phase IV: The Return — Mastery of the self. The cycle completes.
      {
        month: 10,
        name: 'October',
        dayStart: 275,
        dayEnd: 305,
        theme: 'The Climb',
        arc: 'Grit',
        pattern: 'surge',
        emoji: '⛰️',
        description: 'The Climb (Grit) — "Putting the work in." We are moving with purpose now. The beats are driving and steady. It isn\'t manic like February; it is controlled determination. It represents the grind, the workout, and the disciplined climb back to the top.'
      },
      {
        month: 11,
        name: 'November',
        dayStart: 306,
        dayEnd: 335,
        theme: 'The Flight',
        arc: 'Peak',
        pattern: 'flow',
        emoji: '🦅',
        description: 'The Flight (Peak) — "Higher than before." We have reached the summit. The energy is high, but the mood is victorious and confident (Flow State). We aren\'t just surviving anymore; we are thriving. The view from here is perfect.'
      },
      {
        month: 12,
        name: 'December',
        dayStart: 336,
        dayEnd: 365,
        theme: 'The Landing',
        arc: 'Resolution',
        pattern: 'flow',
        emoji: '🏡',
        description: 'The Landing (Resolution) — "Coming home." The journey ends, not with a crash, but with a gentle landing. The tracks are peaceful, filled with gratitude and love. We prepare to rest, wiser and stronger, ready for the cycle to begin again.'
      }
    ],
  };
}

// Build the full release data from Supabase
export async function buildReleaseData(): Promise<ReleaseData> {
  // Check cache first
  if (isCacheValid()) {
    const cached = getCachedData();
    if (cached) return cached;
  }
  
  const analyses = await fetchAnalyses();
  
  // Sort by analyzedAt date and assign day numbers
  const sortedAnalyses = [...analyses].sort((a, b) => 
    new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime()
  );
  
  // Convert to releases
  const releases = sortedAnalyses.map((analysis, index) => 
    songAnalysisToRelease(analysis, index + 1)
  );
  
  // If no analyses from Supabase, try to load from manifest
  if (releases.length === 0) {
    try {
      const manifestRes = await fetch('/release-manifest.json');
      if (manifestRes.ok) {
        const manifest = await manifestRes.json();
        if (manifest.items && manifest.items.length > 0) {
          console.log('[Supabase] No analyses found, building from manifest with', manifest.items.length, 'items');
          return buildReleaseDataWithManifest(manifest.items);
        }
      }
    } catch (e) {
      console.log('[Supabase] Could not load manifest as fallback:', e);
    }
    
    // Last resort: try to load from static releases.json
    try {
      let response = await fetch('/releases.local.json');
      if (!response.ok) {
        response = await fetch('/releases.json');
      }
      if (response.ok) {
        const data: ReleaseData = await response.json();
        console.log('[Supabase] Fallback: loaded from local/static releases.json with', data.releases?.length || 0, 'releases');
        return data;
      }
    } catch (e) {
      console.log('[Supabase] Could not load releases.json as fallback:', e);
    }
  }
  
  // Calculate stats
  const lightTracks = releases.filter(r => r.mood === 'light').length;
  const darkTracks = releases.filter(r => r.mood === 'dark').length;
  
  const result: ReleaseData = {
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
      lightTracks,
      darkTracks,
      totalListens: 0,
      lastUpdated: new Date().toISOString(),
    },
    announcements: [
      {
        id: 'ann-001',
        date: '2026-01-01',
        title: 'The Journey Begins',
        content: releases.length > 0 
          ? `${releases.length} poetic entries and counting. The journey continues.`
          : '365 days. 365 poetic entries. No breaks. No excuses. Day 1 starts now.',
        type: 'milestone',
      },
    ],
    upcomingMilestones: [
      { day: 1, title: 'Day One' },
      { day: 7, title: 'First Week' },
      { day: 30, title: 'Month 1 Complete' },
      { day: 60, title: 'Month 2 Complete' },
      { day: 90, title: 'Month 3 Complete' },
      { day: 120, title: 'Month 4 Complete' },
      { day: 150, title: 'Month 5 Complete' },
      { day: 180, title: 'Halfway Point' },
      { day: 210, title: 'Month 7 Complete' },
      { day: 240, title: 'Month 8 Complete' },
      { day: 270, title: 'Month 9 Complete' },
      { day: 301, title: 'Month 10 Complete' },
      { day: 331, title: 'Month 11 Complete' },
      { day: 365, title: 'The Final Day' },
    ],
    monthThemes: [
      // Phase I: The Ascent — The energy begins to build. The systems turn on.
      {
        month: 1,
        name: 'January',
        dayStart: 1,
        dayEnd: 31,
        theme: 'The Spark',
        arc: 'Inception',
        pattern: 'awakening',
        emoji: '✨',
        description: 'The Spark (Inception) — "Before the fire, there is the thought." This is the awakening. The mood is hopeful, curious, and light. These tracks represent new ideas forming, the first cup of coffee in the morning, and the optimism of a blank page. The sound is crisp and promising.'
      },
      {
        month: 2,
        name: 'February',
        dayStart: 32,
        dayEnd: 60,
        theme: 'The Rush',
        arc: 'Acceleration',
        pattern: 'surge',
        emoji: '🔥',
        description: 'The Rush (Acceleration) — "Full speed ahead." The idea takes flight. Adrenaline kicks in. These are high-tempo tracks (>135 BPM) that feel like driving with the windows down. It represents the honeymoon phase of any journey—pure excitement, velocity, and the blur of motion.'
      },
      {
        month: 3,
        name: 'March',
        dayStart: 61,
        dayEnd: 91,
        theme: 'The Turbulence',
        arc: 'Conflict',
        pattern: 'chaos',
        emoji: '⚡',
        description: 'The Turbulence (Conflict) — "Moving too fast to steer." Speed turns into instability. The energy is still high, but the mood shifts to anxiety and chaos. The rhythms become jagged and the melodies confused. This represents the moment where the plan starts to shake, and the first obstacles appear.'
      },
      // Phase II: The Descent — The system crashes. The internal work begins.
      {
        month: 4,
        name: 'April',
        dayStart: 92,
        dayEnd: 121,
        theme: 'The Void',
        arc: 'Isolation',
        pattern: 'shadow',
        emoji: '🌑',
        description: 'The Void (Isolation) — "The lights go out." The crash. The energy drops to the floor. These tracks are dark, heavy, and isolated. It represents the "Dark Night of the Soul"—confusion, despair, and the feeling of being completely alone in a large room.'
      },
      {
        month: 5,
        name: 'May',
        dayStart: 122,
        dayEnd: 152,
        theme: 'The Echo',
        arc: 'Nostalgia',
        pattern: 'shadow',
        emoji: '👻',
        description: 'The Echo (Nostalgia) — "Looking back at what was lost." We aren\'t moving forward yet; we are looking backward. The mood is longing and regret. These songs act as ghosts of the past, filled with reverb and memories. It is the sound of missing someone or something.'
      },
      {
        month: 6,
        name: 'June',
        dayStart: 153,
        dayEnd: 182,
        theme: 'The Mirror',
        arc: 'Reflection',
        pattern: 'shadow',
        emoji: '🪞',
        description: 'The Mirror (Reflection) — "Facing the self." The sadness settles into something deeper: understanding. This is the largest collection of songs. They are melancholic and mid-tempo. It is the sound of staring in the mirror, analyzing the heartbreak, and beginning to process the grief.'
      },
      // Phase III: The Transformation — The grief turns into power. The fire is lit.
      {
        month: 7,
        name: 'July',
        dayStart: 183,
        dayEnd: 213,
        theme: 'The Burn',
        arc: 'Reaction',
        pattern: 'surge',
        emoji: '🔥',
        description: 'The Burn (Reaction) — "Sadness hardens into armor." The mourning period ends, and the resistance begins. These are the most aggressive, chaotic, and high-energy tracks. It represents anger, grit, and the refusal to stay down. The system fights back against the silence.'
      },
      {
        month: 8,
        name: 'August',
        dayStart: 214,
        dayEnd: 244,
        theme: 'The Drift',
        arc: 'Numbness',
        pattern: 'calm',
        emoji: '💨',
        description: 'The Drift (Numbness) — "Smoke on the water." After the fire burns out, we float. This is the lowest energy point of the year. Ambient, atmospheric, and exhausted. It represents the necessary recovery mode—healing through stillness.'
      },
      {
        month: 9,
        name: 'September',
        dayStart: 245,
        dayEnd: 274,
        theme: 'The Dawn',
        arc: 'Awakening',
        pattern: 'flow',
        emoji: '🌅',
        description: 'The Dawn (Awakening) — "First light." The eyes open again. The tempo stabilizes. The mood is neutral but leaning toward survival. It is the sound of walking out of a cave and seeing the sun for the first time in months. The tentative first steps of a new beginning.'
      },
      // Phase IV: The Return — Mastery of the self. The cycle completes.
      {
        month: 10,
        name: 'October',
        dayStart: 275,
        dayEnd: 305,
        theme: 'The Climb',
        arc: 'Grit',
        pattern: 'surge',
        emoji: '⛰️',
        description: 'The Climb (Grit) — "Putting the work in." We are moving with purpose now. The beats are driving and steady. It isn\'t manic like February; it is controlled determination. It represents the grind, the workout, and the disciplined climb back to the top.'
      },
      {
        month: 11,
        name: 'November',
        dayStart: 306,
        dayEnd: 335,
        theme: 'The Flight',
        arc: 'Peak',
        pattern: 'flow',
        emoji: '🦅',
        description: 'The Flight (Peak) — "Higher than before." We have reached the summit. The energy is high, but the mood is victorious and confident (Flow State). We aren\'t just surviving anymore; we are thriving. The view from here is perfect.'
      },
      {
        month: 12,
        name: 'December',
        dayStart: 336,
        dayEnd: 365,
        theme: 'The Landing',
        arc: 'Resolution',
        pattern: 'flow',
        emoji: '🏡',
        description: 'The Landing (Resolution) — "Coming home." The journey ends, not with a crash, but with a gentle landing. The tracks are peaceful, filled with gratitude and love. We prepare to rest, wiser and stronger, ready for the cycle to begin again.'
      }
    ],
  };
  
  // Cache the result before returning
  setCachedData(result);
  return result;
}
