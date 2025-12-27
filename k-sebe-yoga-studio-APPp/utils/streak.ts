export type DateKey = `${number}-${number}-${number}`; // YYYY-MM-DD (local)

export function toDateKey(date: Date): DateKey {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}` as DateKey;
}

export function fromDateKey(key: DateKey): Date {
  const [y, m, d] = key.split('-').map((p) => Number(p));
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function addDays(key: DateKey, deltaDays: number): DateKey {
  const dt = fromDateKey(key);
  dt.setDate(dt.getDate() + deltaDays);
  return toDateKey(dt);
}

export function uniqueSortedDays(days: string[]): DateKey[] {
  const uniq = Array.from(new Set(days.filter(Boolean)));
  uniq.sort(); // YYYY-MM-DD lexicographic == chronological
  return uniq as DateKey[];
}

export type StreakStats = {
  today: DateKey;
  hasToday: boolean;
  currentStreak: number; // consecutive days ending today if hasToday else ending yesterday (if present)
  longestStreak: number;
  lastDay?: DateKey;
};

export function computeStreak(days: string[], now: Date = new Date()): StreakStats {
  const normalized = uniqueSortedDays(days);
  const today = toDateKey(now);
  const set = new Set<DateKey>(normalized);
  const hasToday = set.has(today);

  const end = hasToday ? today : addDays(today, -1);
  let currentStreak = 0;
  let cursor: DateKey = end;
  while (set.has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  // Longest streak: scan sorted unique days
  let longestStreak = 0;
  let run = 0;
  let prev: DateKey | undefined;
  for (const day of normalized) {
    if (!prev) {
      run = 1;
    } else {
      run = day === addDays(prev, 1) ? run + 1 : 1;
    }
    prev = day;
    if (run > longestStreak) longestStreak = run;
  }

  const lastDay = normalized.length ? normalized[normalized.length - 1] : undefined;

  return { today, hasToday, currentStreak, longestStreak, lastDay };
}

export function appendDay(days: string[], day: DateKey): DateKey[] {
  return uniqueSortedDays([...days, day]);
}
