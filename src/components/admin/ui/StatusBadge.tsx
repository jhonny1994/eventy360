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
};

/**
 * A consistent status badge component for admin UI
 *
 * @param props - Component props
 * @returns Status badge with appropriate color based on status
 */
export default function StatusBadge({
  status,
  translations,
}: StatusBadgeProps) {
  const { color, label } = getStatusBadgeProps(status, (key: string) => {
    const keyPart = key.split(".")[1]; // Extract 'pending', 'approved', etc. from 'status.pending'
    return (
      translations[keyPart as keyof typeof translations] || translations.unknown
    );
  });

  return <Badge color={color as BadgeColor}>{label}</Badge>;
}
