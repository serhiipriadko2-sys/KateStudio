import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BookingModal } from '../BookingModal';

// Hoist mocks to be available in vi.mock
const { mockRequestOtp, mockVerifyOtp, mockBookClass } = vi.hoisted(() => {
  return {
    mockRequestOtp: vi.fn(),
    mockVerifyOtp: vi.fn(),
    mockBookClass: vi.fn(),
  };
});

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="icon-alert" />,
  ArrowRight: () => <div data-testid="icon-arrow" />,
  CalendarPlus: () => <div data-testid="icon-calendar" />,
  Check: () => <div data-testid="icon-check" />,
  Loader2: () => <div data-testid="icon-loader" />,
  Sparkles: () => <div data-testid="icon-sparkles" />,
  X: () => <div data-testid="icon-close" />,
  KeyRound: () => <div data-testid="icon-key" />,
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null, // Default to anonymous
    authStatus: 'anonymous',
    requestOtp: mockRequestOtp,
    verifyOtp: mockVerifyOtp,
    authError: null,
    setUser: vi.fn(),
  }),
}));

vi.mock('../../services/dataService', () => ({
  dataService: {
    bookClass: mockBookClass,
    getUser: vi.fn().mockResolvedValue({ name: 'Test User', phone: '+79990000000' }),
  },
}));

const mockClass = {
  id: 'class-1',
  name: 'Morning Flow',
  dateStr: '2026-02-20',
  time: '08:00',
  duration: '60 min',
  price: 1500,
  trainer: 'Anna',
  spots: 10,
  booked: 0,
  location: 'Studio',
};

describe('BookingModal', () => {
  it('renders correctly when open', () => {
    render(<BookingModal isOpen={true} onClose={() => {}} classDetails={mockClass} />);
    expect(screen.getByText('Morning Flow')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ваше имя')).toBeInTheDocument();
  });

  it('triggers OTP request when submitting as anonymous', async () => {
    const user = userEvent.setup();
    render(<BookingModal isOpen={true} onClose={() => {}} classDetails={mockClass} />);

    const nameInput = screen.getByPlaceholderText('Ваше имя');
    const phoneInput = screen.getByPlaceholderText('Телефон');
    const submitBtn = screen.getByRole('button', { name: /Получить код/i });

    await user.type(nameInput, 'Ivan');
    await user.type(phoneInput, '+79991234567');

    // Check privacy box
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    await user.click(submitBtn);

    expect(mockRequestOtp).toHaveBeenCalledWith('Ivan', '79991234567');
  });
});
