#!/usr/bin/env node
/**
 * Upload audio files and cover images to Supabase releaseready bucket
 * 
 * Usage:
 *   npm run upload:audio    - Upload only audio files
 *   npm run upload:covers   - Upload only cover images
 *   npm run upload:all      - Upload both audio and covers
 * 
 * Requires:
 *   - SUPABASE_URL and SUPABASE_KEY environment variables
 *   - Audio files in 365-releases/audio/{month}/*.wav (or .mp3, .flac, .m4a)
 *   - Cover images in 365-releases/covers/{month}/*.jpg (optional)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT, '365-releases', 'audio');
const COVERS_DIR = path.join(ROOT, '365-releases', 'covers');

// Supabase config
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const BUCKET = 'releaseready';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables are required');
  console.error('Set them with: export SUPABASE_URL=... SUPABASE_KEY=...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const MONTH_ORDER = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const AUDIO_EXTENSIONS = ['.wav', '.mp3', '.flac', '.m4a'];
const uploadType = process.argv[2] || 'all'; // 'audio', 'covers', or 'all'

async function uploadAudio() {
  console.log('\n🎵 Starting audio file upload...\n');
  
  if (!fs.existsSync(AUDIO_DIR)) {
    console.warn('⚠️  Audio directory not found:', AUDIO_DIR);
    return;
  }

  let uploaded = 0;
  let failed = 0;

  // Iterate through months
  for (const month of MONTH_ORDER) {
    const monthDir = path.join(AUDIO_DIR, month);
    if (!fs.existsSync(monthDir)) continue;

    const files = fs.readdirSync(monthDir)
      .filter(f => AUDIO_EXTENSIONS.some(ext => f.toLowerCase().endsWith(ext)) && !f.startsWith('._'))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/^\d+/)?.[0] || '0');
        const bNum = parseInt(b.match(/^\d+/)?.[0] || '0');
        return aNum - bNum;
      });

    for (const file of files) {
      try {
        const filePath = path.join(monthDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        const storagePath = `audio/${month}/${file}`;

        process.stdout.write(`  ${storagePath}... `);

        // Check if file already exists
        const { data: existing } = await supabase.storage
          .from(BUCKET)
          .list(`audio/${month}`, { limit: 1, search: file });

        if (existing && existing.length > 0) {
          // Update existing file
          const { error } = await supabase.storage
            .from(BUCKET)
            .update(storagePath, fileBuffer, { upsert: true });
          
          if (error) throw error;
          console.log('✅ (updated)');
        } else {
          // Upload new file
          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, fileBuffer);
          
          if (error) throw error;
          console.log('✅');
        }
        uploaded++;
      } catch (error) {
        console.log(`❌ ${error.message}`);
        failed++;
      }
    }
  }

  console.log(`\n✅ Audio upload complete: ${uploaded} uploaded, ${failed} failed\n`);
  return failed === 0;
}

async function uploadCovers() {
  console.log('\n🖼️  Starting cover image upload...\n');
  
  if (!fs.existsSync(COVERS_DIR)) {
    console.warn('⚠️  Covers directory not found:', COVERS_DIR);
    return true;
  }

  let uploaded = 0;
  let failed = 0;

  // Iterate through months
  for (const month of MONTH_ORDER) {
    const monthDir = path.join(COVERS_DIR, month);
    if (!fs.existsSync(monthDir)) continue;

    const files = fs.readdirSync(monthDir)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f) && !f.startsWith('._'))
      .sort((a, b) => {
        const aNum = parseInt(a.match(/^\d+/)?.[0] || '0');
        const bNum = parseInt(b.match(/^\d+/)?.[0] || '0');
        return aNum - bNum;
      });

    for (const file of files) {
      try {
        const filePath = path.join(monthDir, file);
        const fileBuffer = fs.readFileSync(filePath);
        const storagePath = `covers/${month}/${file}`;

        process.stdout.write(`  ${storagePath}... `);

        // Check if file already exists
        const { data: existing } = await supabase.storage
          .from(BUCKET)
          .list(`covers/${month}`, { limit: 1, search: file });

        if (existing && existing.length > 0) {
          // Update existing file
          const { error } = await supabase.storage
            .from(BUCKET)
            .update(storagePath, fileBuffer, { upsert: true });
          
          if (error) throw error;
          console.log('✅ (updated)');
        } else {
          // Upload new file
          const { error } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, fileBuffer);
          
          if (error) throw error;
          console.log('✅');
        }
        uploaded++;
      } catch (error) {
        console.log(`❌ ${error.message}`);
        failed++;
      }
    }
  }

  console.log(`\n✅ Cover upload complete: ${uploaded} uploaded, ${failed} failed\n`);
  return failed === 0;
}

async function main() {
  console.log('🚀 Supabase releaseready bucket uploader\n');
  console.log(`Using bucket: ${BUCKET}`);
  console.log(`Upload type: ${uploadType}\n`);

  try {
    let success = true;

    if (uploadType === 'audio' || uploadType === 'all') {
      const audioSuccess = await uploadAudio();
      success = success && audioSuccess;
    }

    if (uploadType === 'covers' || uploadType === 'all') {
      const coversSuccess = await uploadCovers();
      success = success && coversSuccess;
    }

    if (!success) {
      console.error('⚠️  Some files failed to upload. Check errors above.');
      process.exit(1);
    }

    console.log('✨ All files uploaded successfully!\n');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
