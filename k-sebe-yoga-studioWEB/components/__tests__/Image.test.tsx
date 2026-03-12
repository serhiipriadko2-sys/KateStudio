import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Image } from '../Image';

vi.mock('../../../shared/services', () => ({
  imageStorageAdapter: {
    getMapping: vi.fn().mockResolvedValue(null),
    saveMapping: vi.fn(),
    deleteMapping: vi.fn(),
    uploadToCloud: vi.fn(),
  },
}));

describe('Image', () => {
  it('renders an image without admin controls (controls hidden from public UI)', async () => {
    render(
      <Image src="https://example.com/default.jpg" alt="Тестовое изображение" storageKey="hero" />
    );

    const image = await screen.findByAltText('Тестовое изображение');
    expect(image).toHaveAttribute('src', 'https://example.com/default.jpg');

    // ImageAdminControls are hidden from public UI — managed via AdminPanel
    expect(screen.queryByTitle('Загрузить файл')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Вставить ссылку')).not.toBeInTheDocument();
  });
});
