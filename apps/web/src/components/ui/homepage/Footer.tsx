"use client";

import useTranslations from "@/hooks/useTranslations";
import Link from "next/link";
import { Facebook, Linkedin, Twitter } from "lucide-react";
import useLocale from "@/hooks/useLocale";
import React from "react";

/**
 * Footer component with enhanced design
 * - Links to important pages
 * - Social media integration
 * - RTL-aware layout and copyright notice
 * - Striped pattern consistency
 */
const Footer: React.FC = () => {
  const t = useTranslations("Homepage");
  const tAria = useTranslations("AriaLabels");
  const locale = useLocale();
  const currentYear = new Date().getFullYear();
  const isRtl = locale === "ar";

  // Links with proper i18n support
  const links = [
    { title: t("Footer.links.terms"), href: `/${locale}/terms` },
    { title: t("Footer.links.privacy"), href: `/${locale}/privacy` },
    { title: t("Footer.links.contact"), href: `/${locale}/contact` }
  ];

  const socialLinks = [
    {
      href: "https://facebook.com",
      icon: <Facebook size={20} />,
      label: tAria("social.facebook"),
    },
    {
      href: "https://twitter.com",
      icon: <Twitter size={20} />,
      label: tAria("social.twitter"),
    },
    {
      href: "https://linkedin.com",
      icon: <Linkedin size={20} />,
      label: tAria("social.linkedin"),
    },
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
            <div className="flex justify-center space-x-4 rtl:space-x-reverse md:order-2 md:justify-start">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-white"
                  aria-label={link.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright bar */}
        <div className="mt-8 border-t border-border/20 pt-6 text-center text-sm text-foreground/70">
          <p className={`flex items-center justify-center ${isRtl ? "flex-row-reverse" : "flex-row"} gap-1`}>
            <span>©</span>
            <span>{currentYear}</span>
            <span>Eventy360.</span>
            <span>{t("Footer.rightsReserved")}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 