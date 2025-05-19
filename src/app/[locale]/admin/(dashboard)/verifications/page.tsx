import { getTranslations } from "next-intl/server";
import { Card, Button } from "flowbite-react";
import { HiEye, HiSearch } from "react-icons/hi";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/utils/admin/auth";
import { formatDate } from "@/utils/admin/format";
import Link from "next/link";
import Image from "next/image";
import { StatusBadge } from "@/components/admin/ui";
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
  };
  params: { locale: string };
};

/**
 * Admin verification requests list page
 * Shows all verification requests with status and actions
 * Supports filtering by status and searching by user name
 */
export default async function AdminVerificationsPage({
  params,
  searchParams = {},
}: VerificationListProps) {
  const { locale } = await params;
  // Await searchParams before accessing its properties
  const searchParamsData = await searchParams;
  const { status, search } = searchParamsData;
  const t = await getTranslations("AdminVerifications");

  // Ensure user is admin
  await requireAdmin(locale);

  // Initialize Supabase client
  const supabase = await createServerSupabaseClient();

  // Build query with filters
  let query = supabase.from("verification_request_details").select("*");

  // Apply status filter if provided
  if (status && Object.values(VerificationStatus).includes(status as VerificationStatus)) {
    query = query.eq("status", status as VerificationStatus);
  }

  // Apply search filter if provided
  if (search) {
    query = query.ilike("user_name", `%${search}%`);
  }

  // Execute query with ordering: pending first, then most recent
  const { data: verificationRequests, error } = await query
    .order("status", { ascending: false }) // This puts 'pending' first (alphabetically after 'approved'/'rejected')
    .order("submitted_at", { ascending: false });

  // Get count of pending requests
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

  return (
    <div className="w-full">
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
            translations={filterTranslations}
          />
        </div>
        
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <form action={`/${locale}/admin/verifications`} method="get">
            {status && <input type="hidden" name="status" value={status} />}
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <HiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="search"
                name="search"
                defaultValue={search}
                className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={t("filters.searchUserPlaceholder")}
              />
              <button
                type="submit"
                className="absolute top-0 end-0 p-2 text-sm font-medium h-full text-white bg-blue-700 rounded-e-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    {t("table.user")}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    {t("table.userType")}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    {t("table.submittedAt")}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    {t("table.status")}
                  </th>
                  <th scope="col" className="px-4 py-3">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {verificationRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    {/* User column with profile picture and name */}
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
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
                    <td className="px-4 py-3">
                      {request.user_type && t(`userTypes.${request.user_type}`)}
                    </td>

                    {/* Submission date column */}
                    <td className="px-4 py-3">
                      {formatDate(request.submitted_at, locale)}
                    </td>

                    {/* Status column with badge */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={request.status}
                        translations={statusTranslations}
                      />
                    </td>

                    {/* Actions column with view button */}
                    <td className="px-4 py-3">
                      <Link href={`/${locale}/admin/verifications/${request.id}`}>
                        <Button size="xs" color="info">
                          <HiEye className="mr-1 h-4 w-4" />
                          {t("actions.view")}
                        </Button>
                      </Link>
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
