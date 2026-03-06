import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Schedule } from '../Schedule';

/* ─── Mocks ───────────────────────────────────── */

vi.mock('@ksebe/shared', () => ({
  supabase: null,
  isSupabaseConfigured: false,
  BookingDetails: {},
}));

vi.mock('../FadeIn', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

/* ─── Helpers ─────────────────────────────────── */

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderSchedule = (props: { onBook?: () => void; isDemo?: boolean } = {}) => {
  const queryClient = createTestQueryClient();
  const onBook = props.onBook ?? vi.fn();
  return render(
    <QueryClientProvider client={queryClient}>
      <Schedule onBook={onBook} isDemo={props.isDemo} />
    </QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

/* ─── Tests ───────────────────────────────────── */

describe('Schedule', () => {
  it('renders schedule heading', () => {
    renderSchedule();
    expect(screen.getByRole('heading', { level: 2, name: /Расписание/i })).toBeInTheDocument();
  });

  it('renders tab buttons', () => {
    renderSchedule();
    expect(screen.getByRole('button', { name: 'В студии' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Онлайн' })).toBeInTheDocument();
  });

  it('renders weekday headers', () => {
    renderSchedule();
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    for (const day of weekdays) {
      expect(screen.getByText(day)).toBeInTheDocument();
    }
  });

  it('renders today button', () => {
    renderSchedule();
    expect(screen.getByRole('button', { name: 'Сегодня' })).toBeInTheDocument();
  });

  it('shows empty state message', async () => {
    renderSchedule();
    expect(await screen.findByText('На этот день занятий не запланировано.')).toBeInTheDocument();
  });

  it('switches between offline and online tabs', () => {
    renderSchedule();
    const onlineTab = screen.getByRole('button', { name: 'Онлайн' });
    fireEvent.click(onlineTab);
    // After clicking online, the Онлайн button should be active (text-brand-green class)
    expect(onlineTab.className).toContain('text-brand-green');
  });

  it('shows demo badge when isDemo is true', () => {
    renderSchedule({ isDemo: true });
    expect(screen.getByText('Демонстрационный режим')).toBeInTheDocument();
  });

  it('renders month navigation buttons', () => {
    renderSchedule();
    // The month display is preceded by a ChevronLeft button and followed by a ChevronRight button
    // Verify the month/year text is displayed alongside navigable buttons
    const monthDisplay = screen.getByText(/\d{4}/); // matches year like "2026"
    expect(monthDisplay).toBeInTheDocument();
    // There should be at least prev and next month buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3); // chevron-left, chevron-right, today button
  });
});
