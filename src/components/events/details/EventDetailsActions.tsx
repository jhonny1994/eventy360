import React from "react";
import {
  FileText,
  Calendar,
  Share2,
  BookmarkPlus,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

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
}

export function EventDetailsActions({
  event,
  locale,
  userRole,
  userProfile,
  userSubscription,
  hasSubmitted = false,
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
          <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <BookmarkPlus className="w-5 h-5 mr-2" />
            {t("actions.bookmarkEvent")}
          </button>

          {/* Submit Paper/Proposal - Only show if user hasn't submitted yet */}
          {canSubmit && !hasSubmitted && (
            <Link
              href={`/${locale}/profile/submissions/create/${event.id}`}
              className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileText className="w-5 h-5 mr-2" />
              {t("actions.submitAbstract")}
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
          <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-5 h-5 mr-2" />
            {t("actions.addToCalendar")}
          </button>
        )}

        {/* Save Event */}
        <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <BookmarkPlus className="w-5 h-5 mr-2" />
          {t("actions.saveEvent")}
        </button>

        {/* Share Event */}
        <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <Share2 className="w-5 h-5 mr-2" />
          {t("actions.shareEvent")}
        </button>

        {/* View Event Website - Assuming event might have a website_url property */}
        {/* For now, let's use a placeholder condition, replace with event.website_url when available */}
        {event.id && ( // Placeholder: Replace with actual condition like event.website_url
          <Link
            href={`/${locale}/events/${event.id}`} // Placeholder: Replace with event.website_url if it's an external link
            target="_blank" // Open in new tab if it's an external link
            rel="noopener noreferrer" // Security for opening in new tab
            className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            {t("actions.viewWebsite")}
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
