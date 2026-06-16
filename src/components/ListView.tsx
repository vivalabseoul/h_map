'use client';
import React from 'react';
import type { Workshop, FleaMarket } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ListView.module.css';

interface ListViewProps {
  workshops: Workshop[];
  fleaMarkets: FleaMarket[];
  onWorkshopClick: (workshop: Workshop) => void;
  onFleaMarketClick: (market: FleaMarket) => void;
}

export default function ListView({ workshops, fleaMarkets, onWorkshopClick, onFleaMarketClick }: ListViewProps) {
  const { locale, t } = useLanguage();

  return (
    <div className={styles.listContainer}>
      
      {/* 1. 지역 축제 및 플리마켓 섹션 */}
      {fleaMarkets.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>🎉 Local Festivals & Flea Markets</h2>
          <div className={styles.grid}>
            {fleaMarkets.map(market => {
              const name = market.name[locale] || market.name.ko || market.name.en || '';
              const address = market.address[locale] || market.address.ko || market.address.en || '';
              const desc = market.description[locale] || market.description.ko || market.description.en || '';
              const hasImage = !!market.posterUrl;

              return (
                <div key={market.id} className={styles.card} onClick={() => onFleaMarketClick(market)}>
                  {hasImage && (
                    <div className={styles.imageArea}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={market.posterUrl} alt={name} className={styles.image} />
                    </div>
                  )}
                  <div className={styles.contentArea}>
                    <h3 className={styles.title}>{name}</h3>
                    <div className={styles.subtitle}>{market.date}</div>
                    
                    <div className={styles.meta}>
                      {!hasImage && desc && (
                        <div className={styles.metaItem} style={{ marginBottom: '8px', color: '#333' }}>
                          <span className={styles.metaIcon}>💬</span>
                          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</span>
                        </div>
                      )}
                      <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>📍</span>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 공방/클래스 섹션 */}
      {workshops.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>📍 Local Studios & Classes</h2>
          <div className={styles.grid}>
            {workshops.map(workshop => {
              const name = workshop.name[locale] || workshop.name.ko || workshop.name.en || '';
              const address = workshop.address[locale] || workshop.address.ko || workshop.address.en || '';
              const hasImage = workshop.images && workshop.images.length > 0;

              return (
                <div key={workshop.id} className={styles.card} onClick={() => onWorkshopClick(workshop)}>
                  {hasImage && (
                    <div className={styles.imageArea}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={workshop.images[0]} alt={name} className={styles.image} />
                    </div>
                  )}
                  <div className={styles.contentArea}>
                    <h3 className={styles.title}>{name}</h3>
                    <div className={styles.subtitle} style={{ color: '#ff6b35' }}>⭐ {workshop.rating} ({workshop.reviewCount})</div>
                    
                    <div className={styles.meta}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaIcon}>📍</span>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {fleaMarkets.length === 0 && workshops.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          No registered information in this region.
        </div>
      )}
      
    </div>
  );
}
