# th3scr1b3 - 365 Days of Light and Dark

An avant-garde, neon-matte styled homepage for th3scr1b3's year-long musical journey.

## ✨ Features

### Visual Design
- **Vibrant Neon Matte Palette**: Off-red (`#ff2d55`) and off-yellow (`#ffd60a`) with bold gradient accents
- **Bold Borders**: Thick gradient borders throughout with matte finish
- **Avant-Garde Elements**: Glitch effects, scanlines, noise textures

### Unique Elements (Not Normally Seen)
- **3D Audio Visualizer**: Morphing icosahedron with particle rings, energy waves, and light beams using Three.js
- **Custom Cursor Trail**: Neon particle trail that follows your cursor with spring physics
- **Glitch Text Effect**: Periodic glitch animation on typography with red/yellow offset layers
- **Animated Loading Screen**: Orbital particles with progress ring

### Animations
- **Framer Motion**: Page transitions, scroll reveals, hover effects
- **GSAP**: Progress circle animations, smooth number counting
- **Three.js/R3F**: Continuous 3D scene animations

### JSON Data Framework
The site reads from `/public/releases.json` which can be updated externally. Structure:
```json
{
  "project": { "title", "artist", "startDate", "endDate", "description", "totalDays" },
  "socials": { "youtube", "audius", "instagram", "twitter", "tiktok", "spotify" },
  "releases": [{ "day", "date", "title", "mood", "description", "youtubeUrl", "audiusUrl", ... }],
  "stats": { "totalReleases", "lightTracks", "darkTracks", "totalListens", "lastUpdated" },
  "announcements": [...],
  "upcomingMilestones": [...]
}
```

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/
│   ├── AudioVisualizer3D.tsx   # Three.js 3D hero visualization
│   ├── CursorEffect.tsx        # Custom cursor with particle trail
│   ├── DayTracker.tsx          # Circular progress day counter
│   ├── Footer.tsx              # Animated footer with marquee
│   ├── GlitchText.tsx          # Glitch typography effect
│   ├── Hero.tsx                # Main hero section
│   ├── Loader.tsx              # Intro loading animation
│   ├── Navigation.tsx          # Fixed nav with scroll progress
│   ├── ReleasesFeed.tsx        # Release cards with modal
│   └── SocialLinks.tsx         # Platform links grid
├── store/
│   └── useStore.ts             # Zustand state management
├── types/
│   └── index.ts                # TypeScript interfaces
├── App.tsx                     # Main app component
├── main.tsx                    # Entry point
└── index.css                   # Tailwind + custom CSS
```

## 🎨 Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Neon Red | `#ff2d55` | Primary accent, glows |
| Neon Red Matte | `#e63950` | Buttons, borders |
| Neon Yellow | `#ffd60a` | Secondary accent, highlights |
| Neon Yellow Matte | `#e6c200` | Buttons, borders |
| Neon Orange | `#ff6b35` | Gradient midpoint |
| Void Black | `#0a0a0b` | Background |
| Void Gray | `#151518` | Cards, sections |
| Light Cream | `#f5f0e8` | Text |

## 🔧 Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS v4** - Styling
- **Framer Motion** - Animations
- **GSAP** - Advanced animations
- **Three.js** + React Three Fiber + Drei - 3D graphics
- **Zustand** - State management
- **Lucide React** - Icons

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: `md` (768px), `lg` (1024px)
- Touch-friendly (cursor effect hidden on mobile)

## 🔄 Updating Releases

To add a new release, update `public/releases.json`:

```json
{
  "releases": [
    {
      "day": 4,
      "date": "2025-01-04",
      "title": "Your New Track",
      "mood": "light",
      "description": "Track description here",
      "youtubeUrl": "https://youtube.com/watch?v=...",
      "audiusUrl": "https://audius.co/th3scr1b3/...",
      "coverArt": "/covers/day-004.jpg",
      "duration": "3:30",
      "bpm": 110,
      "key": "A Minor",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

Don't forget to update `stats.totalReleases`, `stats.lightTracks`/`stats.darkTracks`, and `stats.lastUpdated`.

## 📄 License

© 2025 th3scr1b3. All rights reserved.
