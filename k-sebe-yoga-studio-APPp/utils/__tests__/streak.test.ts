import { describe, expect, it } from 'vitest';
import { addDays, appendDay, computeStreak, type DateKey } from '../streak';

describe('streak utils', () => {
  it('returns zeros for empty history', () => {
    const now = new Date(2025, 11, 27, 12, 0, 0);
    const stats = computeStreak([], now);
    expect(stats.today).toBe('2025-12-27');
    expect(stats.hasToday).toBe(false);
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(0);
    expect(stats.lastDay).toBeUndefined();
  });

  it('counts streak ending yesterday if today not logged', () => {
    const now = new Date(2025, 11, 27, 12, 0, 0);
    const stats = computeStreak(['2025-12-26'], now);
    expect(stats.hasToday).toBe(false);
    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(1);
  });

  it('counts streak ending today if today logged', () => {
    const now = new Date(2025, 11, 27, 12, 0, 0);
    const stats = computeStreak(['2025-12-26', '2025-12-27'], now);
    expect(stats.hasToday).toBe(true);
    expect(stats.currentStreak).toBe(2);
    expect(stats.longestStreak).toBe(2);
  });

  it('computes longest streak independently of current', () => {
    const now = new Date(2025, 11, 27, 12, 0, 0);
    const stats = computeStreak(['2025-12-20', '2025-12-21', '2025-12-22', '2025-12-26'], now);
    expect(stats.currentStreak).toBe(1);
    expect(stats.longestStreak).toBe(3);
  });

  it('appendDay deduplicates and sorts', () => {
    const days: string[] = ['2025-12-27', '2025-12-26', '2025-12-27'];
    const next = appendDay(days, '2025-12-25');
    expect(next).toEqual(['2025-12-25', '2025-12-26', '2025-12-27']);
  });

  it('addDays moves across month boundaries', () => {
    expect(addDays('2025-01-01', -1)).toBe('2024-12-31');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
  });
});
