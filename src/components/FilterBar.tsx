'use client';
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES, SMART_TAGS } from '@/types';
import type { WorkshopCategory } from '@/types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  activeCategory: WorkshopCategory | 'all';
  activeTags: string[];
  onCategoryChange: (category: WorkshopCategory | 'all') => void;
  onTagToggle: (tag: string) => void;
}

export default function FilterBar({
  activeCategory,
  activeTags,
  onCategoryChange,
  onTagToggle,
}: FilterBarProps) {
  const { t } = useLanguage();

  return (
    <div className={styles.filterBar} id="filter-bar">
      <div className={styles.scrollContainer}>
        {/* All category */}
        <button
          className={`${styles.chip} ${activeCategory === 'all' ? styles.chipActive : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          {t('filters.all')}
        </button>

        {/* Category chips */}
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`${styles.chip} ${activeCategory === cat.key ? styles.chipActive : ''}`}
            onClick={() => onCategoryChange(cat.key)}
          >
            <span className={styles.chipEmoji}>{cat.emoji}</span>
            {t(`filters.${cat.key}`)}
          </button>
        ))}

        <div className={styles.divider} />

        {/* Smart tag chips */}
        {SMART_TAGS.map((tag) => (
          <button
            key={tag}
            className={`${styles.chip} ${styles.tagChip} ${activeTags.includes(tag) ? styles.tagChipActive : ''}`}
            onClick={() => onTagToggle(tag)}
          >
            #{t(`filters.${tag}`)}
          </button>
        ))}
      </div>
    </div>
  );
}
