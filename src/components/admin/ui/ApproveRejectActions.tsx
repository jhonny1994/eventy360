'use client';

import { useState } from 'react';
import { Button, Modal, Textarea, Label, Spinner, Alert } from 'flowbite-react';
import { HiCheck, HiX, HiExclamationCircle } from 'react-icons/hi';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useLocale } from 'next-intl';

type ApproveRejectActionsProps = {
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
    reasonTooShort?: string;
    approveConfirmation?: string;
    rejectConfirmation?: string;
    minimumCharactersNote?: string;
    internalNotesHint?: string;
  };
  apiEndpoint?: string; // Optional API endpoint to use (defaults to verification_requests)
  locale?: string; // Kept for backward compatibility
  userId?: string; // Optional user ID for cache clearing
};

/**
 * Component for approving or rejecting verification requests or payment proofs
 * Includes a modal for entering rejection reasons
 * Supports RTL languages with proper icon positioning
 * Uses the application's locale context for consistent RTL behavior
 * 
 * @param props - Component props
 * @returns Action buttons and rejection modal
 */
export default function ApproveRejectActions({
  requestId,
  translations,
  apiEndpoint,
  userId
}: ApproveRejectActionsProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const router = useRouter();
  // Get locale from application context
  const appLocale = useLocale();
  
  // Determine if we're using RTL
  const isRtl = appLocale === 'ar';
  
  // Get appropriate margin class based on RTL or LTR
  const getIconMarginClass = () => {
    if (isRtl) {
      return 'ml-1'; // For RTL languages, margin on left
    }
    return 'mr-1'; // For LTR languages, margin on right
  };

  // Create Supabase client at component level
  const supabase = createClient();

  // Function to clear subscription cache for the affected user
  const clearUserSubscriptionCache = async () => {
    if (!userId) {
      return;
    }

    // Clear the subscription cache for the user via LocalStorage
    if (typeof window !== 'undefined') {
      const cacheKey = `eventy360_subscription_${userId}`;
      try {
        localStorage.removeItem(cacheKey);
      } catch  {
      }
    }

    // If we wanted to be more thorough, we could also call an API endpoint
    // that would clear the cache for all devices the user might be logged into
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Handle different API endpoints
      if (apiEndpoint === 'verify_payment') {
        // Use the RPC function for payment verification
        const { error } = await supabase
          .rpc('verify_payment', {
            payment_id: requestId,
            verify_status: 'verified',
            p_admin_notes: adminNotes || undefined
          });

        if (error) throw error;
        
        // Clear subscription cache for the user after successful verification
        await clearUserSubscriptionCache();
      } else {
        // Default behavior for verification requests
        const { error } = await supabase
          .from('verification_requests')
          .update({
            status: 'approved',
            notes: adminNotes || null,
            processed_at: new Date().toISOString(),
          })
          .eq('id', requestId);

        if (error) throw error;
      }

      toast.success(translations.approveSuccess);
      setIsApproveModalOpen(false);
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : translations.actionError;
      setErrorMessage(errorMessage);
      toast.error(translations.actionError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    // Validate rejection reason
    if (!rejectionReason.trim()) {
      toast.error(translations.reasonRequired);
      return;
    }
    
    // Check minimum reason length
    if (rejectionReason.trim().length < 10) {
      toast.error(translations.reasonTooShort || "Rejection reason is too short. Please provide more details.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Handle different API endpoints
      if (apiEndpoint === 'verify_payment') {
        // Use the RPC function for payment verification
        const { error } = await supabase
          .rpc('verify_payment', {
            payment_id: requestId,
            verify_status: 'rejected',
            p_admin_notes: adminNotes || undefined,
            rejection_reason: rejectionReason
          });

        if (error) throw error;
        
        // Clear subscription cache for the user after rejection
        await clearUserSubscriptionCache();
      } else {
        // Default behavior for verification requests
        const { error } = await supabase
          .from('verification_requests')
          .update({
            status: 'rejected',
            rejection_reason: rejectionReason,
            notes: adminNotes || null,
            processed_at: new Date().toISOString(),
          })
          .eq('id', requestId);

        if (error) throw error;
      }

      toast.success(translations.rejectSuccess);
      setIsRejectModalOpen(false);
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : translations.actionError;
      setErrorMessage(errorMessage);
      toast.error(translations.actionError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`flex gap-2`} dir={isRtl ? 'rtl' : 'ltr'}>
        <Button
          color="success"
          onClick={() => setIsApproveModalOpen(true)}
          disabled={isSubmitting}
        >
          <HiCheck className={getIconMarginClass()} />
          {translations.approve}
        </Button>
        <Button
          color="failure"
          onClick={() => setIsRejectModalOpen(true)}
          disabled={isSubmitting}
        >
          <HiX className={getIconMarginClass()} />
          {translations.reject}
        </Button>
      </div>

      {/* Approve Confirmation Modal */}
      <Modal show={isApproveModalOpen} onClose={() => !isSubmitting && setIsApproveModalOpen(false)}>
        <div className="p-4 border-b rounded-t">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white" dir={isRtl ? 'rtl' : 'ltr'}>
            {translations.approve}
          </h3>
        </div>
        <div className="p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
          <p className="text-base text-gray-700 dark:text-gray-300">
            {translations.approveConfirmation || "Are you sure you want to approve this request? This action cannot be undone."}
          </p>
          
          {errorMessage && (
            <Alert color="failure" icon={HiExclamationCircle}>
              {errorMessage}
            </Alert>
          )}
          
          <div>
            <Label htmlFor="admin-notes-approve">{translations.adminNotes}</Label>
            <Textarea
              id="admin-notes-approve"
              placeholder={translations.adminNotesPlaceholder}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              dir={isRtl ? 'rtl' : 'ltr'}
              className={isRtl ? 'text-right' : 'text-left'}
            />
            {translations.internalNotesHint && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {translations.internalNotesHint}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end p-4 border-t rounded-b space-x-2" dir={isRtl ? 'rtl' : 'ltr'}>
          <Button
            color="gray"
            onClick={() => setIsApproveModalOpen(false)}
            disabled={isSubmitting}
          >
            {translations.cancel}
          </Button>
          <Button
            color="success"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
              <Spinner size="sm" className={getIconMarginClass()} />
                {translations.submit}
              </>
            ) : (
              <>
                <HiCheck className={getIconMarginClass()} />
                {translations.submit}
              </>
            )}
          </Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal show={isRejectModalOpen} onClose={() => !isSubmitting && setIsRejectModalOpen(false)}>
        <div className="p-4 border-b rounded-t">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white" dir={isRtl ? 'rtl' : 'ltr'}>
            {translations.reject}
          </h3>
        </div>
        <div className="p-6 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
          <p className="text-base text-gray-700 dark:text-gray-300">
            {translations.rejectConfirmation || "Are you sure you want to reject this request? This action cannot be undone."}
          </p>
          
          {errorMessage && (
            <Alert color="failure" icon={HiExclamationCircle}>
              {errorMessage}
            </Alert>
          )}
          
            <div>
            <Label htmlFor="rejection-reason" className="block mb-2">
              {translations.rejectReason}
              {translations.minimumCharactersNote && (
                <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  {translations.minimumCharactersNote}
                </span>
              )}
            </Label>
              <Textarea
                id="rejection-reason"
              placeholder={translations.rejectReasonPlaceholder}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                required
              dir={isRtl ? 'rtl' : 'ltr'}
              className={isRtl ? 'text-right' : 'text-left'}
              />
            </div>
          
            <div>
              <Label htmlFor="admin-notes">{translations.adminNotes}</Label>
              <Textarea
                id="admin-notes"
              placeholder={translations.adminNotesPlaceholder}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              dir={isRtl ? 'rtl' : 'ltr'}
              className={isRtl ? 'text-right' : 'text-left'}
            />
            {translations.internalNotesHint && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {translations.internalNotesHint}
              </p>
            )}
          </div>
        </div>
        <div className="flex justify-end p-4 border-t rounded-b space-x-2" dir={isRtl ? 'rtl' : 'ltr'}>
          <Button
            color="gray"
            onClick={() => setIsRejectModalOpen(false)}
            disabled={isSubmitting}
          >
            {translations.cancel}
          </Button>
          <Button
            color="failure"
            onClick={handleReject}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" className={getIconMarginClass()} />
                {translations.submit}
              </>
            ) : (
              <>
                <HiX className={getIconMarginClass()} />
                {translations.submit}
              </>
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
} 