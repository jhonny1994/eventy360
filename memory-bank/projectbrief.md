# Project Brief: Eventy360

## 1. Project Goal
To create a centralized SaaS platform for academic event management and research discovery specifically tailored for the Algerian academic community, addressing issues of information fragmentation, trust, and inefficient workflows.

## 2. Core Problems Addressed
Based on the Algerian academic context:
1.  **Information Fragmentation**: Event announcements are scattered across university sites, social media, etc., making discovery difficult.
2.  **Limited Trust**: Difficulty distinguishing reputable, high-quality academic events.
3.  **Manual Submissions**: Reliance on email/manual tracking for paper submissions is inefficient for organizers and researchers.
4.  **Research Access Barriers**: Post-event research papers are hard to find and access.
5.  **Organizer Workflow Inefficiency**: Lack of integrated tools forces organizers to use disconnected systems.

## 3. Target Audience
*   **Researchers (Algeria)**: Students (all levels), professors, scientists needing to find events, submit papers, and access research.
*   **Organizing Institutions (Algeria)**: Universities, research centers, national schools, labs, activity services, research teams hosting events.
*   **Administrators**: Platform managers handling quality control, manual user/payment verification (MVP), and system maintenance.

## 4. MVP Scope & Key Features
*   **User Management**: 3 roles (researcher, organizer, admin), profiles, manual admin verification (email comms -> platform update).
    *   **Internationalization (Core Requirement)**: **Strictly Arabic-only UI for MVP**. Full Right-to-Left (RTL) support is mandatory. All UI elements, text, and layouts must conform to Arabic standards.
*   **Subscription System**: Tiered (free/paid/trial for researcher/organizer), 1-month trial, manual offline payment processing (bank/check/cash) & admin verification -> platform update, verification badge.
*   **Event Management**: Detailed event creation (multi-type/format), topic association, lifecycle (published -> active -> completed). **No editing after publish in MVP.**
*   **Submission System**: Abstract/full paper workflow (PDF/DOC/DOCX, 5MB limit), status tracking, email notifications (incl. mandatory rejection feedback). **No editing after submission.**
*   **Research Repository**: Centralized storage of accepted papers, MVP search (title, abstract), MVP filter (topic, event_id).
*   **Search/Discovery**: Arabic full-text search, advanced filters, topic recommendations, bookmarking.
*   **Verification System**: Manual admin check awards a visual **Verification Badge** to user profiles; this badge does **not** gate any platform features but serves as a trust indicator.
*   **Notification System**: Email-based, driven by DB triggers -> `notification_queue` -> processed by scheduled Edge Function (`process-notification-queue`) using core `send-email` logic (Resend API); scheduled checks for deadlines/expiry (`check-deadlines`, `check-subscriptions-expiry`); logging (`email_log`); Admin visibility.
    *   **Internationalization (Core Requirement)**: **Strictly Arabic-only templates for MVP**. Templates stored in DB `email_templates` using JSONB fields **must** be populated with the `ar` key. The `send-email` logic must fetch and use only this `ar` text.
*   **Admin Panel**: MVP features include dashboard, user management (view, verify, suspend), payment/subscription management (manual recording/activation), event/submission oversight (view, admin edits, delete), topic CRUD, email template editing (strictly Arabic only via `ar` key in JSONB), email log viewing.
*   **Database i18n Structure (Core Requirement)**:
    *   Implement dynamic user-facing translatable fields (e.g., event names, bios, topic names) using JSONB columns from the start (e.g., `name_translations`). **Crucially, populate and query ONLY the 'ar' key for MVP**. This structure prepares for future languages but enforces Arabic-only functionality initially.
    *   Static location data (`wilayas`, `dairas`) uses simple `name_ar` and `name_other` text fields, with `name_ar` being primary for MVP.

## 4.1. MVP Development Phases

The MVP will be developed in a phased approach to ensure incremental delivery and focused effort:

1.  **Phase 1: Subscription Backbone & Core Admin for Manual MVP Operations**: Establishes user lifecycle (trial subscriptions), manual payment/verification processes by admins, and core admin tools necessary for these operations. Implements foundational notification templates.
2.  **Phase 2: Event Management & Topic Control**: Enables subscribed Organizers to create/publish events, Admins to manage topics, and all users to discover/view/bookmark events. Includes event-related notifications.
3.  **Phase 3: Submission System**: Allows subscribed Researchers to submit papers/abstracts to events and Organizers to manage these submissions for their events. Includes submission-related notifications.
4.  **Phase 4: Comprehensive Notification System & Email Management**: Fully establishes the robust email sending framework, populates all required Arabic email templates, ensures all triggering logic is in place, and provides Admin tools for template/log management.
5.  **Phase 5: Value-Added MVP Features & Admin Panel Consolidation**: Implements the Research Repository, enhances search/discovery functionalities, and consolidates Admin Panel features with a central dashboard and platform statistics.
6.  **Phase 6: Testing, Deployment Preparation & Launch**: Focuses on comprehensive testing (unit, integration, E2E, UAT), performance/security reviews, deployment to production, and post-launch monitoring.

## 5. Non-Goals (for MVP)
*   **Multi-language Support (UI & Content)**: English and French support is planned for a future phase. **MVP is strictly Arabic only in every aspect (UI, data handling, notifications).**
*   Automated online payment processing (Future: Chargily Pay).
*   Automated user verification.
*   Real-time features beyond basic notifications.
*   Advanced analytics beyond simple admin dashboard metrics.
*   Event editing by organizers after publishing.
*   Submission editing after submitting. 