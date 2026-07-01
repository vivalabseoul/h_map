import React from 'react';
import { notFound } from 'next/navigation';
import { getFleaMarketById } from '@/lib/database';
import type { Metadata } from 'next';
import type { Locale } from '@/types';
import FleaMarketDetailClient from '@/components/FleaMarketDetailClient';

type Props = {
  params: Promise<{ locale: Locale; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const market = await getFleaMarketById(id);

  if (!market) {
    return { title: 'Flea Market Not Found' };
  }

  const title = market.name[locale] || market.name.en || 'Flea Market';
  const description = market.description[locale] || market.description.en || '';
  const image = market.posterUrl || '/og-image.png';

  return {
    title: `${title} | Art flow map`,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
    },
  };
}

export default async function FleaMarketPage({ params }: Props) {
  const { id } = await params;
  const market = await getFleaMarketById(id);

  if (!market) {
    notFound();
  }

  return <FleaMarketDetailClient market={market} />;
}
