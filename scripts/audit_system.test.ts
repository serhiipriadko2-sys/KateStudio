/* eslint-disable */
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

describe('System Integrity Audit', () => {
  it('should connect to Supabase and fetch studio_contacts', async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'studio_contacts')
      .single();

    if (error) console.error('Error fetching studio_contacts:', error);
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data?.value).toHaveProperty('phone');
  });

  it('should fetch videos from public.videos', async () => {
    const { data, error } = await supabase.from('videos').select('*').limit(5);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    if (data) console.log(`Verified ${data.length} videos.`);
  });

  it('should allow public insert into contacts (without select)', async () => {
    const testContact = {
      name: 'Audit Bot',
      phone: '+79990000000',
      message: 'System audit test message ' + new Date().toISOString(),
      status: 'new',
    };

    // Public users can INSERT but not SELECT. So we don't chain .select()
    const { data, error } = await supabase.from('contacts').insert([testContact]);

    if (error) console.error('Error inserting contact:', error);
    expect(error).toBeNull();
    console.log('Contact insertion succeeded (no data returned, as expected).');
  });

  it('should NOT allow public read of bookings', async () => {
    const { data, error } = await supabase.from('bookings').select('*').limit(5);

    // RLS should filter this to empty for anon users
    if (!error) {
      expect(data?.length).toBe(0);
      console.log('Bookings read restricted correctly (0 rows).');
    }
  });
});
