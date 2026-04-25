import { getTranslations } from "next-intl/server";
import { Card, Badge } from "flowbite-react";
import {
  HiUsers,
  HiUserGroup,
  HiCurrencyDollar,
  HiCollection,
  HiDocumentDuplicate,
  HiShieldCheck
} from "react-icons/hi";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Define enum types based on your database schema
enum UserType {
  RESEARCHER = "researcher",
  ORGANIZER = "organizer",
  ADMIN = "admin",
}

enum PaymentStatus {
  PENDING_VERIFICATION = "pending_verification",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

enum VerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export default async function AdminDashboardPage() {
  const t = await getTranslations("AdminDashboard.Page");

  // Initialize Supabase client using the SSR client
  const supabase = await createServerSupabaseClient();

  // Fetch metrics from database
  const [
    researchersResponse,
    organizersResponse,
    pendingPaymentsResponse,
    pendingVerificationResponse,
    eventsResponse,
    submissionsResponse,
  ] = await Promise.all([
    // Get researcher count
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("user_type", UserType.RESEARCHER),

    // Get organizer count
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("user_type", UserType.ORGANIZER),

    // Get pending payments count
    supabase
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("status", PaymentStatus.PENDING_VERIFICATION),

    // Get pending verification requests count using the view that's now in the types
    supabase
      .from("admin_verification_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", VerificationStatus.PENDING),

    // Get total events count
    supabase.from("events").select("id", { count: "exact", head: true }),

    // Get total submissions count (files submitted)
    supabase.from("submissions").select("id", { count: "exact", head: true }),
  ]);

  // Extract counts from responses with fallback to 0
  const researcherCount = researchersResponse.count || 0;
  const organizerCount = organizersResponse.count || 0;
  const pendingPaymentsCount = pendingPaymentsResponse.count || 0;
  const pendingVerificationCount = pendingVerificationResponse.count || 0;
  const eventsCount = eventsResponse.count || 0;
  const submissionsCount = submissionsResponse.count || 0;

  return (
    <div className="w-full">
      {/* Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("title")}
        </h1>
        <Badge color="purple" size="lg" className="px-3 py-1.5">
          {new Date().toLocaleDateString("ar-DZ", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Badge>
      </div>

      {/* Key Metrics Section - Now organized in related pairs */}
      <div className="space-y-6">
        {/* Row 1: User metrics (Researchers and Organizers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Researcher Count */}
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t("metrics.researcherCount.title")}
                </p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {researcherCount}
                  </span>
                  <span className="mr-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("metrics.researcherCount.unit")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-green-600 dark:text-green-500">+0</span>{" "}
                  {t("metrics.since")} {t("metrics.lastMonth")}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg dark:bg-blue-900/30">
                <HiUsers className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          {/* Organizer Count */}
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t("metrics.organizerCount.title")}
                </p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {organizerCount}
                  </span>
                  <span className="mr-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("metrics.organizerCount.unit")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-green-600 dark:text-green-500">+0</span>{" "}
                  {t("metrics.since")} {t("metrics.lastMonth")}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg dark:bg-indigo-900/30">
                <HiUserGroup className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Row 2: Payment and verification metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pending Payments */}
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t("metrics.pendingPayments.title")}
                </p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {pendingPaymentsCount}
                  </span>
                  <span className="mr-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("metrics.pendingPayments.unit")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-yellow-600 dark:text-yellow-500">
                    +0
                  </span>{" "}
                  {t("metrics.since")} {t("metrics.lastWeek")}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg dark:bg-yellow-900/30">
                <HiCurrencyDollar className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>

          {/* Pending Verification */}
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t("metrics.pendingVerification.title")}
                </p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {pendingVerificationCount}
                  </span>
                  <span className="mr-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("metrics.pendingVerification.unit")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-orange-600 dark:text-orange-500">
                    +0
                  </span>{" "}
                  {t("metrics.since")} {t("metrics.lastWeek")}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg dark:bg-orange-900/30">
                <HiShieldCheck className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Row 3: Events and submissions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Events */}
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t("metrics.totalEvents.title")}
                </p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {eventsCount}
                  </span>
                  <span className="mr-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("metrics.totalEvents.unit")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-green-600 dark:text-green-500">+0</span>{" "}
                  {t("metrics.since")} {t("metrics.lastMonth")}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg dark:bg-green-900/30">
                <HiCollection className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          {/* Total Files Submitted */}
          <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  {t("metrics.totalSubmittedFiles.title")}
                </p>
                <div className="flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {submissionsCount}
                  </span>
                  <span className="mr-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {t("metrics.totalSubmittedFiles.unit")}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="text-purple-600 dark:text-purple-500">
                    +0
                  </span>{" "}
                  {t("metrics.since")} {t("metrics.lastMonth")}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg dark:bg-purple-900/30">
                <HiDocumentDuplicate className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
