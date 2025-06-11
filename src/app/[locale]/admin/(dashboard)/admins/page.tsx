import { getTranslations } from "next-intl/server";
import { Card } from "flowbite-react";
import { HiSearch, HiUser } from "react-icons/hi";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/utils/admin/auth";
import { PaginationClient } from "@/components/admin/ui";
import { InviteAdminButton } from "@/components/admin";
import AdminsClientWrapper from "./AdminsClientWrapper";
import { formatDate } from "@/utils/date";

type AdminType = {
  id: string;
  name: string;
  created_at: string;
  profile_picture_url: string | null;
};

type AdminListProps = {
  searchParams: Promise<{
    search?: string;
    page?: string;
    page_size?: string;
  }>;
  params: Promise<{ locale: string }>;
};

// Default values for pagination
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

/**
 * Admin users list page
 * Shows all admin users with searching by name, and pagination
 */
export default async function AdminsPage({
  params,
  searchParams,
}: AdminListProps) {
  const { locale } = await params;
  const searchParamsData = await searchParams;
  const {
    search,
    page: pageParam,
    page_size: pageSizeParam,
  } = searchParamsData || {};
  const t = await getTranslations("AdminAdmins");

  // Parse pagination parameters with defaults
  const page = pageParam ? parseInt(pageParam, 10) : DEFAULT_PAGE;
  const pageSize = pageSizeParam
    ? parseInt(pageSizeParam, 10)
    : DEFAULT_PAGE_SIZE;

  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;

  // Ensure user is admin
  await requireAdmin(locale);

  // Initialize Supabase client
  const supabase = await createServerSupabaseClient();

  // Fetch admin profiles with their profile data and get count in a single query
  let query = supabase
    .from("admin_profiles")
    .select(
      `
      profile_id,
      name,
      created_at
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  // Apply search filter if provided
  if (search && search.trim() !== "") {
    query = query.ilike("name", `%${search}%`);
  }

  // Fetch paginated admins with count
  const {
    data: adminProfiles,
    error,
    count: totalAdmins,
  } = await query.range(offset, offset + pageSize - 1);

  if (error) {
    console.error("Error fetching admins:", error.message);
    return (
      <div className="w-full">
        <Card>
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
            {t("fetchError")} {error.message}
          </div>
        </Card>
      </div>
    );
  }

  // Transform the data to match our AdminType structure
  const admins: AdminType[] =
    adminProfiles?.map((admin) => ({
      id: admin.profile_id,
      name: admin.name,
      created_at: admin.created_at,
      profile_picture_url: null, // Admin profiles don't have profile pictures
    })) || [];

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
  const totalPages = totalAdmins ? Math.ceil(totalAdmins / pageSize) : 0;

  // Check if we're using RTL layout
  const isRtl = locale === "ar";

  // Function to get appropriate text align class based on RTL
  const getTextAlignClass = () => {
    return isRtl ? "text-right" : "text-left";
  };

  // Stronger RTL text direction enforcement classes
  const getRtlClass = () => {
    return isRtl ? "rtl" : "ltr";
  };

  // Get translations for the client component
  const inviteModalTranslations = {
    inviteAdmin: t("inviteButton"),
    inviteModal: {
      title: t("inviteModal.title"),
      form: {
        emailLabel: t("inviteModal.form.emailLabel"),
        emailPlaceholder: t("inviteModal.form.emailPlaceholder"),
        nameLabel: t("inviteModal.form.nameLabel"),
        namePlaceholder: t("inviteModal.form.namePlaceholder"),
        send: t("inviteModal.form.send"),
        sending: t("inviteModal.form.sending"),
        cancel: t("inviteModal.form.cancel"),
      },
      success: {
        title: t("inviteModal.success.title"),
        message: t("inviteModal.success.message"),
      },
      errors: {
        allFieldsRequired: t("inviteModal.errors.allFieldsRequired"),
        invalidEmail: t("inviteModal.errors.invalidEmail"),
        inviteFailed: t("inviteModal.errors.inviteFailed"),
      },
    },
  };

  return (
    <AdminsClientWrapper>
      <div className="w-full" dir={isRtl ? "rtl" : "ltr"}>
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            {t("title")}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {t("adminsCount", { count: totalAdmins || 0 })}
          </p>
        </div>
        
        {/* Search section with invite button */}
        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
          <div className="w-full sm:w-auto sm:min-w-[300px]">
            <form action={`/${locale}/admin/admins`} method="get">
              {page && (
                <input type="hidden" name="page" value={page.toString()} />
              )}
              {pageSize && (
                <input
                  type="hidden"
                  name="page_size"
                  value={pageSize.toString()}
                />
              )}
              <div className="relative">
                <div
                  className={`absolute inset-y-0 ${
                    isRtl ? "end-0 pe-3" : "start-0 ps-3"
                  } flex items-center pointer-events-none`}
                >
                  <HiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </div>
                <input
                  type="search"
                  name="search"
                  defaultValue={search}
                  className={`block w-full p-2 ${
                    isRtl ? "pe-10" : "ps-10"
                  } text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                  placeholder={t("filters.searchAdminPlaceholder")}
                />
                <button
                  type="submit"
                  className={`absolute top-0 ${
                    isRtl ? "start-0" : "end-0"
                  } p-2 text-sm font-medium h-full text-white bg-blue-700 ${
                    isRtl ? "rounded-s-lg" : "rounded-e-lg"
                  } border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800`}
                >
                  {t("filters.search")}
                </button>
              </div>
            </form>
          </div>
          
          {/* Invite Admin Button - Self-contained component */}
          <div className="flex justify-end">
            <InviteAdminButton 
              locale={locale}
              translations={inviteModalTranslations}
            />
          </div>
        </div>
        
        {/* Main content */}
        <Card>
          {!admins || admins.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              {search ? t("filters.noMatchingAdmins") : t("noAdmins")}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table
                  className={`w-full text-sm text-gray-500 dark:text-gray-400 ${getRtlClass()} min-w-[700px]`}
                  dir={isRtl ? "rtl" : "ltr"}
                  style={isRtl ? { textAlign: "right" } : { textAlign: "left" }}
                >
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th
                        scope="col"
                        className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                        style={
                          isRtl ? { textAlign: "right" } : { textAlign: "left" }
                        }
                      >
                        {t("table.admin")}
                      </th>
                      <th
                        scope="col"
                        className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                        style={
                          isRtl ? { textAlign: "right" } : { textAlign: "left" }
                        }
                      >
                        {t("table.createdAt")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr
                        key={admin.id}
                        className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${getRtlClass()}`}
                        dir={isRtl ? "rtl" : "ltr"}
                      >
                        {/* Admin name column */}
                        <td
                          className={`px-3 py-3 sm:px-4 sm:py-3 font-medium text-gray-900 dark:text-white ${getTextAlignClass()}`}
                          style={
                            isRtl
                              ? { textAlign: "right" }
                              : { textAlign: "left" }
                          }
                        >
                          <div
                            className={`flex items-center gap-3 ${
                              isRtl ? "flex-row-reverse justify-end" : ""
                            }`}
                          >
                            {isRtl && (
                              <>
                                <span>{admin.name || "Unknown Admin"}</span>
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <HiUser className="w-4 h-4 text-gray-500" />
                                </div>
                              </>
                            )}
                            {!isRtl && (
                              <>
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <HiUser className="w-4 h-4 text-gray-500" />
                                </div>
                                <span>{admin.name || "Unknown Admin"}</span>
                              </>
                            )}
                          </div>
                        </td>

                        {/* Created at column */}
                        <td
                          className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`}
                          style={
                            isRtl
                              ? { textAlign: "right" }
                              : { textAlign: "left" }
                          }
                        >
                          {formatDate(admin.created_at, locale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <PaginationClient
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalAdmins || 0}
                translations={paginationTranslations}
                basePath={`/${locale}/admin/admins`}
                searchParams={{
                  search: search,
                }}
              />
            </>
          )}
        </Card>
      </div>
    </AdminsClientWrapper>
  );
}
