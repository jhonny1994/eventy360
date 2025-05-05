import type { Metadata } from "next";
import { Inter, Tajawal } from "next/font/google"; // Uncommented font imports
import "../globals.css"; // Ensure this line is uncommented
import { NextIntlClientProvider } from 'next-intl';
import { ThemeProvider } from "@/components/providers/theme-provider"; // Import ThemeProvider
import { routing } from '@/i18n/routing'; // Assuming path alias or correct relative path
import { notFound } from 'next/navigation';

// Font configuration uncommented
// Configure Inter for Latin script
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Configure Tajawal for Arabic script
const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ['400', '500', '700'], 
});

export const metadata: Metadata = {
  title: "Eventy360", // Update title
  description: "Your Central Hub for Algerian Academic Events", // Update description
};

// Define the props type including locale
type RootLayoutProps = {
  children: React.ReactNode;
  // params might be a promise
  params: { locale: string } | Promise<{ locale: string }>; 
}

export default async function RootLayout({ children, params }: RootLayoutProps) { // Make component async
  // Await params before destructuring
  const awaitedParams = await params;
  const locale = awaitedParams.locale;

  // Validate locale
  if (!routing.locales.includes(locale as 'ar')) { // Use literal type 'ar'
    notFound();
  }

  // Fetch messages
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    console.error("Failed to load locale messages:", error); // Log the error
    notFound();
  }

  return (
    // Add suppressHydrationWarning back
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <body
        // Re-add font variables to className
        className={`${inter.variable} ${tajawal.variable} antialiased`}
      >
        {/* Wrap with ThemeProvider */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
} 