import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Paywall } from '../Paywall';

describe('Paywall', () => {
  it('disables current active plan', () => {
    render(<Paywall currentPlan="premium" currentStatus="active" onSelectPlan={vi.fn()} />);

    expect(screen.getByText(/Текущий тариф: PREMIUM • Активна/)).toBeInTheDocument();

    const premiumCard = screen.getByText('Premium').closest('div.group');
    expect(premiumCard).not.toBeNull();

    const button = within(premiumCard as HTMLElement).getByRole('button', {
      name: 'Текущий тариф',
    });
    expect(button).toBeDisabled();
  });

  it('allows renewing a pending plan', async () => {
    const onSelectPlan = vi.fn();
    const user = userEvent.setup();

    render(<Paywall currentPlan="premium" currentStatus="pending" onSelectPlan={onSelectPlan} />);

    const premiumCard = screen.getByText('Premium').closest('div.group');
    expect(premiumCard).not.toBeNull();

    const button = within(premiumCard as HTMLElement).getByRole('button', {
      name: 'Обновить оплату',
    });
    expect(button).toBeEnabled();

    await user.click(button);

    expect(onSelectPlan).toHaveBeenCalledWith('premium');
  });

  it('shows loading states for current and other plans', () => {
    render(
      <Paywall currentPlan="premium" currentStatus="pending" onSelectPlan={vi.fn()} isLoading />
    );

    const premiumCard = screen.getByText('Premium').closest('div.group');
    const vipCard = screen.getByText('VIP').closest('div.group');

    expect(premiumCard).not.toBeNull();
    expect(vipCard).not.toBeNull();

    const premiumButton = within(premiumCard as HTMLElement).getByRole('button', {
      name: 'Обновляем…',
    });
    const vipButton = within(vipCard as HTMLElement).getByRole('button', { name: 'Выбираем…' });

    expect(premiumButton).toBeDisabled();
    expect(vipButton).toBeDisabled();
  });
});
