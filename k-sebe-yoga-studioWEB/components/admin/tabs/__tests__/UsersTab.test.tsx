import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersTab } from '../UsersTab';

const mocks = vi.hoisted(() => {
  const profilesResult = {
    data: [
      {
        user_id: 'user-1',
        name: 'Admin User',
        phone: '+79990000000',
        city: 'Dubna',
        created_at: '2026-01-01T00:00:00Z',
      },
    ],
    error: null,
  };
  const subscriptionsResult = {
    data: null,
    error: new Error('subscriptions denied'),
  };

  const profilesLimit = vi.fn(() => Promise.resolve(profilesResult));
  const profilesOrder = vi.fn(() => ({ limit: profilesLimit }));
  const profilesSelect = vi.fn(() => ({ order: profilesOrder }));
  const subscriptionsSelect = vi.fn(() => Promise.resolve(subscriptionsResult));
  const from = vi.fn((table: string) => {
    if (table === 'profiles') {
      return { select: profilesSelect };
    }
    if (table === 'subscriptions') {
      return { select: subscriptionsSelect };
    }
    return {};
  });

  return { from, subscriptionsResult };
});

vi.mock('@ksebe/shared', () => ({
  supabase: {
    from: mocks.from,
  },
}));

const renderUsersTab = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <UsersTab toast={vi.fn()} />
    </QueryClientProvider>
  );
};

describe('UsersTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('surfaces subscription query errors instead of silently hiding subscriptions', async () => {
    renderUsersTab();

    expect(await screen.findByText(/subscriptions denied/i)).toBeInTheDocument();
  });
});
