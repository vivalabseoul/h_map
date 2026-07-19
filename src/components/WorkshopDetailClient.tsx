'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Navigation, Share2, MapPin, Phone, Globe, Star, MessageCircle, Link as LinkIcon, Map, List } from 'lucide-react';
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';
import { getDynamicCategories } from '@/lib/categoryUtils';
import type { Workshop, Course, AppUser, FleaMarket } from '@/types';
import { getCoursesByWorkshop, getUserProfile, getWorkshopById, incrementWorkshopLinkClick, getWorkshops, getFleaMarkets } from '@/lib/database';
import { useAuth } from '@/context/AuthContext';
import CourseCard from './CourseCard';
import ReviewSection from './ReviewSection';
import styles from './DetailLayout.module.css';

interface WorkshopDetailClientProps {
  workshop: Workshop;
}

export default function WorkshopDetailClient({ workshop }: WorkshopDetailClientProps) {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructor, setInstructor] = useState<AppUser | null>(null);
  const [allWorkshops, setAllWorkshops] = useState<Workshop[]>([]);
  const [allFleaMarkets, setAllFleaMarkets] = useState<FleaMarket[]>([]);

  const [currentRating, setCurrentRating] = useState(workshop.rating);
  const [currentReviewCount, setCurrentReviewCount] = useState(workshop.reviewCount);

  useEffect(() => {
    // Force scroll to top when navigating between workshops, with slight delay for DOM paint
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 10);
    
    getCoursesByWorkshop(workshop.id).then(setCourses);
    getUserProfile(workshop.ownerId).then(setInstructor);
    getWorkshops().then(setAllWorkshops);
    getFleaMarkets().then(setAllFleaMarkets);
    setCurrentRating(workshop.rating);
    setCurrentReviewCount(workshop.reviewCount);
  }, [workshop]);

  if (workshop.isPrivate) {
    if (loading) {
      return <div style={{ padding: '40px', textAlign: 'center', marginTop: '100px', minHeight: '60vh' }}>권한을 확인하는 중입니다...</div>;
    }
    if (!user || (user.role !== 'super_admin' && user.role !== 'manager' && workshop.ownerId !== user.id)) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', marginTop: '100px', minHeight: '60vh' }}>
          <h2>비공개된 공방입니다.</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '10px' }}>관리자 또는 해당 공방의 강사만 접근할 수 있습니다.</p>
          <button 
            onClick={() => router.push(`/${locale}`)} 
            style={{ marginTop: '30px', padding: '12px 24px', borderRadius: '8px', border: 'none', background: 'var(--color-accent)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
          >
            목록으로 돌아가기
          </button>
        </div>
      );
    }
  }

  const handleReviewAdded = useCallback(async () => {
    const updated = await getWorkshopById(workshop.id);
    if (updated) {
      setCurrentRating(updated.rating);
      setCurrentReviewCount(updated.reviewCount);
    }
  }, [workshop.id]);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a));
  };

  const visibleCourses = useMemo(() => {
    return courses.filter(c => {
      if (!c.isPrivate) return true;
      if (!user) return false;
      if (user.role === 'super_admin' || user.role === 'manager' || workshop.ownerId === user.id) return true;
      return false;
    });
  }, [courses, user, workshop.ownerId]);

  const nearbyPlaces = useMemo(() => {
    const festivalsScored = (allFleaMarkets || [])
      .filter((m) => m.status !== 'inactive')
      .map((m) => {
        const distance = getDistance(workshop.lat, workshop.lng, m.lat, m.lng);
        const name = m.name[locale] || m.name.ko || m.name.en || '';
        const desc = m.description[locale] || m.description.ko || m.description.en || '';
        return {
          id: m.id,
          type: 'festival' as const,
          name,
          description: desc,
          subtitle: m.date ? `${m.date}` : (locale === 'ko' ? '지역 축제' : 'Festival'),
          imageUrl: m.posterUrl,
          linkUrl: `/${locale}/fleamarkets/${m.id}`,
          badgeText: locale === 'ko' ? '축제' : 'Festival',
          badgeBg: '#fef3c7',
          badgeColor: '#d97706',
          distance,
        };
      })
      .sort((a, b) => a.distance - b.distance);

    const workshopsScored = (allWorkshops || [])
      .filter((w) => w.id !== workshop.id && w.status === 'active')
      .map((w) => {
        const distance = getDistance(workshop.lat, workshop.lng, w.lat, w.lng);
        const name = w.name[locale] || w.name.ko || w.name.en || '';
        const desc = w.description[locale] || w.description.ko || w.description.en || '';
        return {
          id: w.id,
          type: 'workshop' as const,
          name,
          description: desc,
          subtitle: `⭐ ${w.rating} (${w.reviewCount})`,
          imageUrl: w.images && w.images.length > 0 ? w.images[0] : undefined,
          linkUrl: `/${locale}/workshops/${w.slug || w.id}`,
          badgeText: locale === 'ko' ? '공방' : 'Studio',
          badgeBg: '#e0f2fe',
          badgeColor: '#0284c7',
          distance,
        };
      })
      .sort((a, b) => a.distance - b.distance);

    const result = [];
    
    // Prioritize festivals FIRST (up to 3 nearest festivals)
    const maxFestivals = 3;
    result.push(...festivalsScored.slice(0, maxFestivals));

    // Fill remaining up to 4 total with nearest workshops
    const remaining = Math.max(0, 4 - result.length);
    result.push(...workshopsScored.slice(0, remaining));

    return result;
  }, [workshop, allWorkshops, allFleaMarkets, locale]);

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
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: workshop.name[locale],
          text: workshop.description[locale],
          url: shareUrl,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert(locale === 'ko' ? '링크가 클립보드에 복사되었습니다.' : 'Link copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy text: ', err);
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
    <div className={styles.pageContainer} style={{ background: 'var(--color-surface)', minHeight: '100vh' }}>
      {/* Top Navigation Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
        <button 
          onClick={() => router.push(`/${locale}`)} 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-bg-alt)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '6px 14px', transition: 'all 0.2s' }}
        >
          <List size={16} /> List
        </button>
      </div>

      <div className={styles.contentGrid}>
        {/* Left Column: Images */}
        <div className={styles.leftColumn}>
          {/* Main Image (Representative Photo) */}
          {workshop.images && workshop.images.length > 0 ? (
            <div className={styles.imageCarousel}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={workshop.images[0]}
                alt={`${workshop.name.ko || workshop.name.en} - main image`}
                className={styles.workshopImage}
              />
            </div>
          ) : (
            <div className={styles.imageCarousel} style={{ width: '100%', minHeight: '280px', borderRadius: 'var(--radius-lg)', background: '#f8fafc', border: '1px solid var(--color-border-light, #e5e7eb)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Art Flow Map Logo" style={{ width: '72px', height: '72px', objectFit: 'contain', opacity: 0.85 }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Art Flow Map</span>
            </div>
          )}

          {/* Studio Photos (Secondary Images) */}
          {workshop.images && workshop.images.length > 1 && (
            <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 'var(--space-3)' }}>Studio Space</h3>
              {workshop.images.slice(1).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${workshop.name.ko || workshop.name.en} - studio image ${idx + 1}`}
                  className={styles.workshopImage}
                  style={{ marginBottom: 'var(--space-2)' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info */}
        <div className={styles.rightColumn}>
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
          {visibleCourses.length > 0 && (
            <>
              <h3 className={styles.sectionTitle}>{t('workshop.courses')}</h3>
              <div className={styles.courseList}>
                {visibleCourses.map(course => (
                  <CourseCard key={course.id} course={{ ...course, workshopName: workshop.name }} region={workshop.region} />
                ))}
              </div>
            </>
          )}

          {/* Reviews */}
          <ReviewSection workshopId={workshop.id} onReviewAdded={handleReviewAdded} />
        </div>
      </div>

      {/* 함께 둘러보기 좋은 곳 (Good places to explore together - Festivals prioritized first) */}
      {nearbyPlaces.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)' }}>
          <h3 className={styles.sectionTitle}>{t('workshop.similar') || '함께 둘러보기 좋은 곳'}</h3>
          <div className={styles.nearbyGrid}>
            {nearbyPlaces.map((place) => (
              <Link
                href={place.linkUrl}
                key={place.id}
                className={styles.nearbyCard}
              >
                <div className={styles.nearbyImageArea}>
                  {place.imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={place.imageUrl} alt={place.name} className={styles.nearbyImage} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: '4px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/logo.png" alt="Art Flow Map" style={{ width: '36px', height: '36px', objectFit: 'contain', opacity: 0.85 }} />
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Art Flow Map</span>
                    </div>
                  )}
                  <span className={styles.nearbyBadge} style={{ background: place.badgeBg, color: place.badgeColor }}>
                    {place.badgeText}
                  </span>
                </div>
                <div className={styles.nearbyContentArea}>
                  <h4 className={styles.nearbyTitle}>{place.name}</h4>
                  <div className={styles.nearbySubtitle}>{place.subtitle}</div>
                  <p className={styles.nearbyDescription}>{place.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

}
