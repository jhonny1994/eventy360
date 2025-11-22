'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { unstable_noStore as noStore } from 'next/cache';
import { Database } from '@/database.types';

type Event = Database['public']['Functions']['discover_events']['Returns'][0];

/**
 * Toggle a bookmark for an event
 * If the event is already bookmarked, it will be unbookmarked and vice versa
 * 
 * @param eventId The ID of the event to toggle bookmark for
 * @returns Object with success status, message, and bookmarked status
 */
export async function toggleBookmark(
  eventId: string
): Promise<{ success: boolean; message: string; error?: string; isBookmarked: boolean }> {
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations('Bookmarks');

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { 
      success: false, 
      message: t('notAuthenticated'), 
      error: 'not_authenticated',
      isBookmarked: false
    };
  }

  try {
    // Check if the event is already bookmarked
    const { data: existingBookmark, error: fetchError } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('profile_id', user.id)
      .eq('event_id', eventId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching bookmark:', fetchError);
      return { 
        success: false, 
        message: t('fetchError'), 
        error: fetchError.message,
        isBookmarked: false
      };
    }

    // If bookmark exists, delete it; otherwise, create it
    if (existingBookmark) {
      const { error: deleteError } = await supabase
        .from('bookmarks')
        .delete()
        .eq('profile_id', user.id)
        .eq('event_id', eventId);

      if (deleteError) {
        console.error('Error removing bookmark:', deleteError);
        return { 
          success: false, 
          message: t('removeError'), 
          error: deleteError.message,
          isBookmarked: true // Still bookmarked since deletion failed
        };
      }

      return {
        success: true,
        message: t('removeSuccess'),
        isBookmarked: false
      };
    } else {
      const { error: insertError } = await supabase
        .from('bookmarks')
        .insert({
          profile_id: user.id,
          event_id: eventId
        });

      if (insertError) {
        console.error('Error adding bookmark:', insertError);
        return { 
          success: false, 
          message: t('addError'), 
          error: insertError.message,
          isBookmarked: false
        };
      }

      return {
        success: true,
        message: t('addSuccess'),
        isBookmarked: true
      };
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      message: t('unexpectedError'),
      error: error instanceof Error ? error.message : 'Unknown error',
      isBookmarked: false
    };
  }
}

/**
 * Check if an event is bookmarked by the current user
 * 
 * @param eventId The ID of the event to check
 * @returns Boolean indicating if the event is bookmarked
 */
export async function isEventBookmarked(
  eventId: string
): Promise<boolean> {
  noStore(); // Disable caching to ensure fresh data
  const supabase = await createServerSupabaseClient();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('profile_id', user.id)
      .eq('event_id', eventId)
      .maybeSingle();

    if (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Unexpected error checking bookmark status:', error);
    return false;
  }
}

/**
 * Get all bookmarked events for the current user
 * 
 * @param locale The current locale
 * @returns Array of bookmarked events
 */
export async function getBookmarkedEvents(
  locale: string
): Promise<{ events: Event[]; error?: string }> {
  noStore(); // Disable caching to ensure fresh data
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations({ locale, namespace: 'Bookmarks' });
  
  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { events: [], error: t('notAuthenticated') };
  }

  try {
    // Check if user is a researcher
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || profile.user_type !== 'researcher') {
      return { events: [], error: t('notAuthorized') };
    }

    // Get all bookmarked event IDs
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('event_id')
      .eq('profile_id', user.id);

    if (bookmarksError) {
      console.error('Error fetching bookmarks:', bookmarksError);
      return { events: [], error: t('fetchError') };
    }

    if (!bookmarks || bookmarks.length === 0) {
      return { events: [] };
    }

    // Extract event IDs
    const eventIds = bookmarks.map(bookmark => bookmark.event_id);

    // Use discover_events RPC with correct parameters
    // Note: We pass an empty search_query as we're filtering by IDs
    const { data: events, error: eventsError } = await supabase
      .rpc('discover_events', {
        search_query: '',
        topic_ids: [],
        wilaya_id_param: undefined,
        daira_id_param: undefined,
        start_date: undefined,
        end_date: undefined,
        event_status_filter: undefined,
        event_format_filter: undefined,
        p_organizer_id: undefined,
        limit_count: 100,
        offset_count: 0
      })
      .in('id', eventIds);

    if (eventsError) {
      console.error('Error fetching events:', eventsError);
      return { events: [], error: t('fetchError') };
    }
    
    return { events: events || [] };
  } catch (error) {
    console.error('Unexpected error fetching bookmarked events:', error);
    return { 
      events: [], 
      error: t('unexpectedError')
    };
  }
} 