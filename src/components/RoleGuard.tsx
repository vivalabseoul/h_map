'use client';
import { useLocalizedRouter } from '@/context/LanguageContext';
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
  const router = useLocalizedRouter();

  const isDev = process.env.NODE_ENV === 'development';
  const allowedRolesKey = allowedRoles.join(',');

  React.useEffect(() => {
    if (!loading && !isDev) {
      if (!user) {
        router.push(fallbackPath);
      } else if (userRole && !allowedRoles.includes(userRole)) {
        router.push('/');
      }
    }
  }, [loading, user, userRole, allowedRolesKey, fallbackPath, router, isDev]);

  if (loading && !isDev) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg)',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text-muted)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isDev && (!user || (userRole && !allowedRoles.includes(userRole)))) {
    return null;
  }

  return <>{children}</>;
}
