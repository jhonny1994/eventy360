import { getTranslations } from 'next-intl/server';
import { Card, Button } from 'flowbite-react';
import { HiArrowLeft } from 'react-icons/hi';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/admin/auth';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate } from '@/utils/admin/format';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import DocumentPreview from '@/components/admin/ui/DocumentPreview';
import ApproveRejectActions from '@/components/admin/ui/ApproveRejectActions';

/**
 * Admin page for viewing verification request details
 * Shows user info, uploaded document, and approval/rejection actions
 */
export default async function VerificationDetailsPage({
  params
}: {
  params: { locale: string; id: string }
}) {
  const { locale, id } = params;
  const t = await getTranslations('AdminVerifications');
  const commonT = await getTranslations('Common');

  // Ensure user is admin
  await requireAdmin(locale);
  
  // Initialize Supabase client
  const supabase = await createServerSupabaseClient();
  
  // Fetch verification request details
  const { data: verificationRequest, error } = await supabase
    .from('verification_request_details')
    .select('*')
    .eq('id', id)
    .single();

  // Prepare status translations for the StatusBadge component
  const statusTranslations = {
    pending: t('status.pending'),
    approved: t('status.approved'),
    rejected: t('status.rejected'),
    unknown: 'Unknown'
  };

  // Prepare translations for document preview
  const documentTranslations = {
    loading: commonT('loading'),
    notFound: t('details.documentNotFound'),
    openInNewTab: 'Open document in new tab'
  };

  // Prepare translations for approve/reject actions
  const actionTranslations = {
    approve: t('details.approveRequest'),
    reject: t('details.rejectRequest'),
    rejectReason: t('details.rejectReason'),
    rejectReasonPlaceholder: t('details.rejectReasonPlaceholder'),
    adminNotes: t('details.adminNotes'),
    adminNotesPlaceholder: t('details.adminNotesPlaceholder'),
    submit: t('details.submit'),
    cancel: t('details.cancel'),
    approveSuccess: 'Verification request approved successfully',
    rejectSuccess: 'Verification request rejected successfully',
    actionError: 'An error occurred while processing the request',
    reasonRequired: 'Rejection reason is required'
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t('details.title')}
        </h1>
        <Link href={`/${locale}/admin/verifications`}>
          <Button color="gray" size="sm">
            <HiArrowLeft className="mr-1 h-4 w-4" />
            {t('details.back')}
          </Button>
        </Link>
      </div>

      {error ? (
        <Card>
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
            Error loading verification request: {error.message}
          </div>
        </Card>
      ) : !verificationRequest ? (
        <Card>
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Verification request not found.
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <h3 className="text-lg font-medium mb-3">{t('details.userInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                {verificationRequest.profile_picture_url ? (
                  <Image 
                    src={verificationRequest.profile_picture_url} 
                    alt={verificationRequest.user_name || 'User'} 
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full mr-3 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full mr-3 bg-gray-200 dark:bg-gray-700"></div>
                )}
                <div>
                  <h4 className="font-medium">{verificationRequest.user_name || 'Unknown User'}</h4>
                  <p className="text-sm text-gray-500">
                    {verificationRequest.user_type && t(`userTypes.${verificationRequest.user_type}`)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status:</p>
                <StatusBadge status={verificationRequest.status} translations={statusTranslations} />
              </div>
            </div>

            {/* Additional request information */}
            <div className="mt-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                <div>
                  <p className="text-sm text-gray-500">{t('table.submittedAt')}:</p>
                  <p className="font-medium">{formatDate(verificationRequest.submitted_at, locale)}</p>
                </div>
                
                {verificationRequest.processed_at && (
                  <div>
                    <p className="text-sm text-gray-500">{t('details.processedAt')}:</p>
                    <p className="font-medium">{formatDate(verificationRequest.processed_at, locale)}</p>
                  </div>
                )}
                
                {verificationRequest.admin_name && (
                  <div>
                    <p className="text-sm text-gray-500">{t('details.processedBy')}:</p>
                    <p className="font-medium">{verificationRequest.admin_name}</p>
                  </div>
                )}
                
                {verificationRequest.rejection_reason && (
                  <div>
                    <p className="text-sm text-gray-500">{t('details.rejectionReason')}:</p>
                    <p className="font-medium text-red-600">{verificationRequest.rejection_reason}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
            
          {/* Document Preview */}
          <Card>
            <h3 className="text-lg font-medium mb-3">{t('details.documentInfo')}</h3>
            {verificationRequest.document_path && (
              <DocumentPreview 
                documentPath={verificationRequest.document_path} 
                translations={documentTranslations} 
              />
            )}
          </Card>
            
          {/* Admin Actions - Only show if status is pending */}
          {verificationRequest.status === 'pending' && (
            <Card>
              <h3 className="text-lg font-medium mb-3">{t('details.adminActions')}</h3>
              <ApproveRejectActions 
                requestId={id} 
                translations={actionTranslations} 
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
} 