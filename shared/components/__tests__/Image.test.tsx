import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Image } from '../Image';

describe('shared Image', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads image from cloud mapping when available', async () => {
    const services = {
      getMapping: vi.fn().mockResolvedValue('https://example.com/cloud.jpg'),
    };

    render(<Image storageKey="hero" alt="Hero" services={services} />);

    expect(services.getMapping).toHaveBeenCalledWith('hero');

    const image = await screen.findByAltText('Hero');
    expect(image).toHaveAttribute('src', 'https://example.com/cloud.jpg');
  });
});
