import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dashboard } from '../Dashboard';

// Mock dependencies
vi.mock('@ksebe/shared', () => ({
  IMAGES: {
    reviews: { avatars: ['/mock-avatar.jpg'] },
  },
}));

// Mock services
const mockGetBookings = vi.fn().mockResolvedValue([]);
const mockUpdateUserProfile = vi.fn().mockResolvedValue(true);

vi.mock('../../services/dataService', () => ({
  dataService: {
    getBookings: () => mockGetBookings(),
    updateUserProfile: () => mockUpdateUserProfile(),
  },
}));

vi.mock('../../services/supabaseClient', () => ({
  uploadFile: vi.fn(),
  supabase: {
    channel: () => ({
      on: () => ({
        subscribe: () => ({}),
      }),
    }),
    removeChannel: vi.fn(),
  },
}));

// Mock Auth Context
const mockLogout = vi.fn();
const mockUser = {
  id: 'test-id',
  name: 'Test User',
  phone: '+79001234567',
  city: 'Moscow',
  isRegistered: true,
  createdAt: '2024-01-01',
};

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    authStatus: 'authenticated',
    logout: mockLogout,
    isSupabaseConfigured: true,
  }),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

// Mock Sub-components
vi.mock('../AICoach', () => ({ AICoach: () => <div>AICoach Component</div> }));
vi.mock('../Breathwork', () => ({ Breathwork: () => <div>Breathwork Component</div> }));
vi.mock('../VideoLibrary', () => ({ VideoLibrary: () => <div>VideoLibrary Component</div> }));
vi.mock('../Logo', () => ({ Logo: () => <div>Logo</div> }));
vi.mock('../Image', () => ({
  Image: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders overview tab by default', () => {
    render(<Dashboard onBack={vi.fn()} />);
    expect(screen.getByText(`Привет, ${mockUser.name}!`)).toBeInTheDocument();
    expect(screen.getByText('Всего записей')).toBeInTheDocument();
  });

  it('switches tabs correctly', () => {
    render(<Dashboard onBack={vi.fn()} />);

    // Switch to Videos (multiple elements exist for sidebar/mobile nav, click first)
    const videosTabs = screen.getAllByText('Практики');
    fireEvent.click(videosTabs[0]);
    expect(screen.getByText('VideoLibrary Component')).toBeInTheDocument();

    // Switch to Profile
    const profileTabs = screen.getAllByText('Профиль');
    fireEvent.click(profileTabs[0]);
    expect(screen.getByText(mockUser.phone)).toBeInTheDocument();
  });

  it('calls logout when button clicked', () => {
    const onBack = vi.fn();
    render(<Dashboard onBack={onBack} initialTab="profile" />);

    // There are two logout buttons (sidebar and profile tab). Click one.
    const logoutButtons = screen.getAllByText(/Выйти/i);
    fireEvent.click(logoutButtons[0]);

    expect(mockLogout).toHaveBeenCalled();
    expect(onBack).toHaveBeenCalled();
  });
});
