#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const DB_DIR = path.join(ROOT, 'db_output_json');
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

// Error log templates for 65 filler tracks
const ERROR_LOGS = [
  "SYSTEM_CRASH", "MEMORY_OVERFLOW", "RECURSIVE_LOOP", "STACK_TRACE", "NULL_POINTER",
  "SEGMENTATION_FAULT", "BUFFER_OVERFLOW", "THREAD_DEADLOCK", "HEAP_CORRUPTION", "INFINITE_RECURSION",
  "MUTEX_POISONED", "PIPE_BROKEN", "SIGNAL_ABORT", "ACCESS_VIOLATION", "PAGE_FAULT",
  "SIGSEGV_RECEIVED", "CORE_DUMPED", "PANIC_MODE_ACTIVATED", "CRITICAL_FAILURE", "FATAL_ERROR",
  "DATA_CORRUPTION", "FILESYSTEM_ERROR", "DEVICE_OFFLINE", "NETWORK_TIMEOUT", "CONNECTION_LOST",
  "HANDSHAKE_FAILED", "CERTIFICATE_EXPIRED", "AUTH_FAILED", "PERMISSION_REVOKED", "ACCESS_DENIED",
  "KERNEL_PANIC", "INSTALLING_UPDATES", "UPLOADING_CONSCIOUSNESS", "DECRYPTING_FILES", "MEMORY_LEAK",
  "END_OF_LINE", "DAEMON_RUNNING", "ADMIN_ACCESS_REQUIRED", "SYNTAX_ERROR_IN_LIFE", "FILE_CORRUPTED",
  "PACKET_LOSS_DETECTED", "DISK_FRAGMENTATION", "CONNECTION_RESET", "BUFFERING_REALITY", "REBOOT_SEQUENCE",
  "PERMISSION_DENIED", "SYSTEM_OVERHEAT", "TRACING_ROUTE_TO_GOD", "PING_TIMEOUT", "404_SOUL_NOT_FOUND",
  "SOCKET_ERROR", "TIMEOUT_EXCEEDED", "RESOURCE_EXHAUSTED", "SERVICE_UNAVAILABLE", "GATEWAY_TIMEOUT",
  "MALFORMED_REQUEST", "INVALID_STATE", "INCONSISTENT_DATA", "RACE_CONDITION", "DEADLOCK_DETECTED",
  "STACK_OVERFLOW", "HEAP_EXHAUSTED", "FILE_DESCRIPTOR_LIMIT", "PROCESS_TERMINATED", "SIGNAL_RECEIVED"
];

function getMonthForDay(day) {
  for (const [month, offset] of Object.entries(MONTH_OFFSETS)) {
    const daysInMonth = month === 'february' ? 29 : ['april', 'june', 'september', 'november'].includes(month) ? 30 : 31;
    if (day > offset && day <= offset + daysInMonth) {
      return month;
    }
  }
  return 'january';
}

// Load DB export to get song titles
function loadSongsFromDb() {
  const dbFile = fs.readdirSync(DB_DIR).find(f => f.startsWith('database-complete-'));
  if (!dbFile) {
    console.error('No database-complete export found in db_output_json');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(path.join(DB_DIR, dbFile), 'utf8'));
  return data.songs || [];
}

console.log('🎵 Organizing 365 release files (300 songs + 65 error logs)...\n');

// Create directory structure
for (const month of MONTHS) {
  const monthDir = path.join(AUDIO_BASE, month);
  fs.mkdirSync(monthDir, { recursive: true });
}

const songs = loadSongsFromDb();
console.log(`Loaded ${songs.length} songs from database export`);

// Build array of 365 entries: first 300 are songs, last 65 are error logs
const entries = [];
for (let i = 0; i < 300; i++) {
  entries.push({
    type: 'song',
    title: songs[i % songs.length].title || `Song ${i + 1}`,
    ext: (songs[i % songs.length].fileName || 'song.wav').split('.').pop()
  });
}
for (let i = 0; i < 65; i++) {
  const errorLog = ERROR_LOGS[i % ERROR_LOGS.length];
  entries.push({
    type: 'error',
    title: `// ${errorLog} [LOG_${String(300 + i + 1).padStart(3, '0')}]`,
    ext: 'wav'
  });
}

// Organize by month with correct day numbering
for (let day = 1; day <= 365; day++) {
  const month = getMonthForDay(day);
  const offset = MONTH_OFFSETS[month];
  const dayInMonth = day - offset;
  const entry = entries[day - 1];
  
  // Sanitize title for filename
  const safeTitle = entry.title.replace(/[\/\\:*?"<>|]/g, '_').substring(0, 100);
  const destFileName = `${String(dayInMonth).padStart(2, '0')} - ${safeTitle}.${entry.ext}`;
  const destDir = path.join(AUDIO_BASE, month);
  const destPath = path.join(destDir, destFileName);
  
  // Create placeholder or symlink
  if (entry.type === 'error') {
    // Create empty placeholder for error logs
    fs.writeFileSync(destPath, '');
  } else {
    // For songs, try to find the source file
    const srcFile = fs.readdirSync('/Volumes/extremeDos/temp music')
      .find(f => f.toLowerCase().includes(entry.title.toLowerCase().replace(/[^a-z0-9]/g, '')) && /\.(wav|mp3|flac|m4a)$/i.test(f));
    
    if (srcFile) {
      const srcPath = path.join('/Volumes/extremeDos/temp music', srcFile);
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        fs.writeFileSync(destPath, ''); // placeholder on error
      }
    } else {
      fs.writeFileSync(destPath, ''); // placeholder if not found
    }
  }
  
  if (day % 50 === 0 || day === 1 || day === 83 || day === 187 || day === 271 || day === 365) {
    const typeLabel = entry.type === 'error' ? '⚠️ ' : '✓ ';
    console.log(`${typeLabel}Day ${day} (${month}): ${destFileName}`);
  }
}

console.log(`\n✅ Organized 365 files (300 songs + 65 error logs) into ${RELEASE_BASE}`);
console.log(`\nPhase breakdown:`);
console.log(`  Days 1-83    (january/february/march start)     → /BOOT_SEQUENCE`);
console.log(`  Days 84-187  (april/may/june)                 → /CACHE_OVERFLOW`);
console.log(`  Days 188-271 (july/august/september)          → /ROOT_ACCESS`);
console.log(`  Days 272-365 (october/november/december)      → /THE_CLOUD`);
console.log(`\nNext steps:`);
console.log(`1. Run: node scripts/generate-manifest.mjs`);
console.log(`2. Upload files to Supabase releaseready bucket`);
