/**
 * Utility functions for formatting data in admin section
 */

/**
 * Formats a date string according to specified locale
 * @param dateString - ISO date string to format
 * @param locale - Locale to use for formatting (defaults to Arabic)
 * @returns Formatted date string or 'N/A' if no date provided
 */
export const formatDate = (
  dateString: string | null,
  locale = "ar-DZ"
): string => {
  if (!dateString) return "N/A";

  return new Date(dateString).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Returns color and label for status badges based on status string
 * @param status - Status string from database
 * @param t - Translation function
 * @returns Object containing color and localized label for the status
 */
export type BadgeColor = "info" | "success" | "failure" | "warning" | "gray";

export const getStatusBadgeProps = (
  status: string | null,
  t: (key: string) => string
): { color: BadgeColor; label: string } => {
  switch (status) {
    case "pending":
      return { color: "warning", label: t("status.pending") };
    case "approved":
    case "verified":
      return { color: "success", label: t("status.approved") };
    case "rejected":
      return { color: "failure", label: t("status.rejected") };
    default:
      return { color: "info", label: status || t("status.unknown") };
  }
};

/**
 * Truncates text with ellipsis if it exceeds max length
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncating
 * @returns Truncated text with ellipsis or original text if short enough
 */
export const truncateText = (text: string | null, maxLength = 50): string => {
  if (!text) return "";

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength)}...`;
};
