import { describe, it, expect } from 'vitest';
import { getCandidateKeys } from '../utils';

describe('getCandidateKeys', () => {
  it('returns 6 candidates for a plain key', () => {
    const keys = getCandidateKeys('hero');
    expect(keys).toHaveLength(6);
  });

  it('always includes the original key as first entry', () => {
    const keys = getCandidateKeys('hero');
    expect(keys[0]).toBe('hero');
  });

  it('includes ksebe-img- prefixed variant', () => {
    const keys = getCandidateKeys('hero');
    expect(keys).toContain('ksebe-img-hero');
  });

  it('strips -v4 version suffix to derive base key', () => {
    const keys = getCandidateKeys('hero-v4');
    // base key should be 'hero', not 'hero-v4'
    expect(keys).toContain('hero');
    expect(keys).toContain('ksebe-img-hero');
  });

  it('strips -new suffix to derive base key', () => {
    const keys = getCandidateKeys('hero-new');
    expect(keys).toContain('hero');
    expect(keys).toContain('ksebe-img-hero');
  });

  it('includes -v4 variant of the base key', () => {
    const keys = getCandidateKeys('hero');
    expect(keys).toContain('hero-v4');
    expect(keys).toContain('ksebe-img-hero-v4');
  });

  it('handles key that already has version suffix without duplication', () => {
    const keys = getCandidateKeys('katya-v4');
    // original key included
    expect(keys).toContain('katya-v4');
    // base stripped
    expect(keys).toContain('katya');
  });
});
