import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/my/', '/api/'],
    },
    sitemap: 'https://www.artflowmap.com/sitemap.xml',
  };
}
