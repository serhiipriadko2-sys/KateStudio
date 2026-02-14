import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    // For GitHub Pages: set VITE_BASE_PATH in workflow or use repo name
    base: process.env.VITE_BASE_PATH || '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react() as unknown as PluginOption],
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
      // Increase chunk size warning limit for large components
      chunkSizeWarningLimit: 1000,
      // Enable minification with esbuild (built-in, faster than terser)
      minify: 'esbuild',
    },
    esbuild: {
      // Drop console and debugger statements in production
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
  };
});
