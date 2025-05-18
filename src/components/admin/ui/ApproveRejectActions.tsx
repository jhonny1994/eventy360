'use client';

import { useState } from 'react';
import { Button, Modal, Textarea, Label, Spinner } from 'flowbite-react';
import { HiCheck, HiX } from 'react-icons/hi';
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
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
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
      router.refresh();
    } catch (err) {
      console.error('Error approving request:', err);
      toast.error(translations.actionError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error(translations.reasonRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
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
          onClick={handleApprove}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <HiCheck className="mr-1 h-4 w-4" />
          )}
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

      {/* Reject Modal */}
      <Modal show={isRejectModalOpen} onClose={() => !isSubmitting && setIsRejectModalOpen(false)}>
        <div className="p-4 border-b rounded-t">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {translations.reject}
          </h3>
        </div>
        <div className="p-6 space-y-6">
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