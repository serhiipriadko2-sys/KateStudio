import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  formatPrice,
  pluralize,
  debounce,
  throttle,
  capitalize,
  truncate,
  isValidEmail,
  isValidPhone,
  generateId,
  sleep,
} from '../utils';

describe('Utility Functions', () => {
  describe('cn (classNames)', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      const showBar = false;
      expect(cn('foo', showBar && 'bar', 'baz')).toBe('foo baz');
    });

    it('should handle undefined and null', () => {
      expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-12-14');
      const result = formatDate(date);
      expect(result).toContain('декабря');
    });
  });

  describe('formatPrice', () => {
    it('should format price with currency', () => {
      expect(formatPrice(5200)).toContain('5');
      expect(formatPrice(5200)).toContain('200');
      expect(formatPrice(5200)).toContain('₽');
    });

    it('should handle zero', () => {
      expect(formatPrice(0)).toContain('0');
    });
  });

  describe('pluralize', () => {
    it('should return singular form for 1', () => {
      expect(pluralize(1, ['занятие', 'занятия', 'занятий'])).toBe('1 занятие');
    });

    it('should return plural form for 2-4', () => {
      expect(pluralize(2, ['занятие', 'занятия', 'занятий'])).toBe('2 занятия');
      expect(pluralize(3, ['занятие', 'занятия', 'занятий'])).toBe('3 занятия');
      expect(pluralize(4, ['занятие', 'занятия', 'занятий'])).toBe('4 занятия');
    });

    it('should return genitive plural for 5+', () => {
      expect(pluralize(5, ['занятие', 'занятия', 'занятий'])).toBe('5 занятий');
      expect(pluralize(11, ['занятие', 'занятия', 'занятий'])).toBe('11 занятий');
      expect(pluralize(21, ['занятие', 'занятия', 'занятий'])).toBe('21 занятие');
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('HELLO');
    });

    it('should handle empty string', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
    });

    it('should not truncate short text', () => {
      expect(truncate('Hi', 5)).toBe('Hi');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate Russian phone numbers', () => {
      expect(isValidPhone('+79991234567')).toBe(true);
      expect(isValidPhone('89991234567')).toBe(true);
    });

    it('should reject invalid phones', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abcd')).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('should use custom prefix', () => {
      expect(generateId('test')).toMatch(/^test_/);
      expect(generateId('custom')).toMatch(/^custom_/);
    });

    it('should have default prefix', () => {
      expect(generateId()).toMatch(/^ksebe_/);
    });
  });

  describe('sleep', () => {
    it('should delay execution', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
    });
  });

  describe('debounce', () => {
    it('should debounce function calls', async () => {
      let callCount = 0;
      const fn = debounce(() => callCount++, 50);

      fn();
      fn();
      fn();

      expect(callCount).toBe(0);
      await sleep(100);
      expect(callCount).toBe(1);
    });
  });

  describe('throttle', () => {
    it('should throttle function calls', async () => {
      let callCount = 0;
      const fn = throttle(() => callCount++, 50);

      fn();
      fn();
      fn();

      expect(callCount).toBe(1);
      await sleep(100);
      fn();
      expect(callCount).toBe(2);
    });
  });
});
