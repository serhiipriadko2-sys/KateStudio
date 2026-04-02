import { IMAGES } from '@ksebe/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { Blog } from '../../shared/components/Blog';
import { Retreats } from '../components/Retreats';
import { Reviews } from '../components/Reviews';

window.IntersectionObserver = vi.fn().mockImplementation(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (ui: ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe('Landing Page Components', () => {
  it('renders Reviews with correct images', () => {
    renderWithQueryClient(<Reviews />);
    const heading = screen.getByText(/Отзывы учеников/i);
    expect(heading).toBeInTheDocument();

    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('renders Retreats with correct main image', () => {
    render(<Retreats onBook={vi.fn()} />);

    const mainTitle = screen.getByText(/Йога-тур "Сила Тишины"/i);
    expect(mainTitle).toBeInTheDocument();

    const mainImage = screen.getByAltText(/Yoga Retreat Altai/i);
    expect(mainImage).toBeInTheDocument();
    expect(mainImage).toHaveAttribute('src', IMAGES.retreats.main);
  });

  it('renders Blog with articles', () => {
    render(<Blog />);

    expect(screen.getByText(/Как начать медитировать: 5 простых шагов/i)).toBeInTheDocument();

    const images = screen.getAllByRole('img');
    const articleImage = images.find((img) => img.getAttribute('src') === IMAGES.blog.articles[0]);
    expect(articleImage).toBeInTheDocument();
  });
});
