import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/database.types';

/**
 * Tracks a paper download event in the analytics system
 * 
 * @param supabase - The authenticated Supabase client
 * @param submissionId - The ID of the paper/submission being downloaded
 * @returns A promise that resolves when tracking is complete
 * @throws Will throw an error if tracking fails
 */
export async function trackPaperDownload(
  supabase: SupabaseClient<Database>,
  submissionId: string
): Promise<void> {
  if (!submissionId) {
    throw new Error('Missing submission ID');
  }

  try {
    const { error } = await supabase.rpc('track_paper_activity', {
      p_submission_id: submissionId,
      p_action_type: 'download'
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error tracking paper download:', error);
    throw error;
  }
} 