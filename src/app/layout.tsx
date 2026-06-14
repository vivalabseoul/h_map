import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { LanguageProvider } from '@/context/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Handmade Map — Discover Local Craft Workshops',
  description:
    'A visual-first, location-based platform helping tourists discover local handmade craft workshops worldwide. Pottery, leather, perfume, candle, textile, jewelry classes and more.',
  keywords: 'handmade, workshop, craft, pottery, leather, perfume, map, travel, Seoul, Korea',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LanguageProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Header />
              <div style={{ flex: 1 }}>
                {children}
              </div>
              <Footer />
            </div>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
