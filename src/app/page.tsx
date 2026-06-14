'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FilterBar from '@/components/FilterBar';
import BottomSheet from '@/components/BottomSheet';
import FleaMarketSheet from '@/components/FleaMarketSheet';
import type { Workshop, WorkshopCategory, Region, FleaMarket } from '@/types';
import { getWorkshops, getFleaMarkets } from '@/lib/database';

import ListView from '@/components/ListView';

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
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region>('korea');
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [selectedFleaMarket, setSelectedFleaMarket] = useState<FleaMarket | null>(null);

  useEffect(() => {
    getWorkshops().then(setWorkshops);
    getFleaMarkets().then(setFleaMarkets);
  }, []);

  const filteredWorkshops = useMemo(() => {
    return workshops.filter((w) => {
      if (w.region !== selectedRegion) return false;
      if (w.status !== 'active') return false;
      if (activeCategory !== 'all' && w.category !== activeCategory) return false;
      if (activeTags.length > 0 && !activeTags.every((tag) => w.tags.includes(tag))) return false;
      return true;
    });
  }, [workshops, activeCategory, activeTags, selectedRegion]);

  const handleTagToggle = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleMarkerClick = useCallback((workshop: Workshop) => {
    setSelectedWorkshop(workshop);
    setSelectedFleaMarket(null);
  }, []);

  const handleFleaMarketClick = useCallback((market: FleaMarket) => {
    setSelectedFleaMarket(market);
    setSelectedWorkshop(null);
  }, []);

  return (
    <main style={{ position: 'relative' }}>
      <FilterBar
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        activeCategory={activeCategory}
        activeTags={activeTags}
        onCategoryChange={setActiveCategory}
        onTagToggle={handleTagToggle}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      {viewMode === 'map' ? (
        <MapView
          workshops={filteredWorkshops}
          fleaMarkets={fleaMarkets}
          selectedRegion={selectedRegion}
          onRegionChange={setSelectedRegion}
          onMarkerClick={handleMarkerClick}
          onFleaMarketClick={handleFleaMarketClick}
        />
      ) : (
        <ListView
          workshops={filteredWorkshops}
          fleaMarkets={fleaMarkets}
          onWorkshopClick={handleMarkerClick}
          onFleaMarketClick={handleFleaMarketClick}
        />
      )}

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
