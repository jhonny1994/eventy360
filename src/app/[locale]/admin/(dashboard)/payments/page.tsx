import { getTranslations } from "next-intl/server";
import { Card, Button } from "flowbite-react";
import { HiEye, HiSearch, HiUser } from "react-icons/hi";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/utils/admin/auth";
import { formatDate } from "@/utils/admin/format";
import Link from "next/link";
import Image from "next/image";
import { StatusBadge, PaginationClient } from "@/components/admin/ui";
import { PaymentWithUserDetailsType, mapToStatusBadgeTranslations } from "@/types/payments";
import { callRpcFunction } from "@/lib/hooks/useRpcFunction";

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
 * Admin payments overview page
 * Shows all payments with filtering options
 */
export default async function AdminPaymentsPage({
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

  // Get all payments with user details
  const { data: allPayments, error: rpcError } = await callRpcFunction<PaymentWithUserDetailsType[]>(
    supabase,
    'get_payments_with_user_details'
  );
  
  // Filter and paginate the payments in JS
  let payments: PaymentWithUserDetailsType[] = [];
  let filteredPayments: PaymentWithUserDetailsType[] = allPayments || [];
  
  // Apply status filter if provided
  if (status && allPayments) {
    filteredPayments = allPayments.filter(p => p.status === status);
  }
  
  // Apply search filter if provided
  if (search && search.trim() !== '' && allPayments) {
    const searchLower = search.toLowerCase();
    filteredPayments = filteredPayments.filter(p => 
      (p.user_name && p.user_name.toLowerCase().includes(searchLower))
      // Don't search by email since we no longer have that data
    );
  }
  
  // Sort by reported_at (newest first)
  filteredPayments.sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime());
  
  // Get total count
  const totalPayments = filteredPayments.length;
  
  // Paginate
  payments = filteredPayments.slice(offset, offset + pageSize);

  // Prepare status translations
  const statusTranslations = {
    pending_verification: t('status.pendingVerification'),
    verified: t('status.verified'),
    rejected: t('status.rejected'),
    unknown: "Unknown",
  };

  // Map status translations for StatusBadge
  const statusBadgeTranslations = mapToStatusBadgeTranslations(statusTranslations);

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

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t('allPayments.title')}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {t('allPayments.description')}
        </p>
      </div>

      {/* Filter section */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div className="flex items-center space-x-2">
          <Link 
            href={`/${locale}/admin/payments/pending`} 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
          >
            {t('allPayments.viewPendingPayments')}
          </Link>
        </div>
        
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <form action={`/${locale}/admin/payments`} method="get">
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
        {rpcError ? (
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
            {t('fetchError')} {rpcError.message}
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
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <HiUser className="w-4 h-4 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div>{payment.user_name || "Unknown User"}</div>
                            {/* Removed email display since it's not available anymore */}
                          </div>
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
                totalItems={totalPayments}
                translations={paginationTranslations}
                basePath={`/${locale}/admin/payments`}
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