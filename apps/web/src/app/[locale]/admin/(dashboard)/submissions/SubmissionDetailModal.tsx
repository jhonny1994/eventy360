"use client";

import { Button, Modal, ModalBody, ModalHeader, ModalFooter } from "flowbite-react";
import { HiDownload } from "react-icons/hi";
import { formatDate } from "@/utils/date";
import { Database } from "@/database.types";

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

interface SubmissionDetailModalProps {
  show: boolean;
  onClose: () => void;
  submission: SubmissionType;
  translations: {
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
    statusReceived?: string;
    statusUnderReview?: string;
    statusAccepted?: string;
    statusRejected?: string;
  };
  locale: string;
}

export default function SubmissionDetailModal({
  show,
  onClose,
  submission,
  translations,
  locale,
}: SubmissionDetailModalProps) {
  const isRtl = locale === "ar";

  // Helper to get the appropriate status display
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "abstract_submitted":
        return translations.statusReceived || "Received";
      case "abstract_accepted":
      case "full_paper_submitted":
      case "revision_under_review":
        return translations.statusUnderReview || "Under Review";
      case "full_paper_accepted":
      case "completed":
        return translations.statusAccepted || "Accepted";
      case "abstract_rejected":
      case "full_paper_rejected":
        return translations.statusRejected || "Rejected";
      default:
        return status;
    }
  };

  return (
    <Modal
      show={show}
      onClose={onClose}
      size="3xl"
      dismissible
      position="center"
    >
      <ModalHeader className="border-b">
        <div className="flex w-full justify-between items-center">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {translations.submissionDetails}
          </h3>
        </div>
      </ModalHeader>
      <ModalBody className="space-y-6 overflow-y-auto max-h-[60vh]">
        <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
            {translations.submissionInfo}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">{translations.title}</div>
              <p className="text-gray-900 dark:text-white">{submission.title}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">{translations.researcher}</div>
              <p className="text-gray-900 dark:text-white">{submission.researcher_name}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">{translations.event}</div>
              <p className="text-gray-900 dark:text-white">{submission.event_name}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">{translations.submissionDate}</div>
              <p className="text-gray-900 dark:text-white">{formatDate(submission.submission_date, locale)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">{translations.status}</div>
              <p className="text-gray-900 dark:text-white">{getStatusDisplay(submission.status)}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">{translations.version}</div>
              <p className="text-gray-900 dark:text-white">v{submission.current_version}</p>
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">{translations.abstract}</div>
              <p className="whitespace-pre-wrap text-gray-900 dark:text-white">{submission.abstract || translations.noFeedback}</p>
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">{translations.keywords}</div>
              <p className="text-gray-900 dark:text-white">{submission.keywords?.join(', ') || translations.noKeywords}</p>
            </div>
            
            <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="font-semibold mb-1 text-gray-700 dark:text-gray-300">{translations.reviewFeedback}</div>
              <p className="whitespace-pre-wrap text-gray-900 dark:text-white">{submission.feedback || translations.noFeedback}</p>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        {submission.file_url && (
          <a href={submission.file_url} target="_blank" rel="noopener noreferrer" className={`${isRtl ? 'ml-auto' : 'mr-auto'}`}>
            <Button color="blue">
              <HiDownload className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5`} />
              {translations.downloadFile}
            </Button>
          </a>
        )}
        <Button color="gray" onClick={onClose}>
          {translations.close}
        </Button>
      </ModalFooter>
    </Modal>
  );
} 