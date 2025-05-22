import { getTranslations } from 'next-intl/server';
import { Card, Alert, Badge } from 'flowbite-react';
import { HiUser, HiCalendar, HiClock, HiDocumentText, HiCurrencyDollar, HiCreditCard, HiExclamationCircle } from 'react-icons/hi';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { requireAdmin } from '@/utils/admin/auth';
import Image from 'next/image';
import { formatDate } from '@/utils/admin/format';
import { StatusBadge, ApproveRejectActions, DocumentPreview, DownloadDocumentButton, BackButton } from '@/components/admin/ui';
import { PaymentDetailsType, PaymentStatusTranslations, mapToStatusBadgeTranslations } from '@/types/payments';
import { callRpcFunction } from '@/lib/hooks/useRpcFunction';

/**
 * Admin page for viewing and verifying payment details
 * Shows user info, payment details, uploaded proof document, and approval/rejection actions
 * Enhanced with improved RTL support
 */
export default async function PaymentDetailsPage({
  params
}: {
  params: { locale: string; id: string }
}) {
  const { locale, id } = await params;
  const isRtl = locale === 'ar';
  const t = await getTranslations('AdminPayments');
  const commonT = await getTranslations('Common');

  // Ensure user is admin
  await requireAdmin(locale);
  
  // Initialize Supabase client
  const supabase = await createServerSupabaseClient();
  
  // Fetch payment details with user information
  const { data, error } = await callRpcFunction<PaymentDetailsType>(
    supabase,
    'get_payment_details',
    { payment_id: id }
  );

  // Get the payment details from response
  const payment = data;

  // Prepare status translations for the StatusBadge component
  const statusTranslations: PaymentStatusTranslations = {
    pending_verification: t('status.pendingVerification'),
    verified: t('status.verified'),
    rejected: t('status.rejected'),
    unknown: 'Unknown'
  };

  // Map our status translations to the format expected by StatusBadge
  const statusBadgeTranslations = mapToStatusBadgeTranslations(statusTranslations);

  // Translations for document preview
  const documentPreviewTranslations = {
    loading: commonT('loading'),
    notFound: t('details.documentNotFound'),
    openInNewTab: t('details.openInNewTab'),
    documentPathMissing: t('details.documentPathMissing'),
    invalidDocumentPath: t('details.invalidDocumentPath'),
    invalidDocumentStructure: t('details.invalidDocumentStructure'),
    failedToGenerateUrl: t('details.failedToGenerateUrl'),
    unknownError: t('details.unknownError'),
    paymentProof: t('details.paymentProof'),
    refreshDocument: t('details.refreshDocument')
  };

  // Translations for download button
  const downloadTranslations = {
    download: t('details.downloadDocument'),
    downloading: commonT('loading'),
    downloadError: t('details.downloadError'),
    documentNotFound: t('details.documentNotFound'),
    retry: t('details.retry') || 'Retry'
  };

  // Prepare translations for approve/reject actions
  const actionTranslations = {
    approve: t('details.approvePayment'),
    reject: t('details.rejectPayment'),
    rejectReason: t('details.rejectReason'),
    rejectReasonPlaceholder: t('details.rejectReasonPlaceholder'),
    adminNotes: t('details.adminNotes'),
    adminNotesPlaceholder: t('details.adminNotesPlaceholder'),
    submit: t('details.submit'),
    cancel: t('details.cancel'),
    approveSuccess: t('details.approveSuccess') || 'Payment approved successfully',
    rejectSuccess: t('details.rejectSuccess') || 'Payment rejected successfully',
    actionError: t('details.actionError') || 'An error occurred while processing the request',
    reasonRequired: t('details.reasonRequired') || 'Rejection reason is required',
    reasonTooShort: t('details.approveRejectActions.reasonTooShort'),
    approveConfirmation: t('details.approveRejectActions.approveConfirmation'),
    rejectConfirmation: t('details.approveRejectActions.rejectConfirmation'),
    minimumCharactersNote: t('details.approveRejectActions.minimumCharactersNote'),
    internalNotesHint: t('details.approveRejectActions.internalNotesHint')
  };

  return (
    <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t('details.title')}
        </h1>
        <BackButton 
          href={`/${locale}/admin/payments`}
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
      ) : !payment ? (
        <Alert color="info">
          <div className="font-medium text-center">
            {t('details.paymentNotFound')}
          </div>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: User Info and Payment Details */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium mb-4 flex items-center">
                  <HiUser className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 text-gray-500`} />
                  {t('details.userInfo')}
                </h3>
                <StatusBadge 
                  status={payment.status} 
                  translations={statusBadgeTranslations} 
                  locale={locale}
                />
              </div>
              
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0 border border-gray-300 dark:border-gray-600">
                  {payment.profile_picture_url ? (
                    <Image 
                      src={payment.profile_picture_url} 
                      alt={payment.user_name || 'User'} 
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
                <div className={`${isRtl ? 'mr-4' : 'ml-4'}`}>
                  <h4 className="text-lg font-medium">
                    {payment.user_name || t('details.unknownUser')}
                  </h4>
                  <Badge 
                    color="gray" 
                    className="mt-1"
                  >
                    <div className="flex items-center">
                      <HiUser className={`${isRtl ? 'ml-1' : 'mr-1'} h-3 w-3`} />
                      {payment.user_type && t(`userTypes.${payment.user_type}`)}
                    </div>
                  </Badge>
                </div>
              </div>

              {/* Payment Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-start">
                  <div className={`${isRtl ? 'ml-2' : 'mr-2'} text-gray-500`}>
                    <HiCurrencyDollar className="h-5 w-5" />
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('details.amount')}:
                    </p>
                    <p className="font-medium">
                      {payment.amount} {t('currency')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`${isRtl ? 'ml-2' : 'mr-2'} text-gray-500`}>
                    <HiCreditCard className="h-5 w-5" />
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('details.paymentMethod')}:
                    </p>
                    <p className="font-medium">
                      {t(`paymentMethods.${payment.payment_method_reported}`)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`${isRtl ? 'ml-2' : 'mr-2'} text-gray-500`}>
                    <HiCalendar className="h-5 w-5" />
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('details.billingPeriod')}:
                    </p>
                    <p className="font-medium">
                      {t(`billingPeriods.${payment.billing_period}`)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className={`${isRtl ? 'ml-2' : 'mr-2'} text-gray-500`}>
                    <HiClock className="h-5 w-5" />
                  </div>
                  <div className={isRtl ? 'text-right' : 'text-left'}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('details.reportedAt')}:
                    </p>
                    <p className="font-medium">
                      {formatDate(payment.reported_at, locale)}
                    </p>
                  </div>
                </div>
                
                {payment.verified_at && (
                  <div className="flex items-start">
                    <div className={`${isRtl ? 'ml-2' : 'mr-2'} text-gray-500`}>
                      <HiClock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('details.verifiedAt')}:
                      </p>
                      <p className="font-medium">
                        {formatDate(payment.verified_at, locale)}
                      </p>
                    </div>
                  </div>
                )}
                
                {payment.admin_verifier_name && (
                  <div className="flex items-start">
                    <div className={`${isRtl ? 'ml-2' : 'mr-2'} text-gray-500`}>
                      <HiUser className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('details.verifiedBy')}:
                      </p>
                      <p className="font-medium">
                        {payment.admin_verifier_name}
                      </p>
                    </div>
                  </div>
                )}
                
                {payment.reference_number && (
                  <div className="flex items-start">
                    <div className={`${isRtl ? 'ml-2' : 'mr-2'} text-gray-500`}>
                      <HiDocumentText className="h-5 w-5" />
                    </div>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('details.referenceNumber')}:
                      </p>
                      <p className="font-medium">
                        {payment.reference_number}
                      </p>
                    </div>
                  </div>
                )}
                
                {payment.payer_notes && (
                  <div className="flex items-start md:col-span-2">
                    <div className={`${isRtl ? 'ml-2' : 'mr-2'} text-gray-500`}>
                      <HiDocumentText className="h-5 w-5" />
                    </div>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('details.notes')}:
                      </p>
                      <p className="font-medium">
                        {payment.payer_notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Rejection Reason (if applicable) */}
              {payment.status === 'rejected' && payment.admin_notes && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start">
                    <div className={`${isRtl ? 'ml-2' : 'mr-2'} text-red-500`}>
                      <HiExclamationCircle className="h-5 w-5" />
                    </div>
                    <div className={isRtl ? 'text-right' : 'text-left'}>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {t('details.rejectionReason')}:
                      </p>
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-900">
                        <p className="whitespace-pre-line text-sm text-red-700 dark:text-red-300">
                          {payment.admin_notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Admin Notes (if applicable and not a rejection reason) */}
              {payment.status !== 'rejected' && payment.admin_notes && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {t('details.adminNotes')}:
                  </p>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <p className="whitespace-pre-line text-sm">
                      {payment.admin_notes}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              {payment.status === 'pending_verification' && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-md font-medium mb-4">
                    {t('details.actions')}:
                  </h4>
                  <ApproveRejectActions 
                    requestId={id} 
                    translations={actionTranslations} 
                    apiEndpoint="verify_payment"
                    locale={locale}
                  />
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Payment Proof Document */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <h3 className="text-xl font-medium mb-4 flex items-center">
                <HiDocumentText className={`${isRtl ? 'ml-2' : 'mr-2'} h-5 w-5 text-gray-500`} />
                {t('details.paymentProof')}
              </h3>
              
              {payment.proof_document_path ? (
                <div className="flex flex-col">
                  <DocumentPreview
                    documentPath={payment.proof_document_path}
                    translations={documentPreviewTranslations}
                    locale={locale}
                  />
                  
                  <div className="mt-4 flex justify-center">
                    <DownloadDocumentButton
                      documentPath={payment.proof_document_path}
                      translations={downloadTranslations}
                      size="md"
                      locale={locale}
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <HiDocumentText className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                  {t('details.noDocumentUploaded')}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 