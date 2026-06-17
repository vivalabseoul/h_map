import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Course, Workshop } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getWorkshopById } from '@/lib/database';
import { MapPin, Calendar, Clock, DollarSign, Users, X } from 'lucide-react';

interface CourseDetailModalProps {
  course: Course;
  onClose: () => void;
}

export default function CourseDetailModal({ course, onClose }: CourseDetailModalProps) {
  const { t, locale } = useLanguage();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const isOpen = course.status === 'open';

  React.useEffect(() => {
    if (course.workshopId) {
      getWorkshopById(course.workshopId).then(setWorkshop);
    }
  }, [course.workshopId]);

  const daysLabel: Record<string, string[]> = {
    ko: ['일', '월', '화', '수', '목', '금', '토'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    ja: ['日', '月', '火', '水', '木', '金', '土'],
    zh: ['日', '一', '二', '三', '四', '五', '六']
  };
  const getDays = () => daysLabel[locale] || daysLabel.en;

  const handleBookClick = () => {
    if (course.externalLink) {
      window.open(course.externalLink, '_blank');
    } else {
      alert(locale === 'ko' ? '예약은 공방 홈페이지나 연락처로 직접 문의해주세요.' : 'Please contact the studio directly to book.');
    }
  };

  const getParsedDescription = () => {
    if (!course.description) return null;
    if (typeof course.description === 'string') {
      try {
        return JSON.parse(course.description);
      } catch (e) {
        return { _isRawString: true, text: course.description };
      }
    }
    return course.description;
  };
  const parsedDesc = getParsedDescription();
  
  const isDescEmpty = (d: any) => {
    if (!d) return true;
    if (typeof d === 'string') return !d.trim();
    return !d.intro?.trim() && !d.curriculum?.trim() && !d.included?.trim() && !d.precautions?.trim();
  };

  let desc: any = null;
  if (parsedDesc) {
    if (parsedDesc._isRawString) {
      desc = parsedDesc.text;
    } else {
      let candidate = (parsedDesc as any)[locale];
      if (isDescEmpty(candidate)) candidate = (parsedDesc as any).ko;
      if (isDescEmpty(candidate)) candidate = (parsedDesc as any).en;
      if (isDescEmpty(candidate)) candidate = parsedDesc;
      
      if (!isDescEmpty(candidate)) {
        desc = candidate;
      }
    }
  }

  const getParsedTitle = () => {
    if (!course.title) return '';
    let parsedTitle = course.title;
    if (typeof course.title === 'string') {
      try {
        parsedTitle = JSON.parse(course.title);
      } catch (e) {
        return course.title;
      }
    }
    return (parsedTitle as any)[locale] || (parsedTitle as any).ko || (parsedTitle as any).en || t('booking.title_default');
  };
  const titleText = getParsedTitle();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div className="course-detail-overlay" onClick={onClose}>
      <div className="course-detail-content" onClick={e => e.stopPropagation()}>
        <div style={{ position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 10, padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>{locale === 'ko' ? '클래스 상세' : 'Class Details'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--color-text-secondary)' }}>
            <X size={24} />
          </button>
        </div>
        
        <div style={{ padding: 'var(--space-4)' }}>
          {course.imageUrl && (
          <div style={{
            width: '100%',
            height: '200px',
            backgroundImage: `url(${course.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)'
          }} />
        )}

        {workshop && (
          <div style={{ color: 'var(--color-accent)', fontWeight: 600, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-1)' }}>
            {workshop.name[locale] || workshop.name.ko || ''}
          </div>
        )}
        <h3 style={{ marginBottom: 'var(--space-4)', fontSize: '1.5rem' }}>
          {titleText}
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <DollarSign size={18} style={{ color: 'var(--color-text-secondary)' }} />
            <span>{course.price}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Clock size={18} style={{ color: 'var(--color-text-secondary)' }} />
            <span>{course.duration}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Users size={18} style={{ color: 'var(--color-text-secondary)' }} />
            <span>{course.maxParticipants}명 정원</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', background: 'var(--color-bg-alt)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
          <h4 style={{ marginBottom: 'var(--space-2)', fontSize: '1rem' }}>
            {locale === 'ko' ? '운영 일정 안내' : 'Operation Schedule'}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.95rem' }}>
            <Calendar size={16} style={{ color: 'var(--color-accent)' }} />
            <strong>{locale === 'ko' ? '운영 기간:' : 'Date:'}</strong> {course.startDate?.split('T')[0]} {course.endDate ? `~ ${course.endDate.split('T')[0]}` : ''}
          </div>
          {course.availableDays && course.availableDays.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.95rem' }}>
               <Clock size={16} style={{ color: 'var(--color-accent)' }} />
               <strong>{locale === 'ko' ? '운영 요일:' : 'Days:'}</strong> {course.availableDays.map(d => getDays()[d]).join(', ')}
            </div>
          )}
          {course.availableTimes && course.availableTimes.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', fontSize: '0.95rem' }}>
              <Clock size={16} style={{ color: 'var(--color-accent)' }} />
              <div>
                <strong>{locale === 'ko' ? '운영 시간:' : 'Time:'}</strong> {course.availableTimes.join(', ')}
              </div>
            </div>
          )}
        </div>

        {desc ? (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            {typeof desc === 'string' ? (
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {desc}
              </p>
            ) : (
              <>
                {desc.intro && (
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 'var(--space-4)' }}>
                    {desc.intro}
                  </p>
                )}
                
                {desc.curriculum && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <h4 style={{ marginBottom: 'var(--space-2)', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                      {locale === 'ko' ? '커리큘럼 소개' : 'Curriculum'}
                    </h4>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {desc.curriculum}
                    </p>
                  </div>
                )}

                {desc.included && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <h4 style={{ marginBottom: 'var(--space-2)', fontSize: '1.05rem', color: 'var(--color-text-primary)' }}>
                      {locale === 'ko' ? '포함 내역' : 'Included Items'}
                    </h4>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {desc.included}
                    </p>
                  </div>
                )}

                {desc.precautions && (
                  <div style={{ padding: 'var(--space-3)', background: 'rgba(255, 152, 0, 0.1)', borderRadius: 'var(--radius-md)' }}>
                    <h4 style={{ marginBottom: 'var(--space-2)', fontSize: '1.05rem', color: '#ed6c02' }}>
                      {locale === 'ko' ? '주의사항' : 'Precautions'}
                    </h4>
                    <p style={{ color: '#ed6c02', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {desc.precautions}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1, padding: 'var(--space-3)' }}>
            {locale === 'ko' ? '닫기' : 'Close'}
          </button>
          <button className="btn btn-primary" onClick={handleBookClick} disabled={!isOpen} style={{ flex: 2, padding: 'var(--space-3)' }}>
            {locale === 'ko' 
              ? (isOpen ? '예약 / 문의하기' : '마감됨')
              : (isOpen ? 'Book / Inquire' : 'Closed')}
          </button>
        </div>
        
          {course.externalLink && isOpen && (
            <div style={{ marginTop: 'var(--space-2)', textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
              * {locale === 'ko' ? '버튼 클릭 시 외부 예약 페이지(새 창)로 이동합니다.' : 'Booking button will open an external page in a new window.'}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
