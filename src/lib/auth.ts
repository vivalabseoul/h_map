// ==========================================
// Auth Helpers — Supabase
// ==========================================
import { supabase, isSupabaseConfigured } from './supabase';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '@/types';

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
export async function registerWithEmail(
  email: string, 
  password: string, 
  displayName: string,
  requestedRole: UserRole = 'member',
  businessCardFile?: File | null
): Promise<User | null> {
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
      // Create user as 'member' initially
      await ensureUserDocument(data.user, 'member');

      // If they requested a special role, handle upload and request
      if (requestedRole !== 'member') {
        let businessCardUrl = '';
        if (businessCardFile) {
          const fileExt = businessCardFile.name.split('.').pop();
          const fileName = `${data.user.id}_${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('business_cards')
            .upload(fileName, businessCardFile);
          
          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('business_cards')
              .getPublicUrl(fileName);
            businessCardUrl = publicUrlData.publicUrl;
          } else {
            console.error('Business card upload error:', uploadError.message);
            // Continue without business card URL - don't block registration
          }
        }

        const { error: reqError } = await supabase.from('role_requests').insert({
          user_id: data.user.id,
          requested_role: requestedRole,
          business_card_url: businessCardUrl,
          status: 'pending'
        });
        
        if (reqError) {
          console.error('Error inserting role request:', reqError.message, reqError.code, reqError.hint, reqError.details);
          alert(`등급 승인 요청 저장에 실패했습니다: ${reqError.message}`);
        } else {
          console.log('Role request inserted successfully for user:', data.user.id);
        }
      }
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

/**
 * Send password reset email
 */
export async function resetPasswordForEmail(email: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

/**
 * Update user password (used after clicking reset link)
 */
export async function updateUserPassword(password: string): Promise<void> {
  if (!supabase || !isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/**
 * Find masked emails by user display name
 */
export async function findEmailByName(name: string): Promise<string[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  
  const { data, error } = await supabase
    .from('users')
    .select('email')
    .ilike('display_name', `%${name}%`);
    
  if (error || !data) {
    console.error('Error finding email by name:', error);
    return [];
  }
  
  return data.map(u => {
    const email = u.email;
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    return `${local.substring(0, 2)}${'*'.repeat(local.length - 2)}@${domain}`;
  });
}

export { isSupabaseConfigured };
