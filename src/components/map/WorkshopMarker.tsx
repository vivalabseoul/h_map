'use client';
import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { CATEGORIES } from '@/types';
import type { Workshop } from '@/types';
import { getDynamicCategories } from '@/lib/categoryUtils';
import { useLanguage } from '@/context/LanguageContext';

interface WorkshopMarkerProps {
  workshop: Workshop;
  onClick: () => void;
}

function createMarkerIcon(category: string, workshop: Workshop): L.DivIcon {
  const dynamicCategories = getDynamicCategories([workshop]);
  const cat = dynamicCategories.find((c) => c.key === category);
  const color = cat?.color || '#ff6b35';
  const emoji = cat?.emoji || '📍';

  return L.divIcon({
    className: '',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 42px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: ${color};
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
        border: 3px solid white;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <span style="transform: rotate(45deg); font-size: 1.15rem; line-height: 1;">${emoji}</span>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -42],
  });
}

export default function WorkshopMarker({ workshop, onClick }: WorkshopMarkerProps) {
  const { locale, t } = useLanguage();
  const icon = createMarkerIcon(workshop.category, workshop);
  const dynamicCategories = getDynamicCategories([workshop]);

  return (
    <Marker
      position={[workshop.lat, workshop.lng]}
      icon={icon}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip direction="top" offset={[0, -44]} opacity={0.95}>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>
          <strong>{workshop.name[locale]}</strong>
          <div style={{ color: '#000000', fontSize: '11px', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>⭐ {workshop.rating} · {workshop.reviewCount} reviews</span>
            <span style={{ textTransform: 'capitalize' }}>
              {dynamicCategories.find((c) => c.key === workshop.category)?.emoji} {t(`filters.${workshop.category}`) !== `filters.${workshop.category}` ? t(`filters.${workshop.category}`) : workshop.category}
            </span>
            {workshop.tags.includes('English_Spoken') && (
              <span style={{ color: '#ff5500', fontWeight: 600 }}>🌐 {t('filters.English_Spoken')}</span>
            )}
          </div>
        </div>
      </Tooltip>
    </Marker>
  );
}
