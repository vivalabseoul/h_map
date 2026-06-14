'use client';
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import WorkshopMarker from './WorkshopMarker';
import { useLanguage } from '@/context/LanguageContext';
import type { Workshop, Region } from '@/types';
import { REGIONS } from '@/types';
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
  selectedRegion: Region;
  onRegionChange: (region: Region) => void;
  onMarkerClick: (workshop: Workshop) => void;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useMemo(() => {
    map.setView(center, zoom, { animate: true, duration: 0.8 });
  }, [map, center, zoom]);
  return null;
}

function MapContent({ workshops, selectedRegion, onRegionChange, onMarkerClick }: MapViewProps) {
  const { locale, t } = useLanguage();
  const regionData = REGIONS.find((r) => r.key === selectedRegion) || REGIONS[0];

  return (
    <>
      <div className={styles.mapContainer}>
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

          {workshops.map((workshop) => (
            <WorkshopMarker
              key={workshop.id}
              workshop={workshop}
              onClick={() => onMarkerClick(workshop)}
            />
          ))}
        </MapContainer>
      </div>

      {/* Region Selector */}
      <div className={styles.regionBar} id="region-selector">
        {REGIONS.map((region) => (
          <button
            key={region.key}
            className={`${styles.regionTab} ${
              selectedRegion === region.key ? styles.regionTabActive : ''
            } ${!region.available ? styles.regionTabDisabled : ''}`}
            onClick={() => region.available && onRegionChange(region.key)}
            disabled={!region.available}
          >
            <span>{region.emoji}</span>
            <span>{region.label[locale]}</span>
            {!region.available && (
              <span className={styles.comingSoon}>{t('region.coming_soon')}</span>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

export default MapContent;
