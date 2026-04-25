import type { Metadata } from "next";
import { Inter, Noto_Kufi_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "../globals.css";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { GlobalBackgroundProvider } from "@/components/providers/GlobalBackgroundProvider";
import SkipToContentLink from "@/components/ui/navigation/SkipToContentLink";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const locales = routing.locales;
const metadataBase = process.env.NEXT_PUBLIC_APP_URL
  ? { metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL) }
  : {};

export const metadata: Metadata = {
  title: "Eventy360",
  description: "Algerian Academic Event Platform",
  ...metadataBase,
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  let messages;
  try {
    messages = await getMessages();
  } catch {
    notFound();
  }

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body
        className={`${inter.variable} ${notoKufiArabic.variable} font-sans bg-background text-foreground antialiased overflow-x-hidden`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SkipToContentLink />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <ToastProvider>
                <div className="relative flex min-h-screen flex-col overflow-x-hidden">
                  {/* Global AnimatedHeroBackground will be loaded client-side */}
                  <div className="absolute inset-0 -z-10" id="global-background">
                    <GlobalBackgroundProvider />
                  </div>
                  <main
                    id="main-content"
                    tabIndex={-1}
                    className="relative flex-1 outline-none overflow-x-hidden"
                  >
                    {children}
                  </main>
                </div>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
