import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split('\n');
let url = '', key = '';
for(let line of lines) {
  if(line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if(line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}
const supabase = createClient(url, key);
supabase.from('role_requests').select('*').then(res => {
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
});
