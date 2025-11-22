"use client";

import { motion } from "framer-motion";
import useTranslations from "@/hooks/useTranslations";
import {
  Search,
  FileText,
  Library,
  SlidersHorizontal,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { memo } from "react";

/**
 * Animation variants for staggered container animations
 */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

/**
 * FeatureCard - Animated card component for displaying individual features
 * 
 * @param props - Component props
 * @param props.icon - React node for the feature icon
 * @param props.title - Feature title text
 * @param props.description - Feature description text
 */
const FeatureCard = memo(({ icon, title, description }: FeatureCardProps) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }}
    className="flex h-full flex-col rounded-lg bg-background dark:bg-background/30 p-6 text-center shadow-sm backdrop-blur-sm"
  >
    <div className="mb-4 inline-block rounded-lg bg-primary/15 dark:bg-primary/25 p-3 text-primary">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-bold">{title}</h3>
    <p className="grow text-foreground/80">{description}</p>
  </motion.div>
));

// Add display name for better debugging in production
FeatureCard.displayName = "FeatureCard";

/**
 * FeaturesSection - Section showcasing the key features of the platform
 * 
 * Uses gradient background as the third section in the alternating pattern
 * Uses framer-motion for animation
 */
const FeaturesSection = () => {
  const t = useTranslations("Homepage");

  // Define features with their icons and translation keys
  const features = [
    {
      icon: <Search size={28} />,
      key: "discovery",
    },
    {
      icon: <FileText size={28} />,
      key: "submissions",
    },
    {
      icon: <Library size={28} />,
      key: "repository",
    },
    {
      icon: <SlidersHorizontal size={28} />,
      key: "tools",
    },
    {
      icon: <ShieldCheck size={28} />,
      key: "trust",
    },
    {
      icon: <Globe size={28} />,
      key: "design",
    },
  ];

  return (
    <section 
      id="features" 
      className="bg-linear-to-r from-primary/5 to-secondary/5 dark:bg-transparent py-24"
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">{t("Features.headline")}</h2>
        <p className="mx-auto mb-12 max-w-2xl text-lg text-foreground/80">
          {t("Features.subHeadline")}
        </p>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => (
            <FeatureCard
              key={feature.key}
              icon={feature.icon}
              title={t(`Features.${feature.key}.title`)}
              description={t(`Features.${feature.key}.description`)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;