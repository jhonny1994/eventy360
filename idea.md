## **Eventy360: The Academic Event & Research Discovery Platform (SaaS)**

**Executive Summary:**

Eventy360 is a modern Software as a Service (SaaS) platform designed to revolutionize how the academic and research community in Algeria discovers, manages, and shares scientific events and their associated research output. We provide a centralized, integrated, and trusted online service accessible anywhere, anytime, eliminating the frustrations of fragmented information and disparate tools. While initially focused on the Algerian academic ecosystem, we have plans for international expansion in the future.

**The Problem We Solve:**

The Algerian academic ecosystem currently suffers from inefficiencies:

*   **Scattered Information:** Researchers struggle to find relevant scientific events (conferences, workshops, etc.) across various disciplines and locations from official, reliable sources. Information is dispersed across countless university websites, obscure forums, and unreliable social media groups.
*   **Fragmented Workflows:** Attending or organizing events often involves disconnected steps – finding calls for papers on one site, submitting via email or another portal, managing reviews offline, and difficulty tracking participation and accepted research output.
*   **Lack of a Central Repository:** There's no easy way to discover research papers presented at events after they conclude, hindering knowledge dissemination and impact tracking.
*   **Trust Deficit:** Researchers lack clear indicators to distinguish official, high-quality events from less reputable ones.

**Our SaaS Solution: Eventy360**

Eventy360 is delivered entirely as a managed online service, meaning users simply access it via their web browser without any installation or maintenance. Our platform provides:

1.  **Centralized & Trusted Event Discovery:** A single, comprehensive, and easily searchable database of academic events across multiple categories (scientific, cultural, sports, competitions). Our **Organizer Verification Process** (requiring institutional affiliation proof and verified email) ensures that events published by **Verified Organizers** are clearly identifiable with a dedicated badge, building trust in the platform's content.
2.  **Integrated Researcher Workflow:** Researchers can find events by topic and criteria, and submit their papers directly through the platform via a streamlined, single-step submission process. They can easily track the status of their submissions (received, under review, accepted, rejected) in their dashboard.
3.  **Integrated Organizer Workflow:** Verified Organizers get a dedicated dashboard to publish detailed event information, manage submitted papers, download files, and update submission statuses directly within the platform. This replaces manual tracking and email chaos.
4.  **Searchable Paper Repository:** A growing database of **accepted papers' metadata** (Title, Authors, Keywords, Event, etc.) from completed events, with support for both abstracts and full papers. Researchers can search this repository to discover research output linked to events in their preferred language (Arabic, French, or English).
5.  **Comprehensive Event Information:** Events include detailed information on problem statements, submission guidelines, event axes, objectives, target audience, scientific committees, speakers, deadlines, and more.
6.  **Targeted Notifications:** Researchers receive email notifications about submission status changes, payment verifications, account verifications, and new events that match their specific topics of interest.
7.  **Managed Infrastructure:** We handle all the technical complexities of hosting, maintenance, security, and updates on a scalable cloud infrastructure (Supabase backend), allowing users to focus on their core academic work.
8.  **Multilingual Support:** Full support for Arabic, French, and English from launch, with proper localization for date formats, currency, and Algeria-specific requirements.

**Target Audience:**

*   **Researchers:** Students, Masters/PhD Candidates, Post-docs, University Lecturers, Professors, Scientists, and Independent Researchers across all academic disciplines in Algeria.
*   **Organizing Institutions:** Algerian Universities, University Centers, National Schools, Research Centers, Research Labs, Activities Services, and Research Teams.
*   **Administrators:** The Eventy360 team members who manage the platform, verify organizers and researchers, process payments, and oversee operations.

**Business Model: Tiered Subscription**

Eventy360 operates on a tiered subscription model with a clear distinction between free and paid features:

*   **Free Researcher Tier:** 
    - Basic event discovery (search, browse, filter)
    - View event details (dates, location, description, deadlines)
    - Bookmark events through saved_events
    - Create basic profile
    - 14-day trial access to all features

*   **Paid Researcher Tier:** 
    - Everything in the free tier
    - Paper submission capabilities to any event
    - Full repository access with download tracking
    - Submission tracking and management
    - Personalized event recommendations based on interests
    - Verification badge (after credential verification)
    - Multiple file uploads for submissions (abstracts and full papers)
    - Advanced search and filtering
    - Multilingual submission support

*   **Paid Organizer Tier:** 
    - Create and manage up to 5 active events
    - Comprehensive event customization (problem statements, guidelines, committees, etc.)
    - Submission management tools with status updates
    - Verified organizer badge
    - Review workflow management
    - Event analytics and metrics
    - Communication features through email notifications
    - Support for physical, virtual, and hybrid events
    - Custom branding options (logos, banners)

**Payment Processing:**
Initially, payments for subscriptions will be processed through traditional methods (bank transfers, checks, cash) due to the current state of digital payments in Algeria. Future plans include integration with Algerian payment gateways like Chargily for seamless digital payments when the ecosystem matures.

**Technology & Scalability:**

Built on a modern, high-performance, and scalable tech stack including:
- Next.js (App Router) with TypeScript
- Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime, Scheduled Functions)
- Row Level Security (RLS) for data protection
- Tailwind CSS with Shadcn UI components
- React Hook Form with Zod validation
- next-intl for internationalization
- Vercel for hosting and deployment

This foundation ensures the platform can handle a growing user base, increasing event and paper data volume, and future feature expansion while maintaining speed and reliability.

**Security & Implementation Approach:**

Eventy360 implements robust security measures and modern frontend patterns:

* **Security Framework:**
  - Comprehensive Supabase Row Level Security (RLS) policies enforce precise data access for different subscription tiers
  - JWT-based authentication with role claims for efficient permission verification
  - Server Components and Edge Functions handle critical operations to prevent client-side manipulation
  - Comprehensive data validation using Zod on both client and server
  - Encrypted storage for sensitive payment information
  - Soft delete functionality for data retention policies

* **Role Separation:**
  - Next.js middleware protects routes based on authentication and subscription status
  - Route groups organize application sections by user role (public, researcher, organizer, admin)
  - Server-side authorization checks prevent content from displaying before permissions are verified
  - Conditional UI rendering based on user role and subscription tier

* **Data Management:**
  - PostgreSQL ENUMs for strictly controlled data types
  - Database triggers for automated workflows (verification approvals, payment processing)
  - Full-text search indexes for multilingual content searching
  - Custom views for common data access patterns
  - Real-time updates through Supabase Realtime
  - Comprehensive audit logging

* **Internationalization Implementation:**
  - RTL layout support for Arabic interface using next-intl
  - Locale-specific formatting for dates, numbers, and currency
  - Language detection and persistence mechanism
  - Translation files organized by feature for maintainability

**Verification System:**

Eventy360 implements a multi-stage verification process:
1. Users submit verification requests with institutional email and proof documents
2. Administrators review the requests and can approve or reject with reasoning
3. Approved users receive a verification badge that enhances trust in their submissions or events
4. The system supports both researcher and organizer verification types

**Notification System:**

The platform includes a comprehensive email notification system:
1. Email templates for different notification types (welcome, verification, payment, submission, event)
2. Email queue for reliable delivery with retry mechanisms
3. Email logs for tracking and debugging
4. Automated notifications for key status changes (submission review, payment verification, etc.)

**Benefits of Eventy360 as a SaaS:**

*   **For Researchers:** Easy discovery from a single, increasingly trusted source; simplified submission process; tracking of their papers; access to research output; free access to core discovery features.
*   **For Organizers (Paid Subscribers):** Dedicated channel to reach a targeted academic audience; enhanced credibility via Verified status; integrated tools for managing submissions and registrants; managed infrastructure means less IT burden; predictable operational cost.
*   **For the Academic Ecosystem:** Reduced fragmentation; improved dissemination of event information and research; increased efficiency in event management.
*   **For Eventy360 (Provider):** Recurring revenue stream; simplified deployment and updates; direct relationship with user base for feedback; potential for data-driven insights (anonymized) to improve the service.

**Future Vision:**

Eventy360 is positioned for growth within this SaaS framework. Future plans include:
* Expanding repository capabilities (e.g., full-text search)
* Adding more advanced organizer tools (e.g., analytics, communication features)
* Developing mobile applications with Flutter
* Integrating digital payment gateways
* Integrating virtual event hosting capabilities
* Expanding geographically beyond Algeria to serve the broader academic community

**Future Features & Enhancements:**

The following features are planned for future development phases:

1. **User Onboarding Enhancement**
   * Role-specific onboarding videos (60-90 seconds) guiding users through key workflows
   * Integrated video tutorials with timestamped chapters for different platform features
   * Personalized onboarding paths based on user role and interests
   * Interactive tutorial overlay for first-time users
   * Onboarding progress tracking with gamification elements

2. **Collaborative Features for Research**
   * Co-author collaboration system with role-based permissions
   * Real-time editing status indicators when multiple authors edit a submission
   * Change history tracking for paper revisions
   * Section-specific commenting for submissions
   * Collaboration activity notifications
   * Invitation workflow for adding co-authors

3. **SEO & Discovery Optimization**
   * Structured data markup for academic events using Schema.org
   * Dynamic sitemap generation for improved indexing
   * Discipline-specific landing pages for academic fields
   * Multilingual SEO with proper hreflang tags
   * Canonical URL implementation to prevent duplicate content

4. **Research Metadata Indexing**
   * Structured metadata schema aligned with academic standards (Dublin Core)
   * Multilingual search vectors for content in all supported languages
   * Automated keyword extraction for improved searchability
   * Citation metadata formats generation (BibTeX, RIS, EndNote)
   * JSON-LD structured data for scholarly articles

5. **Academic Search Engine Integration**
   * OAI-PMH protocol endpoint for metadata harvesting
   * Google Scholar compatible metadata tags
   * DOI registration support through Crossref or DataCite
   * ORCID integration for researcher identification
   * Academic-focused search engine optimization

6. **Data Security & Recovery**
   * Point-in-time recovery utilizing Supabase PITR
   * Scheduled database exports to secure storage
   * Multi-region data replication for critical information
   * Application-level validation for critical data changes
   * Comprehensive incident response protocols

7. **Virtual Event Support**
   * Integrated virtual event spaces for registered events
   * Virtual attendance tracking and certification
   * Interactive virtual poster sessions
   * Research interest-based networking rooms
   * Hybrid Q&A session management with moderation

8. **Virtual Conferencing Integration**
   * API integrations with major platforms (Zoom, MS Teams, Google Meet)
   * Single sign-on between Eventy360 and video platforms
   * Recording management for post-event access
   * Session subdivision for parallel tracks
   * Attendance synchronization between platforms

9. **Researcher Data Export Tools**
   * Comprehensive data export in multiple formats (JSON, CSV, PDF, BibTeX)
   * Batch export for multiple papers
   * Researcher portfolio generation with publication history
   * Custom citation format templates
   * Scheduled exports to personal storage

10. **Calendar Integration**
    * Calendar file generation (iCal, Google Calendar)
    * One-click "Add to Calendar" functionality
    * Submission deadline reminders
    * Personalized calendar feeds based on interests
    * Calendar sharing for research teams

11. **User Feedback System**
    * Integrated contextual feedback collection
    * Feature request voting system with tier badges
    * Admin dashboard for feedback management
    * Automated notification for feedback status changes
    * Periodic user satisfaction surveys with NPS scoring