import { useEffect, useMemo, useState } from 'react';
import { appendDay, computeStreak, type DateKey } from '../utils/streak';

const STORAGE_KEY = 'ksebe_practice_days';
const REMINDER_SHOWN_PREFIX = 'ksebe_practice_reminder_shown:'; // + YYYY-MM-DD

function safeReadDays(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWriteDays(days: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(days.slice(-730))); // keep ~2 years max
  } catch {
    // ignore
  }
}

export type StreakModel = {
  today: DateKey;
  hasToday: boolean;
  currentStreak: number;
  longestStreak: number;
  lastDay?: DateKey;
  days: DateKey[];
  logToday: () => void;
  shouldShowReminder: boolean;
  markReminderShown: () => void;
};

export function useStreak(now: Date = new Date()): StreakModel {
  const [days, setDays] = useState<DateKey[]>(() => safeReadDays() as DateKey[]);

  useEffect(() => {
    safeWriteDays(days);
  }, [days]);

  const stats = useMemo(() => computeStreak(days, now), [days, now]);

  const logToday = () => {
    setDays((prev) => appendDay(prev, stats.today));
  };

  const reminderKey = `${REMINDER_SHOWN_PREFIX}${stats.today}`;
  const [shouldShowReminder, setShouldShowReminder] = useState(false);

  useEffect(() => {
    // soft reminder: after 18:00 local, if no practice today, show once per day
    const hour = now.getHours();
    if (hour < 18) {
      setShouldShowReminder(false);
      return;
    }
    if (stats.hasToday) {
      setShouldShowReminder(false);
      return;
    }
    const alreadyShown = localStorage.getItem(reminderKey) === 'true';
    setShouldShowReminder(!alreadyShown);
  }, [now, stats.hasToday, reminderKey]);

  const markReminderShown = () => {
    try {
      localStorage.setItem(reminderKey, 'true');
    } catch {
      // ignore
    }
    setShouldShowReminder(false);
  };

  return {
    today: stats.today,
    hasToday: stats.hasToday,
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    lastDay: stats.lastDay,
    days,
    logToday,
    shouldShowReminder,
    markReminderShown,
  };
}
