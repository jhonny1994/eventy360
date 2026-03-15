import { getTranslations } from "next-intl/server";
import { Card } from "flowbite-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/utils/admin/auth";
import EventStatusFilter from "./EventStatusFilter";
import { Database } from "@/database.types";
import PaginationClient from "@/components/admin/ui/PaginationClient";
import EventsClientWrapper from "./EventsClientWrapper";
import { HiSearch } from "react-icons/hi";

type EventType = {
  id: string;
  event_name: string;
  event_date: string;
  event_end_date: string;
  organizer_name: string;
  status: Database["public"]["Enums"]["event_status_enum"];
  format: Database["public"]["Enums"]["event_format_enum"];
  logo_url: string | null;
  consolidated_status: "ongoing" | "completed" | "cancelled";
  abstract_submission_deadline?: string;
  email?: string;
  phone?: string;
  website?: string;
  problem_statement_translations?: { [key: string]: string };
  submission_guidelines_translations?: { [key: string]: string };
  event_axes_translations?: { [key: string]: string };
  event_objectives_translations?: { [key: string]: string };
  who_organizes_translations?: { [key: string]: string };
  wilaya_name?: string;
  daira_name?: string;
  scientific_committees_translations?: { [key: string]: string };
  speakers_keynotes_translations?: { [key: string]: string };
  target_audience_translations?: { [key: string]: string };
  qr_code_url?: string | null;
};

type EventListProps = {
  searchParams: Promise<{
    status?: string;
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
 * Admin events list page
 * Shows all events with filtering by status, searching by name, and pagination
 */
export default async function AdminEventsPage({
  params,
  searchParams,
}: EventListProps) {
  const { locale } = await params;
  const searchParamsData = await searchParams;
  const {
    status,
    search,
    page: pageParam,
    page_size: pageSizeParam,
  } = searchParamsData || {};
  const t = await getTranslations("AdminEvents");

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

  // Map the consolidated status filter to actual event statuses
  let eventStatusFilter:
    | Database["public"]["Enums"]["event_status_enum"][]
    | undefined;

  if (status === "ongoing") {
    eventStatusFilter = [
      "published",
      "abstract_review",
      "full_paper_submission_open",
      "full_paper_review",
    ];
  } else if (status === "completed") {
    eventStatusFilter = ["completed"];
  } else if (status === "cancelled") {
    eventStatusFilter = ["canceled"]; // Note: DB uses 'canceled' not 'cancelled'
  }

  // Fetch events using discover_events function
  const { data: eventsData, error: eventsError } = await supabase.rpc(
    "discover_events",
    {
      search_query: search || undefined,
      event_status_filter: eventStatusFilter,
      limit_count: pageSize,
      offset_count: offset,
    }
  );

  if (eventsError) {
    console.error("Error fetching events:", eventsError.message);
    return (
      <div className="w-full">
        <Card>
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
            {t("fetchError")} {eventsError.message}
          </div>
        </Card>
      </div>
    );
  }

  // Transform the data to match our EventType structure and consolidate statuses
  const events: EventType[] =
    eventsData?.map((event) => {
      // Determine consolidated status
      let consolidated_status: "ongoing" | "completed" | "cancelled";

      if (event.status === "completed") {
        consolidated_status = "completed";
      } else if (event.status === "canceled") {
        consolidated_status = "cancelled";
      } else {
        consolidated_status = "ongoing";
      }

      return {
        id: event.id,
        event_name: event.event_name,
        event_date: event.event_date,
        event_end_date: event.event_end_date,
        organizer_name: event.organizer_name,
        status: event.status,
        format: event.format,
        logo_url: event.logo_url,
        consolidated_status,
        abstract_submission_deadline: event.abstract_submission_deadline,
        wilaya_name: event.wilaya_name,
        daira_name: event.daira_name,
        // We're not including properties that don't exist in the discover_events result
        // These will be fetched separately in the client component when needed
      };
    }) || [];

  // Get total count from the first result
  const totalEvents =
    eventsData && eventsData.length > 0 ? eventsData[0].total_records : 0;

  // Count events by consolidated status
  // We need to fetch all events to get accurate counts
  const { data: allEventsData } = await supabase.rpc("discover_events", {
    limit_count: 1000, // Large number to get all events (in a real app, this would need pagination)
  });

  // Count events by status
  const ongoingCount =
    allEventsData?.filter((e) =>
      [
        "published",
        "abstract_review",
        "full_paper_submission_open",
        "full_paper_review",
      ].includes(e.status)
    ).length || 0;

  const completedCount =
    allEventsData?.filter((e) => e.status === "completed").length || 0;
  const cancelledCount =
    allEventsData?.filter((e) => e.status === "canceled").length || 0;

  // Prepare filter translations
  const filterTranslations = {
    allEvents: t("filters.allEvents"),
    ongoing: t("filters.ongoing"),
    completed: t("filters.completed"),
    cancelled: t("filters.cancelled"),
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

  // Prepare translations for the client component
  const clientTranslations = {
    table: {
      event: t("table.event"),
      date: t("table.date"),
      from: t("table.from"),
      to: t("table.to"),
      organizer: t("table.organizer"),
      status: t("table.status"),
      actions: t("table.actions"),
    },
    status: {
      ongoing: t("status.ongoing"),
      completed: t("status.completed"),
      cancelled: t("status.cancelled"),
    },
    actions: {
      viewDetails: t("actions.viewDetails"),
    },
    unknownEvent: t("unknownEvent"),
    unknownOrganizer: t("unknownOrganizer"),
    modal: {
      eventDetails: t("modal.eventDetails"),
      close: t("modal.close"),
      eventInfo: t("modal.eventInfo"),
      dates: t("modal.dates"),
      location: t("modal.location"),
      contact: t("modal.contact"),
      status: {
        ongoing: t("status.ongoing"),
        completed: t("status.completed"),
        cancelled: t("status.cancelled"),
      },
      format: {
        physical: t("modal.format.physical"),
        virtual: t("modal.format.virtual"),
        hybrid: t("modal.format.hybrid"),
      },
      from: t("modal.from"),
      to: t("modal.to"),
      submissionDeadline: t("modal.submissionDeadline"),
      organizer: t("modal.organizer"),
      problemStatement: t("modal.problemStatement"),
      eventAxes: t("modal.eventAxes"),
      eventObjectives: t("modal.eventObjectives"),
      submissionGuidelines: t("modal.submissionGuidelines"),
      whoOrganizes: t("modal.whoOrganizes"),
      notAvailable: t("modal.notAvailable"),
    },
  };

  // Calculate total pages
  const totalPages = totalEvents
    ? Math.ceil(Number(totalEvents) / pageSize)
    : 0;

  // Check if we're using RTL layout
  const isRtl = locale === "ar";

  // Function to get appropriate text align class based on RTL

  // Stronger RTL text direction enforcement classes

  return (
    <div className="w-full" dir={isRtl ? "rtl" : "ltr"}>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {t("title")}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {t("eventsCount", { count: totalEvents || 0 })}
        </p>
      </div>
      {/* Filter section */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
          <EventStatusFilter
            activeFilter={status || null}
            ongoingCount={ongoingCount || 0}
            completedCount={completedCount || 0}
            cancelledCount={cancelledCount || 0}
            locale={locale}
            search={search}
            page={page}
            pageSize={pageSize}
            translations={filterTranslations}
          />
        </div>

        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <form action={`/${locale}/admin/events`} method="get">
            {status && <input type="hidden" name="status" value={status} />}
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
                placeholder={t("filters.searchEventPlaceholder")}
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
      </div>
      {/* Main content */}
      <Card>
        {!events || events.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {search || status ? t("filters.noMatchingEvents") : t("noEvents")}
          </div>
        ) : (
          <>
            <EventsClientWrapper
              events={events}
              locale={locale}
              translations={clientTranslations}
            />
            <div className="mt-4">
              <PaginationClient
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={Number(totalEvents) || 0}
                translations={paginationTranslations}
                basePath={`/${locale}/admin/events`}
                searchParams={{
                  status: status,
                  search: search,
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
