# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Install dependencies
  - npm install
- Start dev server (Vite, React, TS, Tailwind v4)
  - npm run dev
- Build production bundle
  - npm run build
- Preview the production build locally
  - npm run preview
- Lint the codebase (ESLint flat config)
  - npm run lint

Notes
- Tests are not configured in this repo (no test runner or scripts). There is no single-test command at present.

## High-level architecture

Application
- Frontend-only SPA built with Vite + React + TypeScript + Tailwind v4.
- Routing via react-router-dom with two primary routes:
  - "/" → HomePage (landing, hero, tracker, modals)
  - "/day/:day" → DayPage (per-day detail, audio playback, lyrics/poetry view)

State and theming
- Global state with Zustand:
  - src/store/useStore.ts: loads and stores project data (ReleaseData), manages loading/error, selected release, and computes the current day relative to the project start date.
  - src/store/useThemeStore.ts: theme presets + persistence; applies colors by setting CSS variables on documentElement so Tailwind utilities reflect the active theme.
- Styling uses Tailwind v4 (via @tailwindcss/vite) plus CSS variables defined in src/index.css (e.g., --color-neon-red, --color-neon-yellow, --color-void-black, etc.). Theme store mutates these variables at runtime.

Data flow
- Primary data fetch path is Supabase Edge Functions exposed via a project-specific URL (see src/services/supabase.ts). The service:
  - fetchAnalyses() → calls the Supabase function and returns SongAnalysis[].
  - buildReleaseData() → transforms analyses into ReleaseData (computes day numbers, mood, tags, stats, month themes, announcements).
- Fallback path: if the remote fetch fails or returns no data, use static JSON from public/releases.json (documented in README.md). The UI is designed to function against this local JSON as well.

Audio playback and local development
- DayPage streams audio from each release’s storedAudioUrl when available.
- Fallback for development: if the remote audio URL 404s or errors, it attempts to play from /music/<original-filename> served from public/music.
- public/music is a symlink in this repo that currently points to a local disk folder. If you need to recreate it on another machine, point it at a folder with audio files matching release fileName values, e.g.:
  - ln -s "/absolute/path/to/local/audio" public/music
- Vite’s dev server is configured to allow serving files outside the repo at a specific absolute path for this use case (see vite.config.ts → server.fs.allow).

Rendering and effects
- src/components contains higher-level UI sections and visual effects:
  - 3D hero visualization via three.js/react-three-fiber (AudioVisualizer3D).
  - Animated navigation and loader, glitch text, particle effects, modals for Manifesto/Releases, etc.
- src/pages encapsulates page-level composition; DayPage manages the HTMLAudioElement lifecycle, progress/volume, and timed lyric interactions when available.

Tooling and configuration
- Vite config (vite.config.ts):
  - Plugins: @vitejs/plugin-react, @tailwindcss/vite.
  - Alias: '@' → ./src for cleaner imports.
  - server.fs.allow includes parent dirs and a host-specific audio folder to serve local files in dev.
- ESLint flat config (eslint.config.js) with @eslint/js, typescript-eslint, react-hooks, and react-refresh presets. Lint ignores dist/.
- TypeScript configs: tsconfig.json and tsconfig.app.json for app compilation; build runs tsc -b then vite build.

## Repository-specific workflows

Content updates (driving the UI)
- The UI can run entirely off public/releases.json. See README.md for the exact schema and examples; update that file to change displayed releases, stats, and milestones.
- When Supabase is available, src/services/supabase.ts builds ReleaseData from remote analyses; otherwise the store falls back to the local JSON transparently.

Local audio fallback
- If you want playable audio during development without remote URLs, populate a local folder with files named exactly like each release’s fileName and ensure public/music points to it (see symlink note above). No server code changes are required.

## Important docs from this repo

- README.md
  - Contains Quick Start commands (install/dev/build/preview) and the public/releases.json structure used by the app. Prefer updating public/releases.json for quick local iterations if the Supabase backend is unavailable.

## Conventions for agents operating here

- Use npm (package-lock.json present). Prefer npm run dev/build/preview/lint over invoking underlying tools directly.
- Respect the alias '@' → ./src in imports. Example: import { useStore } from '@/store/useStore'.
- When working on theming or colors, mutate CSS variables through the theme store or update src/index.css; Tailwind v4 reads these variables.
- Do not assume a test runner exists; if tests are introduced later (e.g., Vitest), add scripts before relying on test commands.
