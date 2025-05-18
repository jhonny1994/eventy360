import { getTranslations } from "next-intl/server";
import { Card, Button } from "flowbite-react";
import { HiEye } from "react-icons/hi";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/utils/admin/auth";
import { formatDate } from "@/utils/admin/format";
import Link from "next/link";
import Image from "next/image";
import StatusBadge from "@/components/admin/ui/StatusBadge";

enum VerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

/**
 * Admin verification requests list page
 * Shows all verification requests with status and actions
 */
export default async function AdminVerificationsPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = await params;
  const t = await getTranslations("AdminVerifications");

  // Ensure user is admin
  await requireAdmin(locale);

  // Initialize Supabase client
  const supabase = await createServerSupabaseClient();

  // Fetch verification requests, pending first
  const { data: verificationRequests, error } = await supabase
    .from("verification_request_details")
    .select("*")
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

      {/* Main content */}
      <Card>
        {error ? (
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
            {t("fetchError")} {error.message}
          </div>
        ) : !verificationRequests || verificationRequests.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {t("noRequests")}
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
                      <div className="flex gap-2">
                        <Link
                          href={`/${locale}/admin/verifications/${request.id}`}
                          passHref
                        >
                          <Button size="xs" color="info">
                            <HiEye className="mr-1 h-4 w-4" />
                            {t("actions.view")}
                          </Button>
                        </Link>
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
