import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  normalizeContentData,
  getContentMode,
  setContentMode,
  getContentData,
  saveContentData,
  resetContentData,
  subscribeContentUpdates,
} from '../contentStore';

describe('contentStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('normalizeContentData', () => {
    it('returns defaults for null input', () => {
      const result = normalizeContentData(null);
      expect(result.schedule).toBeDefined();
      expect(Array.isArray(result.gallery)).toBe(true);
      expect(Array.isArray(result.articles)).toBe(true);
    });

    it('merges partial data with defaults', () => {
      const result = normalizeContentData({ gallery: [] });
      expect(result.gallery).toEqual([]);
      expect(result.schedule).toBeDefined();
    });
  });

  describe('getContentMode', () => {
    it('returns mode from localStorage if valid', () => {
      localStorage.setItem('ksebe-content-mode', 'demo');
      expect(getContentMode()).toBe('demo');
    });

    it('returns mode "production" from localStorage', () => {
      localStorage.setItem('ksebe-content-mode', 'production');
      expect(getContentMode()).toBe('production');
    });

    it('falls back when localStorage has invalid value', () => {
      localStorage.setItem('ksebe-content-mode', 'invalid');
      const mode = getContentMode();
      expect(['demo', 'production']).toContain(mode);
    });

    it('returns a valid mode when nothing is stored', () => {
      const mode = getContentMode();
      expect(['demo', 'production']).toContain(mode);
    });
  });

  describe('setContentMode', () => {
    it('stores mode in localStorage', () => {
      setContentMode('production');
      expect(localStorage.getItem('ksebe-content-mode')).toBe('production');
    });

    it('dispatches content-updated event', () => {
      const handler = vi.fn();
      window.addEventListener('ksebe-content-updated', handler);
      setContentMode('demo');
      expect(handler).toHaveBeenCalled();
      window.removeEventListener('ksebe-content-updated', handler);
    });
  });

  describe('getContentData', () => {
    it('returns default content when nothing stored', () => {
      const data = getContentData('demo');
      expect(data.schedule).toBeDefined();
      expect(Array.isArray(data.gallery)).toBe(true);
    });

    it('returns stored content when present', () => {
      const custom = normalizeContentData({ gallery: [] });
      localStorage.setItem('ksebe-content-demo', JSON.stringify(custom));
      const data = getContentData('demo');
      expect(data.gallery).toEqual([]);
    });
  });

  describe('saveContentData', () => {
    it('saves to localStorage and dispatches event', () => {
      const handler = vi.fn();
      window.addEventListener('ksebe-content-updated', handler);

      const data = normalizeContentData(null);
      saveContentData(data, 'demo');

      expect(localStorage.getItem('ksebe-content-demo')).not.toBeNull();
      expect(handler).toHaveBeenCalled();
      window.removeEventListener('ksebe-content-updated', handler);
    });
  });

  describe('resetContentData', () => {
    it('removes stored data and dispatches event', () => {
      const data = normalizeContentData(null);
      saveContentData(data, 'demo');
      expect(localStorage.getItem('ksebe-content-demo')).not.toBeNull();

      const handler = vi.fn();
      window.addEventListener('ksebe-content-updated', handler);
      resetContentData('demo');
      expect(localStorage.getItem('ksebe-content-demo')).toBeNull();
      expect(handler).toHaveBeenCalled();
      window.removeEventListener('ksebe-content-updated', handler);
    });
  });

  describe('subscribeContentUpdates', () => {
    it('calls callback on content-updated event', () => {
      const cb = vi.fn();
      const unsub = subscribeContentUpdates(cb);

      window.dispatchEvent(new Event('ksebe-content-updated'));
      expect(cb).toHaveBeenCalledTimes(1);

      unsub();
    });

    it('calls callback on storage event', () => {
      const cb = vi.fn();
      const unsub = subscribeContentUpdates(cb);

      window.dispatchEvent(new Event('storage'));
      expect(cb).toHaveBeenCalledTimes(1);

      unsub();
    });

    it('unsubscribes correctly', () => {
      const cb = vi.fn();
      const unsub = subscribeContentUpdates(cb);
      unsub();

      window.dispatchEvent(new Event('ksebe-content-updated'));
      expect(cb).not.toHaveBeenCalled();
    });
  });
});
