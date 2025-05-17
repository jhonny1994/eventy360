import { getTranslations } from 'next-intl/server';
import { Card, Button, Badge } from 'flowbite-react';
import { HiCheck, HiX, HiEye } from 'react-icons/hi';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import Link from 'next/link';

enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export default async function AdminVerificationsPage({
  params
}: {
  params: { locale: string }
}) {
  const { locale } = params;
  const t = await getTranslations('AdminVerifications');
  
  // Initialize Supabase client
  const supabase = await createServerSupabaseClient();
  
  // Fetch verification requests, pending first
  const { data: verificationRequests, error } = await supabase
    .from('verification_request_details')
    .select('*')
    .order('status', { ascending: false }) // This puts 'pending' first (alphabetically after 'approved'/'rejected')
    .order('submitted_at', { ascending: false });

  // Get count of pending requests
  const { count: pendingCount } = await supabase
    .from('verification_request_details')
    .select('*', { count: 'exact', head: true })
    .eq('status', VerificationStatus.PENDING);

  // Helper function for status badges
  const getStatusBadge = (status: string | null) => {
    switch(status) {
      case VerificationStatus.PENDING:
        return <Badge color="warning">{t('status.pending')}</Badge>;
      case VerificationStatus.APPROVED:
        return <Badge color="success">{t('status.approved')}</Badge>;
      case VerificationStatus.REJECTED:
        return <Badge color="failure">{t('status.rejected')}</Badge>;
      default:
        return <Badge color="info">{status || 'Unknown'}</Badge>;
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('title')}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {t('pendingRequestsCount', { count: pendingCount || 0 })}
        </p>
      </div>

      <Card>
        {error ? (
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
            {t('fetchError')} {error.message}
          </div>
        ) : !verificationRequests || verificationRequests.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {t('noRequests')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">{t('table.user')}</th>
                  <th scope="col" className="px-4 py-3">{t('table.userType')}</th>
                  <th scope="col" className="px-4 py-3">{t('table.submittedAt')}</th>
                  <th scope="col" className="px-4 py-3">{t('table.status')}</th>
                  <th scope="col" className="px-4 py-3">{t('table.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {verificationRequests.map((request) => (
                  <tr key={request.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        {request.profile_picture_url && (
                          <img 
                            src={request.profile_picture_url} 
                            alt={request.user_name || 'User'} 
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        {request.user_name || 'Unknown User'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {request.user_type && t(`userTypes.${request.user_type}`)}
                    </td>
                    <td className="px-4 py-3">
                      {formatDate(request.submitted_at)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/${locale}/admin/verifications/${request.id}`} passHref>
                          <Button size="xs" color="info">
                            <HiEye className="mr-1 h-4 w-4" />
                            {t('actions.view')}
                          </Button>
                        </Link>
                        
                        {request.status === VerificationStatus.PENDING && (
                          <>
                            <Button size="xs" color="success">
                              <HiCheck className="mr-1 h-4 w-4" />
                              {t('actions.approve')}
                            </Button>
                            <Button size="xs" color="failure">
                              <HiX className="mr-1 h-4 w-4" />
                              {t('actions.reject')}
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 