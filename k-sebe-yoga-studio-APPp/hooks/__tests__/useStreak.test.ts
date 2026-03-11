import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useStreak } from '../useStreak';

describe('useStreak', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns zero streaks on first load with empty localStorage', () => {
    const { result } = renderHook(() => useStreak(new Date('2026-03-11')));

    expect(result.current.today).toBe('2026-03-11');
    expect(result.current.hasToday).toBe(false);
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.longestStreak).toBe(0);
    expect(result.current.days).toHaveLength(0);
  });

  it('logToday adds today to the days list', () => {
    const { result } = renderHook(() => useStreak(new Date('2026-03-11')));

    act(() => {
      result.current.logToday();
    });

    expect(result.current.hasToday).toBe(true);
    expect(result.current.currentStreak).toBe(1);
    expect(result.current.days).toContain('2026-03-11');
  });

  it('calling logToday twice does not duplicate the day', () => {
    const { result } = renderHook(() => useStreak(new Date('2026-03-11')));

    act(() => {
      result.current.logToday();
      result.current.logToday();
    });

    const count = result.current.days.filter((d) => d === '2026-03-11').length;
    expect(count).toBe(1);
  });

  it('reads initial days from localStorage', () => {
    localStorage.setItem(
      'ksebe_practice_days',
      JSON.stringify(['2026-03-09', '2026-03-10', '2026-03-11'])
    );

    const { result } = renderHook(() => useStreak(new Date('2026-03-11')));

    expect(result.current.days).toContain('2026-03-11');
    expect(result.current.currentStreak).toBeGreaterThanOrEqual(3);
    expect(result.current.hasToday).toBe(true);
  });

  it('persists new days to localStorage after logToday', () => {
    const { result } = renderHook(() => useStreak(new Date('2026-03-11')));

    act(() => {
      result.current.logToday();
    });

    const stored = JSON.parse(localStorage.getItem('ksebe_practice_days') ?? '[]');
    expect(stored).toContain('2026-03-11');
  });

  describe('shouldShowReminder', () => {
    it('is false before 18:00', () => {
      const morning = new Date('2026-03-11T10:00:00');
      const { result } = renderHook(() => useStreak(morning));
      expect(result.current.shouldShowReminder).toBe(false);
    });

    it('is true after 18:00 when practice not logged today', () => {
      const evening = new Date('2026-03-11T19:00:00');
      const { result } = renderHook(() => useStreak(evening));
      expect(result.current.shouldShowReminder).toBe(true);
    });

    it('is false after 18:00 when practice already logged today', () => {
      localStorage.setItem('ksebe_practice_days', JSON.stringify(['2026-03-11']));
      const evening = new Date('2026-03-11T19:00:00');
      const { result } = renderHook(() => useStreak(evening));
      expect(result.current.shouldShowReminder).toBe(false);
    });

    it('is false when reminder was already shown today', () => {
      const evening = new Date('2026-03-11T20:00:00');
      localStorage.setItem('ksebe_practice_reminder_shown:2026-03-11', 'true');
      const { result } = renderHook(() => useStreak(evening));
      expect(result.current.shouldShowReminder).toBe(false);
    });
  });

  describe('markReminderShown', () => {
    it('sets shouldShowReminder to false and persists flag', () => {
      const evening = new Date('2026-03-11T19:00:00');
      const { result } = renderHook(() => useStreak(evening));
      expect(result.current.shouldShowReminder).toBe(true);

      act(() => {
        result.current.markReminderShown();
      });

      expect(result.current.shouldShowReminder).toBe(false);
      expect(localStorage.getItem('ksebe_practice_reminder_shown:2026-03-11')).toBe('true');
    });
  });
});
