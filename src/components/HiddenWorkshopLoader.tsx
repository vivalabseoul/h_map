'use client';
import React, { useEffect, useState } from 'react';
import Link from '@/components/LocalizedLink';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getWorkshopBySlug } from '@/lib/database';
import type { Workshop } from '@/types';
import WorkshopDetailClient from './WorkshopDetailClient';

/**
 * Private or unapproved workshops are invisible to the server render (anonymous),
 * so the page falls back to loading them in the browser with the visitor's own session.
 * RLS decides: only the owner and admins get a row back.
 */
export default function HiddenWorkshopLoader({ slug }: { slug: string }) {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    if (!user) {
      setDone(true);
      return;
    }
    getWorkshopBySlug(slug).then((w) => {
      if (cancelled) return;
      setWorkshop(w);
      setDone(true);
    });
    return () => { cancelled = true; };
  }, [slug, user, loading]);

  if (workshop) return <WorkshopDetailClient workshop={workshop} />;

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px', textAlign: 'center' }}>
      {!done ? (
        <p style={{ color: 'var(--color-text-muted)' }}>{t('common.loading')}</p>
      ) : (
        <>
          <h2>{t('common.private_workshop_title')}</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>{t('common.private_workshop_desc')}</p>
          <Link href="/" className="btn btn-primary">{t('nav.home')}</Link>
        </>
      )}
    </div>
  );
}
