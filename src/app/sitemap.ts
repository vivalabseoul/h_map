import { MetadataRoute } from 'next';
import { getWorkshops } from '@/lib/database';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.artflowmap.com';
  
  // Static Routes
  const staticRoutes = [
    '',
    '/about',
    '/notices',
    '/faq',
    '/contact',
    '/privacy',
    '/terms',
  ];

  const staticUrls = staticRoutes.flatMap((route) => {
    return [
      {
        url: `${baseUrl}/ko${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: route === '' ? 'daily' : 'weekly' as any,
        priority: route === '' ? 1 : 0.8,
      },
      {
        url: `${baseUrl}/en${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: route === '' ? 'daily' : 'weekly' as any,
        priority: route === '' ? 1 : 0.8,
      }
    ];
  });

  // Dynamic Workshop Routes
  const workshops = await getWorkshops();

  const workshopUrls = workshops.flatMap((workshop) => {
    const slug = workshop.slug || workshop.id;
    const lastModified = workshop.createdAt ? new Date(workshop.createdAt).toISOString() : new Date().toISOString();
    return [
      {
        url: `${baseUrl}/ko/workshops/${slug}`,
        lastModified,
        changeFrequency: 'weekly' as any,
        priority: 0.9,
      },
      {
        url: `${baseUrl}/en/workshops/${slug}`,
        lastModified,
        changeFrequency: 'weekly' as any,
        priority: 0.9,
      }
    ];
  });

  return [...staticUrls, ...workshopUrls];
}
