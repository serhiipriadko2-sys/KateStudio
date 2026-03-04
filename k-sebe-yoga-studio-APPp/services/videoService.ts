import { supabase } from '@ksebe/shared';

export interface Video {
  id: string;
  title: string;
  duration: string;
  level: string;
  image_url?: string;
  video_url?: string;
  is_locked: boolean;
  tags: string[];
}

export const videoService = {
  async getVideos(): Promise<Video[]> {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
      return [];
    }

    return data || [];
  },
};
