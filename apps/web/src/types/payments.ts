import { Database } from '@/database.types';

export type PaymentStatusType = Database['public']['Enums']['payment_status_enum'];
export type BillingPeriodType = Database['public']['Enums']['billing_period_enum'];
export type PaymentMethodType = Database['public']['Enums']['payment_method_enum'];

export type PaymentDetailsType = {
  id: string;
  user_id: string;
  user_name: string;
  user_type: string;
  profile_picture_url: string | null;
  amount: number;
  billing_period: BillingPeriodType;
  payment_method_reported: PaymentMethodType;
  status: PaymentStatusType;
  reported_at: string;
  verified_at: string | null;
  admin_notes: string | null;
  admin_verifier_id: string | null;
  admin_verifier_name?: string;
  proof_document_path: string | null;
  reference_number: string | null;
  payer_notes: string | null;
  subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PaymentWithUserDetailsType = {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_type: string;
  profile_picture_url: string | null;
  amount: number;
  billing_period: BillingPeriodType;
  payment_method_reported: PaymentMethodType;
  status: PaymentStatusType;
  reported_at: string;
  verified_at: string | null;
  admin_verifier_id: string | null;
  proof_document_path: string | null;
  has_proof_document: boolean;
  reference_number: string | null;
  created_at: string;
};

// Mapping type for StatusBadge to use our payment statuses
export type PaymentStatusTranslations = {
  pending_verification: string;
  verified: string;
  rejected: string;
  unknown: string;
}

// Convert payment status translations to the format expected by StatusBadge
export function mapToStatusBadgeTranslations(translations: PaymentStatusTranslations) {
  return {
    pending: translations.pending_verification,
    approved: translations.verified,
    rejected: translations.rejected,
    unknown: translations.unknown
  };
} 