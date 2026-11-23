'use client';
import React, { useMemo } from 'react';
import { ChevronUp, ChevronDown, Map as MapIcon } from 'lucide-react';
import { getFallbackImage } from '@/lib/imageUtils';
import type { Workshop, FleaMarket, Locale } from '@/types';
import { REGIONS } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { getDistanceKm, formatDistance } from '@/lib/distance';
import { getKoreaRegion } from '@/lib/koreaRegions';
import { PLACE_TYPE_COLORS, placeLabel, eventKindLabel } from '@/lib/placeTypes';
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

const MAP_BUTTON_LABEL: Record<Locale, string> = {
  ko: '지도 보기',
  en: 'Map',
  ja: '地図で見る',
  zh: '查看地图',
};

interface RegionGroupInfo {
  key: string;
  label: Record<Locale, string>;
}

// Regions with fewer places than this are folded into the shared "other regions" section
const MIN_ITEMS_PER_REGION = 3;

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
  userLocation,
  onWorkshopClick,
  onFleaMarketClick,
  viewMode,
  onViewModeChange,
}: ListViewProps) {
  const { locale } = useLanguage();

  const groupedRegions = useMemo(() => {
    type ListItem =
      | { kind: 'workshop'; data: Workshop; regionLabel: string }
      | { kind: 'event'; data: FleaMarket; regionLabel: string };

    const groupsMap = new Map<string, { label: Record<Locale, string>; items: ListItem[] }>();
    const groupOf = (info: RegionGroupInfo) => {
      if (!groupsMap.has(info.key)) groupsMap.set(info.key, { label: info.label, items: [] });
      return groupsMap.get(info.key)!;
    };

    // Studios first, then events, so every region reads as one continuous grid
    workshops.forEach((data) => {
      const info = getRegionGroup(data);
      groupOf(info).items.push({ kind: 'workshop', data, regionLabel: info.label[locale] || info.label.ko });
    });
    fleaMarkets.forEach((data) => {
      const info = getRegionGroup(data);
      groupOf(info).items.push({ kind: 'event', data, regionLabel: info.label[locale] || info.label.ko });
    });

    const groups = Array.from(groupsMap.entries()).map(([key, data]) => {
      let minDistance = Infinity;
      if (userLocation) {
        data.items.forEach(({ data: item }) => {
          if (typeof item.lat === 'number' && typeof item.lng === 'number') {
            const dLat = item.lat - userLocation.lat;
            const dLng = item.lng - userLocation.lng;
            minDistance = Math.min(minDistance, dLat * dLat + dLng * dLng);
          }
        });
      }
      return { key, regionName: data.label[locale] || data.label.ko, items: data.items, minDistance, merged: false };
    });

    // Nearest region first in "nearby" mode, otherwise the region with the most places first.
    // "Other regions" always goes last.
    const byImportance = (x: typeof groups[number], y: typeof groups[number]) => {
      if (x.key === OTHER_REGION.key) return 1;
      if (y.key === OTHER_REGION.key) return -1;
      if (userLocation && x.minDistance !== y.minDistance) return x.minDistance - y.minDistance;
      return y.items.length - x.items.length;
    };
    groups.sort(byImportance);

    // Regions with only a couple of places would leave a mostly empty row: fold them into one shared section
    // (each card keeps a small region label). Skipped when no region is big enough to stand on its own.
    const big = groups.filter((g) => g.items.length >= MIN_ITEMS_PER_REGION);
    const small = groups.filter((g) => g.items.length < MIN_ITEMS_PER_REGION);
    if (big.length === 0 || small.length === 0) return groups;

    const mergedItems = small.flatMap((g) => g.items).sort((x, y) => {
      // keep studios before events inside the shared section
      if (x.kind !== y.kind) return x.kind === 'workshop' ? -1 : 1;
      return 0;
    });
    big.push({
      key: OTHER_REGION.key,
      regionName: OTHER_REGION.label[locale] || OTHER_REGION.label.ko,
      items: mergedItems,
      minDistance: Math.min(...small.map((g) => g.minDistance)),
      merged: true,
    });
    return big;
  }, [workshops, fleaMarkets, locale, userLocation]);

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

      {/* Mobile: while the list is open, a button pinned to the bottom always brings the map back.
          The handle above can end up under the header when the text size is enlarged. */}
      {viewMode === 'list' && (
        <button
          type="button"
          className={styles.mobileCloseFab}
          onClick={(e) => {
            e.stopPropagation();
            onViewModeChange?.('map');
          }}
        >
          <MapIcon size={16} />
          {MAP_BUTTON_LABEL[locale] || MAP_BUTTON_LABEL.en}
        </button>
      )}

      {groupedRegions.map((group) => {
        if (group.items.length === 0) return null;

        return (
          <div key={group.key} className={styles.regionGroupBlock}>
            {/* Region Header */}
            <div className={styles.regionHeader}>
              <h2 className={styles.regionTitle}>
                <span>{group.regionName}</span>
                <span className={styles.regionCounts}>{group.items.length}</span>
              </h2>
            </div>

            <div className={styles.grid}>
              {group.items.map((item) => {
                const regionChip = group.merged ? (
                  <span className={styles.regionChip}>{item.regionLabel}</span>
                ) : null;

                if (item.kind === 'workshop') {
                  const workshop = item.data;
                  const name = workshop.name[locale] || workshop.name.ko || workshop.name.en || '';
                  const desc = workshop.description[locale] || workshop.description.ko || workshop.description.en || '';

                  return (
                    <div key={`w-${workshop.id}`} className={styles.card} onClick={() => onWorkshopClick(workshop)}>
                      <div className={styles.imageArea}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={(workshop.images && workshop.images[0] && workshop.images[0] !== 'null' && workshop.images[0] !== 'undefined') ? workshop.images[0] : getFallbackImage(workshop.category)}
                          alt={name}
                          className={styles.image}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getFallbackImage('default');
                          }}
                        />
                        <span className={styles.typeBadge} style={{ background: PLACE_TYPE_COLORS.workshop.bg, color: PLACE_TYPE_COLORS.workshop.fg }}>{placeLabel('workshop', locale)}</span>
                      </div>
                      <div className={styles.contentArea}>
                        <h3 className={styles.title}>{regionChip}{name}</h3>
                        <div className={styles.subtitle} style={{ color: PLACE_TYPE_COLORS.workshop.fg }}>
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
                }

                const market = item.data;
                const name = market.name[locale] || market.name.ko || market.name.en || '';
                const desc = market.description[locale] || market.description.ko || market.description.en || '';

                return (
                  <div key={`e-${market.id}`} className={styles.card} onClick={() => onFleaMarketClick(market)}>
                    <div className={styles.imageArea}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={market.posterUrl && market.posterUrl !== 'null' && market.posterUrl !== 'undefined' ? market.posterUrl : getFallbackImage(name + ' ' + desc)}
                        alt={name}
                        className={styles.image}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getFallbackImage('default');
                        }}
                      />
                      <span className={styles.typeBadge} style={{ background: PLACE_TYPE_COLORS.event.bg, color: PLACE_TYPE_COLORS.event.fg }}>{eventKindLabel(market, locale)}</span>
                    </div>
                    <div className={styles.contentArea}>
                      <h3 className={styles.title}>{regionChip}{name}</h3>
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
