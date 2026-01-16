import type { Release, SongAnalysis, ReleaseData } from '../types';
import { buildReleasesFromManifestWithDatabase, loadAndMergeDatabases } from './databaseExport';

const SUPABASE_PROJECT_ID = 'pznmptudgicrmljjafex';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6bm1wdHVkZ2ljcm1samphZmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMDE4ODUsImV4cCI6MjA3OTg3Nzg4NX0.syu1bbr9OJ5LxCnTrybLVgsjac4UOkFVdAHuvhKMY2g';

const API_BASE = `https://${SUPABASE_PROJECT_ID}.supabase.co/functions/v1/make-server-473d7342`;

// Format duration from seconds to MM:SS
function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ... existing imports

// Clean up filename to create a title
function fileNameToTitle(fileName: string): string {
  return fileName
    .replace(/\.(mp3|wav|flac|m4a)$/i, '') // Remove extension
    .replace(/^\d+[\s-_]+/, '') // Remove leading day numbers (e.g. "01 - ", "01_")
    .replace(/_/g, ' ')
    .replace(/[-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ... rest of the file stays the same


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
  // Use local date to avoid timezone issues
  const startDate = new Date(2026, 0, 1); // Jan 1, 2026 in local time
  const releaseDate = new Date(2026, 0, 1);
  releaseDate.setDate(1 + dayNumber - 1); // Day 1 = Jan 1, Day 2 = Jan 2, etc.
  
  const cleanedTitle = fileNameToTitle(analysis.fileName);
  
  return {
    id: analysis.id,
    day: dayNumber,
    date: releaseDate.toISOString().split('T')[0],
    fileName: analysis.fileName,
    title: cleanedTitle,
    storageTitle: cleanedTitle,
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


// Build full ReleaseData from manifest when Supabase fails
async function buildReleaseDataWithManifest(manifestItems: any[]): Promise<ReleaseData> {
  // Try to load exported database to enrich manifest data
  const exportedSongs = await loadAndMergeDatabases();
  const releases = await buildReleasesFromManifestWithDatabase(manifestItems, exportedSongs);
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
      // PHASE I: /BOOT_SEQUENCE (Days 1–83) — Structure, Rhythm, Light/Mixed
      {
        month: 1,
        name: 'January',
        dayStart: 1,
        dayEnd: 31,
        theme: '/BOOT_SEQUENCE',
        arc: 'System Boot',
        pattern: 'structure',
        emoji: '💾',
        description: '/BOOT_SEQUENCE (Days 1–31) — Theme: Structure, Rhythm, Light/Mixed. Vibe: The OS is booting up. Everything is clean, grid-like, and optimized. The system initializes with crisp, organized beats and clear, hopeful melodies. Like watching a computer startup sequence, each track represents a new system process coming online. The mood is methodical yet uplifting, building anticipation for what\'s to come.'
      },
      {
        month: 2,
        name: 'February',
        dayStart: 32,
        dayEnd: 60,
        theme: '/BOOT_SEQUENCE',
        arc: 'System Boot',
        pattern: 'structure',
        emoji: '⚙️',
        description: '/BOOT_SEQUENCE (Days 32–60) — Theme: Structure, Rhythm, Light/Mixed. The boot sequence continues. Energy builds as more processes activate. The system is becoming operational, with layers of sound stacking like initialization routines. Each track brings the operating system closer to full functionality, the rhythm steady and purposeful. Occasionally packet loss detected—minor glitches that add character to the initialization.'
      },
      {
        month: 3,
        name: 'March',
        dayStart: 61,
        dayEnd: 83,
        theme: '/BOOT_SEQUENCE',
        arc: 'System Boot',
        pattern: 'structure',
        emoji: '✓',
        description: '/BOOT_SEQUENCE (Days 61–83) — Theme: Structure, Rhythm, Light/Mixed. The final phase of booting. The OS is nearly ready. Despite minor warnings of occasional packet loss, the system is almost fully operational. The music becomes more complex and dynamic, reflecting the final initialization steps. By day 83, the boot sequence is complete, and the system is ready to accept input.'
      },
      // PHASE II: /CACHE_OVERFLOW (Days 84–187) — Chaos, High Energy, Dark/Glitch
      {
        month: 4,
        name: 'April',
        dayStart: 84,
        dayEnd: 121,
        theme: '/CACHE_OVERFLOW',
        arc: 'System Crash',
        pattern: 'chaos',
        emoji: '⚡',
        description: '/CACHE_OVERFLOW (Days 84–121) — Theme: Chaos, High Energy, Dark/Glitch. Vibe: The virus has entered. The file names are corrupted. The music is aggressive, with heavy glitches and distortion. This is the moment of impact. Critical system instability. The rhythms are jagged and unpredictable. The melodies glitch and fragment. It represents the system\'s desperate attempt to process corruption while still running.'
      },
      {
        month: 5,
        name: 'May',
        dayStart: 122,
        dayEnd: 152,
        theme: '/CACHE_OVERFLOW',
        arc: 'System Crash',
        pattern: 'chaos',
        emoji: '🔴',
        description: '/CACHE_OVERFLOW (Days 122–152) — Theme: Chaos, High Energy, Dark/Glitch. The cache is overflowing. Error logs stack on top of each other. The system is running hot, struggling under the load of corrupted data. High energy but unstable—like driving on a highway with failing brakes. The sound is dense and overwhelming, reflecting the system\'s inability to manage what\'s being processed.'
      },
      {
        month: 6,
        name: 'June',
        dayStart: 153,
        dayEnd: 187,
        theme: '/CACHE_OVERFLOW',
        arc: 'System Crash',
        pattern: 'chaos',
        emoji: '📊',
        description: '/CACHE_OVERFLOW (Days 153–187) — Theme: Chaos, High Energy, Dark/Glitch. The system reaches its breaking point. Data flows are maxed out. This is the crescendo of the crash. The energy is manic and frenetic. Every resource is being thrown at the problem, but it\'s not enough. By day 187, the system can no longer sustain this state—a reboot becomes inevitable.'
      },
      // PHASE III: /ROOT_ACCESS (Days 188–271) — Void, Deep, Sad/Dark
      {
        month: 7,
        name: 'July',
        dayStart: 188,
        dayEnd: 213,
        theme: '/ROOT_ACCESS',
        arc: 'System Recovery',
        pattern: 'void',
        emoji: '◼️',
        description: '/ROOT_ACCESS (Days 188–213) — Theme: Void, Deep, Sad/Dark. Vibe: The screen goes black. The system has crashed to a command prompt. We are in root access mode, exploring the hidden files in the darkness. Low power mode active. The sound is deep, sparse, and isolated. Each track is a step through the void—cautious, introspective, and melancholic. The mood is that of facing the machine\'s inner core.'
      },
      {
        month: 8,
        name: 'August',
        dayStart: 214,
        dayEnd: 244,
        theme: '/ROOT_ACCESS',
        arc: 'System Recovery',
        pattern: 'void',
        emoji: '🌑',
        description: '/ROOT_ACCESS (Days 214–244) — Theme: Void, Deep, Sad/Dark. Deeper into the darkness. We are reading corrupted logs, trying to understand what went wrong. The energy is low and the tempo slow. The music feels like searching through a filing cabinet in an abandoned building. Echoes and reverb fill the space where data used to be. This is the sound of grief and realization.'
      },
      {
        month: 9,
        name: 'September',
        dayStart: 245,
        dayEnd: 271,
        theme: '/ROOT_ACCESS',
        arc: 'System Recovery',
        pattern: 'void',
        emoji: '🔍',
        description: '/ROOT_ACCESS (Days 245–271) — Theme: Void, Deep, Sad/Dark. The final days in root access. We have seen the worst. The damage is catalogued. The mood shifts from active grieving to quiet acceptance. The tracks become more sparse, almost minimalist. It\'s like staring at the code that broke everything, finally understanding the truth. By day 271, we are ready to rebuild.'
      },
      // PHASE IV: /THE_CLOUD (Days 272–365) — Ether, Light, Resolution
      {
        month: 10,
        name: 'October',
        dayStart: 272,
        dayEnd: 305,
        theme: '/THE_CLOUD',
        arc: 'Upload & Ascend',
        pattern: 'ascend',
        emoji: '☁️',
        description: '/THE_CLOUD (Days 272–305) — Theme: Ether, Light, Resolution. Vibe: The data is uploading to the cloud. A gentle hum of processing. The mood shifts upward. It\'s dreamy, euphoric, and ethereal. The music has space and resonance—like standing in a cathedral as light streams through stained glass. The system is being rebuilt in the cloud, piece by piece. Hope is returning.'
      },
      {
        month: 11,
        name: 'November',
        dayStart: 306,
        dayEnd: 335,
        theme: '/THE_CLOUD',
        arc: 'Upload & Ascend',
        pattern: 'ascend',
        emoji: '✨',
        description: '/THE_CLOUD (Days 306–335) — Theme: Ether, Light, Resolution. The upload is nearly complete. The system is taking shape in the cloud. The energy is high but peaceful—not frantic, but flowing. It feels like finally being able to see a clear path forward. The music is uplifting and confident. We are not just recovering; we are transforming. What comes out of the cloud is better than before.'
      },
      {
        month: 12,
        name: 'December',
        dayStart: 336,
        dayEnd: 365,
        theme: '/THE_CLOUD',
        arc: 'Upload & Ascend',
        pattern: 'ascend',
        emoji: '🏠',
        description: '/THE_CLOUD (Days 336–365) — Theme: Ether, Light, Resolution. The upload completes. The system returns to Earth, fully restored and evolved. The final days are peaceful and reflective. The music is warm, grateful, and final. It\'s the sound of coming home—changed, but intact. The 365-day cycle is complete. Warning: Upload in progress. Do not turn off your computer. Day 365: System ready for the next cycle.'
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
          return await buildReleaseDataWithManifest(manifest.items);
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
      // PHASE I: /BOOT_SEQUENCE (Days 1–83) — Structure, Rhythm, Light/Mixed
      {
        month: 1,
        name: 'January',
        dayStart: 1,
        dayEnd: 31,
        theme: '/BOOT_SEQUENCE',
        arc: 'System Boot',
        pattern: 'structure',
        emoji: '💾',
        description: '/BOOT_SEQUENCE (Days 1–31) — Theme: Structure, Rhythm, Light/Mixed. Vibe: The OS is booting up. Everything is clean, grid-like, and optimized. The system initializes with crisp, organized beats and clear, hopeful melodies. Like watching a computer startup sequence, each track represents a new system process coming online. The mood is methodical yet uplifting, building anticipation for what\'s to come.'
      },
      {
        month: 2,
        name: 'February',
        dayStart: 32,
        dayEnd: 60,
        theme: '/BOOT_SEQUENCE',
        arc: 'System Boot',
        pattern: 'structure',
        emoji: '⚙️',
        description: '/BOOT_SEQUENCE (Days 32–60) — Theme: Structure, Rhythm, Light/Mixed. The boot sequence continues. Energy builds as more processes activate. The system is becoming operational, with layers of sound stacking like initialization routines. Each track brings the operating system closer to full functionality, the rhythm steady and purposeful. Occasionally packet loss detected—minor glitches that add character to the initialization.'
      },
      {
        month: 3,
        name: 'March',
        dayStart: 61,
        dayEnd: 83,
        theme: '/BOOT_SEQUENCE',
        arc: 'System Boot',
        pattern: 'structure',
        emoji: '✓',
        description: '/BOOT_SEQUENCE (Days 61–83) — Theme: Structure, Rhythm, Light/Mixed. The final phase of booting. The OS is nearly ready. Despite minor warnings of occasional packet loss, the system is almost fully operational. The music becomes more complex and dynamic, reflecting the final initialization steps. By day 83, the boot sequence is complete, and the system is ready to accept input.'
      },
      // PHASE II: /CACHE_OVERFLOW (Days 84–187) — Chaos, High Energy, Dark/Glitch
      {
        month: 4,
        name: 'April',
        dayStart: 84,
        dayEnd: 121,
        theme: '/CACHE_OVERFLOW',
        arc: 'System Crash',
        pattern: 'chaos',
        emoji: '⚡',
        description: '/CACHE_OVERFLOW (Days 84–121) — Theme: Chaos, High Energy, Dark/Glitch. Vibe: The virus has entered. The file names are corrupted. The music is aggressive, with heavy glitches and distortion. This is the moment of impact. Critical system instability. The rhythms are jagged and unpredictable. The melodies glitch and fragment. It represents the system\'s desperate attempt to process corruption while still running.'
      },
      {
        month: 5,
        name: 'May',
        dayStart: 122,
        dayEnd: 152,
        theme: '/CACHE_OVERFLOW',
        arc: 'System Crash',
        pattern: 'chaos',
        emoji: '🔴',
        description: '/CACHE_OVERFLOW (Days 122–152) — Theme: Chaos, High Energy, Dark/Glitch. The cache is overflowing. Error logs stack on top of each other. The system is running hot, struggling under the load of corrupted data. High energy but unstable—like driving on a highway with failing brakes. The sound is dense and overwhelming, reflecting the system\'s inability to manage what\'s being processed.'
      },
      {
        month: 6,
        name: 'June',
        dayStart: 153,
        dayEnd: 187,
        theme: '/CACHE_OVERFLOW',
        arc: 'System Crash',
        pattern: 'chaos',
        emoji: '📊',
        description: '/CACHE_OVERFLOW (Days 153–187) — Theme: Chaos, High Energy, Dark/Glitch. The system reaches its breaking point. Data flows are maxed out. This is the crescendo of the crash. The energy is manic and frenetic. Every resource is being thrown at the problem, but it\'s not enough. By day 187, the system can no longer sustain this state—a reboot becomes inevitable.'
      },
      // PHASE III: /ROOT_ACCESS (Days 188–271) — Void, Deep, Sad/Dark
      {
        month: 7,
        name: 'July',
        dayStart: 188,
        dayEnd: 213,
        theme: '/ROOT_ACCESS',
        arc: 'System Recovery',
        pattern: 'void',
        emoji: '◼️',
        description: '/ROOT_ACCESS (Days 188–213) — Theme: Void, Deep, Sad/Dark. Vibe: The screen goes black. The system has crashed to a command prompt. We are in root access mode, exploring the hidden files in the darkness. Low power mode active. The sound is deep, sparse, and isolated. Each track is a step through the void—cautious, introspective, and melancholic. The mood is that of facing the machine\'s inner core.'
      },
      {
        month: 8,
        name: 'August',
        dayStart: 214,
        dayEnd: 244,
        theme: '/ROOT_ACCESS',
        arc: 'System Recovery',
        pattern: 'void',
        emoji: '🌑',
        description: '/ROOT_ACCESS (Days 214–244) — Theme: Void, Deep, Sad/Dark. Deeper into the darkness. We are reading corrupted logs, trying to understand what went wrong. The energy is low and the tempo slow. The music feels like searching through a filing cabinet in an abandoned building. Echoes and reverb fill the space where data used to be. This is the sound of grief and realization.'
      },
      {
        month: 9,
        name: 'September',
        dayStart: 245,
        dayEnd: 271,
        theme: '/ROOT_ACCESS',
        arc: 'System Recovery',
        pattern: 'void',
        emoji: '🔍',
        description: '/ROOT_ACCESS (Days 245–271) — Theme: Void, Deep, Sad/Dark. The final days in root access. We have seen the worst. The damage is catalogued. The mood shifts from active grieving to quiet acceptance. The tracks become more sparse, almost minimalist. It\'s like staring at the code that broke everything, finally understanding the truth. By day 271, we are ready to rebuild.'
      },
      // PHASE IV: /THE_CLOUD (Days 272–365) — Ether, Light, Resolution
      {
        month: 10,
        name: 'October',
        dayStart: 272,
        dayEnd: 305,
        theme: '/THE_CLOUD',
        arc: 'Upload & Ascend',
        pattern: 'ascend',
        emoji: '☁️',
        description: '/THE_CLOUD (Days 272–305) — Theme: Ether, Light, Resolution. Vibe: The data is uploading to the cloud. A gentle hum of processing. The mood shifts upward. It\'s dreamy, euphoric, and ethereal. The music has space and resonance—like standing in a cathedral as light streams through stained glass. The system is being rebuilt in the cloud, piece by piece. Hope is returning.'
      },
      {
        month: 11,
        name: 'November',
        dayStart: 306,
        dayEnd: 335,
        theme: '/THE_CLOUD',
        arc: 'Upload & Ascend',
        pattern: 'ascend',
        emoji: '✨',
        description: '/THE_CLOUD (Days 306–335) — Theme: Ether, Light, Resolution. The upload is nearly complete. The system is taking shape in the cloud. The energy is high but peaceful—not frantic, but flowing. It feels like finally being able to see a clear path forward. The music is uplifting and confident. We are not just recovering; we are transforming. What comes out of the cloud is better than before.'
      },
      {
        month: 12,
        name: 'December',
        dayStart: 336,
        dayEnd: 365,
        theme: '/THE_CLOUD',
        arc: 'Upload & Ascend',
        pattern: 'ascend',
        emoji: '🏠',
        description: '/THE_CLOUD (Days 336–365) — Theme: Ether, Light, Resolution. The upload completes. The system returns to Earth, fully restored and evolved. The final days are peaceful and reflective. The music is warm, grateful, and final. It\'s the sound of coming home—changed, but intact. The 365-day cycle is complete. Warning: Upload in progress. Do not turn off your computer. Day 365: System ready for the next cycle.'
      }
    ],
  };
  
  // Cache the result before returning
  setCachedData(result);
  return result;
}
