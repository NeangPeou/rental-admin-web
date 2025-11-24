// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // This is the KEY line that fixes refresh 404 forever on Render, GitHub Pages, etc.
  base: '/',                     // ← Important: explicitly set base

  server: {
    port: 5173,
    host: true,                  // ← fixes "Network: use --host" and allows phone testing
    open: true,                  // auto-open browser in dev (optional)
  },

  preview: {
    port: 5173,
    host: true,
    open: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,             // helpful for debugging production bugs
  },
})