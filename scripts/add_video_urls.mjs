import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const releasesPath = path.join(__dirname, '../public/releases.local.json');

try {
  // 1. Read the file
  const rawData = fs.readFileSync(releasesPath, 'utf-8');
  const data = JSON.parse(rawData);

  // 2. Update releases
  if (data.releases && Array.isArray(data.releases)) {
    data.releases = data.releases.map(release => {
      // Only add if it doesn't exist
      if (!release.hasOwnProperty('videoUrl')) {
        return {
          ...release,
          videoUrl: "" // Placeholder empty string
        };
      }
      return release;
    });

    // 3. Save back to file
    fs.writeFileSync(releasesPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Successfully added "videoUrl" to ${data.releases.length} releases in releases.local.json`);
  } else {
    console.error('❌ No releases array found in the JSON file.');
  }

} catch (error) {
  console.error('Error updating releases:', error);
}