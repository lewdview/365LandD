export interface LyricSegment {
  start: number; // seconds
  end: number;   // seconds
  text: string;
}

export interface LyricWord {
  start: number; // seconds
  end: number;   // seconds
  word: string;
}

export interface LyricsAnalysis {
  mood: string[];
  themes: string[];
  emotion: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number;
  energyFromLyrics: number;
  valenceFromLyrics: number;
}

export interface Release {
  id: string;
  day: number;
  date: string;
  fileName: string;
  title: string;
  mood: 'light' | 'dark';
  description: string;
  youtubeUrl?: string;
  audiusUrl?: string;
  storedAudioUrl?: string;
  coverArt?: string;
  duration: number; // seconds
  durationFormatted: string;
  tempo: number;
  key: string;
  energy: number;
  valence: number;
  genre: string[];
  tags: string[];
  lyrics?: string;
  lyricsSegments?: LyricSegment[];
  lyricsWords?: LyricWord[];
  lyricsAnalysis?: LyricsAnalysis;
}

export interface ProjectInfo {
  title: string;
  artist: string;
  startDate: string;
  endDate: string;
  description: string;
  totalDays: number;
}

export interface Socials {
  youtube: string;
  audius: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  spotify: string;
}

export interface Stats {
  totalReleases: number;
  lightTracks: number;
  darkTracks: number;
  totalListens: number;
  lastUpdated: string;
}

export interface Announcement {
  id: string;
  date: string;
  title: string;
  content: string;
  type: 'milestone' | 'update' | 'news';
}

export interface Milestone {
  day: number;
  title: string;
}

export interface MonthTheme {
  month: number;
  name: string;
  dayStart: number;
  dayEnd: number;
  theme: string;
  arc: 'LIGHT' | 'DARK' | 'MIXED' | 'MIXED→LIGHT' | 'FULL LIGHT';
  emoji: string;
  description: string;
}

export interface ReleaseData {
  project: ProjectInfo;
  socials: Socials;
  releases: Release[];
  stats: Stats;
  announcements: Announcement[];
  upcomingMilestones: Milestone[];
  monthThemes: MonthTheme[];
}

// Raw song analysis from Supabase
export interface SongAnalysis {
  id: string;
  fileName: string;
  fileSize: number;
  duration: number;
  tempo: number;
  key: string;
  energy: number;
  danceability: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  loudness: number;
  speechiness: number;
  liveness: number;
  timeSignature: string;
  genre: string[];
  mood: string[];
  lyrics: string;
  lyricsSegments?: LyricSegment[];
  lyricsWords?: LyricWord[];
  lyricsAnalysis?: LyricsAnalysis;
  analyzedAt: string;
  storedAudioUrl?: string;
}
