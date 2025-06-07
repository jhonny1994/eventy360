"use client";

import { motion } from "framer-motion";

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <motion.div
      variants={cardVariants}
      className="rounded-lg bg-background p-6 text-center shadow-sm"
    >
      <div className="mb-4 inline-block rounded-lg bg-primary/10 p-3 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="text-foreground/80">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
