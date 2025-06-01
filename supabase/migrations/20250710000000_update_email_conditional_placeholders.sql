-- Migration to add support for conditional Mustache syntax in email templates
-- This is part of the notification system cleanup project to address the conditional placeholder issue

-- Add COMMENT to document the send-email function update
COMMENT ON DATABASE postgres IS 'The send-email Edge Function has been updated to support conditional Mustache placeholders ({{#section}}...{{/section}}) as of 2025-07-10.

Key changes:
1. Added support for conditional blocks like {{#feedback}}...{{/feedback}}
2. Implemented nested property traversal for the feedback object (e.g., feedback.en, feedback.fr, feedback.ar)
3. Maintained backward compatibility with existing templates
4. Does not require any changes to existing SQL functions or templates

Usage Guidelines:
- Conditional blocks should use the syntax {{#section}}...{{/section}}
- The section name must match a property in the payload_data object
- If the property exists and is truthy, the content will be included
- If the property is falsy or does not exist, the content will be omitted
- Nested properties can be accessed using dot notation (e.g., {{feedback.en}})

Example usage:
```sql
jsonb_build_object(
    ''en'', ''<p>{{#feedback}}<p><strong>Reviewer Feedback:</strong></p><p>{{feedback.en}}</p>{{/feedback}}</p>''
)
```

This migration does not include SQL changes as the implementation is in the Edge Function code.';

-- Update SQL function template to properly document feedback handling in submission notification functions
CREATE OR REPLACE FUNCTION public.handle_submission_feedback(
  submission_id uuid,
  feedback_text jsonb,
  decision_status text
) RETURNS void AS $$
DECLARE
  submission_record RECORD;
  researcher_id uuid;
  event_id uuid;
  submission_title jsonb;
  event_name jsonb;
  template_key text;
  payload jsonb;
BEGIN
  -- Get submission details
  SELECT s.researcher_profile_id, s.event_id, s.title, e.name
  INTO researcher_id, event_id, submission_title, event_name
  FROM public.submissions s
  JOIN public.events e ON s.event_id = e.id
  WHERE s.id = submission_id;
  
  -- Determine template key based on decision status
  CASE decision_status
    WHEN 'accepted' THEN
      template_key := 'abstract_accepted_notification';
    WHEN 'rejected' THEN
      template_key := 'abstract_rejected_notification';
    WHEN 'revisions_requested' THEN
      template_key := 'revision_requested_notification';
    ELSE
      RAISE EXCEPTION 'Invalid decision status: %', decision_status;
  END CASE;
  
  -- Build the payload with base fields
  payload := jsonb_build_object(
    'event_id', event_id,
    'submission_id', submission_id,
    'event_name', event_name,
    'submission_title', submission_title
  );
  
  -- Add feedback to the payload only if it exists
  IF feedback_text IS NOT NULL AND feedback_text != '{}'::jsonb THEN
    payload := payload || jsonb_build_object('feedback', feedback_text);
  END IF;
  
  -- Create notification with conditional feedback
  -- The send-email Edge Function will conditionally include the feedback
  -- section if it exists in the payload
  INSERT INTO public.notification_queue (
    template_key,
    recipient_profile_id,
    notification_type,
    payload_data,
    status
  ) VALUES (
    template_key,
    researcher_id,
    'immediate',
    payload,
    'pending'
  );
  
  -- Update submission status
  UPDATE public.submissions
  SET status = decision_status, 
      updated_at = NOW(),
      feedback = feedback_text
  WHERE id = submission_id;
END;
$$ LANGUAGE plpgsql;

-- Add comment to document this migration
COMMENT ON MIGRATION IS 'Add support for conditional Mustache placeholders in email templates'; 