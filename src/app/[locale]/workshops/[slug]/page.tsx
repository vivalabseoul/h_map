import React from 'react';
import { notFound } from 'next/navigation';
import { getWorkshopBySlug } from '@/lib/database';
import type { Metadata } from 'next';
import type { Locale } from '@/types';
import WorkshopDetailClient from '@/components/WorkshopDetailClient';
import {
  SITE_URL,
  buildSeoTitle,
  buildPageMetadata,
  generateLocalBusinessSchema,
  generateBreadcrumbSchema,
} from '@/lib/seo';

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const workshop = await getWorkshopBySlug(slug);

  if (!workshop) {
    return { title: 'Workshop Not Found' };
  }

  const name = workshop.name[locale] || workshop.name.en || 'Workshop';
  const city = workshop.region ? workshop.region.toUpperCase() : 'Seoul';
  
  const title = buildSeoTitle({
    name,
    city,
    type: 'workshop',
    locale,
  });

  let rawDesc = workshop.description[locale] || workshop.description.en || '';
  if (rawDesc.length > 150) {
    rawDesc = rawDesc.substring(0, 147) + '...';
  }

  const description =
    locale === 'ko'
      ? `${name} - ${city} 최고의 공예 원데이 클래스. ${rawDesc}`
      : `Discover ${name} in ${city}. Unique artisan craft workshops & classes. ${rawDesc}`;

  const image = workshop.images?.[0] || `${SITE_URL}/og-image.png`;

  return buildPageMetadata({
    title,
    description,
    pathname: `/workshops/${slug}`,
    image,
    locale,
    type: 'website',
    keywords: [
      name,
      workshop.category || 'Craft',
      city,
      'One-day Class',
      'Workshop Experience',
    ],
  });
}

export default async function WorkshopPage({ params }: Props) {
  const { locale, slug } = await params;
  const workshop = await getWorkshopBySlug(slug);

  if (!workshop) {
    notFound();
  }

  const name = workshop.name[locale] || workshop.name.en || 'Workshop';
  const city = workshop.region ? workshop.region.toUpperCase() : 'Seoul';

  // 1. LocalBusiness / EducationalOrganization Schema
  const localBusinessSchema = generateLocalBusinessSchema(workshop, locale);

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${SITE_URL}/${locale}` },
    { name: `${city} Workshops`, url: `${SITE_URL}/${locale}/workshops` },
    { name, url: `${SITE_URL}/${locale}/workshops/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <WorkshopDetailClient workshop={workshop} />
    </>
  );
}
