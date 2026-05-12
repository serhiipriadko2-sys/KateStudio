import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const maybeSingleMock = vi
    .fn()
    .mockResolvedValue({ data: { url: 'https://example.com/image.jpg' }, error: null });
  const eqMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
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
    maybeSingleMock,
    eqMock,
    selectMock,
    deleteEqMock,
    deleteMock,
    upsertMock,
    fromMock,
    uploadFileMock,
  };
});

vi.mock('../services/supabase', () => ({
  supabase: { from: mocks.fromMock },
  uploadFile: mocks.uploadFileMock,
}));

const loadImageStorage = () => import('../services/imageStorage');

beforeEach(() => {
  vi.clearAllMocks();
  mocks.maybeSingleMock.mockResolvedValue({ data: { url: 'https://example.com/image.jpg' }, error: null });
  mocks.uploadFileMock.mockResolvedValue('https://example.com/uploaded.jpg');
});

describe('imageStorage', () => {
  it('returns saved image url when present', async () => {
    const { getSavedImageUrl } = await loadImageStorage();

    const result = await getSavedImageUrl('hero');

    expect(result).toBe('https://example.com/image.jpg');
    expect(mocks.fromMock).toHaveBeenCalledWith('site_images');
    expect(mocks.selectMock).toHaveBeenCalledWith('url');
    expect(mocks.eqMock).toHaveBeenCalledWith('key', 'hero');
  });

  it('stores and deletes mappings', async () => {
    const { deleteImageMapping, saveImageMapping } = await loadImageStorage();

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
    const { BUCKET_NAME, uploadImage } = await loadImageStorage();
    vi.spyOn(Date, 'now').mockReturnValue(123456);

    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    const result = await uploadImage(file, 'hero');

    expect(mocks.uploadFileMock).toHaveBeenCalledWith(file, BUCKET_NAME, 'hero-123456.png');
    expect(result).toBe('https://example.com/uploaded.jpg');
  });
});