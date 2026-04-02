import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Schedule } from '../Schedule';

const mockGetClassesForDate = vi.fn();

vi.mock('@ksebe/shared', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({}),
    }),
    removeChannel: vi.fn(),
  },
}));

vi.mock('../../services/dataService', () => ({
  dataService: {
    getClassesForDate: (...args: unknown[]) => mockGetClassesForDate(...args),
  },
}));

vi.mock('../BookingModal', () => ({
  BookingModal: () => null,
}));

vi.mock('../FadeIn', () => ({
  FadeIn: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const baseClass = {
  id: 'class-1',
  dateStr: '2030-01-01',
  time: '09:00',
  name: 'Inside Flow',
  instructor: 'Teacher',
  duration: '60 min',
  spotsTotal: 12,
  spotsBooked: 3,
  location: 'Studio',
  intensity: 2 as const,
  price: 700,
  isOnline: false,
};

describe('Schedule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('does not show a notice when schedule data is healthy', async () => {
    mockGetClassesForDate.mockResolvedValue({
      data: [baseClass],
      source: 'server',
      degraded: false,
    });

    render(<Schedule />);

    await waitFor(() => {
      expect(screen.getByText('Inside Flow')).toBeInTheDocument();
      expect(screen.queryByRole('status', { name: 'Schedule notice' })).not.toBeInTheDocument();
    });
  });

  it('loads the current schedule only once on initial render', async () => {
    mockGetClassesForDate.mockResolvedValue({
      data: [baseClass],
      source: 'server',
      degraded: false,
    });

    render(<Schedule />);

    await waitFor(() => {
      expect(screen.getByText('Inside Flow')).toBeInTheDocument();
    });

    expect(mockGetClassesForDate).toHaveBeenCalledTimes(1);
  });

  it('shows a seat-count notice when live booking counts are unavailable', async () => {
    mockGetClassesForDate.mockResolvedValue({
      data: [baseClass],
      source: 'server',
      degraded: true,
      reason: 'booking_counts_unavailable',
    });

    render(<Schedule />);

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Schedule notice' })).toBeInTheDocument();
      expect(screen.getByText('Места могут быть неточными')).toBeInTheDocument();
    });
  });

  it('shows a degraded data banner when schedule falls back to mock data', async () => {
    mockGetClassesForDate.mockResolvedValue({
      data: [baseClass],
      source: 'mock',
      degraded: true,
      reason: 'server_unavailable',
    });

    render(<Schedule />);

    await waitFor(() => {
      expect(screen.getByRole('status', { name: 'Schedule notice' })).toBeInTheDocument();
      expect(screen.getByText('Показываем резервное расписание')).toBeInTheDocument();
      expect(screen.getByText('Inside Flow')).toBeInTheDocument();
    });
  });
});
