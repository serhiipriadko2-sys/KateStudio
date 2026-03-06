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
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD environment variables');
  }

  console.log('Logging in to verify access...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    console.error('Login failed:', loginError.message);
    process.exit(1);
  }

  const userId = loginData.user.id;
  console.log('Login successful. User ID:', userId);

  // Check RPC
  console.log('Checking is_admin() RPC...');
  const { data: isAdminRpc, error: rpcError } = await supabase.rpc('is_admin');
  if (rpcError) {
    console.error('RPC Error:', rpcError.message);
  } else {
    console.log('is_admin() RPC result:', isAdminRpc);
    if (isAdminRpc === true) {
      console.log('✅ Success: User is recognized as admin via RPC.');
    } else {
      console.error('❌ Failure: User is NOT recognized as admin via RPC.');
    }
  }

  // Check Profiles
  console.log('Checking profiles table...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', userId)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError.message);
  } else {
    console.log('Profile record:', profile);
    if (profile?.is_admin === true) {
      console.log('✅ Success: User has is_admin=true in profiles.');
    } else {
      console.error('❌ Failure: User does NOT have is_admin=true in profiles.');
    }
  }

  // Check Admins table
  console.log('Checking admins table...');
  const { data: adminRecord, error: tableError } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (tableError) {
    console.error('Admins table fetch error (or RLS restricted):', tableError.message);
  } else {
    console.log('Admin table record:', adminRecord);
    if (adminRecord) {
      console.log('✅ Success: User found in admins table.');
    }
  }
}

main();
