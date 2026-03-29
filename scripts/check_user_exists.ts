/**
 * Script to check if user exists in Supabase auth
 */

import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  console.log('🔍 Checking user in Supabase auth...\n');

  // Try to sign in to verify credentials
  const email = process.env.CHECK_USER_EMAIL ?? process.argv[2];
  const password = process.env.CHECK_USER_PASSWORD ?? process.argv[3];

  if (!email || !password) {
    console.error('❌ Missing login credentials.');
    console.log('Usage: npm run check-user <email> <password>');
    console.log('or set CHECK_USER_EMAIL and CHECK_USER_PASSWORD env vars.');
    return;
  }

  console.log(`📝 Testing login: ${email}`);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('❌ Login failed:', error.message);
    console.log('\n💡 User does not exist or credentials are wrong.');
    console.log('\n📝 To create user, run:');
    console.log('   npm run create-admin <email> <password> "<name>"');
    return;
  }

  console.log('✅ Login successful!');
  console.log('   User ID:', data.user.id);
  console.log('   Email:', data.user.email);
  console.log('   Created:', data.user.created_at);

  // Check if in admins table
  const { data: adminData } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', data.user.id)
    .single();

  if (adminData) {
    console.log('\n✅ User IS in admins table');
  } else {
    console.log('\n❌ User is NOT in admins table');
    console.log('\n📝 SQL to add admin:');
    console.log(`   INSERT INTO public.admins (user_id) VALUES ('${data.user.id}');`);
  }

  // Check profile
  const { data: profileData } = await supabase
    .from('profiles')
    .select('user_id, phone, full_name')
    .eq('user_id', data.user.id)
    .single();

  if (profileData) {
    console.log('\n✅ Profile exists');
    console.log('   Name:', profileData.full_name);
    console.log('   Phone:', profileData.phone || '(not set)');
  } else {
    console.log('\n❌ Profile does not exist');
  }
}

checkUser().catch(console.error);
