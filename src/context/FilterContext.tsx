'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Region } from '@/types';

type ViewMode = 'map' | 'list';

interface FilterContextType {
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  activeTags: string[];
  setActiveTags: (tags: string[]) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegion] = useState<Region>('korea');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('map');

  return (
    <FilterContext.Provider
      value={{
        selectedRegion,
        setSelectedRegion,
        activeCategory,
        setActiveCategory,
        activeTags,
        setActiveTags,
        viewMode,
        setViewMode,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
