import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split vendor libs into separate cacheable chunks.
        // After the first visit, react + supabase are cached and never re-downloaded.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor';
            if (id.includes('@supabase')) return 'supabase-vendor';
            return 'vendor';
          }
        },
      },
    },
  },
})
