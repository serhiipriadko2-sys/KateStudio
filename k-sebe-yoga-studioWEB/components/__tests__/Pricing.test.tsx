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

    expect(screen.getByText('Услуги и абонементы')).toBeInTheDocument();
    expect(screen.getByText('Йога-абонементы')).toBeInTheDocument();

    const planTitle = screen.getByText('9 занятий');
    const planCard = planTitle.closest('div.group');
    expect(planCard).not.toBeNull();

    const button = within(planCard as HTMLElement).getByRole('button', { name: 'Записаться' });
    await user.click(button);

    expect(onBook).toHaveBeenCalledWith('9 занятий', '5 000 ₽');
  });
});
