"use client";

import useTranslations from "@/hooks/useTranslations";
import Link from "next/link";
import { Facebook, Linkedin, Twitter } from "lucide-react";
import useLocale from "@/hooks/useLocale";

/**
 * Footer component with enhanced design
 * - Links to important pages
 * - Social media integration
 * - RTL-aware layout and copyright notice
 * - Striped pattern consistency
 */
const Footer = () => {
  const t = useTranslations("Homepage");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();
  const isRtl = locale === "ar";

  // Links with proper i18n support
  const links = [
    { title: t("Footer.links.terms"), href: `/${locale}/terms` },
    { title: t("Footer.links.privacy"), href: `/${locale}/privacy` },
    { title: t("Footer.links.contact"), href: `/${locale}/contact` }
  ];

  return (
    <footer className="relative z-10 border-t border-border/40 bg-gradient-to-r from-primary/5 to-secondary/5 dark:bg-transparent py-12 backdrop-blur-lg">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Logo and tagline */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Eventy360</h3>
            <p className="text-sm text-foreground/80">{t("Footer.tagline")}</p>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t("Footer.quickLinks")}</h4>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-primary"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">{t("Footer.connect")}</h4>
            <div className="flex">
              <Link 
                href="https://facebook.com" 
                className={`text-foreground/80 transition-colors hover:text-primary ${isRtl ? 'ml-4' : 'mr-4'}`}
              >
                <Facebook size={20} />
              </Link>
              <Link 
                href="https://x.com" 
                className={`text-foreground/80 transition-colors hover:text-primary ${isRtl ? 'ml-4' : 'mr-4'}`}
              >
                <Twitter size={20} />
              </Link>
              <Link 
                href="https://linkedin.com" 
                className="text-foreground/80 transition-colors hover:text-primary"
              >
                <Linkedin size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-8 border-t border-border/20 pt-6 text-center text-sm text-foreground/70">
          <p className={`flex items-center justify-center ${isRtl ? "flex-row-reverse" : "flex-row"} gap-1`}>
            <span>{isRtl ? "" : "©"}</span>
            <span>{currentYear}</span>
            <span>Eventy360.</span>
            <span>{t("Footer.rightsReserved")}</span>
            <span>{isRtl ? "©" : ""}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 