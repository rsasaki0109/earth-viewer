/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE ?? '/earth-viewer/',
  plugins: [react(), cesium()],
  test: {
    environment: 'jsdom',
    globals: true,
    // Stage 1 has no tests yet; later stages will add specs.
    passWithNoTests: true,
  },
});
