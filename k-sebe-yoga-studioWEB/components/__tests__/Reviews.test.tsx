import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Reviews } from '../Reviews';

const mocks = vi.hoisted(() => {
  const reviewsQuery = {
    data: [
      {
        id: 'review-live-1',
        name: 'Live Review',
        text: 'Updated from Supabase',
        image_url: 'https://cdn.example.com/reviews/live-avatar.jpg',
        rating: 5,
        display_order: 0,
        is_active: true,
        created_at: '2026-05-11T00:00:00.000Z',
      },
    ],
    error: null as Error | null,
  };
  const secondOrder = vi.fn(() => Promise.resolve(reviewsQuery));
  const firstOrder = vi.fn(() => ({ order: secondOrder }));
  const eq = vi.fn(() => ({ order: firstOrder }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({ select }));

  return {
    from,
    select,
    eq,
    firstOrder,
    secondOrder,
    reviewsQuery,
  };
});

vi.mock('@ksebe/shared', () => ({
  IMAGES: {
    reviews: {
      avatars: [
        '/fallback-1.jpg',
        '/fallback-2.jpg',
        '/fallback-3.jpg',
        '/fallback-4.jpg',
        '/fallback-5.jpg',
      ],
    },
  },
  isSupabaseConfigured: true,
  supabase: {
    from: mocks.from,
  },
}));

const renderReviews = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Reviews />
    </QueryClientProvider>
  );
};

describe('Reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches Supabase reviews immediately instead of keeping fallback avatars fresh', async () => {
    renderReviews();

    await waitFor(() => {
      expect(mocks.from).toHaveBeenCalledWith('reviews');
    });

    const liveAvatar = await screen.findByAltText('Live Review');
    expect(liveAvatar).toHaveAttribute('src', 'https://cdn.example.com/reviews/live-avatar.jpg');
  });
});
