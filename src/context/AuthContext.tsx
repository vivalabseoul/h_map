'use client';
// ==========================================
// Auth Context — Provides auth + role state
// ==========================================
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthChange, getUserRole, signInWithGoogle, signInWithEmail, registerWithEmail, signOutUser, resetPasswordForEmail, updateUserPassword, findEmailByName } from '@/lib/auth';
import type { User } from '@supabase/supabase-js';
import type { AppUser, UserRole } from '@/types';

interface AuthContextValue {
  user: AppUser | null;
  userRole: UserRole | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<User | null>;
  register: (email: string, password: string, name: string, role?: UserRole, file?: File | null) => Promise<User | null>;
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
  signInEmail: async () => null,
  register: async () => null,
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

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setUserRole(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        loading,
        signInGoogle: signInWithGoogle,
        signInEmail: signInWithEmail,
        register: registerWithEmail,
        logout,
        resetPassword: resetPasswordForEmail,
        updatePassword: updateUserPassword,
        findEmail: findEmailByName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
