# Academic Events Feature Documentation

## Overview

The Academic Events feature of Eventy360 is designed to provide a complete platform for organizing and participating in academic events. It supports the entire lifecycle of academic event management, from event creation to submission review and acceptance to management (organizers) to oversight (admins).

## Event Workflow

### Event Lifecycle

Events follow a structured lifecycle that reflects the typical progression of academic events:

1. **Draft** - Initial creation state, not visible to researchers
2. **Published** - Visible to researchers, but not yet accepting submissions
3. **Abstract submission Open** - Accepting abstract submissions
4. **Abstract Review** - Abstracts under review, no new submissions accepted
5. **Full Paper submission Open** - Accepting full papers for accepted abstracts
6. **Full Paper Review** - Full papers under review, no new submissions accepted
7. **Completed** - Event is finished, all submissions processed
8. **Canceled** - Event has been canceled

### Event Deadlines Timeline

Events have a structured timeline with specific deadlines that control the submission process:

1. **Abstract Submission Deadline** - Deadline for researchers to submit abstracts
2. **Abstract Review Result Date** - Date when abstract review results are announced
3. **Full Paper Submission Deadline** - Deadline for researchers with accepted abstracts to submit full papers
4. **Revision Deadline** (optional) - Deadline for submitting revised papers if requested
5. **Submission Verdict Deadline** - Final deadline for announcing acceptance/rejection of papers
6. **Event Date** - The start date of the event
7. **Event End Date** - The end date of the event

The system enforces a logical sequence for these dates and can automatically update event status based on current date relative to these deadlines.

## Submission Workflow

### Submission Lifecycle

Submissions follow a structured review process:

1. **Abstract Phase**
   - `abstract_under_review` - Abstract initially submitted and being reviewed by organizers
   - `abstract_accepted` - Abstract has been accepted with optional notes
   - `abstract_rejected` - Abstract has been rejected with optional notes

2. **Full Paper Phase** (for accepted abstracts)
   - `full_paper_under_review` - Full paper initially submitted and being reviewed
   - `revision_requested` - Revisions requested by organizers with note
   - `revision_under_review` - Revised paper submitted and under review
   - `full_paper_accepted` - Full paper accepted for presentation/publication
   - `full_paper_rejected` - Full paper rejected with mandatory feedback

### Version Control

Submissions support version tracking for both abstracts and full papers:
- Each abstract or full paper is assigned a version number
- Previous versions are preserved for reference
- Feedback is linked to specific versions
- Version history is visible to both researchers and organizers

## Storage Structure

Files are stored in a structured format to support versioning and access control:

```
submission_files/
  {event_id}/
    {submission_id}/
      abstract/
        v1/
          {filename}
        v2/
          {filename}
        ...
      full_paper/
        v1/
          {filename}
        v2/
          {filename}
```

### Storage Policies

1. **File Types**: Only PDF, DOC, and DOCX formats are accepted
2. **File Size**: Maximum 2MB per file
3. **Access Control**: 
   - Researchers can only access their own submissions and can delete them unless event is completed
   - Organizers can access submissions for their events
   - Admins can view and delete all submissions
4. **Versioning**: Files are immutable once uploaded; new versions create new files
5. **Retention**: Files are retained for a minimum of 5 years after event completion

## User Roles and Permissions

### Researcher

Researchers can:
1. Browse published events
2. Filter events by topic, date, and location
3. Bookmark events for later reference
4. Submit abstracts to events before deadline
5. View status of their submissions
6. Submit full papers for accepted abstracts
7. Submit revised papers if requested
8. Receive email notifications about events posted with their subscribed topics
9. Receive email notifications related to the events they're participating in
10. Access their submission history across all events

### Organizer

Organizers can:
1. Create and manage events (with limits based on subscription tier)
2. Associate events with multiple topics for better discovery
3. Set all event deadlines and manage event lifecycle
4. Review submitted abstracts
5. Accept/reject abstracts with feedback
6. Review full papers
7. Request revisions or accept/reject full papers
8. Soft delete their own events
9. Generate simple statistics about their events (submission counts, acceptance rates)
10. Send announcements to event participants

### Admin

Admins can:
1. Access and manage all events and submissions
2. Override status changes in exceptional circumstances
3. Restore soft-deleted events and submissions
4. Manage deadlines and extensions
5. View platform-wide event statistics
6. Monitor and moderate event content
7. Handle reported issues from researchers or organizers

## Technical Implementation

### Event Creation and Management

Event creation follows a multi-step process:
1. **Basic Information**: Title, description, format, location (wilayas/dairas)
2. **Topics Association**: Selection of relevant academic topics
3. **Timeline Setup**: Configuration of all deadline dates
4. **Additional Details**: Venue information, organizing committee, contact details
5. **Review & Publish**: Final review before making the event visible

Event management includes:
- Status transitions based on current date and configured deadlines
- Ability to manage submissions
- Communication tools for event participants
- Statistics and reporting

### Discovery and Interaction

Events can be discovered through:
- Home page featured events
- Topic-based browsing
- Search functionality (by title, description, location)
- Filtering by date, status, and type
- Recommendations based on researcher interests

### Soft Delete System

Both events and submissions implement a soft delete system:
- Deleted items are marked with `deleted_at` timestamp
- Soft-deleted items are excluded from normal queries
- Items are permanently deleted after a 7-day grace period
- Deleted items can be restored within the grace period

### Data Validation

The system enforces various validation rules:
- Event dates must follow a logical sequence
- File types and sizes are validated
- Submission status transitions follow the defined workflow
- Access controls ensure users can only perform permitted actions

### Automated Status Updates

The system includes automated processes to:
- Update event status based on current date relative to deadlines
- Track submission version history
- Purge soft-deleted items after grace period
- Send reminder notifications for approaching deadlines

## Common Use Cases

### For Researchers

1. **Submit Abstract**:
   - Browse published events
   - Select event and submit abstract before deadline
   - Receive notification when abstract is reviewed

2. **Submit Full Paper**:
   - After abstract acceptance, upload full paper
   - Receive feedback and submit revisions if requested
   - Receive final decision notification

3. **Discover Events**:
   - Browse events by topic of interest
   - Filter events by date and location
   - Bookmark events for later reference
   - Receive notifications for new events in subscribed topics

### For Organizers

1. **Create Event**:
   - Set up event with all deadlines and details
   - Associate with relevant topics
   - Publish for abstract submissions

2. **Review Process**:
   - Review abstracts and provide feedback
   - Review full papers from accepted abstracts
   - Request revisions or make final decisions
   - Track submission statistics

3. **Event Management**:
   - Monitor event progress through lifecycle
   - Communicate with participants
   - Generate basic statistics and reports

### For Admins

1. **Manage Events**:
   - Monitor all events and submissions
   - Handle exceptional cases requiring manual intervention
   - Restore accidentally deleted content
   - Generate platform-wide statistics

## Security

- Checking the subscription/trial status before allowing access to features
- Row-level security policies ensuring proper data access
- Validation of all uploads for security concerns
- Rate limiting for submission-related actions to prevent abuse

## Internationalization

- Arabic-first interface with full RTL support
- Event details stored in JSONB structure for future multilanguage support
- Date formatting respecting Arabic conventions
- Notification templates in Arabic for MVP

## Integration with Other Features
- **Previous Features**: Uses the existing singleton Supabase instance, UI structure, and shared components
- **Notifications**: Email notifications for status changes and deadlines
- **Bookmarks**: Researchers can bookmark events for later reference
- **Topics**: Events are categorized by topics for better discoverability
- **Subscription System**: Feature access controlled by subscription tier
- **Profile System**: Events linked to organizer profiles for credibility
