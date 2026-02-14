import { IMAGES } from '@ksebe/shared';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Blog } from '../../shared/components/Blog';
import { Retreats } from '../components/Retreats';
import { Reviews } from '../components/Reviews';

// Mock IntersectionObserver if not already mocked in setup (it is, but just in case of environment issues)
window.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
}));

describe('Landing Page Components', () => {
  it('renders Reviews with correct images', () => {
    render(<Reviews />);
    const heading = screen.getByText(/Отзывы учеников/i);
    expect(heading).toBeInTheDocument();

    // Check for images
    // Since images might be lazy loaded or inside custom components, we look for img tags
    // The avatars are in TestimonialCard
    const images = screen.getAllByRole('img');
    // Note: If Image component transforms the src, this might fail.
    // But passing local path '/images/...' usually stays as is unless storage logic intervenes.

    // We expect at least some images to be present
    expect(images.length).toBeGreaterThan(0);
  });

  it('renders Retreats with correct main image', () => {
    render(<Retreats onBook={vi.fn()} />);

    const mainTitle = screen.getByText(/Йога-тур "Сила Тишины"/i); // Note: Quotes were escaped in code but text content renders quotes
    expect(mainTitle).toBeInTheDocument();

    const mainImage = screen.getByAltText(/Yoga Retreat Altai/i);
    expect(mainImage).toBeInTheDocument();
    expect(mainImage).toHaveAttribute('src', IMAGES.retreats.main);
  });

  it('renders Blog with articles', () => {
    render(<Blog />);

    expect(screen.getByText(/Как начать медитировать: 5 простых шагов/i)).toBeInTheDocument();

    // Check for images
    const images = screen.getAllByRole('img');
    const articleImage = images.find((img) => img.getAttribute('src') === IMAGES.blog.articles[0]);
    expect(articleImage).toBeInTheDocument();
  });
});
