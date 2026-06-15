import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// Blink Visual Editor: stamps data-blnk-id on JSX + injects iframe-side picker
// runtime. Self-contained (no external deps) so this template stays portable.
import { blinkTaggerPlugin } from './blink-tagger.plugin.mjs';

export default defineConfig({
  // Build-time tagger OFF by default — its transform can stamp data-blnk-id into
  // HTML inside string literals. Enable with BLINK_BUILD_TIME_TAGGER=on.
  plugins: [...(process.env.BLINK_BUILD_TIME_TAGGER === 'on' ? [blinkTaggerPlugin()] : []), react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
    // @blinkdotnew/ui + framer-motion + R3F peers must share one React instance or hooks
    // crash inside motion with: Cannot read properties of null (reading 'useRef')
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime', 'framer-motion'],
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    allowedHosts: true,
  }
});