"use client";

import { useState, useMemo } from "react";
import { HiInbox, HiClipboardCheck, HiCheckCircle, HiXCircle, HiUser } from "react-icons/hi";
import Image from "next/image";
import SubmissionDetailModal from "./SubmissionDetailModal";
import { formatDate } from "@/utils/date";
import { Database } from "@/database.types";
import { DetailLinkButton } from "@/components/admin/ui";

type SubmissionType = {
  id: string;
  title: string;
  abstract: string | null;
  submission_date: string;
  status: Database["public"]["Enums"]["submission_status_enum"];
  researcher_name: string;
  researcher_id: string;
  event_name: string;
  event_id: string;
  researcher_profile_picture_url: string | null;
  feedback: string | null;
  current_version: number;
  keywords: string[] | null;
  file_url: string | null;
};

interface SubmissionsClientWrapperProps {
  submissions: SubmissionType[];
  locale: string;
  translations: {
    table: {
      title: string;
      author: string;
      event: string;
      submissionDate: string;
      status: string;
      actions: string;
    };
    status: {
      received: string;
      underReview: string;
      accepted: string;
      rejected: string;
    };
    actions: {
      viewDetails: string;
    };
    unknownSubmission: string;
    unknownResearcher: string;
    unknownEvent: string;
    modal: {
      submissionDetails: string;
      close: string;
      submissionInfo: string;
      title: string;
      abstract: string;
      researcher: string;
      event: string;
      submissionDate: string;
      status: string;
      version: string;
      keywords: string;
      noKeywords: string;
      downloadFile: string;
      noFileAvailable: string;
      reviewFeedback: string;
      noFeedback: string;
    };
  };
}

export default function SubmissionsClientWrapper({
  submissions,
  locale,
  translations,
}: SubmissionsClientWrapperProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionType | null>(null);
  const [loadingSubmissionId, setLoadingSubmissionId] = useState<string | null>(null);

  const isRtl = locale === "ar";

  // Memoize the RTL helper values for better performance
  const rtlHelpers = useMemo(() => {
    return {
      textAlignClass: isRtl ? 'text-right' : 'text-left',
      rtlClass: isRtl ? 'rtl' : 'ltr',
      iconMargin: isRtl ? 'ml-1' : 'mr-1',
    };
  }, [isRtl]);

  // Functions that use the memoized values
  const getTextAlignClass = () => rtlHelpers.textAlignClass;
  const getRtlClass = () => rtlHelpers.rtlClass;

  const handleViewDetails = async (submission: SubmissionType) => {
    // Set loading state for this specific submission
    setLoadingSubmissionId(submission.id);

    try {
      // We already have all the details needed, just set the selected submission
      setSelectedSubmission(submission);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching submission details:", error);
    } finally {
      setLoadingSubmissionId(null);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table
          className={`w-full text-sm text-gray-500 dark:text-gray-400 ${getRtlClass()} min-w-[700px]`}
          dir={isRtl ? "rtl" : "ltr"}
        >
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th
                scope="col"
                className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
              >
                {translations.table.title}
              </th>
              <th
                scope="col"
                className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
              >
                {translations.table.author}
              </th>
              <th
                scope="col"
                className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
              >
                {translations.table.event}
              </th>
              <th
                scope="col"
                className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
              >
                {translations.table.submissionDate}
              </th>
              <th
                scope="col"
                className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
              >
                {translations.table.status}
              </th>
              <th
                scope="col"
                className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
              >
                {translations.table.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr
                key={submission.id}
                className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${getRtlClass()}`}
                dir={isRtl ? "rtl" : "ltr"}
              >
                {/* Title column */}
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-3 font-medium text-gray-900 dark:text-white ${getTextAlignClass()}`}
                >
                  <div className="truncate max-w-[250px]">
                    {submission.title || translations.unknownSubmission}
                  </div>
                </td>

                {/* Author column with profile picture */}
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                >
                  <div
                    className={`flex items-center gap-3 ${
                      isRtl ? "flex-row-reverse justify-end" : ""
                    }`}
                  >
                    {isRtl && (
                      <>
                        <span>
                          {submission.researcher_name || translations.unknownResearcher}
                        </span>
                        {submission.researcher_profile_picture_url ? (
                          <Image
                            src={submission.researcher_profile_picture_url}
                            alt={submission.researcher_name || translations.unknownResearcher}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                           <HiUser className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                      </>
                    )}
                    {!isRtl && (
                      <>
                        {submission.researcher_profile_picture_url ? (
                          <Image
                            src={submission.researcher_profile_picture_url}
                            alt={submission.researcher_name || translations.unknownResearcher}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                           <HiUser className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <span>
                          {submission.researcher_name || translations.unknownResearcher}
                        </span>
                      </>
                    )}
                  </div>
                </td>

                {/* Event column */}
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                >
                  <div className="truncate max-w-[200px]">
                    {submission.event_name || translations.unknownEvent}
                  </div>
                </td>

                {/* Submission date column */}
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                >
                  {formatDate(submission.submission_date, locale)}
                </td>

                {/* Status column */}
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                >
                  <div className="flex items-center">
                    {submission.status === "abstract_submitted" && (
                      <div className="flex items-center text-blue-500 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                        <HiInbox className={`${rtlHelpers.iconMargin} h-4 w-4`} />
                        <span>{translations.status.received}</span>
                      </div>
                    )}
                    {(submission.status === "abstract_accepted" || 
                      submission.status === "full_paper_submitted" || 
                      submission.status === "revision_under_review") && (
                      <div className="flex items-center text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                        <HiClipboardCheck className={`${rtlHelpers.iconMargin} h-4 w-4`} />
                        <span>{translations.status.underReview}</span>
                      </div>
                    )}
                    {(submission.status === "full_paper_accepted" || 
                      submission.status === "completed") && (
                      <div className="flex items-center text-green-500 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                        <HiCheckCircle className={`${rtlHelpers.iconMargin} h-4 w-4`} />
                        <span>{translations.status.accepted}</span>
                      </div>
                    )}
                    {(submission.status === "abstract_rejected" || 
                      submission.status === "full_paper_rejected") && (
                      <div className="flex items-center text-red-500 bg-red-100 dark:bg-red-900/20 px-2 py-1 rounded-full">
                        <HiXCircle className={`${rtlHelpers.iconMargin} h-4 w-4`} />
                        <span>{translations.status.rejected}</span>
                      </div>
                    )}
                  </div>
                </td>

                {/* Actions column */}
                <td
                  className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                >
                    <DetailLinkButton
                      href="#"
                      label={translations.actions.viewDetails}
                      onClick={() => handleViewDetails(submission)}
                      disabled={loadingSubmissionId === submission.id}
                    />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <SubmissionDetailModal
          show={showModal}
          onClose={() => setShowModal(false)}
          submission={selectedSubmission}
          translations={translations.modal}
          locale={locale}
        />
      )}
    </>
  );
} 