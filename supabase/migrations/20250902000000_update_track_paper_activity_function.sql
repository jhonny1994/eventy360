-- Update track_paper_activity function to use auth.uid() directly
-- This improves security by ensuring users can only track their own activity

-- Drop the existing function
DROP FUNCTION IF EXISTS "public"."track_paper_activity"("p_submission_id" "uuid", "p_user_id" "uuid", "p_action_type" "text");

-- Create the updated function that uses auth.uid() directly
CREATE OR REPLACE FUNCTION "public"."track_paper_activity"(
    "p_submission_id" "uuid", 
    "p_action_type" "text"
) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_id UUID;
BEGIN
  -- Ensure the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Insert the record using auth.uid() directly
  INSERT INTO public.paper_analytics(submission_id, user_id, action_type)
  VALUES (p_submission_id, auth.uid(), p_action_type)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Grant necessary permissions
ALTER FUNCTION "public"."track_paper_activity"("p_submission_id" "uuid", "p_action_type" "text") OWNER TO "postgres";
COMMENT ON FUNCTION "public"."track_paper_activity" IS 'Records paper view or download activity in the analytics table using the authenticated user ID'; 