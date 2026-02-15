/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const examplePath = path.join(rootDir, '.env.example');

console.log('🔧 Setting up environment variables...');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists.');
} else {
  if (fs.existsSync(examplePath)) {
    console.log('📄 .env not found. Copying from .env.example...');
    fs.copyFileSync(examplePath, envPath);
    console.log('✅ .env created successfully.');
    console.log('\n⚠️  ACTION REQUIRED:');
    console.log('   Please open .env and fill in your Supabase credentials:');
    console.log('   - VITE_SUPABASE_URL');
    console.log('   - VITE_SUPABASE_ANON_KEY');
  } else {
    console.error('❌ .env.example not found. Cannot create .env.');
    process.exit(1);
  }
}
