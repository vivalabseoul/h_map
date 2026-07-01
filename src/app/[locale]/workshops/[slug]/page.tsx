import React from 'react';
import { notFound } from 'next/navigation';
import { getWorkshopBySlug } from '@/lib/database';
import type { Metadata } from 'next';
import type { Locale } from '@/types';
import WorkshopDetailClient from '@/components/WorkshopDetailClient';

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
  
  // SEO Optimized Title
  let title = `${name} | Art flow map`;
  if (locale === 'ko') {
    title = `${name} - 한국 공방 원데이 클래스 | Art flow map`;
  } else if (locale === 'en') {
    title = `${name} - Korean Craft Workshop & One-day Class | Art flow map`;
  }

  // SEO Optimized Description
  let description = workshop.description[locale] || workshop.description.en || '';
  // Truncate description for meta tag if it's too long
  if (description.length > 150) {
    description = description.substring(0, 147) + '...';
  }
  
  if (locale === 'ko' && !description.includes('체험')) {
    description = `외국인도 쉽게 즐길 수 있는 ${name}의 특별한 한국 공예 체험. ${description}`;
  } else if (locale === 'en' && !description.includes('experience')) {
    description = `Experience the beauty of Korean crafts at ${name}. ${description}`;
  }

  const image = workshop.images?.[0] || '/og-image.png';
  const url = `https://www.artflowmap.com/${locale}/workshops/${slug}`;

  return {
    title,
    description,
    keywords: locale === 'ko' 
      ? ['한국 공방', '원데이 클래스', '한국 체험', '공방 데이트', '외국인 한국 체험', name, workshop.category || '공예']
      : ['Korean workshop', 'One-day class Korea', 'Korean craft experience', 'Seoul workshop', name, workshop.category || 'Crafts'],
    alternates: {
      canonical: url,
      languages: {
        'ko': `https://www.artflowmap.com/ko/workshops/${slug}`,
        'en': `https://www.artflowmap.com/en/workshops/${slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
  };
}

export default async function WorkshopPage({ params }: Props) {
  const { locale, slug } = await params;
  const workshop = await getWorkshopBySlug(slug);

  if (!workshop) {
    notFound();
  }

  // Generate JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: workshop.name[locale] || workshop.name.en,
    image: workshop.images || [],
    description: workshop.description[locale] || workshop.description.en,
    url: `https://www.artflowmap.com/${locale}/workshops/${slug}`,
    telephone: workshop.phone || '',
    address: {
      '@type': 'PostalAddress',
      streetAddress: workshop.address[locale] || workshop.address.en,
      addressCountry: 'KR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: workshop.lat,
      longitude: workshop.lng,
    },
    aggregateRating: workshop.reviewCount && workshop.reviewCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: workshop.rating || 5,
      reviewCount: workshop.reviewCount,
    } : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorkshopDetailClient workshop={workshop} />
    </>
  );
}
