import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    fs: {
      // Allow serving files from parent directories and the actual music folder
      // public/music -> /Volumes/extremeDos/temp music (symlinked)
      allow: ['..', '../../', '/Volumes/extremeDos/temp music']
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'animation-vendor': ['framer-motion', 'gsap'],
          '3d-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'ui-vendor': ['lucide-react', 'zustand'],
          // Split by page
          'home': ['./src/pages/HomePage.tsx'],
          'day': ['./src/pages/DayPage.tsx'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  }
})
