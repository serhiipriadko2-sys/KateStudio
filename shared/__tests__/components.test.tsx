import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FadeIn, Logo, BackToTop, ErrorBoundary, CookieBanner } from '../components';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', { value: vi.fn() });

describe('Shared Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('FadeIn', () => {
    it('should render children', () => {
      render(
        <FadeIn>
          <div>Test content</div>
        </FadeIn>
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('Logo', () => {
    it('should render SVG logo', () => {
      const { container } = render(<Logo />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      const { container } = render(<Logo className="w-24 h-24" />);
      expect(container.querySelector('svg')).toHaveClass('w-24', 'h-24');
    });
  });

  describe('BackToTop', () => {
    it('should render button', () => {
      render(<BackToTop />);
      expect(screen.getByRole('button', { name: /back to top/i })).toBeInTheDocument();
    });

    it('should call scrollTo when clicked', () => {
      render(<BackToTop />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
  });

  describe('ErrorBoundary', () => {
    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Normal content</div>
        </ErrorBoundary>
      );
      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });

    it('should render error UI when error occurs', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      // Suppress console.error for this test
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByText(/что-то пошло не так/i)).toBeInTheDocument();
      spy.mockRestore();
    });
  });

  describe('CookieBanner', () => {
    it('should not render when consent exists', () => {
      localStorageMock.getItem.mockReturnValue('true');
      const { container } = render(<CookieBanner delay={0} />);
      expect(container.firstChild).toBeNull();
    });

    it('should save consent when accepted', async () => {
      const onAccept = vi.fn();
      render(<CookieBanner delay={0} onAccept={onAccept} />);

      // Wait for banner to appear
      await waitFor(() => {
        expect(screen.getByText(/принять/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/принять/i));

      expect(localStorageMock.setItem).toHaveBeenCalledWith('cookie-consent', 'true');
      expect(onAccept).toHaveBeenCalled();
    });
  });
});
