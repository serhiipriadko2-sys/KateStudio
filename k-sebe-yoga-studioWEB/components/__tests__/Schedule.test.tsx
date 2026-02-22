import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mockUseQuery = vi.fn();

vi.mock('@tanstack/react-query', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

vi.mock('../FadeIn', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { Schedule } from '../Schedule';

describe('Schedule', () => {
  it('shows error state when query failed', () => {
    mockUseQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    });

    render(<Schedule onBook={vi.fn()} />);

    expect(screen.getByText(/не удалось загрузить расписание/i)).toBeInTheDocument();
  });

  it('calls onBook with class id for available class', () => {
    const onBook = vi.fn();
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;

    mockUseQuery.mockReturnValue({
      data: [
        {
          id: 'class-1',
          date,
          time: '09:00',
          name: 'Inside Flow',
          instructor: 'Катя',
          duration: '60',
          spots_total: 12,
          spots_booked: 3,
          location: 'Станционная',
          intensity: 2,
          price: 700,
          description: null,
          is_online: false,
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<Schedule onBook={onBook} />);

    fireEvent.click(screen.getByRole('button', { name: 'Записаться' }));

    expect(onBook).toHaveBeenCalledWith(
      expect.objectContaining({
        classId: 'class-1',
        type: 'Inside Flow',
      })
    );
  });
});
