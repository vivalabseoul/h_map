'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import FilterBar from '@/components/FilterBar';
import BottomSheet from '@/components/BottomSheet';
import type { Workshop, WorkshopCategory, Region } from '@/types';
import { getWorkshops } from '@/lib/firestore';

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
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [activeCategory, setActiveCategory] = useState<WorkshopCategory | 'all'>('all');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<Region>('korea');
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);

  useEffect(() => {
    getWorkshops().then(setWorkshops);
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
  }, []);

  return (
    <main>
      <Header />
      <FilterBar
        activeCategory={activeCategory}
        activeTags={activeTags}
        onCategoryChange={setActiveCategory}
        onTagToggle={handleTagToggle}
      />
      <MapView
        workshops={filteredWorkshops}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        onMarkerClick={handleMarkerClick}
      />
      {selectedWorkshop && (
        <BottomSheet
          workshop={selectedWorkshop}
          onClose={() => setSelectedWorkshop(null)}
        />
      )}
    </main>
  );
}
