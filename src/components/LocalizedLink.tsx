'use client';
import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import type { Locale } from '@/types';

type LocalizedLinkProps = React.ComponentProps<typeof Link>;

export default function LocalizedLink({ href, onClick, ...props }: LocalizedLinkProps) {
  const { locale } = useLanguage();

  let localizedHref = href;
  if (typeof href === 'string' && href.startsWith('/')) {
    const segments = href.split('/');
    const locales = ['ko', 'en', 'ja', 'zh'];
    if (!locales.includes(segments[1])) {
      localizedHref = `/${locale || 'ko'}${href === '/' ? '' : href}`;
    }
  }

  const hrefStr = typeof localizedHref === 'string' ? localizedHref : String(localizedHref || '/');
  const { passHref, legacyBehavior, prefetch, replace, scroll, shallow, locale: linkLocale, ...anchorProps } = props as any;

  return (
    <a
      href={hrefStr}
      onClick={(e) => {
        // Prevent Next.js from intercepting this anchor link
        e.preventDefault();
        if (onClick) onClick(e);
        // Force a hard browser navigation to avoid dev server hanging
        window.location.href = hrefStr;
      }}
      {...anchorProps}
    />
  );
}
