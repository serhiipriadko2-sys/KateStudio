import { DateKey, fromDateKey, toDateKey, uniqueSortedDays } from './streak';

export const PRACTICE_COMPLETIONS_KEY = 'ksebe_practice_completions';

type Listener = (days: DateKey[]) => void;
const listeners = new Set<Listener>();

export function subscribePracticeCompletions(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifyPracticeCompletionsUpdated(days?: DateKey[]) {
  const snapshot = days ?? readPracticeCompletions();
  listeners.forEach((listener) => listener(snapshot));
}

export function readPracticeCompletions(): DateKey[] {
  try {
    const raw = localStorage.getItem(PRACTICE_COMPLETIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as DateKey[]) : [];
  } catch {
    return [];
  }
}

export function writePracticeCompletions(days: DateKey[]) {
  try {
    localStorage.setItem(PRACTICE_COMPLETIONS_KEY, JSON.stringify(days.slice(-730)));
  } catch {
    // ignore
  }
}

export function addPracticeCompletion(days: DateKey[], day: DateKey): DateKey[] {
  return uniqueSortedDays([...days, day]);
}

export function getWeekWindow(now: Date = new Date()): { start: DateKey; end: DateKey } {
  const start = new Date(now);
  const day = start.getDay();
  const diff = (day + 6) % 7; // days since Monday
  start.setDate(start.getDate() - diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return { start: toDateKey(start), end: toDateKey(end) };
}

export function formatWeekLabel(now: Date = new Date()): string {
  const { start, end } = getWeekWindow(now);
  const startDate = fromDateKey(start);
  const endDate = fromDateKey(end);

  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  });

  return `${formatter.format(startDate)} — ${formatter.format(endDate)}`;
}

export function countPracticeInWeek(days: DateKey[], now: Date = new Date()): number {
  const { start, end } = getWeekWindow(now);
  return days.filter((day) => day >= start && day <= end).length;
}
