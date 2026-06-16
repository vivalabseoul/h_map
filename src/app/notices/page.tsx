'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getNotices } from '@/lib/database';
import type { Notice } from '@/types';
import { Megaphone, Calendar } from 'lucide-react';
import styles from './page.module.css';

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getNotices();
      setNotices(data);
      setIsLoading(false);
    }
    load();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Megaphone size={32} className={styles.headerIcon} />
        <h1>공지사항</h1>
        <p>새로운 소식과 안내를 확인하세요.</p>
      </div>

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : notices.length === 0 ? (
          <div className={styles.empty}>등록된 공지사항이 없습니다.</div>
        ) : (
          <div className={styles.list}>
            {notices.map((notice) => (
              <div key={notice.id} className={`${styles.card} ${notice.isMain ? styles.mainCard : ''}`}>
                <div className={styles.cardHeader}>
                  {notice.isMain && <span className={styles.mainBadge}>중요</span>}
                  <h2 className={styles.title}>{notice.title}</h2>
                </div>
                <div className={styles.meta}>
                  <Calendar size={14} />
                  <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                  <span className={styles.author}>by {notice.authorName || '관리자'}</span>
                </div>
                <div className={styles.body}>
                  {notice.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
