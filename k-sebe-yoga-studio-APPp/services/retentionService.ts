import { supabase } from './supabaseClient';

const PRACTICE_DAYS_KEY = 'ksebe_practice_days';
const PRACTICE_COMPLETIONS_KEY = 'ksebe_practice_completions';
const PRACTICE_PENDING_KEY = 'ksebe_practice_days_pending';
const PRACTICE_COMPLETIONS_PENDING_KEY = 'ksebe_practice_completions_pending';
const ONBOARDING_KEY = 'ksebe_onboarding';
const ONBOARDING_COMPLETE_KEY = 'ksebe_onboarding_complete';

function safeReadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeWriteJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function safeReadStringArray(key: string): string[] {
  const v = safeReadJson<unknown>(key);
  return Array.isArray(v) ? (v.filter((x) => typeof x === 'string') as string[]) : [];
}

function uniqueSortedDays(days: string[]): string[] {
  const uniq = Array.from(new Set(days.filter(Boolean)));
  uniq.sort();
  return uniq;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export type AppEventName =
  | 'onboarding_completed'
  | 'practice_logged'
  | 'practice_migrated'
  | 'practice_completed'
  | 'practice_migrated_completions'
  | 'streak_shown';

export const retentionService = {
  async logEvent(userId: string, name: AppEventName, props?: Record<string, unknown>) {
    try {
      await supabase.from('app_events').insert({
        user_id: userId,
        name,
        props: props ?? null,
      });
    } catch {
      // ignore
    }
  },

  async upsertPracticeDay(userId: string, day: string, kind: string = 'streak', source = 'app') {
    try {
      const { error } = await supabase.from('practice_events').upsert(
        {
          user_id: userId,
          day,
          kind,
          source,
        },
        { onConflict: 'user_id,day,kind' }
      );
      if (error) throw error;
      return { ok: true as const };
    } catch (e) {
      // queue for later sync
      const pending = safeReadStringArray(PRACTICE_PENDING_KEY);
      safeWriteJson(PRACTICE_PENDING_KEY, uniqueSortedDays([...pending, day]));
      return { ok: false as const, error: e };
    }
  },
  async upsertPracticeCompletion(userId: string, day: string, source = 'app') {
    try {
      const { error } = await supabase.from('practice_events').upsert(
        {
          user_id: userId,
          day,
          kind: 'completion',
          source,
        },
        { onConflict: 'user_id,day,kind' }
      );
      if (error) throw error;
      return { ok: true as const };
    } catch (e) {
      const pending = safeReadStringArray(PRACTICE_COMPLETIONS_PENDING_KEY);
      safeWriteJson(PRACTICE_COMPLETIONS_PENDING_KEY, uniqueSortedDays([...pending, day]));
      return { ok: false as const, error: e };
    }
  },
  async syncPendingPracticeCompletions(userId: string) {
    const pending = safeReadStringArray(PRACTICE_COMPLETIONS_PENDING_KEY);
    if (!pending.length) return { synced: 0 };

    let synced = 0;
    const remaining: string[] = [];

    for (const day of pending) {
      const res = await this.upsertPracticeCompletion(userId, day, 'pending');
      if (res.ok) synced += 1;
      else remaining.push(day);
    }

    safeWriteJson(PRACTICE_COMPLETIONS_PENDING_KEY, remaining);
    return { synced };
  },

  async syncPendingPracticeDays(userId: string) {
    const pending = safeReadStringArray(PRACTICE_PENDING_KEY);
    if (!pending.length) return { synced: 0 };

    let synced = 0;
    const remaining: string[] = [];

    for (const day of pending) {
      const res = await this.upsertPracticeDay(userId, day, 'streak', 'pending');
      if (res.ok) synced += 1;
      else remaining.push(day);
    }

    safeWriteJson(PRACTICE_PENDING_KEY, remaining);
    return { synced };
  },

  async saveOnboarding(userId: string, onboarding: unknown) {
    const now = new Date().toISOString();
    await supabase.from('user_preferences').upsert(
      {
        user_id: userId,
        onboarding,
        updated_at: now,
      },
      { onConflict: 'user_id' }
    );
  },

  async fetchRemotePracticeDays(userId: string, kind: 'streak' | 'completion' = 'streak') {
    const { data, error } = await supabase
      .from('practice_events')
      .select('day')
      .eq('user_id', userId)
      .eq('kind', kind)
      .order('day', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((r) => String((r as any).day));
  },

  async bootstrapForUser(userId: string) {
    const markerKey = `ksebe_retention_migrated:${userId}`;
    const alreadyMigrated = localStorage.getItem(markerKey) === 'true';

    // Always attempt to sync pending streak days
    await this.syncPendingPracticeDays(userId);
    await this.syncPendingPracticeCompletions(userId);

    if (alreadyMigrated) return;

    // 1) Onboarding → Supabase (if completed locally)
    const onboardingCompleted = localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true';
    const onboarding = safeReadJson<unknown>(ONBOARDING_KEY);
    if (onboardingCompleted && onboarding) {
      try {
        await this.saveOnboarding(userId, onboarding);
        await this.logEvent(userId, 'onboarding_completed', { source: 'migration' });
      } catch {
        // ignore
      }
    }

    // 2) Practice days (streak markers) → Supabase
    const localDays = uniqueSortedDays(safeReadStringArray(PRACTICE_DAYS_KEY));
    if (localDays.length) {
      let inserted = 0;
      for (const part of chunk(localDays, 50)) {
        const rows = part.map((day) => ({
          user_id: userId,
          day,
          kind: 'streak',
          source: 'migration',
        }));
        const { error } = await supabase.from('practice_events').upsert(rows, {
          onConflict: 'user_id,day,kind',
        });
        if (!error) inserted += part.length;
      }
      await this.logEvent(userId, 'practice_migrated', {
        count: localDays.length,
        attempted: inserted,
      });
    }

    // 3) Practice completions → Supabase
    const localCompletions = uniqueSortedDays(safeReadStringArray(PRACTICE_COMPLETIONS_KEY));
    if (localCompletions.length) {
      let inserted = 0;
      for (const part of chunk(localCompletions, 50)) {
        const rows = part.map((day) => ({
          user_id: userId,
          day,
          kind: 'completion',
          source: 'migration',
        }));
        const { error } = await supabase.from('practice_events').upsert(rows, {
          onConflict: 'user_id,day,kind',
        });
        if (!error) inserted += part.length;
      }
      await this.logEvent(userId, 'practice_migrated_completions', {
        count: localCompletions.length,
        attempted: inserted,
      });
    }

    // 4) Pull remote days back to local (cross-device)
    try {
      const remoteDays = uniqueSortedDays(await this.fetchRemotePracticeDays(userId));
      const merged = uniqueSortedDays([...localDays, ...remoteDays]);
      safeWriteJson(PRACTICE_DAYS_KEY, merged);
    } catch {
      // ignore
    }

    // 5) Pull remote completions back to local (cross-device)
    try {
      const remoteCompletions = uniqueSortedDays(
        await this.fetchRemotePracticeDays(userId, 'completion')
      );
      const merged = uniqueSortedDays([...localCompletions, ...remoteCompletions]);
      safeWriteJson(PRACTICE_COMPLETIONS_KEY, merged);
    } catch {
      // ignore
    }

    localStorage.setItem(markerKey, 'true');
  },
};
