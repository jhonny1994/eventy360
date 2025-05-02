# Eventy360 Feature Specification (MVP)

## User Types

institution type ('university', 'university_center', 'national_school', 'research_center', 'research_laboratory', 'activities_service', 'research_team')
event type ('scientific_event', 'cultural_event', 'sports_event', 'competition')
event format ('physical', 'virtual', 'hybrid')


### Base User
- **Email** (required): User's email address
- **Password** (required): User's password
- **Preferred Language** (required): ar, fr, or en
- **User Type** (required): Researcher, Organizer, or Admin
- **Created At** (auto): Timestamp of account creation
- **Updated At** (auto): Timestamp of last account update

### Researcher Profile
- **Display Name** (required): Full name displayed publicly
- **Institution** (required): Educational or research institution
- **Academic Position** (required): Professor, Student, Researcher, etc.
- **Bio** (optional): Short biography in preferred language
- **Research Interests** (optional): Array of topic IDs
- **Is Verified** (auto): Whether researcher credentials are verified (False by default)
- **Subscription Type** (auto): Free or Paid, determines access to premium features

### Organizer Profile
- **Institution Name** (required): Name of organizing institution
- **Institution Type** (required): University, Research Center, etc.
- **Logo URL** (optional): Institution logo
- **Contact Email** (required): Public contact email
- **Contact Phone** (optional): Public contact phone
- **Bio** (optional): Institution description in preferred language
- **Is Verified** (auto): Whether organizer credentials are verified (False by default)
- **Subscription Type** (auto): Always Paid, all organizer accounts require subscription

### Admin Profile
- **Display Name** (required): Full name of the administrator
- **Role** (required): Permission level (Super Admin, Verification Admin, Payment Admin)
- **Created By** (auto): Super admin who created this admin account
- **Last Login** (auto): Timestamp of last login

## Subscription System

### Subscription Tiers
- **Free Researcher** (default): Basic access for researchers with limited features
- **Paid Researcher** (premium): Complete access to all researcher features including repository
- **Paid Organizer** (required): Access to event creation and management features

### Subscription
- **User ID** (required): Link to user
- **Tier** (required): Free Researcher, Paid Researcher, or Paid Organizer
- **Status** (required): Active, Inactive, Pending, or Trial
- **Trial End Date** (auto): When 14-day trial period ends (all new accounts)
- **Start Date** (required): When paid subscription begins
- **End Date** (required): When paid subscription expires
- **Created At** (auto): Timestamp of subscription creation
- **Updated At** (auto): Timestamp of last subscription update

### Payment
- **Subscription ID** (required): Link to subscription
- **Reference Code** (required): Unique payment reference
- **Amount** (required): Payment amount
- **Currency** (required): Payment currency (default: DZD)
- **Status** (required): Pending, Verified, or Rejected
- **Payment Method** (required): Bank Transfer, Check, etc.
- **Payment Proof URL** (required): Uploaded receipt/proof
- **Verified By** (auto): Admin who verified payment
- **Verified At** (auto): When payment was verified
- **Created At** (auto): Timestamp of payment submission
- **Updated At** (auto): Timestamp of last payment update

### Feature Access By Tier

#### Free Researcher
- Browse and search events
- Create and manage basic profile
- View basic event information

#### Paid Researcher
- All Free Researcher features
- paper submissions to events
- Access to research paper repository
- Download papers from repository
- Premium profile features

#### Paid Organizer
- Create and manage events (up to 5 active events)
- Receive and review submissions
- Access to organizer analytics dashboard
- Custom branding for events
- Access to research paper repository
- Export event and submission data

#### Admin
- All system features
- User management
- Verification processing
- Payment verification
- Platform analytics and reports
- System configuration

## Events

### Event Status Flow
- **Published** → **Active** → **Completed**
- Events can be **Canceled** from any status

### Event (Core)
- **Created By** (required): User who created event
- **Status** (required): Published, Active, Completed, or Canceled
- **Who Organizes** (required): Textarea of who organizes the event and sponsors etc.
- **Event Name** (required): Event title
- **Event Subtitle** (optional): Event subtitle or theme/slogan
- **Event Problem Statement** (required): Textarea of event purpose/context
- **Event Topics** (required): Array of event topics/keywords
- **Event Submission Guidelines** (required): Textarea of paper formatting requirements
- **Event Axes** (required): Textarea of event axes
- **Event Objectives** (required): Textarea of event objectives
- **Event Target Audience** (required): Textarea of event target audience
- **Scientific and Organizing Committees** (required): Textarea of scientific and organizing committee members
- **Speakers keynotes** (optional): Textarea of speakers keynotes
- **Event Type** (required): Scientific Event, Cultural Event, etc.
- **Event Date** (required): Event start date
- **Event End Date** (required): Event end date
- **Submission Deadline** (required): Paper submission deadline
- **Submission Verdict Deadline** (required): Submission verdict deadline (rejected with reason and option to resubmit)
- **Full paper submission deadline** (required): Full paper submission deadline (after submission verdict)
- **Location** (required): Text for location (if physical) or URL (if hybrid)
- **Format** (required): Physical, Virtual, or Hybrid
- **Logo URL** (optional): Event logo
- **Email** (required): Event contact email
- **Phone** (required): Event contact phone
- **Website** (optional): Event website
- **Price** (required): Price of the event if paid, 0 is free
- **QR Code** (optional): QR Code for the event
- **Banner URL** (optional): Event banner image
- **Created At** (auto): Timestamp of event creation
- **Updated At** (auto): Timestamp of last event update

## Submissions

### Submission Status Flow
- **Received** → **Under Review** → **Accepted** or **Rejected**
- All status changes trigger email notifications to the author

### Submission (Core)
- **Event ID** (required): Link to the event being submitted to
- **Submitted By** (required): User who created the submission
- **Status** (required): Received, Under Review, Accepted, Rejected
- **Language** (required): Primary language of the submission
- **Title** (required): Paper title
- **Abstract** (required): Summary of the paper's content
- **Keywords** (required): Array of topic IDs
- **Organizer Feedback** (optional): Feedback provided to author on review decision
- **Submission Date** (auto): When the submission was created
- **Review Date** (auto): When the submission was reviewed
- **Last Updated** (auto): When the submission was last modified

### Submission Files
- **Submission ID** (required): Link to submission
- **File Path** (required): Storage location
- **File Name** (required): Original file name
- **File Format** (auto): PDF, DOCX, etc.
- **Upload Date** (auto): When file was uploaded
- **File Type** (required): Abstract or Full Paper

## Topics

### Topic (Core)
- **Topic ID** (required): Unique identifier for the topic
- **Topic Slug** (auto): URL-friendly version of name
- **Topic Name** (required): Multilingual topic name (ar, fr, en)
- **Parent Topic ID** (optional): Link to parent topic if this is a subtopic
- **Created At** (auto): When topic was added
- **Updated At** (auto): When topic was last modified

## Notifications System

### Email Notification System
- **Note**: Only email notifications are implemented, not in-platform notifications
- **Supabase Integration** (required): Connection to Supabase email delivery service
- **Sender Email** (required): Official platform email address for sending notifications
- **Sender Name** (required): Display name for email notifications (e.g., "Eventy360")
- **Email Queue** (required): Database table for pending emails
- **Email Logs** (required): Database table for tracking all sent emails

### Email Templates
- **Template ID** (required): Unique identifier for the template
- **Template Type** (required): Welcome, Verification, Notification, etc.
- **Subject** (required): Multilingual email subject template
- **Body** (required): Multilingual HTML email body with variable placeholders
- **Variables** (required): Supported dynamic content placeholders
- **Created At** (auto): When template was created
- **Updated At** (auto): When template was last modified

### Email Notification Events
- **Event Publication**: When new events matching user interests are published
- **Submission Status Change**: When submission status changes
- **Payment Status**: When payment is verified or rejected
- **Account Verification**: When account verification status changes
- **Trial Expiry**: Reminder when trial is about to expire

## Repository System

### Repository Core
- **Access Control** (required): Permissions system (limited to paid subscribers)
- **Search Functionality** (required): Basic search for papers by title, author, keywords
- **Multilingual Support** (required): Interface in ar, fr, en
- **Download Tracking** (auto): Count of paper downloads

### Paper Metadata
- **Title** (required): Paper title in original language
- **Authors** (required): List of all paper authors and their affiliations
- **Abstract** (required): Summary of paper content
- **Keywords** (required): Array of topic IDs
- **Language** (required): Primary language of the paper
- **Publication Year** (auto): Year paper was published
- **File Format** (auto): Format of stored paper (PDF, DOCX, etc.)
- **Download Count** (auto): Number of times paper was downloaded

## Verification System

### Verification Status Flow
- **Submitted** → **Under Review** → **Approved** or **Rejected**
- User can resubmit if rejected

### Verification Request
- **User ID** (required): Link to user requesting verification
- **Verification Type** (required): Researcher or Organizer
- **Status** (required): Submitted, Under Review, Approved, or Rejected
- **Institutional Email** (required): Official email from institution
- **Proof Document URL** (required): Upload of verification document
- **Submission Date** (auto): When request was submitted
- **Processed Date** (auto): When request was approved/rejected
- **Processed By** (auto): Admin who reviewed the request
- **Rejection Reason** (conditional): Required if status is Rejected

## Event Search & Discovery System

### Search Functionality
- **Full-Text Search** (required): Search across event titles, descriptions, topics
- **Multilingual Search** (required): Support for searching in ar, fr, and en
- **Topic Filters** (required): Filter events by research topics
- **Date Filters** (required): Filter by upcoming, ongoing, past events
- **Location Filters** (optional): Filter by location
- **Event Type Filters** (required): Filter by scientific, cultural, etc.
- **Submission Status** (required): Filter by events open for submissions
- **Date Sorting** (required): Newest first, upcoming first, etc.
- **Deadline Sorting** (required): Sort by approaching submission deadlines
- **Alphabetical Sorting** (optional): A-Z by event title

## User Dashboard

### Researcher Dashboard
- **Upcoming Deadlines** (required): Events with approaching submission deadlines
- **My Submissions** (required): Status of submitted papers
- **Saved Events** (required): Bookmarked events
- **Subscription Status** (required): Current tier and trial/expiration information
- **Verification Status** (required): Current verification status

### Organizer Dashboard
- **Event Statistics** (required): Views and submission metrics
- **Active Events** (required): Currently active events
- **Submission Management** (required): Overview of received submissions
- **Review Tasks** (required): Pending reviews
- **Subscription Status** (required): Current tier and expiration information
- **Quick Create** (required): Shortcut to create new events

### Admin Dashboard
- **Platform Metrics** (required): User counts, event counts
- **Verification Queue** (required): Pending verification requests
- **Payment Verification** (required): Pending payment verifications
- **User Management** (required): User management tools

## Submission Review Workflow

### Review Process
- **Submission Queue** (required): List of papers awaiting review
- **Decision Interface** (required): Simple UI for Accept/Reject decisions
- **Feedback Form** (required): Text area for providing feedback to authors

### Author Communication
- **Submission Confirmation** (required): Automatic email receipt when paper is submitted
- **Status Updates** (required): Email notifications when status changes
- **Decision Notification** (required): Email communication of accept/reject decisions

## Workflow States Definition

### User Account States
- **Registered** → **Active** → **Inactive**

### Verification States
- **Not Verified** → **Verification Submitted** → **Under Review** → **Approved**/**Rejected**

### Subscription States
- **Trial** → **Pending Payment** → **Active**/**Rejected**
- **Active** → **Expired** (if not renewed)

### Event States
- **Published** → **Active** → **Completed**
- **Canceled** (possible from any state)

### Submission States
- **Received** → **Under Review** → **Accepted**/**Rejected**

### Payment States
- **Initiated** → **Submitted** → **Verified**/**Rejected**