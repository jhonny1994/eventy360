# Submission Feedback Migration Plan

## Overview

This plan outlines the implementation of a dedicated `submission_feedback` table to replace the use of JSONB fields for storing feedback in the Eventy360 platform. The new approach will improve data structure, queryability, and maintainability.

## Key Points

- **No existing data migration needed**
- **Simple text feedback (no localization required)**
- **Support for three types of notes: abstract, full paper, and revisions**
- **Minimal code changes with focused updates**
- **Use existing hooks (useAuth, useTranslations, useLocale) for integration**
- **Update email notification system to work with new feedback format**
- **Avoid duplicate notifications by relying on existing triggers**

## Phase 1: Database Schema Implementation

### 1. Create `submission_feedback` Table ✅

- [x] Create the `submission_feedback` table with the following structure:
```sql
-- Create a dedicated submission_feedback table
CREATE TABLE public.submission_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_version_id UUID NOT NULL REFERENCES public.submission_versions(id) ON DELETE CASCADE,
    providing_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    role_at_submission public.user_type_enum NOT NULL, -- Using existing enum type
    feedback_content TEXT NOT NULL,    -- The actual feedback text
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

- [x] Create indexes for better performance
- [x] Create trigger for updated_at column
- [x] Set up RLS policies

### 2. Update Database Functions ✅

Update existing functions to use the new table:

- [x] Modify `review_abstract` function to use `submission_feedback` table
- [x] Modify `review_full_paper` function to use `submission_feedback` table
- [x] Remove `feedback_translations` references in functions
- [x] Update `handle_submission_feedback` to work with TEXT feedback:
  ```sql
  CREATE OR REPLACE FUNCTION public.handle_submission_feedback(
      submission_id UUID,
      feedback_text TEXT,
      decision_status VARCHAR
  ) RETURNS VOID AS $$
  BEGIN
      -- Wrap the plain text feedback in a JSONB object for email templates
      PERFORM manage_submission_notification(
          submission_id, 
          decision_status,
          jsonb_build_object('content', feedback_text)
      );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

- [x] Modify `review_abstract` and `review_full_paper` to call `handle_submission_feedback`
  ```sql
  -- Inside review_abstract function
  PERFORM handle_submission_feedback(
      p_submission_id,
      NULLIF(p_feedback, ''), -- Convert empty string to NULL
      p_status::VARCHAR
  );

  -- Inside review_full_paper function (similar)
  PERFORM handle_submission_feedback(
      p_submission_id,
      NULLIF(p_feedback, ''), -- Convert empty string to NULL
      p_status::VARCHAR
  );
  ```

### 3. Update Email Templates ✅

- [x] Update email templates to use the new feedback structure:
  - [x] Modify `abstract_accepted_notification`, `abstract_rejected_notification` templates
  - [x] Modify `full_paper_accepted_notification`, `full_paper_rejected_notification`, `revision_requested_notification` templates
  - [x] Change template references from `{{feedback.ar}}`, `{{feedback.en}}`, etc. to `{{feedback.content}}`
  - [x] Ensure each template uses the pattern: `{{#feedback}}<p>{{feedback.content}}</p>{{/feedback}}` to properly display feedback

### 4. Update Additional Database Functions ✅

- [x] Update `track_submission_versions` function to stop copying feedback columns:
  ```sql
  CREATE OR REPLACE FUNCTION track_submission_versions() 
  RETURNS TRIGGER AS $$
  BEGIN
    -- Function logic without copying feedback_translations
    -- Rest of the function remains the same
    -- ...
  END;
  $$ LANGUAGE plpgsql;
  ```

- [x] Update `submit_revision` function to use `add_author_revision_notes`:
  ```sql
  CREATE OR REPLACE FUNCTION public.submit_revision(
      p_submission_id UUID,
      p_full_paper_file_url TEXT,
      p_full_paper_file_metadata JSONB,
      p_revision_notes TEXT DEFAULT NULL
  ) RETURNS UUID AS $$
  DECLARE
      v_new_version_number INTEGER;
      v_version_id UUID;
      -- Other variables...
  BEGIN
      -- Existing logic for submission validation and version creation
      -- ...
      
      -- After creating the new version, if revision notes are provided
      IF p_revision_notes IS NOT NULL AND p_revision_notes != '' THEN
          PERFORM add_author_revision_notes(
              p_submission_id,
              v_version_id,
              p_revision_notes
          );
      END IF;
      
      -- Rest of the function
      -- ...
      
      RETURN v_version_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  ```

### 5. Remove Old Columns (After All Code is Updated) ✅

- [x] Create a migration to drop the old feedback columns:
  ```sql
  -- Drop the old feedback columns
  ALTER TABLE public.submission_versions DROP COLUMN IF EXISTS feedback_translations;
  ALTER TABLE public.submissions DROP COLUMN IF EXISTS review_feedback_translations;
  
  -- Also consider removing other feedback-related columns if they're no longer needed
  -- ALTER TABLE public.submissions DROP COLUMN IF EXISTS feedback_history;
  ```

## Phase 2: Application Code Updates

### 1. Create Feedback Helper Utility ✅

- [x] Create a new utility file: `src/utils/submissions/feedbackHelpers.ts`
  ```typescript
  import { SupabaseClient } from '@supabase/supabase-js';
  import { Database } from '@/database.types';

  // Define types for feedback
  export interface FeedbackItem {
    id: string;
    providing_user_id: string | null;
    role_at_submission: string; 
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
  ```

### 2. Update Server Actions ✅

- [x] Update `src/app/[locale]/profile/submissions/actions.ts`:
  - [x] Modify `submitRevision` function to use `submission_feedback` table for author notes
  - [x] Ensure `title_translations` and `abstract_translations` are copied from previous version
  - [x] Set `full_paper_status` to 'revision_under_review'
  - [x] Update `current_full_paper_version_id` to point to the newly created version
  - [x] Remove references to `feedback_translations`

### 3. Update UI Components

- [x] Update `src/app/[locale]/profile/submissions/[id]/page.tsx`:
  - [x] Fetch feedback from new table using `getFeedbackForVersion`
  - [x] Update feedback display to show feedback items from the database
  - [x] Maintain consistent UI appearance
  - [x] Add visual distinctions between organizer and researcher feedback items (different colors and icons)

- [x] Update `src/app/[locale]/profile/submissions/ui/RevisionUploadSection.tsx`:
  - [x] Fetch feedback from new table
  - [x] Update feedback display to show the most recent organizer feedback
  - [x] Update props to use `feedback_items` instead of `review_feedback_translations`
  - [x] Improve UI with consistent styling

- [x] Update `src/components/submissions/RevisionReviewComponent.tsx`:
  - [x] Update how reviewer feedback is submitted
  - [x] Ensure feedback is collected as plain text
  - [x] Display previous feedback from the new system

- [x] Update `src/components/submissions/FullPaperReviewComponent.tsx`:
  - [x] Update how full paper review feedback is submitted
  - [x] Modify form to collect single-language feedback
  - [x] Remove language tabs if present
  - [x] Add proper feedback display from the new system

- [x] Update `src/components/submissions/AbstractReviewComponent.tsx`:
  - [x] Update how abstract review feedback is submitted
  - [x] Modify form to collect single-language feedback
  - [x] Remove language tabs if present
  - [x] Add previous feedback display

## Phase 3: Testing & Deployment

### 1. Testing

- [x] Test abstract submission and feedback
- [x] Test full paper submission and feedback
- [x] Test revision submission and notes
- [x] Test feedback display in all relevant views
- [x] **Test email notifications for all submission status changes**:
  - [x] Abstract accepted/rejected
  - [x] Full paper accepted/rejected
  - [x] Revision requested
  - [x] Ensure feedback appears correctly in emails

### 2. Deployment

- [x] Deploy database changes first
  - [x] Create `submission_feedback` table
  - [x] Update functions including `handle_submission_feedback`
- [x] Update email templates
- [x] Deploy application code changes
- [x] Verify all functionality in production
- [x] **Monitor email notification delivery and content**

## Affected Files

### Database Files ✅
- [x] New migration: `supabase/migrations/20250801000000_create_submission_feedback_table.sql`
- [x] New migration: `supabase/migrations/20250802000000_update_submission_functions.sql`
- [x] New migration: `supabase/migrations/20250803000000_drop_old_feedback_columns.sql`
- [x] New migration: `supabase/migrations/20250804000000_update_email_templates.sql`
- [x] New migration: `supabase/migrations/20250803000000_add_revision_under_review_status.sql`

### Email Template Files ✅
- [x] Updated via migration: `abstract_accepted_notification`
- [x] Updated via migration: `abstract_rejected_notification`
- [x] Updated via migration: `full_paper_accepted_notification`
- [x] Updated via migration: `full_paper_rejected_notification`
- [x] Updated via migration: `revision_requested_notification`

### Application Files ✅
- [x] `src/utils/submissions/feedbackHelpers.ts` (new)
- [x] `src/app/[locale]/profile/submissions/actions.ts`
- [x] `src/app/[locale]/profile/submissions/[id]/page.tsx`
- [x] `src/app/[locale]/profile/submissions/ui/RevisionUploadSection.tsx`
- [x] `src/components/submissions/RevisionReviewComponent.tsx`
- [x] `src/components/submissions/FullPaperReviewComponent.tsx`
- [x] `src/components/submissions/AbstractReviewComponent.tsx`

## Implementation Notes

- Focus on minimal changes to maintain existing functionality
- Use existing hooks for authentication and context
- Keep the same UI appearance to minimize disruption
- Ensure feedback is associated with the correct submission version
- Handle the transition gracefully without disrupting existing users 
- Ensure email notification templates are updated to use the new feedback structure
- Implement thorough testing of the email notification flow with the new feedback structure

## Progress Update (August 3, 2023)

### Completed Items:
1. **Database Schema Implementation**: 
   - Created `submission_feedback` table with indexes, triggers, and RLS policies
   - Updated all database functions to use the new table
   - Added new `get_feedback_for_version` and `add_author_revision_notes` functions

2. **Submission Status Enum Enhancement**:
   - Added `revision_under_review` status to the enum for better tracking
   - Updated comment to include the new status

3. **Server Actions**:
   - Updated `submitRevision` function to:
     - Copy `title_translations` and `abstract_translations` from previous version
     - Set status to `revision_under_review` instead of `full_paper_submitted`
     - Update `current_full_paper_version_id` to point to the new version
   - Updated `submitAbstract` and `submitFullPaper` to properly maintain version IDs
   - Added integration with `addAuthorRevisionNotes` function

4. **Utility Implementation**:
   - Created `feedbackHelpers.ts` utility with functions for:
     - `getFeedbackForVersion`: Retrieves feedback for a specific version
     - `createFeedback`: Creates new feedback entries
     - `addAuthorRevisionNotes`: Adds author notes during revision submission

5. **UI Enhancements**:
   - Updated submission details page to display feedback items
   - Improved feedback display with proper formatting and metadata
   - Updated all review components to use the new feedback system:
     - AbstractReviewComponent: Now uses plain text feedback and displays previous feedback items
     - FullPaperReviewComponent: Now handles single-language feedback and shows feedback history
     - RevisionReviewComponent: Properly integrates with the new feedback system

6. **Testing**:
   - Verified all submission workflows with the new feedback system
   - Confirmed email notifications work correctly with the new feedback format
   - Tested display of feedback in various UI components

7. **Deployment**:
   - Successfully deployed all database changes and migrations
   - Updated application code with new components and utility functions
   - Verified functionality in the production environment

### Integration Notes:
The transition from JSONB-based feedback to the structured `submission_feedback` table has been completed successfully. The changes maintain backwards compatibility while significantly improving the data structure and user experience.

## Migration Execution Sequence

To ensure a smooth transition, the migration was executed in the following order:

1. **First Migration (`20250801000000_create_submission_feedback_table.sql`)** ✅
   - Create the `submission_feedback` table with indexes, triggers, and RLS policies
   - Update `review_abstract` and `review_full_paper` to store feedback in the new table
   - Create helper functions for feedback management (`get_feedback_for_version`, `add_author_revision_notes`)
   - These functions no longer call `handle_submission_feedback` directly, avoiding duplicate notifications

2. **Second Migration (`20250802000000_update_submission_functions.sql`)** ✅
   - Update `track_submission_versions` to stop copying feedback columns
   - Update `submit_revision` to accept revision notes and use `add_author_revision_notes`
   - Update `notify_submission_status_change` to fetch feedback from the new table
   - This is the critical function that now reads from `submission_feedback` to build email notifications

3. **Add Revision Under Review Status (`20250803000000_add_revision_under_review_status.sql`)** ✅
   - Add the missing `revision_under_review` status to the submission_status_enum
   - Update the comment to include the new status

4. **Email Template Updates** ✅
   - Update email templates to use `{{feedback.content}}` before proceeding to the final step

5. **Final Migration (`20250803000000_drop_old_feedback_columns.sql`)** ✅
   - Remove the old columns after verifying that all code no longer uses them:
     - `feedback_translations` from `submission_versions`
     - `review_feedback_translations` from `submissions`
     - `feedback_history` from `submissions`

This sequential approach ensured that all database functions and application code were updated to use the new structure before removing the old columns, minimizing the risk of disruptions.

## Status: ✅ COMPLETED

The submission feedback system migration has been successfully completed. All components have been updated to use the new structured approach, providing better organization, queryability, and maintainability for submission feedback. 