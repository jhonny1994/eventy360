import { getTranslations } from 'next-intl/server';
import { Card, Alert, Badge } from 'flowbite-react';
import { HiUser, HiCalendar, HiClock, HiDocumentText, HiOfficeBuilding } from 'react-icons/hi';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/admin/auth';
import Image from 'next/image';
import { formatDate } from '@/utils/admin/format';
import { StatusBadge, ApproveRejectActions, DownloadDocumentButton, BackButton } from '@/components/admin/ui';

/**
 * Admin page for viewing verification request details
 * Shows user info, uploaded document, and approval/rejection actions
 */
export default async function VerificationDetailsPage({
  params
}: {
  params: { locale: string; id: string }
}) {
  const { locale, id } = await params;
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

  // Translations for download button
  const downloadTranslations = {
    download: t('details.downloadDocument'),
    downloading: commonT('loading'),
    downloadError: t('details.downloadError'),
    documentNotFound: t('details.documentNotFound')
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
    approveSuccess: t('details.approveSuccess') || 'Verification request approved successfully',
    rejectSuccess: t('details.rejectSuccess') || 'Verification request rejected successfully',
    actionError: t('details.actionError') || 'An error occurred while processing the request',
    reasonRequired: t('details.reasonRequired') || 'Rejection reason is required',
    reasonTooShort: t('details.approveRejectActions.reasonTooShort'),
    approveConfirmation: t('details.approveRejectActions.approveConfirmation'),
    rejectConfirmation: t('details.approveRejectActions.rejectConfirmation'),
    minimumCharactersNote: t('details.approveRejectActions.minimumCharactersNote'),
    internalNotesHint: t('details.approveRejectActions.internalNotesHint')
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t('details.title')}
        </h1>
        <BackButton 
          href={`/${locale}/admin/verifications`}
          label={t('details.back')} 
          color="gray"
        />
      </div>

      {error ? (
        <Alert color="failure">
          <div className="font-medium">
            {t('details.errorLoading')}: {error.message}
          </div>
        </Alert>
      ) : !verificationRequest ? (
        <Alert color="info">
          <div className="font-medium text-center">
            {t('details.requestNotFound')}
          </div>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card (Left Column) */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium mb-4 flex items-center">
                  <HiUser className="mr-2 h-5 w-5 text-gray-500" />
                  {t('details.userInfo')}
                </h3>
                <StatusBadge 
                  status={verificationRequest.status} 
                  translations={statusTranslations} 
                />
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 border border-gray-300 dark:border-gray-600">
                  {verificationRequest.profile_picture_url ? (
                    <Image 
                      src={verificationRequest.profile_picture_url} 
                      alt={verificationRequest.user_name || 'User'} 
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <HiUser className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium">
                    {verificationRequest.user_name || t('details.unknownUser')}
                  </h4>
                  <Badge 
                    color="gray" 
                    className="mt-1"
                  >
                    <div className="flex items-center">
                      <HiOfficeBuilding className="mr-1 h-3 w-3" />
                      {verificationRequest.user_type && t(`userTypes.${verificationRequest.user_type}`)}
                    </div>
                  </Badge>
                </div>
              </div>

              {/* Request Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                  <div className="mr-2 text-gray-500">
                    <HiCalendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('table.submittedAt')}:
                    </p>
                    <p className="font-medium">
                      {formatDate(verificationRequest.submitted_at, locale)}
                    </p>
                  </div>
                </div>
                
                {verificationRequest.processed_at && (
                  <div className="flex items-start">
                    <div className="mr-2 text-gray-500">
                      <HiClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('details.processedAt')}:
                      </p>
                      <p className="font-medium">
                        {formatDate(verificationRequest.processed_at, locale)}
                      </p>
                    </div>
                  </div>
                )}
                
                {verificationRequest.admin_name && (
                  <div className="flex items-start">
                    <div className="mr-2 text-gray-500">
                      <HiUser className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('details.processedBy')}:
                      </p>
                      <p className="font-medium">
                        {verificationRequest.admin_name}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Rejection Reason (if applicable) */}
              {verificationRequest.rejection_reason && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {t('details.rejectionReason')}:
                  </p>
                  <Alert color="failure">
                    <p className="whitespace-pre-line">
                      {verificationRequest.rejection_reason}
                    </p>
                  </Alert>
                </div>
              )}
              
              {/* Admin Notes (if applicable) */}
              {verificationRequest.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {t('details.adminNotes')}:
                  </p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="whitespace-pre-line text-sm">
                      {verificationRequest.notes}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            {/* Document Card */}
            <Card>
              <h3 className="text-xl font-medium mb-4 flex items-center">
                <HiDocumentText className="mr-2 h-5 w-5 text-gray-500" />
                {t('details.documentInfo')}
              </h3>
              
              {verificationRequest.document_path ? (
                <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="mb-4 text-center">
                    <HiDocumentText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {t('details.documentAvailable')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {verificationRequest.document_path.split('/').pop()}
                    </p>
                  </div>
                  
                  <DownloadDocumentButton
                    documentPath={verificationRequest.document_path}
                    translations={downloadTranslations}
                    size="md"
                  />
                </div>
              ) : (
                <Alert color="warning">
                  <p>{t('details.documentNotFound')}</p>
                </Alert>
              )}
            </Card>
          </div>

          {/* Admin Actions Card (Right Column) */}
          <div className="lg:col-span-1">
            {verificationRequest.status === 'pending' ? (
              <Card>
                <h3 className="text-xl font-medium mb-4">
                  {t('details.adminActions')}
                </h3>
                <ApproveRejectActions 
                  requestId={id} 
                  translations={actionTranslations} 
                />
              </Card>
            ) : (
              <Card>
                <h3 className="text-xl font-medium mb-3">
                  {t('details.processingStatus')}
                </h3>
                <div className="flex flex-col space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {t('table.status')}:
                    </p>
                    <StatusBadge
                      status={verificationRequest.status}
                      translations={statusTranslations}
                    />
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {t('details.processedAt')}:
                    </p>
                    <p className="font-medium">
                      {verificationRequest.processed_at ? 
                        formatDate(verificationRequest.processed_at, locale) : 
                        '—'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      {t('details.processedBy')}:
                    </p>
                    <p className="font-medium">
                      {verificationRequest.admin_name || '—'}
                    </p>
                  </div>
                  
                  {verificationRequest.status === 'approved' && (
                    <Alert color="success" className="mt-4">
                      {t('details.verificationApproved')}
                    </Alert>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 