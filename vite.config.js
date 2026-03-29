import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: ['hiveclash-production.up.railway.app']
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      stream: 'stream-browserify',
      events: 'events',
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer', 'stream-browserify', 'events', 'keychain-sdk'],
  },
})