"use client";

import { useState } from "react";
import { HiCalendar, HiCheckCircle, HiXCircle } from "react-icons/hi";
import Image from "next/image";
import { DetailLinkButton } from "@/components/admin/ui";
import EventDetailModal from "./EventDetailModal";
import { formatDate } from "@/utils/date";
import { Database } from "@/database.types";
import { useAuth } from "@/hooks/useAuth";

type EventType = {
  id: string;
  event_name: string;
  event_date: string;
  event_end_date: string;
  organizer_name: string;
  status: Database["public"]["Enums"]["event_status_enum"];
  format: Database["public"]["Enums"]["event_format_enum"];
  logo_url: string | null;
  consolidated_status: "ongoing" | "completed" | "cancelled";
  abstract_submission_deadline?: string;
  email?: string;
  phone?: string;
  website?: string | null;
  problem_statement_translations?: { [key: string]: string };
  submission_guidelines_translations?: { [key: string]: string };
  event_axes_translations?: { [key: string]: string };
  event_objectives_translations?: { [key: string]: string };
  who_organizes_translations?: { [key: string]: string };
  wilaya_name?: string;
  daira_name?: string;
  scientific_committees_translations?: { [key: string]: string };
  speakers_keynotes_translations?: { [key: string]: string };
  target_audience_translations?: { [key: string]: string };
  qr_code_url?: string | null;
  organizer_profile_picture_url?: string | null;
};

interface EventsClientWrapperProps {
  events: EventType[];
  locale: string;
  translations: {
    table: {
      event: string;
      date: string;
      from: string;
      to: string;
      organizer: string;
      status: string;
      actions: string;
    };
    status: {
      ongoing: string;
      completed: string;
      cancelled: string;
    };
    actions: {
      viewDetails: string;
    };
    unknownEvent: string;
    unknownOrganizer: string;
    modal: {
      eventDetails: string;
      close: string;
      eventInfo: string;
      dates: string;
      location: string;
      contact: string;
      status: {
        ongoing: string;
        completed: string;
        cancelled: string;
      };
      format: {
        physical: string;
        virtual: string;
        hybrid: string;
      };
      from: string;
      to: string;
      submissionDeadline: string;
      organizer: string;
      problemStatement: string;
      eventAxes: string;
      eventObjectives: string;
      submissionGuidelines: string;
      whoOrganizes: string;
      notAvailable: string;
      targetAudience?: string;
      scientificCommittee?: string;
      speakers?: string;
      logo?: {
        title: string;
        noLogo: string;
      };
      qrCode?: {
        title: string;
        noQrCode: string;
      };
      objectives?: {
        title: string;
        empty: string;
      };
      topics?: {
        title: string;
      };
    };
  };
}

export default function EventsClientWrapper({
  events,
  locale,
  translations,
}: EventsClientWrapperProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  const { supabase } = useAuth();

  const handleViewDetails = async (event: EventType) => {
    // Set loading state for this specific event
    setLoadingEventId(event.id);

    try {
      // Fetch the complete event data using the event ID
      const { data: eventDetails, error } = await supabase
        .from("events")
        .select(
          `
          id,
          email,
          phone,
          website,
          created_by,
          qr_code_url,
          problem_statement_translations,
          event_objectives_translations,
          submission_guidelines_translations,
          event_axes_translations,
          who_organizes_translations,
          scientific_committees_translations,
          speakers_keynotes_translations,
          target_audience_translations
        `
        )
        .eq("id", event.id)
        .single();

      if (error) {
        setSelectedEvent(event);
        setShowModal(true);
        return;
      }

      // Fetch the organizer's profile picture if we have created_by
      let organizerProfilePictureUrl = null;
      if (eventDetails?.created_by) {
        const { data: organizerData } = await supabase
          .from("organizer_profiles")
          .select("profile_picture_url")
          .eq("profile_id", eventDetails.created_by)
          .single();

        if (organizerData) {
          organizerProfilePictureUrl = organizerData.profile_picture_url;
        }
      }

      // Merge the fetched data with the event data we already have
      const completeEvent: EventType = {
        ...event,
        email: eventDetails?.email || "",
        phone: eventDetails?.phone || "",
        website: eventDetails?.website || null,
        qr_code_url: eventDetails?.qr_code_url || null,
        // Type casting to ensure TypeScript is happy
        problem_statement_translations:
          (eventDetails?.problem_statement_translations as {
            [key: string]: string;
          }) || {},
        event_objectives_translations:
          (eventDetails?.event_objectives_translations as {
            [key: string]: string;
          }) || {},
        submission_guidelines_translations:
          (eventDetails?.submission_guidelines_translations as {
            [key: string]: string;
          }) || {},
        event_axes_translations:
          (eventDetails?.event_axes_translations as {
            [key: string]: string;
          }) || {},
        who_organizes_translations:
          (eventDetails?.who_organizes_translations as {
            [key: string]: string;
          }) || {},
        scientific_committees_translations:
          (eventDetails?.scientific_committees_translations as {
            [key: string]: string;
          }) || {},
        speakers_keynotes_translations:
          (eventDetails?.speakers_keynotes_translations as {
            [key: string]: string;
          }) || {},
        target_audience_translations:
          (eventDetails?.target_audience_translations as {
            [key: string]: string;
          }) || {},
        organizer_profile_picture_url: organizerProfilePictureUrl,
      };

      setSelectedEvent(completeEvent);
      setShowModal(true);
    } catch {
      setSelectedEvent(event);
      setShowModal(true);
    } finally {
      setLoadingEventId(null);
    }
  };

  const isRtl = locale === "ar";

  // Function to get appropriate text align class based on RTL
  const getTextAlignClass = () => {
    return isRtl ? "text-right" : "text-left";
  };

  // Stronger RTL text direction enforcement classes
  const getRtlClass = () => {
    return isRtl ? "rtl" : "ltr";
  };

  // Modal translations
  const modalTranslations = {
    eventDetails: translations.modal.eventDetails,
    close: translations.modal.close,
    eventInfo: translations.modal.eventInfo,
    dates: translations.modal.dates,
    location: translations.modal.location,
    contact: translations.modal.contact,
    status: translations.status,
    format: translations.modal.format,
    from: translations.modal.from,
    to: translations.modal.to,
    submissionDeadline: translations.modal.submissionDeadline,
    organizer: translations.modal.organizer,
    problemStatement: translations.modal.problemStatement,
    eventAxes: translations.modal.eventAxes,
    eventObjectives: translations.modal.eventObjectives,
    submissionGuidelines: translations.modal.submissionGuidelines,
    whoOrganizes: translations.modal.whoOrganizes,
    notAvailable: translations.modal.notAvailable,
    targetAudience: translations.modal.targetAudience || "Target Audience",
    scientificCommittee:
      translations.modal.scientificCommittee || "Scientific Committee",
    speakers: translations.modal.speakers || "Speakers & Keynotes",
    logo: {
      title: translations.modal.logo?.title || "Event Logo",
      noLogo: translations.modal.logo?.noLogo || "No logo available",
    },
    qrCode: {
      title: translations.modal.qrCode?.title || "QR Code",
      noQrCode: translations.modal.qrCode?.noQrCode || "No QR code available",
    },
    objectives: {
      title:
        translations.modal.objectives?.title ||
        translations.modal.eventObjectives,
      empty: translations.modal.objectives?.empty || "No objectives available",
    },
    topics: {
      title: translations.modal.topics?.title || "Topics",
    },
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table
          className={`w-full text-sm text-gray-500 dark:text-gray-400 ${getRtlClass()} min-w-[700px]`}
          dir={isRtl ? "rtl" : "ltr"}
          style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
        >
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th
                scope="col"
                className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
              >
                {translations.table.event}
              </th>
              <th
                scope="col"
                className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
              >
                {translations.table.date}
              </th>
              <th
                scope="col"
                className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
              >
                {translations.table.organizer}
              </th>
              <th
                scope="col"
                className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
              >
                {translations.table.status}
              </th>
              <th
                scope="col"
                className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
              >
                {translations.table.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${getRtlClass()}`}
                dir={isRtl ? "rtl" : "ltr"}
              >
                {/* Event column with logo and name */}
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-3 font-medium text-gray-900 dark:text-white ${getTextAlignClass()}`}
                  style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
                >
                  <div
                    className={`flex items-center gap-3 ${
                      isRtl ? "flex-row-reverse justify-end" : ""
                    }`}
                  >
                    {isRtl && (
                      <>
                        <span>
                          {event.event_name || translations.unknownEvent}
                        </span>
                        {event.logo_url && (
                          <Image
                            src={event.logo_url}
                            alt={event.event_name || translations.unknownEvent}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                      </>
                    )}
                    {!isRtl && (
                      <>
                        {event.logo_url && (
                          <Image
                            src={event.logo_url}
                            alt={event.event_name || translations.unknownEvent}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <span>
                          {event.event_name || translations.unknownEvent}
                        </span>
                      </>
                    )}
                  </div>
                </td>

                {/* Date column */}
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                  style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
                >
                  <div>
                    <div>
                      {translations.table.from}{" "}
                      {formatDate(event.event_date, locale)}
                    </div>
                    {event.event_end_date && (
                      <div className="text-xs text-gray-500">
                        {translations.table.to}{" "}
                        {formatDate(event.event_end_date, locale)}
                      </div>
                    )}
                  </div>
                </td>

                {/* Organizer column */}
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                  style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
                >
                  {event.organizer_name || translations.unknownOrganizer}
                </td>

                {/* Status column */}
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                  style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
                >
                  <div className="flex items-center">
                    {event.consolidated_status === "ongoing" ? (
                      <div className="flex items-center text-blue-500 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                        <HiCalendar
                          className={`${isRtl ? "ml-1" : "mr-1"} h-4 w-4`}
                        />
                        {translations.status.ongoing}
                      </div>
                    ) : event.consolidated_status === "completed" ? (
                      <div className="flex items-center text-green-500 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                        <HiCheckCircle
                          className={`${isRtl ? "ml-1" : "mr-1"} h-4 w-4`}
                        />
                        {translations.status.completed}
                      </div>
                    ) : (
                      <div className="flex items-center text-red-500 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-full">
                        <HiXCircle
                          className={`${isRtl ? "ml-1" : "mr-1"} h-4 w-4`}
                        />
                        {translations.status.cancelled}
                      </div>
                    )}
                  </div>
                </td>

                {/* Actions column */}
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                  style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
                >
                  <div className="flex flex-col sm:flex-row gap-2">
                    {loadingEventId === event.id ? (
                      <button
                        disabled
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 font-medium rounded-lg inline-flex items-center"
                      >
                        <span className="mr-2">
                          <svg
                            className="animate-spin h-4 w-4"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                        </span>
                        {translations.actions.viewDetails}
                      </button>
                    ) : (
                      <DetailLinkButton
                        href="#"
                        label={translations.actions.viewDetails}
                        onClick={() => handleViewDetails(event)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal
          show={showModal}
          onClose={() => setShowModal(false)}
          event={selectedEvent}
          translations={modalTranslations}
          locale={locale}
        />
      )}
    </>
  );
}
