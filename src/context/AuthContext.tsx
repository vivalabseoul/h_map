'use client';
// ==========================================
// Auth Context — Provides auth + role state
// ==========================================
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { onAuthChange, getUserRole, signInWithGoogle, signInWithEmail, registerWithEmail, signOutUser, resetPasswordForEmail, updateUserPassword, findEmailByName } from '@/lib/auth';
import type { AppUser, UserRole } from '@/types';

interface AuthContextValue {
  user: AppUser | null;
  userRole: UserRole | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: UserRole, file?: File | null) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  findEmail: (name: string) => Promise<string[]>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userRole: null,
  loading: true,
  signInGoogle: async () => {},
  signInEmail: async () => {},
  register: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  updatePassword: async () => {},
  findEmail: async () => [],
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { unsubscribe } = onAuthChange(async (supabaseUser) => {
      if (supabaseUser) {
        // We import getUserProfile below
        const { getUserProfile } = await import('@/lib/database');
        const profile = await getUserProfile(supabaseUser.id);
        if (profile) {
          setUser(profile);
          setUserRole(profile.role);
        } else {
          setUser({
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            displayName: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || '',
            photoURL: supabaseUser.user_metadata?.avatar_url || '',
            role: 'member',
            createdAt: new Date().toISOString(),
            preferredLocale: 'ko',
          });
          const role = await getUserRole(supabaseUser.id);
          setUserRole(role);
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInGoogle = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signInEmailFn = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const registerFn = useCallback(async (email: string, password: string, name: string, role?: UserRole, file?: File | null) => {
    await registerWithEmail(email, password, name, role, file);
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setUserRole(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await resetPasswordForEmail(email);
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    await updateUserPassword(password);
  }, []);

  const findEmail = useCallback(async (name: string) => {
    return await findEmailByName(name);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        signInGoogle: signInGoogle,
        signInEmail: signInEmailFn,
        register: registerFn,
        logout,
        resetPassword,
        updatePassword,
        findEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
