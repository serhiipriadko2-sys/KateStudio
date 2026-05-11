import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Dashboard } from '../Dashboard';

const {
  mockGetBookings,
  mockUpdateUserProfile,
  mockCancelBooking,
  mockShowToast,
  mockLogout,
  mockSetUser,
  mockUploadFile,
} = vi.hoisted(() => ({
  mockGetBookings: vi.fn(),
  mockUpdateUserProfile: vi.fn(),
  mockCancelBooking: vi.fn(),
  mockShowToast: vi.fn(),
  mockLogout: vi.fn(),
  mockSetUser: vi.fn(),
  mockUploadFile: vi.fn(),
}));

const mockUser = {
  id: 'test-id',
  name: 'Test User',
  phone: '+79001234567',
  city: 'Moscow',
  isRegistered: true,
  createdAt: '2024-01-01',
};

vi.mock('@ksebe/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ksebe/shared')>();
  return {
    ...actual,
    IMAGES: {
      reviews: { avatars: ['/mock-avatar.jpg'] },
    },
    uploadFile: mockUploadFile,
    DailyRecommendation: () => <div>DailyRecommendation Component</div>,
    StreakCalendar: () => <div>StreakCalendar Component</div>,
    useGamification: () => ({ currentStreak: 3, isLoading: false }),
    supabase: {
      channel: () => ({
        on: () => ({
          subscribe: () => ({}),
        }),
      }),
      removeChannel: vi.fn(),
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      auth: {
        getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-id' } } } }),
      },
    },
  };
});

vi.mock('../../services/dataService', () => ({
  dataService: {
    getBookings: (...args: unknown[]) => mockGetBookings(...args),
    updateUserProfile: (...args: unknown[]) => mockUpdateUserProfile(...args),
    cancelBooking: (...args: unknown[]) => mockCancelBooking(...args),
  },
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    setUser: mockSetUser,
    authStatus: 'authenticated',
    logout: mockLogout,
    isSupabaseConfigured: true,
  }),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock('../Achievements', () => ({ Achievements: () => <div>Achievements Component</div> }));
vi.mock('../Breathwork', () => ({ Breathwork: () => <div>Breathwork Component</div> }));
vi.mock('../VideoLibrary', () => ({ VideoLibrary: () => <div>VideoLibrary Component</div> }));
vi.mock('../Logo', () => ({ Logo: () => <div>Logo</div> }));
vi.mock('../Image', () => ({
  Image: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));
vi.mock('../Schedule', () => ({ Schedule: () => <div>Schedule Component</div> }));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetBookings.mockResolvedValue({
      data: [],
      source: 'server',
      degraded: false,
    });
    mockUpdateUserProfile.mockResolvedValue({
      ok: true,
      status: 'success',
      source: 'server',
    });
    mockCancelBooking.mockResolvedValue({
      ok: true,
      status: 'success',
      source: 'server',
    });
    mockUploadFile.mockResolvedValue('https://example.com/avatar.png');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('renders overview tab by default', async () => {
    render(<Dashboard onBack={vi.fn()} />);

    await waitFor(() => {
      expect(mockGetBookings).toHaveBeenCalled();
    });

    expect(screen.queryByText('DailyRecommendation Component')).not.toBeInTheDocument();
  });

  it('shows an info toast when bookings load in degraded mode', async () => {
    mockGetBookings.mockResolvedValue({
      data: [],
      source: 'cache',
      degraded: true,
      reason: 'server_unavailable',
    });

    render(<Dashboard onBack={vi.fn()} />);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.any(String), 'info');
    });
  });

  it('does not refetch bookings after the initial list render', async () => {
    mockGetBookings.mockResolvedValue({
      data: [
        {
          id: 'booking-1',
          classId: 'class-1',
          className: 'Inside Flow',
          date: '2099-01-01',
          time: '10:00',
          location: 'Studio',
          timestamp: 123456,
        },
      ],
      source: 'server',
      degraded: false,
    });

    render(<Dashboard onBack={vi.fn()} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Cancel booking Inside Flow' })
      ).toBeInTheDocument();
    });

    expect(mockGetBookings).toHaveBeenCalledTimes(1);
  });

  it('saves the profile with an info toast when persistence is degraded', async () => {
    mockUpdateUserProfile.mockResolvedValue({
      ok: true,
      status: 'degraded',
      source: 'cache',
      reason: 'server_unavailable',
    });

    render(<Dashboard onBack={vi.fn()} initialTab="profile" />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }));
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Updated User' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save profile changes' }));

    await waitFor(() => {
      expect(mockUpdateUserProfile).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated User' }));
      expect(mockShowToast).toHaveBeenCalledWith(expect.any(String), 'info');
    });
  });

  it('shows an auth error when synced booking cancellation requires re-login', async () => {
    mockGetBookings.mockResolvedValue({
      data: [
        {
          id: 'booking-1',
          classId: 'class-1',
          className: 'Inside Flow',
          date: '2099-01-01',
          time: '10:00',
          location: 'Studio',
          timestamp: 123456,
        },
      ],
      source: 'server',
      degraded: false,
    });
    mockCancelBooking.mockResolvedValue({
      ok: false,
      status: 'auth_required',
      source: 'cache',
      reason: 'auth_required',
    });

    render(<Dashboard onBack={vi.fn()} />);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Cancel booking Inside Flow' })
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Cancel booking Inside Flow' }));

    await waitFor(() => {
      expect(mockCancelBooking).toHaveBeenCalledWith('booking-1');
      expect(mockShowToast).toHaveBeenCalledWith(expect.any(String), 'error');
    });
  });

  it('calls logout when logout button is clicked', async () => {
    const onBack = vi.fn();
    render(<Dashboard onBack={onBack} initialTab="profile" />);

    const logoutButtons = screen.getAllByRole('button', { name: 'Logout' });
    fireEvent.click(logoutButtons[0]);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(onBack).toHaveBeenCalled();
    });
  });
});
