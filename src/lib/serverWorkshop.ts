// Server-only helper: tells whether a workshop exists but is hidden from anonymous readers (private / not active).
// Uses the service role key so it can see rows RLS hides, and returns ONLY a boolean — no data leaks.
import 'server-only';
import { createClient } from '@supabase/supabase-js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function isHiddenWorkshop(slugOrId: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return false;

  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const column = UUID_RE.test(slugOrId) ? 'id' : 'slug';
  const { data } = await admin.from('workshops').select('id').eq(column, slugOrId).maybeSingle();
  return Boolean(data);
}
