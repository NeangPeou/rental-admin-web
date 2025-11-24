import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500, // removes the warning you just saw
  },
  server: {
    port: 5173,
    open: true
  }
})