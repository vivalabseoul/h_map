'use client';
import React, { useState, useCallback } from 'react';
import { Clock, DollarSign, Users, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { createBooking } from '@/lib/database';
import type { Course } from '@/types';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { locale, t } = useLanguage();
  const { user, userRole } = useAuth();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const spotsLeft = course.maxParticipants - course.currentParticipants;
  const isFull = spotsLeft <= 0;
  const canApply = user && (userRole === 'member' || userRole === 'super_admin' || userRole === 'manager');

  const handleApply = useCallback(async () => {
    if (!user || !canApply || applying) return;
    setApplying(true);
    try {
      await createBooking(course.id, user.id, user.displayName || 'User');
      setApplied(true);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setApplying(false);
    }
  }, [user, canApply, applying, course.id]);

  const statusColor = course.status === 'open'
    ? { bg: 'var(--color-success-light)', color: 'var(--color-success)' }
    : course.status === 'closed'
    ? { bg: 'var(--color-danger-light)', color: 'var(--color-danger)' }
    : { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h4 className={styles.courseTitle}>{course.title[locale]}</h4>
        <span
          className={styles.statusBadge}
          style={{ background: statusColor.bg, color: statusColor.color }}
        >
          {course.status}
        </span>
      </div>

      <div className={styles.courseInfo}>
        <div className={styles.infoItem}>
          <DollarSign size={14} className={styles.infoIcon} />
          {course.price}
        </div>
        <div className={styles.infoItem}>
          <Clock size={14} className={styles.infoIcon} />
          {course.duration}
        </div>
        <div className={styles.infoItem}>
          <Users size={14} className={styles.infoIcon} />
          {course.currentParticipants}/{course.maxParticipants}
        </div>
        <div className={styles.infoItem}>
          <Calendar size={14} className={styles.infoIcon} />
          {new Date(course.startDate).toLocaleDateString()}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={`${styles.spots} ${spotsLeft <= 2 ? styles.spotsLow : ''}`}>
          {isFull ? t('workshop.full') : `${spotsLeft} ${t('workshop.spots_left')}`}
        </span>

        {applied ? (
          <span className={styles.statusBadge} style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            ✓ Applied
          </span>
        ) : !user ? (
          <button className={styles.applyBtn} disabled>
            {t('workshop.login_to_apply')}
          </button>
        ) : (
          <button
            className={`${styles.applyBtn} ${isFull ? styles.fullBtn : ''}`}
            onClick={handleApply}
            disabled={isFull || !canApply || applying}
          >
            {applying ? '...' : isFull ? t('workshop.full') : t('workshop.apply')}
          </button>
        )}
      </div>
    </div>
  );
}
