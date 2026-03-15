/**
 * Script to check and apply is_admin() grant
 * Run with SERVICE ROLE KEY
 */

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.log('Set SUPABASE_SERVICE_ROLE_KEY in .env (temporary for this script)');
  process.exit(1);
}

// Use service role to bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkIsAdminFunction() {
  console.log('🔍 Checking is_admin() function permissions...\n');

  // Try to execute is_admin()
  const { data, error } = await supabase.rpc('is_admin');

  if (error) {
    console.error('❌ Error calling is_admin():', error.message);
    console.log('\n💡 Fix: Run this SQL in Supabase Dashboard SQL Editor:');
    console.log(`
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
`);
  } else {
    console.log('✅ is_admin() callable. Result:', data);
  }

  // Check if user is in admins table
  const { data: userData } = await supabase.auth.getUser();
  if (userData?.user) {
    console.log('\n👤 Current user:', userData.user.id);

    const { data: adminRow } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .single();

    if (adminRow) {
      console.log('✅ User is in admins table');
    } else {
      console.log('❌ User NOT in admins table');
      console.log('\n💡 Fix: Run this SQL:');
      console.log(`INSERT INTO public.admins (user_id) VALUES ('${userData.user.id}');`);
    }
  }
}

checkIsAdminFunction().catch(console.error);
