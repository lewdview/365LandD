// Supabase storage configuration for release-ready files
const SUPABASE_PROJECT_ID = 'pznmptudgicrmljjafex';
const BUCKET_NAME = 'releaseready';

// Base URL for the releaseready bucket
const STORAGE_BASE = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/${BUCKET_NAME}`;

/**
 * Get the audio URL for a release from the releaseready bucket
 * Format: /audio/january/01 - Dream.wav
 */
export function getReleaseAudioUrl(day: number, title: string, month: string = 'january'): string {
  const paddedDay = String(day).padStart(2, '0');
  const fileName = `${paddedDay} - ${title}.wav`;
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
 */
export function getCoverUrl(day: number, title: string): string {
  return getReleaseCoverUrl(day, title, getMonthFromDay(day));
}

/**
 * Local fallback URL for development
 */
export function getLocalAudioUrl(day: number, title: string): string {
  const paddedDay = String(day).padStart(2, '0');
  return `/music/${paddedDay} - ${title}.wav`;
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
