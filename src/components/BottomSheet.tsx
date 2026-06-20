'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { X, Navigation, Share2, MapPin, Phone, Globe, Star, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES } from '@/types';
import { getDynamicCategories } from '@/lib/categoryUtils';
import type { Workshop, Course, AppUser } from '@/types';
import { getCoursesByWorkshop, getUserProfile, getWorkshopById, incrementWorkshopLinkClick } from '@/lib/database';
import CourseCard from './CourseCard';
import ReviewSection from './ReviewSection';
import Sheet from './Sheet';
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

  const [currentRating, setCurrentRating] = useState(workshop.rating);
  const [currentReviewCount, setCurrentReviewCount] = useState(workshop.reviewCount);

  useEffect(() => {
    getCoursesByWorkshop(workshop.id).then(setCourses);
    getUserProfile(workshop.ownerId).then(setInstructor);
    setCurrentRating(workshop.rating);
    setCurrentReviewCount(workshop.reviewCount);
  }, [workshop]);

  const handleReviewAdded = useCallback(async () => {
    const updated = await getWorkshopById(workshop.id);
    if (updated) {
      setCurrentRating(updated.rating);
      setCurrentReviewCount(updated.reviewCount);
    }
  }, [workshop.id]);

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

  // Close on escape is handled by Sheet component

  const handleNavigate = useCallback(() => {
    incrementWorkshopLinkClick(workshop.id, 'nav').catch(console.error);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${workshop.lat},${workshop.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [workshop.lat, workshop.lng, workshop.id]);

  const handleNavigateNaver = useCallback(() => {
    incrementWorkshopLinkClick(workshop.id, 'nav').catch(console.error);
    const name = encodeURIComponent(workshop.name[locale] || '');
    const url = `https://map.naver.com/p/directions/-/${workshop.lng},${workshop.lat},${name}/-/transit`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [workshop.lat, workshop.lng, workshop.name, locale, workshop.id]);

  const handleShare = useCallback(async () => {
    incrementWorkshopLinkClick(workshop.id, 'share').catch(console.error);
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

  const dynamicCategories = getDynamicCategories([workshop]);
  const catMeta = dynamicCategories.find((c) => c.key === workshop.category);
  const rawCatLabel = t(`filters.${workshop.category}`);
  const catLabel = rawCatLabel === `filters.${workshop.category}` ? workshop.category : rawCatLabel;

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
    <Sheet onClose={onClose}>
      {/* Main Image (Representative Photo) */}
      {workshop.images && workshop.images.length > 0 && (
        <div className={styles.imageCarousel}>
          <img
            src={workshop.images[0]}
            alt={`${workshop.name.ko || workshop.name.en} - main image`}
            className={styles.workshopImage}
          />
        </div>
      )}

      {/* Header */}
      <div className={styles.workshopHeader}>
        <h2 className={styles.workshopName}>{workshop.name[locale]}</h2>
      </div>

      {/* Rating & Category */}
      <div className={styles.ratingRow}>
        <div className={styles.rating}>
          <span className={styles.stars}>{renderStars(currentRating)}</span>
          <span>{currentRating}</span>
        </div>
        <span className={styles.reviewCount}>
          ({currentReviewCount} {t('workshop.reviews')})
        </span>
        <span
          className={styles.categoryBadge}
          style={{
            background: `${catMeta?.color || '#94a3b8'}20`,
            color: catMeta?.color || '#94a3b8',
          }}
        >
          {catMeta?.emoji || '🏷️'} {catLabel}
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
        {workshop.phone && (
          <div className={styles.infoItem}>
            <Phone size={16} className={styles.infoIcon} />
            <span>{workshop.phone}</span>
          </div>
        )}
        {workshop.website && (
          <div className={styles.infoItem}>
            <Globe size={16} className={styles.infoIcon} />
            <a href={workshop.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }} onClick={() => incrementWorkshopLinkClick(workshop.id, 'website').catch(console.error)}>
              {workshop.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {/* SNS Links */}
        {workshop.snsLinks?.instagram && (
          <div className={styles.infoItem}>
            <FaInstagram size={16} className={styles.infoIcon} />
            <a
              href={workshop.snsLinks.instagram.startsWith('http') ? workshop.snsLinks.instagram : `https://instagram.com/${workshop.snsLinks.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
              onClick={() => incrementWorkshopLinkClick(workshop.id, 'instagram').catch(console.error)}
            >
              @{workshop.snsLinks.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')}
            </a>
          </div>
        )}
        {workshop.snsLinks?.facebook && (
          <div className={styles.infoItem}>
            <FaFacebook size={16} className={styles.infoIcon} />
            <a href={workshop.snsLinks.facebook} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
              Facebook
            </a>
          </div>
        )}
        {workshop.snsLinks?.youtube && (
          <div className={styles.infoItem}>
            <FaYoutube size={16} className={styles.infoIcon} />
            <a
              href={workshop.snsLinks.youtube.startsWith('http') ? workshop.snsLinks.youtube : `https://youtube.com/@${workshop.snsLinks.youtube.replace(/^@/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
              onClick={() => incrementWorkshopLinkClick(workshop.id, 'youtube').catch(console.error)}
            >
              @{workshop.snsLinks.youtube.replace(/^https?:\/\/(www\.)?youtube\.com\/(@)?/, '').replace(/^@/, '').replace(/\/$/, '')}
            </a>
          </div>
        )}
        {workshop.snsLinks?.blog && (
          <div className={styles.infoItem}>
            <LinkIcon size={16} className={styles.infoIcon} />
            <a href={workshop.snsLinks.blog} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
              Blog
            </a>
          </div>
        )}

        {workshop.languages && workshop.languages.length > 0 && (
          <div className={styles.infoItem}>
            <MessageCircle size={16} className={styles.infoIcon} />
            <span>{workshop.languages.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Studio Photos (Secondary Images) */}
      {workshop.images && workshop.images.length > 1 && (
        <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Studio Space</h3>
          {workshop.images.slice(1).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${workshop.name.ko || workshop.name.en} - studio image ${idx + 1}`}
              style={{ width: '100%', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }}
            />
          ))}
        </div>
      )}

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
            {courses.map(course => (
              <CourseCard key={course.id} course={{ ...course, workshopName: workshop.name }} region={workshop.region} />
            ))}
          </div>
        </>
      )}

      {/* Reviews */}
      <ReviewSection workshopId={workshop.id} onReviewAdded={handleReviewAdded} />

      {/* Similar Workshops Recommendation */}
      {similarWorkshops.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)' }}>
          <h3 className={styles.sectionTitle}>{t('workshop.similar') || 'Similar Workshops'}</h3>
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
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}></div>
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
    </Sheet>
  );
}
