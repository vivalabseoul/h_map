import type { Metadata } from 'next';
import { Playfair_Display } from 'next/font/google';
import '../globals.css';
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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  return (
    <html lang={locale} className={playfair.variable} data-scroll-behavior="smooth">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-N8GV9QL5');`
          }}
        />
        {/* End Google Tag Manager */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N8GV9QL5"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
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
