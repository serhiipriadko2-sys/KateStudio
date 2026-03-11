import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

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
      'scripts/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', 'scripts/audit_system.test.ts'],
    // Override Supabase env vars so Supabase client uses placeholder URL in tests.
    // This lets MSW intercept all Supabase HTTP calls (handlers use placeholder.supabase.co).
    env: {
      VITE_SUPABASE_URL: 'https://placeholder.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
    coverage: {
      // Keep coverage off by default for fast/green CI on `vitest run`.
      // Use `npm run test:coverage` (which passes `--coverage`) when you want coverage reports.
      enabled: false,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 30,
        functions: 30,
        branches: 20,
        statements: 30,
      },
      include: [
        'shared/**/*.{ts,tsx}',
        'k-sebe-yoga-studioWEB/**/*.{ts,tsx}',
        'k-sebe-yoga-studio-APPp/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        '**/__tests__/**',
        'shared/styles/**',
        'k-sebe-yoga-studioWEB/src/**',
        'k-sebe-yoga-studio-APPp/src/**',
        'k-sebe-yoga-studio-APPp/native/**',
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
