import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PricingTab } from '../PricingTab';

const mocks = vi.hoisted(() => {
  const pricingQuery = {
    data: [
      {
        id: 'plan-1',
        category: 'yoga',
        title: 'Trial plan',
        price: '700',
        subtitle: null,
        description: null,
        features: null,
        is_popular: false,
        is_dark: false,
        display_order: 0,
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
      },
    ] as unknown[],
    error: null as Error | null,
  };
  const secondOrder = vi.fn(() => Promise.resolve(pricingQuery));
  const firstOrder = vi.fn(() => ({ order: secondOrder }));
  const eq = vi.fn(() => ({ order: firstOrder }));
  const select = vi.fn(() => ({ eq }));
  const from = vi.fn(() => ({
    select,
    insert: vi.fn(() => Promise.resolve({ error: null })),
    update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
    delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
  }));

  return { pricingQuery, from };
});

vi.mock('@ksebe/shared', () => ({
  supabase: {
    from: mocks.from,
  },
}));

const renderPricingTab = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <PricingTab toast={vi.fn()} />
    </QueryClientProvider>
  );
};

describe('PricingTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders plans even when features is null in the database', async () => {
    renderPricingTab();

    expect(await screen.findByText('Trial plan')).toBeInTheDocument();
    expect(screen.getByText('700')).toBeInTheDocument();
  });
});
