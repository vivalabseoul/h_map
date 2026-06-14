'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export default function RoleGuard({
  children,
  allowedRoles,
  fallbackPath = '/login',
}: RoleGuardProps) {
  const { user, userRole, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-muted)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>🧶</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push(fallbackPath);
    return null;
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    router.push('/');
    return null;
  }

  return <>{children}</>;
}
