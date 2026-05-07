import fs from 'fs';
import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';

/**
 * Vite plugin: stamp the service worker with a unique BUILD_ID on every build.
 * This guarantees the browser detects a new sw.js and triggers the update flow.
 * In dev mode the plugin is a no-op — the raw sw.js is served from /public.
 */
function swBuildId(): PluginOption {
  return {
    name: 'sw-build-id',
    apply: 'build',
    closeBundle() {
      const swPath = path.resolve(__dirname, 'dist', 'sw.js');
      if (!fs.existsSync(swPath)) return;
      const buildId = `b${Date.now()}`;
      const content = fs.readFileSync(swPath, 'utf-8');
      fs.writeFileSync(swPath, content.replaceAll('__BUILD_ID__', buildId));
      // eslint-disable-next-line no-console
      console.log(`[sw-build-id] Stamped sw.js with BUILD_ID=${buildId}`);
    },
  };
}

export default defineConfig(({ mode }) => {
  return {
    // For GitHub Pages: set VITE_BASE_PATH in workflow or use repo name
    base: process.env.VITE_BASE_PATH || '/',
    // Load .env files from the project root (one level up)
    envDir: path.resolve(__dirname, '..'),
    server: {
      port: 3000,
      host: '0.0.0.0',
      open: true,
    },
    plugins: [react() as unknown as PluginOption, swBuildId()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        '@ksebe/shared': path.resolve(__dirname, '../shared'),
      },
    },
    build: {
      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // React and ReactDOM in separate chunk
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'react-vendor';
            }
            // Lucide icons in separate chunk
            if (id.includes('node_modules/lucide-react')) {
              return 'lucide-icons';
            }
            // Supabase SDK in separate chunk
            if (id.includes('node_modules/@supabase')) {
              return 'supabase-sdk';
            }
            // Let dynamic imports create their own chunks
            return undefined;
          },
        },
      },
      // Keep chunk warnings honest so bundle drift shows up during local builds.
      chunkSizeWarningLimit: 250,
      // Enable minification with esbuild (built-in, faster than terser)
      minify: 'esbuild',
    },
    esbuild: {
      // Drop console and debugger statements in production
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
