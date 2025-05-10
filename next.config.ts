import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

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
export default withFlowbiteReact(withNextIntl(nextConfig));