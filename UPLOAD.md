# Uploading to Supabase releaseready Bucket

## Overview

The `upload-to-releaseready.mjs` script uploads audio files and cover images to your Supabase "releaseready" bucket. This makes them publicly accessible via the app.

## Prerequisites

1. **Supabase Project Setup**
   - You need a Supabase project with a "releaseready" bucket
   - Project ID: `pznmptudgicrmljjafex`
   - Bucket name: `releaseready`

2. **Environment Variables**
   Set these before running the upload script:
   ```bash
   export SUPABASE_URL="https://pznmptudgicrmljjafex.supabase.co"
   export SUPABASE_KEY="your-service-role-key-here"
   ```

   > ⚠️ **Important**: Use your **service role key**, not the anon key. The service role key has write permissions to the bucket.

3. **File Structure**
   Organize files by month:
   ```
   365-releases/
   ├── audio/
   │   ├── january/
   │   │   ├── 01 - Song Title.wav
   │   │   ├── 02 - Another Song.mp3
   │   │   └── ...
   │   ├── february/
   │   │   └── ...
   │   └── ...
   └── covers/
       ├── january/
       │   ├── 01 - Song Title.jpg
       │   └── ...
       └── ...
   ```

## Usage

### Upload Audio Files Only
```bash
npm run upload:audio
```

### Upload Cover Images Only
```bash
npm run upload:covers
```

### Upload Both Audio and Covers
```bash
npm run upload:all
```

## Supported File Types

- **Audio**: `.wav`, `.mp3`, `.flac`, `.m4a`
- **Covers**: `.jpg`, `.jpeg`, `.png`, `.webp`

## What Happens

1. **Directory Scanning**: Finds all files organized by month
2. **Checking**: Verifies if files already exist in the bucket
3. **Uploading**: Uploads new files or updates existing ones
4. **Reporting**: Shows progress and reports any errors

## Example Output

```
🚀 Supabase releaseready bucket uploader

Using bucket: releaseready
Upload type: all

🎵 Starting audio file upload...

  audio/january/01 - Dream.wav... ✅
  audio/january/02 - Chunky.mp3... ✅
  audio/january/03 - You Like Steve Earle.wav... ✅ (updated)
  ...

✅ Audio upload complete: 45 uploaded, 0 failed

🖼️  Starting cover image upload...

  covers/january/01 - Dream.jpg... ✅
  covers/january/02 - Chunky.jpg... ✅
  ...

✅ Cover upload complete: 45 uploaded, 0 failed

✨ All files uploaded successfully!
```

## How Files Are Accessed

After uploading, files are accessible at:

**Audio:**
```
https://pznmptudgicrmljjafex.supabase.co/storage/v1/object/public/releaseready/audio/{month}/{filename}
```

**Covers:**
```
https://pznmptudgicrmljjafex.supabase.co/storage/v1/object/public/releaseready/covers/{month}/{filename}
```

These URLs are automatically used by:
- `getReleaseAudioUrlVariations()` in `releaseStorage.ts`
- `getCoverUrl()` in `releaseStorage.ts`

## Troubleshooting

### "SUPABASE_URL and SUPABASE_KEY environment variables are required"
Set the environment variables:
```bash
export SUPABASE_URL="..."
export SUPABASE_KEY="..."
npm run upload:audio
```

### "Permission denied" errors
- Make sure you're using the **service role key** (has write permissions)
- Check that your Supabase project is properly configured
- Verify the bucket name is "releaseready"

### Some files fail while others succeed
- Check file permissions on local files
- Verify file names don't contain invalid characters
- Ensure files aren't corrupted
- The script will continue and report failed files at the end

### Slow uploads
- Large audio files may take time to upload
- The script uploads sequentially (month by month)
- Consider splitting uploads across multiple days if you have many files

## Local Development Fallback

If files aren't on Supabase, the app automatically falls back to:
- **Local audio**: `/music/{month}/{filename}` (via symlink to `365-releases/audio`)
- This is perfect for local development

## Production Deployment

1. Upload all files to releaseready bucket:
   ```bash
   npm run upload:all
   ```

2. Verify files are accessible in browser (optional)

3. Deploy the app - it will use Supabase URLs for faster, more reliable delivery

## Related Scripts

- `npm run manifest` - Generate manifest from organized files
- `npm run files:to-local` - Build local releases.json from audio files
- `npm run db:to-local` - Build releases.json from database exports
