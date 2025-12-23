import { ContentData, ContentMode, defaultContent } from '../data/content';

const CONTENT_EVENT = 'ksebe-content-updated';
const CONTENT_MODE_KEY = 'ksebe-content-mode';
const CONTENT_STORAGE_PREFIX = 'ksebe-content-';

const isBrowser = typeof window !== 'undefined';

const getStorageKey = (mode: ContentMode) => `${CONTENT_STORAGE_PREFIX}${mode}`;

const parseStoredData = (value: string | null): ContentData | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as ContentData;
  } catch (error) {
    return null;
  }
};

export const normalizeContentData = (
  data: Partial<ContentData> | null | undefined
): ContentData => ({
  schedule: {
    offline: data?.schedule?.offline ?? defaultContent.schedule.offline,
    online: data?.schedule?.online ?? defaultContent.schedule.online,
  },
  gallery: data?.gallery ?? defaultContent.gallery,
  articles: data?.articles ?? defaultContent.articles,
});

export const getContentMode = (): ContentMode => {
  if (isBrowser) {
    const stored = window.localStorage.getItem(CONTENT_MODE_KEY) as ContentMode | null;
    if (stored === 'demo' || stored === 'production') {
      return stored;
    }
  }

  const envMode = import.meta.env.VITE_CONTENT_MODE as ContentMode | undefined;
  if (envMode === 'demo' || envMode === 'production') {
    return envMode;
  }

  return import.meta.env.PROD ? 'production' : 'demo';
};

export const setContentMode = (mode: ContentMode) => {
  if (!isBrowser) return;
  window.localStorage.setItem(CONTENT_MODE_KEY, mode);
  window.dispatchEvent(new Event(CONTENT_EVENT));
};

export const getContentData = (mode: ContentMode = getContentMode()): ContentData => {
  if (!isBrowser) return defaultContent;
  const stored = parseStoredData(window.localStorage.getItem(getStorageKey(mode)));
  return normalizeContentData(stored);
};

export const saveContentData = (data: ContentData, mode: ContentMode = getContentMode()) => {
  if (!isBrowser) return;
  window.localStorage.setItem(getStorageKey(mode), JSON.stringify(normalizeContentData(data)));
  window.dispatchEvent(new Event(CONTENT_EVENT));
};

export const resetContentData = (mode: ContentMode = getContentMode()) => {
  if (!isBrowser) return;
  window.localStorage.removeItem(getStorageKey(mode));
  window.dispatchEvent(new Event(CONTENT_EVENT));
};

export const subscribeContentUpdates = (callback: () => void) => {
  if (!isBrowser) return () => undefined;
  const handler = () => callback();
  window.addEventListener(CONTENT_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(CONTENT_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
};
