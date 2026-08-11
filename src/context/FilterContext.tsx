'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Region } from '@/types';
import { requestUserLocation, type Coordinates } from '@/lib/geolocation';

type ViewMode = 'map' | 'list';
export type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

interface FilterContextType {
  selectedRegion: Region;
  setSelectedRegion: (region: Region) => void;
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  activeTags: string[];
  setActiveTags: (tags: string[]) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userLocation: Coordinates | null;
  locationStatus: LocationStatus;
  requestNearbySort: () => Promise<void>;
  clearNearbySort: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [selectedRegion, setSelectedRegion] = useState<Region>('korea');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');

  const requestNearbySort = useCallback(async () => {
    setLocationStatus('loading');
    try {
      const coords = await requestUserLocation();
      setUserLocation(coords);
      setLocationStatus('granted');
    } catch {
      setUserLocation(null);
      setLocationStatus('denied');
    }
  }, []);

  const clearNearbySort = useCallback(() => {
    setUserLocation(null);
    setLocationStatus('idle');
  }, []);

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
        searchQuery,
        setSearchQuery,
        userLocation,
        locationStatus,
        requestNearbySort,
        clearNearbySort,
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
