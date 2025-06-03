-- Update the review_abstract function to use text feedback and submission_feedback table
CREATE OR REPLACE FUNCTION "public"."review_abstract"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback" "text") RETURNS boolean
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
  v_event_organizer UUID;
  v_current_status public.submission_status_enum;
  v_version_id UUID;
BEGIN
  -- Check if the submission exists and get its current status
  SELECT s.event_id, e.created_by, s.abstract_status, s.current_abstract_version_id
  INTO v_event_id, v_event_organizer, v_current_status, v_version_id
  FROM public.submissions s
  JOIN public.events e ON s.event_id = e.id
  WHERE s.id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- Check if the user is the event organizer
  IF auth.uid() != v_event_organizer THEN
    RAISE EXCEPTION 'Only the event organizer can review abstracts';
  END IF;

  -- Check if the current status allows for review
  IF v_current_status != 'abstract_submitted' THEN
    RAISE EXCEPTION 'Abstract is not in a reviewable state';
  END IF;

  -- Check if the new status is valid for abstract review
  IF p_status NOT IN ('abstract_accepted', 'abstract_rejected') THEN
    RAISE EXCEPTION 'Invalid status for abstract review';
  END IF;

  -- Update the submission status
  UPDATE public.submissions
  SET
    abstract_status = p_status,
    status = p_status
  WHERE id = p_submission_id;

  -- Insert feedback into the submission_feedback table
  IF p_feedback IS NOT NULL AND p_feedback != '' THEN
    INSERT INTO public.submission_feedback (
      submission_version_id,
      providing_user_id,
      role_at_submission,
      feedback_content
    ) VALUES (
      v_version_id,
      auth.uid(),
      COALESCE((SELECT user_type FROM public.profiles WHERE id = auth.uid()), 'organizer'),
      p_feedback
    );
  END IF;

  RETURN TRUE;
END;
$$;

-- Update the review_full_paper function to use text feedback and submission_feedback table
CREATE OR REPLACE FUNCTION "public"."review_full_paper"("p_submission_id" "uuid", "p_status" "public"."submission_status_enum", "p_feedback" "text") RETURNS boolean
LANGUAGE "plpgsql" SECURITY DEFINER
AS $$
DECLARE
  v_event_id UUID;
  v_event_organizer UUID;
  v_current_status public.submission_status_enum;
  v_version_id UUID;
BEGIN
  -- Check if the submission exists and get its current status
  SELECT s.event_id, e.created_by, s.full_paper_status, s.current_full_paper_version_id
  INTO v_event_id, v_event_organizer, v_current_status, v_version_id
  FROM public.submissions s
  JOIN public.events e ON s.event_id = e.id
  WHERE s.id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- Check if the user is the event organizer
  IF auth.uid() != v_event_organizer THEN
    RAISE EXCEPTION 'Only the event organizer can review papers';
  END IF;

  -- Check if the current status allows for review
  IF v_current_status NOT IN ('full_paper_submitted', 'revision_requested', 'revision_under_review') THEN
    RAISE EXCEPTION 'Paper is not in a reviewable state';
  END IF;

  -- Check if the new status is valid for full paper review
  IF p_status NOT IN ('full_paper_accepted', 'full_paper_rejected', 'revision_requested') THEN
    RAISE EXCEPTION 'Invalid status for full paper review';
  END IF;

  -- Update the submission status
  UPDATE public.submissions
  SET
    full_paper_status = p_status,
    status = p_status
  WHERE id = p_submission_id;

  -- Insert feedback into the submission_feedback table
  IF p_feedback IS NOT NULL AND p_feedback != '' THEN
    INSERT INTO public.submission_feedback (
      submission_version_id,
      providing_user_id,
      role_at_submission,
      feedback_content
    ) VALUES (
      v_version_id,
      auth.uid(),
      COALESCE((SELECT user_type FROM public.profiles WHERE id = auth.uid()), 'organizer'),
      p_feedback
    );
  END IF;

  RETURN TRUE;
END;
$$; 