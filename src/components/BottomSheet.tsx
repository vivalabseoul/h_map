'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  allWorkshops?: Workshop[];
  onWorkshopClick?: (w: Workshop) => void;
  onClose: () => void;
}

export default function BottomSheet({ workshop, allWorkshops, onWorkshopClick, onClose }: BottomSheetProps) {
  const { locale, t } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructor, setInstructor] = useState<AppUser | null>(null);

  useEffect(() => {
    getCoursesByWorkshop(workshop.id).then(setCourses);
    getUserProfile(workshop.ownerId).then(setInstructor);
  }, [workshop.id, workshop.ownerId]);

  const similarWorkshops = useMemo(() => {
    if (!allWorkshops || allWorkshops.length === 0) return [];
    
    // Calculate score for each workshop
    const scored = allWorkshops
      .filter((w) => w.id !== workshop.id && w.status === 'active')
      .map((w) => {
        let score = 0;
        if (w.category === workshop.category) score += 2;
        w.tags.forEach(tag => {
          if (workshop.tags.includes(tag)) score += 1;
        });
        if (w.region === workshop.region) score += 0.5;
        return { workshop: w, score };
      });
      
    // Sort by score and take top 3
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.workshop);
  }, [allWorkshops, workshop]);

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              {workshop.images.map((img, idx) => (
                <div key={idx} style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <img 
                    src={img} 
                    alt={`${workshop.name.ko || workshop.name.en} - image ${idx + 1}`} 
                    style={{ width: '100%', height: 'auto', display: 'block' }} 
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
              <span>{typeof workshop.address === 'string' ? workshop.address : workshop.address?.[locale] || workshop.address?.ko || ''}</span>
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

          {/* Similar Workshops Recommendation */}
          {similarWorkshops.length > 0 && (
            <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
              <h3 className={styles.sectionTitle}>{t('workshop.similar') || '추천 연관 공방 (Similar Workshops)'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                {similarWorkshops.map((sim) => (
                  <div 
                    key={sim.id}
                    onClick={() => {
                      if (onWorkshopClick) onWorkshopClick(sim);
                    }}
                    style={{
                      display: 'flex',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      background: 'var(--color-bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                      transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}
                  >
                    <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-sm)', background: '#e0e0e0', flexShrink: 0, overflow: 'hidden' }}>
                      {sim.images && sim.images[0] ? (
                        <img src={sim.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>🎨</div>
                      )}
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <h4 style={{ fontSize: 'var(--font-size-sm)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--color-text-primary)' }}>
                        {sim.name[locale] || sim.name.ko || sim.name.en}
                      </h4>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {sim.description[locale] || sim.description.ko || sim.description.en}
                      </p>
                      <div style={{ fontSize: '10px', color: 'var(--color-accent)', fontWeight: 500 }}>
                        {sim.tags.slice(0, 3).map(t => `#${t}`).join(' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
