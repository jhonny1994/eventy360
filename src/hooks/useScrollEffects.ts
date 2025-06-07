import { useState, useEffect } from 'react';

// Custom hook for scroll effects
export const useScrollEffects = (
  sectionLinks: { href: string; label: string }[],
  enabled: boolean = true
) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (!enabled) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-30% 0px -70% 0px' }
    );

    const setupObserver = setTimeout(() => {
      sectionLinks.forEach((link) => {
        const element = document.getElementById(link.href.substring(1));
        if (element) {
          observer.observe(element);
        }
      });
    }, 100);

    return () => {
      clearTimeout(setupObserver);
      sectionLinks.forEach((link) => {
        const element = document.getElementById(link.href.substring(1));
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [sectionLinks, enabled]);

  return { isScrolled, activeSection };
};
 