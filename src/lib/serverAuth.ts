// ==========================================
// Server-side auth helpers for Route Handlers
// Verifies the caller's Supabase JWT and looks up their role.
// ==========================================
import { createClient } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

export interface AuthedCaller {
  id: string;
  role: UserRole;
}

/**
 * Returns the caller (id + role) when the request carries a valid
 * `Authorization: Bearer <access_token>` header and the account is not disabled.
 * Returns null otherwise.
 */
export async function getCaller(request: Request): Promise<AuthedCaller | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const header = request.headers.get('authorization');
  if (!url || !anonKey || !header?.startsWith('Bearer ')) return null;

  const token = header.slice('Bearer '.length);
  // A client carrying the caller's token, so the role lookup below goes through RLS as that user.
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: { user }, error } = await client.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await client
    .from('users')
    .select('role, disabled')
    .eq('id', user.id)
    .single();
  if (!profile || profile.disabled) return null;

  return { id: user.id, role: profile.role as UserRole };
}

const ADMIN_ROLES: UserRole[] = ['super_admin', 'manager'];
export const isAdminRole = (role: UserRole) => ADMIN_ROLES.includes(role);

// ------------------------------------------
// Tiny in-memory rate limiter (per server instance — a safety net, not a hard guarantee)
// ------------------------------------------
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}
