/**
 * Supabase Client for WEB
 * Configuration is loaded from environment variables.
 * See .env.example for required variables.
 */
import { createClient } from '@supabase/supabase-js';

// Configuration from environment variables (Vite uses VITE_ prefix)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Supabase configuration missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

/**
 * Helper to upload a file to Supabase Storage
 * Returns null if upload fails for any reason (permissions, bucket missing, etc.)
 * forcing the app to use local fallback.
 */
export const uploadFile = async (file: File, bucket: string, path: string): Promise<string | null> => {
  if (!supabase) return null;
  
  try {
    // 1. Try to upload directly
    let { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    // 2. If bucket not found, try to create it
    if (error && (error.message.includes('Bucket not found') || error.message.includes('The resource was not found'))) {
      
      // Attempt to create a public bucket
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        // If creation fails (likely due to permissions), return null to trigger local fallback
        console.warn("Cloud storage unavailable. Using local storage.");
        return null;
      }

      // Retry upload after creation
      const retry = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true });
        
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.warn("Cloud upload failed. Using local storage.");
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (err) {
    console.warn("Unexpected upload error. Using local storage.");
    return null;
  }
};
