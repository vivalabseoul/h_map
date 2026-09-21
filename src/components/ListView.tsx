'use client';
import React, { useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { getFallbackImage } from '@/lib/imageUtils';
import type { Workshop, FleaMarket, Locale } from '@/types';
import { REGIONS } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getDistanceKm, formatDistance } from '@/lib/distance';
import { getKoreaRegion } from '@/lib/koreaRegions';
import type { Coordinates } from '@/lib/geolocation';
import styles from './ListView.module.css';

interface ListViewProps {
  workshops: Workshop[];
  fleaMarkets: FleaMarket[];
  mapBounds?: { north: number; south: number; east: number; west: number } | null;
  userLocation?: Coordinates | null;
  onWorkshopClick: (workshop: Workshop) => void;
  onFleaMarketClick: (market: FleaMarket) => void;
  viewMode?: 'map' | 'list';
  onViewModeChange?: (mode: 'map' | 'list') => void;
}

interface RegionGroupInfo {
  key: string;
  label: Record<Locale, string>;
}

const OTHER_REGION: RegionGroupInfo = {
  key: 'other',
  label: { ko: '기타 지역', en: 'Other Regions', ja: 'その他の地域', zh: '其他地区' },
};

// Grouping is decided by the Korean address (key is always the Korean name); the language only picks the label.
function getRegionGroup(item: Workshop | FleaMarket): RegionGroupInfo {
  const koreaRegion = getKoreaRegion(item.address);
  if (koreaRegion) return { key: koreaRegion.key, label: koreaRegion.label };

  if ('region' in item && item.region && item.region !== 'korea') {
    const regObj = REGIONS.find((r) => r.key === item.region);
    if (regObj) return { key: `country:${regObj.key}`, label: regObj.label };
  }

  return OTHER_REGION;
}

export default function ListView({
  workshops,
  fleaMarkets,
  mapBounds,
  userLocation,
  onWorkshopClick,
  onFleaMarketClick,
  viewMode,
  onViewModeChange,
}: ListViewProps) {
  const { locale } = useLanguage();

  const mapCenter = useMemo(() => {
    if (userLocation) return userLocation;
    if (!mapBounds) return null;
    return {
      lat: (mapBounds.north + mapBounds.south) / 2,
      lng: (mapBounds.east + mapBounds.west) / 2,
    };
  }, [mapBounds, userLocation]);

  const groupedRegions = useMemo(() => {
    const groupsMap = new Map<string, { label: Record<Locale, string>; fleaMarkets: FleaMarket[]; workshops: Workshop[] }>();
    const groupOf = (info: RegionGroupInfo) => {
      if (!groupsMap.has(info.key)) {
        groupsMap.set(info.key, { label: info.label, fleaMarkets: [], workshops: [] });
      }
      return groupsMap.get(info.key)!;
    };

    fleaMarkets.forEach((market) => groupOf(getRegionGroup(market)).fleaMarkets.push(market));
    workshops.forEach((workshop) => groupOf(getRegionGroup(workshop)).workshops.push(workshop));

    const groups = Array.from(groupsMap.entries()).map(([key, data]) => {
      const allItems = [...data.workshops, ...data.fleaMarkets];
      let minDistance = Infinity;

      if (mapCenter && allItems.length > 0) {
        allItems.forEach((item) => {
          if (typeof item.lat === 'number' && typeof item.lng === 'number') {
            const dLat = item.lat - mapCenter.lat;
            const dLng = item.lng - mapCenter.lng;
            const distSq = dLat * dLat + dLng * dLng;
            if (distSq < minDistance) {
              minDistance = distSq;
            }
          }
        });
      }

      return {
        key,
        regionName: data.label[locale] || data.label.ko,
        fleaMarkets: data.fleaMarkets,
        workshops: data.workshops,
        minDistance,
      };
    });

    // Sort groups
    groups.sort((a, b) => {
      if (mapCenter && a.minDistance !== b.minDistance) {
        return a.minDistance - b.minDistance;
      }
      const totalA = a.fleaMarkets.length + a.workshops.length;
      const totalB = b.fleaMarkets.length + b.workshops.length;
      return totalB - totalA;
    });

    return groups;
  }, [workshops, fleaMarkets, locale, mapCenter]);

  return (
    <div className={`${styles.listContainer} ${viewMode === 'list' ? styles.fullListView : ''}`}>
      {/* Mobile Bottom Sheet Toggle Button - Sticky at top */}
      <div className={styles.mobileToggleWrapper}>
        <button
          className={styles.mobileToggleButton}
          onClick={(e) => {
            e.stopPropagation();
            onViewModeChange && onViewModeChange(viewMode === 'map' ? 'list' : 'map');
          }}
        >
          {viewMode === 'map' ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>
      </div>

      {groupedRegions.map((group) => {
        const totalItems = group.fleaMarkets.length + group.workshops.length;
        if (totalItems === 0) return null;

        return (
          <div key={group.key} className={styles.regionGroupBlock}>
            {/* Region Header */}
            <div className={styles.regionHeader}>
              <h2 className={styles.regionTitle}>
                <span>{group.regionName}</span>
                <span className={styles.regionCounts}>{totalItems}</span>
              </h2>
            </div>

            {/* 1. Region Workshops (Placed First) */}
            {group.workshops.length > 0 && (
              <div className={styles.subCategorySection}>
                <h3 className={styles.subCategoryTitle}>
                  {locale === 'ko' ? '공방 & 클래스' : 'Local Studios & Classes'}
                </h3>
                <div className={styles.grid}>
                  {group.workshops.map((workshop) => {
                    const name = workshop.name[locale] || workshop.name.ko || workshop.name.en || '';
                    const desc = workshop.description[locale] || workshop.description.ko || workshop.description.en || '';

                    return (
                      <div key={workshop.id} className={styles.card} onClick={() => onWorkshopClick(workshop)}>
                        <div className={styles.imageArea}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={(workshop.images && workshop.images[0] && workshop.images[0] !== 'null' && workshop.images[0] !== 'undefined') ? workshop.images[0] : getFallbackImage(workshop.category)} 
                            alt={name} 
                            className={styles.image} 
                            onError={(e) => { 
                              e.currentTarget.onerror = null; 
                              e.currentTarget.src = getFallbackImage('default'); 
                            }}
                          />
                        </div>
                        <div className={styles.contentArea}>
                          <h3 className={styles.title}>{name}</h3>
                          <div className={styles.subtitle} style={{ color: '#ff6b35' }}>
                            ⭐ {workshop.rating} ({workshop.reviewCount})
                            {userLocation && (
                              <span style={{ marginLeft: 8, color: 'var(--color-accent)', fontWeight: 600 }}>
                                📍 {formatDistance(getDistanceKm(userLocation.lat, userLocation.lng, workshop.lat, workshop.lng))}
                              </span>
                            )}
                          </div>

                          <div className={styles.meta}>
                            <div className={styles.metaItem}>
                              <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Region Festivals (Placed Second) */}
            {group.fleaMarkets.length > 0 && (
              <div className={styles.subCategorySection}>
                <h3 className={styles.subCategoryTitle}>
                  {locale === 'ko' ? '지역 축제 & 플리마켓' : 'Local Festivals & Flea Markets'}
                </h3>
                <div className={styles.grid}>
                  {group.fleaMarkets.map((market) => {
                    const name = market.name[locale] || market.name.ko || market.name.en || '';
                    const desc = market.description[locale] || market.description.ko || market.description.en || '';

                    return (
                      <div key={market.id} className={styles.card} onClick={() => onFleaMarketClick(market)}>
                        <div className={styles.imageArea}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={market.posterUrl && market.posterUrl !== 'null' && market.posterUrl !== 'undefined' ? market.posterUrl : getFallbackImage(name + ' ' + desc)} 
                            alt={name} 
                            className={styles.image} 
                            onError={(e) => { 
                              e.currentTarget.onerror = null; 
                              e.currentTarget.src = getFallbackImage('default'); 
                            }}
                          />
                        </div>
                        <div className={styles.contentArea}>
                          <h3 className={styles.title}>{name}</h3>
                          <div className={styles.subtitle}>
                            {market.date.replace(/20(\d{2})/g, '$1').replace(/-/g, '.')}
                            {userLocation && (
                              <span style={{ marginLeft: 8, color: 'var(--color-accent)', fontWeight: 600 }}>
                                📍 {formatDistance(getDistanceKm(userLocation.lat, userLocation.lng, market.lat, market.lng))}
                              </span>
                            )}
                          </div>

                          <div className={styles.meta}>
                            <div className={styles.metaItem}>
                              <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{desc}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {groupedRegions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          No registered information in this region.
        </div>
      )}
    </div>
  );
}
