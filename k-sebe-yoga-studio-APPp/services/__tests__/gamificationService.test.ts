import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gamificationService } from '../gamificationService';
import { supabase } from '../supabaseClient';

// Mock Supabase
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

const mockSingle = vi.fn();

// Chain helpers
const createChain = () => {
  const chain: any = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.single = mockSingle;
  chain.insert = mockInsert;
  chain.update = mockUpdate;
  return chain;
};

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('gamificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset chain mocks
    const chain = createChain();
    (supabase.from as any).mockReturnValue(chain);
  });

  it('calculates XP correctly', async () => {
    // Mock user progress
    mockSingle.mockResolvedValue({
      data: {
        user_id: 'user-1',
        total_xp: 50,
        level: 1,
        current_streak: 5,
      },
      error: null,
    });

    // Mock achievement fetch (none)
    mockSelect.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [] }),
    });

    // We need to fix the mock implementation for the specific chain in the service
    // user_progress fetch
    const fromMock = supabase.from as any;
    fromMock.mockImplementation((table: string) => {
      if (table === 'user_progress') {
        return {
          select: () => ({
            eq: () => ({
              single: mockSingle
            })
          }),
          update: mockUpdate
        };
      }
      if (table === 'user_achievements') {
        return {
          select: () => ({
            eq: () => Promise.resolve({ data: [] })
          }),
          insert: mockInsert
        };
      }
      if (table === 'practice_events') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ count: 10 }) // 10 practices
            })
          })
        };
      }
      return {};
    });

    // Mock update response
    mockUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null })
    });

    const result = await gamificationService.processActivity('user-1', 'practice_completed');

    expect(result.newXp).toBe(60); // 50 + 10
    expect(result.newLevel).toBe(1); // 60 < 100

    // Check update called
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
      total_xp: 60,
      level: 1
    }));
  });
});
