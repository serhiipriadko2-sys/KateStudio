/**
 * K Sebe Yoga Studio - Shared Services
 */
export { supabase, isSupabaseConfigured, uploadFile, queryTable } from './supabase';
export {
  BUCKET_NAME,
  TABLE_NAME,
  deleteImageMapping,
  getSavedImageUrl,
  imageStorageAdapter,
  saveImageMapping,
  uploadImage,
} from './imageStorage';
export { analytics } from './analytics';
export { monitoring } from './monitoring';
export { subscribeNewsletter } from './newsletter';
export {
  createTrainer,
  deleteTrainer,
  getTrainerBySlug,
  listClassesByTrainer,
  listAdminTrainers,
  listPublicTrainers,
  mapTrainerRowToCard,
  mapTrainerRowToDetail,
  updateTrainer,
} from './trainers';
export type { SubscribeNewsletterInput, SubscribeNewsletterResult } from './newsletter';
export type { MonitoringInitOptions } from './monitoring';