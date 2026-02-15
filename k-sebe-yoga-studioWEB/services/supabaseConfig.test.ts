import { describe, it, expect } from 'vitest';
import { getSupabaseConfigFromEnv } from './supabaseConfig';

describe('Supabase Configuration Logic', () => {
  it('should be configured when both keys are present', () => {
    const env = {
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'some-key',
    };
    const config = getSupabaseConfigFromEnv(env);
    expect(config.isConfigured).toBe(true);
    expect(config.status).toBe('ready');
    expect(config.supabaseUrl).toBe('https://example.supabase.co');
  });

  it('should not be configured when URL is missing', () => {
    const env = {
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: 'some-key',
    };
    const config = getSupabaseConfigFromEnv(env);
    expect(config.isConfigured).toBe(false);
    expect(config.status).toBe('missing');
  });

  it('should not be configured when Key is missing', () => {
    const env = {
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_ANON_KEY: '',
    };
    const config = getSupabaseConfigFromEnv(env);
    expect(config.isConfigured).toBe(false);
    expect(config.status).toBe('missing');
  });
});
