'use client';
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import WorkshopMarker from './WorkshopMarker';
import { useLanguage } from '@/context/LanguageContext';
import type { Workshop, Region, FleaMarket } from '@/types';
import { REGIONS } from '@/types';
import { PLACE_TYPE_COLORS, placeLabel, eventKindLabel } from '@/lib/placeTypes';
import { Marker, Popup } from 'react-leaflet';
import styles from './MapView.module.css';

// Fix Leaflet default icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  workshops: Workshop[];
  fleaMarkets?: FleaMarket[];
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
  onMarkerClick: (workshop: Workshop) => void;
  onFleaMarketClick?: (market: FleaMarket) => void;
  onBoundsChanged?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  userLocation?: { lat: number; lng: number } | null;
  // Changes when a search is submitted; the map then moves to show the results
  fitKey?: string;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.8 });
  }, [map, center, zoom]);
  return null;
}

// After a search, bring the results into view (e.g. searching "제주" while the map shows Seoul)
function MapFitter({ points, fitKey }: { points: [number, number][]; fitKey?: string }) {
  const map = useMap();
  const pointsRef = React.useRef(points);
  // Runs before the fit effect below, so the fit always sees the results of the current search
  React.useEffect(() => {
    pointsRef.current = points;
  });

  React.useEffect(() => {
    if (!fitKey || pointsRef.current.length === 0) return;
    map.fitBounds(L.latLngBounds(pointsRef.current), { padding: [48, 48], maxZoom: 13, animate: true, duration: 0.8 });
  }, [map, fitKey]);
  return null;
}

function MapEvents({ onBoundsChanged }: { onBoundsChanged?: (bounds: { north: number; south: number; east: number; west: number }) => void }) {
  const onBoundsChangedRef = React.useRef(onBoundsChanged);
  onBoundsChangedRef.current = onBoundsChanged;

  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChangedRef.current) {
        const bounds = map.getBounds();
        onBoundsChangedRef.current({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      }
    },
    zoomend: () => {
      if (onBoundsChangedRef.current) {
        const bounds = map.getBounds();
        onBoundsChangedRef.current({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        });
      }
    }
  });

  React.useEffect(() => {
    if (onBoundsChangedRef.current && map) {
      const bounds = map.getBounds();
      onBoundsChangedRef.current({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      });
    }
  }, [map]);

  return null;
}

function MapContent({ workshops, fleaMarkets = [], selectedRegion, onRegionChange, onMarkerClick, onFleaMarketClick, onBoundsChanged, userLocation, fitKey }: MapViewProps) {
  const { locale, t } = useLanguage();
  const regionData = REGIONS.find((r) => r.key === selectedRegion) || REGIONS[0];
  const containerRef = React.useRef<HTMLDivElement>(null);

  const mapCenter = React.useMemo<[number, number]>(
    () => (userLocation ? [userLocation.lat, userLocation.lng] : regionData.center),
    [userLocation?.lat, userLocation?.lng, regionData]
  );
  const mapZoom = userLocation ? 14 : regionData.zoom;

  React.useEffect(() => {
    return () => {
      if (containerRef.current) {
        const container = containerRef.current.querySelector('.leaflet-container') as any;
        if (container && container._leaflet_id) {
          delete container._leaflet_id;
        }
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Festivals and flea markets share one color; blue is reserved for studios everywhere else on the site
  const eventDotIcon = React.useMemo(() => L.divIcon({
    className: 'festival-dot-marker',
    html: `<div style="width: 100%; height: 100%; border-radius: 50%; background: ${PLACE_TYPE_COLORS.event.fg};"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  }), []);

  const userLocationIcon = React.useMemo(() => L.divIcon({
    className: 'user-location-marker',
    html: '<div class="user-location-pulse"></div><div class="user-location-dot"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  }), []);

  return (
    <>
      <div ref={containerRef} className={styles.mapContainer}>
        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={styles.legendPin}>📍</span>
            {placeLabel('workshop', locale)}
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: PLACE_TYPE_COLORS.event.fg }} />
            {placeLabel('event', locale)}
          </span>
        </div>
        <MapContainer
          center={regionData.center}
          zoom={regionData.zoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapUpdater center={mapCenter} zoom={mapZoom} />
          <MapEvents onBoundsChanged={onBoundsChanged} />
          <MapFitter
            points={[...workshops, ...fleaMarkets].map((place) => [place.lat, place.lng] as [number, number])}
            fitKey={fitKey}
          />

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon} zIndexOffset={1000} />
          )}

          {workshops.map((workshop) => (
            <WorkshopMarker
              key={workshop.id}
              workshop={workshop}
              onClick={() => onMarkerClick(workshop)}
            />
          ))}

          {fleaMarkets.map((market) => {
            return (
              <Marker
                key={market.id}
                position={[market.lat, market.lng]}
                icon={eventDotIcon}
              >
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', width: '200px' }}>
                  <span style={{ display: 'inline-block', marginBottom: '6px', padding: '1px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: PLACE_TYPE_COLORS.event.bg, color: PLACE_TYPE_COLORS.event.fg }}>
                    {eventKindLabel(market, locale)}
                  </span>
                  <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{market.name[locale] || market.name.ko || market.name.en}</strong>
                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {market.description[locale] || market.description.ko || market.description.en || '소개글이 없습니다.'}
                  </div>
                  <div style={{ fontSize: '12px', color: PLACE_TYPE_COLORS.event.fg, fontWeight: 500 }}>
                    일정: {market.date.replace(/20(\d{2})/g, '$1').replace(/-/g, '.')}
                  </div>
                  <button 
                    style={{ marginTop: '8px', width: '100%', padding: '6px', background: PLACE_TYPE_COLORS.event.fg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onFleaMarketClick) onFleaMarketClick(market);
                    }}
                  >
                    상세 보기
                  </button>
                </div>
              </Popup>
            </Marker>
            );
          })}
        </MapContainer>
      </div>

    </>
  );
}

export default MapContent;
