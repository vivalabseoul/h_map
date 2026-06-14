'use client';
import React, { useEffect, useCallback } from 'react';
import { X, Navigation, Share2, MapPin, Phone, Globe, Calendar, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { incrementVendorApplicationClick } from '@/lib/database';
import type { FleaMarket } from '@/types';
import styles from './BottomSheet.module.css';

interface FleaMarketSheetProps {
  market: FleaMarket;
  onClose: () => void;
}

export default function FleaMarketSheet({ market, onClose }: FleaMarketSheetProps) {
  const { locale } = useLanguage();

  // Close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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
          {/* Image/Poster (Only show if exists) */}
          {market.posterUrl && (
            <div style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 'var(--space-4)' }}>
              <img src={market.posterUrl} alt="Poster" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          )}

          {/* Header */}
          <div className={styles.workshopHeader}>
            <h2 className={styles.workshopName}>{market.name[locale] || market.name.ko || market.name.en}</h2>
          </div>

          <div className={styles.ratingRow}>
            <span className={styles.categoryBadge} style={{ background: '#e0f2fe', color: '#0284c7' }}>
              🎪 플리마켓 (Flea Market)
            </span>
          </div>

          {/* Description */}
          <p className={styles.description}>{market.description[locale] || market.description.ko || market.description.en}</p>

          {/* Info Grid */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Calendar size={16} className={styles.infoIcon} />
              <span>{market.date}</span>
            </div>
            <div className={styles.infoItem}>
              <MapPin size={16} className={styles.infoIcon} />
              <span>{market.address[locale] || market.address.ko || market.address.en}</span>
            </div>
            {market.admissionFee && (
              <div className={styles.infoItem}>
                <ImageIcon size={16} className={styles.infoIcon} />
                <span>입장권: {market.admissionFee}</span>
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
                <a href={market.website} target="_blank" rel="noopener noreferrer">홈페이지</a>
              </div>
            )}
            {market.instagram && (
              <div className={styles.infoItem}>
                <Globe size={16} className={styles.infoIcon} />
                <a href={market.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
              </div>
            )}
            {market.youtube && (
              <div className={styles.infoItem}>
                <Globe size={16} className={styles.infoIcon} />
                <a href={market.youtube} target="_blank" rel="noopener noreferrer">YouTube</a>
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
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', backgroundColor: 'var(--color-clay)' }}
                onClick={() => incrementVendorApplicationClick(market.id).catch(console.error)}
              >
                🎪 셀러(벤더) 참여 신청하기
              </a>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
