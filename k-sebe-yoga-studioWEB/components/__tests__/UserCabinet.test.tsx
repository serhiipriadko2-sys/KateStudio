import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserCabinet } from '../UserCabinet';

/* ─── Mock Supabase ────────────────────────────── */

vi.mock('@ksebe/shared', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

/* ─── Mock AuthContext ─────────────────────────── */

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Тест Юзер',
  phone: '+79001234567',
  city: 'Дубна',
  avatar: null,
  isAdmin: false,
  createdAt: '2026-01-15T12:00:00Z',
};

const mockSignOut = vi.fn();
const mockUpdateProfile = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    authError: null,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: mockSignOut,
    updateProfile: mockUpdateProfile,
    clearError: vi.fn(),
  }),
}));

vi.mock('../../hooks/useScrollLock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('../../hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

/* ─── Tests ───────────────────────────────────── */

describe('UserCabinet', () => {
  it('does not render when closed', () => {
    render(<UserCabinet isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders user profile when open', () => {
    render(<UserCabinet isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByText('Тест Юзер').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('test@example.com').length).toBeGreaterThanOrEqual(1);
  });

  it('shows profile tab by default', () => {
    render(<UserCabinet isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByText('+79001234567')).toBeInTheDocument();
    expect(screen.getByText('Дубна')).toBeInTheDocument();
  });

  it('switches to bookings tab', () => {
    render(<UserCabinet isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Записи'));
    expect(screen.getByText('У вас пока нет записей')).toBeInTheDocument();
  });

  it('enters edit mode', () => {
    render(<UserCabinet isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Редактировать'));
    expect(screen.getByPlaceholderText('Имя')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Телефон')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Город')).toBeInTheDocument();
  });

  it('cancels edit mode', () => {
    render(<UserCabinet isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Редактировать'));
    fireEvent.click(screen.getByText('Отмена'));
    // Should be back to display mode
    expect(screen.queryByPlaceholderText('Имя')).toBeNull();
    expect(screen.getAllByText('Тест Юзер').length).toBeGreaterThanOrEqual(1);
  });

  it('calls signOut when logout button is clicked', () => {
    const onClose = vi.fn();
    render(<UserCabinet isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Выйти'));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('closes when close button is clicked', () => {
    const onClose = vi.fn();
    render(<UserCabinet isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Закрыть'));
    expect(onClose).toHaveBeenCalled();
  });
});
