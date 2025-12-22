import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Image } from '../Image';

vi.mock('../../services/content', () => ({
  getSavedImageUrl: vi.fn().mockResolvedValue(null),
  saveImageMapping: vi.fn(),
  deleteImageMapping: vi.fn(),
  uploadImage: vi.fn(),
}));

vi.mock('../../services/geminiService', () => ({
  analyzeImageContent: vi.fn().mockResolvedValue('ok'),
}));

describe('Image', () => {
  it('renders an image and controls when storageKey is provided', async () => {
    render(
      <Image src="https://example.com/default.jpg" alt="Тестовое изображение" storageKey="hero" />
    );

    const image = await screen.findByAltText('Тестовое изображение');
    expect(image).toHaveAttribute('src', 'https://example.com/default.jpg');

    expect(screen.getByTitle('Анатомический разбор')).toBeInTheDocument();
    expect(screen.getByTitle('Загрузить файл')).toBeInTheDocument();
    expect(screen.getByTitle('Вставить ссылку')).toBeInTheDocument();
  });
});
