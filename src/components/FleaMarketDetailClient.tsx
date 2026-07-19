'use client';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Navigation, Share2, MapPin, Phone, Globe, Calendar, Image as ImageIcon, Map, List } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { incrementVendorApplicationClick, getFleaMarkets, getWorkshops } from '@/lib/database';
import type { FleaMarket, Workshop } from '@/types';
import styles from './DetailLayout.module.css';

interface FleaMarketDetailClientProps {
  market: FleaMarket;
}

export default function FleaMarketDetailClient({ market }: FleaMarketDetailClientProps) {
  const { locale, t } = useLanguage();
  const router = useRouter();
  const [allFleaMarkets, setAllFleaMarkets] = useState<FleaMarket[]>([]);
  const [allWorkshops, setAllWorkshops] = useState<Workshop[]>([]);

  useEffect(() => {
    getFleaMarkets().then(setAllFleaMarkets);
    getWorkshops().then(setAllWorkshops);
  }, []);

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const p = 0.017453292519943295;
    const c = Math.cos;
    const a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
    return 12742 * Math.asin(Math.sqrt(a));
  };

  const nearbyPlaces = useMemo(() => {
    const festivalsScored = (allFleaMarkets || [])
      .filter((m) => m.id !== market.id && m.status !== 'inactive')
      .map((m) => {
        const distance = getDistance(market.lat, market.lng, m.lat, m.lng);
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
      .filter((w) => w.status === 'active')
      .map((w) => {
        const distance = getDistance(market.lat, market.lng, w.lat, w.lng);
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
  }, [market, allWorkshops, allFleaMarkets, locale]);

  const handleNavigate = useCallback(() => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${market.lat},${market.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [market.lat, market.lng]);

  const handleNavigateNaver = useCallback(() => {
    const name = encodeURIComponent(market.name[locale] || '');
    const url = `https://map.naver.com/p/directions/-/${market.lng},${market.lat},${name}/-/transit`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [market.lat, market.lng, market.name, locale]);

  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: market.name[locale] || market.name.ko || market.name.en,
          text: market.description[locale] || market.description.ko || market.description.en,
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
  }, [market, locale]);

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
          {/* Image/Poster (Show Poster or Logo Fallback) */}
          {market.posterUrl ? (
            <div style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-4)', background: 'var(--color-bg-alt)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={market.posterUrl} alt="Poster" style={{ width: '100%', maxHeight: '640px', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
            </div>
          ) : (
            <div style={{ width: '100%', minHeight: '280px', borderRadius: 'var(--radius-lg)', background: '#f8fafc', border: '1px solid var(--color-border-light, #e5e7eb)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Art Flow Map Logo" style={{ width: '72px', height: '72px', objectFit: 'contain', opacity: 0.85 }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Art Flow Map</span>
            </div>
          )}
        </div>

        {/* Right Column: Info */}
        <div className={styles.rightColumn}>
          {/* Header */}
          <div className={styles.workshopHeader}>
            <h2 className={styles.workshopName}>{market.name[locale] || market.name.ko || market.name.en}</h2>
          </div>

      <div className={styles.ratingRow}>
        <span className={styles.categoryBadge} style={{ background: market.source === 'api' ? '#fef3c7' : 'var(--color-accent-light)', color: market.source === 'api' ? '#d97706' : 'var(--color-accent)' }}>
          {market.source === 'api' ? 'Local Festival' : 'Flea Market'}
        </span>
      </div>

      {/* Description */}
      <p className={styles.description}>{market.description[locale] || market.description.ko || market.description.en}</p>

      {/* Info Grid */}
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <Calendar size={16} className={styles.infoIcon} />
          <span style={{ color: 'var(--color-accent)', fontWeight: 600 }}>{market.date}</span>
        </div>
        <div className={styles.infoItem}>
          <MapPin size={16} className={styles.infoIcon} />
          <span>{market.address[locale] || market.address.ko || market.address.en}</span>
        </div>
        {market.admissionFee && (
          <div className={styles.infoItem}>
            <ImageIcon size={16} className={styles.infoIcon} />
            <span>Admission: {market.admissionFee}</span>
          </div>
        )}
        {market.phone && (
          <div className={styles.infoItem}>
            <Phone size={16} className={styles.infoIcon} />
            <span>{market.phone}</span>
          </div>
        )}
        {market.website && (
          <div className={styles.infoItem}>
            <Globe size={16} className={styles.infoIcon} />
            <a href={market.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Website</a>
          </div>
        )}
        {market.instagram && (
          <div className={styles.infoItem}>
            <Globe size={16} className={styles.infoIcon} />
            <a href={market.instagram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Instagram</a>
          </div>
        )}
        {market.youtube && (
          <div className={styles.infoItem}>
            <Globe size={16} className={styles.infoIcon} />
            <a href={market.youtube} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>YouTube</a>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions} style={{ marginBottom: market.vendorApplicationLink ? 'var(--space-4)' : 0 }}>
        <button className={styles.navigateBtn} style={{ background: '#03c75a', color: '#fff' }} onClick={handleNavigateNaver}>
          <Navigation size={18} />
          Naver Map
        </button>
        <button className={styles.navigateBtn} onClick={handleNavigate}>
          <Navigation size={18} />
          Google Map
        </button>
        <button className={styles.shareBtn} onClick={handleShare} aria-label="Share">
          <Share2 size={18} />
        </button>
      </div>

        {/* Vendor Application */}
        {market.vendorApplicationLink && (
          <div style={{ marginTop: 'var(--space-2)' }}>
            <a 
              href={market.vendorApplicationLink} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--color-brown)', color: '#ffffff', padding: '12px', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: 600 }}
              onClick={() => incrementVendorApplicationClick(market.id).catch(console.error)}
            >
              Apply as a Vendor
            </a>
          </div>
        )}
        </div>
      </div>

      {/* 함께 둘러보기 좋은 곳 (Good places to explore together - Festivals prioritized first) */}
      {nearbyPlaces.length > 0 && (
        <div style={{ marginTop: 'var(--space-6)', maxWidth: '1200px', margin: 'var(--space-6) auto 0' }}>
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
