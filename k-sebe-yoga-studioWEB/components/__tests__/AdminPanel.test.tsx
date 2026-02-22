import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
/* ─── Supabase Mock ──────────────────────────── */

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

// Build chainable query mock
const buildQueryChain = () => ({
  select: mockSelect.mockReturnValue({
    eq: mockEq.mockReturnValue({
      single: mockSingle,
    }),
  }),
});

let isConfigured = true;

vi.mock('../../services/supabase', () => ({
  get isSupabaseConfigured() {
    return isConfigured;
  },
  get supabase() {
    if (!isConfigured) return null;
    return {
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signInWithPassword: mockSignInWithPassword,
        signOut: mockSignOut,
      },
      from: () => buildQueryChain(),
    };
  },
}));

vi.mock('../../hooks/useScrollLock', () => ({
  useScrollLock: vi.fn(),
}));

// Mock admin tabs to avoid deep rendering
vi.mock('../admin/AdminQueryProvider', () => ({
  AdminQueryProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../admin/tabs/DashboardTab', () => ({
  DashboardTab: () => <div data-testid="dashboard-tab">Dashboard</div>,
}));
vi.mock('../admin/tabs/ScheduleTab', () => ({
  ScheduleTab: () => <div>Schedule</div>,
}));
vi.mock('../admin/tabs/BookingsTab', () => ({
  BookingsTab: () => <div>Bookings</div>,
}));
vi.mock('../admin/tabs/ContactsTab', () => ({
  ContactsTab: () => <div>Contacts</div>,
}));
vi.mock('../admin/tabs/ContentTab', () => ({
  ContentTab: () => <div>Content</div>,
}));
vi.mock('../admin/tabs/ReviewsTab', () => ({
  ReviewsTab: () => <div>Reviews</div>,
}));
vi.mock('../admin/tabs/PricingTab', () => ({
  PricingTab: () => <div>Pricing</div>,
}));
vi.mock('../admin/tabs/ImagesTab', () => ({
  ImagesTab: () => <div>Images</div>,
}));
vi.mock('../admin/tabs/FAQTab', () => ({
  FAQTab: () => <div>FAQ</div>,
}));
vi.mock('../admin/tabs/SettingsTab', () => ({
  SettingsTab: () => <div>Settings</div>,
}));

import { AdminPanel } from '../AdminPanel';

/* ─── Helpers ────────────────────────────────── */

function setupMocks(opts: { session?: { user: { id: string } } | null; isAdmin?: boolean }) {
  const { session = null, isAdmin = false } = opts;

  mockGetSession.mockResolvedValue({ data: { session } });
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
  mockSingle.mockResolvedValue({
    data: isAdmin ? { is_admin: true } : { is_admin: false },
    error: null,
  });
}

/* ─── Tests ───────────────────────────────────── */

beforeEach(() => {
  vi.clearAllMocks();
  isConfigured = true;
});

describe('AdminPanel', () => {
  it('does not render when closed', () => {
    setupMocks({});
    render(<AdminPanel isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Управление студией')).toBeNull();
    expect(screen.queryByText('Вход в систему')).toBeNull();
  });

  it('shows "Supabase не подключен" when not configured', () => {
    isConfigured = false;
    render(<AdminPanel isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('Supabase не подключен')).toBeInTheDocument();
  });

  it('shows login screen when user is not authenticated', async () => {
    setupMocks({ session: null });

    await act(async () => {
      render(<AdminPanel isOpen={true} onClose={vi.fn()} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Вход в систему')).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
  });

  it('shows access denied for authenticated non-admin user', async () => {
    setupMocks({
      session: { user: { id: 'user-123' } },
      isAdmin: false,
    });

    await act(async () => {
      render(<AdminPanel isOpen={true} onClose={vi.fn()} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Доступ запрещён')).toBeInTheDocument();
    });
    expect(screen.getByText(/нет прав администратора/i)).toBeInTheDocument();
  });

  it('shows admin panel for authenticated admin user', async () => {
    setupMocks({
      session: { user: { id: 'admin-123' } },
      isAdmin: true,
    });

    await act(async () => {
      render(<AdminPanel isOpen={true} onClose={vi.fn()} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Управление студией')).toBeInTheDocument();
    });
    expect(screen.getByTestId('dashboard-tab')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked on login screen', async () => {
    setupMocks({ session: null });
    const onClose = vi.fn();

    await act(async () => {
      render(<AdminPanel isOpen={true} onClose={onClose} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Вход в систему')).toBeInTheDocument();
    });

    // Find the X button (first one is the close button on the overlay)
    const closeButtons = screen.getAllByRole('button');
    const xButton = closeButtons.find((btn) => btn.querySelector('.lucide-x'));
    if (xButton) fireEvent.click(xButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('shows logout button on access denied screen', async () => {
    setupMocks({
      session: { user: { id: 'user-456' } },
      isAdmin: false,
    });

    await act(async () => {
      render(<AdminPanel isOpen={true} onClose={vi.fn()} />);
    });

    await waitFor(() => {
      expect(screen.getByText('Доступ запрещён')).toBeInTheDocument();
    });

    expect(screen.getByText('Выйти')).toBeInTheDocument();
    expect(screen.getByText('Закрыть')).toBeInTheDocument();
  });
});
