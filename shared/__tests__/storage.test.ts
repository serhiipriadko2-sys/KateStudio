import { describe, expect, it, beforeEach } from 'vitest';
import { storage, formatPhone, parsePhone } from '../utils';

beforeEach(() => {
  localStorage.clear();
});

describe('storage helpers', () => {
  it('stores and retrieves JSON values', () => {
    storage.set('demo', { ok: true });
    expect(storage.get('demo')).toEqual({ ok: true });
  });

  it('returns default when missing', () => {
    expect(storage.get('missing', { fallback: 1 })).toEqual({ fallback: 1 });
  });

  it('removes stored values', () => {
    storage.set('remove-me', 'value');
    storage.remove('remove-me');
    expect(storage.get('remove-me')).toBeNull();
  });
});

describe('phone helpers', () => {
  it('parses phone to +7 format', () => {
    expect(parsePhone('8 (999) 123-45-67')).toBe('+79991234567');
    expect(parsePhone('9991234567')).toBe('+79991234567');
  });

  it('formats phone for display', () => {
    expect(formatPhone('+79991234567')).toBe('+7 (999) 123-45-67');
  });
});
