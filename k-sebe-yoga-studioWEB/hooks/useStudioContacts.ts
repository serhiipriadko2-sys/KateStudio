import { supabase } from '@ksebe/shared';
import { useQuery } from '@tanstack/react-query';

export interface StudioContacts {
  phone: string;
  email: string;
  address: string;
  map_url: string;
  social_vk: string;
  social_telegram: string;
  social_whatsapp: string;
  social_instagram: string;
}

const DEFAULT_CONTACTS: StudioContacts = {
  phone: '+7 (909) 946-89-72',
  email: '',
  address: 'г. Дубна, ул. Станционная 5Б, 2 этаж',
  map_url: 'https://yandex.ru/navi/org/k_sebe/7167334007',
  social_vk: '',
  social_telegram: 'https://t.me/k_sebe_dubna',
  social_whatsapp: '',
  social_instagram: 'https://instagram.com/kate_gabran',
};

export const useStudioContacts = () => {
  return useQuery({
    queryKey: ['settings', 'studio_contacts'],
    queryFn: async () => {
      if (!supabase) return DEFAULT_CONTACTS;

      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'studio_contacts')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching studio contacts:', error);
        return DEFAULT_CONTACTS;
      }

      return (data?.value as StudioContacts) || DEFAULT_CONTACTS;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
