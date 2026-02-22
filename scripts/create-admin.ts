/* eslint-disable no-console */
import path from 'path';
import { createInterface } from 'readline';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (q: string) => new Promise<string>((resolve) => rl.question(q, resolve));

async function main() {
  console.log('\n--- Create Admin User ---');
  console.log('This script will create a new Supabase user and grant them Admin access.');
  console.log('You need your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n');

  const url = process.env.VITE_SUPABASE_URL || (await question('Supabase URL: '));
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || (await question('Supabase Service Role Key: '));

  if (!url || !serviceKey) {
    console.error('Missing URL or Service Key.');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const email = await question('Admin Email: ');
  const password = await question('Admin Password: ');

  try {
    console.log(`\nCreating user ${email}...`);
    // 1. Create User
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (userError) {
      console.error('Error creating user:', userError.message);
      process.exit(1);
    }

    const userId = userData.user.id;
    console.log(`User created (ID: ${userId}). Granting admin access...`);

    // 2. Set profiles.is_admin = true (primary source of truth)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ user_id: userId, is_admin: true }, { onConflict: 'user_id' });

    if (profileError) {
      console.error('Error setting profiles.is_admin:', profileError.message);
      process.exit(1);
    }
    console.log('Set profiles.is_admin = true.');

    // 3. Insert into public.admins (backwards compatibility)
    const { error: dbError } = await supabase.from('admins').insert({ user_id: userId });

    if (dbError) {
      // If duplicate, it's fine
      if (dbError.code === '23505') {
        console.log('User is already in admins table (OK).');
      } else {
        console.error('Error adding to admins table:', dbError.message);
        process.exit(1);
      }
    } else {
      console.log('Added to admins table (backwards compat).');
    }

    console.log('\n✅ Success! You can now log in to the Admin Panel.');
  } catch (err) {
    console.error('Unexpected error:', err);
  } finally {
    rl.close();
  }
}

main();
