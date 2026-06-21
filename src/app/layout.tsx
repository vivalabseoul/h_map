import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { FilterProvider } from '@/context/FilterContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NoticePopup from '@/components/NoticePopup';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['600', '700'],
  style: ['normal', 'italic']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.artflowmap.com'),
  title: 'Art flow map — Discover Local Craft Workshops',
  description:
    'A visual-first, location-based platform helping tourists discover local handmade craft workshops worldwide. Pottery, leather, perfume, candle, textile, jewelry classes and more.',
  keywords: 'art flow map, handmade, workshop, craft, pottery, leather, perfume, map, travel, Seoul, Korea, 원데이클래스, 공방, 이색데이트, 서울 공방',
  openGraph: {
    title: 'Art flow map — Discover Local Craft Workshops',
    description: 'Find the perfect handmade craft workshop for your trip. Explore pottery, leather crafting, perfume making and more on our interactive map.',
    url: 'https://www.artflowmap.com',
    siteName: 'Art flow map',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Art flow map - Discover Local Craft Workshops',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Art flow map — Discover Local Craft Workshops',
    description: 'Find the perfect handmade craft workshop for your trip.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  }
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Art flow map',
  url: 'https://www.artflowmap.com/',
  description: 'A visual-first, location-based platform helping tourists discover local handmade craft workshops worldwide.',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://www.artflowmap.com/?q={search_term_string}',
    'query-input': 'required name=search_term_string'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={playfair.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <FilterProvider>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Header />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {children}
                </div>
                <Footer />
                <NoticePopup />
              </div>
            </FilterProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
