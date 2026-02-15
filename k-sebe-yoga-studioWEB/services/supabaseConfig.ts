export type SupabaseConfigStatus = 'ready' | 'missing';

export type SupabaseConfig = {
  supabaseUrl?: string;
  supabaseKey?: string;
  isConfigured: boolean;
  status: SupabaseConfigStatus;
};

type SupabaseEnv = Pick<ImportMetaEnv, 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'>;

export const getSupabaseConfigFromEnv = (env: SupabaseEnv): SupabaseConfig => {
  const supabaseUrl = env.https://qkaycdcbstjobacmuaro.supabase.co;
  const supabaseKey = env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrYXljZGNic3Rqb2JhY211YXJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMzYyOTYsImV4cCI6MjA4MDkxMjI5Nn0.rdul4--s5ZLu850dTi9BMa8Wvni1GlOShXPWrPgY6Dg;
  const isConfigured = Boolean(supabaseUrl && supabaseKey);

  return {
    supabaseUrl,
    supabaseKey,
    isConfigured,
    status: isConfigured ? 'ready' : 'missing',
  };
};
