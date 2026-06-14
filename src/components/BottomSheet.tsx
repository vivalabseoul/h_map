'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { X, Navigation, Share2, MapPin, Phone, Globe, Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES } from '@/types';
import type { Workshop, Course, AppUser } from '@/types';
import { getCoursesByWorkshop, getUserProfile } from '@/lib/database';
import CourseCard from './CourseCard';
import ReviewSection from './ReviewSection';
import styles from './BottomSheet.module.css';

interface BottomSheetProps {
  workshop: Workshop;
  onClose: () => void;
}

export default function BottomSheet({ workshop, onClose }: BottomSheetProps) {
  const { locale, t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructor, setInstructor] = useState<AppUser | null>(null);

  useEffect(() => {
    getCoursesByWorkshop(workshop.id).then(setCourses);
    getUserProfile(workshop.ownerId).then(setInstructor);
  }, [workshop.id, workshop.ownerId]);

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleNavigate = useCallback(() => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${workshop.lat},${workshop.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [workshop.lat, workshop.lng]);

  const handleNavigateNaver = useCallback(() => {
    const name = encodeURIComponent(workshop.name[locale] || '');
    const url = `https://map.naver.com/p/directions/-/${workshop.lng},${workshop.lat},${name}/-/transit`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [workshop.lat, workshop.lng, workshop.name, locale]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: workshop.name[locale],
          text: workshop.description[locale],
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    }
  }, [workshop, locale]);

  const catMeta = CATEGORIES.find((c) => c.key === workshop.category);
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < Math.floor(rating) ? '#e6a23c' : 'none'}
        stroke={i < Math.floor(rating) ? '#e6a23c' : '#e8e0d8'}
      />
    ));
  };

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.sheet} id="bottom-sheet" role="dialog" aria-modal="true">
        <div className={styles.handle}>
          <div className={styles.handleBar} />
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Image Carousel (Only show if images exist) */}
          {workshop.images && workshop.images.length > 0 && (
            <div className={styles.imageCarousel}>
              {workshop.images.map((img, idx) => (
                <div key={idx} className={styles.workshopImage} style={{ padding: 0 }}>
                  <img 
                    src={img} 
                    alt={`${workshop.name.ko || workshop.name.en} - image ${idx + 1}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>
              ))}
            </div>
          )}

          {/* Header */}
          <div className={styles.workshopHeader}>
            <h2 className={styles.workshopName}>{workshop.name[locale]}</h2>
          </div>

          {/* Rating & Category */}
          <div className={styles.ratingRow}>
            <div className={styles.rating}>
              <span className={styles.stars}>{renderStars(workshop.rating)}</span>
              <span>{workshop.rating}</span>
            </div>
            <span className={styles.reviewCount}>
              ({workshop.reviewCount} {t('workshop.reviews')})
            </span>
            <span
              className={styles.categoryBadge}
              style={{
                background: `${catMeta?.color}20`,
                color: catMeta?.color,
              }}
            >
              {catMeta?.emoji} {t(`filters.${workshop.category}`)}
            </span>
          </div>

          {/* Instructor Profile */}
          {instructor && (
            <div className={styles.instructorProfile}>
              <div className={styles.instructorAvatar}>
                {instructor.photoURL ? (
                  <img src={instructor.photoURL} alt={instructor.displayName} />
                ) : (
                  <div className={styles.avatarPlaceholder}>👤</div>
                )}
              </div>
              <div className={styles.instructorInfo}>
                <div className={styles.instructorName}>{instructor.displayName}</div>
                {instructor.bio && <div className={styles.instructorBio}>{instructor.bio}</div>}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className={styles.tags}>
            {workshop.tags.map((tag) => (
              <span key={tag} className={styles.tag}>
                #{t(`filters.${tag}`)}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className={styles.description}>{workshop.description[locale]}</p>

          {/* Info Grid */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <MapPin size={16} className={styles.infoIcon} />
              <span>{workshop.address[locale]}</span>
            </div>
            <div className={styles.infoItem}>
              <Phone size={16} className={styles.infoIcon} />
              <span>{workshop.phone}</span>
            </div>
            {workshop.website && (
              <div className={styles.infoItem}>
                <Globe size={16} className={styles.infoIcon} />
                <a href={workshop.website} target="_blank" rel="noopener noreferrer">
                  Website
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={styles.actions}>
            {workshop.region === 'korea' ? (
              <>
                <button className={styles.navigateBtn} style={{ background: '#03c75a', color: '#fff' }} onClick={handleNavigateNaver}>
                  <Navigation size={18} />
                  Naver Map
                </button>
                <button className={styles.navigateBtn} onClick={handleNavigate}>
                  <Navigation size={18} />
                  Google Map
                </button>
              </>
            ) : (
              <button className={styles.navigateBtn} onClick={handleNavigate}>
                <Navigation size={18} />
                {t('workshop.navigate')}
              </button>
            )}
            <button className={styles.shareBtn} onClick={handleShare} aria-label="Share">
              <Share2 size={18} />
            </button>
          </div>

          {/* Courses */}
          {courses.length > 0 && (
            <>
              <h3 className={styles.sectionTitle}>{t('workshop.courses')}</h3>
              <div className={styles.courseList}>
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </>
          )}

          {/* Reviews */}
          <ReviewSection workshopId={workshop.id} />
        </div>
      </div>
    </>
  );
}
