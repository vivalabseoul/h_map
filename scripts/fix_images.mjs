import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials. Make sure to run with --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const validImage = 'https://fjwyzhvuskciecqlmcep.supabase.co/storage/v1/object/public/images/workshops/1781496390118_5s1krgm.jpg';

async function fixImages() {
  const { data, error } = await supabase.from('workshops').select('id, images');
  if (error) return console.error(error);
  
  let updatedCount = 0;
  for (const w of data) {
    if (w.images && w.images.length > 0 && w.images[0].includes('unsplash.com')) {
      await supabase.from('workshops').update({ images: [validImage] }).eq('id', w.id);
      updatedCount++;
    }
  }
  console.log(`Updated ${updatedCount} workshops with broken Unsplash links.`);
}

fixImages().catch(console.error);
