/**
 * Supabase Client for APP (aligned with shared implementation)
 * Configuration is loaded from environment variables.
 * See .env.example for required variables.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration from environment variables (Vite uses VITE_ prefix)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Log loudly but never throw at module level — a missing env var must not white-screen the app.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured) {
  console.error(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY not set. Data features will be unavailable; the app will show demo/fallback content.'
  );
}

const supabaseUrlFinal = supabaseUrl || 'https://placeholder.supabase.co';
const supabaseKeyFinal = supabaseKey || 'placeholder-key';

// Create singleton client (safe to import across APP)
export const supabase: SupabaseClient = createClient(supabaseUrlFinal, supabaseKeyFinal);

/**
 * Helper to upload a file to Supabase Storage
 * Returns null if upload fails for any reason (permissions, bucket missing, etc.)
 * forcing the app to use local fallback.
 */
export const uploadFile = async (
  file: File,
  bucket: string,
  path: string
): Promise<string | null> => {
  if (!supabaseUrl || !supabaseKey) return null; // Fail early if not configured

  try {
    // 1. Try to upload directly
    let { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });

    // 2. If bucket not found, try to create it
    if (
      error &&
      (error.message.includes('Bucket not found') ||
        error.message.includes('The resource was not found'))
    ) {
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });

      if (createError) {
        console.warn('Cloud storage unavailable. Using local storage.');
        return null;
      }

      // Retry upload after creation
      const retry = await supabase.storage.from(bucket).upload(path, file, { upsert: true });

      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.warn('Cloud upload failed. Using local storage.');
      return null;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return publicUrl;
  } catch {
    console.warn('Unexpected upload error. Using local storage.');
    return null;
  }
};
