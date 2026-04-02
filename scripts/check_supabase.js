import fs from 'fs';
import path from 'path';

// Helper to load env from .env file if not in process.env
const loadEnv = () => {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    console.log('📄 Loading .env file...');
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, ''); // simple quote removal
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } else {
    console.log('⚠️ No .env file found.');
  }
};

loadEnv();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Supabase credentials missing.');
  console.error(
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or environment variables.'
  );
  process.exit(1);
}

console.log(`🔌 Checking connection to ${url}...`);

try {
  // Using REST API root as a health check
  const response = await fetch(`${url}/rest/v1/`, {
    method: 'GET',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (response.ok) {
    console.log('✅ Connection successful! HTTP', response.status);
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } else {
    console.error(`❌ Connection failed: ${response.status} ${response.statusText}`);
    const text = await response.text();
    console.error('Body:', text);
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Connection error:', error.message);
  if (error.cause) console.error('Cause:', error.cause);
  process.exit(1);
}
