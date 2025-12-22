/**
 * K Sebe Yoga Studio - Shared Services
 */
export { supabase, uploadFile, queryTable } from './supabase';
export {
  BUCKET_NAME,
  TABLE_NAME,
  deleteImageMapping,
  getSavedImageUrl,
  imageStorageAdapter,
  saveImageMapping,
  uploadImage,
} from './imageStorage';
