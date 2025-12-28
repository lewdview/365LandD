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
    genre: analysis.genre || [],
    tags: [...new Set(tags)].slice(0, 5),
    lyrics: analysis.lyrics,
    lyricsSegments: analysis.lyricsSegments,
    lyricsWords: analysis.lyricsWords,
    lyricsAnalysis: analysis.lyricsAnalysis,
  };
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

// Build the full release data from Supabase
export async function buildReleaseData(): Promise<ReleaseData> {
  const analyses = await fetchAnalyses();
  
  // Sort by analyzedAt date and assign day numbers
  const sortedAnalyses = [...analyses].sort((a, b) => 
    new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime()
  );
  
  // Convert to releases
  const releases = sortedAnalyses.map((analysis, index) => 
    songAnalysisToRelease(analysis, index + 1)
  );
  
  // Calculate stats
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
      {
        month: 1,
        name: 'January',
        dayStart: 1,
        dayEnd: 30,
        theme: 'New Beginnings',
        arc: 'LIGHT',
        emoji: '🌅',
        description: 'Fresh starts, hope, and the excitement of a new journey',
      },
      {
        month: 2,
        name: 'February',
        dayStart: 31,
        dayEnd: 60,
        theme: 'Love & Connection',
        arc: 'LIGHT',
        emoji: '💕',
        description: 'Bonds, relationships, and the warmth of human connection',
      },
      {
        month: 3,
        name: 'March',
        dayStart: 61,
        dayEnd: 90,
        theme: 'Awakening & Growth',
        arc: 'LIGHT',
        emoji: '🌱',
        description: 'Personal evolution, learning, and stepping into potential',
      },
      {
        month: 4,
        name: 'April',
        dayStart: 91,
        dayEnd: 120,
        theme: 'Reflection & Nostalgia',
        arc: 'MIXED',
        emoji: '🍂',
        description: 'Looking back, bittersweet memories, and emotional depth',
      },
      {
        month: 5,
        name: 'May',
        dayStart: 121,
        dayEnd: 150,
        theme: 'Strength & Resilience',
        arc: 'MIXED',
        emoji: '💪',
        description: 'Overcoming obstacles, inner power, and determination',
      },
      {
        month: 6,
        name: 'June',
        dayStart: 151,
        dayEnd: 180,
        theme: 'Transition & Truth',
        arc: 'DARK',
        emoji: '🌘',
        description: 'Facing reality, uncomfortable truths, and necessary change',
      },
      {
        month: 7,
        name: 'July',
        dayStart: 181,
        dayEnd: 210,
        theme: 'Darkness & Shadow',
        arc: 'DARK',
        emoji: '🌑',
        description: 'Confronting the void, exploring pain, and raw honesty',
      },
      {
        month: 8,
        name: 'August',
        dayStart: 211,
        dayEnd: 240,
        theme: 'Descent & Healing',
        arc: 'DARK',
        emoji: '🕯️',
        description: 'Rock bottom, processing trauma, and beginning to heal',
      },
      {
        month: 9,
        name: 'September',
        dayStart: 241,
        dayEnd: 270,
        theme: 'Acceptance & Release',
        arc: 'MIXED→LIGHT',
        emoji: '🌗',
        description: 'Processing pain, letting go, finding peace with the past',
      },
      {
        month: 10,
        name: 'October',
        dayStart: 271,
        dayEnd: 301,
        theme: 'Rebirth & Renewal',
        arc: 'LIGHT',
        emoji: '🌓',
        description: 'Rising from the ashes, transformation, new perspective',
      },
      {
        month: 11,
        name: 'November',
        dayStart: 302,
        dayEnd: 331,
        theme: 'Gratitude & Connection',
        arc: 'LIGHT',
        emoji: '🌔',
        description: 'Appreciation, community, meaningful relationships',
      },
      {
        month: 12,
        name: 'December',
        dayStart: 332,
        dayEnd: 365,
        theme: 'Hope & Celebration',
        arc: 'FULL LIGHT',
        emoji: '🌕',
        description: 'Joy, triumph, looking forward, completing the cycle',
      },
    ],
  };
}
