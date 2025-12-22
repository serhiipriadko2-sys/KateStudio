export type ConsentKey = 'ai' | 'microphone' | 'geolocation';
export type ConsentStatus = 'granted' | 'denied' | 'unknown';

export interface ConsentState {
  ai: ConsentStatus;
  microphone: ConsentStatus;
  geolocation: ConsentStatus;
}

const STORAGE_KEY = 'ksebe_consents_v1';

export const defaultConsents: ConsentState = {
  ai: 'unknown',
  microphone: 'unknown',
  geolocation: 'unknown',
};

export const loadConsents = (): ConsentState => {
  if (typeof window === 'undefined') return defaultConsents;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultConsents;
    const parsed = JSON.parse(stored) as Partial<ConsentState>;
    return {
      ai: parsed.ai ?? 'unknown',
      microphone: parsed.microphone ?? 'unknown',
      geolocation: parsed.geolocation ?? 'unknown',
    };
  } catch {
    return defaultConsents;
  }
};

export const saveConsents = (consents: ConsentState) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consents));
  } catch {
    // Ignore storage errors
  }
};
