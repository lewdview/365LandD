/**
 * Local Audio Fallback Service
 * 
 * In development, when Supabase audio storage fails (404s), 
 * this provides fallback URLs to local audio files.
 * 
 * The public/music symlink points to /Volumes/extremeDos/temp music
 * So files are served at /music/filename.wav
 */

const isDev = import.meta.env.DEV;

// Local audio folder path (symlinked in public/)
const LOCAL_AUDIO_PATH = '/music';

// Check if an audio URL is accessible
export async function checkAudioUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

// Get a working audio URL with fallback to local files
export async function getWorkingAudioUrl(
  storedAudioUrl: string | undefined,
  fileName: string
): Promise<string | undefined> {
  // Try stored URL first (Supabase)
  if (storedAudioUrl) {
    const isValid = await checkAudioUrl(storedAudioUrl);
    if (isValid) {
      return storedAudioUrl;
    }
    console.warn(`[Audio] Supabase URL not accessible: ${storedAudioUrl}`);
  }
  
  // In dev, try local fallback via symlink
  if (isDev && fileName) {
    // Try the exact filename first
    const localUrl = `${LOCAL_AUDIO_PATH}/${encodeURIComponent(fileName)}`;
    const isValid = await checkAudioUrl(localUrl);
    if (isValid) {
      console.log(`[Audio] Using local fallback: ${localUrl}`);
      return localUrl;
    }
    
    // Try without extension variations
    const baseName = fileName.replace(/\.(mp3|wav|flac|m4a)$/i, '');
    const extensions = ['.wav', '.mp3', '.flac', '.m4a'];
    
    for (const ext of extensions) {
      const tryUrl = `${LOCAL_AUDIO_PATH}/${encodeURIComponent(baseName + ext)}`;
      const valid = await checkAudioUrl(tryUrl);
      if (valid) {
        console.log(`[Audio] Using local fallback: ${tryUrl}`);
        return tryUrl;
      }
    }
    
    console.warn(`[Audio] No local file found for: ${fileName}`);
  }
  
  return undefined;
}

// Synchronous version that just returns the best guess URL
// (use when you can't await)
export function resolveAudioUrl(
  storedAudioUrl: string | undefined,
  fileName: string
): string | undefined {
  // If we have a stored URL, return it (let it fail at playback if broken)
  if (storedAudioUrl) {
    return storedAudioUrl;
  }
  
  // In development, try local path
  if (isDev && fileName) {
    return `${LOCAL_AUDIO_PATH}/${encodeURIComponent(fileName)}`;
  }
  
  return undefined;
}

// List available local audio files (for debugging)
export async function listLocalAudioFiles(): Promise<string[]> {
  if (!isDev) return [];
  
  try {
    // This would need a server endpoint to list files
    // For now, just return empty
    console.log('[Audio] Local audio path:', LOCAL_AUDIO_PATH);
    return [];
  } catch {
    return [];
  }
}
