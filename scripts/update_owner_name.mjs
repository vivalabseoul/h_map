import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials. Make sure to run with --env-file=.env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateOwnerName() {
  console.log("Updating owner names to 'ArtFlowMap'...");
  const { data, error } = await supabase
    .from('workshops')
    .update({ owner_name: 'ArtFlowMap' })
    .neq('owner_name', 'ArtFlowMap')
    .select('id');

  if (error) {
    console.error("Failed to update owner names:", error);
    return;
  }
  
  console.log(`Successfully updated ${data ? data.length : 0} workshops to have owner_name 'ArtFlowMap'!`);
}

updateOwnerName().catch(console.error);
