import type { Metadata } from 'next';
import type { Locale, Workshop, FleaMarket } from '@/types';

export const SITE_URL = 'https://www.artflowmap.com';

export function buildSeoTitle({
  name,
  city = 'Seoul',
  type = 'workshop',
  locale = 'en',
}: {
  name: string;
  city?: string;
  type?: 'workshop' | 'festival' | 'course';
  locale?: Locale;
}): string {
  if (locale === 'ko') {
    const itemTypeLabel = type === 'festival' ? '축제' : '공방';
    return `${name} - ${city} 로컬 ${itemTypeLabel} 체험 & 축제 완벽 동선 | 아트플로우맵`;
  }

  if (locale === 'ja') {
    return `${name} - ${city}クラフト体験＆フェスティバルツアー | ArtFlowMap`;
  }

  if (locale === 'zh') {
    return `${name} - ${city}手作工坊体验与市集游览 | ArtFlowMap`;
  }

  // English default
  const craftLabel = type === 'festival' ? 'Festival' : 'Workshop';
  return `${name} - Local ${craftLabel} & Festival Tour in ${city} | ArtFlowMap`;
}

export function buildHreflangAlternates(pathname: string) {
  // Ensure path starts with /
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  
  // Strip existing locale prefix if any (e.g. /ko/about -> /about)
  const pathWithoutLocale = cleanPath.replace(/^\/(ko|en|ja|zh)(\/|$)/, '$2');
  const formattedPath = pathWithoutLocale.startsWith('/') ? pathWithoutLocale : `/${pathWithoutLocale}`;
  const suffix = formattedPath === '/' ? '' : formattedPath;

  return {
    canonical: `${SITE_URL}/en${suffix}`,
    languages: {
      'ko': `${SITE_URL}/ko${suffix}`,
      'en': `${SITE_URL}/en${suffix}`,
      'ja': `${SITE_URL}/ja${suffix}`,
      'zh': `${SITE_URL}/zh${suffix}`,
      'x-default': `${SITE_URL}/en${suffix}`,
    },
  };
}

export function buildPageMetadata({
  title,
  description,
  pathname,
  image = `${SITE_URL}/og-image.png`,
  locale = 'en',
  type = 'website',
  keywords = [],
}: {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  locale?: Locale;
  type?: 'website' | 'article';
  keywords?: string[];
}): Metadata {
  const alternates = buildHreflangAlternates(pathname);
  const currentUrl = `${SITE_URL}/${locale}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

  const ogLocaleMap: Record<Locale, string> = {
    ko: 'ko_KR',
    en: 'en_US',
    ja: 'ja_JP',
    zh: 'zh_CN',
  };

  return {
    title,
    description,
    keywords: [
      'ArtFlowMap',
      '아트플로우맵',
      'handmade craft',
      'workshop',
      'flea market',
      'one day class',
      'Seoul travel',
      ...keywords,
    ],
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: currentUrl,
      languages: alternates.languages,
    },
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: 'ArtFlowMap',
      locale: ogLocaleMap[locale] || 'en_US',
      type,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// -------------------------------------------------------------
// Schema.org JSON-LD Generators
// -------------------------------------------------------------

export function generateLocalBusinessSchema(workshop: Workshop, locale: Locale = 'en') {
  const name = workshop.name[locale] || workshop.name.en || 'Craft Workshop';
  const description = workshop.description[locale] || workshop.description.en || '';
  const address = workshop.address[locale] || workshop.address.en || 'Seoul, Korea';
  const slug = workshop.slug || workshop.id;
  const pageUrl = `${SITE_URL}/${locale}/workshops/${slug}`;
  const images = workshop.images && workshop.images.length > 0 ? workshop.images : [`${SITE_URL}/og-image.png`];

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'EducationalOrganization'],
    name,
    description,
    url: pageUrl,
    image: images,
    telephone: workshop.phone || undefined,
    email: workshop.email || undefined,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressCountry: 'KR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: workshop.lat,
      longitude: workshop.lng,
    },
  };

  if (workshop.rating && workshop.reviewCount && workshop.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: workshop.rating,
      reviewCount: workshop.reviewCount,
    };
  }

  return schema;
}

export function generateEventSchema(market: FleaMarket, locale: Locale = 'en') {
  const name = market.name[locale] || market.name.en || 'Artisan Flea Market';
  const description = market.description[locale] || market.description.en || '';
  const address = market.address[locale] || market.address.en || 'Seoul, Korea';
  const pageUrl = `${SITE_URL}/${locale}/fleamarkets/${market.id}`;
  const images = market.posterUrl ? [market.posterUrl] : (market.images && market.images.length > 0 ? market.images : [`${SITE_URL}/og-image.png`]);

  // Parse or set fallback dates
  let eventDate = new Date().toISOString();
  if (market.date) {
    const match = market.date.match(/(\d{4})[-.](\d{2})[-.](\d{2})/);
    if (match) {
      const parsedDate = new Date(`${match[1]}-${match[2]}-${match[3]}`);
      if (!isNaN(parsedDate.getTime())) {
        eventDate = parsedDate.toISOString();
      }
    }
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    url: pageUrl,
    image: images,
    startDate: eventDate,
    endDate: eventDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: address,
        addressCountry: 'KR',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: market.lat,
        longitude: market.lng,
      },
    },
    organizer: {
      '@type': 'Organization',
      name: market.creatorName || 'ArtFlowMap',
      url: SITE_URL,
    },
  };
}

export function generateBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
