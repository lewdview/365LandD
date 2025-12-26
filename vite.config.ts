import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      // Allow serving files from parent directories and the symlinked music folder
      // public/music -> /Volumes/extremeDos/temp music
      allow: ['..', '../../', '/Volumes/extremeDos/temp music']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})
