import { describe, expect, it, vi } from 'vitest';
import { deleteImageMapping, getSavedImageUrl, saveImageMapping, uploadImage } from '../content';
import { BUCKET_NAME } from '../content';

const mocks = vi.hoisted(() => {
  const singleMock = vi
    .fn()
    .mockResolvedValue({ data: { url: 'https://example.com/image.jpg' }, error: null });
  const eqMock = vi.fn(() => ({ single: singleMock }));
  const selectMock = vi.fn(() => ({ eq: eqMock }));
  const deleteEqMock = vi.fn();
  const deleteMock = vi.fn(() => ({ eq: deleteEqMock }));
  const upsertMock = vi.fn();
  const fromMock = vi.fn(() => ({
    select: selectMock,
    upsert: upsertMock,
    delete: deleteMock,
  }));
  const uploadFileMock = vi.fn().mockResolvedValue('https://example.com/uploaded.jpg');

  return {
    singleMock,
    eqMock,
    selectMock,
    deleteEqMock,
    deleteMock,
    upsertMock,
    fromMock,
    uploadFileMock,
  };
});

vi.mock('../supabase', () => ({
  supabase: { from: mocks.fromMock },
  uploadFile: mocks.uploadFileMock,
}));

describe('content service', () => {
  it('returns saved image url when present', async () => {
    const result = await getSavedImageUrl('hero');

    expect(result).toBe('https://example.com/image.jpg');
    expect(mocks.fromMock).toHaveBeenCalled();
    expect(mocks.selectMock).toHaveBeenCalledWith('url');
  });

  it('stores and deletes mappings', async () => {
    await saveImageMapping('hero', 'https://example.com/hero.jpg');
    expect(mocks.upsertMock).toHaveBeenCalledWith({
      key: 'hero',
      url: 'https://example.com/hero.jpg',
    });

    await deleteImageMapping('hero');
    expect(mocks.deleteMock).toHaveBeenCalled();
    expect(mocks.deleteEqMock).toHaveBeenCalledWith('key', 'hero');
  });

  it('uploads images via storage helper', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(123456);

    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    const result = await uploadImage(file, 'hero');

    expect(mocks.uploadFileMock).toHaveBeenCalledWith(file, BUCKET_NAME, 'hero-123456.png');
    expect(result).toBe('https://example.com/uploaded.jpg');
  });
});
