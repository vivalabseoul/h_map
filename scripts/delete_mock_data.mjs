import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanUp() {
  // Get all workshops, ordered by created_at descending (or id)
  const { data: workshops, error } = await supabase
    .from('workshops')
    .select('id')
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching workshops:", error);
    return;
  }

  console.log(`Total workshops found: ${workshops.length}`);

  if (workshops.length <= 10) {
    console.log("There are 10 or fewer workshops. Nothing to delete.");
    return;
  }

  // Keep the first 10, delete the rest
  const workshopsToKeep = workshops.slice(0, 10);
  const workshopsToDelete = workshops.slice(10);

  const idsToDelete = workshopsToDelete.map(w => w.id);
  console.log(`Deleting ${idsToDelete.length} workshops...`);

  const { error: deleteError } = await supabase
    .from('workshops')
    .delete()
    .in('id', idsToDelete);

  if (deleteError) {
    console.error("Error deleting workshops:", deleteError);
  } else {
    console.log("Successfully deleted excess workshops.");
  }
}

cleanUp();
