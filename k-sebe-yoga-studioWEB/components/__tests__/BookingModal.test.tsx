import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingModal } from '../BookingModal';

/* ─── Mocks ───────────────────────────────────── */

const mockInsert = vi.fn();

vi.mock('@ksebe/shared', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockInsert,
    })),
  },
  isSupabaseConfigured: true,
}));

vi.mock('../../hooks/useScrollLock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('../../hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(),
}));

const defaultDetails = {
  type: 'Inside Flow',
  date: '15 марта',
  time: '10:00',
  price: '1500₽',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockInsert.mockResolvedValue({ error: null });
});

/* ─── Tests ───────────────────────────────────── */

describe('BookingModal', () => {
  it('does not render when closed', () => {
    render(<BookingModal isOpen={false} onClose={vi.fn()} details={defaultDetails} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders dialog when open', () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays booking type as heading', () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);
    expect(screen.getByText('Inside Flow')).toBeInTheDocument();
  });

  it('shows date, time and price when provided', () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);
    expect(screen.getByText('15 марта')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('1500₽')).toBeInTheDocument();
  });

  it('shows Telegram link with correct URL', () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);
    const links = screen.getAllByRole('link');
    const telegramLink = links.find((l) => l.getAttribute('href')?.includes('Kate_Gabran'));
    expect(telegramLink).toBeTruthy();
  });

  it('Telegram link includes pre-filled message with booking type', () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);
    const links = screen.getAllByRole('link');
    const telegramLink = links.find((l) => l.getAttribute('href')?.includes('t.me'));
    const href = telegramLink?.getAttribute('href') ?? '';
    // The URL is percent-encoded; decoding should contain the booking type
    expect(decodeURIComponent(href)).toContain('Inside Flow');
  });

  it('shows divider with fallback form text', () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);
    expect(screen.getByText('или оставьте заявку')).toBeInTheDocument();
  });

  it('renders form with name, phone, and comment fields', () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);
    expect(screen.getByPlaceholderText('Ваше имя')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Телефон')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Вопрос или комментарий (необязательно)')
    ).toBeInTheDocument();
  });

  it('shows validation error when name is empty on submit', async () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);
    const nameInput = screen.getByPlaceholderText('Ваше имя');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /оставить заявку/i }));
    });
    expect(nameInput.className).toContain('border-rose-300');
  });

  it('shows validation error when phone has fewer than 10 digits', async () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);
    fireEvent.change(screen.getByPlaceholderText('Ваше имя'), { target: { value: 'Анна' } });
    fireEvent.change(screen.getByPlaceholderText('Телефон'), { target: { value: '123' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /оставить заявку/i }));
    });
    const phoneInput = screen.getByPlaceholderText('Телефон');
    expect(phoneInput.className).toContain('border-rose-300');
  });

  it('submits form to Supabase contacts table with correct data', async () => {
    const { supabase } = await import('@ksebe/shared');
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);

    fireEvent.change(screen.getByPlaceholderText('Ваше имя'), { target: { value: 'Анна' } });
    fireEvent.change(screen.getByPlaceholderText('Телефон'), {
      target: { value: '+79001234567' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /оставить заявку/i }));
    });

    expect(supabase!.from).toHaveBeenCalledWith('contacts');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Анна',
          phone: '+79001234567',
        }),
      ])
    );
  });

  it('shows success message after successful submission', async () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);

    fireEvent.change(screen.getByPlaceholderText('Ваше имя'), { target: { value: 'Анна' } });
    fireEvent.change(screen.getByPlaceholderText('Телефон'), {
      target: { value: '+79001234567' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /оставить заявку/i }));
    });

    expect(screen.getByText('Заявка отправлена!')).toBeInTheDocument();
  });

  it('shows Telegram button in success state', async () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);

    fireEvent.change(screen.getByPlaceholderText('Ваше имя'), { target: { value: 'Анна' } });
    fireEvent.change(screen.getByPlaceholderText('Телефон'), {
      target: { value: '+79001234567' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /оставить заявку/i }));
    });

    const telegramLinks = screen.getAllByRole('link');
    const telegramLink = telegramLinks.find((l) => l.getAttribute('href')?.includes('Kate_Gabran'));
    expect(telegramLink).toBeTruthy();
  });

  it('shows error message when submission fails', async () => {
    mockInsert.mockRejectedValue(new Error('Network error'));

    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);

    fireEvent.change(screen.getByPlaceholderText('Ваше имя'), { target: { value: 'Анна' } });
    fireEvent.change(screen.getByPlaceholderText('Телефон'), {
      target: { value: '+79001234567' },
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /оставить заявку/i }));
    });

    expect(
      screen.getByText('Не удалось отправить заявку. Напишите нам в Telegram — это быстрее!')
    ).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<BookingModal isOpen={true} onClose={onClose} details={defaultDetails} />);
    fireEvent.click(screen.getByLabelText('Закрыть'));
    expect(onClose).toHaveBeenCalled();
  });

  it('submit button has correct text', () => {
    render(<BookingModal isOpen={true} onClose={vi.fn()} details={defaultDetails} />);
    expect(screen.getByRole('button', { name: /оставить заявку/i })).toBeInTheDocument();
  });
});
