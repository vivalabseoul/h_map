'use client';
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { Locale } from '@/types';

type LocalizedLinkProps = React.ComponentProps<typeof Link>;

export default function LocalizedLink({ href, ...props }: LocalizedLinkProps) {
  const params = useParams();
  const locale = (params?.locale as Locale) || 'en';

  // Only prefix if href starts with '/' and doesn't already have the locale
  let localizedHref = href;
  if (typeof href === 'string' && href.startsWith('/')) {
    const segments = href.split('/');
    // Support locales: ko, en, ja, zh
    const locales = ['ko', 'en', 'ja', 'zh'];
    if (!locales.includes(segments[1])) {
      localizedHref = `/${locale}${href === '/' ? '' : href}`;
    }
  }

  return <Link href={localizedHref} {...props} />;
}
