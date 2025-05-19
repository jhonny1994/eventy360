/**
 * Types related to verification system
 */

/**
 * Verification request status enum
 */
export enum VerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

/**
 * Base verification request interface
 */
export interface VerificationRequest {
  id: string;
  user_id: string;
  document_path: string;
  status: VerificationStatus;
  submitted_at: string;
  processed_at: string | null;
  processed_by: string | null;
  rejection_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Detailed verification request interface with user profile information
 */
export interface VerificationRequestDetail extends VerificationRequest {
  is_verified: boolean;
  user_name: string | null;
  user_type: "researcher" | "organizer" | "admin" | null;
  profile_picture_url: string | null;
  admin_name: string | null;
}

/**
 * Props for status badge component
 */
export interface StatusBadgeProps {
  status: string | null;
  translations: {
    pending: string;
    approved: string;
    rejected: string;
    unknown: string;
  };
}

/**
 * Props for document preview component
 */
export interface DocumentPreviewProps {
  documentPath: string;
  translations: {
    loading: string;
    notFound: string;
    openInNewTab?: string;
  };
}

/**
 * Props for approve/reject actions component
 */
export interface ApproveRejectActionsProps {
  requestId: string;
  translations: {
    approve: string;
    reject: string;
    rejectReason: string;
    rejectReasonPlaceholder: string;
    adminNotes: string;
    adminNotesPlaceholder: string;
    submit: string;
    cancel: string;
    approveSuccess: string;
    rejectSuccess: string;
    actionError: string;
    reasonRequired: string;
  };
}

/**
 * Props for verification document uploader component
 */
export interface VerificationDocumentUploaderProps {
  isVerified: boolean;
  hasPendingRequest: boolean;
  onUploadSuccess?: () => void;
}

/**
 * Props for verification section component
 */
export interface VerificationSectionProps {
  isVerified: boolean;
  translations: {
    verified: string;
    notVerified: string;
    verifiedLabel: string;
    verificationDescription: {
      verified: string;
      notVerified: string;
    };
    requestVerification: string;
  };
  userId: string;
  locale?: string;
  onStatusChange?: () => void;
} 