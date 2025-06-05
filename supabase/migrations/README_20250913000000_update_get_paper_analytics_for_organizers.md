# Migration: Update Paper Analytics Functions for Organizers

## Purpose
This migration fixes an issue where organizers were unable to view paper statistics on the paper details page, even for papers from events they created. This happens because the `get_paper_analytics` and `get_paper_analytics_over_time` functions had stricter permission checks than the `get_papers_analytics` function, which was previously updated to allow organizers to access analytics for papers from their events.

## Changes Made

1. **Updated `get_paper_analytics` Function**:
   - Added permission check for organizers who created the event associated with the paper
   - Original function only allowed paper authors and admins to view analytics
   - Now aligns with permissions in `get_papers_analytics`, allowing organizers to view analytics for papers from events they created

2. **Updated `get_paper_analytics_over_time` Function**:
   - Added the same permission check for organizers as in `get_paper_analytics`
   - This function is used for generating time-series data for charts in the paper details page
   - Now also allows organizers to view analytics trends for papers from events they created

## Implementation Details

Both functions now include the following permission logic:
```sql
-- Check if the user has permission to view this data
-- Allow if: 1) User is the paper author, 2) User is an admin, 3) User is an organizer who created the event
IF v_user_type = 'admin' THEN
    v_has_permission := TRUE;
ELSIF v_user_type = 'organizer' THEN
    -- Check if the organizer created the event that this paper belongs to
    SELECT EXISTS (
        SELECT 1 
        FROM submissions s
        JOIN events e ON s.event_id = e.id
        WHERE s.id = p_submission_id 
        AND e.created_by = v_user_id
    ) INTO v_has_permission;
ELSE
    -- Check if the user is the author of the paper
    SELECT EXISTS (
        SELECT 1 
        FROM submissions s 
        WHERE s.id = p_submission_id 
        AND s.submitted_by = v_user_id
    ) INTO v_has_permission;
END IF;
```

## Benefits

- Organizers can now view analytics data for papers from events they created
- Maintains proper security by still limiting access to only relevant papers
- Provides consistent behavior across all paper analytics functions
- Improves user experience for organizers by giving them access to important metrics for their event papers

## Related Changes

This aligns with the previous update to `get_papers_analytics` which was already updated to allow organizers to access analytics for papers from their events. 