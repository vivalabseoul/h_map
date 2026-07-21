import { REGIONS } from '@/types';
import type { Workshop, FleaMarket, Region, Locale } from '@/types';

export interface DynamicRegion {
  key: Region;
  label: Record<Locale, string>;
  emoji: string;
  available: boolean;
  center: [number, number];
  zoom: number;
  count: number;
}

export function getDynamicRegions(
  workshops: Workshop[] = [],
  fleaMarkets: FleaMarket[] = [],
  currentLocale: string = 'ko'
): DynamicRegion[] {
  // Count items per region
  const counts: Record<string, number> = {};

  workshops.forEach((w) => {
    if (w.region && w.status === 'active') {
      counts[w.region] = (counts[w.region] || 0) + 1;
    }
  });

  fleaMarkets.forEach((m) => {
    if (m.status !== 'inactive') {
      // Map address or region if present
      const regKey = (m as any).region || 'korea';
      counts[regKey] = (counts[regKey] || 0) + 1;
    }
  });

  // Filter regions with Count > 0 (or 'all' / core default region)
  const activeRegions: DynamicRegion[] = REGIONS.map((r) => {
    const itemCount = r.key === 'all'
      ? workshops.length + fleaMarkets.length
      : counts[r.key] || 0;

    return {
      ...r,
      available: itemCount > 0 || r.key === 'all' || r.key === 'korea',
      count: itemCount,
    };
  }).filter((r) => r.key === 'all' || r.count > 0 || r.key === 'korea');

  // Separate 'all' to stay at the top
  const allRegion = activeRegions.find((r) => r.key === 'all');
  const otherRegions = activeRegions.filter((r) => r.key !== 'all');

  // Sort remaining active regions alphabetically
  otherRegions.sort((a, b) => {
    const loc = (currentLocale as Locale) || 'en';
    const labelA = a.label[loc] || a.label.en || '';
    const labelB = b.label[loc] || b.label.en || '';

    if (currentLocale === 'ko') {
      return labelA.localeCompare(labelB, 'ko-KR');
    }
    return labelA.localeCompare(labelB);
  });

  return allRegion ? [allRegion, ...otherRegions] : otherRegions;
}
