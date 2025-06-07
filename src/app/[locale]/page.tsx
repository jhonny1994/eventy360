import { Metadata } from "next";
import dynamic from 'next/dynamic';
import Navbar from "@/components/ui/navigation/Navbar";
import HeroSection from "@/components/ui/homepage/HeroSection";

const PathwaySection = dynamic(() => import('@/components/ui/homepage/PathwaySection'));
const ClientFeaturesSection = dynamic(() => import('@/components/ui/homepage/ClientFeaturesSection'));
const PricingSection = dynamic(() => import('@/components/ui/homepage/PricingSection'));
const CTASection = dynamic(() => import('@/components/ui/homepage/CTASection'));
const Footer = dynamic(() => import('@/components/ui/homepage/Footer'));

/**
 * Homepage metadata for SEO optimization
 */
export const metadata: Metadata = {
  title: "Eventy360 - Algerian Academic Event Platform",
  description:
    "Centralized platform for discovering academic events, submitting research papers, and accessing scholarly resources in Algeria",
  keywords:
    "academic events, conferences, research, Algeria, papers submissions",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL as string),
  openGraph: {
    title: "Eventy360 - Connect with Academic Events in Algeria",
    description:
      "Discover conferences, submit papers, and access research resources all in one place",
    type: "website",
    url: new URL(process.env.NEXT_PUBLIC_APP_URL as string),
    siteName: "Eventy360",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Eventy360 - Academic Events Platform",
      },
    ],
  },
};

/**
 * HomePage Component - Main landing page for Eventy360
 *
 * Structure:
 * - Navigation bar with language & theme controls
 * - Hero section with animated background
 * - Pathway section for different user roles
 * - Features section highlighting platform capabilities
 * - Pricing information
 * - Call-to-action section
 * - Footer with site information
 */
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero section with animated particles background */}
        <HeroSection />

        {/* User pathways section */}
        <PathwaySection />

        {/* Platform features section */}
        <ClientFeaturesSection />

        {/* Pricing plans section */}
        <PricingSection />

        {/* Call-to-action section */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
