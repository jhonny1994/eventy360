-- Migration to add the get_daira_name helper function

-- Create a helper function to get the appropriate daira name based on locale
CREATE OR REPLACE FUNCTION "public"."get_daira_name"("p_daira_id" integer, "p_locale" text DEFAULT 'en') 
RETURNS text LANGUAGE plpgsql AS $$
BEGIN
    IF p_locale = 'ar' THEN
        RETURN (SELECT name_ar FROM dairas WHERE id = p_daira_id);
    ELSE
        RETURN (SELECT name_other FROM dairas WHERE id = p_daira_id);
    END IF;
END;
$$;

-- Grant necessary permissions
ALTER FUNCTION "public"."get_daira_name"("p_daira_id" integer, "p_locale" text) OWNER TO "postgres";
COMMENT ON FUNCTION "public"."get_daira_name" IS 'Returns the appropriate daira name based on the provided locale'; 