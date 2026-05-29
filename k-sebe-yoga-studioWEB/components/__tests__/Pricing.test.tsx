import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pricing } from '../Pricing';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderPricing = (onBook = vi.fn()) => {
  const queryClient = createTestQueryClient();
  return {
    onBook,
    ...render(
      <QueryClientProvider client={queryClient}>
        <Pricing onBook={onBook} />
      </QueryClientProvider>
    ),
  };
};

describe('Pricing', () => {
  it('renders plans and triggers booking callback', async () => {
    const user = userEvent.setup();
    const { onBook } = renderPricing();

    expect(screen.getByText(/Услуги и абонементы/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Йога-абонементы/i, level: 3 })).toBeInTheDocument();

    const planTitle = screen.getByText('9 занятий');
    const planCard = planTitle.closest('div.group');
    expect(planCard).not.toBeNull();

    const button = within(planCard as HTMLElement).getByRole('button', {
      name: /Записаться/i,
    });
    await user.click(button);

    expect(onBook).toHaveBeenCalledWith('9 занятий', '6 300 ₽');
  });

  it('switches pricing tabs', async () => {
    const user = userEvent.setup();
    renderPricing();

    const personalTab = screen.getByRole('button', { name: /Персональные/i });
    await user.click(personalTab);

    expect(screen.getByText(/Персональные тренировки/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /Йога-абонементы/i, level: 3 })
    ).not.toBeInTheDocument();
  });
});
