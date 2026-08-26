import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Keep three.js out of the initial chunk; HeroKeypad is lazy-loaded.
        manualChunks: { three: ['three'] },
      },
    },
  },
});
