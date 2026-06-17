import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function deleteAllWorkshops() {
  console.log("Fetching all workshops to delete...");
  const { data: workshops, error: fetchError } = await supabase
    .from('workshops')
    .select('id');

  if (fetchError) {
    console.error("Error fetching workshops:", fetchError);
    return;
  }

  if (!workshops || workshops.length === 0) {
    console.log("No workshops found. Database is already empty.");
    return;
  }

  const ids = workshops.map(w => w.id);
  console.log(`Deleting all ${ids.length} workshops...`);

  // Supabase delete with in() is limited to 1000 items usually, but we have ~10.
  const { error: deleteError } = await supabase
    .from('workshops')
    .delete()
    .in('id', ids);

  if (deleteError) {
    console.error("Error deleting workshops:", deleteError);
  } else {
    console.log("Successfully deleted ALL workshops. The database is now empty.");
  }
}

deleteAllWorkshops();
