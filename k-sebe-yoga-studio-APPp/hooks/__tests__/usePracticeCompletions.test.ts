import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { PRACTICE_COMPLETIONS_KEY, writePracticeCompletions } from '../../utils/practiceLog';
import type { DateKey } from '../../utils/streak';
import { usePracticeCompletions } from '../usePracticeCompletions';

describe('usePracticeCompletions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty days on first load', () => {
    const { result } = renderHook(() => usePracticeCompletions(new Date('2026-03-11')));
    expect(result.current.days).toHaveLength(0);
    expect(result.current.hasToday).toBe(false);
    expect(result.current.today).toBe('2026-03-11');
  });

  it('reads existing completions from localStorage', () => {
    writePracticeCompletions(['2026-03-10', '2026-03-11'] as DateKey[]);
    const { result } = renderHook(() => usePracticeCompletions(new Date('2026-03-11')));

    expect(result.current.days).toContain('2026-03-11');
    expect(result.current.hasToday).toBe(true);
  });

  it('logToday adds today to days and persists', () => {
    const { result } = renderHook(() => usePracticeCompletions(new Date('2026-03-11')));

    act(() => {
      result.current.logToday();
    });

    expect(result.current.hasToday).toBe(true);
    expect(result.current.days).toContain('2026-03-11');

    const stored = JSON.parse(localStorage.getItem(PRACTICE_COMPLETIONS_KEY) ?? '[]');
    expect(stored).toContain('2026-03-11');
  });

  it('logDay adds a specific day', () => {
    const { result } = renderHook(() => usePracticeCompletions(new Date('2026-03-11')));

    act(() => {
      result.current.logDay('2026-03-05' as DateKey);
    });

    expect(result.current.days).toContain('2026-03-05');
  });

  it('logToday is idempotent (no duplicates)', () => {
    const { result } = renderHook(() => usePracticeCompletions(new Date('2026-03-11')));

    act(() => {
      result.current.logToday();
      result.current.logToday();
    });

    const count = result.current.days.filter((d) => d === '2026-03-11').length;
    expect(count).toBe(1);
  });

  it('notifies other subscribers when logToday is called', () => {
    const { result: r1 } = renderHook(() => usePracticeCompletions(new Date('2026-03-11')));
    const { result: r2 } = renderHook(() => usePracticeCompletions(new Date('2026-03-11')));

    act(() => {
      r1.current.logToday();
    });

    // Both hooks should reflect the new state
    expect(r2.current.days).toContain('2026-03-11');
  });
});
