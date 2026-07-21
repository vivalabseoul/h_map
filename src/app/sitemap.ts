import { MetadataRoute } from 'next';
import { getWorkshops, getFleaMarkets } from '@/lib/database';

function safeDate(val: any): string {
  if (!val) return new Date().toISOString();
  const d = new Date(val);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.artflowmap.com';
  const locales = ['ko', 'en', 'ja', 'zh'];

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/about',
    '/notices',
    '/faq',
    '/contact',
    '/privacy',
    '/terms',
  ];

  const staticUrls: MetadataRoute.Sitemap = [];

  staticRoutes.forEach((route) => {
    locales.forEach((loc) => {
      const priority = route === '' ? 1.0 : 0.8;
      const changeFrequency: 'daily' | 'weekly' = route === '' ? 'daily' : 'weekly';

      staticUrls.push({
        url: `${baseUrl}/${loc}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency,
        priority,
      });
    });
  });

  // 2. Dynamic Workshop Routes
  const workshops = await getWorkshops();
  const workshopUrls: MetadataRoute.Sitemap = [];

  workshops.forEach((w) => {
    const slug = w.slug || w.id;
    const lastModified = safeDate(w.createdAt);

    locales.forEach((loc) => {
      workshopUrls.push({
        url: `${baseUrl}/${loc}/workshops/${slug}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    });
  });

  // 3. Dynamic Flea Market / Festival Routes
  const fleaMarkets = await getFleaMarkets();
  const festivalUrls: MetadataRoute.Sitemap = [];

  fleaMarkets.forEach((m) => {
    const lastModified = safeDate(m.date);

    locales.forEach((loc) => {
      festivalUrls.push({
        url: `${baseUrl}/${loc}/fleamarkets/${m.id}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    });
  });

  // 4. Programmatic SEO Routes (pSEO)
  const pseoCityCrafts = [
    { city: 'seoul', craft: 'pottery' },
    { city: 'seoul', craft: 'leather' },
    { city: 'seoul', craft: 'perfume' },
    { city: 'seoul', craft: 'candle' },
    { city: 'busan', craft: 'pottery' },
    { city: 'busan', craft: 'leather' },
    { city: 'jeju', craft: 'candle' },
  ];

  const pseoUrls: MetadataRoute.Sitemap = [];

  pseoCityCrafts.forEach(({ city, craft }) => {
    locales.forEach((loc) => {
      pseoUrls.push({
        url: `${baseUrl}/${loc}/explore/${city}/${craft}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  // 5. Korean Curation Course Routes
  const courseSlugs = [
    'seoul-pottery-festival',
    'busan-craft-tour',
    'jeju-candle-market',
  ];

  const courseUrls: MetadataRoute.Sitemap = [];

  courseSlugs.forEach((slug) => {
    locales.forEach((loc) => {
      courseUrls.push({
        url: `${baseUrl}/${loc}/courses/${slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });
  });

  return [
    ...staticUrls,
    ...workshopUrls,
    ...festivalUrls,
    ...pseoUrls,
    ...courseUrls,
  ];
}
