import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, type PluginOption } from 'vite';

export default defineConfig(({ mode }) => {
  return {
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
            // Capacitor core + plugins in separate chunk
            if (id.includes('node_modules/@capacitor/')) {
              return 'capacitor';
            }
            // Lucide icons in separate chunk
            if (id.includes('node_modules/lucide-react')) {
              return 'lucide-icons';
            }
            // @google/genai SDK in separate chunk if present
            if (id.includes('node_modules/@google/genai')) {
              return 'ai-sdk';
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
      // Fix for Vite 7 HTML inline CSS proxy issue
      cssCodeSplit: true,
    },
    esbuild: {
      // Drop console and debugger statements in production
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    css: {
      // Ensure CSS is properly handled
      devSourcemap: mode !== 'production',
    },
  };
});
