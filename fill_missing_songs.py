import json
import csv
import re
import os

# --- CONFIGURATION ---
SONG_LIST_PATH = 'song_list.csv'
MANIFEST_PATH = 'public/release-manifest.json'
OUTPUT_PATH = 'public/release-manifest.json' # Overwrites the file

def normalize(s):
    """Normalize string for comparison (lowercase, alphanumeric only)."""
    return re.sub(r'[^a-z0-9]', '', str(s).lower())

def main():
    print("--- Starting Playlist Repair ---")

    # 1. Load All Songs from CSV
    all_songs = []
    if os.path.exists(SONG_LIST_PATH):
        with open(SONG_LIST_PATH, 'r', encoding='utf-8') as f:
            # Handle potential BOM or encoding issues
            content = f.read()
            # If CSV headers are "Filename,Database Title"
            lines = content.strip().split('\n')
            # Skip header if present
            if "Filename" in lines[0]:
                lines = lines[1:]
            
            reader = csv.reader(lines)
            for row in reader:
                if len(row) >= 2:
                    filename = row[0].strip()
                    title = row[1].strip()
                    if filename and title:
                        all_songs.append({'filename': filename, 'title': title})
        print(f"Loaded {len(all_songs)} songs from CSV.")
    else:
        print(f"Error: Could not find {SONG_LIST_PATH}")
        return

    # 2. Load Manifest
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, 'r', encoding='utf-8') as f:
            manifest_data = json.load(f)
        manifest_items = manifest_data.get('items', [])
        print(f"Loaded {len(manifest_items)} items from Manifest.")
    else:
        print(f"Error: Could not find {MANIFEST_PATH}")
        return

    # 3. Identify Used Songs
    # Create a set of normalized titles currently in the manifest (ignoring errors)
    used_titles = set()
    for item in manifest_items:
        title = item.get('storageTitle', '')
        # If it's NOT an error placeholder, mark it as used
        if not title.startswith('__ ') and '[LOG_' not in title:
            used_titles.add(normalize(title))
            
            # Special case handling for manual overrides if known
            # (Optional: add manual matches here if needed)

    # 4. Filter for Unused Songs
    unused_songs = []
    for song in all_songs:
        norm_title = normalize(song['title'])
        # If the song title isn't in the used list, it's available
        if norm_title not in used_titles:
            unused_songs.append(song)
    
    print(f"Found {len(unused_songs)} songs not yet in the playlist.")

    # 5. Fill in the Error Days
    filled_count = 0
    for item in manifest_items:
        current_title = item.get('storageTitle', '')
        
        # Check if this day is an error placeholder
        # Matches: "__ SYSTEM_CRASH [LOG_349]" or similar
        if current_title.startswith('__ ') or '[LOG_' in current_title:
            if not unused_songs:
                print("Warning: Ran out of new songs to fill holes!")
                break
            
            # Pop the next available song
            new_song = unused_songs.pop(0)
            
            # Update the Manifest Item
            item['storageTitle'] = new_song['title']
            
            # Extract extension (wav/mp3)
            filename = new_song['filename']
            ext = 'wav'
            if '.' in filename:
                ext = filename.rsplit('.', 1)[1].lower()
            item['ext'] = ext
            
            # Update Audio Path
            # Format: audio/{month}/{index} - {Title}.{ext}
            # We replace spaces with %20 for URLs
            safe_title = new_song['title'].replace(' ', '%20')
            
            month = item['month']
            idx = item['index']
            item['audioPath'] = f"audio/{month}/{idx:02d}%20-%20{safe_title}.{ext}"
            item['coverPath'] = None 
            
            filled_count += 1
            print(f"Filled Day {idx} ({month}): {new_song['title']}")

    # 6. Save
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest_data, f, indent=2)
    
    print(f"\nSuccess! Filled {filled_count} missing days.")
    print(f"Updated manifest saved to {OUTPUT_PATH}")

if __name__ == "__main__":
    main()