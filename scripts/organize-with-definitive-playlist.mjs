#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

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

// Definitive 365-day playlist with strategic error logs
const DEFINITIVE_PLAYLIST = [
  // DIRECTORY A: /BOOT_SEQUENCE (Days 1–83)
  'Were Going Crazy World',
  'Shhh Bitch',
  'You Like Steve Earle',
  'Were Only Humanmd7',
  'Swooped COUPE',
  'Ss Take One',
  'Devour',
  'Poetry',
  'Without You',
  '// PERMISSION_DENIED [LOG_108]',
  'Getting Better',
  'LANDR Want It Any Other Way Open Low',
  'Dashboard of Life',
  'Undercoa 4',
  'What Bryan Was Working on Last',
  'Prevail Scriber',
  'What It Is',
  'Goods 4 Me',
  'Through the Ringer',
  'Figures',
  'Highup',
  '// REBOOT_SEQUENCE [LOG_109]',
  'Come on Dance',
  'Be Here Boo',
  'Grenada',
  'Brave',
  'Talkin Nody',
  'LANDR Smoothie Balanced Medium',
  'Cursed 2ndmix',
  'To Be a Man',
  'Scars in My Mind',
  'Whatuwant',
  'Bettersion of Me',
  'Consation W',
  'The Light',
  '// 404_SOUL_NOT_FOUND [LOG_101]',
  'Camebackaroudnd',
  'Eco N Time',
  'Up All Night',
  'Way Eight Fore Dat Storm Level',
  'Be Nuter',
  'Xzibit Forever',
  'Pit What I Got',
  'Not Good Enough',
  'LANDR a Way Out Mas Balanced Medium',
  'Mikeym',
  'Filthy',
  'Unforgettable',
  'Dreams Again',
  '// DAEMON_RUNNING [LOG_102]',
  'Change Perception',
  'Bitter Better',
  'The End',
  'Tryied',
  'Tried N True',
  "Can't Go Back",
  'Momentofexctasy',
  'Awaits',
  'Reality',
  'Moment of Exctasy',
  'Re',
  'Friendzone',
  'Never Ends',
  '// CONNECTION_RESET [LOG_100]',
  'Untied',
  'Luckyland',
  'Letitgo',
  'From the Earth to the Sea Flipped Mask',
  'Save Tonight',
  'Sau',
  'A Girl',
  'Isitthathard',
  'Kurtcobain',
  'Low Life',
  '// PING_TIMEOUT [LOG_106]',
  'Benefits Me',
  'Rabbit Hole',
  "Choppmed of F Ya Feel Rough'",
  'Lightburst',
  'Monetary',
  'Get Ghost',
  '// ADMIN_ACCESS_REQUIRED [LOG_107]',
  'Jacy B',
  
  // DIRECTORY B: /CACHE_OVERFLOW (Days 84–187)
  'LANDR Self Dick Mas Balanced Medium',
  'Odosed',
  'Your Choice',
  'LANDR Scars in My Mind M Balanced Medium',
  'Cheat Code',
  'Peacefullypeace',
  'Killing Me',
  '// UPLOADING_CONSCIOUSNESS... [LOG_134]',
  '// KERNEL_PANIC [LOG_135]',
  '// INSTALLING_UPDATES... [LOG_136]',
  'Pop',
  '// 404_SOUL_NOT_FOUND [LOG_124]',
  'Dream',
  'Cold As Ice',
  'Unifying',
  '// DAEMON_RUNNING [LOG_128]',
  'LANDR Here I Go Again 1 Warm High',
  'Demon Soul',
  '// ADMIN_ACCESS_REQUIRED [LOG_114]',
  'My Way',
  'LANDR Dance Floor Balanced Medium',
  'Gasp',
  'No Matter the Pain',
  '// DECRYPTING_FILES... [LOG_119]',
  '// UPLOADING_CONSCIOUSNESS... [LOG_138]',
  'Wish I Was Dead',
  'LANDR-stay and i go-Balanced-Medium',
  '// MEMORY_LEAK [LOG_126]',
  'Double Agent',
  'One Bye One',
  '// UPLOADING_CONSCIOUSNESS... [LOG_131]',
  'A Fine Sin Remix',
  'Quite the Lie 1',
  'LANDR Finding HOME Neut Balanced Medium',
  'Get High with Me',
  '// END_OF_LINE [LOG_121]',
  'Self Dick',
  'Tainted Gospal',
  '// SYSTEM_OVERHEAT [LOG_118]',
  'Burn It to the Ground Gapless',
  'Te Amo',
  '// PING_TIMEOUT [LOG_117]',
  'Why U Lie',
  'Pure Popped',
  '// TRACING_ROUTE_TO_GOD [LOG_112]',
  'Cant Escape Mas',
  'Airwaves Feat Zillick',
  '// SYNTAX_ERROR_IN_LIFE [LOG_110]',
  'Oldenside of You',
  '// SYNTAX_ERROR_IN_LIFE [LOG_120]',
  'Bye Bi',
  '// BUFFERING_REALITY [LOG_133]',
  'Get Naughty',
  'Little Light',
  'OLB Remix 2',
  'Believing in Just',
  'Come Around Persiuin',
  'Nostic Heresy',
  'If You Come Along',
  'Come Together',
  '// REBOOT_SEQUENCE [LOG_111]',
  '// TRACING_ROUTE_TO_GOD [LOG_137]',
  'Grin Nada',
  'Get It in',
  'Breaking M E',
  'LANDR Burning It Down Co Balanced Medium',
  '// FILE_CORRUPTED [LOG_122]',
  '// PACKET_LOSS_DETECTED [LOG_130]',
  'Aborted',
  '// DISK_FRAGMENTATION [LOG_123]',
  '// CONNECTION_RESET [LOG_139]',
  'Fast Life',
  'Shawty Not a Hottie',
  '// MEMORY_LEAK [LOG_132]',
  'Starshining',
  'On Sight',
  '// FILE_CORRUPTED [LOG_113]',
  'Wishingwell',
  '// PACKET_LOSS_DETECTED [LOG_125]',
  'World Ending',
  'OLB Remix',
  'LANDR This H Balanced Medium',
  'Bright Day',
  'Natural Disaster',
  'Abandon',
  'echoes.of.the.abyss.votd',
  '// REBOOT_SEQUENCE [LOG_115]',
  'Addicted',
  'Left on Red',
  '// SYSTEM_OVERHEAT [LOG_127]',
  'LANDR Crying Lil Bitch Balanced Medium REV',
  'Monday Ta Wenday Ta Friday',
  'Dirt Road',
  'Leave Me Dead',
  '// PERMISSION_DENIED [LOG_116]',
  'Fly Away Again',
  'Malibu',
  'Loss',
  'ONE LAST Breath 3',
  'Against the Grain',
  "You're Alwats on My Mind",
  'Trippie',
  'Life Succubus',
  'Afinesin',
  
  // DIRECTORY C: /ROOT_ACCESS (Days 188–271)
  'Flicker Like Fire',
  'Fundrip',
  'Sometimes',
  '// MEMORY_LEAK [LOG_149]',
  'Isolkated',
  'Spaces',
  'To Myself',
  'Standing on E',
  'Buck Im Here Yto Fuck',
  'Riddle',
  'Hhhhhhhhhhhhh',
  'Surrender to U',
  '// END_OF_LINE [LOG_145]',
  'Backroads',
  'LANDR Take Me Away Take Blenmd Warm Low',
  'Missing You',
  'Maybe Baby Itts on Me',
  'True Lies',
  'Find Her Demo Entire Mix',
  '4u',
  'Away Goes',
  'Emotuional Healing Mas',
  'Feel It',
  '// PACKET_LOSS_DETECTED [LOG_146]',
  'Nostalgic Energby',
  'Nick Snuff M3',
  'Wasted by What',
  'What Is God Withoot Me',
  'Paid the World Back Beat',
  'LANDR If You Leave0 Open Low',
  '// FILE_CORRUPTED [LOG_140]',
  'Flowers of Us',
  'Cant Have',
  'Footsteps',
  '// SYNTAX_ERROR_IN_LIFE [LOG_144]',
  '// FILE_CORRUPTED [LOG_147]',
  'Complicated S',
  'Speed of Pain',
  'Unloved',
  '// CONNECTION_RESET [LOG_141]',
  'Faint Copy',
  '// DAEMON_RUNNING [LOG_148]',
  'Live Forefeat Xzibit',
  '// SYSTEM_OVERHEAT [LOG_143]',
  'Ngbt1',
  'Dreams Shattered',
  'Maybe Baby',
  'Diamond Death',
  'A Stop in Time',
  'Dont Ghost Me',
  '// TRACING_ROUTE_TO_GOD [LOG_142]',
  'Poth',
  'Sicko',
  'Adrift',
  'Dark Thoughts',
  'Mystery',
  'Message 4 K Comp M1',
  '// PERMISSION_DENIED [LOG_150]',
  'Hemmorage',
  'Monetary T',
  'D and D',
  'Blackout',
  'Sirens',
  'Running',
  'Fuck B',
  'Get Oyou',
  'Only Time Will Tell',
  'Far Away',
  'Hades',
  'Midnight Piano',
  'Johnny DEMON',
  'Sunset',
  'Purple Sky',
  'Darewell',
  'Alien 2nd Mix',
  'Purpose',
  'Grave Robber',
  'Too Late Fawy',
  'Clebit',
  'LANDR Hemmorage 1 Open Medium',
  'Sweater',
  'What You Know',
  'Falling Apart',
  'PULSE',
  
  // DIRECTORY D: /THE_CLOUD (Days 272–365)
  // Original 77 + 4 new songs = 81 total
  'Say It Up',
  'Awe Ofu',
  'Outlast',
  'Mylight', // NEW
  'Lightgoesin', // NEW
  'Starlight',
  'Prevail',
  'Hatedown',
  'Falllin',
  'Haert N Soul Collide',
  'Exhale',
  '// END_OF_LINE [LOG_166]',
  'My Sacrifices',
  '// KERNEL_PANIC [LOG_156]',
  '// KERNEL_PANIC [LOG_158]',
  '// INSTALLING_UPDATES... [LOG_163]',
  'LANDR Love for You Balanced Medium',
  'Beat 2 O',
  'No Place 2 Hide',
  'Chunky',
  '// REBOOT_SEQUENCE [LOG_161]',
  'You Know You 2e',
  'Wysiwyg',
  'Sing to Me',
  'Open All Night',
  'Trip',
  'Burning It Down Comd2',
  'It Wont Take Lolng',
  '// SYNTAX_ERROR_IN_LIFE [LOG_167]',
  '// UPLOADING_CONSCIOUSNESS... [LOG_155]',
  'LANDR Sweet You Warm Medium',
  '// ADMIN_ACCESS_REQUIRED [LOG_151]',
  'Locked Up',
  'Negonnas Stop Loving You',
  '// INSTALLING_UPDATES... [LOG_154]',
  'Hard to Ignore',
  'Open Wide',
  'Be Altm',
  "It's Gonna Be Alright",
  '// PING_TIMEOUT [LOG_153]',
  'Feel Good',
  'Wrap That',
  '// DECRYPTING_FILES... [LOG_152]',
  'Trip Into Background',
  'Entropy',
  'Odds',
  'Go Get It',
  'Come Along with Me',
  'She Said Lil Richard Where Da Fux U',
  'Dont Blame U',
  'Yourbody',
  '// ADMIN_ACCESS_REQUIRED [LOG_165]',
  'Advice 2',
  'Climax',
  '// REBOOT_SEQUENCE [LOG_169]',
  'Summers Ending',
  '// DAEMON_RUNNING [LOG_159]',
  '80s Stack',
  '// PING_TIMEOUT [LOG_168]',
  'So Done',
  '// END_OF_LINE [LOG_160]',
  'My Past',
  'You Got Me',
  'Bb',
  '// 404_SOUL_NOT_FOUND [LOG_157]',
  'Climb to You',
  'Basic',
  'No Service',
  '// TRACING_ROUTE_TO_GOD [LOG_170]',
  'When I Say Forever',
  'LANDR Childhood Warm Low',
  'ONLY SON',
  'Beauty',
  'Climbing 2u',
  'Spippin',
  'Luckyland Reprise',
  'Alf',
  
  // Filler to reach 365
  '// SOCKET_ERROR [LOG_171]',
  '// TIMEOUT_EXCEEDED [LOG_172]',
  '// RESOURCE_EXHAUSTED [LOG_173]',
  '// SERVICE_UNAVAILABLE [LOG_174]',
  '// GATEWAY_TIMEOUT [LOG_175]',
  '// MALFORMED_REQUEST [LOG_176]',
  '// INVALID_STATE [LOG_177]',
  '// INCONSISTENT_DATA [LOG_178]',
  '// RACE_CONDITION [LOG_179]',
  '// DEADLOCK_DETECTED [LOG_180]',
  '// STACK_OVERFLOW [LOG_181]',
  '// HEAP_EXHAUSTED [LOG_182]',
  '// FILE_DESCRIPTOR_LIMIT [LOG_183]',
  '// PROCESS_TERMINATED [LOG_184]',
  '// SIGNAL_RECEIVED [LOG_185]',
  '// FINAL_TRANSMISSION [LOG_186]',
  '// SYSTEM_RESET [LOG_365]'
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

function getMusicFiles() {
  if (!fs.existsSync(MUSIC_DIR)) {
    console.error(`Music directory not found: ${MUSIC_DIR}`);
    process.exit(1);
  }
  
  return fs.readdirSync(MUSIC_DIR)
    .filter(f => /\.(wav|mp3|flac|m4a)$/i.test(f) && !f.startsWith('._'))
    .sort();
}

function findBestMatch(songTitle, availableFiles) {
  const normalized = songTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Exact match
  let match = availableFiles.find(f => {
    const fname = f.replace(/\.(wav|mp3|flac|m4a)$/i, '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return fname === normalized;
  });
  if (match) return match;
  
  // Substring match (last resort)
  match = availableFiles.find(f => {
    const fname = f.replace(/\.(wav|mp3|flac|m4a)$/i, '').toLowerCase();
    return fname.includes(songTitle.toLowerCase()) || songTitle.toLowerCase().includes(fname.split('_').pop());
  });
  return match || null;
}

console.log('🎵 Organizing 365 release files using definitive playlist...\\n');

// Create directory structure
for (const month of MONTHS) {
  const monthDir = path.join(AUDIO_BASE, month);
  fs.mkdirSync(monthDir, { recursive: true });
}

const files = getMusicFiles();
console.log(`Found ${files.length} audio files in ${MUSIC_DIR}`);
console.log(`Using ${DEFINITIVE_PLAYLIST.length}-day playlist\\n`);

if (DEFINITIVE_PLAYLIST.length !== 365) {
  console.warn(`⚠️  Playlist has ${DEFINITIVE_PLAYLIST.length} entries, expected 365`);
}

let matched = 0;
let created = 0;

// Organize by month with playlist order
for (let day = 1; day <= Math.min(365, DEFINITIVE_PLAYLIST.length); day++) {
  const month = getMonthForDay(day);
  const offset = MONTH_OFFSETS[month];
  const dayInMonth = day - offset;
  
  const entry = DEFINITIVE_PLAYLIST[day - 1];
  const isErrorLog = entry.startsWith('//');
  
  // Sanitize title for filename
  const safeTitle = entry.replace(/[\\/:*?"<>|]/g, '_').substring(0, 100);
  const destFileName = `${String(dayInMonth).padStart(2, '0')} - ${safeTitle}.wav`;
  const destDir = path.join(AUDIO_BASE, month);
  const destPath = path.join(destDir, destFileName);
  
  if (isErrorLog) {
    // Create empty placeholder for error logs
    fs.writeFileSync(destPath, '');
    created++;
  } else {
    // Try to find matching audio file
    const srcFile = findBestMatch(entry, files);
    
    if (srcFile) {
      const srcPath = path.join(MUSIC_DIR, srcFile);
      try {
        fs.copyFileSync(srcPath, destPath);
        matched++;
      } catch (err) {
        fs.writeFileSync(destPath, '');
        created++;
      }
    } else {
      fs.writeFileSync(destPath, '');
      created++;
    }
  }
  
  if (day % 50 === 0 || day === 1 || day === 83 || day === 187 || day === 271 || day === 365) {
    const icon = isErrorLog ? '⚠️ ' : '✓ ';
    console.log(`${icon}Day ${day} (${month}): ${entry}`);
  }
}

console.log(`\\n✅ Organized 365 files (${matched} matched songs + ${created} error logs/placeholders)`);
console.log(`\\nPhase breakdown:`);
console.log(`  Days 1-83    (january-march)     → /BOOT_SEQUENCE`);
console.log(`  Days 84-187  (april-june)        → /CACHE_OVERFLOW`);
console.log(`  Days 188-271 (july-september)    → /ROOT_ACCESS`);
console.log(`  Days 272-365 (october-december)  → /THE_CLOUD (includes 4 new songs)`);
console.log(`\\nNew songs added:`);
console.log(`  • Mylight (Day 275)`);
console.log(`  • Lightgoesin (Day 276)`);
