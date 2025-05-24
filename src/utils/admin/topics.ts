import { createClient } from '@/lib/supabase/client';
import { generateSlug, TopicFormData } from '@/lib/schemas/topicSchema';

// Define error keys for translations
export const TOPIC_ERROR_KEYS = {
  SLUG_EXISTS: 'AdminTopics.errors.slugExists',
  UNEXPECTED: 'AdminTopics.errors.unexpected',
  DELETE_FAILED: 'AdminTopics.errors.deleteFailed',
  UPDATE_FAILED: 'AdminTopics.errors.updateFailed',
  CREATE_FAILED: 'AdminTopics.errors.createFailed'
};

type AdminActionType = 'admin_topic_create' | 'admin_topic_update' | 'admin_topic_delete';
type ActionDetails = { 
  topic_name: string; 
  slug: string; 
  [key: string]: string | number | boolean | null 
};

/**
 * Creates a new topic in the database
 * 
 * @param data Topic form data with name translations
 * @param errorKeys Optional object with translated error messages
 * @returns Object with success status and topic ID or error message
 */
export async function createTopic(
  data: TopicFormData,
  errorKeys: { [key: string]: string } = TOPIC_ERROR_KEYS
) {
  const supabase = createClient();
  
  try {
    // Generate slug if not provided
    const slug = data.slug || generateSlug(data.name_translations.ar, false);
    
    // Start a transaction
    const { data: newTopic, error: insertError } = await supabase
      .from('topics')
      .insert({
        name_translations: data.name_translations,
        slug
      })
      .select('id')
      .single();
    
    if (insertError) {
      // Check for slug uniqueness violation
      if (insertError.code === '23505') {
        return { success: false, error: errorKeys.SLUG_EXISTS || 'A topic with this slug already exists.' };
      }
      throw insertError;
    }
    
    // Log the action
    await logTopicAction('admin_topic_create', newTopic.id, {
      topic_name: data.name_translations.ar,
      slug
    });
    
    return { success: true, topicId: newTopic.id };
  } catch (error) {
    console.error('Error creating topic:', error);
    return { 
      success: false, 
      error: errorKeys.CREATE_FAILED || (error instanceof Error ? error.message : 'An unexpected error occurred')
    };
  }
}

/**
 * Updates an existing topic in the database
 * 
 * @param topicId The ID of the topic to update
 * @param data Updated topic form data
 * @param errorKeys Optional object with translated error messages
 * @returns Object with success status and topic ID or error message
 */
export async function updateTopic(
  topicId: string, 
  data: TopicFormData,
  errorKeys: { [key: string]: string } = TOPIC_ERROR_KEYS
) {
  const supabase = createClient();
  
  try {
    // Generate slug if Arabic name was changed
    const slug = data.slug || generateSlug(data.name_translations.ar, false);
    
    // Update the topic
    const { error: updateError } = await supabase
      .from('topics')
      .update({
        name_translations: data.name_translations,
        slug
      })
      .eq('id', topicId);
    
    if (updateError) {
      // Check for slug uniqueness violation
      if (updateError.code === '23505') {
        return { success: false, error: errorKeys.SLUG_EXISTS || 'A topic with this slug already exists.' };
      }
      throw updateError;
    }
    
    // Log the action
    await logTopicAction('admin_topic_update', topicId, {
      topic_name: data.name_translations.ar,
      slug
    });
    
    return { success: true, topicId };
  } catch (error) {
    console.error('Error updating topic:', error);
    return { 
      success: false, 
      error: errorKeys.UPDATE_FAILED || (error instanceof Error ? error.message : 'An unexpected error occurred')
    };
  }
}

/**
 * Deletes a topic from the database
 * 
 * @param topicId The ID of the topic to delete
 * @param topicInfo Optional object containing topic information for logging
 * @param errorKeys Optional object with translated error messages
 * @returns Object with success status or error message
 */
export async function deleteTopic(
  topicId: string, 
  topicInfo?: { name: string, slug: string },
  errorKeys: { [key: string]: string } = TOPIC_ERROR_KEYS
) {
  const supabase = createClient();
  
  try {
    // Get topic info for logging if not provided
    let logInfo = topicInfo;
    if (!logInfo) {
      const { data: topic, error: fetchError } = await supabase
        .from('topics')
        .select('name_translations, slug')
        .eq('id', topicId)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Safely access the Arabic name with type checking
      const nameTranslations = topic.name_translations as { ar?: string } | null;
      const arName = nameTranslations && nameTranslations.ar ? nameTranslations.ar : 'Unknown';
      
      logInfo = {
        name: arName,
        slug: topic.slug
      };
    }
    
    // Delete the topic
    const { error: deleteError } = await supabase
      .from('topics')
      .delete()
      .eq('id', topicId);
    
    if (deleteError) throw deleteError;
    
    // Log the action
    await logTopicAction('admin_topic_delete', topicId, {
      topic_name: logInfo.name,
      slug: logInfo.slug
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting topic:', error);
    return { 
      success: false, 
      error: errorKeys.DELETE_FAILED || (error instanceof Error ? error.message : 'An unexpected error occurred')
    };
  }
}

/**
 * Gets the usage count of a topic (events and subscriptions)
 * 
 * @param topicId The ID of the topic
 * @returns Object with counts for events and subscriptions
 */
export async function getTopicUsage(topicId: string) {
  const supabase = createClient();
  
  try {
    // Count events using this topic
    const { count: eventCount, error: eventError } = await supabase
      .from('event_topics')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId);
    
    if (eventError) throw eventError;
    
    // Count researcher subscriptions to this topic
    const { count: subscriptionCount, error: subError } = await supabase
      .from('researcher_topic_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId);
    
    if (subError) throw subError;
    
    return { 
      success: true, 
      eventCount: eventCount || 0, 
      subscriptionCount: subscriptionCount || 0 
    };
  } catch (error) {
    console.error('Error getting topic usage:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      eventCount: 0,
      subscriptionCount: 0 
    };
  }
}

/**
 * Logs an admin action related to topics
 * 
 * @param actionType The type of action performed
 * @param recordId The ID of the affected record (optional)
 * @param details Additional details about the action
 */
async function logTopicAction(
  actionType: AdminActionType, 
  recordId?: string, 
  details?: ActionDetails
) {
  const supabase = createClient();
  
  try {
    // Get the current user ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No authenticated user found when trying to log topic action');
      return;
    }
    
    await supabase
      .from('admin_actions_log')
      .insert({
        action_type: actionType,
        admin_user_id: user.id,
        target_entity_id: recordId,
        target_entity_type: 'topics',
        details
      });
  } catch (error) {
    console.error('Error logging topic action:', error);
    // We don't want to fail the main operation if logging fails
  }
}

/**
 * Checks if a topic with the given slug already exists
 * 
 * @param slug The slug to check
 * @param excludeTopicId Optional topic ID to exclude from the check (for updates)
 * @returns Boolean indicating if the slug exists
 */
export async function topicSlugExists(slug: string, excludeTopicId?: string) {
  const supabase = createClient();
  
  try {
    let query = supabase
      .from('topics')
      .select('id')
      .eq('slug', slug);
    
    // Exclude the current topic when updating
    if (excludeTopicId) {
      query = query.neq('id', excludeTopicId);
    }
    
    const { data, error } = await query.maybeSingle();
    
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking topic slug:', error);
    // Default to true (slug exists) in case of error to prevent duplicates
    return true;
  }
} 