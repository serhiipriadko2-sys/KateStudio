import { useEffect, useMemo, useState } from 'react';
import {
  addPracticeCompletion,
  notifyPracticeCompletionsUpdated,
  readPracticeCompletions,
  subscribePracticeCompletions,
  writePracticeCompletions,
} from '../utils/practiceLog';
import { type DateKey, toDateKey } from '../utils/streak';

export type PracticeCompletionModel = {
  days: DateKey[];
  today: DateKey;
  hasToday: boolean;
  logToday: () => void;
  logDay: (day: DateKey) => void;
};

export function usePracticeCompletions(now: Date = new Date()): PracticeCompletionModel {
  const [days, setDays] = useState<DateKey[]>(() => readPracticeCompletions());

  useEffect(() => subscribePracticeCompletions(setDays), []);

  const today = useMemo(() => toDateKey(now), [now]);

  const logDay = (day: DateKey) => {
    setDays((prev) => {
      const next = addPracticeCompletion(prev, day);
      writePracticeCompletions(next);
      notifyPracticeCompletionsUpdated(next);
      return next;
    });
  };

  const logToday = () => {
    logDay(today);
  };

  return {
    days,
    today,
    hasToday: days.includes(today),
    logDay,
    logToday,
  };
}
