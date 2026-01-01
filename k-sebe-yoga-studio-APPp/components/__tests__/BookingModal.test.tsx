import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { BookingModal } from '../BookingModal';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    setUser: vi.fn(),
    authStatus: 'anonymous',
  }),
}));

vi.mock('../../services/dataService', () => ({
  dataService: {
    bookClass: vi.fn(),
    getUser: vi.fn(),
  },
}));

describe('BookingModal (app)', () => {
  it('shows error when user is not authenticated', async () => {
    const user = userEvent.setup();

    render(
      <BookingModal
        isOpen
        onClose={() => {}}
        classDetails={{
          id: '1',
          name: 'Йога',
          dateStr: '2025-01-01',
          time: '10:00',
          price: 1200,
          location: 'Студия',
          spots: 10,
          spotsBooked: 2,
          description: 'Класс',
          instructor: 'Катя',
          duration: '60 мин',
          type: 'yoga',
        }}
      />
    );

    await user.click(screen.getByRole('button', { name: /записаться/i }));

    expect(screen.getByText(/нужно войти в аккаунт/i)).toBeInTheDocument();
  });
});
