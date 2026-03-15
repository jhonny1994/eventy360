'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  AbstractSubmissionFormData,
  FullPaperSubmissionFormData,
  RevisionSubmissionFormData
} from '@/lib/schemas/submission';
import { nanoid } from 'nanoid';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { addAuthorRevisionNotes } from '@/utils/submissions/feedbackHelpers';
import { revalidateTag } from 'next/cache';

/**
 * Submits an abstract to an event
 * @param formData Abstract submission form data
 * @returns Object with success status, message, and optional error or submissionId
 */
export async function submitAbstract(
  formData: AbstractSubmissionFormData
): Promise<{ success: boolean; message: string; error?: string; submissionId?: string }> {
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations('Submissions');

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: t('notAuthenticated'), error: 'not_authenticated' };
  }

  try {
    // Prepare submission data
    const titleTranslations = {
      ar: formData.title_ar,
      en: formData.title_en || null,
      fr: formData.title_fr || null
    };

    const abstractTranslations = {
      ar: formData.abstract_ar,
      en: formData.abstract_en || null,
      fr: formData.abstract_fr || null
    };

    // First create the submission record
    const { data: submission, error: insertError } = await supabase
      .from('submissions')
      .insert({
        event_id: formData.event_id,
        submitted_by: user.id,
        title_translations: titleTranslations,
        abstract_translations: abstractTranslations,
        abstract_status: 'abstract_submitted',
        submission_date: new Date().toISOString()
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Submission error:', insertError);
      return { 
        success: false, 
        message: t('submissionError'), 
        error: insertError.message 
      };
    }

    const submissionId = submission.id;

    // 2. Upload the abstract file to storage with correct path format
    const fileExtension = formData.abstract_file.name.split('.').pop();
    const fileName = `${nanoid()}.${fileExtension}`;
    // Format: {event_id}/{submission_id}/{file_type}/v{N}/{filename}
    const filePath = `${formData.event_id}/${submissionId}/abstract/v1/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('submission_files')
      .upload(filePath, formData.abstract_file, {
        contentType: formData.abstract_file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return { 
        success: false, 
        message: t('fileUploadError'), 
        error: uploadError.message 
      };
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('submission_files')
      .getPublicUrl(filePath);

    const fileMetadata = {
      originalName: formData.abstract_file.name,
      size: formData.abstract_file.size,
      type: formData.abstract_file.type,
      lastModified: formData.abstract_file.lastModified
    };

    // 3. Update the submission with the file URL
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        abstract_file_url: publicUrl,
        abstract_file_metadata: fileMetadata
      })
      .eq('id', submissionId);

    if (updateError) {
      console.error('Update error:', updateError);
      return { 
        success: false, 
        message: t('submissionError'), 
        error: updateError.message 
      };
    }

    // Create an initial version record
    const { data: versionData, error: versionError } = await supabase
      .from('submission_versions')
      .insert({
        submission_id: submissionId,
        title_translations: titleTranslations,
        abstract_translations: abstractTranslations,
        abstract_file_url: publicUrl,
        abstract_file_metadata: fileMetadata,
        version_number: 1,
        submitted_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (versionError) {
      console.error('Version creation error:', versionError);
      // Don't fail the submission if version creation fails
      // But log it for troubleshooting
    } else if (versionData) {
      // Update the submission with the version ID
      const { error: versionUpdateError } = await supabase
        .from('submissions')
        .update({
          current_abstract_version_id: versionData.id
        })
        .eq('id', submissionId);
      
      if (versionUpdateError) {
        console.error('Error updating version ID:', versionUpdateError);
        // Don't fail the submission if this update fails
        // But log it for troubleshooting
      }
    }

    revalidateTag(`user-stats-${user.id}`, 'minutes');

    // Return the submission ID if successful
    return {
      success: true,
      message: t('submissionSuccess'),
      submissionId
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      message: t('unexpectedError'),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Submits a full paper for an approved abstract
 */
export async function submitFullPaper(
  formData: FullPaperSubmissionFormData
): Promise<{ success: boolean; message: string; error?: string; submissionId?: string }> {
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations('Submissions');

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: t('notAuthenticated'), error: 'not_authenticated' };
  }

  try {
    // Check if file exists
    if (!formData.full_paper_file) {
      return { success: false, message: t('fileRequired'), error: 'file_required' };
    }

    // 1. Get the submission and event data
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('event_id, abstract_status, submitted_by, title_translations, abstract_translations')
      .eq('id', formData.submission_id)
      .single();

    if (fetchError) {
      console.error('Error fetching submission:', fetchError);
      return {
        success: false,
        message: t('unexpectedError'),
        error: fetchError.message
      };
    }

    // Verify user owns this submission
    if (submission.submitted_by !== user.id) {
      return {
        success: false,
        message: t('notAuthenticated'),
        error: 'not_authorized'
      };
    }

    // Check if abstract was accepted
    if (submission.abstract_status !== 'abstract_accepted') {
      return {
        success: false,
        message: t('submissionError'),
        error: 'abstract_not_accepted'
      };
    }

    // 2. Upload the full paper file to storage with correct path format
    const fileExtension = formData.full_paper_file.name.split('.').pop();
    const fileName = `${nanoid()}.${fileExtension}`;
    // Format: {event_id}/{submission_id}/{file_type}/v{N}/{filename}
    const filePath = `${submission.event_id}/${formData.submission_id}/full_paper/v1/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('submission_files')
      .upload(filePath, formData.full_paper_file, {
        contentType: formData.full_paper_file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('File upload error:', uploadError);
      return { 
        success: false, 
        message: t('fileUploadError'), 
        error: uploadError.message 
      };
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('submission_files')
      .getPublicUrl(filePath);

    const fileMetadata = {
      originalName: formData.full_paper_file.name,
      size: formData.full_paper_file.size,
      type: formData.full_paper_file.type,
      lastModified: formData.full_paper_file.lastModified
    };

    // 3. Update the submission with the full paper file and change status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        full_paper_file_url: publicUrl,
        full_paper_file_metadata: fileMetadata,
        full_paper_status: 'full_paper_submitted',
        updated_at: new Date().toISOString()
      })
      .eq('id', formData.submission_id);

    if (updateError) {
      console.error('Update error:', updateError);
      return { 
        success: false, 
        message: t('fullPaperSubmissionError'), 
        error: updateError.message 
      };
    }

    // Create a new version record
    const { data: versionData, error: versionError } = await supabase
      .from('submission_versions')
      .insert({
        submission_id: formData.submission_id,
        title_translations: submission.title_translations,
        abstract_translations: submission.abstract_translations,
        full_paper_file_url: publicUrl,
        full_paper_file_metadata: fileMetadata,
        version_number: 1,
        submitted_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (versionError) {
      console.error('Version creation error:', versionError);
      // Don't fail the submission if version creation fails
      // But log it for troubleshooting
    } else if (versionData) {
      // Update the submission with the version ID
      const { error: versionUpdateError } = await supabase
        .from('submissions')
        .update({
          current_full_paper_version_id: versionData.id
        })
        .eq('id', formData.submission_id);
      
      if (versionUpdateError) {
        console.error('Error updating version ID:', versionUpdateError);
        // Don't fail the submission if this update fails
        // But log it for troubleshooting
      }
    }

    revalidateTag(`user-stats-${user.id}`, 'minutes');

    // Return the submission ID if successful
    return {
      success: true,
      message: t('fullPaperSubmissionSuccess'),
      submissionId: formData.submission_id
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return {
      success: false,
      message: t('unexpectedError'),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Submits a revised paper after receiving revision requests
 */
export async function submitRevision(
  formData: RevisionSubmissionFormData & { revision_notes?: string }
): Promise<{ success: boolean; message: string; error?: string; submissionId?: string }> {
  const supabase = await createServerSupabaseClient();
  const t = await getTranslations('Submissions');

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: t('notAuthenticated'), error: 'not_authenticated' };
  }

  try {
    // Check if file exists
    if (!formData.full_paper_file) {
      return { success: false, message: t('fileRequired'), error: 'file_required' };
    }

    // 1. Get the submission and event data
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('event_id, full_paper_status, submitted_by, current_full_paper_version_id')
      .eq('id', formData.submission_id)
      .single();

    if (fetchError) {
      return {
        success: false,
        message: t('unexpectedError'),
        error: fetchError.message
      };
    }

    // Verify user owns this submission
    if (submission.submitted_by !== user.id) {
      return {
        success: false,
        message: t('notAuthenticated'),
        error: 'not_authorized'
      };
    }

    // Check if revision was requested
    if (submission.full_paper_status !== 'revision_requested') {
      return {
        success: false,
        message: t('submissionError'),
        error: 'revision_not_requested'
      };
    }

    // Get the current version number and data
    const { data: currentVersion, error: versionFetchError } = await supabase
      .from('submission_versions')
      .select('version_number, title_translations, abstract_translations')
      .eq('id', submission.current_full_paper_version_id || '')
      .single();

    let nextVersionNumber = 1;
    let titleTranslations = {};
    let abstractTranslations = {};
    
    if (!versionFetchError && currentVersion) {
      nextVersionNumber = currentVersion.version_number + 1;
      titleTranslations = currentVersion.title_translations || {};
      abstractTranslations = currentVersion.abstract_translations || {};
    }

    // 2. Upload the revised paper file to storage with correct path format
    const fileExtension = formData.full_paper_file.name.split('.').pop();
    const fileName = `${nanoid()}.${fileExtension}`;
    // Format: {event_id}/{submission_id}/{file_type}/v{N}/{filename}
    // Use 'full_paper' as file_type for revisions since they are updated full papers
    const filePath = `${submission.event_id}/${formData.submission_id}/full_paper/v${nextVersionNumber}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('submission_files')
      .upload(filePath, formData.full_paper_file, {
        contentType: formData.full_paper_file.type,
        upsert: false
      });

    if (uploadError) {
      return { 
        success: false, 
        message: t('fileUploadError'), 
        error: uploadError.message 
      };
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('submission_files')
      .getPublicUrl(filePath);

    const fileMetadata = {
      originalName: formData.full_paper_file.name,
      size: formData.full_paper_file.size,
      type: formData.full_paper_file.type,
      lastModified: formData.full_paper_file.lastModified
    };

    // Create a new version record
    const { data: newVersion, error: versionError } = await supabase
      .from('submission_versions')
      .insert({
        submission_id: formData.submission_id,
        title_translations: titleTranslations,
        abstract_translations: abstractTranslations,
        full_paper_file_url: publicUrl,
        full_paper_file_metadata: fileMetadata,
        version_number: nextVersionNumber,
        submitted_at: new Date().toISOString()
      })
      .select('id')
      .single();

    if (versionError) {
      return {
        success: false,
        message: t('revisionSubmissionError'),
        error: versionError.message
      };
    }

    // If revision notes are provided, add them using the new helper function
    if (formData.revision_notes && formData.revision_notes.trim() !== '') {
      const notesAdded = await addAuthorRevisionNotes(
        supabase,
        formData.submission_id,
        newVersion.id,
        formData.revision_notes
      );
      
      if (!notesAdded) {
        console.error('Failed to add revision notes');
        // Don't fail the submission if adding notes fails
        // Just log it for troubleshooting
      }
    }

    // 3. Update the submission with the revised paper file and change status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        full_paper_file_url: publicUrl,
        full_paper_file_metadata: fileMetadata,
        full_paper_status: 'revision_under_review',
        current_full_paper_version_id: newVersion.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', formData.submission_id);

    if (updateError) {
      return { 
        success: false, 
        message: t('revisionSubmissionError'), 
        error: updateError.message 
      };
    }

    revalidateTag(`user-stats-${user.id}`, 'minutes');

    // Return the submission ID if successful
    return {
      success: true,
      message: t('revisionSubmissionSuccess'),
      submissionId: formData.submission_id
    };
  } catch (error) {
    return {
      success: false,
      message: t('unexpectedError'),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Redirects to the submission detail page
 */
export async function redirectToSubmission(submissionId: string, locale: string) {
  redirect(`/${locale}/profile/submissions/${submissionId}`);
} 