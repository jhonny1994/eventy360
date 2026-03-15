import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Card } from "flowbite-react";
import { HiSearch } from "react-icons/hi";
import { getTranslations } from "next-intl/server";
import PaginationClient from "@/components/admin/ui/PaginationClient";
import SubmissionStatusFilter from "./SubmissionStatusFilter";
import SubmissionsClientWrapper from "./SubmissionsClientWrapper";
import { Database } from "@/database.types";

type SubmissionType = {
  id: string;
  title: string;
  abstract: string | null;
  submission_date: string;
  status: Database["public"]["Enums"]["submission_status_enum"];
  researcher_name: string;
  researcher_id: string;
  event_name: string;
  event_id: string;
  researcher_profile_picture_url: string | null;
  feedback: string | null;
  current_version: number;
  keywords: string[] | null;
  file_url: string | null;
};

// Translation interfaces for type safety
type TranslatedText = Record<string, string>;

interface ClientTranslations {
  table: {
    title: string;
    author: string;
    event: string;
    submissionDate: string;
    status: string;
    actions: string;
  };
  status: {
    received: string;
    underReview: string;
    accepted: string;
    rejected: string;
  };
  actions: {
    viewDetails: string;
  };
  unknownSubmission: string;
  unknownResearcher: string;
  unknownEvent: string;
  modal: {
    submissionDetails: string;
    close: string;
    submissionInfo: string;
    title: string;
    abstract: string;
    researcher: string;
    event: string;
    submissionDate: string;
    status: string;
    version: string;
    keywords: string;
    noKeywords: string;
    downloadFile: string;
    noFileAvailable: string;
    reviewFeedback: string;
    noFeedback: string;
    statusReceived?: string;
    statusUnderReview?: string;
    statusAccepted?: string;
    statusRejected?: string;
  };
}

/**
 * Admin Submissions Page
 * Displays a list of all submissions with filtering and pagination
 */
export default async function AdminSubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await the params and searchParams
  const { locale } = await params;
  const searchParamsData = await searchParams;

  // Check if user is authenticated and is an admin
  const supabase = await createServerSupabaseClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  // Verify the user is an admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type !== "admin") {
    return notFound();
  }

  // Parse search parameters
  const activeFilter =
    typeof searchParamsData.status === "string" ? searchParamsData.status : "all";
  const search =
    typeof searchParamsData.search === "string" ? searchParamsData.search : "";
  const page = typeof searchParamsData.page === "string"
    ? parseInt(searchParamsData.page)
    : 1;
  const pageSize = typeof searchParamsData.pageSize === "string"
    ? parseInt(searchParamsData.pageSize)
    : 10;
  const offset = (page - 1) * pageSize;

  // Fetch submissions with filtering and pagination
  let submissionsQuery = supabase
    .from("submissions")
    .select(
      `
      id, 
      title_translations, 
      abstract_translations, 
      submission_date,
      status,
      current_abstract_version_id,
      current_full_paper_version_id,
      full_paper_file_url,
      submitted_by,
      event_id,
      deleted_at
    `,
      { count: "exact" }
    )
    .is("deleted_at", null);

  // Apply status filter
  if (activeFilter === "received") {
    submissionsQuery = submissionsQuery.eq("status", "abstract_submitted");
  } else if (activeFilter === "under_review") {
    submissionsQuery = submissionsQuery.or(
      "status.eq.abstract_accepted,status.eq.full_paper_submitted,status.eq.revision_under_review"
    );
  } else if (activeFilter === "accepted") {
    submissionsQuery = submissionsQuery.or(
      "status.eq.full_paper_accepted,status.eq.completed"
    );
  } else if (activeFilter === "rejected") {
    submissionsQuery = submissionsQuery.or(
      "status.eq.abstract_rejected,status.eq.full_paper_rejected"
    );
  }

  // Apply search if provided
  if (search) {
    // Search in title_translations, which is a JSON field containing translations
    submissionsQuery = submissionsQuery.or(
      `title_translations->ar.ilike.%${search}%,title_translations->en.ilike.%${search}%`
    );
  }

  // Paginate results
  submissionsQuery = submissionsQuery
    .order("submission_date", { ascending: false })
    .range(offset, offset + pageSize - 1);

  const { data: submissionsData, count, error: submissionsError } =
    await submissionsQuery;

  if (submissionsError) {
    // Error will be shown in UI
  }

  // Calculate counts for filters
  const [
    { count: receivedCount },
    { count: underReviewCount },
    { count: acceptedCount },
    { count: rejectedCount },
  ] = await Promise.all([
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "abstract_submitted"),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .or(
        "status.eq.abstract_accepted,status.eq.full_paper_submitted,status.eq.revision_under_review"
      ),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .or("status.eq.full_paper_accepted,status.eq.completed"),
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .or("status.eq.abstract_rejected,status.eq.full_paper_rejected"),
  ]);

  // Only process further if we have valid submission data
  const submissions: SubmissionType[] = [];

  if (submissionsData && !submissionsError) {
    try {
      // Extract IDs for related data queries
      const researcherIds = submissionsData.map(sub => sub.submitted_by);
      const eventIds = submissionsData.map(sub => sub.event_id);

      // Define version IDs for the submission feedback query, using the current abstract or paper version
      const versionIds: string[] = [];

      for (const sub of submissionsData) {
        // Determine the current version ID based on which is available
        if (sub.current_full_paper_version_id) {
          versionIds.push(sub.current_full_paper_version_id);
        } else if (sub.current_abstract_version_id) {
          versionIds.push(sub.current_abstract_version_id);
        } else {
          versionIds.push(`${sub.id}_v1`); // Fallback
        }
      }

      // Fetch related data
      const [
        { data: researchersData, error: researchersError },
        { data: eventsData, error: eventsError },
        { data: feedbackData, error: feedbackError },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select(
            `
            id,
            researcher_profiles(
              name,
              profile_picture_url
            )
          `
          )
          .in("id", researcherIds.length ? researcherIds : ['placeholder-id']),
        supabase
          .from("events")
          .select(
            `
            id,
            event_name_translations
          `
          )
          .in("id", eventIds.length ? eventIds : ['placeholder-id']),
        supabase
          .from("submission_feedback")
          .select("*")
          .in(
            "submission_version_id",
            versionIds.length ? versionIds : ['placeholder-id']
          ),
      ]);

      if (researchersError) {
        // Continue with partial data
      }

      if (eventsError) {
        // Continue with partial data
      }

      if (feedbackError) {
        // Continue with partial data
      }

      // Transform data only if we have valid related data
      if (researchersData && eventsData) {
        // Transform data to include researcher names, event names, and feedback
        submissionsData.forEach(submission => {
          const researcher = researchersData.find(
            r => r.id === submission.submitted_by
          );
          const event = eventsData.find(e => e.id === submission.event_id);

          // Determine which version ID to use for feedback lookup
          let versionIdForFeedback = "";
          if (submission.current_full_paper_version_id) {
            versionIdForFeedback = submission.current_full_paper_version_id;
          } else if (submission.current_abstract_version_id) {
            versionIdForFeedback = submission.current_abstract_version_id;
          } else {
            versionIdForFeedback = `${submission.id}_v1`;
          }

          const feedback = feedbackData?.find(
            f => f.submission_version_id === versionIdForFeedback
          );

          // Determine the current version number (assuming 1 as default)
          const currentVersion = 1;

          // Extract title from translations based on locale or fallback
          const titleTranslations = submission.title_translations as TranslatedText;
          const title = titleTranslations[locale] ||
            titleTranslations['en'] ||
            Object.values(titleTranslations)[0] || '';

          // Extract abstract from translations based on locale or fallback
          const abstractTranslations = submission.abstract_translations as TranslatedText;
          const abstract = abstractTranslations[locale] ||
            abstractTranslations['en'] ||
            Object.values(abstractTranslations)[0] || null;

          // Get researcher name and profile picture if available
          let researcherName = "Unknown Researcher";
          let profilePictureUrl = null;

          if (researcher?.researcher_profiles) {
            // researcher_profiles could be an object or array depending on how Supabase returns it
            const profiles = Array.isArray(researcher.researcher_profiles)
              ? researcher.researcher_profiles
              : [researcher.researcher_profiles];

            if (profiles.length > 0) {
              const profile = profiles[0] as { name: string; profile_picture_url: string | null };
              researcherName = profile.name || "Unknown Researcher";
              profilePictureUrl = profile.profile_picture_url;
            }
          }

          // Get event name from translations
          let eventName = "Unknown Event";
          if (event?.event_name_translations) {
            const eventNameTranslations = event.event_name_translations as TranslatedText;
            eventName = eventNameTranslations[locale] ||
              eventNameTranslations['en'] ||
              Object.values(eventNameTranslations)[0] || "Unknown Event";
          }

          submissions.push({
            id: submission.id,
            title,
            abstract,
            submission_date: submission.submission_date,
            status: submission.status || 'abstract_submitted', // Default fallback status
            researcher_name: researcherName,
            researcher_id: submission.submitted_by,
            event_name: eventName,
            event_id: submission.event_id,
            researcher_profile_picture_url: profilePictureUrl,
            feedback: feedback?.feedback_content || null,
            current_version: currentVersion,
            keywords: null, // Keywords not available in the database schema
            file_url: submission.full_paper_file_url,
          });
        });
      }
    } catch {
      // Error processing data - UI shows empty state
    }
  }

  // Get translations
  const t = await getTranslations("AdminSubmissions");

  // Calculate pagination
  const totalPages = count ? Math.ceil(count / pageSize) : 0;
  const totalItems = count || 0;

  // Prepare translations for client component
  const clientTranslations: ClientTranslations = {
    table: {
      title: t("table.title"),
      author: t("table.author"),
      event: t("table.event"),
      submissionDate: t("table.submissionDate"),
      status: t("table.status"),
      actions: t("table.actions"),
    },
    status: {
      received: t("status.received"),
      underReview: t("status.underReview"),
      accepted: t("status.accepted"),
      rejected: t("status.rejected"),
    },
    actions: {
      viewDetails: t("actions.viewDetails"),
    },
    unknownSubmission: t("unknownSubmission"),
    unknownResearcher: t("unknownResearcher"),
    unknownEvent: t("unknownEvent"),
    modal: {
      submissionDetails: t("modal.submissionDetails"),
      close: t("modal.close"),
      submissionInfo: t("modal.submissionInfo"),
      title: t("modal.title"),
      abstract: t("modal.abstract"),
      researcher: t("modal.researcher"),
      event: t("modal.event"),
      submissionDate: t("modal.submissionDate"),
      status: t("modal.status"),
      version: t("modal.version"),
      keywords: t("modal.keywords"),
      noKeywords: t("modal.noKeywords"),
      downloadFile: t("modal.downloadFile"),
      noFileAvailable: t("modal.noFileAvailable"),
      reviewFeedback: t("modal.reviewFeedback"),
      noFeedback: t("modal.noFeedback"),
      statusReceived: t("status.received"),
      statusUnderReview: t("status.underReview"),
      statusAccepted: t("status.accepted"),
      statusRejected: t("status.rejected"),
    },
  };

  // Prepare filter translations
  const filterTranslations = {
    allSubmissions: t("filters.allSubmissions"),
    received: t("filters.received"),
    underReview: t("filters.underReview"),
    accepted: t("filters.accepted"),
    rejected: t("filters.rejected"),
  };

  const isRtl = locale === "ar";

  return (
    <div className="w-full" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t("title")}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {t("submissionsCount", { count: count || 0 })}
        </p>
      </div>

      {/* Filter section */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
          <SubmissionStatusFilter
            activeFilter={activeFilter}
            receivedCount={receivedCount || 0}
            underReviewCount={underReviewCount || 0}
            acceptedCount={acceptedCount || 0}
            rejectedCount={rejectedCount || 0}
            locale={locale}
            search={search}
            page={page}
            pageSize={pageSize}
            translations={filterTranslations}
          />
        </div>

        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <form action={`/${locale}/admin/submissions`} method="get">
            <input type="hidden" name="status" value={activeFilter} />
            <div className="relative">
              <div className={`absolute inset-y-0 ${isRtl ? 'end-0 pe-3' : 'start-0 ps-3'} flex items-center pointer-events-none`}>
                <HiSearch className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </div>
              <input
                type="search"
                name="search"
                defaultValue={search}
                className={`block w-full p-2 ${isRtl ? 'pe-10' : 'ps-10'} text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
                placeholder={t("filters.searchSubmissionPlaceholder")}
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
        {submissionsError ? (
          <div className="p-4 bg-red-100 text-red-700 rounded-lg">
            {t("fetchError")} {submissionsError.message}
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {search ? t("filters.noMatchingSubmissions") : t("noSubmissions")}
          </div>
        ) : (
          <>
            <SubmissionsClientWrapper
              submissions={submissions}
              locale={locale}
              translations={clientTranslations}
            />
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <PaginationClient
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={totalItems}
                translations={{
                  showing: t("pagination.showing"),
                  of: t("pagination.of"),
                  entries: t("pagination.entries"),
                  previousPage: t("pagination.previousPage"),
                  nextPage: t("pagination.nextPage"),
                  pageSize: t("pagination.pageSize"),
                }}
                basePath={`/${locale}/admin/submissions`}
                searchParams={{
                  status: activeFilter,
                  search: search,
                  page_size: pageSize.toString()
                }}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

// Removed dynamic rendering export for cacheComponents compatibility