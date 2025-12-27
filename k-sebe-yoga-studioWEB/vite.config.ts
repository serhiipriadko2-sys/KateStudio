import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  // Vite best practice: client-exposed vars use VITE_ prefix.
  // Back-compat: support GEMINI_API_KEY if present, but prefer VITE_GEMINI_API_KEY.
  const geminiApiKey = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY;
  return {
    // For GitHub Pages: set VITE_BASE_PATH in workflow or use repo name
    base: process.env.VITE_BASE_PATH || '/',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      // NOTE: This still embeds the key into the client bundle.
      // For real security, move Gemini calls behind a server/edge proxy.
      'process.env.API_KEY': JSON.stringify(geminiApiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
