import type { FleaMarket, Workshop } from '@/types';
import { findKoreaRegionByQuery, getKoreaRegion } from '@/lib/koreaRegions';
import en from '@/i18n/en.json';
import ja from '@/i18n/ja.json';
import zh from '@/i18n/zh.json';
import ko from '@/i18n/ko.json';

// Category labels in every locale, so "도자기", "pottery" and "陶芸" all find pottery.
const LOCALE_FILTER_LABELS: Record<string, string>[] = [en, ja, zh, ko].map(
  (dict) => ((dict as { filters?: Record<string, string> }).filters) || {},
);

// Workshop.languages stores English/Korean/Japanese/Chinese; let people type any spelling.
const LANGUAGE_ALIASES: Record<string, string[]> = {
  English: ['english', '영어', '英語', '英语'],
  Korean: ['korean', '한국어', '韓国語', '韩语'],
  Japanese: ['japanese', '일본어', '日本語', '日语'],
  Chinese: ['chinese', '중국어', '中文', '中国語'],
};

/**
 * Free-text match against a workshop's category (in any locale) and spoken languages.
 * An empty query matches everything.
 */
export function matchesCategoryOrLanguage(workshop: Workshop, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const terms: string[] = [];

  if (workshop.category) {
    terms.push(workshop.category);
    for (const labels of LOCALE_FILTER_LABELS) {
      if (labels[workshop.category]) terms.push(labels[workshop.category]);
    }
  }

  for (const lang of workshop.languages || []) {
    terms.push(lang, ...(LANGUAGE_ALIASES[lang] || []));
  }

  return terms.some((term) => term.toLowerCase().includes(q));
}

const includesQuery = (values: (string | null | undefined)[], q: string) =>
  values.some((value) => value?.toLowerCase().includes(q));

// A region name ("제주", "Jeju") matches every place in that region by its Korean address, whatever language it was typed in
const matchesRegionName = (address: Workshop['address'], q: string) => {
  const region = findKoreaRegionByQuery(q);
  return region !== null && getKoreaRegion(address)?.key === region.key;
};

/**
 * What either search box accepts for a workshop: category or language (in any locale),
 * a region name, or free text found in its name, address, description or tags. An empty query matches everything.
 */
export function matchesWorkshopQuery(workshop: Workshop, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (matchesCategoryOrLanguage(workshop, q) || matchesRegionName(workshop.address, q)) return true;
  return includesQuery(
    [
      ...Object.values(workshop.name || {}),
      ...Object.values(workshop.address || {}),
      ...Object.values(workshop.description || {}),
      ...(workshop.tags || []),
    ],
    q,
  );
}

/** Free-text match for a festival / flea market against its name, address, description, venue and organizer. */
export function matchesEventQuery(market: FleaMarket, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (matchesRegionName(market.address, q)) return true;
  return includesQuery(
    [
      ...Object.values(market.name || {}),
      ...Object.values(market.address || {}),
      ...Object.values(market.description || {}),
      market.venueName,
      market.organizer,
    ],
    q,
  );
}
