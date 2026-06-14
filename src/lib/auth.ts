// ==========================================
// Auth Helpers — Supabase
// ==========================================
import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { AppUser, UserRole } from '@/types';

/**
 * Create or update the user document in public.users
 */
async function ensureUserDocument(user: User, role: UserRole = 'member'): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  
  // Check if user exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!existingUser) {
    const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || '';
    const photoURL = user.user_metadata?.avatar_url || '';
    
    await supabase.from('users').insert({
      id: user.id,
      email: user.email || '',
      display_name: displayName,
      photo_url: photoURL,
      role,
      preferred_locale: 'ko',
      disabled: false,
    });
  }
}

/**
 * Fetch user role
 */
export async function getUserRole(id: string): Promise<UserRole> {
  if (!supabase || !isSupabaseConfigured) return 'member';
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .single();
      
    if (data && !error) {
      return data.role as UserRole;
    }
  } catch (error) {
    console.warn('Error fetching user role:', error);
  }
  return 'member';
}

/**
 * Fetch full user profile
 */
export async function getUserProfile(id: string): Promise<AppUser | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
      
    if (data && !error) {
      // Map snake_case to camelCase
      return {
        id: data.id,
        email: data.email,
        displayName: data.display_name,
        photoURL: data.photo_url,
        role: data.role,
        createdAt: data.created_at,
        preferredLocale: data.preferred_locale,
        bio: data.bio,
        disabled: data.disabled
      } as AppUser;
    }
  } catch (error) {
    console.warn('Error fetching user profile:', error);
  }
  return null;
}

/**
 * Google Sign-In
 */
export async function signInWithGoogle(): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    alert('Supabase is not configured. Please set up your .env.local file.');
    return;
  }
  try {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

/**
 * Email/Password Sign-In
 */
export async function signInWithEmail(email: string, password: string): Promise<User | null> {
  if (!supabase || !isSupabaseConfigured) {
    alert('Supabase is not configured.');
    return null;
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
}

/**
 * Email/Password Registration
 */
export async function registerWithEmail(email: string, password: string, displayName: string): Promise<User | null> {
  if (!supabase || !isSupabaseConfigured) {
    alert('Supabase is not configured.');
    return null;
  }
  try {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: displayName,
        }
      }
    });
    if (error) throw error;
    if (data.user) {
      await ensureUserDocument(data.user, 'member');
    }
    return data.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Sign Out
 */
export async function signOutUser(): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

/**
 * Auth state listener
 */
export function onAuthChange(callback: (user: User | null) => void): { unsubscribe: () => void } {
  if (!supabase) {
    callback(null);
    return { unsubscribe: () => {} };
  }
  
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    callback(session?.user || null);
    if (session?.user) {
      ensureUserDocument(session.user);
    }
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    callback(session?.user || null);
    if (session?.user) {
      ensureUserDocument(session.user);
    }
  });
  
  return { unsubscribe: () => subscription.unsubscribe() };
}

export { isSupabaseConfigured };
