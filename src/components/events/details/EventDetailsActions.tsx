/**
 * EventDetailsActions component for displaying action buttons and statistics
 * 
 * Uses standardized hooks:
 * - useTranslations: For i18n translations
 * - useAuth: For Supabase client access (if needed for any actions)
 */
'use client';

import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Share2,
  ExternalLink,
  BookmarkPlus,
  BookmarkCheck,
  Loader2,
  Eye,
} from "lucide-react";
import Link from "next/link";
import useTranslations from "@/hooks/useTranslations";
import { Button } from "flowbite-react";
import { isEventBookmarked, toggleBookmark } from '@/app/[locale]/profile/bookmarks/actions';

// BookmarkButtonWrapper component to handle bookmarking with custom UI
function BookmarkButtonWrapper({
  eventId, 
  text
}: {
  eventId: string;
  text: string;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check bookmark status on mount
  useEffect(() => {
    async function checkBookmarkStatus() {
      try {
        const status = await isEventBookmarked(eventId);
        setIsBookmarked(status);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkBookmarkStatus();
  }, [eventId]);

  const handleBookmark = async () => {
    setIsLoading(true);
    try {
      const result = await toggleBookmark(eventId);
      if (result.success) {
        setIsBookmarked(result.isBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      color="light" 
      className="w-full"
      onClick={handleBookmark}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="w-5 h-5 mr-2" />
      ) : (
        <BookmarkPlus className="w-5 h-5 mr-2" />
      )}
      {text}
    </Button>
  );
}

interface EventDetailsActionsProps {
  event: {
    id: string;
    status: string;
    visibility: string;
    organizer_id: string;
    event_date: string;
    submission_deadline: string | null;
    max_participants: number | null;
  };
  locale: string;
  userRole: "owner" | "participant" | "visitor" | "anonymous";
  userProfile: {
    user_type: string;
    subscription_status: string;
  } | null;
  userSubscription: {
    plan: string;
    status: string;
  } | null;
  hasSubmitted?: boolean;
  submissionId?: string;
}

export function EventDetailsActions({
  event,
  locale,
  userRole,
  userProfile,
  userSubscription,
  hasSubmitted = false,
  submissionId,
}: EventDetailsActionsProps) {
  const now = new Date();
  const eventDate = new Date(event.event_date);
  const submissionDeadline = event.submission_deadline
    ? new Date(event.submission_deadline)
    : null;
  const t = useTranslations("EventDetails");
  const isEventPast = eventDate < now;
  const isSubmissionOpen = submissionDeadline
    ? submissionDeadline > now
    : false;
  const canSubmit = userProfile?.user_type === "researcher" && isSubmissionOpen;
  const hasPremiumAccess =
    userSubscription?.plan === "premium" ||
    userSubscription?.plan === "professional"; // Owner actions

  // TODO: This would be replaced with an actual API call to check if the user has submitted
  // For now, we'll use a placeholder value
  // const hasSubmitted = false;

  if (userRole === "owner") {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t("header.statistics.title")}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">
              {t("header.statistics.registrations")}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">
              {t("header.statistics.submissions")}
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">{t("header.statistics.views")}</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {event.visibility === "public"
                ? t("visibility.public")
                : t("visibility.private")}
            </div>
            <div className="text-sm text-gray-600">
              {t("header.statistics.visibility")}
            </div>
          </div>
        </div>
      </div>
    );
  }
  // Participant (researcher) actions
  if (userRole === "participant" && userProfile?.user_type === "researcher") {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          {t("actions.participation")}
        </h2>
        
        <div className="space-y-4">
          {/* Bookmark Event */}
          <BookmarkButtonWrapper
            eventId={event.id}
            text={t("actions.bookmarkEvent")}
          />

          {/* Submit Paper/Proposal or View Submission button */}
          {canSubmit && !hasSubmitted && (
            <Link
              href={`/${locale}/profile/submissions/create/${event.id}`}
              className="w-full"
            >
              <Button 
                color="success" 
                className="w-full"
              >
                <FileText className="w-5 h-5 mr-2" />
                {t("actions.submitAbstract")}
              </Button>
            </Link>
          )}

          {/* View Submission button - Show if user has already submitted */}
          {hasSubmitted && submissionId && (
            <Link
              href={`/${locale}/profile/submissions/${submissionId}`}
              className="w-full"
            >
              <Button 
                color="info" 
                className="w-full"
              >
                <Eye className="w-5 h-5 mr-2" />
                {t("actions.viewSubmission")}
              </Button>
            </Link>
          )}

          {/* Premium Features Indicator */}
          {hasPremiumAccess && (
            <div className="w-full flex items-center justify-center px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm">
              <span className="font-medium">{t("subscription.premiumFeatures")}</span>
            </div>
          )}
        </div>


      </div>
    );
  }

  // General visitor actions
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {t("actions.title")}
      </h2>
      <div className="space-y-3">
        {/* Add to Calendar */}
        {!isEventPast && (
          <Button 
            color="light" 
            className="w-full"
          >
            <Calendar className="w-5 h-5 mr-2" />
            {t("actions.addToCalendar")}
          </Button>
        )}

        {/* Save Event */}
        <BookmarkButtonWrapper
          eventId={event.id}
          text={t("actions.saveEvent")}
        />

        {/* Share Event */}
        <Button 
          color="light" 
          className="w-full"
        >
          <Share2 className="w-5 h-5 mr-2" />
          {t("actions.shareEvent")}
        </Button>

        {/* View Event Website - Assuming event might have a website_url property */}
        {/* For now, let's use a placeholder condition, replace with event.website_url when available */}
        {event.id && ( // Placeholder: Replace with actual condition like event.website_url
          <Link
            href={`/${locale}/events/${event.id}`} // Placeholder: Replace with event.website_url if it's an external link
            target="_blank" // Open in new tab if it's an external link
            rel="noopener noreferrer" // Security for opening in new tab
            className="w-full"
          >
            <Button 
              color="blue" 
              className="w-full"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              {t("actions.viewWebsite")}
            </Button>
          </Link>
        )}
      </div>

      {/* Event Status Information */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          {t("status.title")}
        </h3>
        {isEventPast ? (
          <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 font-medium">
              {t("status.eventPassed")}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {t("status.eventDate")}:{" "}
              {eventDate.toLocaleDateString(
                locale === "ar" ? "ar-DZ" : "en-US"
              )}
            </p>
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">
              {t("status.eventUpcoming")}
            </p>
            <p className="text-sm text-green-600 mt-1">
              {t("status.eventDate")}:{" "}
              {eventDate.toLocaleDateString(
                locale === "ar" ? "ar-DZ" : "en-US"
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
