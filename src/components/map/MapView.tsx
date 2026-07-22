'use client';
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import WorkshopMarker from './WorkshopMarker';
import { useLanguage } from '@/context/LanguageContext';
import type { Workshop, Region, FleaMarket } from '@/types';
import { REGIONS } from '@/types';
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
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 0.8 });
  }, [map, center, zoom]);
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

function MapContent({ workshops, fleaMarkets = [], selectedRegion, onRegionChange, onMarkerClick, onFleaMarketClick, onBoundsChanged }: MapViewProps) {
  const { locale, t } = useLanguage();
  const regionData = REGIONS.find((r) => r.key === selectedRegion) || REGIONS[0];
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    return () => {
      if (containerRef.current) {
        const container = containerRef.current.querySelector('.leaflet-container') as any;
        if (container && container._leaflet_id) {
          delete container._leaflet_id;
        }
      }
    };
  }, []);

  return (
    <>
      <div ref={containerRef} className={styles.mapContainer}>
        <MapContainer
          center={regionData.center}
          zoom={regionData.zoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapUpdater center={regionData.center} zoom={regionData.zoom} />
          <MapEvents onBoundsChanged={onBoundsChanged} />

          {workshops.map((workshop) => (
            <WorkshopMarker
              key={workshop.id}
              workshop={workshop}
              onClick={() => onMarkerClick(workshop)}
            />
          ))}

          {fleaMarkets.map((market) => {
            const isApi = market.source === 'api';
            const bgColor = isApi ? '#f59e0b' : '#0284c7';
            
            return (
              <Marker
                key={market.id}
                position={[market.lat, market.lng]}
                icon={L.divIcon({
                  className: 'festival-dot-marker',
                  html: `<div style="width: 100%; height: 100%; border-radius: 50%; background: ${bgColor};"></div>`,
                  iconSize: [18, 18],
                  iconAnchor: [9, 9],
                  popupAnchor: [0, -12],
                })}
              >
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', width: '200px' }}>
                  <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>{market.name[locale] || market.name.ko || market.name.en}</strong>
                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '2px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {market.description[locale] || market.description.ko || market.description.en || '소개글이 없습니다.'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 500 }}>
                    일정: {market.date.replace(/20(\d{2})/g, '$1').replace(/-/g, '.')}
                  </div>
                  <button 
                    style={{ marginTop: '8px', width: '100%', padding: '6px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
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
