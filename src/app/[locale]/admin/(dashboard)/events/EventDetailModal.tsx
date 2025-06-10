"use client";

import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "flowbite-react";
import { useLocale } from "next-intl";
import { EventDetailsHeader } from "@/components/events/details/EventDetailsHeader";
import { EventDetailsTimeline } from "@/components/events/details/EventDetailsTimeline";
import { EventDetailsLocation } from "@/components/events/details/EventDetailsLocation";
import {
  Tag,
  Users,
  Target,
  Lightbulb,
  BookOpen,
  UserCheck,
  QrCode,
  Building,
} from "lucide-react";
import Image from "next/image";

interface EventDetailModalProps {
  show: boolean;
  onClose: () => void;
  event: {
    id: string;
    event_name: string;
    event_date: string;
    event_end_date: string;
    organizer_name: string;
    status: string;
    format: string;
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
  translations: {
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
    targetAudience: string;
    scientificCommittee: string;
    speakers: string;
    logo: {
      title: string;
      noLogo: string;
    };
    qrCode: {
      title: string;
      noQrCode: string;
    };
    objectives: {
      title: string;
      empty: string;
    };
    topics: {
      title: string;
    };
  };
  locale: string;
}

export default function EventDetailModal({
  show,
  onClose,
  event,
  translations,
  locale,
}: EventDetailModalProps) {
  const appLocale = useLocale();
  const isRtl = appLocale === "ar";

  // Transform event data to match the EventDetailsHeader format
  const headerEvent = {
    id: event.id,
    title: event.event_name,
    subtitle: null,
    event_type: event.format || "physical",
    event_date: event.event_date,
    max_participants: null,
    registration_fee: null,
    status: event.status,
    visibility:
      event.consolidated_status === "cancelled" ? "private" : "public",
    format: event.format,
    phone: event.phone || "",
    email: event.email || "",
    website: event.website || null,
    created_at: new Date().toISOString(), // We don't have this info in the admin view
    organizer: event.organizer_name
      ? {
          display_name: event.organizer_name,
          profile_picture_url: event.organizer_profile_picture_url || null,
          is_verified: true, // Assuming organizers are verified
        }
      : null,
  };

  // Transform event data to match the EventDetailsTimeline format
  const timelineEvent = {
    event_date: event.event_date,
    event_end_date: event.event_end_date || null,
    submission_deadline: event.abstract_submission_deadline || null,
    review_deadline: null,
    notification_date: null,
    submission_verdict_deadline: new Date().toISOString(), // Default value
  };

  // Transform event data to match the EventDetailsLocation format
  const locationEvent = {
    location:
      event.wilaya_name && event.daira_name
        ? `${event.wilaya_name}, ${event.daira_name}`
        : null,
    format: event.format,
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="6xl"
      position="center"
      dismissible
    >
      <ModalHeader
        className={`flex items-center justify-between ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        <span>{translations.eventDetails}</span>
      </ModalHeader>

      <ModalBody
        className={`${
          isRtl ? "rtl text-right" : "ltr text-left"
        } overflow-y-auto max-h-[70vh]`}
      >
        <div className="space-y-6">
          {/* Use the EventDetailsHeader component */}
          <EventDetailsHeader event={headerEvent} locale={locale} />

          {/* Display event date and timeline information */}
          <EventDetailsTimeline event={timelineEvent} locale={locale} />

          {/* Display location if available */}
          {(event.wilaya_name || event.format) && (
            <EventDetailsLocation event={locationEvent} />
          )}

          {/* Row 1: Event Logo and QR Code */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Logo */}
            {event.logo_url && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building
                    className={`w-5 h-5 ${
                      isRtl ? "ml-2" : "mr-2"
                    } text-purple-600`}
                  />
                  {translations.logo?.title || "Logo"}
                </h3>
                <div className="flex justify-center items-center min-h-[200px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="relative w-full h-48">
                    <Image
                      src={event.logo_url}
                      alt={`${event.event_name} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* QR Code */}
            {event.qr_code_url && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <QrCode
                    className={`w-5 h-5 ${
                      isRtl ? "ml-2" : "mr-2"
                    } text-purple-600`}
                  />
                  {translations.qrCode?.title || "QR Code"}
                </h3>
                <div className="flex justify-center items-center min-h-[200px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="relative w-48 h-48">
                    <Image
                      src={event.qr_code_url}
                      alt={`${event.event_name} QR code`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Who Organizes Section */}
          {event.who_organizes_translations &&
            event.who_organizes_translations[locale] && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users
                    className={`w-5 h-5 ${
                      isRtl ? "ml-2" : "mr-2"
                    } text-purple-600`}
                  />
                  {translations.whoOrganizes}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.who_organizes_translations[locale]}
                  </div>
                </div>
              </div>
            )}

          {/* Problem Statement Section */}
          {event.problem_statement_translations &&
            event.problem_statement_translations[locale] && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb
                    className={`w-5 h-5 ${
                      isRtl ? "ml-2" : "mr-2"
                    } text-purple-600`}
                  />
                  {translations.problemStatement}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.problem_statement_translations[locale]}
                  </div>
                </div>
              </div>
            )}

          {/* Event Objectives */}
          {event.event_objectives_translations &&
            event.event_objectives_translations[locale] && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Target
                    className={`w-5 h-5 ${
                      isRtl ? "ml-2" : "mr-2"
                    } text-purple-600`}
                  />
                  {translations.objectives?.title ||
                    translations.eventObjectives}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.event_objectives_translations[locale]}
                  </div>
                </div>
              </div>
            )}

          {/* Event Axes */}
          {event.event_axes_translations &&
            event.event_axes_translations[locale] && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Tag
                    className={`w-5 h-5 ${
                      isRtl ? "ml-2" : "mr-2"
                    } text-purple-600`}
                  />
                  {translations.eventAxes}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.event_axes_translations[locale]}
                  </div>
                </div>
              </div>
            )}

          {/* Submission Guidelines */}
          {event.submission_guidelines_translations &&
            event.submission_guidelines_translations[locale] && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BookOpen
                    className={`w-5 h-5 ${
                      isRtl ? "ml-2" : "mr-2"
                    } text-purple-600`}
                  />
                  {translations.submissionGuidelines}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.submission_guidelines_translations[locale]}
                  </div>
                </div>
              </div>
            )}

          {/* Target Audience */}
          {event.target_audience_translations &&
            event.target_audience_translations[locale] && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserCheck
                    className={`w-5 h-5 ${
                      isRtl ? "ml-2" : "mr-2"
                    } text-purple-600`}
                  />
                  {translations.targetAudience || "Target Audience"}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.target_audience_translations[locale]}
                  </div>
                </div>
              </div>
            )}

          {/* Scientific Committee */}
          {event.scientific_committees_translations &&
            event.scientific_committees_translations[locale] && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users
                    className={`w-5 h-5 ${
                      isRtl ? "ml-2" : "mr-2"
                    } text-purple-600`}
                  />
                  {translations.scientificCommittee || "Scientific Committee"}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.scientific_committees_translations[locale]}
                  </div>
                </div>
              </div>
            )}

          {/* Speakers & Keynotes */}
          {event.speakers_keynotes_translations &&
            event.speakers_keynotes_translations[locale] && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users
                    className={`w-5 h-5 ${
                      isRtl ? "ml-2" : "mr-2"
                    } text-purple-600`}
                  />
                  {translations.speakers || "Speakers & Keynotes"}
                </h3>
                <div className="prose prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {event.speakers_keynotes_translations[locale]}
                  </div>
                </div>
              </div>
            )}
        </div>
      </ModalBody>

      <ModalFooter className="flex justify-end">
        <Button color="gray" onClick={onClose}>
          {translations.close}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
