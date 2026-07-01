import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['ko', 'en', 'ja', 'zh'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  // Check if there is any supported locale in the Accept-Language header
  const acceptLang = request.headers.get('accept-language');
  if (acceptLang) {
    const preferredLocale = acceptLang.split(',')[0].split('-')[0].toLowerCase();
    if (locales.includes(preferredLocale)) {
      return preferredLocale;
    }
  }
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  
  // Exclude API routes, static files, images etc.
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') || 
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml'
  ) {
    return NextResponse.next();
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)',
  ],
};
