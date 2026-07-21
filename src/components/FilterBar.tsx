'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES, SMART_TAGS, REGIONS } from '@/types';
import { getDynamicCategories } from '@/lib/categoryUtils';
import { getDynamicRegions } from '@/lib/regionUtils';
import type { WorkshopCategory, Region, Workshop } from '@/types';
import { ChevronDown, Search, Map, List } from 'lucide-react';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  workshops?: Workshop[];
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
  activeCategory: WorkshopCategory | 'all';
  activeLanguage: string;
  onCategoryChange: (category: WorkshopCategory | 'all') => void;
  onLanguageChange: (language: string) => void;
  viewMode?: 'map' | 'list';
  onViewModeChange?: (mode: 'map' | 'list') => void;
}

export default function FilterBar({
  workshops = [],
  selectedRegion,
  onRegionChange,
  activeCategory,
  activeLanguage,
  onCategoryChange,
  onLanguageChange,
  viewMode = 'map',
  onViewModeChange = () => { },
}: FilterBarProps) {
  const { locale, t } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState<'region' | 'category' | 'language' | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (name: 'region' | 'category' | 'language') => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  const dynamicRegions = getDynamicRegions(workshops, [], locale);
  const selectedRegionData = dynamicRegions.find(r => r.key === selectedRegion) || dynamicRegions[0] || REGIONS[0];
  const dynamicCategories = getDynamicCategories(workshops);
  const selectedCatData = dynamicCategories.find(c => c.key === activeCategory);

  const getCatLabel = (key: string) => {
    const raw = t(`filters.${key}`);
    return raw === `filters.${key}` ? key : raw;
  };

  // Determine what to show on the button
  let buttonLabel: React.ReactNode = locale === 'ko' ? '카테고리' : 'Category';
  if (activeCategory !== 'all') {
    if (selectedCatData) {
      buttonLabel = <>{getCatLabel(activeCategory)}</>;
    } else {
      buttonLabel = <>{activeCategory}</>;
    }
  }

  return (
    <div className={styles.filterBar} id="filter-bar" ref={barRef} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', overflow: 'visible', alignItems: 'center' }}>

      {/* 1. Region Dropdown */}
      <div style={{ position: 'relative' }}>
        <button className={styles.chip} onClick={() => toggleDropdown('region')} style={{ background: openDropdown === 'region' ? 'var(--color-bg-secondary)' : 'var(--color-surface)' }}>
          {selectedRegionData.emoji} <ChevronDown size={14} style={{ marginLeft: 4 }} />
        </button>
        {openDropdown === 'region' && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, minWidth: '160px', display: 'flex', flexDirection: 'column', padding: 'var(--space-2)' }}>
            {dynamicRegions.map(region => (
              <button
                key={region.key}
                disabled={!region.available}
                onClick={() => { if (region.available) { onRegionChange(region.key); setOpenDropdown(null); } }}
                style={{ textAlign: 'left', padding: 'var(--space-2)', background: selectedRegion === region.key ? 'var(--color-bg-secondary)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: region.available ? 'pointer' : 'not-allowed', opacity: region.available ? 1 : 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span>{region.emoji} {region.label[locale]}</span>
                {region.count > 0 && region.key !== 'all' && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-accent)', fontWeight: 600, marginLeft: 8 }}>
                    {region.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Category Dropdown */}
      <div style={{ position: 'relative' }}>
        <button className={styles.chip} onClick={() => toggleDropdown('category')} style={{ background: openDropdown === 'category' ? 'var(--color-bg-secondary)' : 'var(--color-surface)' }}>
          {buttonLabel}
          <ChevronDown size={14} style={{ marginLeft: 4 }} />
        </button>
        {openDropdown === 'category' && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, minWidth: '150px', display: 'flex', flexDirection: 'column', padding: 'var(--space-2)' }}>
            <button
              onClick={() => { onCategoryChange('all'); setOpenDropdown(null); }}
              style={{ textAlign: 'left', padding: 'var(--space-2)', background: activeCategory === 'all' ? 'var(--color-bg-secondary)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            >
              {locale === 'ko' ? '전체 카테고리' : 'All Categories'}
            </button>
            {dynamicCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => { onCategoryChange(cat.key); setOpenDropdown(null); }}
                style={{ textAlign: 'left', padding: 'var(--space-2)', background: activeCategory === cat.key ? 'var(--color-bg-secondary)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                {getCatLabel(cat.key)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Language Dropdown */}
      <div className={styles.languageFilter} style={{ position: 'relative' }}>
        <button className={styles.chip} onClick={() => toggleDropdown('language')} style={{ background: openDropdown === 'language' ? 'var(--color-bg-secondary)' : 'var(--color-surface)' }}>
          {activeLanguage === 'all' ? (locale === 'ko' ? '🌐 사용언어' : '🌐 Language') : `🌐 ${[
            { value: 'English', label: 'English' },
            { value: 'Korean', label: '한국어' },
            { value: 'Japanese', label: '日本語' },
            { value: 'Chinese', label: '中文' }
          ].find(l => l.value === activeLanguage)?.label || activeLanguage}`}
          <ChevronDown size={14} style={{ marginLeft: 4 }} />
        </button>
        {openDropdown === 'language' && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, minWidth: '150px', display: 'flex', flexDirection: 'column', padding: 'var(--space-2)' }}>
            <button
              onClick={() => { onLanguageChange('all'); setOpenDropdown(null); }}
              style={{ textAlign: 'left', padding: 'var(--space-2)', background: activeLanguage === 'all' ? 'var(--color-bg-secondary)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            >
              {locale === 'ko' ? '모든 사용언어' : 'All Languages'}
            </button>
            {[
              { value: 'English', label: 'English' },
              { value: 'Korean', label: '한국어' },
              { value: 'Japanese', label: '日本語' },
              { value: 'Chinese', label: '中文' }
            ].map(lang => (
              <button
                key={lang.value}
                onClick={() => { onLanguageChange(lang.value); setOpenDropdown(null); }}
                style={{ textAlign: 'left', padding: 'var(--space-2)', background: activeLanguage === lang.value ? 'var(--color-bg-secondary)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ flexGrow: 1 }} />

      {/* View Mode Toggle */}
      <div className={styles.viewModeToggle}>
        <button
          onClick={() => onViewModeChange?.('list')}
          style={{
            padding: '6px 12px',
            border: viewMode === 'list' ? '1px solid var(--color-text-primary)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            background: viewMode === 'list' ? 'var(--color-text-primary)' : 'transparent',
            boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0, 0, 0, 0.2)' : 'none',
            color: viewMode === 'list' ? '#ffffff' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          aria-label="List View"
        >
          <List size={18} strokeWidth={viewMode === 'list' ? 2.5 : 2} />
        </button>
        <button
          onClick={() => onViewModeChange?.('map')}
          style={{
            padding: '6px 12px',
            border: viewMode === 'map' ? '1px solid var(--color-text-primary)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            background: viewMode === 'map' ? 'var(--color-text-primary)' : 'transparent',
            boxShadow: viewMode === 'map' ? '0 2px 4px rgba(0, 0, 0, 0.2)' : 'none',
            color: viewMode === 'map' ? '#ffffff' : 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          aria-label="Map View"
        >
          <Map size={18} strokeWidth={viewMode === 'map' ? 2.5 : 2} />
        </button>
      </div>

    </div>
  );
}
