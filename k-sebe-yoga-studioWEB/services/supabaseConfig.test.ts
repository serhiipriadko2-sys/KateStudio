import { describe, it, expect } from 'vitest';
import { getSupabaseConfigFromEnv } from './supabaseConfig';

describe('Supabase Configuration Logic', () => {
  it('should be configured when both keys are present', () => {
    const env = {
      VITE_SUPABASE_URL: 'https://qkaycdcbstjobacmuaro.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXljZGNic3Rqb2JhY211YXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMzYyOTYsImV4cCI6MjA4MDkxMjI5Nn0.rdul4--s5ZLu850dTi9BMa8Wvni1GlOShXPWrPgY6Dg',
    };
    const config = getSupabaseConfigFromEnv(env);
    expect(config.isConfigured).toBe(true);
    expect(config.status).toBe('ready');
    expect(config.supabaseUrl).toBe('https://example.supabase.co');
  });

  it('should not be configured when URL is missing', () => {
    const env = {
      VITE_SUPABASE_URL: 'https://qkaycdcbstjobacmuaro.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXljZGNic3Rqb2JhY211YXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMzYyOTYsImV4cCI6MjA4MDkxMjI5Nn0.rdul4--s5ZLu850dTi9BMa8Wvni1GlOShXPWrPgY6Dg',
    };
    const config = getSupabaseConfigFromEnv(env);
    expect(config.isConfigured).toBe(false);
    expect(config.status).toBe('missing');
  });

  it('should not be configured when Key is missing', () => {
    const env = {
      VITE_SUPABASE_URL: 'https://qkaycdcbstjobacmuaro.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXljZGNic3Rqb2JhY211YXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMzYyOTYsImV4cCI6MjA4MDkxMjI5Nn0.rdul4--s5ZLu850dTi9BMa8Wvni1GlOShXPWrPgY6Dg',
    };
    const config = getSupabaseConfigFromEnv(env);
    expect(config.isConfigured).toBe(false);
    expect(config.status).toBe('missing');
  });
});
