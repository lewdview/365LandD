#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const MUSIC_DIR = '/Volumes/extremeDos/temp music';
const RELEASE_BASE = path.join(ROOT, '365-releases');
const AUDIO_BASE = path.join(RELEASE_BASE, 'audio');

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const MONTH_OFFSETS = {
  january: 0, february: 31, march: 59, april: 90, may: 120, june: 151,
  july: 181, august: 212, september: 243, october: 273, november: 304, december: 334
};

function getMonthForDay(day) {
  for (const [month, offset] of Object.entries(MONTH_OFFSETS)) {
    const daysInMonth = month === 'february' ? 29 : ['april', 'june', 'september', 'november'].includes(month) ? 30 : 31;
    if (day > offset && day <= offset + daysInMonth) {
      return month;
    }
  }
  return 'january';
}

function getMusicFiles() {
  if (!fs.existsSync(MUSIC_DIR)) {
    console.error(`Music directory not found: ${MUSIC_DIR}`);
    process.exit(1);
  }
  
  return fs.readdirSync(MUSIC_DIR)
    .filter(f => /\.(wav|mp3|flac|m4a)$/i.test(f) && !f.startsWith('._'))
    .sort();
}

console.log('🎵 Organizing 365 release files...\n');

// Create directory structure
for (const month of MONTHS) {
  const monthDir = path.join(AUDIO_BASE, month);
  fs.mkdirSync(monthDir, { recursive: true });
}

const files = getMusicFiles();
console.log(`Found ${files.length} audio files in ${MUSIC_DIR}\n`);

// Organize files: cycle through available files and place them in correct day positions
for (let day = 1; day <= 365; day++) {
  const month = getMonthForDay(day);
  const offset = MONTH_OFFSETS[month];
  const dayInMonth = day - offset;
  
  const fileIdx = (day - 1) % files.length;
  const srcFile = files[fileIdx];
  const srcPath = path.join(MUSIC_DIR, srcFile);
  
  // Extract extension
  const ext = srcFile.split('.').pop();
  
  // Parse original filename to get title
  const titleMatch = srcFile.match(/^\d+\s*-\s*(.+)\.\w+$/) || srcFile.match(/^(.+?)\.\w+$/);
  const title = titleMatch ? titleMatch[1].trim() : `Track ${dayInMonth}`;
  
  // Create destination filename: NN - Title.ext
  const destFileName = `${String(dayInMonth).padStart(2, '0')} - ${title}.${ext}`;
  const destDir = path.join(AUDIO_BASE, month);
  const destPath = path.join(destDir, destFileName);
  
  // Copy file
  try {
    fs.copyFileSync(srcPath, destPath);
    if (day % 50 === 0 || day === 1) {
      console.log(`✓ Day ${day} (${month}): ${destFileName}`);
    }
  } catch (err) {
    console.error(`✗ Failed to copy day ${day}: ${err.message}`);
  }
}

console.log(`\n✅ Organized 365 files into ${RELEASE_BASE}`);
console.log(`\nNext steps:`);
console.log(`1. Run: node scripts/generate-manifest.mjs`);
console.log(`2. Upload files to Supabase releaseready bucket`);
