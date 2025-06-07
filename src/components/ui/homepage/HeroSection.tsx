"use client";

import { useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import useTranslations from "@/hooks/useTranslations";
import useLocale from "@/hooks/useLocale";
import Image from "next/image";
import CTAGroup from "./CTAGroup";
import useReducedMotion from "@/hooks/useReducedMotion";

const AnimatedHeroBackground = dynamic(() => import('./AnimatedHeroBackground'), {
  ssr: false,
  loading: () => null, // Optional: return a placeholder component or null
});

/**
 * HeroSection - Main hero section for the homepage
 * 
 * Features:
 * - Split-panel design with text content and illustration
 * - Responsive layout that adapts to screen sizes
 * - Accessible SVG illustration with proper ARIA attributes
 * - RTL support for Arabic locales
 * - Subtle animation effects
 */
const HeroSection = () => {
  const t = useTranslations("Homepage");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const heroRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Parallax effect on scroll
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      // Subtle parallax effect for the illustration
      const illustration = heroRef.current.querySelector('.hero-illustration');
      if (illustration) {
        (illustration as HTMLElement).style.transform = `translateY(${scrollY * 0.1}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prefersReducedMotion]);

  return (
    <section 
      id="home" 
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden bg-gradient-to-r from-primary/5 to-secondary/5 dark:from-transparent dark:to-transparent"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Animated background with subtle patterns */}
      <AnimatedHeroBackground />
      
      {/* Main content container with split panel layout */}
      <div className="container relative z-10 mx-auto grid h-full min-h-screen items-center px-4 py-24 md:py-32 lg:grid-cols-2 lg:gap-8">
        {/* Left panel - Text content */}
        <div className={`flex flex-col justify-center ${isRTL ? 'order-2' : 'order-1'} lg:order-none text-foreground dark:text-white`}>
          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            {t("Hero.headline")}
          </h1>
          <p className="mb-8 max-w-lg text-lg text-foreground/80 dark:text-white/80 md:text-xl">
            {t("Hero.subHeadline")}
          </p>
          <CTAGroup />
        </div>
        
        {/* Right panel - SVG illustration */}
        <div className={`hero-illustration relative mt-12 flex items-center justify-center ${isRTL ? 'order-1' : 'order-2'} lg:order-none lg:mt-0 transition-transform duration-500 ease-out will-change-transform`}>
          <div className="relative h-[300px] w-full max-w-[500px] md:h-[400px] lg:h-[450px]">
            <Image
              src="/illustrations/research.svg"
              alt={t("Hero.illustrationAlt")}
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 90vw, (max-width: 1200px) 50vw, 600px"
              aria-hidden="false"
              role="img"
            />
          </div>
          
          {/* Decorative elements */}
          <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-primary/10 dark:bg-primary/5 blur-xl" aria-hidden="true" />
          <div className="absolute -bottom-12 -right-4 h-32 w-32 rounded-full bg-secondary/10 dark:bg-secondary/5 blur-xl" aria-hidden="true" />
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className={`absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 transform flex-col items-center ${prefersReducedMotion ? 'hidden' : 'animate-bounce'}`}>
        <span className="mb-2 text-sm text-foreground/60 dark:text-white/60">
          {t("Hero.scrollIndicator")}
        </span>
        <div className="h-6 w-6 rounded-full border-2 border-foreground/30 dark:border-white/30">
          <div className="h-2 w-2 animate-pulse-slow translate-x-[7px] translate-y-[7px] rounded-full bg-primary" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 