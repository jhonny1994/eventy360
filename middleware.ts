import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // A list of all locales that are supported
  locales: ['ar'],

  // Used when no locale matches
  defaultLocale: 'ar',

  // Always prefix the path even for the default locale
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  // Match all pathnames except for specific exclusions like /api/, /_next/static/, /_next/image, /favicon.ico
  matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)']
}; 