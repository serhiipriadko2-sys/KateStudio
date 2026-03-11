import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme, saveTheme, loadTheme, resetTheme, type ThemeColors } from '../theme';

const CUSTOM: ThemeColors = {
  '--color-brand-green': '#00ff00',
  '--color-brand-mint': '#aaffaa',
  '--color-brand-dark': '#111111',
  '--color-brand-text': '#222222',
  '--color-brand-light': '#eeeeee',
  '--color-brand-accent': '#ffff00',
};

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset any CSS custom properties
    const root = document.documentElement;
    Object.keys(CUSTOM).forEach((key) => root.style.removeProperty(key));
  });

  describe('applyTheme', () => {
    it('sets CSS custom properties on documentElement', () => {
      applyTheme(CUSTOM);
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-brand-green')).toBe('#00ff00');
      expect(root.style.getPropertyValue('--color-brand-dark')).toBe('#111111');
    });
  });

  describe('saveTheme', () => {
    it('persists to localStorage and applies CSS vars', () => {
      saveTheme(CUSTOM);
      const stored = localStorage.getItem('ksebe-theme-settings');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed['--color-brand-green']).toBe('#00ff00');

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-brand-green')).toBe('#00ff00');
    });
  });

  describe('loadTheme', () => {
    it('returns default theme when localStorage is empty', () => {
      const theme = loadTheme();
      expect(theme['--color-brand-green']).toBe('#57a773');
    });

    it('returns saved theme merged with defaults', () => {
      localStorage.setItem(
        'ksebe-theme-settings',
        JSON.stringify({ '--color-brand-green': '#abcdef' })
      );
      const theme = loadTheme();
      expect(theme['--color-brand-green']).toBe('#abcdef');
      // Other defaults still present
      expect(theme['--color-brand-dark']).toBe('#1a1a1a');
    });

    it('returns default theme when localStorage contains invalid JSON', () => {
      localStorage.setItem('ksebe-theme-settings', 'not-json');
      const theme = loadTheme();
      expect(theme['--color-brand-green']).toBe('#57a773');
    });
  });

  describe('resetTheme', () => {
    it('removes localStorage entry and restores defaults', () => {
      saveTheme(CUSTOM);
      const defaults = resetTheme();
      expect(localStorage.getItem('ksebe-theme-settings')).toBeNull();
      expect(defaults['--color-brand-green']).toBe('#57a773');

      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-brand-green')).toBe('#57a773');
    });
  });
});
