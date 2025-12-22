import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Pricing } from '../Pricing';

describe('Pricing', () => {
  it('renders plans and triggers booking callback', async () => {
    const onBook = vi.fn();
    const user = userEvent.setup();

    render(<Pricing onBook={onBook} />);

    expect(screen.getByText('Абонементы')).toBeInTheDocument();
    expect(screen.getByText('Хит продаж')).toBeInTheDocument();

    const planTitle = screen.getByText('8 занятия');
    const planCard = planTitle.closest('div.group');
    expect(planCard).not.toBeNull();

    const button = within(planCard as HTMLElement).getByRole('button', { name: 'Выбрать' });
    await user.click(button);

    expect(onBook).toHaveBeenCalledWith('8 занятия', '5 200 ₽');
  });
});
