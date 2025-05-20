import { getTranslations } from "next-intl/server";
import { Card, Button } from "flowbite-react";
import { HiEye, HiSearch } from "react-icons/hi";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/utils/admin/auth";
import { formatDate } from "@/utils/admin/format";
import Link from "next/link";
import Image from "next/image";
import { StatusBadge, PaginationClient } from "@/components/admin/ui";
import StatusFilter from './StatusFilter';
import { PaymentWithUserDetailsType, PaymentStatusType, mapToStatusBadgeTranslations } from "@/types/payments";
import { callRpcFunction } from "@/lib/hooks/useRpcFunction";

enum PaymentStatus {
  PENDING_VERIFICATION = "pending_verification",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

type PaymentListProps = {
  searchParams: {
    status?: string;
    search?: string;
    page?: string;
    page_size?: string;
  };
  params: { locale: string };
};

// Default values for pagination
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

/**
 * Admin payment verification page
 * Shows all payment reports with status and actions
 * Supports filtering by status, searching by user name, and pagination
 */
export default async function AdminPendingPaymentsPage({
  params,
  searchParams = {},
}: PaymentListProps) {
  const { locale } = await params;
  const searchParamsData = await searchParams;
  const { status, search, page: pageParam, page_size: pageSizeParam } = searchParamsData;
  const t = await getTranslations("AdminPayments");

  // Parse pagination parameters with defaults
  const page = pageParam ? parseInt(pageParam, 10) : DEFAULT_PAGE;
  const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : DEFAULT_PAGE_SIZE;
  
  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;

  // Ensure user is admin
  await requireAdmin(locale);

  // Initialize Supabase client
  const supabase = await createServerSupabaseClient();

  // Get payments with user details - we'll handle filtering in JS since the RPC doesn't accept parameters
  const { data: allPayments, error: rpcError } = await callRpcFunction<PaymentWithUserDetailsType[]>(
    supabase,
    'get_payments_with_user_details'
  );
  
  // Build queries for pagination
  let countQuery = supabase.from('payments').select('*', { count: 'exact', head: true });
  
  // Apply status filter to count query
  if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
    countQuery = countQuery.eq('status', status as PaymentStatusType);
  } else {
    // Default to pending_verification if no status filter
    countQuery = countQuery.eq('status', PaymentStatus.PENDING_VERIFICATION as PaymentStatusType);
  }

  // Apply search filter if provided
  if (search) {
    // For count query, we need a different approach to search in profiles
    const { data: matchingUserIds } = await supabase
      .from('profiles')
      .select('id')
      .or(`email.ilike.%${search}%`);
    
    if (matchingUserIds && matchingUserIds.length > 0) {
      const userIds = matchingUserIds.map(user => user.id);
      countQuery = countQuery.in('user_id', userIds);
    } else {
      // No matching users, so count will be 0
      countQuery = countQuery.eq('id', 'no-matches');
    }
  }

  // Execute count query
  const { count: totalPayments, error: countError } = await countQuery;

  // Filter and paginate the payments in JS
  let payments: PaymentWithUserDetailsType[] = [];
  
  if (allPayments) {
    // Filter by status
    let filteredPayments = allPayments;
    
    if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      filteredPayments = allPayments.filter(p => p.status === status);
    } else {
      // Default to pending_verification if no status filter
      filteredPayments = allPayments.filter(p => p.status === PaymentStatus.PENDING_VERIFICATION);
    }
    
    // Filter by search
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filteredPayments = filteredPayments.filter(p => 
        (p.user_name && p.user_name.toLowerCase().includes(searchLower)) || 
        (p.user_email && p.user_email.toLowerCase().includes(searchLower))
      );
    }
    
    // Sort by reported_at
    filteredPayments.sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime());
    
    // Paginate
    payments = filteredPayments.slice(offset, offset + pageSize);
  }

  // Get count of pending payments (for the badge)
  const { count: pendingCount } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', PaymentStatus.PENDING_VERIFICATION);

  // Prepare status translations
  const statusTranslations = {
    pending_verification: t('status.pendingVerification'),
    verified: t('status.verified'),
    rejected: t('status.rejected'),
    unknown: "Unknown",
  };

  // Map status translations for StatusBadge
  const statusBadgeTranslations = mapToStatusBadgeTranslations(statusTranslations);

  // Prepare filter translations
  const filterTranslations = {
    allPayments: t('filters.allPayments'),
    pending_verification: t('status.pendingVerification'),
    verified: t('status.verified'),
    rejected: t('status.rejected'),
  };

  // Pagination translations
  const paginationTranslations = {
    showing: t('pagination.showing'),
    of: t('pagination.of'),
    entries: t('pagination.entries'),
    previousPage: t('pagination.previousPage'),
    nextPage: t('pagination.nextPage'),
    pageSize: t('pagination.pageSize'),
    currentPage: page,
    totalPages: totalPayments ? Math.ceil(totalPayments / pageSize) : 0,
  };

  // Calculate total pages
  const totalPages = totalPayments ? Math.ceil(totalPayments / pageSize) : 0;

  // Combine errors
  const error = countError || rpcError;

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t('pending.title')}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {t('pending.count', { count: pendingCount || 0 })}
        </p>
      </div>

      {/* Filter section */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div className="flex items-center">
          <StatusFilter
            activeFilter={status || "pending_verification"}
            pendingCount={pendingCount || 0}
            locale={locale}
            search={search}
            page={page}
            pageSize={pageSize}
            translations={filterTranslations}
          />
        </div>
        
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <form action={`/${locale}/admin/payments/pending`} method="get">
            {status && <input type="hidden" name="status" value={status} />}
            {page && <input type="hidden" name="page" value={page.toString()} />}
            {pageSize && <input type="hidden" name="page_size" value={pageSize.toString()} />}
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <HiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="search"
                name="search"
                defaultValue={search}
                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={t('filters.searchUserPlaceholder')}
              />
              <button
                type="submit"
                className="absolute top-0 end-0 p-2 text-sm font-medium h-full text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                {t('filters.search')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main content */}
      <Card>
        {error ? (
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
            {t('fetchError')} {error.message}
          </div>
        ) : !payments || payments.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {search || status ? t('filters.noMatchingPayments') : t('noPayments')}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      {t('table.user')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t('table.amount')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t('table.billingPeriod')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t('table.paymentMethod')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t('table.reportedAt')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t('table.status')}
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {t('table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      {/* User column with profile picture and name */}
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          {payment.profile_picture_url ? (
                            <Image
                              src={payment.profile_picture_url}
                              alt={payment.user_name || "User"}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                          )}
                          {payment.user_name || "Unknown User"}
                        </div>
                      </td>

                      {/* Amount column */}
                      <td className="px-4 py-3">
                        {payment.amount} DZD
                      </td>

                      {/* Billing Period column */}
                      <td className="px-4 py-3">
                        {t(`billingPeriods.${payment.billing_period}`)}
                      </td>

                      {/* Payment Method column */}
                      <td className="px-4 py-3">
                        {t(`paymentMethods.${payment.payment_method_reported}`)}
                      </td>

                      {/* Reported date column */}
                      <td className="px-4 py-3">
                        {formatDate(payment.reported_at, locale)}
                      </td>

                      {/* Status column */}
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={payment.status}
                          translations={statusBadgeTranslations}
                        />
                      </td>

                      {/* Actions column */}
                      <td className="px-4 py-3">
                        <Link href={`/${locale}/admin/payments/${payment.id}`}>
                          <Button size="xs">
                            <HiEye className="mr-1 h-4 w-4" />
                            {t('table.viewDetails')}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4">
              <PaginationClient
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalPayments || 0}
                translations={paginationTranslations}
                basePath={`/${locale}/admin/payments/pending`}
                searchParams={{
                  status: status,
                  search: search
                }}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
} 