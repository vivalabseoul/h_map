import React from 'react';
import { notFound } from 'next/navigation';
import Link from '@/components/LocalizedLink';
import { getWorkshops, getFleaMarkets } from '@/lib/database';
import type { Metadata } from 'next';
import type { Locale, Workshop, FleaMarket } from '@/types';
import SubPageLayout from '@/components/SubPageLayout';
import {
  SITE_URL,
  buildSeoTitle,
  buildPageMetadata,
  generateBreadcrumbSchema,
} from '@/lib/seo';

type Props = {
  params: Promise<{ locale: Locale; city: string; 'craft-type': string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const city = resolvedParams.city.toLowerCase();
  const craftType = resolvedParams['craft-type'].toLowerCase();

  const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
  const formattedCraft = craftType.charAt(0).toUpperCase() + craftType.slice(1);

  const title = buildSeoTitle({
    name: `${formattedCraft} Workshops & Artisan Classes`,
    city: formattedCity,
    type: 'workshop',
    locale,
  });

  const description =
    locale === 'ko'
      ? `${formattedCity} 지역의 최고의 ${formattedCraft} 공방 원데이 클래스와 추천 플리마켓 완벽 탐색 가이드.`
      : `Discover top ${formattedCraft} workshops, one-day artisan classes, and vibrant flea markets in ${formattedCity}. Book your craft experience today on ArtFlowMap.`;

  return buildPageMetadata({
    title,
    description,
    pathname: `/explore/${city}/${craftType}`,
    locale,
    keywords: [
      `${formattedCraft} workshop ${formattedCity}`,
      `best ${formattedCraft} class in ${formattedCity}`,
      `Korean ${craftType} experience`,
      `${formattedCity} craft tour`,
    ],
  });
}

export default async function ProgrammaticExplorePage({ params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const city = resolvedParams.city.toLowerCase();
  const craftType = resolvedParams['craft-type'].toLowerCase();

  const allWorkshops = await getWorkshops();
  const allMarkets = await getFleaMarkets();

  // Filter workshops matching city or region and craft-type
  const matchingWorkshops = allWorkshops.filter((w) => {
    const regionMatch = (w.region || '').toLowerCase().includes(city) || city === 'seoul' || city === 'all';
    const categoryMatch = (w.category || '').toLowerCase().includes(craftType) || craftType === 'all';
    return regionMatch && categoryMatch && w.status === 'active';
  });

  const matchingMarkets = allMarkets.filter((m) => {
    return m.status !== 'inactive';
  });

  const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
  const formattedCraft = craftType.charAt(0).toUpperCase() + craftType.slice(1);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${SITE_URL}/${locale}` },
    { name: 'Explore', url: `${SITE_URL}/${locale}/explore/${city}/all` },
    { name: formattedCity, url: `${SITE_URL}/${locale}/explore/${city}/all` },
    { name: formattedCraft, url: `${SITE_URL}/${locale}/explore/${city}/${craftType}` },
  ]);

  return (
    <SubPageLayout
      title={`${formattedCraft} Workshops in ${formattedCity}`}
      subtitle={`Explore top-rated artisan ${craftType} classes and curated local craft tours in ${formattedCity}.`}
      categoryBadge="Programmatic Curation"
      icon="about"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          {locale === 'ko' ? `${formattedCity} ${formattedCraft} 공방 및 클래스` : `Featured ${formattedCraft} Studios in ${formattedCity}`}
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', marginBottom: '24px' }}>
          {locale === 'ko'
            ? `아트플로우맵이 엄선한 ${formattedCity}의 ${formattedCraft} 원데이 클래스와 공방 체험 리스트입니다. 나만의 핸드메이드 작품을 제작하고 로컬 크리에이터와 만나보세요.`
            : `Immerse yourself in authentic Korean artisanal craftsmanship. Handpicked ${craftType} studios in ${formattedCity} offering beginner-friendly one-day classes and personalized creations.`}
        </p>

        {matchingWorkshops.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', background: 'var(--color-bg-alt)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ color: 'var(--color-text-muted)' }}>
              {locale === 'ko' ? '해당 조건의 추천 공방이 곧 업데이트됩니다.' : `New ${craftType} workshops in ${formattedCity} are coming soon.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {matchingWorkshops.map((workshop) => (
              <div key={workshop.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--color-surface)' }}>
                {workshop.images?.[0] && (
                  <img
                    src={workshop.images[0]}
                    alt={workshop.name[locale] || workshop.name.en}
                    style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}
                  />
                )}
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--color-text-primary)' }}>
                  {workshop.name[locale] || workshop.name.en}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {workshop.description[locale] || workshop.description.en}
                </p>
                <Link
                  href={`/workshops/${workshop.slug || workshop.id}`}
                  style={{ display: 'inline-block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none' }}
                >
                  {locale === 'ko' ? '공방 상세보기 →' : 'View Studio Detail →'}
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {matchingMarkets.length > 0 && (
        <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px', marginTop: '32px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
            {locale === 'ko' ? '함께 둘러보기 좋은 로컬 축제 & 플리마켓' : `Artisan Markets & Festivals near ${formattedCity}`}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {matchingMarkets.slice(0, 3).map((m) => (
              <Link
                key={m.id}
                href={`/fleamarkets/${m.id}`}
                style={{ textDecoration: 'none', color: 'inherit', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '12px', background: 'var(--color-bg-alt)' }}
              >
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--color-text-primary)' }}>
                  {m.name[locale] || m.name.en}
                </h4>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                  📅 {m.date || 'Regular Event'}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </SubPageLayout>
  );
}
