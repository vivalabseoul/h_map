'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { recordPageView } from '@/lib/database';

// Workshop detail pages record their own view (with workshop_id) in WorkshopDetailClient,
// so they're skipped here to avoid double-counting site-wide PV.
const WORKSHOP_DETAIL_PATTERN = /^\/(ko|en|ja|zh)\/workshops\/.+/;

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;
    if (WORKSHOP_DETAIL_PATTERN.test(pathname)) return;
    recordPageView(pathname);
  }, [pathname]);

  return null;
}
