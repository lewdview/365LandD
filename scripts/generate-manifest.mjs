#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

// Config
const ROOT = process.cwd();
const BASE = path.join(ROOT, '365-releases');
const AUDIO_BASE = path.join(BASE, 'audio');
const COVERS_BASE = path.join(BASE, 'covers');
const PUBLIC_OUT = path.join(ROOT, 'public', 'release-manifest.json');

const MONTHS = [
  { name: 'january', days: 31 },
  { name: 'february', days: 29 }, // leap-safe; day->abs calc happens in app
  { name: 'march', days: 31 },
  { name: 'april', days: 30 },
  { name: 'may', days: 31 },
  { name: 'june', days: 30 },
  { name: 'july', days: 31 },
  { name: 'august', days: 31 },
  { name: 'september', days: 30 },
  { name: 'october', days: 31 },
  { name: 'november', days: 30 },
  { name: 'december', days: 31 },
];

function isAudio(name) {
  // Skip macOS artifact files
  if (name.startsWith('._')) return false;
  return /\.(wav|mp3|m4a|flac)$/i.test(name);
}
function isImage(name) {
  // Skip macOS artifact files
  if (name.startsWith('._')) return false;
  return /\.(jpg|jpeg|png)$/i.test(name);
}

function parseAudioFilename(filename) {
  // Expect: NN - Title.ext
  const m = filename.match(/^(\d{2})\s*-\s*(.+)\.(wav|mp3|m4a|flac)$/i);
  if (!m) return null;
  return { index: parseInt(m[1], 10), storageTitle: m[2], ext: m[3].toLowerCase() };
}

const items = [];

for (const { name: month } of MONTHS) {
  const monthAudioDir = path.join(AUDIO_BASE, month);
  if (!fs.existsSync(monthAudioDir)) continue;

  const files = fs.readdirSync(monthAudioDir).filter(isAudio).sort();
  for (const file of files) {
    const parsed = parseAudioFilename(file);
    if (!parsed) {
      console.warn(`[manifest] Skipping unexpected filename: ${month}/${file}`);
      continue;
    }
    const coverDir = path.join(COVERS_BASE, month);
    const hasCover = fs.existsSync(coverDir) && fs.readdirSync(coverDir).some(f => {
      if (!isImage(f)) return false;
      // Match prefix NN - Title (case-sensitive)
      return f.startsWith(String(parsed.index).padStart(2, '0') + ' - ' + parsed.storageTitle + '.');
    });

    items.push({
      month,
      index: parsed.index, // 1..31 within month
      storageTitle: parsed.storageTitle,
      ext: parsed.ext,
      audioPath: `audio/${month}/${encodeURIComponent(file)}`,
      coverPath: hasCover ? `covers/${month}/${encodeURIComponent(String(parsed.index).padStart(2, '0') + ' - ' + parsed.storageTitle + '.jpg')}` : null,
    });
  }
}

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  items,
};

fs.mkdirSync(path.dirname(PUBLIC_OUT), { recursive: true });
fs.writeFileSync(PUBLIC_OUT, JSON.stringify(manifest, null, 2));
console.log(`[manifest] Wrote ${items.length} items to ${path.relative(ROOT, PUBLIC_OUT)}`);
