'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FilterBar from '@/components/FilterBar';

import type { Workshop, Region, FleaMarket } from '@/types';
import { matchesWorkshopQuery, matchesEventQuery } from '@/lib/workshopSearch';
import type { PlaceTypeFilter } from '@/lib/placeTypes';
import { getWorkshops, getFleaMarkets, incrementWorkshopLinkClick } from '@/lib/database';
import { useFilter } from '@/context/FilterContext';
import { useLocalizedRouter } from '@/context/LanguageContext';
import { getDistanceKm } from '@/lib/distance';

import ListView from '@/components/ListView';
import pageStyles from '@/app/[locale]/page.module.css';
import { useAuth } from '@/context/AuthContext';

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
        <img src="/logo.png" alt="Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '1rem', animation: 'pulse 1.5s infinite' }} />
        <p style={{ color: '#6b5b54', fontSize: '0.9rem' }}>Loading map...</p>
      </div>
    </div>
  ),
});

export default function HomeClient({ initialWorkshopId }: { initialWorkshopId?: string }) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [fleaMarkets, setFleaMarkets] = useState<FleaMarket[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PlaceTypeFilter>('all');
  const [selectedRegion, setSelectedRegion] = useState<Region>('korea');
  const { searchQuery, viewMode, setViewMode, userLocation } = useFilter();
  const [mapBounds, setMapBounds] = useState<{ north: number; south: number; east: number; west: number } | null>(null);
  const router = useLocalizedRouter();

  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobile = window.innerWidth <= 760;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode('map');
      }
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 760);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    getWorkshops().then(async (data) => {
      let fullData = data;
      let target = data.find(w => w.id === initialWorkshopId);

      // If initialWorkshopId is provided but not found in the main list (e.g., demo data fallback)
      if (initialWorkshopId && !target) {
        const { getWorkshopById } = await import('@/lib/database');
        const extra = await getWorkshopById(initialWorkshopId);
        if (extra) {
          target = extra;
          fullData = [...data, extra];
        }
      }

      setWorkshops(fullData);
    });
    getFleaMarkets().then(setFleaMarkets);
  }, [initialWorkshopId]);

  const { user } = useAuth();
  
  // Everything that matches region and search; the type tab is applied afterwards so each tab can show its own count
  const matchedWorkshops = useMemo(() => {
    return workshops.filter((w) => {
      // Role-based visibility
      if (w.isPrivate) {
        if (!user) return false;
        if (user.role !== 'super_admin' && user.role !== 'manager' && w.ownerId !== user.id) {
          return false;
        }
      }

      if (w.status !== 'active') return false;
      if (selectedRegion !== 'all' && w.region !== selectedRegion) return false;
      if (!matchesWorkshopQuery(w, filterQuery)) return false;
      if (!matchesWorkshopQuery(w, searchQuery)) return false;
      return true;
    });
  }, [workshops, filterQuery, selectedRegion, searchQuery, user]);

  const globalWorkshops = useMemo(
    () => (typeFilter === 'event' ? [] : matchedWorkshops),
    [matchedWorkshops, typeFilter],
  );

  const sortedGlobalWorkshops = useMemo(() => {
    if (!userLocation) return globalWorkshops;
    return [...globalWorkshops].sort((a, b) => {
      const distA = getDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [globalWorkshops, userLocation]);

  const viewportWorkshops = useMemo(() => {
    if (searchQuery.trim() !== '' || filterQuery.trim() !== '') return sortedGlobalWorkshops;
    if (!isMobile && viewMode === 'list') return sortedGlobalWorkshops;
    if (mapBounds) {
      return sortedGlobalWorkshops.filter(w => {
        return w.lat <= mapBounds.north && w.lat >= mapBounds.south &&
               w.lng <= mapBounds.east && w.lng >= mapBounds.west;
      });
    }
    return sortedGlobalWorkshops;
  }, [sortedGlobalWorkshops, mapBounds, searchQuery, filterQuery, isMobile, viewMode]);

  const matchedFleaMarkets = useMemo(() => {
    return fleaMarkets.filter((m) => {
      if (m.status === 'inactive') return false;
      if (selectedRegion !== 'all' && (m as any).region && (m as any).region !== selectedRegion) return false;
      if (!matchesEventQuery(m, filterQuery)) return false;
      if (!matchesEventQuery(m, searchQuery)) return false;
      return true;
    });
  }, [fleaMarkets, filterQuery, searchQuery, selectedRegion]);

  const globalFleaMarkets = useMemo(
    () => (typeFilter === 'workshop' ? [] : matchedFleaMarkets),
    [matchedFleaMarkets, typeFilter],
  );

  const sortedGlobalFleaMarkets = useMemo(() => {
    if (!userLocation) return globalFleaMarkets;
    return [...globalFleaMarkets].sort((a, b) => {
      const distA = getDistanceKm(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = getDistanceKm(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [globalFleaMarkets, userLocation]);

  const viewportFleaMarkets = useMemo(() => {
    if (searchQuery.trim() !== '' || filterQuery.trim() !== '') return sortedGlobalFleaMarkets;
    if (!isMobile && viewMode === 'list') return sortedGlobalFleaMarkets;
    if (mapBounds) {
      return sortedGlobalFleaMarkets.filter(m => {
        return m.lat <= mapBounds.north && m.lat >= mapBounds.south &&
               m.lng <= mapBounds.east && m.lng >= mapBounds.west;
      });
    }
    return sortedGlobalFleaMarkets;
  }, [sortedGlobalFleaMarkets, mapBounds, searchQuery, filterQuery, isMobile, viewMode]);

  const handleMarkerClick = useCallback((workshop: Workshop) => {
    incrementWorkshopLinkClick(workshop.id, 'map_pin').catch(console.error);
    router.push(`/workshops/${workshop.slug || workshop.id}`);
  }, [router]);

  const handleListItemClick = useCallback((workshop: Workshop) => {
    incrementWorkshopLinkClick(workshop.id, 'list_item').catch(console.error);
    router.push(`/workshops/${workshop.slug || workshop.id}`);
  }, [router]);

  const handleFleaMarketClick = useCallback((market: FleaMarket) => {
    router.push(`/fleamarkets/${market.id}`);
  }, [router]);

  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <FilterBar
        workshops={workshops}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        query={filterQuery}
        onQueryChange={setFilterQuery}
        typeFilter={typeFilter}
        onTypeChange={setTypeFilter}
        counts={{ workshop: matchedWorkshops.length, event: matchedFleaMarkets.length }}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      
      <div className={pageStyles.homeLayout}>
        <div className={pageStyles.mapWrapper}>
          <MapView
            workshops={globalWorkshops}
            fleaMarkets={globalFleaMarkets}
            selectedRegion={selectedRegion}
            onRegionChange={setSelectedRegion}
            onMarkerClick={handleMarkerClick}
            onFleaMarketClick={handleFleaMarketClick}
            onBoundsChanged={setMapBounds}
            userLocation={userLocation}
            fitKey={searchQuery.trim() || filterQuery.trim() ? `${searchQuery.trim()}|${filterQuery.trim()}` : undefined}
          />
        </div>
        
        <div className={`${pageStyles.listWrapper} ${viewMode === 'map' ? pageStyles.listHidden : ''}`}>
          <ListView
            workshops={viewportWorkshops}
            fleaMarkets={viewportFleaMarkets}
            mapBounds={mapBounds}
            userLocation={userLocation}
            onWorkshopClick={handleListItemClick}
            onFleaMarketClick={handleFleaMarketClick}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>

    </main>
  );
}
