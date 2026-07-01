'use client';
import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Navigation, Share2, MapPin, Phone, Globe, Calendar, Image as ImageIcon, Map, List } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { incrementVendorApplicationClick } from '@/lib/database';
import type { FleaMarket } from '@/types';
import styles from './DetailLayout.module.css';

interface FleaMarketDetailClientProps {
  market: FleaMarket;
}

export default function FleaMarketDetailClient({ market }: FleaMarketDetailClientProps) {
  const { locale } = useLanguage();
  const router = useRouter();

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
    if (navigator.share) {
      try {
        await navigator.share({
          title: market.name[locale] || market.name.ko || market.name.en,
          text: market.description[locale] || market.description.ko || market.description.en,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
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
          {/* Image/Poster (Only show if exists) */}
          {market.posterUrl && (
            <div style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-4)', background: 'var(--color-bg-alt)' }}>
              <img src={market.posterUrl} alt="Poster" style={{ width: '100%', maxHeight: '640px', objectFit: 'contain', display: 'block', margin: '0 auto' }} />
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
          {market.source === 'api' ? '🎉 Local Festival' : '🎪 Flea Market'}
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
              🎪 Apply as a Vendor
            </a>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
