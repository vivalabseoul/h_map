import React from 'react';
import { notFound } from 'next/navigation';
import Link from '@/components/LocalizedLink';
import { getWorkshops, getFleaMarkets } from '@/lib/database';
import type { Metadata } from 'next';
import type { Locale } from '@/types';
import SubPageLayout from '@/components/SubPageLayout';
import {
  SITE_URL,
  buildSeoTitle,
  buildPageMetadata,
  generateBreadcrumbSchema,
} from '@/lib/seo';

type Props = {
  params: Promise<{ locale: Locale; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  
  // Format slug e.g. "seoul-pottery-festival"
  const titleFormatted = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const title = buildSeoTitle({
    name: `${titleFormatted} 큐레이션 코스`,
    city: 'Seoul',
    type: 'course',
    locale,
  });

  const description =
    locale === 'ko'
      ? `${titleFormatted} - 아트플로우맵이 추천하는 당일치기 로컬 공방 클래스 및 아티잔 축제 추천 동선 코스.`
      : `Explore ${titleFormatted} - Curated craft workshop & festival itinerary guide on ArtFlowMap.`;

  return buildPageMetadata({
    title,
    description,
    pathname: `/courses/${slug}`,
    locale,
    keywords: [
      titleFormatted,
      '공방 데이트 코스',
      '원데이 클래스 동선',
      '로컬 축제 코스',
      'ArtFlowMap Curation',
    ],
  });
}

export default async function CourseCurationPage({ params }: Props) {
  const { locale, slug } = await params;

  const titleFormatted = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const allWorkshops = await getWorkshops();
  const allMarkets = await getFleaMarkets();

  const workshops = allWorkshops.slice(0, 4);
  const markets = allMarkets.slice(0, 2);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: `${SITE_URL}/${locale}` },
    { name: 'Courses', url: `${SITE_URL}/${locale}/courses` },
    { name: titleFormatted, url: `${SITE_URL}/${locale}/courses/${slug}` },
  ]);

  return (
    <SubPageLayout
      title={`${titleFormatted} 큐레이션 코스`}
      subtitle="로컬 공방 체험과 원데이 클래스, 아티잔 플리마켓을 하나로 연결한 완벽 동선 가이드"
      categoryBadge="Curation Course"
      icon="about"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          📌 추천 투어 동선 개요
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
          아트플로우맵 큐레이터가 엄선한 <strong>{titleFormatted}</strong> 탐색 코스입니다. 로컬 공방에서의 손끝 감성 체험과 아티잔 축제의 활기를 동시에 즐겨보세요.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
          🎨 코스 포함 공방 (Studios)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {workshops.map((w) => (
            <div key={w.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--color-surface)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--color-text-primary)' }}>
                {w.name[locale] || w.name.ko || w.name.en}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '0 0 12px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {w.description[locale] || w.description.ko || w.description.en}
              </p>
              <Link
                href={`/workshops/${w.slug || w.id}`}
                style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none' }}
              >
                상세보기 →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {markets.length > 0 && (
        <section style={{ borderTop: '1px solid var(--color-border)', paddingTop: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            🎪 코스 연계 축제 & 플리마켓
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {markets.map((m) => (
              <div key={m.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--color-bg-alt)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--color-text-primary)' }}>
                  {m.name[locale] || m.name.ko || m.name.en}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-accent)', fontWeight: 600, margin: '0 0 8px 0' }}>
                  📅 {m.date || 'Regular Event'}
                </p>
                <Link
                  href={`/fleamarkets/${m.id}`}
                  style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: 'none' }}
                >
                  축제 안내 →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </SubPageLayout>
  );
}
