import { getTranslations } from "next-intl/server";
import { Card } from "flowbite-react";
import { HiSearch, HiUser, HiCheck, HiX, HiTicket } from "react-icons/hi";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { requireAdmin } from "@/utils/admin/auth";
import Image from "next/image";
import { PaginationClient, DetailLinkButton } from "@/components/admin/ui";
import UserTypeFilter from './UserTypeFilter';

type UserType = {
  id: string;
  name: string;
  type: "researcher" | "organizer" | null;
  profile_picture_url: string | null;
  is_verified: boolean;
  verification_request_id: string | null;
  subscription_id: string | null;
  subscription_status: "active" | "expired" | "trial" | "cancelled" | null;
  subscription_tier: "free" | "paid_researcher" | "paid_organizer" | "trial" | null;
  pending_payment_id: string | null;
  created_at: string;
};

type UserListProps = {
  searchParams: Promise<{
    user_type?: string;
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
 * Shows all users with filtering by type, searching by name, and pagination
 */
export default async function AdminUsersPage({
  params,
  searchParams,
}: UserListProps) {
  const { locale } = await params;
  const searchParamsData = await searchParams;
  const { user_type, search, page: pageParam, page_size: pageSizeParam } = searchParamsData || {};
  const t = await getTranslations("AdminUsers");

  // Parse pagination parameters with defaults
  const page = pageParam ? parseInt(pageParam, 10) : DEFAULT_PAGE;
  const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : DEFAULT_PAGE_SIZE;
  
  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;

  // Ensure user is admin
  await requireAdmin(locale);

  // Initialize Supabase client
  const supabase = await createServerSupabaseClient();

  // Fetch basic profile data first
  let profilesQuery = supabase
    .from('profiles')
    .select('id, user_type, is_verified, created_at')
    .not('user_type', 'eq', 'admin')  // Exclude admin users
    .order('created_at', { ascending: false });

  // Apply user_type filter if provided
  if (user_type && (user_type === "researcher" || user_type === "organizer")) {
    profilesQuery = profilesQuery.eq('user_type', user_type);
  }

  const { data: profilesData, error: profilesError } = await profilesQuery;

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError.message);
    return (
      <div className="w-full">
        <Card>
          <div className="p-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
            {t("fetchError")} {profilesError.message}
          </div>
        </Card>
      </div>
    );
  }

  // Get all profile IDs
  const profileIds = profilesData?.map(profile => profile.id) || [];

  if (profileIds.length === 0) {
    return (
      <div className="w-full">
        <Card>
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {t("noUsers")}
          </div>
        </Card>
      </div>
    );
  }

  // Fetch researcher profiles
  const { data: researcherData } = await supabase
    .from('researcher_profiles')
    .select('profile_id, name, profile_picture_url')
    .in('profile_id', profileIds);

  // Fetch organizer profiles
  const { data: organizerData } = await supabase
    .from('organizer_profiles')
    .select('profile_id, name_translations, profile_picture_url')
    .in('profile_id', profileIds);

  // Fetch verification requests
  const { data: verificationData } = await supabase
    .from('verification_requests')
    .select('id, user_id, status')
    .in('user_id', profileIds);

  // Fetch subscriptions with status and tier
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('id, user_id, status, tier, end_date')
    .in('user_id', profileIds);

  // Fetch pending payments
  const { data: pendingPaymentData } = await supabase
    .from('payments')
    .select('id, user_id')
    .eq('status', 'pending_verification')
    .in('user_id', profileIds);

  // Create lookup maps for each data type
  const researcherLookup = new Map(researcherData?.map(item => [item.profile_id, item]) || []);
  const organizerLookup = new Map(organizerData?.map(item => [item.profile_id, item]) || []);

  // Group verification requests and subscriptions by profile_id
  const verificationLookup = new Map();
  verificationData?.forEach(item => {
    if (!verificationLookup.has(item.user_id)) {
      verificationLookup.set(item.user_id, []);
    }
    verificationLookup.get(item.user_id).push(item);
  });

  const subscriptionLookup = new Map();
  subscriptionData?.forEach(item => {
    subscriptionLookup.set(item.user_id, item);
  });

  const pendingPaymentLookup = new Map();
  pendingPaymentData?.forEach(item => {
    pendingPaymentLookup.set(item.user_id, item.id);
  });

  // Transform the data to match our UserType structure
  const allUsers: UserType[] = profilesData?.map(profile => {
    // Get profile picture and name based on user_type
    let name = "";
    let profile_picture_url = null;
    
    if (profile.user_type === 'researcher') {
      const researcher = researcherLookup.get(profile.id);
      name = researcher?.name || "Unknown Researcher";
      profile_picture_url = researcher?.profile_picture_url || null;
    } else if (profile.user_type === 'organizer') {
      const organizer = organizerLookup.get(profile.id);
      // Get name from name_translations with Arabic fallback to English
      if (organizer?.name_translations && typeof organizer.name_translations === 'object') {
        name = (organizer.name_translations as Record<string, string>)['ar'] || 
               (organizer.name_translations as Record<string, string>)['en'] || 
               "Unknown Organizer";
      } else {
        name = "Unknown Organizer";
      }
      profile_picture_url = organizer?.profile_picture_url || null;
    }
    
    // Get verification and subscription data
    const verifications = verificationLookup.get(profile.id) || [];
    const verification_request_id = verifications.length > 0 ? verifications[0].id : null;
    
    // Get subscription details
    const subscription = subscriptionLookup.get(profile.id);
    const subscription_id = subscription ? subscription.id : null;
    const subscription_status = subscription ? subscription.status : null;
    const subscription_tier = subscription ? subscription.tier : null;
    
    // Get pending payment id
    const pending_payment_id = pendingPaymentLookup.get(profile.id) || null;
    
    return {
      id: profile.id,
      name,
      type: profile.user_type as "researcher" | "organizer",
      profile_picture_url,
      is_verified: profile.is_verified,
      verification_request_id,
      subscription_id,
      subscription_status,
      subscription_tier,
      pending_payment_id,
      created_at: profile.created_at
    };
  }) || [];

  // Apply search filter if provided
  let filteredUsers = allUsers;
  if (search && search.trim() !== '') {
    const searchLower = search.toLowerCase();
    filteredUsers = allUsers.filter(u => 
      (u.name && u.name.toLowerCase().includes(searchLower))
    );
  }

  // Get total count
  const totalUsers = filteredUsers.length;

  // Paginate
  const users = filteredUsers.slice(offset, offset + pageSize);

  // Get count of researchers and organizers
  const researchersCount = allUsers.filter(u => u.type === "researcher").length;
  const organizersCount = allUsers.filter(u => u.type === "organizer").length;

  // Prepare filter translations
  const filterTranslations = {
    allUsers: t("filters.allUsers"),
    researchers: t("filters.researchers"),
    organizers: t("filters.organizers"),
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
  const totalPages = totalUsers ? Math.ceil(totalUsers / pageSize) : 0;

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
          {t("usersCount", { count: totalUsers || 0 })}
        </p>
      </div>
      {/* Filter section */}
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
          <UserTypeFilter
            activeFilter={user_type || null}
            researchersCount={researchersCount || 0}
            organizersCount={organizersCount || 0}
            locale={locale}
            search={search}
            page={page}
            pageSize={pageSize}
            translations={filterTranslations}
          />
        </div>
        
        <div className="w-full sm:w-auto sm:min-w-[300px]">
          <form action={`/${locale}/admin/users`} method="get">
            {user_type && <input type="hidden" name="user_type" value={user_type} />}
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
        {!users || users.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            {search || user_type ? t("filters.noMatchingUsers") : t("noUsers")}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className={`w-full text-sm text-gray-500 dark:text-gray-400 ${getRtlClass()} min-w-[700px]`} dir={isRtl ? 'rtl' : 'ltr'} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t("table.user")}
                    </th>
                    <th scope="col" className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t("table.userType")}
                    </th>
                    <th scope="col" className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t("table.verificationStatus")}
                    </th>
                    <th scope="col" className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                      {t("table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 ${getRtlClass()}`}
                      dir={isRtl ? 'rtl' : 'ltr'}
                    >
                      {/* User column with profile picture and name */}
                      <td className={`px-3 py-3 sm:px-4 sm:py-3 font-medium text-gray-900 dark:text-white ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse justify-end' : ''}`}>
                          {isRtl && (
                            <>
                              <span>{user.name || "Unknown User"}</span>
                              {user.profile_picture_url ? (
                                <Image
                                  src={user.profile_picture_url}
                                  alt={user.name || "User"}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <HiUser className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                            </>
                          )}
                          {!isRtl && (
                            <>
                              {user.profile_picture_url ? (
                                <Image
                                  src={user.profile_picture_url}
                                  alt={user.name || "User"}
                                  width={32}
                                  height={32}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <HiUser className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                              <span>{user.name || "Unknown User"}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* User type column */}
                      <td className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        <div className="flex items-center">
                          {user.type === "researcher" ? (
                            <div className="flex items-center">
                              <HiUser className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4 text-blue-500`} />
                              <span className="text-blue-500">{t(`userTypes.researcher`)}</span>
                            </div>
                          ) : user.type === "organizer" ? (
                            <div className="flex items-center">
                              <HiTicket className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4 text-purple-500`} />
                              <span className="text-purple-500">{t(`userTypes.organizer`)}</span>
                            </div>
                          ) : (
                            <span>{user.type}</span>
                          )}
                        </div>
                      </td>

                      {/* Verification status column */}
                      <td className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        <div className="flex items-center">
                          {user.is_verified ? (
                            <div className="flex items-center text-green-500 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
                              <HiCheck className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
                              {t("verificationStatus.verified")}
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-500 bg-gray-100 dark:bg-gray-900/20 px-2 py-1 rounded-full">
                              <HiX className={`${isRtl ? 'ml-1' : 'mr-1'} h-4 w-4`} />
                              {t("verificationStatus.notVerified")}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions column */}
                      <td className={`px-3 py-3 sm:px-4 sm:py-3 ${getTextAlignClass()}`} style={isRtl ? {textAlign: 'right'} : {textAlign: 'left'}}>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {user.verification_request_id && (
                            <DetailLinkButton
                              href={`/${locale}/admin/verifications/${user.verification_request_id}`}
                              label={t("actions.viewVerification")}
                            />
                          )}
                          {/* Show subscription button if active paid subscription or pending payment exists */}
                          {((user.subscription_id && user.subscription_status === 'active' && 
                             (user.subscription_tier === 'paid_researcher' || user.subscription_tier === 'paid_organizer')) || 
                            user.pending_payment_id) && (
                            <DetailLinkButton
                              href={`/${locale}/admin/payments/${user.pending_payment_id || user.subscription_id}`}
                              label={t("actions.viewSubscription")}
                            />
                          )}
                        </div>
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
              totalItems={totalUsers || 0}
              translations={paginationTranslations}
              basePath={`/${locale}/admin/users`}
              searchParams={{
                user_type: user_type,
                search: search
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
}