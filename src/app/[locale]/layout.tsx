import type { Metadata } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google"; // Uncommented font imports
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css"; // Ensure this line is uncommented
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing'; // Assuming path alias or correct relative path
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/ToastProvider';

// Font configuration uncommented
// Configure Inter for Latin script
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Configure Noto Kufi Arabic for Arabic script
const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic"],
  weight: ['400', '700'], 
});

const locales = routing.locales;

export const metadata: Metadata = {
  title: "Eventy360", // Update title
  description: "Algerian Academic Event Platform", // Update description0
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

// Make layout async again
export default async function RootLayout({ children, params }: RootLayoutProps) {

  // Explicitly await the params object (as suggested by some sources for v15)
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  // Validate locale
  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  // Fetch messages for the locale
  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error("Failed to load messages for locale:", locale, error);
    notFound(); // Fail if messages can't be loaded
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoKufiArabic.variable} font-sans bg-background text-foreground antialiased`}
      >
        {/* Render providers directly, Intl first */}
        <NextIntlClientProvider locale={locale} messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
            <AuthProvider>
              <ToastProvider>
                 <div className="relative flex min-h-screen flex-col">
                   <main className="flex-1">{children}</main>
                 </div>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
          </NextIntlClientProvider>
      </body>
    </html>
  );
} 
