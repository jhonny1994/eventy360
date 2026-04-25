"use client";

import UniversalStatusBadge, { StatusType } from "@/components/ui/StatusBadge";

type StatusBadgeProps = {
  status: string | null;
  translations: {
    pending: string;
    approved: string;
    rejected: string;
    unknown: string;
  };
  locale?: string; // Kept for backward compatibility
};

/**
 * A consistent status badge component for admin UI
 * Now uses the shared StatusBadge component for consistency
 *
 * @param props - Component props
 * @returns Status badge with appropriate color based on status
 */
export default function StatusBadge({
  status,
  translations
}: StatusBadgeProps) {
  // Map admin-specific status names to universal status types
  const mapStatusToType = (adminStatus: string | null): string => {
    switch (adminStatus?.toLowerCase()) {
      case 'pending':
      case 'pending_verification':
        return 'pending_verification';
      case 'approved':
      case 'verified':
        return 'verified';
      case 'rejected':
        return 'rejected';
      default:
        return 'free'; // Use as fallback/neutral status
    }
  };
  
  // Map keys to translation strings
  const getTranslatedLabel = (key: string | null): string => {
    if (!key) return translations.unknown;
    
    // Try to use the key directly first
    if (translations[key as keyof typeof translations]) {
      return translations[key as keyof typeof translations];
    }
    
    // Fallback to checking for pending, approved, rejected
    switch (key.toLowerCase()) {
      case 'pending':
      case 'pending_verification':
        return translations.pending;
      case 'approved':
      case 'verified':
        return translations.approved;
      case 'rejected':
        return translations.rejected;
      default:
        return translations.unknown;
    }
  };

  // Map admin status to universal status type
  const universalStatus = mapStatusToType(status);
  
  // Get appropriate label
  const label = getTranslatedLabel(status);

  return (
    <UniversalStatusBadge 
      status={universalStatus as StatusType}
      label={label}
      className="w-auto"
    />
  );
}
