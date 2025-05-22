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

enum VerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

type VerificationListProps = {
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
 * Admin verification requests list page
 * Shows all verification requests with status and actions
 * Supports filtering by status, searching by user name, and pagination
 */
export default async function AdminVerificationsPage({
  params,
  searchParams = {},
}: VerificationListProps) {
  const { locale } = await params;
  // Await searchParams before accessing its properties
  const searchParamsData = await searchParams;
  const { status, search, page: pageParam, page_size: pageSizeParam } = searchParamsData;
  const t = await getTranslations("AdminVerifications");

  // Parse pagination parameters with defaults
  const page = pageParam ? parseInt(pageParam, 10) : DEFAULT_PAGE;
  const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : DEFAULT_PAGE_SIZE;
  
  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;

  // Ensure user is admin
  await requireAdmin(locale);

  // Initialize Supabase client
  const supabase = await createServerSupabaseClient();

  // Build query with filters
  let countQuery = supabase.from("verification_request_details").select("*", { count: "exact", head: true });
  let dataQuery = supabase
    .from("verification_request_details")
    .select("*")
    .range(offset, offset + pageSize - 1); // Use range for pagination (offset to offset+limit-1)

  // Apply status filter if provided to both queries
  if (status && Object.values(VerificationStatus).includes(status as VerificationStatus)) {
    countQuery = countQuery.eq("status", status as VerificationStatus);
    dataQuery = dataQuery.eq("status", status as VerificationStatus);
  }

  // Apply search filter if provided to both queries
  if (search) {
    countQuery = countQuery.ilike("user_name", `%${search}%`);
    dataQuery = dataQuery.ilike("user_name", `%${search}%`);
  }

  // Apply ordering: pending first, then most recent
  dataQuery = dataQuery
    .order("status", { ascending: false }) // This puts 'pending' first (alphabetically after 'approved'/'rejected')
    .order("submitted_at", { ascending: false });

  // Execute both queries in parallel for better performance
  const [countResult, dataResult] = await Promise.all([
    countQuery,
    dataQuery
  ]);

  const { count: totalRequests, error: countError } = countResult;
  const { data: verificationRequests, error: dataError } = dataResult;

  // Get count of pending requests (for the badge)
  const { count: pendingCount } = await supabase
    .from("verification_request_details")
    .select("*", { count: "exact", head: true })
    .eq("status", VerificationStatus.PENDING);

  // Prepare status translations for the StatusBadge component
  const statusTranslations = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
    unknown: "Unknown",
  };

  // Prepare filter translations
  const filterTranslations = {
    allRequests: t("filters.allRequests"),
    pending: t("status.pending"),
    approved: t("status.approved"),
    rejected: t("status.rejected"),
  };

  // Pagination translations
  const paginationTranslations = {
    showing: t("pagination.showing"),
    of: t("pagination.of"),
    entries: t("pagination.entries"),
    previousPage: t("pagination.previousPage"),
    nextPage: t("pagination.nextPage"),
    pageSize: t("pagination.pageSize"),
  };

  // Calculate total pages
  const totalPages = totalRequests ? Math.ceil(totalRequests / pageSize) : 0;

  // Combine errors
  const error = countError || dataError;

  // Check if we're using RTL layout
  const isRtl = locale === 'ar';
  
  // Function to get appropriate text align class based on RTL
  const getTextAlignClass = () => {
    return isRtl ? 'text-right' : 'text-left';
  };

  // Stronger RTL text direction enforcement classes
  const getRtlClass = () => {
    return isRtl ? 'rtl' : 'ltr';
  };

  return (
    <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t("title")}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {t("pendingRequestsCount", { count: pendingCount || 0 })}
        </p>
      </div>

      {/* Filter section */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div className="flex items-center">
          <StatusFilter
            activeFilter={status || null}
            pendingCount={pendingCount || 0}
            locale={locale}
            search={search}
            page={page}
            pageSize={pageSize}
            translations={filterTranslations}
          />
        </div>
        
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <form action={`/${locale}/admin/verifications`} method="get">
            {status && <input type="hidden" name="status" value={status} />}
            {page && <input type="hidden" name="page" value={page.toString()} />}
            {pageSize && <input type="hidden" name="page_size" value={pageSize.toString()} />}
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRtl ? 'end-0 pe-3' : 'start-0 ps-3'} flex items-center pointer-events-none`}>
                <HiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="search"
                name="search"
                defaultValue={search}
                className={`block w-full p-2 ${isRtl ? 'pe-10' : 'ps-10'} text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                placeholder={t("filters.searchUserPlaceholder")}
              />
              <button
                type="submit"
                className={`absolute top-0 ${isRtl ? 'start-0' : 'end-0'} p-2 text-sm font-medium h-full text-white bg-blue-700 ${isRtl ? 'rounded-s-lg' : 'rounded-e-lg'} border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`}
              >
                {t("filters.search")}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main content */}
      <Card>
        {error ? (
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
            {t("fetchError")} {error.message}
          </div>
        ) : !verificationRequests || verificationRequests.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {search || status ? t("filters.noMatchingRequests") : t("noRequests")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm text-gray-500 dark:text-gray-400 ${getRtlClass()}`} dir={isRtl ? 'rtl' : 'ltr'} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t("table.user")}
                    </th>
                    <th scope="col" className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t("table.userType")}
                    </th>
                    <th scope="col" className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t("table.submittedAt")}
                    </th>
                    <th scope="col" className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t("table.status")}
                    </th>
                    <th scope="col" className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t("table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {verificationRequests.map((request) => (
                    <tr
                      key={request.id}
                      className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${getRtlClass()}`}
                      dir={isRtl ? 'rtl' : 'ltr'}
                    >
                      {/* User column with profile picture and name */}
                      <td className={`px-4 py-3 font-medium text-gray-900 dark:text-white ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        <div className={`flex items-center gap-3 ${isRtl ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                          {request.profile_picture_url ? (
                            <Image
                              src={request.profile_picture_url}
                              alt={request.user_name || "User"}
                              width={32}
                              height={32}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                          )}
                          {request.user_name || "Unknown User"}
                        </div>
                      </td>

                      {/* User type column */}
                      <td className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        {request.user_type && t(`userTypes.${request.user_type}`)}
                      </td>

                      {/* Submission date column */}
                      <td className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        {formatDate(request.submitted_at, locale)}
                      </td>

                      {/* Status column with badge */}
                      <td className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        <StatusBadge
                          status={request.status}
                          translations={statusTranslations}
                          locale={locale}
                        />
                      </td>

                      {/* Actions column with view button */}
                      <td className={`px-4 py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        <Link href={`/${locale}/admin/verifications/${request.id}`}>
                          <Button size="xs" color="info">
                            <HiEye className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
                            {t("actions.view")}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-4 py-3">
              <PaginationClient
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalRequests || 0}
                translations={paginationTranslations}
                basePath={`/${locale}/admin/verifications`}
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
