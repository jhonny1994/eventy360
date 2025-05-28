-- Add venue column to events table
ALTER TABLE "public"."events" ADD COLUMN "venue" text DEFAULT NULL;

-- Add comment to venue column
COMMENT ON COLUMN "public"."events"."venue" IS 'Physical location where the event will be held.';
