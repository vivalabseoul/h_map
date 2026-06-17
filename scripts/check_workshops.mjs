import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data, error, count } = await supabase.from('workshops').select('*', { count: 'exact' });
  if (error) {
    console.error("Error fetching workshops:", error);
  } else {
    console.log(`Total workshops in DB: ${count}`);
    console.log(`First 3 workshops:`, data.slice(0, 3).map(w => w.name.ko || w.name.en));
  }
}

check();
