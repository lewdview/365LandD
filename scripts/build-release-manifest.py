#!/usr/bin/env python3
"""
Build release manifest from music files organized by phase.

The script:
1. Organizes 365 songs across 4 phases
2. Extracts metadata from filenames
3. Creates release-manifest.json for fallback data
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any

# Phase definitions
PHASES = {
    'BOOT_SEQUENCE': {'start': 1, 'end': 83, 'months': ['january', 'february', 'march']},
    'CACHE_OVERFLOW': {'start': 84, 'end': 187, 'months': ['april', 'may', 'june']},
    'ROOT_ACCESS': {'start': 188, 'end': 271, 'months': ['july', 'august', 'september']},
    'THE_CLOUD': {'start': 272, 'end': 365, 'months': ['october', 'november', 'december']},
}

MONTH_OFFSETS = {
    'january': 0, 'february': 31, 'march': 59, 'april': 90, 'may': 120, 'june': 151,
    'july': 181, 'august': 212, 'september': 243, 'october': 273, 'november': 304, 'december': 334
}

def get_music_files(music_dir: str) -> List[str]:
    """Get all music files from directory, sorted."""
    files = []
    try:
        for f in os.listdir(music_dir):
            if f.lower().endswith(('.wav', '.mp3', '.flac', '.m4a')):
                files.append(f)
        return sorted(files)
    except Exception as e:
        print(f"Error reading music directory: {e}")
        return []

def extract_track_info(filename: str) -> Dict[str, Any]:
    """Extract track number and title from filename."""
    # Try pattern like "01 - Title.wav"
    parts = filename.split(' - ')
    if len(parts) >= 2:
        try:
            track_num = int(parts[0].strip())
            title = ' - '.join(parts[1:]).rsplit('.', 1)[0]
            return {'number': track_num, 'title': title}
        except (ValueError, IndexError):
            pass
    
    # Fallback: use filename without extension
    title = filename.rsplit('.', 1)[0].strip()
    return {'number': 0, 'title': title}

def get_phase_for_day(day: int) -> str:
    """Get phase name for a given day."""
    for phase, config in PHASES.items():
        if config['start'] <= day <= config['end']:
            return phase
    return 'UNKNOWN'

def get_month_for_day(day: int) -> str:
    """Get month name for a given day."""
    for month, offset in MONTH_OFFSETS.items():
        month_end = offset + (31 if month in ['january', 'march', 'may', 'july', 'august', 'october', 'december'] else
                              30 if month in ['april', 'june', 'september', 'november'] else
                              29)  # February with leap year
        if offset < day <= month_end:
            return month
    return 'december'

def build_manifest(music_dir: str, num_tracks: int = 365) -> Dict[str, Any]:
    """Build release manifest from music files."""
    music_files = get_music_files(music_dir)
    
    print(f"Found {len(music_files)} music files")
    print(f"Building manifest for {num_tracks} tracks")
    
    items = []
    
    for day in range(1, num_tracks + 1):
        # Get file for this day (cycle through available files if necessary)
        file_idx = (day - 1) % len(music_files) if music_files else 0
        filename = music_files[file_idx] if music_files else f"song_{day}.wav"
        
        track_info = extract_track_info(filename)
        month = get_month_for_day(day)
        phase = get_phase_for_day(day)
        
        # Calculate day index within month
        month_offset = MONTH_OFFSETS[month]
        day_in_month = day - month_offset
        
        # Storage title (clean name for storage references)
        storage_title = track_info['title'] or f"Track {day}"
        
        day_in_month_str = str(day_in_month).zfill(2)
        item = {
            'day': day,
            'month': month,
            'phase': phase,
            'index': day_in_month,
            'fileName': filename,
            'storageTitle': storage_title,
            'ext': filename.rsplit('.', 1)[-1] if '.' in filename else 'wav',
            'audioPath': f"audio/{month}/{day_in_month_str} - {storage_title}.wav"
        }
        
        items.append(item)
        
        if day % 90 == 0:
            print(f"  Processed day {day}...")
    
    manifest = {
        'version': '1.0',
        'project': '365 Days of Light and Dark: Poetry in Motion',
        'artist': 'th3scr1b3',
        'totalDays': num_tracks,
        'generatedAt': __import__('datetime').datetime.now().isoformat(),
        'items': items
    }
    
    return manifest

def main():
    script_dir = Path(__file__).parent
    repo_root = script_dir.parent
    music_dir = "/Volumes/extremeDos/temp music"
    output_path = repo_root / "public" / "release-manifest.json"
    
    print("Building release manifest...")
    manifest = build_manifest(music_dir, 365)
    
    # Write manifest
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"✓ Manifest written to {output_path}")
    print(f"  - {len(manifest['items'])} releases")
    print(f"  - Phases: {set(item['phase'] for item in manifest['items'])}")

if __name__ == '__main__':
    main()
