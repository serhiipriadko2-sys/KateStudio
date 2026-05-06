import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultTestimonials } from '../../../Reviews';
import { ReviewsTab } from '../ReviewsTab';

const mocks = vi.hoisted(() => {
  const reviewsQuery = {
    data: [] as unknown[] | null,
    error: null as Error | null,
  };
  const secondOrder = vi.fn(() => Promise.resolve(reviewsQuery));
  const firstOrder = vi.fn(() => ({ order: secondOrder }));
  const select = vi.fn(() => ({ order: firstOrder }));
  const insert = vi.fn(() => Promise.resolve({ error: null }));
  const updateEq = vi.fn(() => Promise.resolve({ error: null }));
  const update = vi.fn(() => ({ eq: updateEq }));
  const deleteEq = vi.fn(() => Promise.resolve({ error: null }));
  const deleteReview = vi.fn(() => ({ eq: deleteEq }));
  const storageUpload = vi.fn(() =>
    Promise.resolve({ data: { path: 'reviews/uploaded-avatar.jpg' }, error: null })
  );
  const getPublicUrl = vi.fn(() => ({
    data: { publicUrl: 'https://cdn.example.com/reviews/uploaded-avatar.jpg' },
  }));
  const from = vi.fn(() => ({
    select,
    insert,
    update,
    delete: deleteReview,
  }));
  const storageFrom = vi.fn(() => ({
    upload: storageUpload,
    getPublicUrl,
  }));

  return {
    avatars: ['/avatar-1.jpg', '/avatar-2.jpg', '/avatar-3.jpg', '/avatar-4.jpg', '/avatar-5.jpg'],
    reviewsQuery,
    secondOrder,
    firstOrder,
    select,
    insert,
    update,
    updateEq,
    deleteEq,
    deleteReview,
    storageUpload,
    getPublicUrl,
    from,
    storageFrom,
  };
});

vi.mock('@ksebe/shared', () => ({
  IMAGES: {
    reviews: {
      avatars: mocks.avatars,
    },
  },
  isSupabaseConfigured: true,
  supabase: {
    from: mocks.from,
    storage: {
      from: mocks.storageFrom,
    },
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderReviewsTab = (toast = vi.fn()) => {
  const queryClient = createTestQueryClient();
  return {
    toast,
    ...render(
      <QueryClientProvider client={queryClient}>
        <ReviewsTab toast={toast} />
      </QueryClientProvider>
    ),
  };
};

describe('ReviewsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.reviewsQuery.data = [];
    mocks.reviewsQuery.error = null;
  });

  it('shows site fallback reviews when Supabase has no review rows', async () => {
    renderReviewsTab();

    expect(await screen.findByText(defaultTestimonials[0].name)).toBeInTheDocument();
    expect(screen.getByText(defaultTestimonials[1].name)).toBeInTheDocument();
    expect(mocks.from).toHaveBeenCalledWith('reviews');
  });

  it('uploads a person photo and saves the public URL to the review', async () => {
    const user = userEvent.setup();
    mocks.reviewsQuery.data = [
      {
        id: 'db-review-1',
        name: 'Marina',
        text: 'Strong practice.',
        image_url: null,
        rating: 5,
        display_order: 0,
        is_active: true,
      },
    ];

    renderReviewsTab();

    expect(await screen.findByText('Marina')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit review Marina' }));

    const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
    await user.upload(screen.getByLabelText('Upload review photo'), file);

    await waitFor(() => {
      expect(mocks.storageUpload).toHaveBeenCalledWith(expect.stringMatching(/^reviews\//), file);
    });

    await user.click(screen.getByRole('button', { name: 'Save review' }));

    await waitFor(() => {
      expect(mocks.update).toHaveBeenCalledWith(
        expect.objectContaining({
          image_url: 'https://cdn.example.com/reviews/uploaded-avatar.jpg',
        })
      );
    });
    expect(mocks.updateEq).toHaveBeenCalledWith('id', 'db-review-1');
  });
});
