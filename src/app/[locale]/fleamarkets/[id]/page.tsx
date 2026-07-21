import React from 'react';
import { notFound } from 'next/navigation';
import { getFleaMarketById } from '@/lib/database';
import type { Metadata } from 'next';
import type { Locale } from '@/types';
import FleaMarketDetailClient from '@/components/FleaMarketDetailClient';
import {
  SITE_URL,
  buildSeoTitle,
  buildPageMetadata,
  generateEventSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo';

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const market = await getFleaMarketById(id);

  if (!market) {
    return { title: 'Flea Market Not Found' };
  }

  const name = market.name[locale] || market.name.en || 'Flea Market';
  const city = (market as any).region ? (market as any).region.toUpperCase() : 'Seoul';

  const title = buildSeoTitle({
    name,
    city,
    type: 'festival',
    locale,
  });

  let rawDesc = market.description[locale] || market.description.en || '';
  if (rawDesc.length > 150) {
    rawDesc = rawDesc.substring(0, 147) + '...';
  }

  const description =
    locale === 'ko'
      ? `${name} - ${city} 로컬 축제 및 플리마켓 완벽 동선 가이드. ${rawDesc}`
      : `Explore ${name} in ${city}. Discover artisan markets, craft pop-ups, and local events. ${rawDesc}`;

  const image = market.posterUrl || (market.images && market.images[0]) || `${SITE_URL}/og-image.png`;

  return buildPageMetadata({
    title,
    description,
    pathname: `/fleamarkets/${id}`,
    image,
    locale,
    type: 'website',
    keywords: [
      name,
      'Artisan Flea Market',
      'Festival',
      city,
      'Local Craft Market',
    ],
  });
}

export default async function FleaMarketPage({ params }: Props) {
  const { locale, id } = await params;
  const market = await getFleaMarketById(id);

  if (!market) {
    notFound();
  }

  const name = market.name[locale] || market.name.en || 'Flea Market';
  const city = (market as any).region ? (market as any).region.toUpperCase() : 'Seoul';

  // 1. Event Schema
  const eventSchema = generateEventSchema(market, locale);

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${SITE_URL}/${locale}` },
    { name: `${city} Festivals`, url: `${SITE_URL}/${locale}/fleamarkets` },
    { name, url: `${SITE_URL}/${locale}/fleamarkets/${id}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <FleaMarketDetailClient market={market} />
    </>
  );
}
