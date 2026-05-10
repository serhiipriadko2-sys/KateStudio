import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Schedule } from '../Schedule';

const mockGetClassesForMonth = vi.fn();

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
    getClassesForMonth: (...args: unknown[]) => mockGetClassesForMonth(...args),
  },
}));

vi.mock('../BookingModal', () => ({
  BookingModal: () => null,
}));

vi.mock('../FadeIn', () => ({
  FadeIn: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const todayDateStr = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const baseClass = {
  id: 'class-1',
  dateStr: todayDateStr(),
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
    mockGetClassesForMonth.mockResolvedValue({
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
    mockGetClassesForMonth.mockResolvedValue({
      data: [baseClass],
      source: 'server',
      degraded: false,
    });

    render(<Schedule />);

    await waitFor(() => {
      expect(screen.getByText('Inside Flow')).toBeInTheDocument();
    });

    expect(mockGetClassesForMonth).toHaveBeenCalledTimes(1);
  });

  it('shows a seat-count notice when live booking counts are unavailable', async () => {
    mockGetClassesForMonth.mockResolvedValue({
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
    mockGetClassesForMonth.mockResolvedValue({
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
