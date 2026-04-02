import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BookingModal } from '../BookingModal';

const mockBookClass = vi.fn();
const mockGetUser = vi.fn();
const mockSetUser = vi.fn();

const authState = {
  user: {
    id: 'user-1',
    name: 'Anna',
    phone: '+79990001122',
    city: 'Moscow',
    isRegistered: true,
    createdAt: '2024-01-01',
  },
  setUser: mockSetUser,
  authStatus: 'authenticated' as const,
};

vi.mock('@ksebe/shared', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../../services/dataService', () => ({
  dataService: {
    bookClass: (...args: unknown[]) => mockBookClass(...args),
    getUser: (...args: unknown[]) => mockGetUser(...args),
  },
}));

vi.mock('../../native', () => ({
  hapticError: vi.fn(),
  hapticLight: vi.fn(),
  hapticSuccess: vi.fn(),
}));

const classDetails = {
  id: 'class-1',
  dateStr: '2030-01-01',
  time: '09:00',
  name: 'Inside Flow',
  instructor: 'Teacher',
  duration: '60 min',
  spotsTotal: 12,
  spotsBooked: 2,
  location: 'Studio',
  intensity: 2 as const,
  price: 700,
  isOnline: false,
};

describe('BookingModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authState.user = {
      id: 'user-1',
      name: 'Anna',
      phone: '+79990001122',
      city: 'Moscow',
      isRegistered: true,
      createdAt: '2024-01-01',
    };
    authState.authStatus = 'authenticated';
    mockGetUser.mockResolvedValue(authState.user);
  });

  it('submits successfully and calls onSuccess', async () => {
    const onSuccess = vi.fn();
    mockBookClass.mockResolvedValue({
      ok: true,
      status: 'success',
      source: 'server',
    });

    const { container } = render(
      <BookingModal
        isOpen={true}
        onClose={vi.fn()}
        classDetails={classDetails}
        onSuccess={onSuccess}
      />
    );

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(mockBookClass).toHaveBeenCalledWith(classDetails, authState.user);
      expect(mockSetUser).toHaveBeenCalledWith(authState.user);
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows a duplicate-booking alert', async () => {
    mockBookClass.mockResolvedValue({
      ok: false,
      status: 'duplicate',
      source: 'server',
    });

    const { container } = render(
      <BookingModal isOpen={true} onClose={vi.fn()} classDetails={classDetails} />
    );

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('уже записаны');
    });
  });

  it('shows an auth-required alert when booking needs a fresh login', async () => {
    mockBookClass.mockResolvedValue({
      ok: false,
      status: 'auth_required',
      source: 'cache',
      reason: 'auth_required',
    });

    const { container } = render(
      <BookingModal isOpen={true} onClose={vi.fn()} classDetails={classDetails} />
    );

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('нужно снова войти');
    });
  });

  it('shows a server error alert when booking cannot be completed', async () => {
    mockBookClass.mockResolvedValue({
      ok: false,
      status: 'server_error',
      source: 'server',
    });

    const { container } = render(
      <BookingModal isOpen={true} onClose={vi.fn()} classDetails={classDetails} />
    );

    fireEvent.submit(container.querySelector('form')!);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Сервер временно недоступен');
    });
  });
});
