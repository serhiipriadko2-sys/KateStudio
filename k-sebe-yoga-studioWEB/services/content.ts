import { supabase, uploadFile } from './supabase';

export const BUCKET_NAME = 'images';
export const TABLE_NAME = 'site_images';

// Get the saved image URL for a specific block key
export const getSavedImageUrl = async (key: string): Promise<string | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from(TABLE_NAME).select('url').eq('key', key).single();

    if (error) return null;
    return data?.url || null;
  } catch (error) {
    return null;
  }
};

// Save the association between a block key and an image URL
export const saveImageMapping = async (key: string, url: string) => {
  if (!supabase) return;
  try {
    // Attempt to save, but ignore errors if RLS (permissions) block it
    await supabase.from(TABLE_NAME).upsert({ key, url });
  } catch (error) {
    // Silently fail - application will continue using local storage/cache
  }
};

// Delete the association (reset to default)
export const deleteImageMapping = async (key: string) => {
  if (!supabase) return;
  try {
    await supabase.from(TABLE_NAME).delete().eq('key', key);
  } catch (error) {
    // Ignore errors
  }
};

// Upload file to storage and return the public URL
export const uploadImage = async (file: File, key: string): Promise<string | null> => {
  if (!supabase) return null;
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    // Create a unique file name to avoid collisions
    const fileName = `${key}-${Date.now()}.${ext}`;
    return await uploadFile(file, BUCKET_NAME, fileName);
  } catch (error) {
    return null;
  }
};
