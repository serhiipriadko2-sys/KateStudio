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
const adminUserId = process.env.ADMIN_USER_ID;
const adminPhone = process.env.ADMIN_PHONE;

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  console.log('\n📝 2. Optionally add user to admins table...');

  if (!adminUserId) {
    console.log('ℹ️  ADMIN_USER_ID is not set; skipping admin insertion and profile update.');
    console.log('   To add an admin intentionally, run with ADMIN_USER_ID=<uuid>.');
  } else {
    if (!UUID_V4_REGEX.test(adminUserId)) {
      console.error('❌ ADMIN_USER_ID must be a valid UUID v4.');
      process.exit(1);
    }

    const { error: adminError } = await supabase.from('admins').insert({ user_id: adminUserId });

    if (adminError) {
      if (adminError.message.includes('duplicate')) {
        console.log('✅ User already exists in admins table');
      } else {
        console.error('❌ Failed to add admin:', adminError.message);
      }
    } else {
      console.log('✅ User added to admins');
    }

    // 3. Optionally update profile phone
    if (adminPhone) {
      console.log('\n📝 3. Updating profile with phone...');
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ phone: adminPhone })
        .eq('user_id', adminUserId);

      if (profileError) {
        console.error('❌ Failed to update profile:', profileError.message);
      } else {
        console.log('✅ Profile updated');
      }
    } else {
      console.log('\nℹ️  ADMIN_PHONE is not set; skipping profile update.');
    }

    // 4. Verify admin status
    console.log('\n📝 4. Verifying admin status...');
    const { data: adminCheck } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', adminUserId)
      .single();

    if (adminCheck) {
      console.log('✅ VERIFIED: User is admin');
    } else {
      console.log('⚠️  User may not be in admins table yet');
    }
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
