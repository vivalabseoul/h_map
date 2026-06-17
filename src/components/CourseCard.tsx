'use client';
import React, { useState, useCallback } from 'react';
import { Clock, DollarSign, Users, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { createBooking, createNotification } from '@/lib/database';
import { formatPrice } from '@/lib/utils';
import type { Course } from '@/types';
import CourseDetailModal from './CourseDetailModal';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  course: Course;
  region?: string;
}

export default function CourseCard({ course, region }: CourseCardProps) {
  const { locale, t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const isOpen = course.status === 'open';

  const handleViewDetails = () => {
    setShowModal(true);
  };

  const isDescEmpty = (d: any) => {
    if (!d) return true;
    if (typeof d === 'string') return !d.trim();
    return !d.intro?.trim() && !d.curriculum?.trim() && !d.included?.trim() && !d.precautions?.trim();
  };

  const getIntroText = () => {
    if (!course.description) return '';
    let parsedDesc = course.description;
    if (typeof course.description === 'string') {
      try {
        parsedDesc = JSON.parse(course.description);
      } catch (e) {
        return course.description;
      }
    }
    
    let desc = (parsedDesc as any)[locale];
    if (isDescEmpty(desc)) desc = (parsedDesc as any).ko;
    if (isDescEmpty(desc)) desc = (parsedDesc as any).en;
    if (isDescEmpty(desc)) desc = parsedDesc;
    
    if (isDescEmpty(desc)) return '';
    if (typeof desc === 'string') return desc;
    
    return desc.intro?.trim() || '';
  };
  const introText = getIntroText();

  const statusColor = course.status === 'open'
    ? { bg: 'var(--color-success-light)', color: 'var(--color-success)' }
    : course.status === 'closed'
    ? { bg: 'var(--color-danger-light)', color: 'var(--color-danger)' }
    : { bg: 'var(--color-warning-light)', color: 'var(--color-warning)' };

  return (
    <div className={styles.card}>
      {course.imageUrl ? (
        <div style={{
          width: '100%',
          height: '160px',
          backgroundImage: `url(${course.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
        }} />
      ) : (
        <div style={{
          width: '100%',
          height: '160px',
          backgroundColor: 'var(--color-bg-alt)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)'
        }}>
          No Image
        </div>
      )}
      
      <div className={styles.cardHeader} style={{ paddingTop: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h4 className={styles.courseTitle} style={{ margin: 0 }}>{course.title[locale] || course.title.ko || course.title.en}</h4>
          <span
            className={styles.statusBadge}
            style={{ background: statusColor.bg, color: statusColor.color, flexShrink: 0, marginLeft: 'var(--space-2)' }}
          >
            {course.status}
          </span>
        </div>
      </div>
      
      {introText && (
        <p style={{ 
          color: 'var(--color-text-secondary)', 
          fontSize: 'var(--font-size-sm)', 
          marginTop: '0',
          marginBottom: 'var(--space-3)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.5
        }}>
          {introText}
        </p>
      )}

      <div className={styles.courseInfo}>
        <div className={styles.infoItem}>
          <DollarSign size={14} className={styles.infoIcon} />
          {formatPrice(course.price, region)}
        </div>
        <div className={styles.infoItem}>
          <Clock size={14} className={styles.infoIcon} />
          {course.duration}
        </div>
        <div className={styles.infoItem}>
          <Users size={14} className={styles.infoIcon} />
          {course.maxParticipants} {t('booking.people')}
        </div>
        <div className={styles.infoItem}>
          <Calendar size={14} className={styles.infoIcon} />
          {course.startDate.split('T')[0]} {course.endDate ? `~ ${course.endDate.split('T')[0]}` : ''}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={`${styles.spots}`}>
          {t('workshop.spots_left').replace('spots left', '')} {course.maxParticipants}명 정원
        </span>

        <button
          className={`${styles.applyBtn}`}
          onClick={handleViewDetails}
        >
          {locale === 'ko' ? '상세보기' : 'View Details'}
        </button>
      </div>

      {showModal && (
        <CourseDetailModal 
          course={course} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}
