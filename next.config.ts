import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";
import nextBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lbemsvyhgphdoobpbexp.supabase.co',
        // You can also specify port and pathname if needed, but hostname is usually sufficient
        // port: '',
        // pathname: '/storage/v1/object/public/avatars/**', 
      },
      // ... any other existing remotePatterns
    ],
  },
};

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);

// Chain the plugins together
// @ts-expect-error - Plugin types may not perfectly align, but functionality works correctly
export default withBundleAnalyzer(withFlowbiteReact(withNextIntl(nextConfig)));