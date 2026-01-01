import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BookingModal } from '../BookingModal';

vi.mock('../../services/supabase', () => ({
  supabase: null,
}));

describe('BookingModal', () => {
  it('highlights required fields when submitting empty', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<BookingModal isOpen onClose={onClose} details={{ type: 'Пробное занятие' }} />);

    await user.click(screen.getByRole('button', { name: /оформить/i }));

    expect(screen.getByPlaceholderText('Ваше имя')).toHaveClass('border-rose-400');
    expect(screen.getByPlaceholderText('Телефон')).toHaveClass('border-rose-400');
  });
});
