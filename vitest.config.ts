import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'shared/**/*.{test,spec}.{ts,tsx}',
      'k-sebe-yoga-studioWEB/**/*.{test,spec}.{ts,tsx}',
      'k-sebe-yoga-studio-APPp/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
      ],
    },
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
  resolve: {
    alias: {
      '@ksebe/shared': path.resolve(__dirname, './shared/index.ts'),
      '@web': path.resolve(__dirname, './k-sebe-yoga-studioWEB'),
      '@app': path.resolve(__dirname, './k-sebe-yoga-studio-APPp'),
    },
  },
});
