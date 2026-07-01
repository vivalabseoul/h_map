'use client';

import React, { useEffect, useState } from 'react';
import Link from '@/components/LocalizedLink';
import { Megaphone, X } from 'lucide-react';
import { getMainNotice } from '@/lib/database';
import type { Notice } from '@/types';
import styles from './AnnouncementBanner.module.css';

export default function AnnouncementBanner() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function fetchNotice() {
      const mainNotice = await getMainNotice();
      if (mainNotice && mainNotice.isActive) {
        setNotice(mainNotice);
      }
    }
    fetchNotice();
  }, []);

  if (!notice || !isVisible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.iconWrapper}>
          <Megaphone size={16} />
        </span>
        <Link href="/notices" className={styles.link}>
          <span className={styles.title}>{notice.title}</span>
          <span className={styles.readMore}>Read More</span>
        </Link>
      </div>
      <button 
        className={styles.closeButton} 
        onClick={() => setIsVisible(false)}
        aria-label="Close Announcement"
      >
        <X size={16} />
      </button>
    </div>
  );
}
