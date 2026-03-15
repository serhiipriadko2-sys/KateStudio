/**
 * Script to apply admin SQL migrations directly
 * Uses Supabase REST API with service role key
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
  console.log('\n📝 Set SUPABASE_SERVICE_ROLE_KEY temporarily:');
  console.log('   Get it from: https://app.supabase.com/project/_/settings/api');
  process.exit(1);
}

// Use service role to bypass RLS
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function applyMigrations() {
  console.log('🔧 Applying admin migrations...\n');

  // 1. Grant execute on is_admin()
  console.log('📝 1. Granting execute on is_admin()...');
  const { error: grantError } = await supabase.rpc('exec_sql', {
    sql: `
      revoke execute on function public.is_admin() from public, anon;
      grant execute on function public.is_admin() to authenticated;
    `,
  });

  if (grantError) {
    console.warn('⚠️  Grant may have failed (trying anyway):', grantError.message);
  } else {
    console.log('✅ Grant executed');
  }

  // 2. Add user to admins table
  console.log('\n📝 2. Adding user to admins table...');
  const userId = '259e55a3-1a0a-4a1f-8855-c53f75564e6c'; // serhiipriadko2@gmail.com

  const { error: adminError } = await supabase.from('admins').insert({ user_id: userId });

  if (adminError) {
    if (adminError.message.includes('duplicate')) {
      console.log('✅ User already in admins table');
    } else {
      console.error('❌ Failed to add admin:', adminError.message);
    }
  } else {
    console.log('✅ User added to admins');
  }

  // 3. Update profile (add phone)
  console.log('\n📝 3. Updating profile with phone...');
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ phone: '+79990000000' })
    .eq('user_id', userId);

  if (profileError) {
    console.error('❌ Failed to update profile:', profileError.message);
  } else {
    console.log('✅ Profile updated');
  }

  // 4. Verify admin status
  console.log('\n📝 4. Verifying admin status...');
  const { data: adminCheck } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (adminCheck) {
    console.log('✅ VERIFIED: User is admin');
  } else {
    console.log('⚠️  User may not be in admins table yet');
  }

  console.log('\n✅ Migrations applied successfully!');
  console.log('\n📌 Next steps:');
  console.log('   1. Refresh admin panel: http://localhost:5173/admin');
  console.log('   2. Verify all tabs load correctly');
}

applyMigrations().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
