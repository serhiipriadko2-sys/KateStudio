import { render, screen, fireEvent } from '@testing-library/react';
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

// Mock Toast Context
const mockShowToast = vi.fn();
vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

describe('VideoLibrary', () => {
  it('renders video cards', () => {
    render(<VideoLibrary />);
    expect(screen.getByText('Утренний Flow')).toBeInTheDocument();
    expect(screen.getByText('Здоровая спина')).toBeInTheDocument();
  });

  it('filters videos by mood', () => {
    render(<VideoLibrary selectedMood="Энергия" />);
    // "Утренний Flow" has "Энергия" tag
    expect(screen.getByText('Утренний Flow')).toBeInTheDocument();
    // "Медитация перед сном" does not
    expect(screen.queryByText('Медитация перед сном')).not.toBeInTheDocument();
  });

  it('shows toast when clicking locked video', () => {
    render(<VideoLibrary />);
    const lockedVideo = screen.getByLabelText('Открыть видео Глубокая растяжка');
    fireEvent.click(lockedVideo);
    expect(mockShowToast).toHaveBeenCalledWith('Доступно по подписке', 'info');
  });

  it('opens player for unlocked video', () => {
    render(<VideoLibrary />);
    const unlockedVideo = screen.getByLabelText('Открыть видео Утренний Flow');
    fireEvent.click(unlockedVideo);
    expect(screen.getByLabelText('Видео плеер')).toBeInTheDocument();
  });
});
