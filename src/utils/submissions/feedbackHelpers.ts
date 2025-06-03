import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/database.types';

// Define types for feedback
export interface FeedbackItem {
  id: string;
  providing_user_id: string | null;
  role_at_submission: 'researcher' | 'organizer' | 'admin'; 
  feedback_content: string;
  created_at: string;
  provider_name?: string;
}

/**
 * Gets all feedback for a specific submission version
 */
export async function getFeedbackForVersion(
  supabase: SupabaseClient<Database>,
  versionId: string
): Promise<FeedbackItem[] | null> {
  const { data, error } = await supabase
    .rpc('get_feedback_for_version', { p_version_id: versionId });
  
  if (error) {
    console.error('Error fetching feedback:', error);
    return null;
  }
  
  return data as FeedbackItem[];
}

/**
 * Creates a new feedback entry for a submission version
 */
export async function createFeedback(
  supabase: SupabaseClient<Database>,
  versionId: string,
  feedback: string,
  role: 'organizer' | 'researcher'
): Promise<boolean> {
  const { error } = await supabase
    .from('submission_feedback')
    .insert({
      submission_version_id: versionId,
      feedback_content: feedback,
      role_at_submission: role
    });
  
  if (error) {
    console.error('Error creating feedback:', error);
    return false;
  }
  
  return true;
}

/**
 * Adds author notes when submitting a revision
 * This is a wrapper around the add_author_revision_notes RPC function
 */
export async function addAuthorRevisionNotes(
  supabase: SupabaseClient<Database>,
  submissionId: string,
  versionId: string,
  notes: string
): Promise<boolean> {
  const { error } = await supabase
    .rpc('add_author_revision_notes', {
      p_submission_id: submissionId,
      p_version_id: versionId,
      p_notes: notes
    });
  
  if (error) {
    console.error('Error adding revision notes:', error);
    return false;
  }
  
  return true;
}

/**
 * Get the most recent feedback for a submission 
 * Useful for displaying the latest reviewer feedback
 */
export async function getLatestFeedback(
  supabase: SupabaseClient<Database>,
  versionId: string,
  role: 'researcher' | 'organizer' | null = null
): Promise<FeedbackItem | null> {
  const query = supabase
    .rpc('get_feedback_for_version', { p_version_id: versionId });
  
  // If role is specified, filter by role
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching latest feedback:', error);
    return null;
  }
  
  if (!data || data.length === 0) {
    return null;
  }

  // Data is already ordered by created_at DESC from the function
  if (role) {
    const filteredData = data.filter(item => item.role_at_submission === role);
    return filteredData.length > 0 ? filteredData[0] as FeedbackItem : null;
  }
  
  return data[0] as FeedbackItem;
} 