import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Project site served from https://<user>.github.io/kcd-map/
export default defineConfig({
  base: '/kcd-map/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
  },
});
