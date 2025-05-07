import type { Metadata } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import "../globals.css";
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ToastProvider } from '@/components/providers/ToastProvider';

// Font configurations
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic"],
  weight: ['400', '700'],
});

const locales = routing.locales;

export const metadata: Metadata = {
  title: "Eventy360",
  description: "Algerian Academic Event Platform",
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  // Await params (v15 compatibility)
  const resolvedParams = await params;
  const locale = resolvedParams.locale;

  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  let messages;
  try {
    messages = await getMessages();
  } catch (error) {
    console.error("Failed to load messages for locale:", locale, error);
    notFound();
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoKufiArabic.variable} font-sans bg-background text-foreground antialiased`}
      >
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
