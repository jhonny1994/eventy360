"use client";

import { Badge } from "flowbite-react";
import { getStatusBadgeProps, type BadgeColor } from "@/utils/admin/format";

type StatusBadgeProps = {
  status: string | null;
  translations: {
    pending: string;
    approved: string;
    rejected: string;
    unknown: string;
  };
  locale?: string; // Added locale prop for RTL support
};

/**
 * A consistent status badge component for admin UI
 * Supports RTL languages with proper text alignment
 *
 * @param props - Component props
 * @returns Status badge with appropriate color based on status
 */
export default function StatusBadge({
  status,
  translations,
  locale = 'en' // Default to English
}: StatusBadgeProps) {
  const isRtl = locale === 'ar';
  
  const { color, label } = getStatusBadgeProps(status, (key: string) => {
    const keyPart = key.split(".")[1]; // Extract 'pending', 'approved', etc. from 'status.pending'
    return (
      translations[keyPart as keyof typeof translations] || translations.unknown
    );
  });

  // Stronger RTL styling with inline styles
  const rtlStyle = isRtl ? { textAlign: 'right' as const } : {};

  return (
    <Badge 
      color={color as BadgeColor} 
      dir={isRtl ? 'rtl' : 'ltr'} 
      style={rtlStyle}
      className={isRtl ? 'text-right' : 'text-left'}
    >
      {label}
    </Badge>
  );
}
