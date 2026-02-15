import { createClient } from '@supabase/supabase-js';
import { createInterface } from 'readline';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

    // 2. Insert into public.admins
    const { error: dbError } = await supabase.from('admins').insert({ user_id: userId });

    if (dbError) {
      // If duplicate, it's fine
      if (dbError.code === '23505') {
        console.log('User is already an admin.');
      } else {
        console.error('Error adding to admins table:', dbError.message);
        process.exit(1);
      }
    } else {
      console.log('Successfully added to admins table.');
    }

    console.log('\n✅ Success! You can now log in to the Admin Panel.');
  } catch (err) {
    console.error('Unexpected error:', err);
  } finally {
    rl.close();
  }
}

main();
