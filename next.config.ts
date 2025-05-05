import { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {};

const withNextIntl = createNextIntlPlugin(
  './src/i18n/request.ts'
);
export default withFlowbiteReact(withNextIntl(nextConfig));