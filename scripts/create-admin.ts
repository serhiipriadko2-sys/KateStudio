/**
 * Script to create admin user in Supabase
 * Usage: npx tsx scripts/create-admin.ts <email> <password> <name>
 */

import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load .env from root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

console.log('🔧 Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin(email: string, password: string, name: string) {
  console.log(`\n📝 Creating admin: ${email} (${name})`);

  // 1. Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('⚠️  User already exists. Fetching user ID...');
      // User exists, try to sign in to get ID
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('❌ Sign in error:', signInError.message);
        process.exit(1);
      }

      const userId = signInData.user?.id;
      if (!userId) {
        console.error('❌ No user ID after sign in');
        process.exit(1);
      }

      console.log('✅ User ID:', userId);
      await ensureAdmin(userId);
      return;
    }

    console.error('❌ Sign up error:', authError.message);
    process.exit(1);
  }

  if (!authData.user) {
    console.error('❌ No user returned from sign up');
    process.exit(1);
  }

  console.log('✅ User created:', authData.user.id);

  // 2. Create profile
  const { error: profileError } = await supabase.from('profiles').insert({
    user_id: authData.user.id,
    name: name || email.split('@')[0],
  });

  if (profileError) {
    console.error('⚠️  Profile error:', profileError.message);
  } else {
    console.log('✅ Profile created');
  }

  // 3. Add to admins table
  await ensureAdmin(authData.user.id);

  console.log('\n✅ Admin created successfully!');
  console.log(`\n📌 Login credentials:`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Admin Panel: http://localhost:5173/admin`);
}

async function ensureAdmin(userId: string) {
  // Check if already admin
  const { data: existing } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    console.log('✅ User is already admin');
    return;
  }

  // Add to admins
  const { error } = await supabase.from('admins').insert({ user_id: userId });

  if (error) {
    console.error('❌ Failed to add to admins:', error.message);
    process.exit(1);
  }

  console.log('✅ Added to admins table');
}

// Main
const [, , email, password, name] = process.argv;

if (!email || !password) {
  console.log('📖 Usage: npx tsx scripts/create-admin.ts <email> <password> [name]');
  console.log('\nExample:');
  console.log('  npx tsx scripts/create-admin.ts admin@ksebe.ru SecurePass123 "Катя Габран"');
  process.exit(1);
}

createAdmin(email, password, name || email.split('@')[0]).catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
