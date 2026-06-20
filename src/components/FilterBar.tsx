'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES, SMART_TAGS, REGIONS } from '@/types';
import { getDynamicCategories } from '@/lib/categoryUtils';
import type { WorkshopCategory, Region, Workshop } from '@/types';
import { ChevronDown, Search } from 'lucide-react';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  workshops?: Workshop[];
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
  activeCategory: WorkshopCategory | 'all';
  activeLanguage: string;
  onCategoryChange: (category: WorkshopCategory | 'all') => void;
  onLanguageChange: (language: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
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
  searchQuery,
  onSearchQueryChange,
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

  const selectedRegionData = REGIONS.find(r => r.key === selectedRegion) || REGIONS[0];
  const dynamicCategories = getDynamicCategories(workshops);
  const selectedCatData = dynamicCategories.find(c => c.key === activeCategory);

  const getCatLabel = (key: string) => {
    const raw = t(`filters.${key}`);
    return raw === `filters.${key}` ? key : raw;
  };

  // Determine what to show on the button
  let buttonLabel: React.ReactNode = t('filters.all');
  if (activeCategory !== 'all') {
    if (selectedCatData) {
      buttonLabel = <><span className={styles.chipEmoji}>{selectedCatData.emoji}</span>{getCatLabel(activeCategory)}</>;
    } else {
      buttonLabel = <><span className={styles.chipEmoji}>🏷️</span>{activeCategory}</>;
    }
  }

  return (
    <div className={styles.filterBar} id="filter-bar" ref={barRef} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-4)', overflow: 'visible', alignItems: 'center' }}>

      {/* 1. Region Dropdown */}
      <div style={{ position: 'relative' }}>
        <button className={styles.chip} onClick={() => toggleDropdown('region')} style={{ background: openDropdown === 'region' ? 'var(--color-bg-secondary)' : '#fff' }}>
          {selectedRegionData.emoji} {selectedRegionData.label[locale]} <ChevronDown size={14} style={{ marginLeft: 4 }} />
        </button>
        {openDropdown === 'region' && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, minWidth: '150px', display: 'flex', flexDirection: 'column', padding: 'var(--space-2)' }}>
            {REGIONS.map(region => (
              <button
                key={region.key}
                disabled={!region.available}
                onClick={() => { if (region.available) { onRegionChange(region.key); setOpenDropdown(null); } }}
                style={{ textAlign: 'left', padding: 'var(--space-2)', background: selectedRegion === region.key ? 'var(--color-bg-secondary)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: region.available ? 'pointer' : 'not-allowed', opacity: region.available ? 1 : 0.5, display: 'flex', justifyContent: 'space-between' }}
              >
                <span>{region.emoji} {region.label[locale]}</span>
                {!region.available && <span style={{ fontSize: '0.7rem', color: 'var(--color-warning)' }}>{t('region.coming_soon')}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Category Dropdown */}
      <div style={{ position: 'relative' }}>
        <button className={styles.chip} onClick={() => toggleDropdown('category')} style={{ background: openDropdown === 'category' ? 'var(--color-bg-secondary)' : '#fff' }}>
          {buttonLabel}
          <ChevronDown size={14} style={{ marginLeft: 4 }} />
        </button>
        {openDropdown === 'category' && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, minWidth: '150px', display: 'flex', flexDirection: 'column', padding: 'var(--space-2)' }}>
            <button
              onClick={() => { onCategoryChange('all'); setOpenDropdown(null); }}
              style={{ textAlign: 'left', padding: 'var(--space-2)', background: activeCategory === 'all' ? 'var(--color-bg-secondary)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            >
              {t('filters.all')}
            </button>
            {dynamicCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => { onCategoryChange(cat.key); setOpenDropdown(null); }}
                style={{ textAlign: 'left', padding: 'var(--space-2)', background: activeCategory === cat.key ? 'var(--color-bg-secondary)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                {cat.emoji} {getCatLabel(cat.key)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Language Dropdown */}
      <div className={styles.languageFilter} style={{ position: 'relative' }}>
        <button className={styles.chip} onClick={() => toggleDropdown('language')} style={{ background: openDropdown === 'language' ? 'var(--color-bg-secondary)' : '#fff' }}>
          {activeLanguage === 'all' ? '🌐 Language' : `🌐 ${activeLanguage}`}
          <ChevronDown size={14} style={{ marginLeft: 4 }} />
        </button>
        {openDropdown === 'language' && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 4, background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 1000, minWidth: '150px', display: 'flex', flexDirection: 'column', padding: 'var(--space-2)' }}>
            <button
              onClick={() => { onLanguageChange('all'); setOpenDropdown(null); }}
              style={{ textAlign: 'left', padding: 'var(--space-2)', background: activeLanguage === 'all' ? 'var(--color-bg-secondary)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
            >
              All Languages
            </button>
            {['English', 'Korean', 'Japanese', 'Chinese', 'Spanish', 'French'].map(lang => (
              <button
                key={lang}
                onClick={() => { onLanguageChange(lang); setOpenDropdown(null); }}
                style={{ textAlign: 'left', padding: 'var(--space-2)', background: activeLanguage === lang ? 'var(--color-bg-secondary)' : 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
              >
                {lang}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Search Input */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search 
          size={16} 
          style={{ 
            position: 'absolute', 
            left: 'var(--space-3)', 
            color: 'var(--color-text-tertiary)' 
          }} 
        />
        <input
          type="text"
          placeholder={t('search') || 'Search...'}
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div style={{ flexGrow: 1 }} />

      {/* View Mode Toggle */}
      <div style={{ display: 'flex', gap: '4px', background: 'var(--color-bg-secondary)', padding: '4px', borderRadius: 'var(--radius-full)' }}>
        <button
          onClick={() => onViewModeChange('list')}
          style={{
            padding: '5px 13px', // padding reduced by 1px to offset 1px border and avoid height jump
            border: viewMode === 'list' ? '1px solid var(--color-text-primary)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            background: viewMode === 'list' ? 'var(--color-text-primary)' : 'transparent',
            boxShadow: viewMode === 'list' ? '0 2px 4px rgba(0, 0, 0, 0.2)' : 'none',
            color: viewMode === 'list' ? '#ffffff' : 'var(--color-text-secondary)',
            fontWeight: viewMode === 'list' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          📋 List
        </button>
        <button
          onClick={() => onViewModeChange('map')}
          style={{
            padding: '5px 13px', // padding reduced by 1px to offset 1px border and avoid height jump
            border: viewMode === 'map' ? '1px solid var(--color-text-primary)' : '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            background: viewMode === 'map' ? 'var(--color-text-primary)' : 'transparent',
            boxShadow: viewMode === 'map' ? '0 2px 4px rgba(0, 0, 0, 0.2)' : 'none',
            color: viewMode === 'map' ? '#ffffff' : 'var(--color-text-secondary)',
            fontWeight: viewMode === 'map' ? 600 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
        >
          🗺️ Map
        </button>
      </div>

    </div>
  );
}
