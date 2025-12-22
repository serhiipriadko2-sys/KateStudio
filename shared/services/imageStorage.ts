import { supabase, uploadFile } from './supabase';

export const BUCKET_NAME = 'images';
export const TABLE_NAME = 'site_images';

export const getSavedImageUrl = async (key: string): Promise<string | null> => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from(TABLE_NAME).select('url').eq('key', key).single();

    if (error) return null;
    return data?.url || null;
  } catch {
    return null;
  }
};

export const saveImageMapping = async (key: string, url: string) => {
  if (!supabase) return;
  try {
    await supabase.from(TABLE_NAME).upsert({ key, url });
  } catch {
    // Ignore errors, local cache remains source of truth.
  }
};

export const deleteImageMapping = async (key: string) => {
  if (!supabase) return;
  try {
    await supabase.from(TABLE_NAME).delete().eq('key', key);
  } catch {
    // Ignore errors, local cache remains source of truth.
  }
};

export const uploadImage = async (file: File, key: string): Promise<string | null> => {
  if (!supabase) return null;
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${key}-${Date.now()}.${ext}`;
    return await uploadFile(file, BUCKET_NAME, fileName);
  } catch {
    return null;
  }
};

export const imageStorageAdapter = {
  uploadToCloud: uploadImage,
  saveMapping: saveImageMapping,
  getMapping: getSavedImageUrl,
  deleteMapping: deleteImageMapping,
};
