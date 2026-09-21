import type { FleaMarket, Locale } from '@/types';

// The two kinds of places on the site: studios (workshop) and festivals / flea markets (event).
export type PlaceTypeFilter = 'all' | 'workshop' | 'event';

// One color per kind, used by the type tabs, card badges, map legend and map markers.
export const PLACE_TYPE_COLORS = {
  workshop: { bg: '#e0f2fe', fg: '#0284c7' },
  event: { bg: '#fef3c7', fg: '#d97706' },
} as const;

const LABELS = {
  all: { ko: '전체', en: 'All', ja: 'すべて', zh: '全部' },
  workshop: { ko: '공방', en: 'Studios', ja: '工房', zh: '工坊' },
  event: { ko: '축제·플리마켓', en: 'Festivals & Markets', ja: 'お祭り・マーケット', zh: '庆典・市集' },
  festival: { ko: '축제', en: 'Festival', ja: 'お祭り', zh: '庆典' },
  fleaMarket: { ko: '플리마켓', en: 'Flea Market', ja: 'フリマ', zh: '跳蚤市场' },
} satisfies Record<string, Record<Locale, string>>;

export function placeLabel(key: keyof typeof LABELS, locale: Locale): string {
  return LABELS[key][locale] || LABELS[key].en;
}

// Synced public festivals are 'api'; anything registered by a person is a flea market.
export function eventKindLabel(market: Pick<FleaMarket, 'source'>, locale: Locale): string {
  return placeLabel(market.source === 'api' ? 'festival' : 'fleaMarket', locale);
}
