import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createTrainer,
  deleteTrainer,
  getTrainerBySlug,
  listAdminTrainers,
  listClassesByTrainer,
  listPublicTrainers,
  mapTrainerRowToCard,
  mapTrainerRowToDetail,
  updateTrainer,
} from '../trainers';

const queryResult = <T>(data: T, error: unknown = null) => ({ data, error });

function createSupabaseMock() {
  const from = vi.fn();
  const builders: Record<string, unknown> = {};
  return {
    builders,
    supabase: { from },
    from,
  };
}

const mock = vi.hoisted(() => createSupabaseMock());

vi.mock('../supabase', () => ({
  supabase: mock.supabase,
}));

const trainerRow = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'lidia-kuzina',
  full_name: 'Лидия Кузина',
  short_name: 'Лидия',
  role_title: 'Преподаватель хатха-йоги и виньяса-флоу',
  bio_short: 'Сертифицированный мастер хатха-йоги и виньяса-флоу.',
  bio_long: 'Полное описание практики Лидии.',
  quote: 'К себе нежно.',
  avatar_url: 'https://example.com/lidia.jpg',
  cover_image_url: 'https://example.com/lidia-cover.jpg',
  gallery_image_urls: ['https://example.com/lidia-1.jpg', 'https://example.com/lidia-2.jpg'],
  specialties: ['хатха-йога', 'виньяса-флоу'],
  teaching_formats: ['studio'],
  experience_years: 10,
  instagram_url: 'https://instagram.com/LidiaKuzina',
  telegram_url: null,
  sort_order: 20,
  is_featured: true,
  is_active: true,
  created_at: '2026-05-09T00:00:00Z',
  updated_at: '2026-05-09T00:00:00Z',
};

describe('trainers service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps trainer rows to public cards', () => {
    expect(mapTrainerRowToCard(trainerRow)).toEqual({
      id: trainerRow.id,
      slug: 'lidia-kuzina',
      fullName: 'Лидия Кузина',
      roleTitle: 'Преподаватель хатха-йоги и виньяса-флоу',
      bioShort: 'Сертифицированный мастер хатха-йоги и виньяса-флоу.',
      avatarUrl: 'https://example.com/lidia.jpg',
      galleryImageUrls: ['https://example.com/lidia-1.jpg', 'https://example.com/lidia-2.jpg'],
      specialties: ['хатха-йога', 'виньяса-флоу'],
      isFeatured: true,
    });
  });

  it('uses fallback trainer photo when avatar is empty', () => {
    const result = mapTrainerRowToCard({
      ...trainerRow,
      slug: 'elizaveta-belonogova',
      avatar_url: null,
      cover_image_url: null,
    });

    expect(result.avatarUrl).toMatch(/^data:image\/webp;base64,/);
  });

  it('maps trainer rows to details', () => {
    expect(mapTrainerRowToDetail(trainerRow)).toEqual({
      ...mapTrainerRowToCard(trainerRow),
      bioLong: 'Полное описание практики Лидии.',
      quote: 'К себе нежно.',
      coverImageUrl: 'https://example.com/lidia-cover.jpg',
      experienceYears: 10,
      teachingFormats: ['studio'],
      instagramUrl: 'https://instagram.com/LidiaKuzina',
      telegramUrl: null,
    });
  });

  it('uses fallback cover when trainer cover is empty', () => {
    const result = mapTrainerRowToDetail({
      ...trainerRow,
      slug: 'elizaveta-belonogova',
      avatar_url: null,
      cover_image_url: null,
    });

    expect(result.coverImageUrl).toMatch(/^data:image\/webp;base64,/);
  });

  it('lists active public trainers ordered for publishing', async () => {
    const order = vi.fn().mockResolvedValue(queryResult([trainerRow]));
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    mock.from.mockReturnValue({ select });

    const result = await listPublicTrainers();

    expect(mock.from).toHaveBeenCalledWith('trainers');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('is_active', true);
    expect(order).toHaveBeenCalledWith('sort_order', { ascending: true });
    expect(result).toEqual([mapTrainerRowToCard(trainerRow)]);
  });

  it('gets an active trainer detail by slug', async () => {
    const maybeSingle = vi.fn().mockResolvedValue(queryResult(trainerRow));
    const eqActive = vi.fn().mockReturnValue({ maybeSingle });
    const eqSlug = vi.fn().mockReturnValue({ eq: eqActive });
    const select = vi.fn().mockReturnValue({ eq: eqSlug });
    mock.from.mockReturnValue({ select });

    const result = await getTrainerBySlug('lidia-kuzina');

    expect(mock.from).toHaveBeenCalledWith('trainers');
    expect(select).toHaveBeenCalledWith('*');
    expect(eqSlug).toHaveBeenCalledWith('slug', 'lidia-kuzina');
    expect(eqActive).toHaveBeenCalledWith('is_active', true);
    expect(result).toEqual(mapTrainerRowToDetail(trainerRow));
  });

  it('returns null when trainer detail is absent', async () => {
    const maybeSingle = vi.fn().mockResolvedValue(queryResult(null));
    const eqActive = vi.fn().mockReturnValue({ maybeSingle });
    const eqSlug = vi.fn().mockReturnValue({ eq: eqActive });
    const select = vi.fn().mockReturnValue({ eq: eqSlug });
    mock.from.mockReturnValue({ select });

    await expect(getTrainerBySlug('missing')).resolves.toBeNull();
  });

  it('lists upcoming classes linked to a trainer', async () => {
    const classRows = [
      {
        id: 'class-1',
        name: 'Утренний flow',
        instructor: 'Лидия Кузина',
        trainer_id: trainerRow.id,
        date: '2026-05-10',
        time: '10:00',
        duration: '60 мин',
        price: 1800,
      },
    ];
    const orderTime = vi.fn().mockResolvedValue(queryResult(classRows));
    const orderDate = vi.fn().mockReturnValue({ order: orderTime });
    const gte = vi.fn().mockReturnValue({ order: orderDate });
    const eq = vi.fn().mockReturnValue({ gte });
    const select = vi.fn().mockReturnValue({ eq });
    mock.from.mockReturnValue({ select });

    const result = await listClassesByTrainer(trainerRow.id, '2026-05-09');

    expect(mock.from).toHaveBeenCalledWith('classes');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('trainer_id', trainerRow.id);
    expect(gte).toHaveBeenCalledWith('date', '2026-05-09');
    expect(orderDate).toHaveBeenCalledWith('date', { ascending: true });
    expect(orderTime).toHaveBeenCalledWith('time', { ascending: true });
    expect(result).toEqual([
      {
        id: 'class-1',
        title: 'Утренний flow',
        instructor: 'Лидия Кузина',
        trainerId: trainerRow.id,
        date: '2026-05-10',
        time: '10:00',
        duration: '60 мин',
        price: 1800,
      },
    ]);
  });

  it('lists trainers for admin editing', async () => {
    const order = vi.fn().mockResolvedValue(queryResult([trainerRow]));
    const select = vi.fn().mockReturnValue({ order });
    mock.from.mockReturnValue({ select });

    const result = await listAdminTrainers();

    expect(mock.from).toHaveBeenCalledWith('trainers');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('sort_order', { ascending: true });
    expect(result).toEqual([trainerRow]);
  });

  it('creates a trainer row', async () => {
    const single = vi.fn().mockResolvedValue(queryResult(trainerRow));
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    mock.from.mockReturnValue({ insert });

    const result = await createTrainer({
      slug: trainerRow.slug,
      full_name: trainerRow.full_name,
      role_title: trainerRow.role_title,
      bio_short: trainerRow.bio_short,
      specialties: trainerRow.specialties,
      teaching_formats: ['studio'],
    });

    expect(insert).toHaveBeenCalled();
    expect(result).toEqual(trainerRow);
  });

  it('updates a trainer row', async () => {
    const single = vi.fn().mockResolvedValue(queryResult(trainerRow));
    const select = vi.fn().mockReturnValue({ single });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    mock.from.mockReturnValue({ update });

    const result = await updateTrainer(trainerRow.id, { bio_short: 'Новое короткое описание' });

    expect(update).toHaveBeenCalledWith({ bio_short: 'Новое короткое описание' });
    expect(eq).toHaveBeenCalledWith('id', trainerRow.id);
    expect(result).toEqual(trainerRow);
  });

  it('deletes a trainer row', async () => {
    const eq = vi.fn().mockResolvedValue(queryResult(null));
    const deleteFn = vi.fn().mockReturnValue({ eq });
    mock.from.mockReturnValue({ delete: deleteFn });

    await deleteTrainer(trainerRow.id);

    expect(deleteFn).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', trainerRow.id);
  });
});
