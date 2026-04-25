import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";
import nextBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const supabaseImageHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : 'lbemsvyhgphdoobpbexp.supabase.co';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseImageHost,
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

// Chain the plugins together
// @ts-expect-error - Plugin types may not perfectly align, but functionality works correctly
export default withBundleAnalyzer(withFlowbiteReact(withNextIntl(nextConfig)));
