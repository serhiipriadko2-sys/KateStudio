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
): Promise<
  Array<{
    id: string;
    title: string;
    instructor: string | null;
    trainerId: string | null;
    date: string | null;
    time: string | null;
    duration: string | null;
    price: number | null;
  }>
> => {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('trainer_id', trainerId)
    .gte('date', fromDate)
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ClassRow[]).map((row) => ({
    id: row.id,
    title: row.name ?? 'Занятие',
    instructor: row.instructor,
    trainerId: row.trainer_id,
    date: row.date,
    time: row.time,
    duration: row.duration,
    price: row.price,
  }));
};

export interface TrainerAdminPayload {
  slug: string;
  full_name: string;
  short_name?: string | null;
  role_title: string;
  bio_short: string;
  bio_long?: string | null;
  quote?: string | null;
  avatar_url?: string | null;
  cover_image_url?: string | null;
  specialties: string[];
  teaching_formats: Array<'studio' | 'online' | 'retreat' | 'private'>;
  experience_years?: number | null;
  instagram_url?: string | null;
  telegram_url?: string | null;
  sort_order?: number;
  is_featured?: boolean;
  is_active?: boolean;
}

export const listAdminTrainers = async (): Promise<TrainerRow[]> => {
  const { data, error } = await supabase
    .from('trainers')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []) as TrainerRow[];
};

export const createTrainer = async (payload: TrainerAdminPayload): Promise<TrainerRow> => {
  const { data, error } = await supabase.from('trainers').insert(payload).select().single();

  if (error) throw error;
  return data as TrainerRow;
};

export const updateTrainer = async (
  id: string,
  payload: Partial<TrainerAdminPayload>
): Promise<TrainerRow> => {
  const { data, error } = await supabase
    .from('trainers')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TrainerRow;
};

export const deleteTrainer = async (id: string): Promise<void> => {
  const { error } = await supabase.from('trainers').delete().eq('id', id);

  if (error) throw error;
};