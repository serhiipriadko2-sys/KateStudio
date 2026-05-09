import type { ClassRow, TrainerCard, TrainerDetail, TrainerRow } from '../types';
import { supabase } from './supabase';

export const mapTrainerRowToCard = (row: TrainerRow): TrainerCard => ({
  id: row.id,
  slug: row.slug,
  fullName: row.full_name,
  roleTitle: row.role_title,
  bioShort: row.bio_short,
  avatarUrl: row.avatar_url,
  specialties: row.specialties,
  isFeatured: row.is_featured,
});

export const mapTrainerRowToDetail = (row: TrainerRow): TrainerDetail => ({
  ...mapTrainerRowToCard(row),
  bioLong: row.bio_long,
  quote: row.quote,
  coverImageUrl: row.cover_image_url,
  experienceYears: row.experience_years,
  teachingFormats: row.teaching_formats,
  instagramUrl: row.instagram_url,
  telegramUrl: row.telegram_url,
});

export const listPublicTrainers = async (): Promise<TrainerCard[]> => {
  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as TrainerRow[]).map(mapTrainerRowToCard);
};

export const getTrainerBySlug = async (slug: string): Promise<TrainerDetail | null> => {
  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data ? mapTrainerRowToDetail(data as TrainerRow) : null;
};

export const listClassesByTrainer = async (
  trainerId: string,
  fromDate = new Date().toISOString().slice(0, 10)
): Promise<ClassRow[]> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('trainer_id', trainerId)
    .gte('date', fromDate)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw error;
  return (data ?? []) as ClassRow[];
};
