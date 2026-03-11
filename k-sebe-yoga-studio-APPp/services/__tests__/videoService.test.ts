import { supabase } from '@ksebe/shared';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { videoService } from '../videoService';

vi.mock('@ksebe/shared', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('videoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns videos on success', async () => {
    const videos = [
      {
        id: 'v1',
        title: 'Inside Flow Basic',
        duration: '45:00',
        level: 'beginner',
        is_locked: false,
        tags: ['flow'],
      },
    ];
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: videos, error: null }),
    });

    const result = await videoService.getVideos();
    expect(result).toEqual(videos);
    expect(supabase.from).toHaveBeenCalledWith('videos');
  });

  it('returns [] on Supabase error', async () => {
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('db error') }),
    });

    const result = await videoService.getVideos();
    expect(result).toEqual([]);
  });

  it('returns [] when data is null without error', async () => {
    (supabase.from as Mock).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const result = await videoService.getVideos();
    expect(result).toEqual([]);
  });
});
