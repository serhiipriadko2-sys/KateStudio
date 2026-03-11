import { beforeEach, describe, expect, it } from 'vitest';
import {
  addPracticeCompletion,
  countPracticeInWeek,
  formatWeekLabel,
  getWeekWindow,
  notifyPracticeCompletionsUpdated,
  PRACTICE_COMPLETIONS_KEY,
  readPracticeCompletions,
  subscribePracticeCompletions,
  writePracticeCompletions,
} from '../practiceLog';
import type { DateKey } from '../streak';

describe('practiceLog utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // ─── readPracticeCompletions / writePracticeCompletions ──────────────────────

  describe('readPracticeCompletions', () => {
    it('returns [] when localStorage is empty', () => {
      expect(readPracticeCompletions()).toEqual([]);
    });

    it('reads previously written days', () => {
      const days: DateKey[] = ['2026-01-01', '2026-01-05'];
      writePracticeCompletions(days);
      expect(readPracticeCompletions()).toEqual(days);
    });

    it('returns [] on malformed JSON', () => {
      localStorage.setItem(PRACTICE_COMPLETIONS_KEY, 'not-json');
      expect(readPracticeCompletions()).toEqual([]);
    });
  });

  describe('writePracticeCompletions', () => {
    it('persists days to localStorage', () => {
      writePracticeCompletions(['2026-03-01' as DateKey]);
      const stored = JSON.parse(localStorage.getItem(PRACTICE_COMPLETIONS_KEY) ?? '[]');
      expect(stored).toContain('2026-03-01');
    });

    it('keeps only the last 730 entries', () => {
      const days = Array.from({ length: 800 }, (_, i) => {
        const d = new Date(2020, 0, 1 + i);
        return d.toISOString().slice(0, 10) as DateKey;
      });
      writePracticeCompletions(days);
      const stored = JSON.parse(localStorage.getItem(PRACTICE_COMPLETIONS_KEY) ?? '[]');
      expect(stored).toHaveLength(730);
    });
  });

  // ─── addPracticeCompletion ───────────────────────────────────────────────────

  describe('addPracticeCompletion', () => {
    it('adds a new day in sorted order', () => {
      const result = addPracticeCompletion(
        ['2026-01-03', '2026-01-05'] as DateKey[],
        '2026-01-04' as DateKey
      );
      expect(result).toEqual(['2026-01-03', '2026-01-04', '2026-01-05']);
    });

    it('deduplicates existing day', () => {
      const result = addPracticeCompletion(
        ['2026-01-01', '2026-01-02'] as DateKey[],
        '2026-01-01' as DateKey
      );
      expect(result).toHaveLength(2);
    });
  });

  // ─── subscribePracticeCompletions / notifyPracticeCompletionsUpdated ─────────

  describe('subscribe / notify', () => {
    it('subscriber is called on notify', () => {
      const listener = { fn: (days: DateKey[]) => days };
      const spy = vi.spyOn(listener, 'fn');

      const unsub = subscribePracticeCompletions(spy);
      notifyPracticeCompletionsUpdated(['2026-03-01' as DateKey]);

      expect(spy).toHaveBeenCalledWith(['2026-03-01']);
      unsub();
    });

    it('unsubscribed listener is not called', () => {
      const spy = vi.fn();
      const unsub = subscribePracticeCompletions(spy);
      unsub();

      notifyPracticeCompletionsUpdated(['2026-03-01' as DateKey]);
      expect(spy).not.toHaveBeenCalled();
    });

    it('notifyPracticeCompletionsUpdated reads from localStorage when no arg', () => {
      writePracticeCompletions(['2026-02-01' as DateKey]);
      const spy = vi.fn();
      const unsub = subscribePracticeCompletions(spy);

      notifyPracticeCompletionsUpdated();
      expect(spy).toHaveBeenCalledWith(['2026-02-01']);
      unsub();
    });
  });

  // ─── getWeekWindow ───────────────────────────────────────────────────────────

  describe('getWeekWindow', () => {
    it('returns Monday as start and Sunday as end for a Wednesday', () => {
      const wed = new Date('2026-03-11'); // Wednesday
      const { start, end } = getWeekWindow(wed);
      expect(start).toBe('2026-03-09'); // Monday
      expect(end).toBe('2026-03-15'); // Sunday
    });

    it('returns same day for start when date is Monday', () => {
      const mon = new Date('2026-03-09');
      const { start } = getWeekWindow(mon);
      expect(start).toBe('2026-03-09');
    });
  });

  // ─── countPracticeInWeek ─────────────────────────────────────────────────────

  describe('countPracticeInWeek', () => {
    it('counts days within the current week', () => {
      const now = new Date('2026-03-11'); // Wednesday
      const days: DateKey[] = ['2026-03-09', '2026-03-10', '2026-03-11', '2026-03-05'];
      expect(countPracticeInWeek(days, now)).toBe(3);
    });

    it('returns 0 when no days match the week', () => {
      const now = new Date('2026-03-11');
      expect(countPracticeInWeek([], now)).toBe(0);
    });
  });

  // ─── formatWeekLabel ─────────────────────────────────────────────────────────

  describe('formatWeekLabel', () => {
    it('returns a non-empty string', () => {
      const label = formatWeekLabel(new Date('2026-03-11'));
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
      expect(label).toContain('—');
    });
  });
});
