'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FilterBar from '@/components/FilterBar';
import BottomSheet from '@/components/BottomSheet';
import FleaMarketSheet from '@/components/FleaMarketSheet';
import type { Workshop, WorkshopCategory, Region, FleaMarket } from '@/types';
import { getWorkshops, getFleaMarkets } from '@/lib/database';

import ListView from '@/components/ListView';
import pageStyles from './page.module.css';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#faf8f5',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }}>🧶</div>
        <p style={{ color: '#6b5b54', fontSize: '0.9rem' }}>Loading map...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [fleaMarkets, setFleaMarkets] = useState<FleaMarket[]>([]);
  const [activeCategory, setActiveCategory] = useState<WorkshopCategory | 'all'>('all');
  const [activeLanguage, setActiveLanguage] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<Region>('korea');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [selectedFleaMarket, setSelectedFleaMarket] = useState<FleaMarket | null>(null);

  useEffect(() => {
    getWorkshops().then(setWorkshops);
    getFleaMarkets().then(setFleaMarkets);
  }, []);

  const globalWorkshops = useMemo(() => {
    return workshops.filter((w) => {
      if (w.status !== 'active') return false;
      if (selectedRegion !== 'all' && w.region !== selectedRegion) return false;
      if (activeCategory !== 'all' && w.category !== activeCategory) return false;
      if (activeLanguage !== 'all' && (!w.languages || !w.languages.includes(activeLanguage))) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = Object.values(w.name).some(n => n?.toLowerCase().includes(q));
        const matchesAddress = Object.values(w.address).some(a => a?.toLowerCase().includes(q));
        const matchesDescription = Object.values(w.description || {}).some(d => d?.toLowerCase().includes(q));
        const matchesTags = w.tags.some(t => t.toLowerCase().includes(q));
        if (!matchesName && !matchesAddress && !matchesDescription && !matchesTags) return false;
      }
      return true;
    });
  }, [workshops, activeCategory, activeLanguage, selectedRegion, searchQuery]);

  const viewportWorkshops = useMemo(() => {
    if (searchQuery.trim() !== '') return globalWorkshops;
    if (mapBounds) {
      return globalWorkshops.filter(w => {
        return w.lat <= mapBounds.north && w.lat >= mapBounds.south &&
               w.lng <= mapBounds.east && w.lng >= mapBounds.west;
      });
    }
    return globalWorkshops;
  }, [globalWorkshops, mapBounds, searchQuery]);

  const globalFleaMarkets = useMemo(() => {
    return fleaMarkets.filter((m) => {
      if (m.status === 'inactive') return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = Object.values(m.name || {}).some(n => n?.toLowerCase().includes(q));
        const matchesAddress = Object.values(m.address || {}).some(a => a?.toLowerCase().includes(q));
        const matchesDescription = Object.values(m.description || {}).some(d => d?.toLowerCase().includes(q));
        if (!matchesName && !matchesAddress && !matchesDescription) return false;
      }
      return true;
    });
  }, [fleaMarkets, searchQuery]);

  const viewportFleaMarkets = useMemo(() => {
    if (mapBounds) {
      return globalFleaMarkets.filter(m => {
        return m.lat <= mapBounds.north && m.lat >= mapBounds.south &&
               m.lng <= mapBounds.east && m.lng >= mapBounds.west;
      });
    }
    return globalFleaMarkets;
  }, [globalFleaMarkets, mapBounds]);

  const handleMarkerClick = useCallback((workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setSelectedFleaMarket(null);
  }, []);

  const handleFleaMarketClick = useCallback((market: FleaMarket) => {
    setSelectedFleaMarket(market);
    setSelectedWorkshop(null);
  }, []);

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <FilterBar
        workshops={workshops}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        activeCategory={activeCategory}
        activeLanguage={activeLanguage}
        onCategoryChange={setActiveCategory}
        onLanguageChange={setActiveLanguage}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <div className={pageStyles.homeLayout}>
        <div className={`${pageStyles.mapWrapper} ${viewMode === 'list' ? pageStyles.mapHiddenDesktop : ''} ${viewMode === 'list' ? pageStyles.hideMobile : ''}`}>
          <MapView
            workshops={globalWorkshops}
            fleaMarkets={globalFleaMarkets}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            onMarkerClick={handleMarkerClick}
            onFleaMarketClick={handleFleaMarketClick}
            onBoundsChanged={setMapBounds}
          />
        </div>
        
        <div className={`${pageStyles.listWrapper} ${viewMode === 'list' ? pageStyles.listFullWidth : ''} ${viewMode === 'map' ? pageStyles.hideMobile : ''}`}>
          <ListView
            workshops={viewportWorkshops}
            fleaMarkets={viewportFleaMarkets}
            onWorkshopClick={handleMarkerClick}
            onFleaMarketClick={handleFleaMarketClick}
          />
        </div>
      </div>

      {selectedWorkshop && (
        <BottomSheet
          workshop={selectedWorkshop}
          allWorkshops={workshops}
          onWorkshopClick={handleMarkerClick}
          onClose={() => setSelectedWorkshop(null)}
        />
      )}
      {selectedFleaMarket && (
        <FleaMarketSheet
          market={selectedFleaMarket}
          onClose={() => setSelectedFleaMarket(null)}
        />
      )}
      
      
    </main>
  );
}
