'use client';
import React, { useState, useCallback } from 'react';
import { Clock, DollarSign, Users, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { createBooking, createNotification } from '@/lib/database';
import type { Course } from '@/types';
import BookingModal from './BookingModal';
import styles from './CourseCard.module.css';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { locale, t } = useLanguage();
  const { user, userRole } = useAuth();
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const canApply = user && (userRole === 'member' || userRole === 'super_admin' || userRole === 'manager');
  const isOpen = course.status === 'open';

  const handleApplyClick = () => {
    if (!user || !canApply || applying) return;
    setShowModal(true);
  };

  const handleConfirmBooking = async (selectedDate: string, selectedTime: string, participants: number, phone: string, name: string) => {
    if (!user) return;
    setShowModal(false);
    setApplying(true);
    try {
      const status = course.autoApprove ? 'confirmed' : 'pending';
      await createBooking(course.id, user.id, name, selectedDate, selectedTime, participants, phone, status);
      setApplied(true);
      
      if (status === 'pending') {
        await createNotification(
          course.instructorId,
          'New Booking Request (새로운 예약 신청)',
          `${name} has requested a booking for ${course.title['en'] || 'the class'}. Pending approval.\n${name}님이 ${course.title[locale] || '클래스'} 예약을 신청했습니다. 승인 대기 중입니다.`,
          '/instructor/bookings'
        );
        alert('Your booking application is complete. Please wait for the creator\'s approval.\n예약 신청이 완료되었습니다. 크리에이터의 승인을 기다려주세요.');
      } else {
        alert('Your booking application is complete!\n예약 신청이 완료되었습니다!');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('An error occurred during booking.\n예약 중 오류가 발생했습니다.');
    } finally {
      setApplying(false);
    }
  };

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
          타임당 {course.maxParticipants}명
        </div>
        <div className={styles.infoItem}>
          <Calendar size={14} className={styles.infoIcon} />
          {course.startDate.split('T')[0]} {course.endDate ? `~ ${course.endDate.split('T')[0]}` : ''}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <span className={`${styles.spots}`}>
          최대 정원: {course.maxParticipants}명
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
            className={`${styles.applyBtn} ${!isOpen ? styles.fullBtn : ''}`}
            onClick={handleApplyClick}
            disabled={!isOpen || !canApply || applying}
          >
            {applying ? '...' : !isOpen ? '마감됨' : t('workshop.apply')}
          </button>
        )}
      </div>

      {showModal && (
        <BookingModal 
          course={course} 
          onClose={() => setShowModal(false)} 
          onConfirm={handleConfirmBooking} 
        />
      )}
    </div>
  );
}
