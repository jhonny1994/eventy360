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
*   **User Management**: 3 roles (researcher, organizer, admin), profiles, manual admin verification (email comms -> platform update), **Arabic UI only for MVP**. Full RTL support.
*   **Subscription System**: Tiered (free/paid/trial for researcher/organizer), 1-month trial, manual offline payment processing (bank/check/cash) & admin verification -> platform update, verification badge.
*   **Event Management**: Detailed event creation (multi-type/format), topic association, lifecycle (published -> active -> completed). **No editing after publish in MVP.**
*   **Submission System**: Abstract/full paper workflow (PDF/DOC/DOCX, 5MB limit), status tracking, email notifications (incl. mandatory rejection feedback). **No editing after submission.**
*   **Research Repository**: Centralized storage of accepted papers, MVP search (title, abstract), MVP filter (topic, event_id).
*   **Search/Discovery**: Arabic full-text search, advanced filters, topic recommendations, bookmarking.
*   **Verification System**: Manual admin check (email -> platform status update), verified badges.
*   **Notification System**: Email-based (**Arabic templates only for MVP**, stored in DB `email_templates` using JSONB fields populated with the `ar` key for future i18n), triggered by key actions (registration, verification, payment, submission status, deadlines) via DB triggers -> `notification_queue` -> processed by scheduled Edge Function (`process-notification-queue`) using core `send-email` logic (Resend API); scheduled checks for deadlines/expiry (`check-deadlines`, `check-subscriptions-expiry`); logging (`email_log`); Admin visibility.
*   **Admin Panel**: MVP features include dashboard, user management (view, verify, suspend), payment/subscription management (manual recording/activation), event/submission oversight (view, admin edits, delete), topic CRUD, email template editing (Arabic only via `ar` key in JSONB), email log viewing.
*   **Database i18n Structure**: Implement dynamic user-facing translatable fields (e.g., event names, bios, topic names) using JSONB columns from the start (e.g., `name_translations`), but **populate and query only the 'ar' key for MVP**. Static location data (`wilayas`, `dairas`) uses simple `name_ar` and `name_other` text fields.

## 5. Non-Goals (for MVP)
*   **Multi-language Support (UI & Content)**: English and French support is planned for a future phase. MVP is Arabic only.
*   Automated online payment processing (Future: Chargily Pay).
*   Automated user verification.
*   Real-time features beyond basic notifications.
*   Advanced analytics beyond simple admin dashboard metrics.
*   Event editing by organizers after publishing.
*   Submission editing after submitting. 