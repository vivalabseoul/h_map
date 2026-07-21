'use client';

import React from 'react';
import Link from '@/components/LocalizedLink';
import { useLocalizedRouter } from '@/context/LanguageContext';
import { ArrowLeft, Compass, Shield, FileText, Info } from 'lucide-react';

interface SubPageLayoutProps {
  title: string;
  subtitle?: string;
  categoryBadge?: string;
  icon?: 'about' | 'terms' | 'privacy' | 'default';
  children: React.ReactNode;
}

export default function SubPageLayout({
  title,
  subtitle,
  categoryBadge = 'Art flow map',
  icon = 'default',
  children,
}: SubPageLayoutProps) {
  const router = useLocalizedRouter();

  const getIcon = () => {
    switch (icon) {
      case 'about':
        return <Compass size={24} style={{ color: 'var(--color-accent)' }} />;
      case 'terms':
        return <FileText size={24} style={{ color: 'var(--color-accent)' }} />;
      case 'privacy':
        return <Shield size={24} style={{ color: 'var(--color-accent)' }} />;
      default:
        return <Info size={24} style={{ color: 'var(--color-accent)' }} />;
    }
  };

  return (
    <main style={{ minHeight: 'calc(100vh - var(--header-height))', backgroundColor: 'var(--color-bg)', padding: '24px 16px 48px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Navigation Bar */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'var(--color-bg-alt)',
              padding: '8px 14px',
              borderRadius: 'var(--radius-full)',
              color: 'var(--color-text-primary)',
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <ArrowLeft size={16} />
            <span>이전으로</span>
          </button>
          
          <Link
            href="/"
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              fontWeight: 600,
            }}
          >
            Art flow map
          </Link>
        </div>

        {/* Hero Card */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 24px',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-bg-alt)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getIcon()}
            </div>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--color-accent)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {categoryBadge}
              </span>
              <h1
                style={{
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: '2px 0 0 0',
                  lineHeight: '1.3',
                }}
              >
                {title}
              </h1>
            </div>
          </div>
          
          {subtitle && (
            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--color-text-secondary)',
                margin: '8px 0 0 0',
                lineHeight: '1.6',
              }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Content Body */}
        <div
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 24px',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.8',
            fontSize: '0.95rem',
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
