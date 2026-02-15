export type SupabaseConfigStatus = 'ready' | 'missing';

export type SupabaseConfig = {
  supabaseUrl?: string;
  supabaseKey?: string;
  isConfigured: boolean;
  status: SupabaseConfigStatus;
};

type SupabaseEnv = Pick<ImportMetaEnv, 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'>;

export const getSupabaseConfigFromEnv = (env: SupabaseEnv): SupabaseConfig => {
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
  const isConfigured = Boolean(supabaseUrl && supabaseKey);

  return {
    supabaseUrl,
    supabaseKey,
    isConfigured,
    status: isConfigured ? 'ready' : 'missing',
  };
};
