import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/my/', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/my/', '/api/'],
      },
      {
        userAgent: 'Yeti', // Naver Crawler
        allow: '/',
        disallow: ['/admin/', '/my/', '/api/'],
      },
    ],
    sitemap: 'https://www.artflowmap.com/sitemap.xml',
    host: 'https://www.artflowmap.com',
  };
}
