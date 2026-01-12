// Supabase storage configuration for release-ready files
const SUPABASE_PROJECT_ID = 'pznmptudgicrmljjafex';
const BUCKET_NAME = 'releaseready';

// Base URL for the releaseready bucket
const STORAGE_BASE = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}`;

// Days that use .mp3 instead of .wav (in January)
const MP3_DAYS = [13, 18, 21, 26];

/**
 * Get the audio URL for a release from the releaseready bucket
 * Format: /audio/january/01 - Dream.wav (or .mp3 for specific tracks)
 */
export function getReleaseAudioUrl(day: number, title: string, month: string = 'january', ext?: string): string {
  const paddedDay = String(day).padStart(2, '0');
  // Use provided extension, or check if it's a known mp3 day, otherwise default to wav
  const extension = ext || (MP3_DAYS.includes(day) ? 'mp3' : 'wav');
  const fileName = `${paddedDay} - ${title}.${extension}`;
  return `${STORAGE_BASE}/audio/${month.toLowerCase()}/${encodeURIComponent(fileName)}`;
}

/**
 * Get the cover image URL for a release from the releaseready bucket
 * Format: /covers/january/01 - Dream.jpg
 */
export function getReleaseCoverUrl(day: number, title: string, month: string = 'january'): string {
  const paddedDay = String(day).padStart(2, '0');
  const fileName = `${paddedDay} - ${title}.jpg`;
  return `${STORAGE_BASE}/covers/${month.toLowerCase()}/${encodeURIComponent(fileName)}`;
}

/**
 * Get month name from day number
 */
export function getMonthFromDay(day: number): string {
  const months = [
    { name: 'january', start: 1, end: 31 },
    { name: 'february', start: 32, end: 59 },
    { name: 'march', start: 60, end: 90 },
    { name: 'april', start: 91, end: 120 },
    { name: 'may', start: 121, end: 151 },
    { name: 'june', start: 152, end: 181 },
    { name: 'july', start: 182, end: 212 },
    { name: 'august', start: 213, end: 243 },
    { name: 'september', start: 244, end: 273 },
    { name: 'october', start: 274, end: 304 },
    { name: 'november', start: 305, end: 334 },
    { name: 'december', start: 335, end: 365 },
  ];
  
  for (const m of months) {
    if (day >= m.start && day <= m.end) {
      return m.name;
    }
  }
  return 'january';
}

/**
 * Get audio URL using day number and title (auto-detects month)
 */
export function getAudioUrl(day: number, title: string): string {
  return getReleaseAudioUrl(day, title, getMonthFromDay(day));
}

/**
 * Get cover URL using day number and title (auto-detects month)
 * Uses releaseready bucket from Supabase
 */
export function getCoverUrl(day: number, title: string): string {
  return getReleaseCoverUrl(day, title, getMonthFromDay(day));
}

/**
 * Build releaseready bucket URL for audio from day and title
 * Tries multiple extensions (.wav, .mp3, .flac, .m4a) to find the file
 */
export function getReleaseReadyAudioUrl(day: number, title: string): string {
  const month = getMonthFromDay(day);
  const paddedDay = String(day).padStart(2, '0');
  // Try the most likely format first (.wav), but the actual URL will be tried in order by the caller
  const fileName = `${paddedDay} - ${title}.wav`;
  return `${STORAGE_BASE}/audio/${month.toLowerCase()}/${encodeURIComponent(fileName)}`;
}

/**
 * Get alternative audio URLs to try (for fallback)
 */
export function getReleaseAudioUrlVariations(day: number, title: string): string[] {
  const month = getMonthFromDay(day);
  const paddedDay = String(day).padStart(2, '0');
  const extensions = ['wav', 'mp3', 'flac', 'm4a'];
  return extensions.map(ext => {
    const fileName = `${paddedDay} - ${title}.${ext}`;
    return `${STORAGE_BASE}/audio/${month.toLowerCase()}/${encodeURIComponent(fileName)}`;
  });
}

/**
 * Local fallback URLs for development (try multiple extensions)
 */
export function getLocalAudioUrls(day: number, title: string): string[] {
  const paddedDay = String(day).padStart(2, '0');
  const month = getMonthFromDay(day);
  const extensions = ['wav', 'mp3', 'flac', 'm4a'];
  return extensions.map(ext => `/music/${month}/${paddedDay} - ${title}.${ext}`);
}

/**
 * Check if a URL is accessible (for fallback logic)
 */
export async function checkUrlAccessible(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
