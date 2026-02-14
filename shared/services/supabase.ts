/**
 * Supabase Client - Unified
 * Shared across WEB and APP
 *
 * Configuration is loaded from environment variables.
 * See .env.example for required variables.
 */
/// <reference types="vite/client" />
import { createClient, PostgrestError, SupabaseClient } from '@supabase/supabase-js';

// Configuration from environment variables (Vite uses VITE_ prefix)
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// In production, fail loudly if Supabase credentials are missing.
// In development, use placeholders to allow the UI to load without Supabase.
const isProduction = import.meta.env.PROD;

if (!envUrl || !envKey) {
  if (isProduction) {
    throw new Error(
      'Supabase configuration missing in production. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }
  console.warn(
    'Supabase configuration missing. Using placeholder values to prevent crash. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

const supabaseUrl = envUrl || 'https://placeholder.supabase.co';
const supabaseKey = envKey || 'placeholder-key';

// Create singleton client
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to upload a file to Supabase Storage
 * Returns null if upload fails, triggering local fallback
 */
export const uploadFile = async (
  file: File,
  bucket: string,
  path: string
): Promise<string | null> => {
  if (!envUrl || !envKey) return null; // Fail early if not configured

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

/**
 * Generic query helper with error handling
 */
export const queryTable = async <T>(
  table: string,
  query: (
    q: ReturnType<typeof supabase.from>
  ) => Promise<{ data: T[] | null; error: PostgrestError | null }>
): Promise<T[] | null> => {
  try {
    const { data, error } = await query(supabase.from(table));
    if (error) throw error;
    return data as T[];
  } catch (err) {
    console.error(`Error querying ${table}:`, err);
    return null;
  }
};

export default supabase;
