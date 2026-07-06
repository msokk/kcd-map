import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project site served from https://<user>.github.io/kcd-map/
export default defineConfig({
  base: '/kcd-map/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
  },
  server: {
    // Live player position: forward to the bridge (live/bridge.ps1) or the
    // packaged desktop app (app/main.ts), whichever is running.
    proxy: {
      '/position': 'http://localhost:8765',
    },
  },
});
