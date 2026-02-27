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
    // define: isDev
    //   ? {
    //       // NOTE: This still embeds the key into the client bundle.
    //       // For real security, move Gemini calls behind a server/edge proxy.
    //       'process.env.API_KEY': JSON.stringify(geminiApiKey),
    //       'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
    //     }
    //   : {},
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
            if (id.includes('node_modules/@google/generative-ai')) {
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
