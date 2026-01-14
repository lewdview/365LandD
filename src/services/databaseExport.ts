import type { Release } from '../types';
import type { LyricsAnalysis } from '../types';

// ExportedSong interface is not used but kept for reference
// (actual usage is AnalysisData below)

interface AnalysisData {
  id: string;
  fileName: string;
  title: string;
  duration: number;
  tempo: number;
  key: string;
  timeSignature: string;
  energy: number;
  danceability: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  loudness: number;
  speechiness: number;
  liveness: number;
  genre: string[];
  mood: string[];
  lyrics?: string;
  lyricsSegments?: Array<{ start: number; end: number; text: string }>;
  lyricsAnalysis?: LyricsAnalysis;
}

/**
 * Try to load the latest exported database files and merge their data
 * Returns a map of filename -> song data with all available metadata
 */
async function loadExportedDatabases(): Promise<Map<string, AnalysisData>> {
  const songMap = new Map<string, AnalysisData>();
  
  try {
    // Try to load the latest analysis database (most complete)
    // These files are in db_output_json/ which is served by Vite in dev
    const urlsToTry = [
      '/db_output_json/database-analysis-1768225983890.json',  // Specific latest known file
      '/database-analysis-1768225983890.json',  // Try without path prefix
    ];
    
    let analysisResponse: Response | null = null;
    for (const url of urlsToTry) {
      try {
        analysisResponse = await fetch(url);
        if (analysisResponse.ok) {
          console.log(`[Database] Loaded analysis from ${url}`);
          break;
        }
      } catch (e) {
        // Try next URL
        continue;
      }
    }
    
    if (analysisResponse?.ok) {
      const analysisData = await analysisResponse.json();
      const songs = analysisData.songs || [];
      console.log(`[Database] Loaded analysis data with ${songs.length} songs`);
      
      songs.forEach((song: AnalysisData) => {
        // Normalize filename to lowercase for consistent matching
        const key = song.fileName.toLowerCase();
        songMap.set(key, song);
      });
    } else {
      console.log('[Database] Analysis database not found at any of the expected URLs');
    }
  } catch (e) {
    console.log('[Database] Could not load analysis database:', e);
  }
  
  return songMap;
}

/**
 * Determine mood (light/dark) based on valence and lyrics sentiment
 */
function determineMood(song: AnalysisData): 'light' | 'dark' {
  const darkMoods = ['dark', 'melancholic', 'sad', 'introspective', 'intense', 'angry', 'frustrated'];
  const lightMoods = ['upbeat', 'happy', 'joyful', 'uplifting', 'hopeful', 'energetic', 'playful'];
  
  const moodLower = (song.mood || []).map(m => m.toLowerCase());
  const hasDarkMood = moodLower.some(m => darkMoods.some(dm => m.includes(dm)));
  const hasLightMood = moodLower.some(m => lightMoods.some(lm => m.includes(lm)));
  
  const sentiment = song.lyricsAnalysis?.sentiment;
  const valence = song.valence;
  
  if (sentiment === 'negative' || (hasDarkMood && !hasLightMood)) return 'dark';
  if (sentiment === 'positive' || (hasLightMood && !hasDarkMood)) return 'light';
  if (valence != null) {
    if (valence < 0.4) return 'dark';
    if (valence > 0.6) return 'light';
    return valence >= 0.5 ? 'light' : 'dark';
  }
  
  return 'light';
}

/**
 * Generate a description from available metadata
 */
function generateDescription(song: AnalysisData): string {
  const themes = song.lyricsAnalysis?.themes || [];
  const mood = (song.mood || [])[0]?.toLowerCase() || 'expressive';
  const tempo = Math.round(song.tempo || 100);
  
  if (themes.length === 0) {
    return `A ${tempo} BPM ${mood} track in ${song.key || 'C major'}.`;
  }
  
  const templates = [
    () => `Exploring ${themes.slice(0, 2).join(' and ')} with ${mood} intensity.`,
    () => `A ${mood} meditation on ${themes.slice(0, 2).join(', ')}.`,
    () => `${themes[0]} and ${mood} collide in this ${tempo} BPM piece.`,
    () => `Diving deep into ${themes.slice(0, 2).join(' and ')} with raw ${mood}.`,
  ];
  
  const hash = song.fileName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  const template = templates[hash % templates.length];
  return template();
}

/**
 * Convert exported analysis data to Release format
 */
function analysisToRelease(song: AnalysisData, dayNumber: number, storageTitle?: string): Release {
  // Use local date to avoid timezone issues
  const releaseDate = new Date(2026, 0, 1);
  releaseDate.setDate(1 + dayNumber - 1); // Day 1 = Jan 1, Day 2 = Jan 2, etc.
  
  const mood = determineMood(song);
  const tags = [
    ...(song.mood || []).slice(0, 2),
    ...(song.lyricsAnalysis?.themes || []).slice(0, 2),
    ...(song.genre || []).slice(0, 1),
  ].filter(Boolean).map(t => typeof t === 'string' ? t.toLowerCase() : '').filter(Boolean);
  
  return {
    id: song.id,
    day: dayNumber,
    date: releaseDate.toISOString().split('T')[0],
    fileName: song.fileName,
    title: song.title,
    storageTitle: storageTitle || song.title,
    mood,
    description: generateDescription(song),
    duration: Math.round(song.duration || 180),
    durationFormatted: formatDuration(Math.round(song.duration || 180)),
    tempo: Math.round(song.tempo || 100),
    key: song.key || 'C major',
    energy: song.energy ?? 0.5,
    valence: song.valence ?? 0.5,
    danceability: song.danceability,
    acousticness: song.acousticness,
    instrumentalness: song.instrumentalness,
    loudness: song.loudness,
    speechiness: song.speechiness,
    liveness: song.liveness,
    timeSignature: song.timeSignature || '4/4',
    genre: song.genre || [],
    tags: [...new Set(tags)].slice(0, 5),
    lyrics: song.lyrics,
    lyricsSegments: song.lyricsSegments,
    lyricsAnalysis: song.lyricsAnalysis,
  };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Build releases from manifest using exported database as enrichment source
 */
export function buildReleasesFromManifestWithDatabase(
  manifestItems: any[],
  exportedSongs: Map<string, AnalysisData>
): Release[] {
  const offsets: Record<string, number> = {
    january: 0, february: 31, march: 59, april: 90, may: 120, june: 151,
    july: 181, august: 212, september: 243, october: 273, november: 304, december: 334
  };

  return manifestItems.map((item) => {
    const absDay = (offsets[item.month.toLowerCase()] ?? 0) + item.index;
    const storageTitle = item.storageTitle;
    
    // Try to find matching exported song data by storageTitle
    let songData: AnalysisData | undefined;
    
    for (const [filename, song] of exportedSongs) {
      // Match by title or filename (case-insensitive)
      if (
        song.title.toLowerCase() === storageTitle.toLowerCase() ||
        filename.includes(storageTitle.toLowerCase())
      ) {
        songData = song;
        break;
      }
    }
    
    // If we found exported data, use it; otherwise create basic release
    if (songData) {
      return analysisToRelease(songData, absDay, storageTitle);
    }
    
    // Fallback: minimal release from manifest only
    // Use local date to avoid timezone issues
    const releaseDate = new Date(2026, 0, 1);
    releaseDate.setDate(1 + absDay - 1); // Day 1 = Jan 1, etc.
    
    return {
      id: `${item.month}-${item.index}`,
      day: absDay,
      date: releaseDate.toISOString().split('T')[0],
      fileName: `${String(item.index).padStart(2, '0')} - ${storageTitle}.${item.ext}`,
      title: storageTitle,
      storageTitle,
      manifestAudioPath: item.audioPath,
      mood: 'light' as const,
      description: `A poetic entry from ${item.month}`,
      duration: 180,
      durationFormatted: '3:00',
      tempo: 100,
      key: 'C major',
      energy: 0.65,
      valence: 0.6,
      genre: item.genre || [],
      tags: item.tags || ['poetry', 'sonic', 'narrative'],
      lyrics: item.lyrics,
    } as Release;
  });
}

/**
 * Load and merge exported database
 */
export async function loadAndMergeDatabases(): Promise<Map<string, AnalysisData>> {
  return loadExportedDatabases();
}
