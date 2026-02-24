import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { VideoLibrary } from '../VideoLibrary';

// Mock shared components/hooks
vi.mock('@ksebe/shared', () => ({
  IMAGES: {
    studio: {
      1: '/mock-img-1.jpg',
      2: '/mock-img-2.jpg',
      3: '/mock-img-3.jpg',
      4: '/mock-img-4.jpg',
    },
  },
}));

vi.mock('../FadeIn', () => ({
  FadeIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('../Image', () => ({
  Image: ({ src, alt, className }: any) => <img src={src} alt={alt} className={className} />,
}));

vi.mock('../Paywall', () => ({
  Paywall: ({ onClose }: any) => (
    <div role="dialog" aria-label="Paywall">
      Paywall Content <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock Toast Context
const mockShowToast = vi.fn();
vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

// Define mock data inline to avoid hoisting issues with vi.mock
vi.mock('../../services/videoService', () => ({
  videoService: {
    getVideos: vi.fn().mockResolvedValue([
      {
        id: '1',
        title: 'Утренний Flow',
        duration: '15 мин',
        level: 'Легкий',
        image_url: '/mock-img-1.jpg',
        is_locked: false,
        tags: ['Энергия', 'Сила'],
        video_url: 'https://example.com/video1',
      },
      {
        id: '2',
        title: 'Здоровая спина',
        duration: '30 мин',
        level: 'Средний',
        image_url: '/mock-img-2.jpg',
        is_locked: false,
        tags: ['Здоровье', 'Сила'],
        video_url: 'https://example.com/video2',
      },
      {
        id: '3',
        title: 'Глубокая растяжка',
        duration: '45 мин',
        level: 'Сложный',
        image_url: '/mock-img-3.jpg',
        is_locked: true,
        tags: ['Покой', 'Здоровье'],
        video_url: 'https://example.com/video3',
      },
    ]),
  },
}));

// Mock QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithClient = (ui: React.ReactElement) => {
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('VideoLibrary', () => {
  it('renders video cards from service', async () => {
    renderWithClient(<VideoLibrary />);
    await waitFor(() => {
      expect(screen.getByText('Утренний Flow')).toBeInTheDocument();
      expect(screen.getByText('Здоровая спина')).toBeInTheDocument();
    });
  });

  it('filters videos by mood', async () => {
    renderWithClient(<VideoLibrary selectedMood="Энергия" />);
    await waitFor(() => {
      expect(screen.getByText('Утренний Flow')).toBeInTheDocument();
    });
    // "Здоровая спина" does not have "Энергия"
    expect(screen.queryByText('Здоровая спина')).not.toBeInTheDocument();
  });

  it('shows paywall when clicking locked video', async () => {
    renderWithClient(<VideoLibrary />);
    await waitFor(() => screen.getByText('Глубокая растяжка'));

    const lockedVideo = screen.getByLabelText('Открыть видео Глубокая растяжка');
    fireEvent.click(lockedVideo);

    expect(screen.getByRole('dialog', { name: 'Paywall' })).toBeInTheDocument();
  });

  it('opens player for unlocked video', async () => {
    renderWithClient(<VideoLibrary />);
    await waitFor(() => screen.getByText('Утренний Flow'));

    const unlockedVideo = screen.getByLabelText('Открыть видео Утренний Flow');
    fireEvent.click(unlockedVideo);

    expect(screen.getByLabelText('Видео плеер')).toBeInTheDocument();
  });
});
