#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, '365-releases', 'audio');
const DB_DIR = path.join(ROOT, 'db_output_json');
const OUT_FILE = path.join(ROOT, 'public', 'releases.local.json');

const SUPABASE_PROJECT_ID = 'pznmptudgicrmljjafex';
const BUCKET = 'releaseready';
const STORAGE_BASE = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET}`;

const MONTH_MAP = {
  january: 0, february: 31, march: 59, april: 90, may: 120, june: 151,
  july: 181, august: 212, september: 243, october: 273, november: 304, december: 334
};

const MONTHS = Object.keys(MONTH_MAP);

function monthFromDay(day) {
  for (const m of MONTHS) {
    const start = MONTH_MAP[m] + 1;
    const daysInMonth = m === 'february' ? 29 : ['april','june','september','november'].includes(m) ? 30 : 31;
    const end = MONTH_MAP[m] + daysInMonth;
    if (day >= start && day <= end) return m;
  }
  return 'january';
}

function pad2(n) { return String(n).padStart(2, '0'); }

function formatDuration(seconds) {
  if (!isFinite(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function safeTitle(title) {
  return (title || '').replace(/[\\/\\:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
}

function pick(val, fallback) { return val === undefined || val === null ? fallback : val; }

function loadJsonIfExists(p) {
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn(`[builder] Failed to parse ${path.basename(p)}:`, e.message);
  }
  return null;
}

// Load DB exports
const COMPLETE = loadJsonIfExists(path.join(DB_DIR, fs.readdirSync(DB_DIR).find(f => f.startsWith('database-complete-')) || ''));
const ANALYSIS = loadJsonIfExists(path.join(DB_DIR, fs.readdirSync(DB_DIR).find(f => f.startsWith('database-analysis-')) || ''));
const LYRICS = loadJsonIfExists(path.join(DB_DIR, fs.readdirSync(DB_DIR).find(f => f.startsWith('database-lyrics-')) || ''));
const TRANSCRIPT = loadJsonIfExists(path.join(DB_DIR, fs.readdirSync(DB_DIR).find(f => f.startsWith('database-transcription-')) || ''));

if (!COMPLETE || !Array.isArray(COMPLETE.songs)) {
  console.error('[builder] No valid database-complete export found in db_output_json');
  process.exit(1);
}

// Build enrichment maps by fileName and title (case-insensitive)
function byFileMap(dataset, songPath = 'songs') {
  const map = new Map();
  if (!dataset || !Array.isArray(dataset[songPath])) return map;
  for (const s of dataset[songPath]) {
    const fileName = (s.fileName || s.filename || '').toLowerCase();
    const title = (s.title || '').toLowerCase();
    if (fileName) map.set(fileName, s);
    if (title) map.set(title, s);
    if (s.id) map.set(s.id, s);
  }
  return map;
}

const analysisByFile = byFileMap(ANALYSIS);
const lyricsByFile = byFileMap(LYRICS);
const transcriptByFile = byFileMap(TRANSCRIPT);

// Normalize a DB song for merging with file data
function enrichSongFromDb(fileName, dbSong) {
  if (!dbSong) return {};
  
  const fileKey = fileName.toLowerCase();
  const a = analysisByFile.get(fileKey) || analysisByFile.get((dbSong.title || '').toLowerCase()) || {};
  const l = lyricsByFile.get(fileKey) || lyricsByFile.get((dbSong.title || '').toLowerCase()) || {};
  const t = transcriptByFile.get(fileKey) || transcriptByFile.get((dbSong.title || '').toLowerCase()) || {};

  // Audio features: prefer complete, then analysis
  const energy = pick(dbSong.energy, a.audio_features?.energy);
  const danceability = pick(dbSong.danceability, a.audio_features?.danceability);
  const valence = pick(dbSong.valence, a.audio_features?.valence);
  const acousticness = pick(dbSong.acousticness, a.audio_features?.acousticness);
  const instrumentalness = pick(dbSong.instrumentalness, a.audio_features?.instrumentalness);
  const loudness = pick(dbSong.loudness, a.audio_features?.loudness);
  const speechiness = pick(dbSong.speechiness, a.audio_features?.speechiness);
  const liveness = pick(dbSong.liveness, a.audio_features?.liveness);
  const tempo = Math.round(pick(dbSong.tempo, a.tempo || a.audio_features?.tempo || 0));
  const keySig = pick(dbSong.key, a.key || 'C major');
  const timeSignature = pick(dbSong.timeSignature, a.timeSignature || '4/4');
  
  // Genre and mood
  const genre = Array.from(new Set([...(dbSong.genre || []), ...(a.classification?.genres || [])])).filter(Boolean);
  const moodList = Array.from(new Set([...(dbSong.mood || []), ...(a.classification?.moods || [])])).filter(Boolean);

  // Lyrics + segments + words
  const lyrics = pick(dbSong.lyrics, a.lyrics?.text || l.lyrics || t.transcription?.text || '');
  const lyricsSegments = pick(dbSong.lyricsSegments, a.lyrics_segments || l.lyricsSegments || t.transcription?.segments) || [];
  const lyricsWords = pick(dbSong.lyricsWords, a.lyrics_words || l.lyricsWords || []) || [];

  // Sentiment/analysis
  const lyricsAnalysis = dbSong.lyricsAnalysis || a.lyrics_analysis || l.lyricsAnalysis || null;

  // Duration
  const duration = pick(dbSong.duration, a.duration || 0);

  return {
    energy, danceability, valence, acousticness, instrumentalness, loudness, speechiness, liveness,
    tempo, key: keySig, timeSignature,
    genre, moodList,
    lyrics, lyricsSegments, lyricsWords, lyricsAnalysis,
    duration,
    dbTitle: dbSong.title || '',
  };
}

// Scan audio files organized by month
const audioFiles = [];

if (fs.existsSync(AUDIO_DIR)) {
  for (const month of MONTHS) {
    const monthDir = path.join(AUDIO_DIR, month);
    if (!fs.existsSync(monthDir)) continue;
    
    const files = fs.readdirSync(monthDir)
      .filter(f => /\.(wav|mp3|flac|m4a)$/i.test(f) && !f.startsWith('._'))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/^(\d+)/)?.[1] || '0');
        const bNum = parseInt(b.match(/^(\d+)/)?.[1] || '0');
        return aNum - bNum;
      });

    for (const file of files) {
      const dayOfMonth = parseInt(file.match(/^(\d+)/)?.[1] || '0');
      const day = MONTH_MAP[month] + dayOfMonth;
      if (day >= 1 && day <= 365) {
        audioFiles.push({ day, month, fileName: file, path: path.join(monthDir, file) });
      }
    }
  }
}

audioFiles.sort((a, b) => a.day - b.day);

console.log(`[builder] Scanned ${audioFiles.length} audio files from ${AUDIO_DIR}`);

// Build releases from audio files + DB enrichment
const releases = audioFiles.slice(0, 365).map((audio) => {
  const { day, month, fileName: audioFileName } = audio;
  
  // Extract title from file name (remove leading number and extension)
  const titleMatch = audioFileName.replace(/^(\d+\s*-\s*)/, '').replace(/\.[^.]+$/, '');
  const cleanTitle = safeTitle(titleMatch);
  
  // Look up in DB by title or fileName
  let dbSong = null;
  let enrichment = {};
  
  // Try to find in DB by title
  const titleKey = cleanTitle.toLowerCase();
  let found = COMPLETE.songs.find(s => 
    (s.title || '').toLowerCase() === titleKey || 
    (s.fileName || '').toLowerCase().replace(/\.[^.]+$/, '').toLowerCase() === titleKey
  );
  
  if (found) {
    dbSong = found;
    enrichment = enrichSongFromDb(audioFileName, dbSong);
  } else {
    // If not found, just use the fileName title with no enrichment
    enrichment = {};
  }

  // Determine mood from valence or mood list
  const lowerMoods = (enrichment.moodList || []).map(m => String(m).toLowerCase());
  const hasDark = lowerMoods.some(m => /(dark|sad|melanch|intense|angry|void|grief)/.test(m));
  const hasLight = lowerMoods.some(m => /(upbeat|happy|joy|uplift|hope|energetic|playful|bright|light)/.test(m));
  let mood = 'light';
  if (enrichment.valence !== null && enrichment.valence !== undefined) {
    mood = enrichment.valence < 0.5 ? 'dark' : 'light';
  }
  if (hasDark && !hasLight) mood = 'dark';
  if (hasLight && !hasDark) mood = 'light';

  // Check if this is an error log placeholder
  const isErrorLog = audioFileName.includes('LOG_') || audioFileName.includes('PERMISSION_DENIED') || 
                      audioFileName.includes('REBOOT_SEQUENCE') || audioFileName.includes('CACHE_OVERFLOW_FULL');

  // Build storage URLs
  const storedAudioUrl = `${STORAGE_BASE}/audio/${month}/${encodeURIComponent(audioFileName)}`;
  const manifestAudioPath = `audio/${month}/${encodeURIComponent(audioFileName)}`;

  // Tags
  const tags = Array.from(new Set([...(enrichment.moodList || []).slice(0, 2), ...(enrichment.genre || []).slice(0, 1)]))
    .map(String).slice(0, 5);

  // Date
  const startDate = new Date('2026-01-01T00:00:00');
  const releaseDate = new Date(startDate);
  releaseDate.setDate(startDate.getDate() + day - 1);

  // Description
  let description = '';
  if (isErrorLog) {
    description = `System log entry: ${cleanTitle}`;
  } else if (enrichment.lyricsAnalysis?.themes?.length) {
    description = `A ${mood} entry touching ${enrichment.lyricsAnalysis.themes.slice(0, 2).join(' and ')}.`;
  } else if (enrichment.dbTitle) {
    description = `A ${mood} ${enrichment.tempo || 0} BPM piece in ${enrichment.key || 'C major'}.`;
  } else {
    description = `Day ${day}: ${cleanTitle}`;
  }

  return {
    id: dbSong?.id || `day-${day}`,
    day,
    date: releaseDate.toISOString().split('T')[0],
    fileName: audioFileName,
    title: dbSong?.title || cleanTitle,
    storageTitle: dbSong?.title || cleanTitle,
    manifestAudioPath,
    mood,
    description,
    storedAudioUrl,
    duration: Number(enrichment.duration || 0),
    durationFormatted: formatDuration(Number(enrichment.duration || 0)),
    tempo: Number(enrichment.tempo || 0),
    key: enrichment.key || 'C major',
    energy: Number(enrichment.energy ?? 0),
    valence: Number(enrichment.valence ?? 0.5),
    danceability: enrichment.danceability !== undefined ? Number(enrichment.danceability) : undefined,
    acousticness: enrichment.acousticness !== undefined ? Number(enrichment.acousticness) : undefined,
    instrumentalness: enrichment.instrumentalness !== undefined ? Number(enrichment.instrumentalness) : undefined,
    loudness: enrichment.loudness !== undefined ? Number(enrichment.loudness) : undefined,
    speechiness: enrichment.speechiness !== undefined ? Number(enrichment.speechiness) : undefined,
    liveness: enrichment.liveness !== undefined ? Number(enrichment.liveness) : undefined,
    timeSignature: enrichment.timeSignature,
    genre: enrichment.genre || [],
    tags,
    lyrics: enrichment.lyrics || '',
    lyricsSegments: Array.isArray(enrichment.lyricsSegments) ? enrichment.lyricsSegments : undefined,
    lyricsWords: Array.isArray(enrichment.lyricsWords) ? enrichment.lyricsWords : undefined,
    lyricsAnalysis: enrichment.lyricsAnalysis || undefined,
    isErrorLog,
  };
});

// Compute stats
const lightTracks = releases.filter(r => r.mood === 'light').length;
const darkTracks = releases.filter(r => r.mood === 'dark').length;
const errorLogs = releases.filter(r => r.isErrorLog).length;

const out = {
  project: {
    title: '365 Days of Light and Dark: Poetry in Motion',
    artist: 'th3scr1b3',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    description: 'One poetic entry a day — a living system that ebbs and flows.',
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
    errorLogs,
    totalListens: 0,
    lastUpdated: new Date().toISOString(),
  },
  announcements: [
    { id: 'ann-local-001', date: '2026-01-01', title: 'Local Preview', content: `Loaded ${releases.length} entries from organized audio files with DB enrichment.`, type: 'update' },
  ],
  upcomingMilestones: [
    { day: 1, title: 'Day One' },
    { day: 7, title: 'First Week' },
    { day: 30, title: 'Month 1 Complete' },
    { day: 60, title: 'Month 2 Complete' },
    { day: 90, title: 'Month 3 Complete' },
    { day: 180, title: 'Halfway' },
    { day: 365, title: 'Final Day' },
  ],
  monthThemes: [],
};

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2));
console.log(`[builder] Wrote ${releases.length} releases to ${path.relative(ROOT, OUT_FILE)}`);
console.log(`[builder] Light tracks: ${lightTracks}, Dark tracks: ${darkTracks}, Error logs: ${errorLogs}`);
