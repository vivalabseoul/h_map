'use client';

import React, { useEffect, useState } from 'react';
import Link from '@/components/LocalizedLink';
import { Megaphone, X } from 'lucide-react';
import { getMainNotice } from '@/lib/database';
import type { Notice } from '@/types';
import styles from './NoticePopup.module.css';

export default function NoticePopup() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    async function fetchNotice() {
      const mainNotice = await getMainNotice();
      if (mainNotice && mainNotice.isActive) {
        // Check sessionStorage
        const closedId = sessionStorage.getItem('closed_notice_id');
        if (closedId !== mainNotice.id) {
          setNotice(mainNotice);
          // Small delay for smooth entrance animation
          setTimeout(() => setIsVisible(true), 100);
        }
      }
    }
    fetchNotice();
  }, []);

  if (!notice && !isVisible) return null;

  const handleClose = () => {
    setIsClosing(true);
    if (notice) {
      sessionStorage.setItem('closed_notice_id', notice.id);
    }
    setTimeout(() => {
      setIsVisible(false);
    }, 300); // match animation duration
  };

  if (!isVisible && !isClosing) return null;

  return (
    <>
      <div className={`${styles.overlay} ${isClosing ? styles.fadeOut : ''}`} onClick={handleClose} />
      <div className={`${styles.toast} ${isClosing ? styles.slideLeftOut : ''}`}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Megaphone size={20} color="#ffb74d" />
            <span className={styles.headerTitle}>Notice</span>
          </div>
          <button className={styles.closeButton} onClick={handleClose} aria-label="Close Notice">
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <h3 className={styles.title}>{notice?.title}</h3>
          <p className={styles.description}>{notice?.content}</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.hideButton} onClick={handleClose}>
            닫기
          </button>
          <Link href="/notices" className={styles.linkButton} onClick={handleClose}>
            자세히 보기
          </Link>
        </div>
      </div>
    </>
  );
}
