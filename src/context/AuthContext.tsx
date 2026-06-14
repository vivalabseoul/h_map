'use client';
// ==========================================
// Auth Context — Provides auth + role state
// ==========================================
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange, getUserRole, signInWithGoogle, signInWithEmail, registerWithEmail, signOutUser } from '@/lib/auth';
import type { UserRole } from '@/types';

interface AuthContextValue {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  signInGoogle: () => Promise<void>;
  signInEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  userRole: null,
  loading: true,
  signInGoogle: async () => {},
  signInEmail: async () => {},
  register: async () => {},
  logout: async () => {},
  loginAsDemo: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const role = await getUserRole(firebaseUser.uid);
        setUserRole(role);
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInGoogle = useCallback(async () => {
    await signInWithGoogle();
  }, []);

  const signInEmailFn = useCallback(async (email: string, password: string) => {
    await signInWithEmail(email, password);
  }, []);

  const registerFn = useCallback(async (email: string, password: string, name: string) => {
    await registerWithEmail(email, password, name);
  }, []);

  const logout = useCallback(async () => {
    await signOutUser();
    setUser(null);
    setUserRole(null);
  }, []);

  const loginAsDemo = useCallback((role: UserRole) => {
    const fakeUser = {
      uid: role === 'instructor' ? 'demo-instructor-1' : `demo_${role}_123`,
      email: `demo_${role}@example.com`,
      displayName: role === 'super_admin' ? '슈퍼관리자' : role === 'instructor' ? '강사' : '일반회원',
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${role}`,
    } as any;
    setUser(fakeUser);
    setUserRole(role);
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
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
