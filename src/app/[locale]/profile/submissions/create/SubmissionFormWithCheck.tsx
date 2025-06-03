'use client';

import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import SubmissionForm from "@/components/submissions/SubmissionForm";

interface SubmissionFormWithCheckProps {
  eventId: string;
}

/**
 * SubmissionFormWithCheck Component
 * 
 * This component acts as a security wrapper around the submission form, ensuring that
 * only users with the appropriate subscription level can access and submit content to events.
 * 
 * Features:
 * - Subscription access validation using standardized hooks
 * - Automatic redirection for unauthorized users
 * - Loading state management during subscription check
 * - Toast notifications for subscription requirement feedback
 * - Conditional rendering of the protected submission form
 * 
 * Standardized Patterns Used:
 * - useSubscriptionCheck: Custom hook for premium feature protection
 * - Wrapper component pattern to separate access control from UI logic
 * - Loading state management with visual feedback
 * - Component-based architecture with clear separation of concerns
 * - Conditional rendering based on authentication/authorization state
 * - Prop type safety with TypeScript interfaces
 */
export default function SubmissionFormWithCheck({ eventId }: SubmissionFormWithCheckProps) {
  // Check subscription - redirect if user doesn't have required subscription
  const { hasAccess, loading } = useSubscriptionCheck({
    redirectOnFailure: true,
    showToastOnRedirect: true
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Only render the form if user has access
  return hasAccess ? <SubmissionForm eventId={eventId} /> : null;
} 