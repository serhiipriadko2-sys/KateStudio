import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatPhone,
  parsePhone,
  getInitials,
  clamp,
  lerp,
} from '../index';

describe('formatTime', () => {
  it('formats a Date object to HH:MM', () => {
    const date = new Date(2024, 0, 1, 9, 5, 0); // 09:05
    const result = formatTime(date);
    expect(result).toMatch(/09:05/);
  });

  it('accepts ISO string', () => {
    const result = formatTime('2024-06-15T18:30:00');
    expect(result).toMatch(/18:30/);
  });

  it('accepts timestamp number', () => {
    const ts = new Date(2024, 0, 1, 12, 0, 0).getTime();
    const result = formatTime(ts);
    expect(result).toMatch(/12:00/);
  });
});

describe('parsePhone', () => {
  it('converts 8-prefix 11-digit number to +7 format', () => {
    expect(parsePhone('89991234567')).toBe('+79991234567');
  });

  it('converts 10-digit number to +7 format', () => {
    expect(parsePhone('9991234567')).toBe('+79991234567');
  });

  it('keeps +7-prefix 11-digit number as-is', () => {
    expect(parsePhone('+79991234567')).toBe('+79991234567');
  });

  it('returns original string for unrecognised format', () => {
    expect(parsePhone('123')).toBe('123');
  });

  it('strips non-digit characters before parsing', () => {
    expect(parsePhone('+7 (999) 123-45-67')).toBe('+79991234567');
  });
});

describe('formatPhone', () => {
  it('formats 11-digit number with spaces and dashes', () => {
    const result = formatPhone('79991234567');
    expect(result).toBe('+7 (999) 123-45-67');
  });

  it('returns original for non-11-digit input', () => {
    expect(formatPhone('123')).toBe('123');
  });
});

describe('getInitials', () => {
  it('returns uppercase initials from two-word name', () => {
    expect(getInitials('Катя Габран')).toBe('КГ');
  });

  it('returns first two letters for single word', () => {
    expect(getInitials('Анна')).toBe('А');
  });

  it('returns at most 2 characters for long names', () => {
    expect(getInitials('Иван Иванович Иванов')).toBe('ИИ');
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min when below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max when above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clamp(7, 5, 5)).toBe(5);
  });
});

describe('lerp', () => {
  it('returns start when t=0', () => {
    expect(lerp(0, 100, 0)).toBe(0);
  });

  it('returns end when t=1', () => {
    expect(lerp(0, 100, 1)).toBe(100);
  });

  it('returns midpoint when t=0.5', () => {
    expect(lerp(0, 100, 0.5)).toBe(50);
  });

  it('works with negative ranges', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });
});
