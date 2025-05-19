'use client';

import { useState } from 'react';
import { Button, Modal, Textarea, Label, Spinner, Alert } from 'flowbite-react';
import { HiCheck, HiX, HiExclamationCircle } from 'react-icons/hi';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

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
};

/**
 * Component for approving or rejecting verification requests
 * Includes a modal for entering rejection reasons
 * 
 * @param props - Component props
 * @returns Action buttons and rejection modal
 */
export default function ApproveRejectActions({
  requestId,
  translations,
}: ApproveRejectActionsProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const router = useRouter();

  // Create Supabase client at component level
  const supabase = createClient();

  const handleApprove = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    
    try {
      // Use the component-level supabase client instead of creating new one
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          notes: adminNotes || null,
          processed_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success(translations.approveSuccess);
      setIsApproveModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Error approving request:', err);
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

      toast.success(translations.rejectSuccess);
      setIsRejectModalOpen(false);
      router.refresh();
    } catch (err) {
      console.error('Error rejecting request:', err);
      const errorMessage = err instanceof Error ? err.message : translations.actionError;
      setErrorMessage(errorMessage);
      toast.error(translations.actionError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          color="success"
          onClick={() => setIsApproveModalOpen(true)}
          disabled={isSubmitting}
        >
          <HiCheck className="mr-1 h-4 w-4" />
          {translations.approve}
        </Button>
        <Button
          color="failure"
          onClick={() => setIsRejectModalOpen(true)}
          disabled={isSubmitting}
        >
          <HiX className="mr-1 h-4 w-4" />
          {translations.reject}
        </Button>
      </div>

      {/* Approve Confirmation Modal */}
      <Modal show={isApproveModalOpen} onClose={() => !isSubmitting && setIsApproveModalOpen(false)}>
        <div className="p-4 border-b rounded-t">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {translations.approve}
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-base text-gray-700 dark:text-gray-300">
            {translations.approveConfirmation || "Are you sure you want to approve this verification request? This will mark the user account as verified."}
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
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={translations.adminNotesPlaceholder}
              rows={3}
            />
          </div>
        </div>
        <div className="flex items-center justify-end p-4 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
          <Button
            color="success"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Spinner size="sm" className="mr-2" />
            )}
            {translations.approve}
          </Button>
          <Button
            color="gray"
            onClick={() => !isSubmitting && setIsApproveModalOpen(false)}
            disabled={isSubmitting}
          >
            {translations.cancel}
          </Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal show={isRejectModalOpen} onClose={() => !isSubmitting && setIsRejectModalOpen(false)}>
        <div className="p-4 border-b rounded-t">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {translations.reject}
          </h3>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-base text-gray-700 dark:text-gray-300">
            {translations.rejectConfirmation || "Please provide a reason for rejecting this verification request. The reason will be visible to the user."}
          </p>
          
          {errorMessage && (
            <Alert color="failure" icon={HiExclamationCircle}>
              {errorMessage}
            </Alert>
          )}
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">{translations.rejectReason} *</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={translations.rejectReasonPlaceholder}
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{translations.minimumCharactersNote || "Minimum 10 characters. Be specific about why the request is being rejected."}</p>
            </div>
            <div>
              <Label htmlFor="admin-notes">{translations.adminNotes}</Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={translations.adminNotesPlaceholder}
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">{translations.internalNotesHint || "These notes are for internal use only and will not be shared with the user."}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end p-4 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
          <Button
            color="failure"
            onClick={handleReject}
            disabled={isSubmitting || !rejectionReason.trim()}
          >
            {isSubmitting && (
              <Spinner size="sm" className="mr-2" />
            )}
            {translations.submit}
          </Button>
          <Button
            color="gray"
            onClick={() => !isSubmitting && setIsRejectModalOpen(false)}
            disabled={isSubmitting}
          >
            {translations.cancel}
          </Button>
        </div>
      </Modal>
    </>
  );
} 