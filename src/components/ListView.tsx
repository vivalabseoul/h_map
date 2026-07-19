'use client';
import React, { useMemo } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { Workshop, FleaMarket, Locale } from '@/types';
import { REGIONS } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ListView.module.css';

interface ListViewProps {
  workshops: Workshop[];
  fleaMarkets: FleaMarket[];
  onWorkshopClick: (workshop: Workshop) => void;
  onFleaMarketClick: (market: FleaMarket) => void;
  viewMode?: 'map' | 'list';
  onViewModeChange?: (mode: 'map' | 'list') => void;
}

function getRegionName(item: Workshop | FleaMarket, locale: Locale): string {
  const addrObj = item.address;
  let addrStr = '';
  if (typeof addrObj === 'string') {
    addrStr = addrObj;
  } else if (addrObj) {
    addrStr = addrObj[locale] || addrObj.ko || addrObj.en || '';
  }

  addrStr = addrStr.trim();
  if (addrStr) {
    const tokens = addrStr.split(/\s+/);
    if (tokens.length >= 1) {
      const first = tokens[0];

      const normalized = first
        .replace(/^서울특별시$|^서울시$/g, '서울')
        .replace(/^경기도$/g, '경기')
        .replace(/^부산광역시$|^부산시$/g, '부산')
        .replace(/^인천광역시$|^인천시$/g, '인천')
        .replace(/^대구광역시$|^대구시$/g, '대구')
        .replace(/^대전광역시$|^대전시$/g, '대전')
        .replace(/^광주광역시$|^광주시$/g, '광주')
        .replace(/^울산광역시$|^울산시$/g, '울산')
        .replace(/^세종특별자치시$|^세종시$/g, '세종')
        .replace(/^제주특별자치도$|^제주도$|^제주시$/g, '제주')
        .replace(/^강원특별자치도$|^강원도$/g, '강원')
        .replace(/^충청북도$/g, '충북')
        .replace(/^충청남도$/g, '충남')
        .replace(/^전라북도$|^전북특별자치도$/g, '전북')
        .replace(/^전라남도$/g, '전남')
        .replace(/^경상북도$/g, '경북')
        .replace(/^경상남도$/g, '경남');

      // Handle English address format like "Jongno-gu, Seoul" -> "서울"
      if (tokens.length >= 2 && tokens[1].toLowerCase().includes('seoul')) {
        return locale === 'ko' ? '서울' : 'Seoul';
      }

      if (['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '제주', '강원', '충북', '충남', '전북', '전남', '경북', '경남'].includes(normalized)) {
        if (locale !== 'ko') {
          const enMap: Record<string, string> = {
            '서울': 'Seoul',
            '경기': 'Gyeonggi',
            '인천': 'Incheon',
            '부산': 'Busan',
            '대구': 'Daegu',
            '대전': 'Daejeon',
            '광주': 'Gwangju',
            '울산': 'Ulsan',
            '세종': 'Sejong',
            '제주': 'Jeju',
            '강원': 'Gangwon',
            '충북': 'Chungbuk',
            '충남': 'Chungnam',
            '전북': 'Jeonbuk',
            '전남': 'Jeonnam',
            '경북': 'Gyeongbuk',
            '경남': 'Gyeongnam',
          };
          return enMap[normalized] || normalized;
        }
        return normalized;
      }

      return first;
    }
  }

  if ('region' in item && item.region) {
    const regObj = REGIONS.find((r) => r.key === item.region);
    if (regObj) return regObj.label[locale] || regObj.label.ko || regObj.label.en;
  }

  return locale === 'ko' ? '기타 지역' : 'Other Regions';
}

export default function ListView({
  workshops,
  fleaMarkets,
  onWorkshopClick,
  onFleaMarketClick,
  viewMode,
  onViewModeChange,
}: ListViewProps) {
  const { locale } = useLanguage();

  const groupedRegions = useMemo(() => {
    const groupsMap = new Map<string, { fleaMarkets: FleaMarket[]; workshops: Workshop[] }>();

    fleaMarkets.forEach((market) => {
      const regionName = getRegionName(market, locale);
      if (!groupsMap.has(regionName)) {
        groupsMap.set(regionName, { fleaMarkets: [], workshops: [] });
      }
      groupsMap.get(regionName)!.fleaMarkets.push(market);
    });

    workshops.forEach((workshop) => {
      const regionName = getRegionName(workshop, locale);
      if (!groupsMap.has(regionName)) {
        groupsMap.set(regionName, { fleaMarkets: [], workshops: [] });
      }
      groupsMap.get(regionName)!.workshops.push(workshop);
    });

    const groups = Array.from(groupsMap.entries()).map(([regionName, data]) => ({
      regionName,
      fleaMarkets: data.fleaMarkets,
      workshops: data.workshops,
    }));

    // Sort by total items count descending
    groups.sort((a, b) => {
      const totalA = a.fleaMarkets.length + a.workshops.length;
      const totalB = b.fleaMarkets.length + b.workshops.length;
      return totalB - totalA;
    });

    return groups;
  }, [workshops, fleaMarkets, locale]);

  return (
    <div className={styles.listContainer}>
      {/* Mobile Bottom Sheet Toggle Button */}
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

      {/* Main List Summary Banner */}
      <div className={styles.listHeaderSummary}>
        <h1 className={styles.listMainTitle}>
          {locale === 'ko' ? '대한민국 지역별 축제 & 공방' : 'Korea Local Festivals & Studios'}
        </h1>
        <p className={styles.listSubTitle}>
          {locale === 'ko'
            ? '각 지역별로 등록된 축제, 플리마켓, 핸드메이드 공방 정보를 한눈에 확인하세요.'
            : 'Explore festivals, flea markets, and craft studios grouped by Korean region.'}
        </p>
      </div>

      {groupedRegions.map((group) => {
        const totalItems = group.fleaMarkets.length + group.workshops.length;
        if (totalItems === 0) return null;

        const countsParts: string[] = [];
        if (group.fleaMarkets.length > 0) {
          countsParts.push(locale === 'ko' ? `축제 ${group.fleaMarkets.length}` : `Festivals ${group.fleaMarkets.length}`);
        }
        if (group.workshops.length > 0) {
          countsParts.push(locale === 'ko' ? `공방 ${group.workshops.length}` : `Studios ${group.workshops.length}`);
        }
        const countsText = countsParts.join(', ');

        return (
          <div key={group.regionName} className={styles.regionGroupBlock}>
            {/* Region Header */}
            <div className={styles.regionHeader}>
              <h2 className={styles.regionTitle}>
                <span>{group.regionName}</span>
                <span className={styles.regionCounts}>({countsText})</span>
              </h2>
            </div>

            {/* 1. Region Festivals */}
            {group.fleaMarkets.length > 0 && (
              <div className={styles.subCategorySection}>
                <h3 className={styles.subCategoryTitle}>
                  {locale === 'ko' ? '지역 축제 & 플리마켓' : 'Local Festivals & Flea Markets'}
                </h3>
                <div className={styles.grid}>
                  {group.fleaMarkets.map((market) => {
                    const name = market.name[locale] || market.name.ko || market.name.en || '';
                    const desc = market.description[locale] || market.description.ko || market.description.en || '';
                    const hasImage = !!market.posterUrl;

                    return (
                      <div key={market.id} className={styles.card} onClick={() => onFleaMarketClick(market)}>
                        <div className={styles.imageArea}>
                          {hasImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={market.posterUrl} alt={name} className={styles.image} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: '4px' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src="/logo.png" alt="Art Flow Map" style={{ width: '36px', height: '36px', objectFit: 'contain', opacity: 0.85 }} />
                              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Art Flow Map</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.contentArea}>
                          <h3 className={styles.title}>{name}</h3>
                          <div className={styles.subtitle}>{market.date}</div>

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

            {/* 2. Region Workshops */}
            {group.workshops.length > 0 && (
              <div className={styles.subCategorySection}>
                <h3 className={styles.subCategoryTitle}>
                  {locale === 'ko' ? '공방 & 클래스' : 'Local Studios & Classes'}
                </h3>
                <div className={styles.grid}>
                  {group.workshops.map((workshop) => {
                    const name = workshop.name[locale] || workshop.name.ko || workshop.name.en || '';
                    const desc = workshop.description[locale] || workshop.description.ko || workshop.description.en || '';
                    const hasImage = workshop.images && workshop.images.length > 0;

                    return (
                      <div key={workshop.id} className={styles.card} onClick={() => onWorkshopClick(workshop)}>
                        <div className={styles.imageArea}>
                          {hasImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={workshop.images[0]} alt={name} className={styles.image} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', gap: '4px' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src="/logo.png" alt="Art Flow Map" style={{ width: '36px', height: '36px', objectFit: 'contain', opacity: 0.85 }} />
                              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>Art Flow Map</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.contentArea}>
                          <h3 className={styles.title}>{name}</h3>
                          <div className={styles.subtitle} style={{ color: '#ff6b35' }}>⭐ {workshop.rating} ({workshop.reviewCount})</div>

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
