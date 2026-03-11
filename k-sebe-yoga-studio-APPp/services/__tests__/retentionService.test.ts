import { supabase } from '@ksebe/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { retentionService } from '../retentionService';

const VALID_UUID = '11111111-1111-4111-8111-111111111111';

vi.mock('@ksebe/shared', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
    },
  },
}));

function makeBuilder(overrides: Record<string, unknown> = {}) {
  const builder: Record<string, unknown> = {
    upsert: vi.fn().mockResolvedValue({ error: null }),
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn().mockResolvedValue({ data: [], error: null }),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  };
  // Chain helpers return the same builder
  (builder.select as Mock).mockReturnValue(builder);
  (builder.eq as Mock).mockReturnValue(builder);
  return builder;
}

function mockSessionWithUser(userId = VALID_UUID) {
  (supabase.auth.getSession as Mock).mockResolvedValue({
    data: { session: { user: { id: userId } } },
  });
}

function mockNoSession() {
  (supabase.auth.getSession as Mock).mockResolvedValue({
    data: { session: null },
  });
}

describe('retentionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // ─── logEvent ───────────────────────────────────────────────────────────────

  describe('logEvent', () => {
    it('inserts an app_events row for a valid authenticated user', async () => {
      mockSessionWithUser();
      const builder = makeBuilder();
      (supabase.from as Mock).mockReturnValue(builder);

      await retentionService.logEvent(VALID_UUID, 'practice_logged');

      expect(supabase.from).toHaveBeenCalledWith('app_events');
      expect(builder.insert).toHaveBeenCalledWith({
        user_id: VALID_UUID,
        name: 'practice_logged',
        props: null,
      });
    });

    it('silently ignores errors (no throw)', async () => {
      mockSessionWithUser();
      const builder = makeBuilder({
        insert: vi.fn().mockRejectedValue(new Error('DB error')),
      });
      (supabase.from as Mock).mockReturnValue(builder);

      await expect(retentionService.logEvent(VALID_UUID, 'streak_shown')).resolves.toBeUndefined();
    });

    it('does nothing when userId is not a valid UUID', async () => {
      mockSessionWithUser();
      await retentionService.logEvent('not-a-uuid', 'practice_logged');
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('does nothing when session user differs from expected userId', async () => {
      (supabase.auth.getSession as Mock).mockResolvedValue({
        data: { session: { user: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' } } },
      });
      const builder = makeBuilder();
      (supabase.from as Mock).mockReturnValue(builder);

      await retentionService.logEvent(VALID_UUID, 'practice_logged');
      expect(builder.insert).not.toHaveBeenCalled();
    });
  });

  // ─── upsertPracticeDay ───────────────────────────────────────────────────────

  describe('upsertPracticeDay', () => {
    it('returns { ok: true } on success', async () => {
      mockSessionWithUser();
      (supabase.from as Mock).mockReturnValue(
        makeBuilder({ upsert: vi.fn().mockResolvedValue({ error: null }) })
      );

      const result = await retentionService.upsertPracticeDay(VALID_UUID, '2026-03-01');
      expect(result.ok).toBe(true);
    });

    it('falls back to localStorage and returns { ok: false } on Supabase error', async () => {
      mockSessionWithUser();
      (supabase.from as Mock).mockReturnValue(
        makeBuilder({
          upsert: vi.fn().mockResolvedValue({ error: new Error('upsert failed') }),
        })
      );

      const result = await retentionService.upsertPracticeDay(VALID_UUID, '2026-03-01');
      expect(result.ok).toBe(false);

      const pending = JSON.parse(localStorage.getItem('ksebe_practice_days_pending') ?? '[]');
      expect(pending).toContain('2026-03-01');
    });

    it('falls back to localStorage when auth check fails', async () => {
      mockNoSession();

      const result = await retentionService.upsertPracticeDay(VALID_UUID, '2026-03-02');
      expect(result.ok).toBe(false);
      const pending = JSON.parse(localStorage.getItem('ksebe_practice_days_pending') ?? '[]');
      expect(pending).toContain('2026-03-02');
    });
  });

  // ─── syncPendingPracticeDays ─────────────────────────────────────────────────

  describe('syncPendingPracticeDays', () => {
    it('returns { synced: 0 } when pending list is empty', async () => {
      mockSessionWithUser();
      const result = await retentionService.syncPendingPracticeDays(VALID_UUID);
      expect(result).toEqual({ synced: 0 });
    });

    it('syncs all pending days and clears the list', async () => {
      mockSessionWithUser();
      localStorage.setItem(
        'ksebe_practice_days_pending',
        JSON.stringify(['2026-01-01', '2026-01-02'])
      );
      (supabase.from as Mock).mockReturnValue(
        makeBuilder({ upsert: vi.fn().mockResolvedValue({ error: null }) })
      );

      const result = await retentionService.syncPendingPracticeDays(VALID_UUID);
      expect(result.synced).toBe(2);
      const remaining = JSON.parse(localStorage.getItem('ksebe_practice_days_pending') ?? '[]');
      expect(remaining).toHaveLength(0);
    });

    it('keeps days that fail to sync', async () => {
      mockSessionWithUser();
      localStorage.setItem('ksebe_practice_days_pending', JSON.stringify(['2026-02-01']));
      (supabase.from as Mock).mockReturnValue(
        makeBuilder({
          upsert: vi.fn().mockResolvedValue({ error: new Error('fail') }),
        })
      );

      const result = await retentionService.syncPendingPracticeDays(VALID_UUID);
      expect(result.synced).toBe(0);
      const remaining = JSON.parse(localStorage.getItem('ksebe_practice_days_pending') ?? '[]');
      expect(remaining).toContain('2026-02-01');
    });
  });

  // ─── hasCompletedOnboarding ──────────────────────────────────────────────────

  describe('hasCompletedOnboarding', () => {
    it('returns true immediately when localStorage flag is set', async () => {
      localStorage.setItem('ksebe_onboarding_complete', 'true');
      const result = await retentionService.hasCompletedOnboarding(VALID_UUID);
      expect(result).toBe(true);
      // Should NOT hit Supabase
      expect(supabase.auth.getSession).not.toHaveBeenCalled();
    });

    it('returns false when not in localStorage and auth fails', async () => {
      mockNoSession();
      const result = await retentionService.hasCompletedOnboarding(VALID_UUID);
      expect(result).toBe(false);
    });

    it('returns true and caches flag when Supabase has onboarding data', async () => {
      mockSessionWithUser();
      const builder = makeBuilder({
        single: vi.fn().mockResolvedValue({
          data: { onboarding: { goal: 'relax' } },
          error: null,
        }),
      });
      (supabase.from as Mock).mockReturnValue(builder);

      const result = await retentionService.hasCompletedOnboarding(VALID_UUID);
      expect(result).toBe(true);
      expect(localStorage.getItem('ksebe_onboarding_complete')).toBe('true');
    });

    it('returns false when Supabase has no onboarding data', async () => {
      mockSessionWithUser();
      (supabase.from as Mock).mockReturnValue(makeBuilder());

      const result = await retentionService.hasCompletedOnboarding(VALID_UUID);
      expect(result).toBe(false);
    });
  });

  // ─── fetchRemotePracticeDays ─────────────────────────────────────────────────

  describe('fetchRemotePracticeDays', () => {
    it('returns array of day strings on success', async () => {
      mockSessionWithUser();
      const builder = makeBuilder({
        order: vi.fn().mockResolvedValue({
          data: [{ day: '2026-01-01' }, { day: '2026-01-02' }],
          error: null,
        }),
      });
      (supabase.from as Mock).mockReturnValue(builder);

      const days = await retentionService.fetchRemotePracticeDays(VALID_UUID);
      expect(days).toEqual(['2026-01-01', '2026-01-02']);
    });

    it('throws AUTH_REQUIRED when session user differs', async () => {
      mockNoSession();
      await expect(retentionService.fetchRemotePracticeDays(VALID_UUID)).rejects.toThrow(
        'AUTH_REQUIRED'
      );
    });

    it('throws when Supabase returns an error', async () => {
      mockSessionWithUser();
      const builder = makeBuilder({
        order: vi.fn().mockResolvedValue({ data: null, error: new Error('db error') }),
      });
      (supabase.from as Mock).mockReturnValue(builder);

      await expect(retentionService.fetchRemotePracticeDays(VALID_UUID)).rejects.toThrow(
        'db error'
      );
    });
  });

  // ─── bootstrapForUser ────────────────────────────────────────────────────────

  describe('bootstrapForUser', () => {
    it('returns early when session user does not match', async () => {
      mockNoSession();
      await retentionService.bootstrapForUser(VALID_UUID);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('sets migration marker after successful bootstrap', async () => {
      mockSessionWithUser();
      (supabase.from as Mock).mockReturnValue(
        makeBuilder({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })
      );

      await retentionService.bootstrapForUser(VALID_UUID);

      const markerKey = `ksebe_retention_migrated:${VALID_UUID}`;
      expect(localStorage.getItem(markerKey)).toBe('true');
    });

    it('skips migration steps when already migrated', async () => {
      mockSessionWithUser();
      localStorage.setItem(`ksebe_retention_migrated:${VALID_UUID}`, 'true');
      (supabase.from as Mock).mockReturnValue(
        makeBuilder({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        })
      );

      await retentionService.bootstrapForUser(VALID_UUID);

      // from() is only called for sync of pending days (none here), not for migration steps
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });
});
