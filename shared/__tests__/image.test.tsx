import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Image } from '../components';

const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Shared Image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('fetches mapping when storageKey is provided', async () => {
    const getMapping = vi.fn().mockResolvedValue('https://example.com/hero.jpg');

    render(<Image src="/default.jpg" alt="hero" storageKey="hero" services={{ getMapping }} />);

    await waitFor(() => {
      expect(getMapping).toHaveBeenCalledWith('hero');
    });
  });

  it('runs analysis when enabled', async () => {
    const analyzeImage = vi.fn().mockResolvedValue('ok');

    render(
      <Image
        src="data:image/png;base64,abc"
        alt="test"
        storageKey="hero"
        enableAnalysis
        services={{ analyzeImage }}
      />
    );

    fireEvent.click(screen.getByTitle('Анатомический разбор'));

    await waitFor(() => {
      expect(analyzeImage).toHaveBeenCalledWith('data:image/png;base64,abc');
    });
  });
});
