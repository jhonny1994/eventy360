import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";

export interface ResearcherStats {
  totalSubmissions: number;
  acceptedAbstracts: number;
  acceptedPapers: number;
  paperDownloads: number;
  paperViews: number;
}

export interface OrganizerStats {
  totalEvents: number;
  activeEvents: number;
  totalSubmissionsReceived: number;
  totalAcceptedPapers: number;
}

export interface SubscriptionStats {
  tier: "free" | "paid_researcher" | "paid_organizer" | "trial";
  status: "active" | "expired" | "trial" | "cancelled";
  daysRemaining: number;
  endDate: string | null;
  isActive: boolean;
}

export interface ProfileCompletionStats {
  completionPercentage: number;
  completedSteps: string[];
  totalSteps: string[];
}

export interface UserStats {
  researcher?: ResearcherStats;
  organizer?: OrganizerStats;
  subscription?: SubscriptionStats;
  profileCompletion?: ProfileCompletionStats;
}

// Type definition for the subscription data returned from the database
interface SubscriptionData {
  has_subscription: boolean;
  subscription?: {
    tier: "free" | "paid_researcher" | "paid_organizer" | "trial";
    status: "active" | "expired" | "trial" | "cancelled";
    days_remaining: number;
    end_date: string | null;
    is_active: boolean;
  };
}

/**
 * Fetches statistics for a user based on their user type
 * For researchers: submission counts, accepted papers, paper analytics
 * For organizers: event counts, submission counts received
 * For all users: subscription status and details
 * 
 * @param userId The ID of the user to fetch statistics for
 * @returns User statistics object with type-specific data
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const supabase = await createServerSupabaseClient();
  
  // First determine the user type
  const { data: profileData } = await supabase
    .from("profiles")
    .select("user_type, is_extended_profile_complete, is_verified")
    .eq("id", userId)
    .single();

  if (!profileData) {
    throw new Error("User profile not found");
  }

  const userStats: UserStats = {};

  // Calculate profile completion statistics
  userStats.profileCompletion = await calculateProfileCompletion(userId, profileData.user_type, profileData.is_extended_profile_complete, profileData.is_verified, supabase);

  // Fetch subscription data for all user types
  try {
    const { data, error } = await supabase.rpc(
      "get_subscription_details",
      { target_user_id: userId }
    );

    if (!error && data) {
      // Cast to appropriate type with defined structure
      const subscriptionData = data as unknown as SubscriptionData;
      
      if (subscriptionData.has_subscription && subscriptionData.subscription) {
        userStats.subscription = {
          tier: subscriptionData.subscription.tier,
          status: subscriptionData.subscription.status,
          daysRemaining: subscriptionData.subscription.days_remaining || 0,
          endDate: subscriptionData.subscription.end_date,
          isActive: subscriptionData.subscription.is_active,
        };
      }
    }
  } catch (error) {
    console.error("Error fetching subscription data:", error);
    // Continue execution, other stats can still be fetched
  }

  if (profileData.user_type === "researcher") {
    // Get researcher-specific stats
    
    // 1. Get submission counts
    const { data: submissionsData, error: submissionsError } = await supabase
      .from("submissions")
      .select("id, abstract_status, full_paper_status")
      .eq("submitted_by", userId);

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
      throw new Error("Failed to fetch submissions data");
    }

    const totalSubmissions = submissionsData?.length || 0;
    const acceptedAbstracts = submissionsData?.filter(
      s => s.abstract_status === "abstract_accepted"
    ).length || 0;
    const acceptedPapers = submissionsData?.filter(
      s => s.full_paper_status === "full_paper_accepted"
    ).length || 0;

    // 2. Get paper analytics (views and downloads)
    const submissionIds = submissionsData?.map(s => s.id) || [];
    let paperViews = 0;
    let paperDownloads = 0;

    if (submissionIds.length > 0) {
      const { data: analyticsData } = await supabase
        .from("paper_analytics")
        .select("action_type, submission_id")
        .in("submission_id", submissionIds);

      if (analyticsData) {
        paperViews = analyticsData.filter(a => a.action_type === "view").length;
        paperDownloads = analyticsData.filter(a => a.action_type === "download").length;
      }
    }

    userStats.researcher = {
      totalSubmissions,
      acceptedAbstracts,
      acceptedPapers,
      paperViews,
      paperDownloads
    };
  }
  else if (profileData.user_type === "organizer") {
    // Get organizer-specific stats
    
    // 1. Get events created by this organizer
    const { data: eventsData, error: eventsError } = await supabase
      .from("events")
      .select("id, status")
      .eq("created_by", userId);

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw new Error("Failed to fetch events data");
    }

    const totalEvents = eventsData?.length || 0;
    const activeEvents = eventsData?.filter(
      e => ["published", "abstract_review", "full_paper_submission_open", "full_paper_review"].includes(e.status)
    ).length || 0;

    // 2. Get submissions for all events created by this organizer
    const eventIds = eventsData?.map(e => e.id) || [];
    let totalSubmissionsReceived = 0;
    let totalAcceptedPapers = 0;

    if (eventIds.length > 0) {
      const { data: submissionsData } = await supabase
        .from("submissions")
        .select("id, abstract_status, full_paper_status")
        .in("event_id", eventIds);

      if (submissionsData) {
        totalSubmissionsReceived = submissionsData.length;
        totalAcceptedPapers = submissionsData.filter(
          s => s.full_paper_status === "full_paper_accepted"
        ).length;
      }
    }

    userStats.organizer = {
      totalEvents,
      activeEvents,
      totalSubmissionsReceived,
      totalAcceptedPapers
    };
  }

  return userStats;
}

/**
 * Calculates profile completion percentage based on the steps completed by the user
 * For researchers: completed profile info, uploaded profile photo, verified, subscribed, participated in an event, bookmarked an event
 * For organizers: completed profile info, uploaded profile photo, verified, subscribed, created an event
 * 
 * @param userId The ID of the user
 * @param userType The type of user (researcher or organizer)
 * @param isExtendedProfileComplete Whether the user has completed their extended profile
 * @param isVerified Whether the user is verified
 * @param supabase The Supabase client
 * @returns Profile completion statistics
 */
async function calculateProfileCompletion(
  userId: string, 
  userType: string, 
  isExtendedProfileComplete: boolean,
  isVerified: boolean,
  supabase: SupabaseClient
): Promise<ProfileCompletionStats> {
  // Define the steps for each user type
  const researcherSteps = [
    "completed_profile_info",
    "uploaded_profile_photo",
    "verified",
    "subscribed",
    "participated_in_event",
    "bookmarked_event"
  ];
  
  const organizerSteps = [
    "completed_profile_info",
    "uploaded_profile_photo",
    "verified",
    "subscribed",
    "created_event"
  ];
  
  const steps = userType === "researcher" ? researcherSteps : organizerSteps;
  const completedSteps: string[] = [];
  
  // 1. Check for completed profile info
  if (isExtendedProfileComplete) {
    completedSteps.push("completed_profile_info");
  }
  
  // 2. Check for profile photo
  let hasProfilePhoto = false;
  if (userType === "researcher") {
    const { data: researcherProfile } = await supabase
      .from("researcher_profiles")
      .select("profile_picture_url")
      .eq("profile_id", userId)
      .single();
    
    hasProfilePhoto = !!(researcherProfile && researcherProfile.profile_picture_url);
  } else {
    const { data: organizerProfile } = await supabase
      .from("organizer_profiles")
      .select("profile_picture_url")
      .eq("profile_id", userId)
      .single();
    
    hasProfilePhoto = !!(organizerProfile && organizerProfile.profile_picture_url);
  }
  
  if (hasProfilePhoto) {
    completedSteps.push("uploaded_profile_photo");
  }
  
  // 3. Check for verified status
  if (isVerified) {
    completedSteps.push("verified");
  }
  
  // 4. Check for active subscription
  const { data: subscriptionData } = await supabase.rpc(
    "get_subscription_details",
    { target_user_id: userId }
  );
  
  if (subscriptionData && 
      subscriptionData.has_subscription && 
      subscriptionData.subscription && 
      subscriptionData.subscription.is_active && 
      ["paid_researcher", "paid_organizer"].includes(subscriptionData.subscription.tier)) {
    completedSteps.push("subscribed");
  }
  
  // 5. For researchers check for event participation and bookmarks
  if (userType === "researcher") {
    // Check if user has participated in any events (submitted papers)
    const { data: submissions } = await supabase
      .from("submissions")
      .select("id")
      .eq("submitted_by", userId)
      .limit(1);
    
    if (submissions && submissions.length > 0) {
      completedSteps.push("participated_in_event");
    }
    
    // Check if user has bookmarked any events
    const { data: bookmarks } = await supabase
      .from("bookmarks")
      .select("event_id")
      .eq("profile_id", userId)
      .limit(1);
    
    if (bookmarks && bookmarks.length > 0) {
      completedSteps.push("bookmarked_event");
    }
  } 
  // 6. For organizers check if they've created events
  else if (userType === "organizer") {
    const { data: events } = await supabase
      .from("events")
      .select("id")
      .eq("created_by", userId)
      .limit(1);
    
    if (events && events.length > 0) {
      completedSteps.push("created_event");
    }
  }
  
  // Calculate the completion percentage
  const completionPercentage = Math.round((completedSteps.length / steps.length) * 100);
  
  return {
    completionPercentage,
    completedSteps,
    totalSteps: steps
  };
} 