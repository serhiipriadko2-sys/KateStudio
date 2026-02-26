/* eslint-disable */
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const email = 'serhiipriadko2@gmail.com';
  const password = '54294pix';

  console.log('Attempting to sign up user...');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    console.error('Signup error:', error.message);
    if (error.message.includes('already registered')) {
      console.log('User already exists (likely recreated). Try login.');
    }
  } else {
    console.log('Signup successful:', data.user?.id);
  }

  // Now login to get session
  console.log('Logging in...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    console.error('Login failed:', loginError.message);
    process.exit(1);
  }

  const userId = loginData.user.id;
  console.log('Logged in successfully. User ID:', userId);

  // We need to ensure the user is an admin in the database.
  // The script can't do this directly with anon key unless policies allow it (which they shouldn't).
  // So we will output the SQL command to run, OR we rely on the previous SQL steps if they worked.
  // BUT we just deleted the user. So the new user has a NEW ID.
  // The SQL step must be run AFTER this script creates the user.
  // OR, better: this script just creates the user, and I run SQL tool next to grant admin.

  console.log(`\n\nREQUIRED ACTION: Run SQL to grant admin to User ID: ${userId}\n\n`);
}

main();
