import { http, HttpResponse } from 'msw';

// Supabase REST API base URL used in tests (placeholder when env vars are not set)
const SUPABASE_URL = 'https://placeholder.supabase.co';

// Default fixture data
const DEFAULT_APP_SETTINGS = {
  key: 'studio_contacts',
  value: {
    phone: '+7 (916) 123-45-67',
    email: 'info@k-sebe.yoga',
    address: 'г. Дубна, ул. Станционная 5Б, 2 этаж',
    map_url: 'https://yandex.ru/map-widget/v1/?um=constructor%3A...',
    social_vk: 'https://vk.com/k_sebe_yoga',
    social_telegram: 'https://t.me/k_sebe_yoga',
    social_whatsapp: 'https://wa.me/79161234567',
    social_instagram: 'https://instagram.com/kate_gabran',
  },
};

const DEFAULT_CLASSES = [
  {
    id: 'class-1',
    name: 'Inside Flow Basics',
    instructor: 'Катя Габран',
    duration: '60 мин',
    intensity: 1,
    price: 800,
    is_online: false,
  },
];

const DEFAULT_REVIEWS = [
  {
    id: 'review-1',
    author: 'Анна',
    text: 'Отличные занятия!',
    rating: 5,
  },
];

const DEFAULT_USER_PROGRESS = {
  user_id: 'test-user',
  current_streak: 0,
  max_streak: 0,
  total_xp: 0,
  level: 1,
};

export const handlers = [
  // GET app_settings (used by useStudioContacts)
  http.get(`${SUPABASE_URL}/rest/v1/app_settings`, () => {
    return HttpResponse.json([DEFAULT_APP_SETTINGS]);
  }),

  // GET classes
  http.get(`${SUPABASE_URL}/rest/v1/classes`, () => {
    return HttpResponse.json(DEFAULT_CLASSES);
  }),

  // GET reviews
  http.get(`${SUPABASE_URL}/rest/v1/reviews`, () => {
    return HttpResponse.json(DEFAULT_REVIEWS);
  }),

  // GET pricing_plans
  http.get(`${SUPABASE_URL}/rest/v1/pricing_plans`, () => {
    return HttpResponse.json([]);
  }),

  // GET site_images mapping
  http.get(`${SUPABASE_URL}/rest/v1/site_images`, () => {
    return HttpResponse.json(null);
  }),

  // GET user_progress
  http.get(`${SUPABASE_URL}/rest/v1/user_progress`, () => {
    return HttpResponse.json(DEFAULT_USER_PROGRESS);
  }),

  // INSERT user_progress
  http.post(`${SUPABASE_URL}/rest/v1/user_progress`, async ({ request }) => {
    const payload = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...DEFAULT_USER_PROGRESS, ...payload });
  }),
];
