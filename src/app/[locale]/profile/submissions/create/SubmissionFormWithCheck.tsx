'use client';

import { useSubscriptionCheck } from "@/hooks/useSubscriptionCheck";
import SubmissionForm from "@/components/submissions/SubmissionForm";

interface SubmissionFormWithCheckProps {
  eventId: string;
}

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