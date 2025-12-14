/**
 * K Sebe Yoga Studio - ESLint Configuration (Flat Config for v9+)
 * Shared across all packages (WEB, APP, shared)
 */
import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/*.config.js', '**/*.config.cjs'],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        FormData: 'readonly',
        Blob: 'readonly',
        File: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
        MediaRecorder: 'readonly',
        AudioContext: 'readonly',
        SpeechRecognition: 'readonly',
        webkitSpeechRecognition: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLTextAreaElement: 'readonly',
        HTMLImageElement: 'readonly',
        HTMLVideoElement: 'readonly',
        HTMLAudioElement: 'readonly',
        Event: 'readonly',
        KeyboardEvent: 'readonly',
        MouseEvent: 'readonly',
        TouchEvent: 'readonly',
        CustomEvent: 'readonly',
        IntersectionObserver: 'readonly',
        ResizeObserver: 'readonly',
        MutationObserver: 'readonly',
        WebSocket: 'readonly',
        Audio: 'readonly',
        Image: 'readonly',
        Promise: 'readonly',
        Map: 'readonly',
        Set: 'readonly',
        WeakMap: 'readonly',
        WeakSet: 'readonly',
        Symbol: 'readonly',
        Intl: 'readonly',
        crypto: 'readonly',
        atob: 'readonly',
        btoa: 'readonly',
        structuredClone: 'readonly',
        globalThis: 'readonly',
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        Response: 'readonly',
        Request: 'readonly',
        Headers: 'readonly',
        ReadableStream: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      import: importPlugin,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': { typescript: true, node: true },
    },
    rules: {
      // React
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/no-unescaped-entities': 'warn',

      // TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import order
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'warn',
      'no-var': 'error',
      eqeqeq: ['error', 'always'],

      // Accessibility
      'jsx-a11y/click-events-have-key-events': 'warn',
      'jsx-a11y/no-static-element-interactions': 'warn',
      'jsx-a11y/anchor-is-valid': 'warn',

      // Disable base rules that TypeScript handles
      'no-unused-vars': 'off',
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        jest: 'readonly',
        test: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  prettier,
];
