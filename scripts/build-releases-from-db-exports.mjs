#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Config
const ROOT = process.cwd();
const DB_DIR = path.join(ROOT, 'db_output_json');
const OUT_FILE = path.join(ROOT, 'public', 'releases.local.json');

const SUPABASE_PROJECT_ID = 'pznmptudgicrmljjafex';
const BUCKET = 'releaseready';
const STORAGE_BASE = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET}`;

const MONTH_OFFSETS = {
  january: 0, february: 31, march: 59, april: 90, may: 120, june: 151,
  july: 181, august: 212, september: 243, october: 273, november: 304, december: 334
};
const MONTHS = Object.keys(MONTH_OFFSETS);

function monthFromDay(day) {
  for (const m of MONTHS) {
    const start = MONTH_OFFSETS[m] + 1;
    const daysInMonth = m === 'february' ? 29 : ['april','june','september','november'].includes(m) ? 30 : 31;
    const end = MONTH_OFFSETS[m] + daysInMonth;
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
  return (title || '').replace(/[\/\\:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim();
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

// Load available DB exports (prefer complete, then analysis/lyrics/transcription to enrich)
const COMPLETE = loadJsonIfExists(path.join(DB_DIR, fs.readdirSync(DB_DIR).find(f => f.startsWith('database-complete-')) || ''));
const ANALYSIS = loadJsonIfExists(path.join(DB_DIR, fs.readdirSync(DB_DIR).find(f => f.startsWith('database-analysis-')) || ''));
const LYRICS = loadJsonIfExists(path.join(DB_DIR, fs.readdirSync(DB_DIR).find(f => f.startsWith('database-lyrics-')) || ''));
const TRANSCRIPT = loadJsonIfExists(path.join(DB_DIR, fs.readdirSync(DB_DIR).find(f => f.startsWith('database-transcription-')) || ''));

if (!COMPLETE || !Array.isArray(COMPLETE.songs)) {
  console.error('[builder] No valid database-complete export found in db_output_json');
  process.exit(1);
}

// Build enrichment maps by fileName (lowercased)
function byFileMap(dataset, songPath = 'songs') {
  const map = new Map();
  if (!dataset || !Array.isArray(dataset[songPath])) return map;
  for (const s of dataset[songPath]) {
    const key = (s.fileName || s.filename || s.id || '').toLowerCase();
    if (!key) continue;
    map.set(key, s);
  }
  return map;
}

const analysisByFile = byFileMap(ANALYSIS);
const lyricsByFile = byFileMap(LYRICS);
const transcriptByFile = byFileMap(TRANSCRIPT);

// Normalize COMPLETE entries into song objects we can map to Releases
function normalizeSong(s) {
  // Prefer title field, else derive from fileName
  const baseTitle = safeTitle(s.title || (s.fileName || '').replace(/\.(wav|mp3|flac|m4a)$/i, '').replace(/[_-]+/g, ' '));
  const ext = (s.fileName && s.fileName.split('.').pop()) || 'wav';
  const fileKey = (s.fileName || '').toLowerCase();

  // Enrich from other datasets if available
  const a = analysisByFile.get(fileKey) || {};
  const l = lyricsByFile.get(fileKey) || {};
  const t = transcriptByFile.get(fileKey) || {};

  // Prefer fields from COMPLETE, fall back to analysis dataset naming if needed
  const energy = pick(s.energy, a.audio_features?.energy);
  const danceability = pick(s.danceability, a.audio_features?.danceability);
  const valence = pick(s.valence, a.audio_features?.valence);
  const acousticness = pick(s.acousticness, a.audio_features?.acousticness);
  const instrumentalness = pick(s.instrumentalness, a.audio_features?.instrumentalness);
  const loudness = pick(s.loudness, a.audio_features?.loudness);
  const speechiness = pick(s.speechiness, a.audio_features?.speechiness);
  const liveness = pick(s.liveness, a.audio_features?.liveness);
  const tempo = Math.round(pick(s.tempo, a.tempo || a.audio_features?.tempo || 0));
  const keySig = pick(s.key, a.key || 'C major');
  const timeSignature = pick(s.timeSignature, a.timeSignature || '4/4');
  const genre = Array.from(new Set([...(s.genre || []), ...(a.classification?.genres || [])])).filter(Boolean);
  const mood = Array.from(new Set([...(s.mood || []), ...(a.classification?.moods || [])])).filter(Boolean);

  // Lyrics + segments/words
  const lyrics = pick(s.lyrics, a.lyrics?.text || l.lyrics || t.transcription?.text || '');
  const lyricsSegments = pick(s.lyricsSegments, a.lyrics_segments || l.lyricsSegments || t.transcription?.segments) || [];
  const lyricsWords = pick(s.lyricsWords, a.lyrics_words || l.lyricsWords || []) || [];

  // Sentiment / analysis
  const lyricsAnalysis = s.lyricsAnalysis || a.lyrics_analysis || l.lyricsAnalysis || null;

  // analyzedAt used for sorting; fall back to file mtime ordering later
  const analyzedAt = s.analyzedAt || a.analyzedAt || null;

  // Duration (seconds); prefer COMPLETE
  const duration = pick(s.duration, a.duration || 0);

  return {
    id: s.id || baseTitle,
    fileName: s.fileName || `${baseTitle}.${ext}`,
    title: baseTitle,
    ext: (ext || 'wav').toLowerCase(),
    duration,
    energy, danceability, valence, acousticness, instrumentalness, loudness, speechiness, liveness,
    tempo, key: keySig, timeSignature,
    genre, mood,
    lyrics, lyricsSegments, lyricsWords, lyricsAnalysis,
    analyzedAt,
  };
}

const songs = COMPLETE.songs.map(normalizeSong);

// Sort by analyzedAt if available, fallback to title
songs.sort((a, b) => {
  const ta = a.analyzedAt ? Date.parse(a.analyzedAt) : 0;
  const tb = b.analyzedAt ? Date.parse(b.analyzedAt) : 0;
  if (ta !== tb) return ta - tb;
  return a.title.localeCompare(b.title);
});

// Map songs to Release objects (limit to 365)
const releases = songs.slice(0, 365).map((s, idx) => {
  const day = idx + 1;
  const month = monthFromDay(day);
  const fileName = `${pad2(day - MONTH_OFFSETS[month])} - ${s.title}.${s.ext}`;
  const durationFormatted = formatDuration(Number(s.duration || 0));

  // Mood determination: simple rule combining valence and mood words
  const lowerMoods = (s.mood || []).map(m => String(m).toLowerCase());
  const hasDark = lowerMoods.some(m => /(dark|sad|melanch|intense|angry|void|grief)/.test(m));
  const hasLight = lowerMoods.some(m => /(upbeat|happy|joy|uplift|hope|energetic|playful|bright|light)/.test(m));
  let mood = 'light';
  if (s.valence !== null && s.valence !== undefined) {
    mood = s.valence < 0.5 ? 'dark' : 'light';
  }
  if (hasDark && !hasLight) mood = 'dark';
  if (hasLight && !hasDark) mood = 'light';

  // Build storage URLs
  const storedAudioUrl = `${STORAGE_BASE}/audio/${month}/${encodeURIComponent(fileName)}`;
  const manifestAudioPath = `audio/${month}/${encodeURIComponent(fileName)}`;

  // Tags: first 2 moods + first genre + up to 5
  const tags = Array.from(new Set([...(s.mood || []).slice(0, 2), ...(s.genre || []).slice(0, 1)])).map(String).slice(0, 5);

  // Derive date from project start (2026-01-01)
  const startDate = new Date('2026-01-01T00:00:00');
  const releaseDate = new Date(startDate);
  releaseDate.setDate(startDate.getDate() + day - 1);

  return {
    id: s.id,
    day,
    date: releaseDate.toISOString().split('T')[0],
    fileName,
    title: s.title,
    storageTitle: s.title,
    manifestAudioPath,
    mood,
    description: s.lyricsAnalysis?.themes?.length ? `A ${mood} entry touching ${s.lyricsAnalysis.themes.slice(0,2).join(' and ')}.` : `A ${mood} ${s.tempo || 0} BPM piece in ${s.key}.`,
    storedAudioUrl,
    duration: Number(s.duration || 0),
    durationFormatted,
    tempo: Number(s.tempo || 0),
    key: s.key,
    energy: Number(s.energy ?? 0),
    valence: Number(s.valence ?? 0.5),
    danceability: s.danceability !== undefined ? Number(s.danceability) : undefined,
    acousticness: s.acousticness !== undefined ? Number(s.acousticness) : undefined,
    instrumentalness: s.instrumentalness !== undefined ? Number(s.instrumentalness) : undefined,
    loudness: s.loudness !== undefined ? Number(s.loudness) : undefined,
    speechiness: s.speechiness !== undefined ? Number(s.speechiness) : undefined,
    liveness: s.liveness !== undefined ? Number(s.liveness) : undefined,
    timeSignature: s.timeSignature,
    genre: s.genre || [],
    tags,
    lyrics: s.lyrics || '',
    lyricsSegments: Array.isArray(s.lyricsSegments) ? s.lyricsSegments : undefined,
    lyricsWords: Array.isArray(s.lyricsWords) ? s.lyricsWords : undefined,
    lyricsAnalysis: s.lyricsAnalysis || undefined,
  };
});

// Compute stats
const lightTracks = releases.filter(r => r.mood === 'light').length;
const darkTracks = releases.filter(r => r.mood === 'dark').length;

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
    totalListens: 0,
    lastUpdated: new Date().toISOString(),
  },
  announcements: [
    { id: 'ann-local-001', date: '2026-01-01', title: 'Local Preview', content: `Loaded ${releases.length} entries from DB exports.`, type: 'update' },
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
